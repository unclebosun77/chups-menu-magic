// Restaurant images - using generated images
import cosbyBurrataTomato from "@/assets/menu/cosby-burrata-tomato.jpg";
import proxGreenCurry from "@/assets/menu/prox-green-curry.jpg";

// Using Supabase UUIDs as canonical IDs for consistency across the app
export const personalizedRestaurants = [
  {
    id: "8179401a-d2c5-4561-98ae-2010b561d477", // Yakoyo Supabase UUID
    name: "Yakoyo",
    cuisine: "Afro Fusion",
    address: "12 Bennetts Hill, Birmingham City Centre, B2 5RS",
    description: "Yakoyo brings bold West African flavors into a modern dining setting. Smoky spices, nostalgic aromas, and refined Afro-fusion plates.",
    ambience: ["Warm", "Cultural", "Modern", "Vibrant nights"],
    priceLevel: "££–£££",
    matchScore: 92,
    aiReason: "Picked because you browse Afro restaurants often.",
    isOpen: true,
    distance: "1.2 km",
    rating: 4.8,
    logoUrl: "/images/yakoyo-logo-new.png",
    imageUrl: "/images/yakoyo-jollof-seafood.jpeg",
    openingHours: {
      "Mon–Thu": "12pm – 10pm",
      "Fri–Sat": "12pm – 11:30pm",
      "Sun": "1pm – 9pm"
    },
    signatureDishes: ["Smoked Jollof Risotto", "Fire-Grilled Suya Steak", "Yam Croquettes"]
  },
  {
    id: "3a798457-b065-44c9-b7d4-9c05910e8593", // Cosby Supabase UUID
    name: "Cosby",
    cuisine: "Modern Italian",
    address: "38 Temple Street, Birmingham City Centre, B2 5DP",
    description: "Cosby blends contemporary Italian cuisine with seasonal British ingredients. Refined dishes, intimate atmosphere, exceptional plating.",
    ambience: ["Elegant", "Romantic", "Soft lighting", "Boutique"],
    priceLevel: "£££",
    matchScore: 89,
    aiReason: "Recommended because you showed interest in Italian fine dining.",
    isOpen: true,
    distance: "0.8 km",
    rating: 4.9,
    logoUrl: "/images/cosby-logo.png",
    imageUrl: cosbyBurrataTomato,
    openingHours: {
      "Tue–Thu": "12pm – 10pm",
      "Fri–Sat": "12pm – 11pm",
      "Sun": "1pm – 8pm",
      "Mon": "Closed"
    },
    signatureDishes: ["Truffle Tagliatelle", "Burrata & Tomato", "Lemon Parmigiano Risotto"]
  },
  {
    id: "4b1ee37b-9053-4523-b610-eabb8a059712", // The Prox Supabase UUID
    name: "The Prox",
    cuisine: "Premium Thai",
    address: "24 Colmore Row, Birmingham City Centre, B3 2QE",
    description: "Authentic Thai flavors with a premium twist. Rich curries, fresh herbs, and traditional recipes crafted with care.",
    ambience: ["Cozy", "Authentic", "Aromatic", "Premium"],
    priceLevel: "££–£££",
    matchScore: 85,
    aiReason: "Suggested for your love of Asian cuisine.",
    isOpen: true,
    distance: "1.5 km",
    rating: 4.7,
    logoUrl: "/the-prox-logo.png",
    imageUrl: proxGreenCurry,
    openingHours: {
      "Mon–Thu": "12pm – 10pm",
      "Fri–Sat": "12pm – 11pm",
      "Sun": "1pm – 9pm"
    },
    signatureDishes: ["Green Curry", "Pad Thai", "Mango Sticky Rice"]
  }
];
