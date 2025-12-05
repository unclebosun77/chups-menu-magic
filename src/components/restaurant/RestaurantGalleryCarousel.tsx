import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

interface RestaurantGalleryCarouselProps {
  images: string[];
  restaurantName: string;
  onOpenFullGallery: () => void;
}

const RestaurantGalleryCarousel = ({ 
  images, 
  restaurantName,
  onOpenFullGallery 
}: RestaurantGalleryCarouselProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Set up the onSelect callback
  useState(() => {
    if (emblaApi) {
      emblaApi.on("select", onSelect);
      onSelect();
    }
  });

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className="relative w-full">
      {/* Main Carousel */}
      <div className="overflow-hidden rounded-b-3xl" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="flex-[0_0_100%] min-w-0 relative aspect-[16/10]"
            >
              <img
                src={image}
                alt={`${restaurantName} gallery ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white opacity-80 hover:opacity-100 transition-opacity"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white opacity-80 hover:opacity-100 transition-opacity"
        onClick={scrollNext}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* View Full Gallery Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute bottom-4 right-4 h-8 px-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white text-xs font-medium"
        onClick={onOpenFullGallery}
      >
        <Expand className="h-3.5 w-3.5 mr-1.5" />
        View Gallery
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex 
                ? "bg-white w-6" 
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Thumbnail Strip */}
      <div className="absolute -bottom-12 left-4 right-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {images.slice(0, 5).map((image, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
              index === selectedIndex 
                ? "border-purple shadow-lg scale-105" 
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
        {images.length > 5 && (
          <button
            onClick={onOpenFullGallery}
            className="flex-shrink-0 w-14 h-10 rounded-lg bg-secondary/80 flex items-center justify-center text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            +{images.length - 5}
          </button>
        )}
      </div>
    </div>
  );
};

export default RestaurantGalleryCarousel;
