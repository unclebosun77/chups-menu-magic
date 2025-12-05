import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Camera, UtensilsCrossed, Star } from "lucide-react";

type Section = "info" | "gallery" | "menu" | "reviews";

interface SectionNavigationProps {
  onNavigate: (section: Section) => void;
}

const SectionNavigation = ({ onNavigate }: SectionNavigationProps) => {
  const [activeSection, setActiveSection] = useState<Section>("info");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["info", "gallery", "menu", "reviews"] as Section[];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: { id: Section; label: string; icon: typeof MapPin }[] = [
    { id: "info", label: "Info", icon: MapPin },
    { id: "gallery", label: "Gallery", icon: Camera },
    { id: "menu", label: "Menu", icon: UtensilsCrossed },
    { id: "reviews", label: "Reviews", icon: Star },
  ];

  return (
    <div className="sticky top-[60px] z-40 bg-background/95 backdrop-blur-md border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 py-3 overflow-x-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeSection === id ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate(id)}
              className={`transition-all duration-300 ${
                activeSection === id 
                  ? "shadow-md scale-105" 
                  : "hover:scale-105"
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionNavigation;
