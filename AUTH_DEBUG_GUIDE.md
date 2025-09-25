# 🔍 Authentication Debug Guide

## 🚨 **Issues Reported**

1. **Not redirecting to dashboard** after login
2. **User showing as "tour agent"** instead of "tour operator"

## 🔍 **Debugging Steps**

### **Step 1: Check Browser Console**

Open your browser's developer console and look for these logs:

```
🔍 Loading user profile for: [USER_ID]
✅ User profile loaded: [PROFILE_DATA]
🔍 User role from database: [ROLE]
🔄 LoginForm useEffect - Auth state: [STATE]
🎯 getDashboardUrl called with role: [ROLE]
🚀 Redirecting to dashboard: [URL]
```

### **Step 2: Check Database**

Run the SQL queries in `debug-user-profile.sql`:

1. **Check auth.users table**:
   ```sql
   SELECT id, email, created_at, raw_user_meta_data FROM auth.users ORDER BY created_at DESC;
   ```

2. **Check public.users table**:
   ```sql
   SELECT id, email, name, role, is_active FROM public.users ORDER BY created_at DESC;
   ```

3. **Find mismatches**:
   ```sql
   SELECT au.id, au.email, au.raw_user_meta_data->>'role' as auth_role, pu.role as profile_role
   FROM auth.users au
   JOIN public.users pu ON au.id = pu.id
   WHERE au.raw_user_meta_data->>'role' != pu.role::text;
   ```

### **Step 3: Run Debug Script**

```bash
node debug-auth-flow.js
```

This will show you:
- ✅ Supabase connection status
- 📧 All users in auth.users
- 👤 All users in public.users
- ⚠️ Any mismatches or missing profiles

## 🛠️ **Common Issues & Fixes**

### **Issue 1: User Profile Not Found**

**Symptoms:**
- Console shows: `❌ No user profile found in database for user: [ID]`
- User can't access dashboard

**Fix:**
```sql
-- Create missing user profile
INSERT INTO public.users (id, email, name, role, is_active, created_at)
VALUES (
  'USER_ID_FROM_AUTH_USERS',
  'email@example.com',
  'User Name',
  'TOUR_OPERATOR',
  true,
  NOW()
);
```

### **Issue 2: Wrong Role Assignment**

**Symptoms:**
- User shows as "TRAVEL_AGENT" instead of "TOUR_OPERATOR"
- Redirects to wrong dashboard

**Fix:**
```sql
-- Update user role
UPDATE public.users 
SET role = 'TOUR_OPERATOR', updated_at = NOW()
WHERE email = 'your-email@example.com';
```

### **Issue 3: Trigger Not Working**

**Symptoms:**
- New users don't get profiles created automatically
- Manual profile creation needed

**Fix:**
Check if the trigger exists:
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

If missing, recreate it:
```sql
-- Recreate the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'TRAVEL_AGENT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🎯 **Expected Console Output**

### **Successful Login:**
```
🔍 Loading user profile for: abc123-def456-ghi789
✅ User profile loaded: {id: "abc123", email: "user@example.com", name: "User Name", role: "TOUR_OPERATOR", ...}
🔍 User role from database: TOUR_OPERATOR
🔍 User role type: string
🔄 LoginForm useEffect - Auth state: {user: {...}, isLoading: false, ...}
🔍 User role for redirect: TOUR_OPERATOR
🎯 getDashboardUrl called with role: TOUR_OPERATOR
🎯 Role comparison with UserRole.TOUR_OPERATOR: true
🎯 Redirecting to operator dashboard
🚀 Redirecting to dashboard: /operator/dashboard
```

### **Failed Login:**
```
🔍 Loading user profile for: abc123-def456-ghi789
❌ No user profile found in database for user: abc123-def456-ghi789
🔍 User email: user@example.com
⏳ Not redirecting yet - user: false loading: false
```

## 🚀 **Quick Fix Commands**

### **Fix User Role:**
```sql
UPDATE public.users 
SET role = 'TOUR_OPERATOR' 
WHERE email = 'your-email@example.com';
```

### **Create Missing Profile:**
```sql
INSERT INTO public.users (id, email, name, role, is_active, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  COALESCE(au.raw_user_meta_data->>'role', 'TRAVEL_AGENT'),
  true,
  NOW()
FROM auth.users au
WHERE au.email = 'your-email@example.com'
AND NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id);
```

## 📋 **Checklist**

- [ ] Browser console shows user profile loaded
- [ ] User role is correct in database
- [ ] Redirect URL is correct
- [ ] No JavaScript errors
- [ ] Supabase connection working
- [ ] User has profile in public.users table
