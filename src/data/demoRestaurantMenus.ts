// Complete menu data for demo restaurants

export type DietaryTag = "spicy" | "veg" | "vegan" | "gluten-free" | "popular" | "chef-pick" | "sharing";

export interface DemoMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "starters" | "mains" | "sides" | "desserts" | "drinks" | "specials";
  image?: string;
  tags: DietaryTag[];
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
  rating: number;
  distance: string;
  isOpen: boolean;
  menu: DemoMenuItem[];
}

export const demoRestaurants: Record<string, DemoRestaurant> = {
  "yakoyo-demo": {
    id: "yakoyo-demo",
    name: "Yakoyo",
    cuisine: "Afro Fusion / Nigerian",
    address: "12 Bennetts Hill",
    city: "Birmingham B2 5RS",
    priceLevel: "££–£££",
    description: "Yakoyo celebrates West African cuisine with modern flair. Smoky spices, bold flavors, and nostalgic dishes reimagined in a contemporary dining space.",
    vibe: ["Warm", "Cultural", "Modern", "Vibrant"],
    openingHours: {
      "Mon–Thu": "12pm – 10pm",
      "Fri–Sat": "12pm – 11:30pm",
      "Sun": "1pm – 9pm"
    },
    signatureDishes: ["Smoked Jollof Risotto", "Fire-Grilled Suya Steak", "Yam Croquettes"],
    logoUrl: "/images/yakoyo-logo-new.png",
    heroImage: "/images/yakoyo-jollof-seafood.jpeg",
    rating: 4.8,
    distance: "1.2 km",
    isOpen: true,
    menu: [
      // Starters
      { id: "y-s1", name: "Yam Croquettes", description: "Golden crispy yam bites with spiced aioli", price: 9, category: "starters", tags: ["veg", "popular"], image: "/images/yakoyo-rice-peas-plantain.jpeg" },
      { id: "y-s2", name: "Pepper Soup (Goat)", description: "Traditional spicy broth with tender goat meat", price: 10, category: "starters", tags: ["spicy", "chef-pick"] },
      { id: "y-s3", name: "Pepper Soup (Fish)", description: "Aromatic fish broth with West African spices", price: 10, category: "starters", tags: ["spicy"] },
      { id: "y-s4", name: "Suya Spice Chicken Bites", description: "Grilled chicken in smoky suya spice blend", price: 8, category: "starters", tags: ["spicy", "popular"] },
      
      // Mains
      { id: "y-m1", name: "Smoked Jollof Risotto", description: "Signature fusion dish with smoky jollof flavors in creamy risotto", price: 15, category: "mains", tags: ["chef-pick", "popular"], image: "/images/yakoyo-jollof-seafood.jpeg" },
      { id: "y-m2", name: "Fire-Grilled Suya Steak", description: "Premium cut steak marinated in suya spices, chargrilled to perfection", price: 19, category: "mains", tags: ["spicy", "chef-pick"], image: "/images/yakoyo-grilled-fish.jpeg" },
      { id: "y-m3", name: "Ofada Bowl with Ayamase", description: "Local rice with spicy green pepper sauce", price: 14, category: "mains", tags: ["spicy", "veg"] },
      { id: "y-m4", name: "Egusi Cream Pasta", description: "Fusion pasta with rich egusi cream sauce", price: 16, category: "mains", tags: ["chef-pick"] },
      
      // Sides
      { id: "y-si1", name: "Fried Plantain", description: "Sweet caramelized plantain slices", price: 5, category: "sides", tags: ["veg", "vegan", "gluten-free"] },
      { id: "y-si2", name: "Jollof Rice", description: "Classic smoky party jollof", price: 5, category: "sides", tags: ["veg", "popular"] },
      { id: "y-si3", name: "Suya Fries", description: "Crispy fries dusted with suya spice", price: 6, category: "sides", tags: ["spicy", "veg"] },
      
      // Desserts
      { id: "y-d1", name: "Puff-Puff with Caramel Drizzle", description: "Nigerian doughnuts with sweet caramel sauce", price: 7, category: "desserts", tags: ["popular", "sharing"] },
      { id: "y-d2", name: "Zobo Sorbet", description: "Refreshing hibiscus flower sorbet", price: 6, category: "desserts", tags: ["vegan", "gluten-free"] },
      
      // Drinks
      { id: "y-dr1", name: "Palm Wine Sangria", description: "Traditional palm wine with fresh fruits", price: 8, category: "drinks", tags: ["chef-pick", "popular"] },
      { id: "y-dr2", name: "Chapman Cocktail", description: "Nigeria's favorite non-alcoholic drink", price: 7, category: "drinks", tags: ["popular"] },
      { id: "y-dr3", name: "Zobo Cooler", description: "Chilled hibiscus tea with ginger", price: 4, category: "drinks", tags: ["vegan"] },
      
      // Specials
      { id: "y-sp1", name: "Yakoyo Sharing Platter", description: "Selection of starters perfect for the table", price: 28, category: "specials", tags: ["sharing", "popular"] },
    ]
  },
  "cosby-demo": {
    id: "cosby-demo",
    name: "Cosby",
    cuisine: "Modern Italian",
    address: "38 Temple Street",
    city: "Birmingham B2 5DP",
    priceLevel: "£££",
    description: "Modern Italian cuisine made with seasonal British produce. Expect refined pasta, delicate plating, and a warm, intimate atmosphere inspired by Milan's boutique dining scene.",
    vibe: ["Romantic", "Elegant", "Boutique Italian", "Low Lighting"],
    openingHours: {
      "Tue–Thu": "12pm – 10pm",
      "Fri–Sat": "12pm – 11pm",
      "Sun": "1pm – 8pm",
      "Mon": "Closed"
    },
    signatureDishes: ["Truffle Butter Tagliatelle", "Heritage Tomato Burrata", "Lemon Parmigiano Risotto"],
    logoUrl: "/images/cosby-logo.png",
    heroImage: "/images/yakoyo-grilled-fish.jpeg",
    rating: 4.9,
    distance: "0.8 km",
    isOpen: true,
    menu: [
      // Starters
      { id: "c-s1", name: "Burrata & Tomato", description: "Creamy burrata with heritage tomatoes and basil oil", price: 12, category: "starters", tags: ["veg", "chef-pick", "popular"] },
      { id: "c-s2", name: "Arancini al Tartufo", description: "Truffle-infused risotto balls with parmesan", price: 10, category: "starters", tags: ["veg"] },
      { id: "c-s3", name: "Bruschetta Classica", description: "Toasted ciabatta with vine tomatoes and garlic", price: 8, category: "starters", tags: ["veg", "vegan"] },
      
      // Mains
      { id: "c-m1", name: "Truffle Tagliatelle", description: "Fresh pasta ribbons with black truffle butter and parmesan", price: 18, category: "mains", tags: ["veg", "chef-pick", "popular"] },
      { id: "c-m2", name: "Pappardelle Bolognese", description: "Slow-cooked beef ragù with wide ribbon pasta", price: 17, category: "mains", tags: ["popular"] },
      { id: "c-m3", name: "Seabass Fillet", description: "Pan-seared seabass with lemon oil and capers", price: 22, category: "mains", tags: ["gluten-free", "chef-pick"] },
      { id: "c-m4", name: "Lemon Parmigiano Risotto", description: "Creamy arborio rice with aged parmesan and lemon zest", price: 17, category: "mains", tags: ["veg", "gluten-free"] },
      
      // Sides
      { id: "c-si1", name: "Garlic Parmesan Fries", description: "Crispy fries with garlic butter and parmesan", price: 5, category: "sides", tags: ["veg"] },
      { id: "c-si2", name: "Rosemary Potatoes", description: "Roasted baby potatoes with fresh rosemary", price: 5, category: "sides", tags: ["veg", "vegan", "gluten-free"] },
      { id: "c-si3", name: "Seasonal Greens", description: "Sautéed vegetables with olive oil", price: 6, category: "sides", tags: ["veg", "vegan", "gluten-free"] },
      
      // Desserts
      { id: "c-d1", name: "Pistachio Tiramisu", description: "Classic tiramisu with pistachio cream layers", price: 9, category: "desserts", tags: ["veg", "chef-pick", "popular"] },
      { id: "c-d2", name: "Panna Cotta al Limone", description: "Silky lemon panna cotta with berry compote", price: 8, category: "desserts", tags: ["veg", "gluten-free"] },
      { id: "c-d3", name: "Affogato", description: "Vanilla gelato drowned in espresso", price: 6, category: "desserts", tags: ["veg", "gluten-free"] },
      
      // Drinks
      { id: "c-dr1", name: "House Red Wine", description: "Carefully selected Italian red by the glass", price: 8, category: "drinks", tags: ["popular"] },
      { id: "c-dr2", name: "Aperol Spritz", description: "Classic Italian aperitivo cocktail", price: 9, category: "drinks", tags: ["popular", "chef-pick"] },
      { id: "c-dr3", name: "San Pellegrino", description: "Sparkling mineral water", price: 3, category: "drinks", tags: [] },
      { id: "c-dr4", name: "Limoncello", description: "Traditional Italian lemon liqueur", price: 7, category: "drinks", tags: [] },
      
      // Specials
      { id: "c-sp1", name: "Chef's Tasting Menu", description: "5-course journey through Italian flavors", price: 55, category: "specials", tags: ["chef-pick", "sharing"] },
    ]
  }
};

export const getTagEmoji = (tag: DietaryTag): string => {
  const emojis: Record<DietaryTag, string> = {
    spicy: "🌶️",
    veg: "🥬",
    vegan: "🌱",
    "gluten-free": "🌾",
    popular: "⭐",
    "chef-pick": "👨‍🍳",
    sharing: "🍽️"
  };
  return emojis[tag];
};

export const getTagLabel = (tag: DietaryTag): string => {
  const labels: Record<DietaryTag, string> = {
    spicy: "Spicy",
    veg: "Vegetarian",
    vegan: "Vegan",
    "gluten-free": "GF",
    popular: "Popular",
    "chef-pick": "Chef's Pick",
    sharing: "Great for Sharing"
  };
  return labels[tag];
};
