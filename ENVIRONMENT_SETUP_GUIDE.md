# 🔐 Environment Variables Setup Guide

## ✅ **Local Development (.env.local)**

Your `.env.local` file has been created with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pmadgbdfpbnhacqjxwct.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWRnYmRmcGJuaGFjcWp4d2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTQ4NTksImV4cCI6MjA3MzM5MDg1OX0.Q2R5iftFJJIrNj8xBdL7r4IRW8GzghjsN1OMvb7mixE

# Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Database Password
SUPABASE_DB_PASSWORD=your_database_password_here
```

## 🚀 **Netlify Production Setup**

### **Step 1: Get Service Role Key**

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Service Role Key** (keep this secret!)
4. Replace `your_service_role_key_here` in your `.env.local`

### **Step 2: Add Environment Variables to Netlify**

#### **Method 1: Netlify Dashboard (Recommended)**

1. **Login to Netlify** and go to your site dashboard
2. Click on **Site settings** → **Environment variables**
3. Click **Add variable** and add each variable:

```
Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://pmadgbdfpbnhacqjxwct.supabase.co

Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWRnYmRmcGJuaGFjcWp4d2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTQ4NTksImV4cCI6MjA3MzM5MDg1OX0.Q2R5iftFJJIrNj8xBdL7r4IRW8GzghjsN1OMvb7mixE

Variable Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Your Service Role Key from Supabase]

Variable Name: SUPABASE_DB_PASSWORD
Value: [Your Database Password]
```

#### **Method 2: Netlify CLI**

```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set environment variables
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://pmadgbdfpbnhacqjxwct.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWRnYmRmcGJuaGFjcWp4d2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTQ4NTksImV4cCI6MjA3MzM5MDg1OX0.Q2R5iftFJJIrNj8xBdL7r4IRW8GzghjsN1OMvb7mixE"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "[Your Service Role Key]"
netlify env:set SUPABASE_DB_PASSWORD "[Your Database Password]"
```

### **Step 3: Update Supabase Settings for Production**

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Update **Site URL** to your Netlify domain:
   ```
   https://your-site-name.netlify.app
   ```
4. Add **Redirect URLs**:
   ```
   https://your-site-name.netlify.app/auth/callback
   https://your-site-name.netlify.app/**
   ```

### **Step 4: Redeploy Your Site**

After adding environment variables, trigger a new deployment:

```bash
# If using Git integration, just push changes
git add .
git commit -m "Add Supabase environment variables"
git push

# Or trigger manual deploy in Netlify dashboard
```

## 🔒 **Security Best Practices**

### **Environment Variable Security**

1. **Never commit** `.env.local` to Git (it's already in `.gitignore`)
2. **Service Role Key** is secret - only use server-side
3. **Anon Key** is safe for client-side use
4. **Rotate keys** periodically for security

### **Supabase Security**

1. **Enable RLS** on all tables (already done in schema)
2. **Set up proper policies** for data access
3. **Use HTTPS** in production (Netlify provides this)
4. **Monitor usage** in Supabase dashboard

## 🧪 **Testing Your Setup**

### **Local Testing**

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test authentication:
   - Go to `/auth/register`
   - Create a test account
   - Verify user appears in Supabase dashboard

3. Test package creation:
   - Login as tour operator
   - Create a package
   - Verify package appears in database

### **Production Testing**

1. Deploy to Netlify
2. Test the same flows on your live site
3. Check Supabase dashboard for data
4. Verify real-time features work

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Environment variables not loading**:
   - Check variable names match exactly
   - Ensure no extra spaces
   - Redeploy after adding variables

2. **Authentication errors**:
   - Verify Site URL in Supabase settings
   - Check redirect URLs
   - Ensure HTTPS in production

3. **Database connection issues**:
   - Verify Service Role Key is correct
   - Check RLS policies
   - Review Supabase logs

### **Debug Commands**

```bash
# Check environment variables in Netlify
netlify env:list

# View deployment logs
netlify logs

# Test local environment
npm run dev
```

## 📋 **Checklist**

- [ ] `.env.local` created with Supabase credentials
- [ ] Service Role Key obtained from Supabase
- [ ] Environment variables added to Netlify
- [ ] Supabase Site URL updated for production
- [ ] Redirect URLs configured
- [ ] Site redeployed
- [ ] Authentication tested locally
- [ ] Authentication tested in production
- [ ] Database operations tested
- [ ] Real-time features verified

## 🎉 **You're Ready!**

Your environment variables are now properly configured for both development and production. Your Supabase integration will work seamlessly across all environments!

### **Next Steps:**
1. Get your Service Role Key from Supabase
2. Add all variables to Netlify
3. Update Supabase settings for production
4. Test your application
5. Deploy and enjoy! 🚀
