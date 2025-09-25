# 🚀 Supabase Integration Setup Guide

## 📋 **Step-by-Step Implementation Guide**

### **Phase 1: Supabase Project Setup**

#### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → "New project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `travel-booking-platform`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be ready (2-3 minutes)

#### 1.2 Get Project Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

#### 1.3 Set Up Environment Variables
Create `.env.local` file in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Phase 2: Database Schema Setup**

#### 2.1 Run Database Schema
1. Go to **SQL Editor** in Supabase dashboard
2. Copy the contents of `supabase-schema.sql` file
3. Paste into SQL Editor
4. Click **Run** to execute the schema
5. Verify tables are created in **Table Editor**

#### 2.2 Verify Schema Creation
Check these tables exist:
- ✅ `users`
- ✅ `tour_operators`
- ✅ `packages`
- ✅ `bookings`
- ✅ `reviews`
- ✅ `package_images`
- ✅ `destinations`

### **Phase 3: Authentication Setup**

#### 3.1 Configure Authentication Settings
1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)

#### 3.2 Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure email templates if needed

#### 3.3 Optional: Enable Social Providers
1. Go to **Authentication** → **Providers**
2. Enable **Google** or **GitHub** if desired
3. Configure OAuth settings

### **Phase 4: File Storage Setup**

#### 4.1 Create Storage Buckets
The schema automatically creates these buckets:
- ✅ `package-images` (public)
- ✅ `user-avatars` (public)
- ✅ `documents` (private)

#### 4.2 Configure Storage Policies
Storage policies are automatically created by the schema.

### **Phase 5: Update Your Application**

#### 5.1 Replace AuthContext
Replace your current `AuthContext` with the new `SupabaseAuthContext`:

```typescript
// In your app/layout.tsx or _app.tsx
import { AuthProvider } from '@/context/SupabaseAuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### 5.2 Update Login/Register Forms
Update your authentication forms to use the new Supabase methods:

```typescript
// In your login form
const { signIn } = useAuth();

const handleLogin = async (email: string, password: string) => {
  const { success, error } = await signIn(email, password);
  if (success) {
    router.push('/dashboard');
  } else {
    setError(error);
  }
};
```

### **Phase 6: Package Management Integration**

#### 6.1 Create Package Forms
Use the `PackageService` for CRUD operations:

```typescript
import { PackageService } from '@/lib/services/packageService';

// Create package
const createPackage = async (packageData) => {
  const dbPackage = PackageService.convertToDbPackage(packageData);
  const { data, error } = await PackageService.createPackage(dbPackage);
  
  if (error) {
    console.error('Error creating package:', error);
  } else {
    console.log('Package created:', data);
  }
};

// Get packages
const getPackages = async () => {
  const { data, error } = await PackageService.getPackages({
    status: 'ACTIVE',
    limit: 20
  });
  
  if (data) {
    const packages = data.map(pkg => PackageService.convertToAppPackage(pkg));
    return packages;
  }
};
```

#### 6.2 Image Upload Integration
```typescript
import { supabase } from '@/lib/supabase';

const uploadPackageImage = async (file: File, packageId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${packageId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('package-images')
    .upload(fileName, file);
    
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('package-images')
    .getPublicUrl(fileName);
    
  return publicUrl;
};
```

### **Phase 7: Booking System Integration**

#### 7.1 Create Booking Forms
```typescript
import { BookingService } from '@/lib/services/bookingService';

const createBooking = async (bookingData) => {
  const dbBooking = BookingService.convertToDbBooking(bookingData);
  const { data, error } = await BookingService.createBooking(dbBooking);
  
  if (error) {
    console.error('Error creating booking:', error);
  } else {
    console.log('Booking created:', data);
  }
};
```

### **Phase 8: Testing**

#### 8.1 Test Authentication
1. Start your development server: `npm run dev`
2. Go to `/auth/register`
3. Create a new account
4. Verify user is created in Supabase dashboard
5. Test login/logout functionality

#### 8.2 Test Package Creation
1. Login as a tour operator
2. Create a new package
3. Verify package appears in Supabase dashboard
4. Test package listing and filtering

#### 8.3 Test Booking System
1. Login as a travel agent
2. Create a booking for a package
3. Verify booking appears in Supabase dashboard
4. Test booking management

### **Phase 9: Production Deployment**

#### 9.1 Update Environment Variables
Update your production environment with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

#### 9.2 Update Supabase Settings
1. Go to **Authentication** → **Settings**
2. Update **Site URL** to your production domain
3. Add production **Redirect URLs**

#### 9.3 Deploy Your Application
Deploy your Next.js application to your hosting platform.

## 🔧 **Troubleshooting**

### Common Issues:

#### 1. **Authentication Not Working**
- Check environment variables are correct
- Verify Supabase URL and keys
- Check redirect URLs in Supabase settings

#### 2. **Database Errors**
- Ensure schema was run successfully
- Check RLS policies are correct
- Verify user permissions

#### 3. **File Upload Issues**
- Check storage bucket exists
- Verify storage policies
- Check file size limits

#### 4. **TypeScript Errors**
- Run `npm run build` to check for type errors
- Update types if needed
- Check import paths

## 📚 **Next Steps**

### Advanced Features to Implement:
1. **Real-time Updates**: Use Supabase subscriptions
2. **Payment Integration**: Stripe integration
3. **Email Notifications**: Supabase Edge Functions
4. **Analytics**: Package views and bookings
5. **Search**: Full-text search with Supabase
6. **Caching**: Optimize queries with caching
7. **Mobile App**: React Native with Supabase

### Performance Optimization:
1. **Database Indexing**: Add indexes for common queries
2. **Image Optimization**: Resize images before upload
3. **Query Optimization**: Use select() to limit data
4. **Caching**: Implement Redis caching
5. **CDN**: Use Supabase CDN for images

## 🎉 **You're Ready!**

Your Supabase integration is now complete! You have:
- ✅ Database schema with all tables
- ✅ Authentication system
- ✅ File storage for images
- ✅ CRUD services for packages and bookings
- ✅ Row-level security policies
- ✅ TypeScript types
- ✅ Real-time capabilities

Start building your travel booking platform features!
