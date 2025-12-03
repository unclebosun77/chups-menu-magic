import { useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import useEmblaCarousel from "embla-carousel-react";

interface FullGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  restaurantName: string;
  initialIndex?: number;
  theme?: "light" | "dark";
}

const FullGalleryModal = ({ 
  open, 
  onOpenChange, 
  images, 
  restaurantName,
  initialIndex = 0,
  theme = "light"
}: FullGalleryModalProps) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    startIndex: initialIndex
  });

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

  useState(() => {
    if (emblaApi) {
      emblaApi.on("select", onSelect);
      onSelect();
    }
  });

  const bgColor = theme === "dark" ? "bg-black" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-full h-screen ${bgColor} p-0 border-0`}>
        {/* Header */}
        <div className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 ${theme === "dark" ? "bg-gradient-to-b from-black/60 to-transparent" : "bg-gradient-to-b from-white/90 to-transparent"}`}>
          <div>
            <h2 className={`font-semibold ${textColor}`}>{restaurantName}</h2>
            <p className={`text-sm ${theme === "dark" ? "text-white/60" : "text-muted-foreground"}`}>
              {selectedIndex + 1} of {images.length}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-full ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10"}`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-full ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10"}`}
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Gallery */}
        <div className="h-full flex items-center justify-center" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="flex-[0_0_100%] min-w-0 flex items-center justify-center p-8"
              >
                <img
                  src={image}
                  alt={`${restaurantName} ${index + 1}`}
                  className={`max-w-full max-h-full object-contain rounded-2xl transition-transform duration-300 ${
                    isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full ${
            theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10"
          }`}
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full ${
            theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10"
          }`}
          onClick={scrollNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Thumbnail Strip */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 ${
          theme === "dark" ? "bg-gradient-to-t from-black/60 to-transparent" : "bg-gradient-to-t from-white/90 to-transparent"
        }`}>
          <div className="flex justify-center gap-2 overflow-x-auto scrollbar-hide py-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  index === selectedIndex 
                    ? "border-purple shadow-lg scale-105" 
                    : `border-transparent opacity-60 hover:opacity-100`
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullGalleryModal;
