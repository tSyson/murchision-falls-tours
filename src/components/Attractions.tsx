import { Card, CardContent } from "@/components/ui/card";
import fallsImage from "@/assets/falls-detail.jpg";
import gameDriveImage from "@/assets/game-drive.jpg";
import boatSafariImage from "@/assets/boat-safari.jpg";
import birdWatchingImage from "@/assets/bird-watching.jpg";
import chimpanzeeImage from "@/assets/chimpanzee.jpg";

const attractions = [
  {
    image: fallsImage,
    title: "Murchison Falls",
    description: "Witness the mighty Nile River forced through a 7-meter gap before plunging 43 meters with thunderous power.",
  },
  {
    image: gameDriveImage,
    title: "Game Drives",
    description: "Spot lions, elephants, giraffes, antelopes, and buffalo on an exciting safari drive through the savannah.",
  },
  {
    image: boatSafariImage,
    title: "Boat Safaris",
    description: "Cruise the Nile to see hippos, crocodiles, and numerous bird species with the falls as your backdrop.",
  },
  {
    image: birdWatchingImage,
    title: "Bird Watching",
    description: "Discover over 450 bird species including the rare shoebill stork, African fish eagle, and kingfishers.",
  },
  {
    image: chimpanzeeImage,
    title: "Chimpanzee Trekking",
    description: "Explore Budongo Forest to observe chimpanzees and other primates in their natural habitat.",
  },
];

export const Attractions = () => {
  return (
    <section id="attractions" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-primary">
          Tourist Attractions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attraction, index) => (
            <Card 
              key={index} 
              className="overflow-hidden hover:shadow-nature-lg transition-all hover:-translate-y-2 duration-300 bg-card"
            >
              <div className="h-56 overflow-hidden">
                <img 
                  src={attraction.image} 
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