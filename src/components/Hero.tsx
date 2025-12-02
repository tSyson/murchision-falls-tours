import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/murchison-hero.jpg";

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
}

export const Hero = () => {
  const [content, setContent] = useState<HeroContent>({
    title: "Discover the Power & Beauty of Murchison Falls",
    subtitle: "Experience wildlife, adventure, and the breathtaking Nile as it plunges through the world's most powerful waterfall",
    ctaText: "Plan Your Visit",
  });
  const [dynamicHeroImage, setDynamicHeroImage] = useState<string | null>(null);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    loadContent();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('hero-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_content',
          filter: 'section=eq.hero'
        },
        () => {
          loadContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("section", "hero")
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.content) {
        const parsed = data.content as Record<string, string>;
        setContent({
          title: parsed.title || content.title,
          subtitle: parsed.subtitle || content.subtitle,
          ctaText: parsed.ctaText || content.ctaText,
        });
        if (parsed.heroImage) {
          setDynamicHeroImage(parsed.heroImage);
          
          // Generate signed URL for the image
          const { data: signedData } = await supabase.storage
            .from('site-images')
            .createSignedUrl(parsed.heroImage, 60 * 60); // 1 hour expiry
          
          if (signedData?.signedUrl) {
            setSignedImageUrl(signedData.signedUrl);
          }
        }
      }
    } catch (error) {
      console.error("Error loading hero content:", error);
    }
  };

  const scrollToBooking = () => {
    const element = document.getElementById("booking");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section 
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${signedImageUrl || heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto px-4 text-center text-white z-10 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
          {content.title}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">
          {content.subtitle}
        </p>
        <Button 
          size="lg" 
          onClick={scrollToBooking}
          className="text-lg px-8 py-6 rounded-full shadow-nature-lg hover:shadow-nature-md hover:scale-105 transition-all"
        >
          {content.ctaText}
        </Button>
      </div>
    </section>
  );
};