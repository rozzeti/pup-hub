import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Calendar } from '../components/ui/calendar';
import { toast } from 'sonner';
import { API_URL, supabase } from '../utils/supabase';
import { LogOut, Plus, Trash2, Edit, Calendar as CalendarIcon, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '../components/ui/textarea';
import { DemoDataInitializer } from '../components/DemoDataInitializer';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  availableSlots: string[];
}

interface Booking {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  petName: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string>('');
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  
  // Service form state
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceSlots, setServiceSlots] = useState('');

  // Block slots state
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedBlockSlots, setSelectedBlockSlots] = useState<string[]>([]);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchServices();
      fetchBookings();
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedDate && accessToken) {
      fetchBlockedSlots();
    }
  }, [selectedDate, accessToken]);

  const checkAuth = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!session || error) {
      toast.error('Please login to access the dashboard');
      navigate('/admin/login');
      return;
    }
    
    setAccessToken(session.access_token);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/bookings`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    }
  };

  const fetchBlockedSlots = async () => {
    if (!selectedDate) return;
    
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`${API_URL}/admin/blocked-slots/${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setBlockedSlots(data.blockedSlots || []);
    } catch (error) {
      console.error('Error fetching blocked slots:', error);
    }
  };

  const handleSaveService = async () => {
    if (!serviceName || !serviceDuration || !servicePrice || !serviceSlots) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const slotsArray = serviceSlots.split(',').map(s => s.trim()).filter(s => s);
      
      const response = await fetch(`${API_URL}/admin/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: editingService?.id,
          name: serviceName,
          description: serviceDescription,
          duration: parseInt(serviceDuration),
          price: parseFloat(servicePrice),
          availableSlots: slotsArray,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(editingService ? 'Service updated!' : 'Service created!');
        setServiceDialogOpen(false);
        resetServiceForm();
        fetchServices();
      } else {
        toast.error(data.error || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Service deleted!');
        fetchServices();
      } else {
        toast.error(data.error || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDescription(service.description);
    setServiceDuration(service.duration.toString());
    setServicePrice(service.price.toString());
    setServiceSlots(service.availableSlots.join(', '));
    setServiceDialogOpen(true);
  };

  const resetServiceForm = () => {
    setEditingService(null);
    setServiceName('');
    setServiceDescription('');
    setServiceDuration('');
    setServicePrice('');
    setServiceSlots('');
  };

  const handleBlockSlots = async () => {
    if (!selectedDate) return;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`${API_URL}/admin/block-slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          date: dateStr,
          slots: selectedBlockSlots,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Time slots blocked!');
        setBlockDialogOpen(false);
        setSelectedBlockSlots([]);
        fetchBlockedSlots();
      } else {
        toast.error(data.error || 'Failed to block slots');
      }
    } catch (error) {
      console.error('Error blocking slots:', error);
      toast.error('Failed to block slots');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Booking cancelled!');
        fetchBookings();
      } else {
        toast.error(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const toggleBlockSlot = (slot: string) => {
    setSelectedBlockSlots(prev =>
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Block Times
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>View and manage customer bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No bookings yet</p>
                  ) : (
                    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{booking.petName}</h3>
                              <span className="text-sm bg-[#ff6b35] text-white px-2 py-1 rounded">
                                {booking.serviceName}
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              <p><strong>Owner:</strong> {booking.customerName}</p>
                              <p><strong>Email:</strong> {booking.customerEmail}</p>
                              {booking.customerPhone && (
                                <p><strong>Phone:</strong> {booking.customerPhone}</p>
                              )}
                              <p><strong>Date:</strong> {booking.date} at {booking.time}</p>
                              <p className="text-gray-600">
                                Booked on {new Date(booking.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Services</CardTitle>
                    <CardDescription>Manage your grooming services</CardDescription>
                  </div>
                  <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={resetServiceForm}
                        className="bg-[#ff6b35] hover:bg-[#ff6b35]/90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingService ? 'Edit Service' : 'Add New Service'}
                        </DialogTitle>
                        <DialogDescription>
                          Configure service details and available time slots
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="serviceName">Service Name</Label>
                          <Input
                            id="serviceName"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                            placeholder="e.g., Full Grooming"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="serviceDescription">Description</Label>
                          <Textarea
                            id="serviceDescription"
                            value={serviceDescription}
                            onChange={(e) => setServiceDescription(e.target.value)}
                            placeholder="Describe the service..."
                            className="mt-2"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="serviceDuration">Duration (minutes)</Label>
                            <Input
                              id="serviceDuration"
                              type="number"
                              value={serviceDuration}
                              onChange={(e) => setServiceDuration(e.target.value)}
                              placeholder="60"
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="servicePrice">Price ($)</Label>
                            <Input
                              id="servicePrice"
                              type="number"
                              step="0.01"
                              value={servicePrice}
                              onChange={(e) => setServicePrice(e.target.value)}
                              placeholder="50.00"
                              className="mt-2"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="serviceSlots">Available Time Slots</Label>
                          <Input
                            id="serviceSlots"
                            value={serviceSlots}
                            onChange={(e) => setServiceSlots(e.target.value)}
                            placeholder="09:00, 10:00, 11:00, 14:00, 15:00"
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            Comma-separated time slots (e.g., 09:00, 10:00, 11:00)
                          </p>
                        </div>
                        <Button
                          onClick={handleSaveService}
                          className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90"
                        >
                          {editingService ? 'Update Service' : 'Create Service'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-6">No services yet. Add your first service to get started!</p>
                      <DemoDataInitializer 
                        accessToken={accessToken} 
                        onComplete={fetchServices}
                      />
                    </div>
                  ) : (
                    services.map((service) => (
                      <div
                        key={service.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold text-lg">{service.name}</h3>
                            <p className="text-sm text-gray-600">{service.description}</p>
                            <div className="flex gap-4 text-sm">
                              <span><strong>Duration:</strong> {service.duration} min</span>
                              <span><strong>Price:</strong> ${service.price}</span>
                            </div>
                            <div className="text-sm">
                              <strong>Available slots:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {service.availableSlots.map((slot) => (
                                  <span
                                    key={slot}
                                    className="bg-gray-100 px-2 py-1 rounded text-xs"
                                  >
                                    {slot}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Block Times Tab */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Block Time Slots</CardTitle>
                <CardDescription>Block out dates and times when you're unavailable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border mt-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label>Blocked Time Slots</Label>
                      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#ff6b35] text-[#ff6b35]"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Block Slots
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Block Time Slots</DialogTitle>
                            <DialogDescription>
                              Select time slots to block for {selectedDate && format(selectedDate, 'PPP')}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((slot) => (
                              <Button
                                key={slot}
                                variant={selectedBlockSlots.includes(slot) ? 'default' : 'outline'}
                                onClick={() => toggleBlockSlot(slot)}
                                className={
                                  selectedBlockSlots.includes(slot)
                                    ? 'bg-[#ff6b35] hover:bg-[#ff6b35]/90'
                                    : ''
                                }
                              >
                                {slot}
                              </Button>
                            ))}
                          </div>
                          <Button
                            onClick={handleBlockSlots}
                            className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90"
                          >
                            Block Selected Slots
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {blockedSlots.length > 0 ? (
                      <div className="space-y-2">
                        {blockedSlots.map((slot) => (
                          <div
                            key={slot}
                            className="flex items-center justify-between border rounded p-2 bg-red-50"
                          >
                            <span className="text-sm font-medium">{slot}</span>
                            <span className="text-xs text-red-600">Blocked</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        No blocked slots for {selectedDate && format(selectedDate, 'PPP')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}