import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

interface RestaurantMapProps {
  restaurants: Restaurant[];
}

const RestaurantMap = ({ restaurants }: RestaurantMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [needsToken, setNeedsToken] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // For demo purposes, using a placeholder token message
    // In production, this would come from environment variables
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!token) {
      setNeedsToken(true);
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-74.006, 40.7128], // Default to NYC
      zoom: 12,
    });

    // Add markers for restaurants with coordinates
    restaurants
      .filter((r) => r.latitude && r.longitude)
      .forEach((restaurant) => {
        if (map.current && restaurant.latitude && restaurant.longitude) {
          const marker = new mapboxgl.Marker({ color: "#FF6B35" })
            .setLngLat([restaurant.longitude, restaurant.latitude])
            .setPopup(
              new mapboxgl.Popup().setHTML(`<h3>${restaurant.name}</h3>`)
            )
            .addTo(map.current);
        }
      });

    return () => {
      map.current?.remove();
    };
  }, [restaurants]);

  if (needsToken) {
    return (
      <Card className="h-64 flex items-center justify-center bg-gradient-to-br from-primary/10 to-purple/5 border-2 border-dashed">
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Map preview coming soon 🗺️
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg">
      <div ref={mapContainer} className="h-64 w-full" />
    </div>
  );
};

export default RestaurantMap;
