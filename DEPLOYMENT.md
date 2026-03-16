# Deployment Guide - Dog Grooming Booking Website

## Overview

This guide will help you deploy your dog grooming booking website using GitHub for version control and Vercel for hosting.

## Prerequisites

- GitHub account
- Vercel account (free tier is fine)
- Supabase account (free tier is fine)

## Step 1: Set Up Supabase

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Configure:
   - **Organization:** Select or create one
   - **Name:** `dog-grooming` (or your choice)
   - **Database Password:** Create and **save this password**
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free

### 1.2 Get Credentials

After project creation (~2 minutes):

1. Go to **Settings** → **API**
2. Note these values:
   ```
   Project URL: https://xxxxx.supabase.co
   Project ID: xxxxx (from the URL)
   anon/public key: eyJ... (long string)
   service_role key: eyJ... (long string - KEEP SECRET!)
   ```

## Step 2: Push to GitHub

### 2.1 Create Repository

1. Go to [github.com](https://github.com)
2. Click **"New repository"**
3. Configure:
   - **Name:** `dog-grooming-booking`
   - **Description:** "Professional dog grooming booking website"
   - **Visibility:** Public or Private (your choice)
   - **DO NOT** initialize with README (you have files already)

### 2.2 Push Code

In your project directory, run:

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Dog grooming booking website"

# Add GitHub as remote (replace with your URL)
git remote add origin https://github.com/YOUR-USERNAME/dog-grooming-booking.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login (you can use your GitHub account)
3. Click **"Add New..."** → **"Project"**
4. Click **"Import Git Repository"**
5. Select your `dog-grooming-booking` repository
6. Click **"Import"**

### 3.2 Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset:** Vite
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3.3 Add Environment Variables

**CRITICAL:** Add these environment variables in Vercel:

1. Click **"Environment Variables"** section
2. Add each variable:

**Variable 1:**
```
Name: SUPABASE_URL
Value: https://xxxxx.supabase.co (your Supabase URL)
Environment: Production, Preview, Development (select all)
```

**Variable 2:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJ... (your service_role key from Supabase)
Environment: Production, Preview, Development (select all)
```

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your site will be live at `https://your-project.vercel.app`

## Step 4: Update Supabase Info in Code

After deploying, you need to update your Figma Make project with Supabase credentials:

1. In Figma Make, open `/utils/supabase/info.tsx`
2. Update with your values:
   ```typescript
   export const projectId = 'your-project-id'; // e.g., 'abcd1234'
   export const publicAnonKey = 'eyJ...'; // Your anon public key
   ```
3. Save the file

## Step 5: Create Admin Account

Once deployed, create your first admin account:

### Option A: Using Browser Console

1. Visit your deployed site
2. Open browser console (F12)
3. Run this code (replace placeholders):

```javascript
fetch('https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-dcbfdf64/admin/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR-ANON-KEY'
  },
  body: JSON.stringify({
    email: 'admin@yourbusiness.com',
    password: 'YourSecurePassword123!',
    name: 'Admin Name'
  })
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    console.log('✅ Admin account created!', data);
  } else {
    console.error('❌ Error:', data);
  }
});
```

### Option B: Using Postman/cURL

```bash
curl -X POST \
  https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-dcbfdf64/admin/signup \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR-ANON-KEY' \
  -d '{
    "email": "admin@yourbusiness.com",
    "password": "YourSecurePassword123!",
    "name": "Admin Name"
  }'
```

## Step 6: Configure Automatic Deployments

GitHub + Vercel = automatic deployments on every push!

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Git**
3. Verify **Production Branch** is set to `main`
4. Now every push to `main` triggers a new deployment

### Workflow:

```bash
# Make changes to your code
git add .
git commit -m "Added new feature"
git push

# Vercel automatically deploys! 🚀
```

## Step 7: Set Up Custom Domain (Optional)

1. In Vercel, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `groomyourpup.com`)
3. Follow Vercel's DNS instructions
4. SSL is automatic and free!

## Testing Your Deployment

### Test Customer Booking Flow:

1. Visit your deployed site
2. You should see services (if you added them)
3. Try booking an appointment
4. Check admin dashboard for the booking

### Test Admin Dashboard:

1. Go to `https://your-site.vercel.app/admin/login`
2. Login with your admin credentials
3. Test:
   - ✅ Creating services
   - ✅ Viewing bookings
   - ✅ Blocking time slots

## Troubleshooting

### "Unauthorized" Errors

**Problem:** Admin features not working

**Solution:**
- Check environment variables in Vercel are set correctly
- Verify SUPABASE_SERVICE_ROLE_KEY is the service_role key (not anon key)
- Redeploy after adding environment variables

### Services Not Showing

**Problem:** No services on homepage

**Solution:**
- Login to admin dashboard
- Go to Services tab
- Add services manually or use "Add Demo Services" button

### Build Fails on Vercel

**Problem:** Deployment fails

**Solution:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify build command is `npm run build`

### Can't Create Admin Account

**Problem:** Signup returns error

**Solution:**
- Check Supabase URL is correct
- Verify service_role key (not anon key)
- Check browser console for detailed error

## Monitoring Your Site

### Vercel Analytics

1. Go to your project in Vercel
2. Click **Analytics** tab
3. See real-time traffic, performance

### Supabase Logs

1. Go to Supabase dashboard
2. Click **Edge Functions** → **make-server**
3. View request logs and errors

## Updating Your Site

When you want to make changes:

```bash
# 1. Make your changes in code

# 2. Test locally (optional)
npm run build

# 3. Commit and push
git add .
git commit -m "Description of changes"
git push

# 4. Vercel automatically deploys! ✨
```

## Important Notes

### Security

- ✅ Service role key is server-side only (in Edge Functions)
- ✅ Never commit .env files to GitHub
- ✅ Use Vercel environment variables for secrets
- ✅ Admin routes require authentication

### Costs

- **GitHub:** Free for public/private repos
- **Vercel:** Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic SSL
- **Supabase:** Free tier includes:
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users

### Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Docs:** https://docs.github.com

## Quick Reference

### URLs

```
Production Site: https://your-project.vercel.app
Admin Login: https://your-project.vercel.app/admin/login
GitHub Repo: https://github.com/YOUR-USERNAME/dog-grooming-booking
Vercel Dashboard: https://vercel.com/dashboard
Supabase Dashboard: https://app.supabase.com/
```

### Commands

```bash
# Deploy to production
git push origin main

# View local preview
npm run build
npm run preview

# Check deployment status
vercel ls
```

## Next Steps

After successful deployment:

1. ✅ Create admin account
2. ✅ Add your grooming services
3. ✅ Test the booking flow
4. ✅ Share the link with customers!
5. ✅ Monitor bookings in admin dashboard

Congratulations! Your dog grooming booking website is now live! 🎉🐕
