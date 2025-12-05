import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";

// Gallery images
import interiorImage from "@/assets/gallery/prox-interior-1.jpg";
import barImage from "@/assets/gallery/prox-bar.jpg";

// Real menu item photos
import noodlesPickled from "@/assets/menu/noodles-pickled.jpg";
import thaiOmelet from "@/assets/menu/thai-omelet-noodles.jpg";
import pastaVegetables from "@/assets/menu/pasta-vegetables.jpg";
import spicyPasta from "@/assets/menu/spicy-pasta-chicken.jpg";
import ricePlatter from "@/assets/menu/rice-platter.jpg";
import chickenRamen from "@/assets/menu/chicken-ramen.jpg";
import grilledWings from "@/assets/menu/grilled-wings.jpg";
import spicedChickenRice from "@/assets/menu/spiced-chicken-rice.jpg";
import friedRiceEgg from "@/assets/menu/fried-rice-egg.jpg";
import goldenDumplings from "@/assets/menu/golden-dumplings.jpg";

interface GalleryImage {
  src: string;
  title: string;
  category: "Interior" | "Signature Dish";
}

const galleryImages: GalleryImage[] = [
  {
    src: interiorImage,
    title: "Elegant Dining Room",
    category: "Interior",
  },
  {
    src: noodlesPickled,
    title: "Bangkok Street Noodles",
    category: "Signature Dish",
  },
  {
    src: thaiOmelet,
    title: "Thai Omelet Ramen",
    category: "Signature Dish",
  },
  {
    src: barImage,
    title: "Premium Bar",
    category: "Interior",
  },
  {
    src: pastaVegetables,
    title: "Colorful Rigatoni",
    category: "Signature Dish",
  },
  {
    src: spicyPasta,
    title: "Spicy Penne with Chicken",
    category: "Signature Dish",
  },
  {
    src: ricePlatter,
    title: "Heritage Rice Platter",
    category: "Signature Dish",
  },
  {
    src: chickenRamen,
    title: "Classic Chicken Ramen",
    category: "Signature Dish",
  },
  {
    src: grilledWings,
    title: "BBQ Glazed Wings",
    category: "Signature Dish",
  },
  {
    src: spicedChickenRice,
    title: "Spiced Chicken & Rice",
    category: "Signature Dish",
  },
  {
    src: friedRiceEgg,
    title: "Sunny Fried Rice",
    category: "Signature Dish",
  },
  {
    src: goldenDumplings,
    title: "Golden Silk Dumplings",
    category: "Signature Dish",
  },
];

const RestaurantGallery = () => {
  return (
    <div className="py-12 animate-fade-in-up">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="w-full max-w-6xl mx-auto"
      >
        <CarouselContent className="-ml-4">
          {galleryImages.map((image, index) => (
            <CarouselItem
              key={index}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Card className="overflow-hidden group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up hover-scale bg-card/50 backdrop-blur">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* Image */}
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Category badge */}
                  <Badge
                    variant={image.category === "Interior" ? "default" : "secondary"}
                    className="absolute top-4 right-4 shadow-lg backdrop-blur-sm bg-background/80 border border-border/50 transition-transform duration-300 group-hover:scale-105"
                  >
                    {image.category}
                  </Badge>
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-white font-bold text-lg drop-shadow-lg">
                      {image.title}
                    </h3>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="left-4 hover:bg-primary/10 border-primary/20 hover:border-primary/40 transition-all" />
        <CarouselNext className="right-4 hover:bg-primary/10 border-primary/20 hover:border-primary/40 transition-all" />
      </Carousel>

      <p className="text-center text-muted-foreground text-sm mt-6 animate-fade-in-text">
        Discover the elegance of Thai cuisine and our refined ambiance
      </p>
    </div>
  );
};

export default RestaurantGallery;
