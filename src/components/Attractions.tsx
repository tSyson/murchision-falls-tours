import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import fallsImage from "@/assets/falls-detail.jpg";
import gameDriveImage from "@/assets/game-drive.jpg";
import boatSafariImage from "@/assets/boat-safari.jpg";
import birdWatchingImage from "@/assets/bird-watching.jpg";
import chimpanzeeImage from "@/assets/chimpanzee.jpg";

const defaultImages: Record<string, string> = {
  "Murchison Falls": fallsImage,
  "Game Drives": gameDriveImage,
  "Boat Safaris": boatSafariImage,
  "Bird Watching": birdWatchingImage,
  "Chimpanzee Trekking": chimpanzeeImage,
};

interface Attraction {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
}

export const Attractions = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAttractions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('attractions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attractions'
        },
        () => {
          loadAttractions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from("attractions")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setAttractions(data || []);
      
      // Set URLs directly from image_url (now public URLs)
      const urls: Record<string, string> = {};
      for (const attraction of data || []) {
        if (attraction.image_url) {
          urls[attraction.id] = attraction.image_url;
        }
      }
      setSignedUrls(urls);
    } catch (error) {
      console.error("Error loading attractions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="attractions" className="py-20 bg-muted">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }
  return (
    <section id="attractions" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-primary">
          Tourist Attractions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attraction) => (
            <Card 
              key={attraction.id} 
              className="overflow-hidden hover:shadow-nature-lg transition-all hover:-translate-y-2 duration-300 bg-card"
            >
              <div className="h-56 overflow-hidden">
                <img 
                  src={signedUrls[attraction.id] || defaultImages[attraction.title] || fallsImage} 
                  alt={attraction.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-primary">
                  {attraction.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {attraction.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};