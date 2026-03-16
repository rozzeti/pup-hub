# Dog Grooming Booking Website - Setup Guide

A professional booking website for dog grooming services with admin dashboard, built with React, Supabase, and styled in black, white, and orange.

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Fill in your project details:
   - **Name:** Your project name (e.g., "dog-grooming")
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to your location
4. Wait for the project to be created (~2 minutes)

### 2. Get Your Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. You'll need these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project ID** (the `xxxxx` part of the URL)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. In your project directory, run:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Link to existing project or create new
   - Set project name
   - Keep default settings

4. Add environment variables:
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```
   Paste your values from step 2.

5. Redeploy:
   ```bash
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variables:
   - `SUPABASE_URL` = your Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your service_role key
6. Click "Deploy"

### 4. Update Supabase Configuration

After deploying to Vercel, you need to update your Figma Make project:

1. In Figma Make, update `/utils/supabase/info.tsx`:
   - Set `projectId` to your Supabase project ID
   - Set `publicAnonKey` to your anon public key

### 5. Create Your First Admin Account

Once deployed, you'll need to create an admin account:

1. Use a tool like Postman or run this in your browser console on your site:

```javascript
fetch('https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-dcbfdf64/admin/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR-ANON-KEY'
  },
  body: JSON.stringify({
    email: 'admin@yourbusiness.com',
    password: 'your-secure-password',
    name: 'Admin Name'
  })
}).then(r => r.json()).then(console.log);
```

Replace:
- `YOUR-PROJECT-ID` with your Supabase project ID
- `YOUR-ANON-KEY` with your anon public key
- Email, password, and name with your details

### 6. Push to GitHub (Optional)

1. Create a new repository on GitHub
2. In your project directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

3. If using Vercel, connect your GitHub repo for automatic deployments

## 📱 Features

### Customer Features
- Browse available grooming services
- View service details, pricing, and duration
- Select date and time for appointments
- Book appointments with pet and owner information
- Real-time availability checking

### Admin Features
- Secure login system
- **Services Management:**
  - Create, edit, and delete grooming services
  - Set pricing and duration
  - Configure available time slots for each service
- **Booking Management:**
  - View all customer bookings
  - Cancel/delete bookings
  - See customer and pet details
- **Schedule Management:**
  - Block out specific dates and times
  - Prevent double-bookings
  - Manage availability calendar

## 🎨 Customization

### Colors
The site uses a black, white, and orange theme. To customize:

Edit `/src/styles/theme.css`:
- `--primary: #ff6b35` - Change the orange accent color
- `--background: #ffffff` - Background color
- `--foreground: #000000` - Text color

### Business Information
Edit `/src/app/pages/Home.tsx`:
- Line 111: Update business name
- Line 112: Update tagline

## 📝 Usage

### For Customers
1. Visit your website
2. Browse services
3. Click on a service to select it
4. Choose a date and available time
5. Fill in pet and owner information
6. Click "Confirm Booking"

### For Admins
1. Visit `/admin/login`
2. Sign in with admin credentials
3. **Manage Services:** Add services with pricing and time slots
4. **View Bookings:** See all customer appointments
5. **Block Times:** Block dates/times when unavailable

## 🔒 Security Notes

- The `service_role` key should NEVER be exposed in your frontend code
- Only use it in server-side functions (Supabase Edge Functions)
- Admin authentication is required for all admin operations
- This is a prototype - for production, implement proper data validation and security measures

## 🆘 Troubleshooting

**Issue:** "Unauthorized" errors in admin dashboard
- Solution: Make sure you're logged in and your session hasn't expired

**Issue:** Services or bookings not showing
- Solution: Check browser console for errors, verify Supabase credentials

**Issue:** Can't create admin account
- Solution: Verify your Supabase URL and service_role key are correct

## 📞 Support

For issues with:
- **Vercel Deployment:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **GitHub:** [docs.github.com](https://docs.github.com)

## 🚀 Next Steps

Once everything is set up:

1. Create your admin account
2. Add your grooming services
3. Set your available time slots
4. Share the booking link with customers
5. Manage bookings from the admin dashboard

Enjoy your new booking system! 🐕✨
