import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { projectId } from "/utils/supabase/info";

interface InitializeServicesProps {
  adminToken: string;
  onComplete: () => void;
}

const DEFAULT_SERVICES = [
  {
    name: "Basic Bath",
    duration: 60,
    price: 50,
    description: "A relaxing bath with premium shampoo and conditioning treatment"
  },
  {
    name: "Full Groom",
    duration: 120,
    price: 85,
    description: "Complete grooming package including bath, haircut, nail trim, and ear cleaning"
  },
  {
    name: "Nail Trim",
    duration: 15,
    price: 15,
    description: "Quick and careful nail trimming service"
  },
  {
    name: "De-shedding Treatment",
    duration: 90,
    price: 65,
    description: "Special treatment to reduce shedding and keep your home cleaner"
  },
  {
    name: "Puppy's First Groom",
    duration: 45,
    price: 40,
    description: "Gentle introduction to grooming for puppies under 6 months"
  }
];

export function InitializeServices({ adminToken, onComplete }: InitializeServicesProps) {
  const [loading, setLoading] = useState(false);

  const handleInitialize = async () => {
    setLoading(true);
    
    try {
      let successCount = 0;
      
      for (const service of DEFAULT_SERVICES) {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-dcbfdf64/services`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(service)
          }
        );

        const data = await response.json();
        if (data.success) {
          successCount++;
        }
      }

      if (successCount === DEFAULT_SERVICES.length) {
        toast.success(`${successCount} services added successfully!`);
        onComplete();
      } else {
        toast.warning(`Added ${successCount} of ${DEFAULT_SERVICES.length} services`);
        onComplete();
      }
    } catch (error) {
      console.error('Error initializing services:', error);
      toast.error('Failed to initialize services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#ff6b35] border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#ff6b35]" />
          <CardTitle>Quick Start</CardTitle>
        </div>
        <CardDescription>
          Get started quickly with 5 pre-configured grooming services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          We'll add these services for you:
        </p>
        <ul className="text-sm space-y-1 mb-4 text-gray-600">
          {DEFAULT_SERVICES.map((service, index) => (
            <li key={index}>• {service.name} (${service.price}, {service.duration} min)</li>
          ))}
        </ul>
        <Button
          onClick={handleInitialize}
          disabled={loading}
          className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90"
        >
          {loading ? "Adding Services..." : "Add Default Services"}
        </Button>
      </CardContent>
    </Card>
  );
}
