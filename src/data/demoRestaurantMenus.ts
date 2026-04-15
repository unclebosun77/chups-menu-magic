// Types for restaurant menus — data now comes exclusively from Supabase

export type DietaryTag = "spicy" | "veg" | "vegan" | "gluten-free" | "popular" | "chef-pick" | "sharing";

export interface DemoMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "starters" | "mains" | "sides" | "desserts" | "drinks" | "specials";
  image?: string;
  tags: DietaryTag[];
  available?: boolean;
  sold_out_today?: boolean;
}

export interface DemoRestaurant {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  city: string;
  priceLevel: string;
  description: string;
  vibe: string[];
  openingHours: Record<string, string>;
  signatureDishes: string[];
  logoUrl: string;
  heroImage: string;
  galleryImages: string[];
  galleryTheme: "light" | "dark";
  rating: number;
  distance: string;
  isOpen: boolean;
  menu: DemoMenuItem[];
  crowdLevel?: string | null;
  crowdUpdatedAt?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export const getTagEmoji = (tag: DietaryTag): string => {
  const emojis: Record<DietaryTag, string> = {
    spicy: "🌶️",
    veg: "🥬",
    vegan: "🌱",
    "gluten-free": "🌾",
    popular: "🔥",
    "chef-pick": "⭐",
    sharing: "👥",
  };
  return emojis[tag] || "";
};
