# 🔧 **Authentication Issues Fix Guide**

## 🚨 **Current Issues Identified**

From your console output, I can see:

1. **Multiple GoTrueClient instances** warning (fixed with global variables)
2. **400 Bad Request** error on login - demo users don't exist in Supabase Auth
3. **Auth state changes** show immediate sign-out

## ✅ **Issues Fixed**

### **1. Multiple Client Instances**
- **Problem**: Multiple Supabase clients being created
- **Solution**: Used global variables to ensure singleton pattern
- **Result**: Should eliminate the warning

### **2. Login Function Mismatch**
- **Problem**: Components calling `logout()` but context only had `signOut()`
- **Solution**: Added `logout` alias function
- **Result**: Logout button should work

## 🔑 **Main Issue: Demo Users Missing from Supabase Auth**

The **400 Bad Request** error occurs because:
- ✅ Demo users exist in **database** (via `demo-data.sql`)
- ❌ Demo users **don't exist in Supabase Auth**
- ❌ Login fails because auth system can't find the users

## 🚀 **Solution: Create Demo Users in Supabase Auth**

### **Option 1: Use the Script (Recommended)**

1. **Get Service Role Key**:
   - Go to Supabase Dashboard
   - Navigate to **Settings** → **API**
   - Copy the **Service Role Key**

2. **Update the Script**:
   - Open `create-demo-auth-users.js`
   - Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual key

3. **Run the Script**:
   ```bash
   node create-demo-auth-users.js
   ```

### **Option 2: Manual Creation**

1. **Go to Supabase Dashboard** → **Authentication** → **Users**
2. **Click "Add User"** and create each user:

   **User 1: Super Admin**
   - Email: `admin@travelbooking.com`
   - Password: `Admin123!`
   - User Metadata: `{"name": "Super Admin", "role": "SUPER_ADMIN"}`

   **User 2: Tour Operator**
   - Email: `operator@adventuretravel.com`
   - Password: `Operator123!`
   - User Metadata: `{"name": "Sarah Johnson", "role": "TOUR_OPERATOR"}`

   **User 3: Travel Agent**
   - Email: `agent@travelpro.com`
   - Password: `Agent123!`
   - User Metadata: `{"name": "Mike Chen", "role": "TRAVEL_AGENT"}`

### **Option 3: Test with New Account**

1. **Go to** `http://localhost:3003/auth/register`
2. **Create a new account** with any email/password
3. **Test login/logout** functionality

## 📋 **Complete Setup Steps**

### **Step 1: Create Auth Users**
- Use Option 1 (script) or Option 2 (manual) above

### **Step 2: Add Database Data**
- Go to Supabase Dashboard → **SQL Editor**
- Copy contents of `demo-data.sql`
- Paste and click **"Run"**

### **Step 3: Test Authentication**
1. **Go to** `http://localhost:3003/auth/login`
2. **Try demo accounts**:
   - `admin@travelbooking.com` / `Admin123!`
   - `operator@adventuretravel.com` / `Operator123!`
   - `agent@travelpro.com` / `Agent123!`
3. **Test logout** functionality

## 🔍 **Expected Results After Fix**

- ✅ **No 400 errors** in console
- ✅ **Successful login** with demo accounts
- ✅ **Proper redirect** to appropriate dashboard
- ✅ **Working logout** button
- ✅ **No multiple client warnings**

## 🚨 **If Issues Persist**

1. **Check Supabase Dashboard**:
   - Verify users exist in Authentication → Users
   - Check for any error messages

2. **Verify Database Schema**:
   - Ensure `demo-data.sql` ran successfully
   - Check that user records exist in `users` table

3. **Clear Browser Data**:
   - Clear cookies and localStorage
   - Refresh the page

4. **Check Console**:
   - Look for specific error messages
   - Verify environment variables are loaded

## 🎯 **Quick Test**

After creating the auth users:

1. **Login**: `admin@travelbooking.com` / `Admin123!`
2. **Should redirect** to `/admin/dashboard`
3. **Click logout** button
4. **Should redirect** to home page
5. **Session should be cleared**

Your authentication should work perfectly after these steps! 🎉
