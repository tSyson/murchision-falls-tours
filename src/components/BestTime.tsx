import { Sun, CloudRain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BestTime = () => {
  return (
    <section id="best-time" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-primary">
          Best Time to Visit
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-card to-muted hover:shadow-nature-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-secondary/20 p-3 rounded-full">
                  <Sun className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl text-primary">Dry Season</CardTitle>
              </div>
              <p className="text-lg font-semibold text-secondary">
                December–February & June–September
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Best for game viewing as animals gather around water sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Comfortable travel conditions with minimal rainfall</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Clear skies for photography</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Easier road access throughout the park</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-muted hover:shadow-nature-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <CloudRain className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary">Wet Season</CardTitle>
              </div>
              <p className="text-lg font-semibold text-primary">
                March–May & October–November
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Lush green scenery with vibrant vegetation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Excellent bird watching with migratory species present</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Fewer tourists and lower rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Some roads may be difficult to navigate</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};