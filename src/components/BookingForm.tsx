import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20, "Phone number too long"),
  tourPackage: z.string().min(1, "Please select a tour package"),
  numGuests: z.number().min(1, "At least 1 guest required").max(50, "Maximum 50 guests"),
  visitDate: z.string().min(1, "Please select a date"),
});

export const BookingForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      tourPackage: formData.get("tourPackage") as string,
      numGuests: parseInt(formData.get("numGuests") as string),
      visitDate: formData.get("visitDate") as string,
    };

    try {
      const validated = bookingSchema.parse(data);

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("tour_bookings").insert({
        user_id: user?.id,
        full_name: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        tour_package: validated.tourPackage,
        num_guests: validated.numGuests,
        visit_date: validated.visitDate,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Booking Submitted!",
        description: "We'll contact you shortly to confirm your tour.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to submit booking. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto bg-accent/10 border-accent animate-fade-in">
        <CardContent className="text-center py-12">
          <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Thank You for Your Booking!</h3>
          <p className="text-muted-foreground">
            We have received your tour request and will contact you shortly to confirm details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-nature-lg">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                placeholder="Enter your full name"
                required 
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="Enter your email"
                required 
                maxLength={255}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                placeholder="Enter your phone number"
                required 
                maxLength={20}
              />
            </div>
            <div>
              <Label htmlFor="tourPackage">Preferred Tour Package *</Label>
              <Select name="tourPackage" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="game-drive">Game Drive</SelectItem>
                  <SelectItem value="boat-safari">Boat Safari</SelectItem>
                  <SelectItem value="chimpanzee-trek">Chimpanzee Trekking</SelectItem>
                  <SelectItem value="full-adventure">Full Adventure Package</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="numGuests">Number of Guests *</Label>
              <Input 
                id="numGuests" 
                name="numGuests" 
                type="number" 
                min="1" 
                max="50"
                placeholder="Number of guests"
                required 
              />
            </div>
            <div>
              <Label htmlFor="visitDate">Date of Visit *</Label>
              <Input 
                id="visitDate" 
                name="visitDate" 
                type="date" 
                required 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full md:w-auto px-12 rounded-full"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Book My Tour"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};