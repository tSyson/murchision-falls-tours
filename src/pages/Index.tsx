import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Attractions } from "@/components/Attractions";
import { BestTime } from "@/components/BestTime";
import { BookingForm } from "@/components/BookingForm";
import { Contact } from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Attractions />
      <BestTime />
      
      <section id="booking" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-primary">
            Book a Tour
          </h2>
          <BookingForm />
        </div>
      </section>

      <Contact />

      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Murchison Falls National Park. All rights reserved.</p>
          <p className="text-sm mt-2 opacity-90">Experience the power and beauty of nature</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;