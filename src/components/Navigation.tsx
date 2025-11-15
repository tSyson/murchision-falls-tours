import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, TreePine } from "lucide-react";

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-nature-sm transition-all">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-accent transition-colors"
          >
            <TreePine className="w-7 h-7" />
            <span>Murchison Falls</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-6">
            <li>
              <button 
                onClick={() => scrollToSection("home")}
                className="font-medium hover:text-primary transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection("attractions")}
                className="font-medium hover:text-primary transition-colors"
              >
                Explore
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection("best-time")}
                className="font-medium hover:text-primary transition-colors"
              >
                Best Time to Visit
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection("booking")}
                className="font-medium hover:text-primary transition-colors"
              >
                Book a Tour
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection("contact")}
                className="font-medium hover:text-primary transition-colors"
              >
                Contact
              </button>
            </li>
          </ul>

          <Link to="/auth" className="hidden md:block">
            <Button variant="default">Login / Register</Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <ul className="flex flex-col gap-4">
              <li>
                <button 
                  onClick={() => scrollToSection("home")}
                  className="block w-full text-left font-medium hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("attractions")}
                  className="block w-full text-left font-medium hover:text-primary transition-colors"
                >
                  Explore
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("best-time")}
                  className="block w-full text-left font-medium hover:text-primary transition-colors"
                >
                  Best Time to Visit
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("booking")}
                  className="block w-full text-left font-medium hover:text-primary transition-colors"
                >
                  Book a Tour
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("contact")}
                  className="block w-full text-left font-medium hover:text-primary transition-colors"
                >
                  Contact
                </button>
              </li>
              <li>
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full">Login / Register</Button>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};