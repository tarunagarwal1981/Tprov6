-- =============================================
-- Enhanced Itinerary Creation System
-- Phase 1: Database Schema Updates
-- =============================================

-- Enhanced itinerary creation sessions
CREATE TABLE IF NOT EXISTS public.itinerary_creation_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PACKAGE_SELECTION' CHECK (status IN ('PACKAGE_SELECTION', 'DAY_PLANNING', 'DETAILS', 'REVIEW')),
  selected_packages JSONB DEFAULT '[]',
  day_assignments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package recommendations based on lead preferences
CREATE TABLE IF NOT EXISTS public.package_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  recommendation_score DECIMAL(3,2) DEFAULT 0.0,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, package_id)
);

-- Enhanced itinerary activities with better day management
CREATE TABLE IF NOT EXISTS public.itinerary_day_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  itinerary_day_id UUID REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  activity_name TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('PACKAGE', 'CUSTOM', 'TRANSFER', 'MEAL', 'ACCOMMODATION')),
  time_slot TEXT NOT NULL,
  duration_hours DECIMAL(4,2) DEFAULT 1.0,
  cost DECIMAL(10,2) DEFAULT 0.00,
  location TEXT,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add fields to existing itineraries table
ALTER TABLE public.itineraries 
ADD COLUMN IF NOT EXISTS creation_session_id UUID REFERENCES public.itinerary_creation_sessions(id),
ADD COLUMN IF NOT EXISTS budget_warning BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS package_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_duration_hours DECIMAL(6,2) DEFAULT 0.0;

-- Add fields to existing packages table for better filtering
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS recommended_for_trip_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS average_booking_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS seasonal_availability JSONB DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_itinerary_creation_sessions_lead_id ON public.itinerary_creation_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_creation_sessions_agent_id ON public.itinerary_creation_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_creation_sessions_status ON public.itinerary_creation_sessions(status);

CREATE INDEX IF NOT EXISTS idx_package_recommendations_lead_id ON public.package_recommendations(lead_id);
CREATE INDEX IF NOT EXISTS idx_package_recommendations_package_id ON public.package_recommendations(package_id);
CREATE INDEX IF NOT EXISTS idx_package_recommendations_score ON public.package_recommendations(recommendation_score DESC);

CREATE INDEX IF NOT EXISTS idx_itinerary_day_activities_day_id ON public.itinerary_day_activities(itinerary_day_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_day_activities_package_id ON public.itinerary_day_activities(package_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_day_activities_type ON public.itinerary_day_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_itinerary_day_activities_order ON public.itinerary_day_activities(order_index);

-- Create updated_at trigger for itinerary_creation_sessions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_itinerary_creation_sessions_updated_at 
    BEFORE UPDATE ON public.itinerary_creation_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.itinerary_creation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_day_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for itinerary_creation_sessions
CREATE POLICY "Agents can view their own creation sessions" ON public.itinerary_creation_sessions
    FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Agents can create their own creation sessions" ON public.itinerary_creation_sessions
    FOR INSERT WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can update their own creation sessions" ON public.itinerary_creation_sessions
    FOR UPDATE USING (agent_id = auth.uid());

CREATE POLICY "Agents can delete their own creation sessions" ON public.itinerary_creation_sessions
    FOR DELETE USING (agent_id = auth.uid());

-- RLS Policies for package_recommendations
CREATE POLICY "Agents can view recommendations for their leads" ON public.package_recommendations
    FOR SELECT USING (
        lead_id IN (
            SELECT id FROM public.leads WHERE agent_id = auth.uid()
        )
    );

CREATE POLICY "System can create package recommendations" ON public.package_recommendations
    FOR INSERT WITH CHECK (true);

-- RLS Policies for itinerary_day_activities
CREATE POLICY "Agents can view activities for their itineraries" ON public.itinerary_day_activities
    FOR SELECT USING (
        itinerary_day_id IN (
            SELECT id FROM public.itinerary_days 
            WHERE itinerary_id IN (
                SELECT id FROM public.itineraries WHERE agent_id = auth.uid()
            )
        )
    );

CREATE POLICY "Agents can create activities for their itineraries" ON public.itinerary_day_activities
    FOR INSERT WITH CHECK (
        itinerary_day_id IN (
            SELECT id FROM public.itinerary_days 
            WHERE itinerary_id IN (
                SELECT id FROM public.itineraries WHERE agent_id = auth.uid()
            )
        )
    );

CREATE POLICY "Agents can update activities for their itineraries" ON public.itinerary_day_activities
    FOR UPDATE USING (
        itinerary_day_id IN (
            SELECT id FROM public.itinerary_days 
            WHERE itinerary_id IN (
                SELECT id FROM public.itineraries WHERE agent_id = auth.uid()
            )
        )
    );

CREATE POLICY "Agents can delete activities for their itineraries" ON public.itinerary_day_activities
    FOR DELETE USING (
        itinerary_day_id IN (
            SELECT id FROM public.itinerary_days 
            WHERE itinerary_id IN (
                SELECT id FROM public.itineraries WHERE agent_id = auth.uid()
            )
        )
    );

-- Comments for documentation
COMMENT ON TABLE public.itinerary_creation_sessions IS 'Tracks the state of itinerary creation sessions for agents';
COMMENT ON TABLE public.package_recommendations IS 'Stores package recommendations based on lead preferences and trip requirements';
COMMENT ON TABLE public.itinerary_day_activities IS 'Enhanced activities table for better day-by-day itinerary management';

COMMENT ON COLUMN public.itinerary_creation_sessions.status IS 'Current step in the itinerary creation process';
COMMENT ON COLUMN public.itinerary_creation_sessions.selected_packages IS 'JSON array of selected package IDs and metadata';
COMMENT ON COLUMN public.itinerary_creation_sessions.day_assignments IS 'JSON object mapping packages to specific days';

COMMENT ON COLUMN public.package_recommendations.recommendation_score IS 'Score from 0.0 to 1.0 indicating how well the package matches the lead';
COMMENT ON COLUMN public.package_recommendations.reason IS 'Human-readable explanation for why this package was recommended';

COMMENT ON COLUMN public.itinerary_day_activities.activity_type IS 'Type of activity: PACKAGE, CUSTOM, TRANSFER, MEAL, or ACCOMMODATION';
COMMENT ON COLUMN public.itinerary_day_activities.time_slot IS 'Time slot for the activity (e.g., "09:00 - 17:00")';
COMMENT ON COLUMN public.itinerary_day_activities.order_index IS 'Order of activities within the day';
