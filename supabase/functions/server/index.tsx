import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Health check endpoint
app.get("/make-server-dcbfdf64/health", (c) => {
  return c.json({ status: "ok" });
});

// Admin signup
app.post("/make-server-dcbfdf64/admin/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'admin' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Admin signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Admin signup exception:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get all services
app.get("/make-server-dcbfdf64/services", async (c) => {
  try {
    const services = await kv.getByPrefix('service:');
    return c.json({ services });
  } catch (error) {
    console.log('Error fetching services:', error);
    return c.json({ error: 'Failed to fetch services' }, 500);
  }
});

// Create or update service (admin only)
app.post("/make-server-dcbfdf64/admin/services", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const service = await c.req.json();
    const serviceId = service.id || crypto.randomUUID();
    
    await kv.set(`service:${serviceId}`, {
      id: serviceId,
      ...service,
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, serviceId });
  } catch (error) {
    console.log('Error creating/updating service:', error);
    return c.json({ error: 'Failed to save service' }, 500);
  }
});

// Delete service (admin only)
app.delete("/make-server-dcbfdf64/admin/services/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const serviceId = c.req.param('id');
    await kv.del(`service:${serviceId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting service:', error);
    return c.json({ error: 'Failed to delete service' }, 500);
  }
});

// Get available time slots
app.get("/make-server-dcbfdf64/availability/:serviceId/:date", async (c) => {
  try {
    const serviceId = c.req.param('serviceId');
    const date = c.req.param('date');
    
    // Get service details
    const service = await kv.get(`service:${serviceId}`);
    if (!service) {
      return c.json({ error: 'Service not found' }, 404);
    }
    
    // Get blocked dates/times
    const blockedSlots = await kv.get(`blocked:${date}`) || [];
    
    // Get existing bookings for this date
    const allBookings = await kv.getByPrefix('booking:');
    const dateBookings = allBookings.filter((b: any) => 
      b.date === date && b.serviceId === serviceId
    );
    
    const bookedTimes = dateBookings.map((b: any) => b.time);
    
    return c.json({ 
      availableSlots: service.availableSlots || [],
      bookedTimes,
      blockedSlots
    });
  } catch (error) {
    console.log('Error fetching availability:', error);
    return c.json({ error: 'Failed to fetch availability' }, 500);
  }
});

// Create booking
app.post("/make-server-dcbfdf64/bookings", async (c) => {
  try {
    const booking = await c.req.json();
    const bookingId = crypto.randomUUID();
    
    await kv.set(`booking:${bookingId}`, {
      id: bookingId,
      ...booking,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    });
    
    return c.json({ success: true, bookingId });
  } catch (error) {
    console.log('Error creating booking:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

// Get all bookings (admin only)
app.get("/make-server-dcbfdf64/admin/bookings", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const bookings = await kv.getByPrefix('booking:');
    return c.json({ bookings });
  } catch (error) {
    console.log('Error fetching bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Update booking status (admin only)
app.put("/make-server-dcbfdf64/admin/bookings/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const bookingId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingBooking = await kv.get(`booking:${bookingId}`);
    if (!existingBooking) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    await kv.set(`booking:${bookingId}`, {
      ...existingBooking,
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error updating booking:', error);
    return c.json({ error: 'Failed to update booking' }, 500);
  }
});

// Delete booking (admin only)
app.delete("/make-server-dcbfdf64/admin/bookings/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const bookingId = c.req.param('id');
    await kv.del(`booking:${bookingId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting booking:', error);
    return c.json({ error: 'Failed to delete booking' }, 500);
  }
});

// Block date/time slots (admin only)
app.post("/make-server-dcbfdf64/admin/block-slots", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { date, slots } = await c.req.json();
    await kv.set(`blocked:${date}`, slots);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error blocking slots:', error);
    return c.json({ error: 'Failed to block slots' }, 500);
  }
});

// Get blocked slots (admin only)
app.get("/make-server-dcbfdf64/admin/blocked-slots/:date", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const date = c.req.param('date');
    const blockedSlots = await kv.get(`blocked:${date}`) || [];
    
    return c.json({ blockedSlots });
  } catch (error) {
    console.log('Error fetching blocked slots:', error);
    return c.json({ error: 'Failed to fetch blocked slots' }, 500);
  }
});

Deno.serve(app.fetch);