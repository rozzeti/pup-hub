import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { API_URL } from '../utils/supabase';

interface DemoDataInitializerProps {
  accessToken: string;
  onComplete: () => void;
}

export function DemoDataInitializer({ accessToken, onComplete }: DemoDataInitializerProps) {
  const [loading, setLoading] = useState(false);

  const demoServices = [
    {
      name: 'Basic Bath & Brush',
      description: 'Complete bath with shampoo, conditioning, and thorough brushing',
      duration: 60,
      price: 45,
      availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    },
    {
      name: 'Full Grooming Package',
      description: 'Bath, haircut, nail trim, ear cleaning, and styling',
      duration: 90,
      price: 75,
      availableSlots: ['09:00', '11:00', '14:00', '16:00'],
    },
    {
      name: 'Nail Trim & Paw Care',
      description: 'Quick nail trim and paw pad maintenance',
      duration: 30,
      price: 25,
      availableSlots: ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30'],
    },
  ];

  const initializeDemoData = async () => {
    setLoading(true);
    try {
      for (const service of demoServices) {
        const response = await fetch(`${API_URL}/admin/services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(service),
        });

        if (!response.ok) {
          throw new Error('Failed to create service');
        }
      }

      toast.success('Demo services created successfully!');
      onComplete();
    } catch (error) {
      console.error('Error initializing demo data:', error);
      toast.error('Failed to create demo services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#ff6b35]">
      <CardHeader>
        <CardTitle>Quick Setup</CardTitle>
        <CardDescription>
          Get started quickly by adding some demo grooming services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          This will add three sample services:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 mb-6">
          <li>Basic Bath & Brush - $45</li>
          <li>Full Grooming Package - $75</li>
          <li>Nail Trim & Paw Care - $25</li>
        </ul>
        <Button
          onClick={initializeDemoData}
          disabled={loading}
          className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90"
        >
          {loading ? 'Creating Services...' : 'Add Demo Services'}
        </Button>
        <Button
          onClick={onComplete}
          variant="outline"
          className="w-full mt-2"
        >
          Skip - I'll add services manually
        </Button>
      </CardContent>
    </Card>
  );
}
