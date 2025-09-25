# 🚨 **Critical Issues Found & Fixes**

## 🔍 **Root Cause Analysis**

From your console logs, I can see exactly what's happening:

### **Issue 1: User Profile Mismatch** ❌
- **You're logging in as**: `operator@adventuretravel.com`
- **But system loads profile for**: `user@example.com` 
- **User ID**: `aaec6dc9-7ab5-4dd5-bf6f-e2472d3d2837`
- **Role in database**: `TRAVEL_AGENT` (wrong!)

**This means**: The user ID `aaec6dc9-7ab5-4dd5-bf6f-e2472d3d2837` belongs to `user@example.com`, not `operator@adventuretravel.com`.

### **Issue 2: Redirect Not Working** ❌
- Router.replace is being called but page doesn't change
- Need fallback mechanism

## 🛠️ **Immediate Fixes**

### **Fix 1: Correct User Profile**

Run this SQL in your Supabase SQL Editor:

```sql
-- Step 1: Check what users exist
SELECT 
  'auth.users' as table_name,
  id, 
  email, 
  created_at
FROM auth.users 
WHERE email IN ('operator@adventuretravel.com', 'user@example.com')
UNION ALL
SELECT 
  'public.users' as table_name,
  id, 
  email, 
  created_at,
  role
FROM public.users 
WHERE email IN ('operator@adventuretravel.com', 'user@example.com')
ORDER BY table_name, email;
```

**Expected Result**: You should see two different user IDs - one for each email.

### **Fix 2: Update User Profile**

```sql
-- Get the correct user ID for operator@adventuretravel.com
SELECT id, email FROM auth.users WHERE email = 'operator@adventuretravel.com';

-- Update the profile (replace 'CORRECT_USER_ID' with the ID from above)
UPDATE public.users 
SET 
  email = 'operator@adventuretravel.com',
  name = 'Sarah Johnson',
  role = 'TOUR_OPERATOR',
  updated_at = NOW()
WHERE id = 'CORRECT_USER_ID';
```

### **Fix 3: Create Missing Profile (if needed)**

If the operator user doesn't have a profile:

```sql
INSERT INTO public.users (id, email, name, role, is_active, created_at)
SELECT 
  au.id,
  au.email,
  'Sarah Johnson',
  'TOUR_OPERATOR',
  true,
  NOW()
FROM auth.users au
WHERE au.email = 'operator@adventuretravel.com'
AND NOT EXISTS (
  SELECT 1 FROM public.users pu 
  WHERE pu.id = au.id
);
```

## 🎯 **Expected Results After Fix**

### **Console Logs Should Show:**
```
🔍 Loading user profile for: [CORRECT_USER_ID]
✅ User profile loaded: {id: "...", email: "operator@adventuretravel.com", name: "Sarah Johnson", role: "TOUR_OPERATOR", ...}
🔍 User role from database: TOUR_OPERATOR
🎯 getDashboardUrl called with role: TOUR_OPERATOR
🎯 Role comparison with UserRole.TOUR_OPERATOR: true
🎯 Redirecting to operator dashboard
🚀 Redirecting to dashboard: /operator/dashboard
```

### **Redirect Should Work:**
- Page should change from `/auth/login/` to `/operator/dashboard`
- If router.replace fails, fallback will use `window.location.replace`

## 🚀 **Quick Test**

1. **Run the SQL fixes above**
2. **Clear browser cache/cookies**
3. **Try logging in again**
4. **Check console logs**

## 🔍 **Why This Happened**

The issue occurred because:
1. **User ID mismatch**: The session is tied to `user@example.com` but you're trying to login as `operator@adventuretravel.com`
2. **Wrong profile loaded**: System loads the profile for the session user ID, not the login email
3. **Role mismatch**: The loaded profile has `TRAVEL_AGENT` role instead of `TOUR_OPERATOR`

## 📋 **Verification Checklist**

- [ ] User profile shows correct email: `operator@adventuretravel.com`
- [ ] User profile shows correct role: `TOUR_OPERATOR`
- [ ] Console shows correct user ID being loaded
- [ ] Redirect goes to `/operator/dashboard`
- [ ] Dashboard loads successfully
