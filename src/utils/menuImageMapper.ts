// Import all menu images
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

// Map of filenames to imported images
const imageMap: Record<string, string> = {
  'chicken-ramen.jpg': chickenRamen,
  'fried-rice-egg.jpg': friedRiceEgg,
  'golden-dumplings.jpg': goldenDumplings,
  'grilled-wings.jpg': grilledWings,
  'noodles-pickled.jpg': noodlesPickled,
  'pasta-vegetables.jpg': pastaVegetables,
  'rice-platter.jpg': ricePlatter,
  'spiced-chicken-rice.jpg': spicedChickenRice,
  'spicy-pasta-chicken.jpg': spicyPastaChicken,
  'thai-omelet-noodles.jpg': thaiOmeletNoodles,
};

/**
 * Maps a database image URL to the actual imported image
 * Handles paths like "/src/assets/menu/chicken-ramen.jpg" or URLs from Supabase storage
 */
export const getMenuImage = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;
  
  // If it's already a full URL (e.g., from Supabase storage), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Extract filename from path
  const filename = imageUrl.split('/').pop();
  
  if (filename && imageMap[filename]) {
    return imageMap[filename];
  }
  
  // Fallback: return the original URL
  return imageUrl;
};
