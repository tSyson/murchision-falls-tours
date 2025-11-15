import { Button } from "@/components/ui/button";
import heroImage from "@/assets/murchison-hero.jpg";

export const Hero = () => {
  const scrollToBooking = () => {
    const element = document.getElementById("booking");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section 
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto px-4 text-center text-white z-10 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
          Discover the Power & Beauty of Murchison Falls
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">
          Experience wildlife, adventure, and the breathtaking Nile as it plunges through the world's most powerful waterfall
        </p>
        <Button 
          size="lg" 
          onClick={scrollToBooking}
          className="text-lg px-8 py-6 rounded-full shadow-nature-lg hover:shadow-nature-md hover:scale-105 transition-all"
        >
          Plan Your Visit
        </Button>
      </div>
    </section>
  );
};