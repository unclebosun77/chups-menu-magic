interface Restaurant {
  id?: string;
  name?: string;
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
  city?: string | null;
}

interface RestaurantMapProps {
  restaurant: Restaurant;
}

const RestaurantMap = ({ restaurant }: RestaurantMapProps) => {
  const lat = restaurant.latitude;
  const lng = restaurant.longitude;
  const addressQuery = [restaurant.address, restaurant.city].filter(Boolean).join(", ");

  if (lat == null || lng == null) {
    return (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full shadow border border-border/40"
      >
        Get directions →
      </a>
    );
  }

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008},${lat - 0.008},${lng + 0.008},${lat + 0.008}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border/40" style={{ height: "160px" }}>
      <iframe src={mapSrc} className="w-full h-full" style={{ border: 0 }} loading="lazy" title="Map" />
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5"
      >
        Get directions →
      </a>
    </div>
  );
};

export default RestaurantMap;
