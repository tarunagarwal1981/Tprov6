-- Create package analytics tables
-- This migration sets up tables to track package views, bookings, and revenue

-- Package views table to track when packages are viewed
CREATE TABLE IF NOT EXISTS package_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package bookings table to track bookings
CREATE TABLE IF NOT EXISTS package_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    booking_reference TEXT UNIQUE NOT NULL,
    booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    booking_date DATE NOT NULL,
    number_of_people INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    special_requests TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_method TEXT,
    payment_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package ratings table to track customer ratings
CREATE TABLE IF NOT EXISTS package_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES package_bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(package_id, customer_id, booking_id)
);

-- Package analytics summary table for quick access to aggregated data
CREATE TABLE IF NOT EXISTS package_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    total_views INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    last_booking_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(package_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_package_views_package_id ON package_views(package_id);
CREATE INDEX IF NOT EXISTS idx_package_views_viewed_at ON package_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_package_views_user_id ON package_views(user_id);

CREATE INDEX IF NOT EXISTS idx_package_bookings_package_id ON package_bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_package_bookings_customer_id ON package_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_package_bookings_booking_date ON package_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_package_bookings_status ON package_bookings(booking_status);

CREATE INDEX IF NOT EXISTS idx_package_ratings_package_id ON package_ratings(package_id);
CREATE INDEX IF NOT EXISTS idx_package_ratings_customer_id ON package_ratings(customer_id);
CREATE INDEX IF NOT EXISTS idx_package_ratings_rating ON package_ratings(rating);

CREATE INDEX IF NOT EXISTS idx_package_analytics_package_id ON package_analytics(package_id);

-- Create function to update package analytics summary
CREATE OR REPLACE FUNCTION update_package_analytics(pkg_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO package_analytics (
        package_id,
        total_views,
        total_bookings,
        total_revenue,
        average_rating,
        total_ratings,
        last_viewed_at,
        last_booking_at,
        last_updated_at
    )
    SELECT 
        pkg_id,
        COALESCE(v.views_count, 0),
        COALESCE(b.bookings_count, 0),
        COALESCE(b.total_revenue, 0),
        COALESCE(r.avg_rating, 0),
        COALESCE(r.ratings_count, 0),
        v.last_viewed_at,
        b.last_booking_at,
        NOW()
    FROM (SELECT 1) dummy
    LEFT JOIN (
        SELECT 
            COUNT(*) as views_count,
            MAX(viewed_at) as last_viewed_at
        FROM package_views 
        WHERE package_id = pkg_id
    ) v ON true
    LEFT JOIN (
        SELECT 
            COUNT(*) as bookings_count,
            SUM(total_amount) as total_revenue,
            MAX(created_at) as last_booking_at
        FROM package_bookings 
        WHERE package_id = pkg_id AND booking_status IN ('confirmed', 'completed')
    ) b ON true
    LEFT JOIN (
        SELECT 
            COUNT(*) as ratings_count,
            AVG(rating) as avg_rating
        FROM package_ratings 
        WHERE package_id = pkg_id
    ) r ON true
    ON CONFLICT (package_id) 
    DO UPDATE SET
        total_views = EXCLUDED.total_views,
        total_bookings = EXCLUDED.total_bookings,
        total_revenue = EXCLUDED.total_revenue,
        average_rating = EXCLUDED.average_rating,
        total_ratings = EXCLUDED.total_ratings,
        last_viewed_at = EXCLUDED.last_viewed_at,
        last_booking_at = EXCLUDED.last_booking_at,
        last_updated_at = EXCLUDED.last_updated_at;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update analytics when views are added
CREATE OR REPLACE FUNCTION trigger_update_package_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_package_analytics(NEW.package_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_on_view
    AFTER INSERT ON package_views
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_package_analytics();

CREATE TRIGGER update_analytics_on_booking
    AFTER INSERT OR UPDATE ON package_bookings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_package_analytics();

CREATE TRIGGER update_analytics_on_rating
    AFTER INSERT OR UPDATE ON package_ratings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_package_analytics();

-- Create function to track package view
CREATE OR REPLACE FUNCTION track_package_view(
    pkg_id UUID,
    user_id_param UUID DEFAULT NULL,
    ip_address_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL,
    session_id_param TEXT DEFAULT NULL,
    referrer_param TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO package_views (
        package_id,
        user_id,
        ip_address,
        user_agent,
        session_id,
        referrer
    ) VALUES (
        pkg_id,
        user_id_param,
        ip_address_param,
        user_agent_param,
        session_id_param,
        referrer_param
    );
END;
$$ LANGUAGE plpgsql;

-- Initialize analytics for existing packages
INSERT INTO package_analytics (package_id, total_views, total_bookings, total_revenue, average_rating, total_ratings)
SELECT 
    id,
    0,
    0,
    0,
    0,
    0
FROM packages
WHERE id NOT IN (SELECT package_id FROM package_analytics);

-- Add RLS policies
ALTER TABLE package_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for package views - allow tour operators to see views for their packages
CREATE POLICY "Tour operators can view their package analytics" ON package_analytics
    FOR SELECT USING (
        package_id IN (
            SELECT p.id FROM packages p
            JOIN tour_operators t ON p.tour_operator_id = t.id
            WHERE t.user_id = auth.uid()
        )
    );

-- Policy for package views - allow anyone to track views
CREATE POLICY "Anyone can track package views" ON package_views
    FOR INSERT WITH CHECK (true);

-- Policy for package bookings - allow tour operators to see bookings for their packages
CREATE POLICY "Tour operators can view their package bookings" ON package_bookings
    FOR SELECT USING (
        package_id IN (
            SELECT p.id FROM packages p
            JOIN tour_operators t ON p.tour_operator_id = t.id
            WHERE t.user_id = auth.uid()
        )
    );

-- Policy for package ratings - allow tour operators to see ratings for their packages
CREATE POLICY "Tour operators can view their package ratings" ON package_ratings
    FOR SELECT USING (
        package_id IN (
            SELECT p.id FROM packages p
            JOIN tour_operators t ON p.tour_operator_id = t.id
            WHERE t.user_id = auth.uid()
        )
    );

-- Policy for package analytics - allow tour operators to see analytics for their packages
CREATE POLICY "Tour operators can view their package analytics" ON package_analytics
    FOR SELECT USING (
        package_id IN (
            SELECT p.id FROM packages p
            JOIN tour_operators t ON p.tour_operator_id = t.id
            WHERE t.user_id = auth.uid()
        )
    );
