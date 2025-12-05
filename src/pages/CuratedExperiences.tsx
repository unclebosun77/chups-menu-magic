import { 
  Heart, Users, TrendingUp, Globe, Star, ChevronLeft, UtensilsCrossed, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";

const CuratedExperiences = () => {
  const navigate = useNavigate();

  const collections = [
    {
      id: "date-night",
      icon: Heart,
      title: "Date Night Spots",
      description: "Romantic restaurants perfect for an intimate evening",
      color: "from-pink-500/20 to-rose-500/20",
      restaurants: personalizedRestaurants.filter(r => 
        r.ambience?.some(a => a.toLowerCase().includes("romantic") || a.toLowerCase().includes("elegant"))
      ).slice(0, 3),
    },
    {
      id: "group-friendly",
      icon: Users,
      title: "Group-Friendly Places",
      description: "Great spots for parties, gatherings, and celebrations",
      color: "from-blue-500/20 to-cyan-500/20",
      restaurants: personalizedRestaurants.filter(r => 
        r.ambience?.some(a => a.toLowerCase().includes("vibrant") || a.toLowerCase().includes("lively"))
      ).slice(0, 3),
    },
    {
      id: "trending",
      icon: TrendingUp,
      title: "Trending This Week",
      description: "What's hot and popular right now",
      color: "from-orange-500/20 to-amber-500/20",
      restaurants: [...personalizedRestaurants].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 3),
    },
    {
      id: "must-try",
      icon: UtensilsCrossed,
      title: "Must-Try Menus",
      description: "Exceptional dining experiences you shouldn't miss",
      color: "from-green-500/20 to-emerald-500/20",
      restaurants: personalizedRestaurants.filter(r => r.rating && r.rating >= 4.5).slice(0, 3),
    },
    {
      id: "around-world",
      icon: Globe,
      title: "Around The World",
      description: "Explore diverse cuisines from different cultures",
      color: "from-purple-500/20 to-violet-500/20",
      restaurants: personalizedRestaurants.slice(0, 4),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Curated Experiences</h1>
            <p className="text-xs text-muted-foreground">Hand-picked collections for every occasion</p>
          </div>
        </div>
      </div>

      {/* Collections */}
      <div className="px-4 py-6 space-y-8 pb-24">
        {collections.map((collection) => (
          <section key={collection.id} className="space-y-4">
            {/* Collection Header */}
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${collection.color}`}>
                <collection.icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">{collection.title}</h2>
                <p className="text-sm text-muted-foreground">{collection.description}</p>
              </div>
            </div>

            {/* Restaurant Cards */}
            <div className="overflow-x-auto -mx-4 px-4">
              <div className="flex gap-4" style={{ width: 'max-content' }}>
                {collection.restaurants.length > 0 ? (
                  collection.restaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={{
                        id: restaurant.id,
                        name: restaurant.name,
                        cuisine: restaurant.cuisine,
                        rating: restaurant.rating,
                        price_level: restaurant.priceLevel,
                        description: restaurant.description,
                        imageUrl: restaurant.imageUrl,
                        logoUrl: restaurant.logoUrl,
                      }}
                    />
                  ))
                ) : (
                  <div className="w-full py-8 text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No restaurants in this collection yet</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default CuratedExperiences;