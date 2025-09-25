# 🚀 Quick Netlify Deployment Guide

## ✅ **Your .env.local File Created**

Your local environment file is ready with your Supabase credentials:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your public anon key
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` - **You need to get this from Supabase dashboard**

## 🔐 **For Netlify Production Deployment**

### **Step 1: Get Service Role Key**
1. Go to [supabase.com](https://supabase.com) → Your project
2. **Settings** → **API**
3. Copy the **Service Role Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
4. Replace `your_service_role_key_here` in your `.env.local`

### **Step 2: Add to Netlify Environment Variables**

#### **Option A: Netlify Dashboard (Easiest)**
1. Go to your Netlify site dashboard
2. **Site settings** → **Environment variables**
3. Click **Add variable** and add:

```
NEXT_PUBLIC_SUPABASE_URL = https://pmadgbdfpbnhacqjxwct.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWRnYmRmcGJuaGFjcWp4d2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTQ4NTksImV4cCI6MjA3MzM5MDg1OX0.Q2R5iftFJJIrNj8xBdL7r4IRW8GzghjsN1OMvb7mixE
SUPABASE_SERVICE_ROLE_KEY = [Your Service Role Key]
```

#### **Option B: Netlify CLI**
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://pmadgbdfpbnhacqjxwct.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWRnYmRmcGJuaGFjcWp4d2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTQ4NTksImV4cCI6MjA3MzM5MDg1OX0.Q2R5iftFJJIrNj8xBdL7r4IRW8GzghjsN1OMvb7mixE"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "[Your Service Role Key]"
```

### **Step 3: Update Supabase Settings**
1. Go to Supabase dashboard → **Authentication** → **Settings**
2. Update **Site URL** to: `https://your-site-name.netlify.app`
3. Add **Redirect URLs**:
   - `https://your-site-name.netlify.app/auth/callback`
   - `https://your-site-name.netlify.app/**`

### **Step 4: Deploy**
```bash
git add .
git commit -m "Add Supabase integration"
git push
```

## 🧪 **Test Your Setup**

### **Local Testing**
```bash
npm run dev
# Go to http://localhost:3000/auth/register
# Create a test account
# Verify it appears in Supabase dashboard
```

### **Production Testing**
1. Deploy to Netlify
2. Test authentication on your live site
3. Create a package as tour operator
4. Create a booking as travel agent
5. Verify data appears in Supabase

## 🔒 **Security Notes**

- ✅ **Anon Key** is safe for client-side (already public)
- ⚠️ **Service Role Key** is secret - only use server-side
- ✅ **Environment variables** are encrypted in Netlify
- ✅ **HTTPS** is automatic on Netlify

## 🎯 **You're Ready!**

Once you:
1. ✅ Get your Service Role Key from Supabase
2. ✅ Add all variables to Netlify
3. ✅ Update Supabase settings for production
4. ✅ Deploy your site

Your travel booking platform will be live with full Supabase integration! 🚀

## 📞 **Need Help?**

- Check `ENVIRONMENT_SETUP_GUIDE.md` for detailed instructions
- Verify your Supabase project is active
- Check Netlify deployment logs if issues occur
- Test locally first before deploying
