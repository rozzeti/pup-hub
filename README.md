# Pawfect Grooming - Dog Grooming Booking System

A modern dog grooming booking website with admin features built with React, Tailwind CSS, and Supabase.

## Features

### Customer Features
- Browse available grooming services
- View service details (duration, price, description)
- Book appointments with calendar date picker
- Select available time slots
- Provide pet and owner information

### Admin Features
- Secure admin login/signup
- Manage services (add, edit, delete)
- View all bookings
- Block specific dates or time slots
- View upcoming appointments

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS v4
- **Routing**: React Router v7
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **UI Components**: Radix UI, shadcn/ui
- **Deployment Ready**: Vercel + GitHub

## Color Scheme

- Black (#000000)
- White (#FFFFFF)
- Orange Accent (#ff6b35)

## Setup Instructions

### 1. Clone to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: Dog grooming booking system"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up
4. Go to Project Settings > API
5. Copy your:
   - Project URL (anon key will be auto-configured in Figma Make)
   - anon/public key (will be auto-configured in Figma Make)
   - service_role key (needed for admin functions)

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables (in Vercel project settings):
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
6. Click "Deploy"

### 4. Configure Supabase Edge Functions (Backend)

The backend is already configured in `/supabase/functions/server/index.tsx`

To deploy edge functions to Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy server
```

### 5. Initialize Default Services (Optional)

After deployment, login to the admin panel and add some default services:

Example services:
- **Basic Bath**: 60 min, $50, "A relaxing bath for your furry friend"
- **Full Groom**: 120 min, $85, "Complete grooming package with bath, haircut, and nail trim"
- **Nail Trim**: 15 min, $15, "Quick nail trimming service"
- **De-shedding Treatment**: 90 min, $65, "Special treatment to reduce shedding"

## Usage

### For Customers
1. Visit the homepage
2. Browse available services
3. Click on a service to select it
4. Choose a date and time slot
5. Fill in pet and owner information
6. Submit booking

### For Admins
1. Navigate to `/admin/login`
2. Create an admin account (first time) or login
3. Access the dashboard to:
   - View and manage bookings
   - Add/delete services
   - Block dates or specific time slots

## File Structure

```
/src
  /app
    /components      # Reusable UI components
    /pages          # Route pages
      Home.tsx      # Customer booking page
      AdminLogin.tsx    # Admin authentication
      AdminDashboard.tsx # Admin management panel
    App.tsx         # Main app component
    routes.ts       # React Router configuration
  /styles
    theme.css       # Black, white, orange theme
/supabase
  /functions
    /server
      index.tsx     # Backend API routes
```

## API Routes

All routes are prefixed with `/make-server-dcbfdf64/`

- `POST /auth/signup` - Create admin account
- `GET /services` - Get all services
- `POST /services` - Add service (admin)
- `DELETE /services/:id` - Delete service (admin)
- `GET /bookings` - Get all bookings (admin)
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking (admin)
- `DELETE /bookings/:id` - Delete booking (admin)
- `GET /blocked-dates` - Get blocked dates
- `POST /blocked-dates` - Block date/times (admin)
- `DELETE /blocked-dates/:id` - Unblock date (admin)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Important Notes

- Supabase free tier is perfect for getting started
- Email confirmation is auto-enabled since no email server is configured
- Admin routes are protected with Supabase authentication
- Customer bookings don't require authentication
- Data is stored in Supabase's key-value store

## License

MIT
