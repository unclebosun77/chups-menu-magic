// Restaurant images from public folder

export const personalizedRestaurants = [
  {
    id: "yakoyo-demo",
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
    id: "cosby-demo",
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
    imageUrl: "/images/yakoyo-grilled-fish.jpeg",
    openingHours: {
      "Tue–Thu": "12pm – 10pm",
      "Fri–Sat": "12pm – 11pm",
      "Sun": "1pm – 8pm",
      "Mon": "Closed"
    },
    signatureDishes: ["Truffle Tagliatelle", "Burrata & Tomato", "Lemon Parmigiano Risotto"]
  }
];
