import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

// Gallery images
import interiorImage from "@/assets/gallery/prox-interior-1.jpg";
import barImage from "@/assets/gallery/prox-bar.jpg";
import padThaiImage from "@/assets/gallery/prox-pad-thai.jpg";
import tomYumImage from "@/assets/gallery/prox-tom-yum.jpg";
import greenCurryImage from "@/assets/gallery/prox-green-curry.jpg";
import mangoStickyRiceImage from "@/assets/gallery/prox-mango-sticky-rice.jpg";

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
    src: barImage,
    title: "Premium Bar",
    category: "Interior",
  },
  {
    src: padThaiImage,
    title: "Signature Pad Thai",
    category: "Signature Dish",
  },
  {
    src: tomYumImage,
    title: "Tom Yum Soup",
    category: "Signature Dish",
  },
  {
    src: greenCurryImage,
    title: "Green Curry",
    category: "Signature Dish",
  },
  {
    src: mangoStickyRiceImage,
    title: "Mango Sticky Rice",
    category: "Signature Dish",
  },
];

const RestaurantGallery = () => {
  return (
    <div className="py-12 animate-fade-in-up">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent max-w-xs" />
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10 animate-bounce-gentle">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
            Gallery
          </h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent max-w-xs" />
      </div>

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
