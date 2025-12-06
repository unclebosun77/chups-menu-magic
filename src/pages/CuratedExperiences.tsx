import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, Users, TrendingUp, Star, Globe, Coffee, ChefHat, 
  Gem, Award, Wallet, ArrowLeft, Sparkles, Crown, Flame,
  Utensils, Wine, Music, MapPin
} from "lucide-react";
import ExperienceCard from "@/components/services/ExperienceCard";
import FilterChip from "@/components/services/FilterChip";

const CuratedExperiences = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  // Filter categories
  const filters = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "romantic", label: "Romantic", icon: Heart },
    { id: "nightlife", label: "Nightlife", icon: Music },
    { id: "fine-dining", label: "Fine Dining", icon: Wine },
    { id: "budget", label: "Budget Friendly", icon: Wallet },
    { id: "groups", label: "Group Friendly", icon: Users },
    { id: "vip", label: "VIP Experiences", icon: Crown },
    { id: "hidden", label: "Hidden Gems", icon: Gem },
  ];

  // Spotlight cards
  const spotlightCards = [
    {
      icon: Crown,
      badge: "Editor's Pick",
      title: "This Week's Spotlight",
      subtitle: "Outa's handpicked favourites you'll love",
      route: "/discover?sort=featured",
      tags: ["Featured", "Premium", "Top Rated"],
      distance: "Various locations",
    },
    {
      icon: Flame,
      badge: "Hot Right Now",
      title: "Trending Restaurants",
      subtitle: "Everyone's talking about these spots",
      route: "/discover?sort=trending",
      tags: ["Trending", "Popular", "Must-Try"],
      distance: "Near you",
    },
  ];

  // Featured collections
  const featuredCollections = [
    {
      icon: Heart,
      title: "Date Night Spots",
      subtitle: "Romantic vibes, intimate settings — for just you two 💜",
      route: "/discover?vibe=date-night",
      tags: ["Romantic", "Intimate", "Cozy"],
    },
    {
      icon: TrendingUp,
      title: "Can't-Miss Menus",
      subtitle: "Trending dishes & top-rated plates you need to try",
      route: "/discover?sort=trending",
      tags: ["Trending", "Popular", "Top Dishes"],
    },
  ];

  // All experiences
  const allExperiences = [
    {
      icon: Users,
      title: "Group-Friendly",
      subtitle: "Perfect nights with friends",
      route: "/discover?vibe=groups",
      distance: "10+ spots nearby",
    },
    {
      icon: Star,
      title: "Must-Try Menus",
      subtitle: "Exceptional flavours await",
      route: "/discover?sort=rating",
      distance: "Top rated",
    },
    {
      icon: Globe,
      title: "World Flavors",
      subtitle: "Explore global cuisines",
      route: "/discover?vibe=international",
      distance: "15+ cuisines",
    },
    {
      icon: Coffee,
      title: "Cozy & Calm",
      subtitle: "Quiet retreats nearby",
      route: "/discover?vibe=cozy",
      distance: "Perfect for work",
    },
    {
      icon: ChefHat,
      title: "Chef Specials",
      subtitle: "Signature dishes to discover",
      route: "/discover?vibe=chef-special",
      distance: "Chef's picks",
    },
    {
      icon: Gem,
      title: "Hidden Gems",
      subtitle: "Local favourites uncovered",
      route: "/discover?vibe=hidden-gems",
      distance: "Local secrets",
    },
    {
      icon: Award,
      title: "Top Rated",
      subtitle: "Best reviewed spots",
      route: "/discover?sort=rating",
      distance: "4.5+ rating",
    },
    {
      icon: Wallet,
      title: "Budget-Friendly",
      subtitle: "Great value picks",
      route: "/discover?price=budget",
      distance: "Under £20/person",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-purple/5">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 -left-24 w-56 h-56 bg-purple/12 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-24 w-72 h-72 bg-neon-pink/8 rounded-full blur-3xl" />
        <div className="absolute bottom-48 left-1/3 w-48 h-48 bg-purple/6 rounded-full blur-2xl" />
      </div>

      <div className="relative px-4 pb-28">
        {/* Header */}
        <div className="pt-4 pb-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-foreground transition-colors mb-4 -ml-1 animate-fade-in"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-[12px] font-medium">Back</span>
          </button>
          
          <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple/25 via-purple/15 to-neon-pink/10 flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(139,92,246,0.35),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-purple/20">
                  <Sparkles className="h-5 w-5 text-purple" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-neon-pink to-purple animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
              </div>
              <div className="flex-1">
                <h1 className="text-[26px] font-bold text-foreground tracking-tight leading-tight">
                  Curated Experiences
                </h1>
                <p className="text-[13px] text-muted-foreground/60 mt-1.5 font-light tracking-wide leading-relaxed">
                  Handpicked collections designed for your mood & moment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Chips - Horizontal Scroll */}
        <div className="mb-6 -mx-4 px-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <FilterChip
                key={filter.id}
                label={filter.label}
                icon={filter.icon}
                isActive={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
                variant="glow"
              />
            ))}
          </div>
        </div>

        {/* Spotlight Section */}
        <section className="mb-8">
          <h2 className="text-[11px] font-semibold text-purple/70 tracking-widest uppercase mb-4 ml-1 flex items-center gap-2 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <Sparkles className="h-3 w-3" />
            Outa Spotlight
          </h2>
          
          <div className="space-y-3">
            {spotlightCards.map((card, index) => (
              <ExperienceCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                subtitle={card.subtitle}
                route={card.route}
                tags={card.tags}
                distance={card.distance}
                badge={card.badge}
                variant="featured"
                delay={200 + index * 100}
              />
            ))}
          </div>
        </section>

        {/* Featured Collections */}
        <section className="mb-8">
          <h2 className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase mb-4 ml-1 animate-fade-in" style={{ animationDelay: '400ms' }}>
            Featured Collections
          </h2>
          
          <div className="space-y-3">
            {featuredCollections.map((collection, index) => (
              <ExperienceCard
                key={collection.title}
                icon={collection.icon}
                title={collection.title}
                subtitle={collection.subtitle}
                route={collection.route}
                tags={collection.tags}
                variant="horizontal"
                delay={450 + index * 80}
              />
            ))}
          </div>
        </section>

        {/* All Experiences Grid */}
        <section className="mt-8">
          <h2 className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase mb-4 ml-1 animate-fade-in" style={{ animationDelay: '600ms' }}>
            Explore All
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {allExperiences.map((experience, index) => (
              <ExperienceCard
                key={experience.title}
                icon={experience.icon}
                title={experience.title}
                subtitle={experience.subtitle}
                route={experience.route}
                distance={experience.distance}
                variant="grid"
                delay={650 + index * 50}
              />
            ))}
          </div>
        </section>

        {/* Emotional Footer */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '1000ms' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple/5 border border-purple/10">
            <Sparkles className="h-3.5 w-3.5 text-purple/60" />
            <p className="text-[11px] text-muted-foreground/50 font-light tracking-wide">
              Because your taste says elegance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratedExperiences;
