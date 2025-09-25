# 🔧 **User Creation Issue Fix Guide**

## 🚨 **Problem Identified**

The error "Database error creating new user" is caused by a **database trigger** in your `supabase-schema.sql`:

**Lines 311-328**: `handle_new_user()` function and trigger
- Automatically creates user profile when auth user is created
- May conflict with existing data or RLS policies
- Causes user creation to fail

## ✅ **Solution Options**

### **Option 1: Quick Fix (Recommended)**

1. **Run the fix script**:
   - Go to Supabase Dashboard → **SQL Editor**
   - Copy contents of `disable-trigger-fix.sql`
   - Paste and click **"Run"**

2. **Create users manually**:
   - Go to Supabase Dashboard → **Authentication** → **Users**
   - Click **"Add User"** and create:
     - `admin@travelbooking.com` / `Admin123!`
     - `operator@adventuretravel.com` / `Operator123!`
     - `agent@travelpro.com` / `Agent123!`

3. **User profiles created automatically** via the INSERT statements

### **Option 2: Improved Trigger**

1. **Run the improved script**:
   - Copy contents of `fix-user-creation.sql`
   - Paste and click **"Run"**
   - This creates a better trigger that handles conflicts

2. **Create users normally** - the improved trigger will handle conflicts

### **Option 3: Manual Profile Creation**

1. **Create auth users** in Supabase Dashboard
2. **Get their user IDs** from the dashboard
3. **Manually insert profiles**:

```sql
INSERT INTO public.users (id, email, name, role) VALUES
  ('USER_ID_FROM_DASHBOARD', 'admin@travelbooking.com', 'Super Admin', 'SUPER_ADMIN'),
  ('USER_ID_FROM_DASHBOARD', 'operator@adventuretravel.com', 'Sarah Johnson', 'TOUR_OPERATOR'),
  ('USER_ID_FROM_DASHBOARD', 'agent@travelpro.com', 'Mike Chen', 'TRAVEL_AGENT');
```

## 🔍 **Root Cause Analysis**

The issue occurs because:

1. **Trigger Conflict**: `handle_new_user()` trigger tries to insert into `public.users`
2. **RLS Policies**: Row Level Security might block the insert
3. **Constraint Violations**: Email uniqueness or other constraints
4. **Existing Data**: Demo users might already exist in database

## 📋 **Step-by-Step Fix (Option 1)**

### **Step 1: Disable Trigger**
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

### **Step 2: Create Auth Users**
- Go to Supabase Dashboard → Authentication → Users
- Add each demo user manually

### **Step 3: Create User Profiles**
```sql
INSERT INTO public.users (id, email, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@travelbooking.com', 'Super Admin', 'SUPER_ADMIN'),
  ('00000000-0000-0000-0000-000000000002', 'operator@adventuretravel.com', 'Sarah Johnson', 'TOUR_OPERATOR'),
  ('00000000-0000-0000-0000-000000000003', 'agent@travelpro.com', 'Mike Chen', 'TRAVEL_AGENT')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();
```

### **Step 4: Test Login**
- Go to `http://localhost:3003/auth/login`
- Try demo accounts
- Should work without errors

## 🎯 **Expected Results**

After applying the fix:
- ✅ Users can be created in Supabase Auth
- ✅ User profiles are created in database
- ✅ Login works with demo accounts
- ✅ No "Database error creating new user" messages

## 🚨 **If Issues Persist**

1. **Check RLS Policies**:
   - Verify policies allow user creation
   - Check if policies are too restrictive

2. **Check Constraints**:
   - Ensure email uniqueness
   - Verify role constraints

3. **Check Existing Data**:
   - Look for conflicting records
   - Clear any duplicate data

4. **Use Service Role**:
   - Create users with service role key
   - Bypass RLS policies temporarily

## 🔄 **Re-enable Trigger (Optional)**

After fixing the issue, you can re-enable the trigger for future users:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Your user creation should work perfectly after applying this fix! 🎉
