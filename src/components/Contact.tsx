import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-primary">
          Contact the Park Manager
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div>
            <h3 className="text-2xl font-bold mb-6 text-primary">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <span>Murchison Falls National Park, Northern Uganda</span>
              </li>
              <li className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <span>+256 785393756</span>
              </li>
              <li className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <span>tugumesyson76@gmail.com</span>
              </li>
              <li className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <span>Open daily: 6:00 AM - 6:00 PM</span>
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