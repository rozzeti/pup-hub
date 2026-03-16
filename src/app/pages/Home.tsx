import { useState, useEffect } from 'react';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { API_URL, supabase } from '../utils/supabase';
import { publicAnonKey } from '/utils/supabase/info';
import { Dog, Scissors, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  availableSlots: string[];
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailability();
    }
  }, [selectedService, selectedDate]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const fetchAvailability = async () => {
    if (!selectedService || !selectedDate) return;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`${API_URL}/availability/${selectedService.id}/${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      
      const available = (data.availableSlots || []).filter(
        (slot: string) => 
          !data.bookedTimes.includes(slot) && 
          !data.blockedSlots.includes(slot)
      );
      
      setAvailableSlots(available);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load available times');
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerName || !customerEmail || !petName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          customerName,
          customerEmail,
          customerPhone,
          petName,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Booking confirmed! We\'ll see you soon!');
        // Reset form
        setSelectedTime('');
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setPetName('');
        fetchAvailability();
      } else {
        toast.error(data.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Dog className="w-16 h-16 text-[#ff6b35]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pawsome Dog Grooming</h1>
          <p className="text-xl text-gray-300">Professional grooming services for your furry friends</p>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedService?.id === service.id
                  ? 'border-[#ff6b35] border-2 shadow-lg'
                  : 'border-gray-200'
              }`}
              onClick={() => setSelectedService(service)}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {service.name.toLowerCase().includes('bath') ? (
                    <Sparkles className="w-6 h-6 text-[#ff6b35]" />
                  ) : (
                    <Scissors className="w-6 h-6 text-[#ff6b35]" />
                  )}
                  <CardTitle>{service.name}</CardTitle>
                </div>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-[#ff6b35]">${service.price}</p>
                  <p className="text-sm text-gray-600">{service.duration} minutes</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No services available yet. Please check back later!</p>
          </div>
        )}

        {/* Booking Form */}
        {selectedService && (
          <Card className="border-2 border-[#ff6b35]">
            <CardHeader>
              <CardTitle>Book {selectedService.name}</CardTitle>
              <CardDescription>Select a date and time for your appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Calendar */}
                <div className="space-y-4">
                  <div>
                    <Label>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md border mt-2"
                    />
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div>
                      <Label>Available Times</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {availableSlots.length > 0 ? (
                          availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant={selectedTime === slot ? 'default' : 'outline'}
                              onClick={() => setSelectedTime(slot)}
                              className={selectedTime === slot ? 'bg-[#ff6b35] hover:bg-[#ff6b35]/90' : ''}
                            >
                              {slot}
                            </Button>
                          ))
                        ) : (
                          <p className="col-span-3 text-sm text-gray-600">No available slots for this date</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="petName">Pet Name *</Label>
                    <Input
                      id="petName"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="Buddy"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerName">Your Name *</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="mt-2"
                    />
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={loading || !selectedTime}
                    className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white"
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Admin Link */}
      <div className="bg-gray-100 py-8 px-4 text-center">
        <p className="text-sm text-gray-600">
          Staff member?{' '}
          <a href="/admin/login" className="text-[#ff6b35] hover:underline font-medium">
            Login to Admin Dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
