// Import dish images
import chickenRamen from '@/assets/menu/chicken-ramen.jpg';
import friedRiceEgg from '@/assets/menu/fried-rice-egg.jpg';
import goldenDumplings from '@/assets/menu/golden-dumplings.jpg';
import grilledWings from '@/assets/menu/grilled-wings.jpg';
import noodlesPickled from '@/assets/menu/noodles-pickled.jpg';
import pastaVegetables from '@/assets/menu/pasta-vegetables.jpg';
import ricePlatter from '@/assets/menu/rice-platter.jpg';
import spicedChickenRice from '@/assets/menu/spiced-chicken-rice.jpg';
import spicyPastaChicken from '@/assets/menu/spicy-pasta-chicken.jpg';
import thaiOmeletNoodles from '@/assets/menu/thai-omelet-noodles.jpg';

export type DishCategory = "All" | "Nigerian" | "Italian" | "Asian" | "Fast Food" | "Breakfast" | "Desserts" | "Grill";

export const dishCategories: DishCategory[] = [
  "All",
  "Nigerian", 
  "Italian",
  "Asian",
  "Fast Food",
  "Breakfast",
  "Desserts",
  "Grill"
];

// Restaurant mapping - these IDs should match your actual restaurant IDs
// For demo purposes, using placeholder IDs
const restaurants = {
  yakoyo: { id: "yakoyo-demo", name: "Yakoyo" },
  cosby: { id: "cosby-demo", name: "Cosby" },
  theProx: { id: "the-prox-demo", name: "The Prox" },
};

export const seedDishes = [
  {
    id: "jollof-rice",
    name: "Jollof Rice",
    image: ricePlatter,
    category: "Nigerian",
    restaurants: [restaurants.yakoyo],
    aiSuggested: true,
  },
  {
    id: "suya",
    name: "Grilled Suya",
    image: grilledWings,
    category: "Nigerian",
    restaurants: [restaurants.yakoyo],
    aiSuggested: false,
  },
  {
    id: "pasta-alfredo",
    name: "Pasta Alfredo",
    image: pastaVegetables,
    category: "Italian",
    restaurants: [restaurants.cosby],
    aiSuggested: true,
  },
  {
    id: "spicy-pasta",
    name: "Spicy Chicken Pasta",
    image: spicyPastaChicken,
    category: "Italian",
    restaurants: [restaurants.cosby],
    aiSuggested: false,
  },
  {
    id: "ramen",
    name: "Chicken Ramen",
    image: chickenRamen,
    category: "Asian",
    restaurants: [restaurants.theProx],
    aiSuggested: true,
  },
  {
    id: "thai-curry",
    name: "Thai Green Curry",
    image: thaiOmeletNoodles,
    category: "Asian",
    restaurants: [restaurants.theProx],
    aiSuggested: false,
  },
  {
    id: "golden-dumplings",
    name: "Golden Dumplings",
    image: goldenDumplings,
    category: "Asian",
    restaurants: [restaurants.theProx, restaurants.cosby],
    aiSuggested: true,
  },
  {
    id: "fried-rice",
    name: "Fried Rice",
    image: friedRiceEgg,
    category: "Asian",
    restaurants: [restaurants.theProx, restaurants.yakoyo],
    aiSuggested: false,
  },
  {
    id: "spiced-rice",
    name: "Spiced Chicken & Rice",
    image: spicedChickenRice,
    category: "Nigerian",
    restaurants: [restaurants.yakoyo],
    aiSuggested: true,
  },
  {
    id: "noodles",
    name: "Pickled Noodles",
    image: noodlesPickled,
    category: "Asian",
    restaurants: [restaurants.theProx],
    aiSuggested: false,
  },
];
