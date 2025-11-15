import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ContactContent {
  title: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

export const Contact = () => {
  const [content, setContent] = useState<ContactContent>({
    title: "Contact the Park Manager",
    address: "Murchison Falls National Park, Northern Uganda",
    phone: "+256 785393756",
    email: "tugumesyson76@gmail.com",
    hours: "Open daily: 6:00 AM - 6:00 PM",
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("section", "contact")
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.content) {
        const parsed = data.content as Record<string, string>;
        setContent({
          title: parsed.title || content.title,
          address: parsed.address || content.address,
          phone: parsed.phone || content.phone,
          email: parsed.email || content.email,
          hours: parsed.hours || content.hours,
        });
      }
    } catch (error) {
      console.error("Error loading contact content:", error);
    }
  };
  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-primary">
          {content.title}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div>
            <h3 className="text-2xl font-bold mb-6 text-primary">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <span>{content.address}</span>
              </li>
              <li className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <span>{content.phone}</span>
              </li>
              <li className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <span>{content.email}</span>
              </li>
              <li className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <span>{content.hours}</span>
              </li>
            </ul>
          </div>

          <Card className="overflow-hidden shadow-nature-lg">
            <CardContent className="p-0">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15956.21888900826!2d31.645966968750705!3d2.226911299999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17709cdb8b7e3849%3A0x638911c8e1e99e37!2sMurchison%20Falls!5e0!3m2!1sen!2sug!4v1685369872459!5m2!1sen!2sug"
                className="w-full h-96"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Murchison Falls Location"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};