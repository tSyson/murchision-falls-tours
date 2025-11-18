import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { ImageCropper } from "./ImageCropper";

interface TourPackage {
  id: string;
  name: string;
  description: string | null;
  price_per_person: number;
}

const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20, "Phone number too long"),
  tourPackage: z.string().min(1, "Please select a tour package"),
  numGuests: z.number().min(1, "At least 1 guest required").max(50, "Maximum 50 guests"),
  startDate: z.string().min(1, "Please select start date"),
  endDate: z.string().min(1, "Please select end date"),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export const BookingForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
  const [numGuests, setNumGuests] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTourPackages();
  }, []);

  const loadTourPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("tour_packages")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTourPackages(data || []);
    } catch (error) {
      console.error("Error loading tour packages:", error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Photo must be less than 5MB",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: Blob) => {
    const file = new File([croppedImage], "cropped-photo.jpg", { type: "image/jpeg" });
    setPhotoFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(croppedImage);
    
    setShowCropper(false);
    setOriginalImage(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setOriginalImage(null);
  };

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
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    try {
      const validated = bookingSchema.parse(data);

      let photoUrl = null;
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `bookings/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('site-images')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('site-images')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("tour_bookings").insert({
        user_id: user?.id,
        full_name: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        tour_package: validated.tourPackage,
        num_guests: validated.numGuests,
        start_date: validated.startDate,
        end_date: validated.endDate,
        photo_url: photoUrl,
        price_per_person: selectedPackage?.price_per_person,
      });

      if (error) throw error;

      // Send booking confirmation emails
      try {
        await supabase.functions.invoke('send-booking-emails', {
          body: {
            fullName: validated.fullName,
            email: validated.email,
            phone: validated.phone,
            tourPackage: validated.tourPackage,
            numGuests: validated.numGuests,
            startDate: validated.startDate,
            endDate: validated.endDate,
            pricePerPerson: selectedPackage?.price_per_person || 0,
          },
        });
      } catch (emailError) {
        console.error("Error sending emails:", emailError);
        // Don't fail the booking if emails fail
      }

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
              <Select 
                name="tourPackage" 
                required
                onValueChange={(value) => {
                  const pkg = tourPackages.find(p => p.name === value);
                  setSelectedPackage(pkg || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {tourPackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.name}>
                      {pkg.name} - ${pkg.price_per_person} per person
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPackage && (
                <p className="text-sm text-primary font-semibold mt-2">
                  ${selectedPackage.price_per_person} per person
                </p>
              )}
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
                value={numGuests}
                onChange={(e) => setNumGuests(parseInt(e.target.value) || 1)}
                placeholder="Number of guests"
                required 
              />
              {selectedPackage && numGuests > 0 && (
                <p className="text-sm font-bold text-primary mt-2">
                  Total: ${(selectedPackage.price_per_person * numGuests).toFixed(2)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input 
                id="startDate" 
                name="startDate" 
                type="date" 
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input 
                id="endDate" 
                name="endDate" 
                type="date" 
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="photo">Your Photo (for identification)</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          {photoPreview && (
            <div className="flex justify-center">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="w-32 h-32 object-cover object-top rounded-lg border-2"
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            * Required fields. Photo is optional but helps us identify you during check-in (max 5MB).
          </p>

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
      
      {originalImage && (
        <ImageCropper
          image={originalImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          open={showCropper}
        />
      )}
    </Card>
  );
};