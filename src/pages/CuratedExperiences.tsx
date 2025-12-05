import { useNavigate } from "react-router-dom";
import { 
  Heart, Users, TrendingUp, Star, Globe, Coffee, ChefHat, 
  Gem, Award, Wallet, ArrowLeft, Sparkles
} from "lucide-react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useRef } from "react";

const CuratedExperiences = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll-based parallax effects
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 120], [0, -12]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.85]);
  const tilesY = useTransform(scrollY, [0, 120], [0, -6]);

  const featuredCollections = [
    {
      icon: Heart,
      title: "Date Night Spots",
      subtitle: "Romantic vibes",
      route: "/discover?vibe=date-night",
      featured: true,
    },
    {
      icon: TrendingUp,
      title: "Trending This Week",
      subtitle: "What's hot right now",
      route: "/discover?sort=trending",
      featured: true,
    },
  ];

  const allExperiences = [
    {
      icon: Users,
      title: "Group-Friendly",
      subtitle: "Perfect for friends",
      route: "/discover?vibe=groups",
    },
    {
      icon: Star,
      title: "Must-Try Menus",
      subtitle: "Exceptional flavors",
      route: "/discover?sort=rating",
    },
    {
      icon: Globe,
      title: "Around the World",
      subtitle: "Global cuisines",
      route: "/discover?vibe=international",
    },
    {
      icon: Coffee,
      title: "Cozy & Calm",
      subtitle: "Quiet retreats",
      route: "/discover?vibe=cozy",
    },
    {
      icon: ChefHat,
      title: "Chef Specials",
      subtitle: "Signature dishes",
      route: "/discover?vibe=chef-special",
    },
    {
      icon: Gem,
      title: "Hidden Gems",
      subtitle: "Local favorites",
      route: "/discover?vibe=hidden-gems",
    },
    {
      icon: Award,
      title: "Top Rated",
      subtitle: "Best reviewed",
      route: "/discover?sort=rating",
    },
    {
      icon: Wallet,
      title: "Budget-Friendly",
      subtitle: "Great value picks",
      route: "/discover?price=budget",
    },
  ];

  // Animation variants with proper typing
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 14,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 280,
        damping: 22,
      },
    },
  };

  // Stronger animations for featured collections
  const featuredItemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const iconVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.65,
      rotate: -10,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 18,
        delay: 0.12,
      },
    },
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 280,
        damping: 24,
      },
    },
  };

  const allExperiencesContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.45,
      },
    },
  };

  const tileVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 16,
      scale: 0.96,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="px-4 pb-28">
        {/* Header with Parallax */}
        <motion.div 
          className="pt-4 pb-6"
          style={{ y: headerY, opacity: headerOpacity }}
        >
          <motion.button
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.94 }}
            whileHover={{ x: -2 }}
            className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-[13px] font-medium">Back</span>
          </motion.button>
          
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <motion.div 
                className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple/10 to-purple/20 flex items-center justify-center shadow-[0_2px_6px_rgba(139,92,246,0.1)]"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 350, 
                  damping: 14,
                  delay: 0.2 
                }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Sparkles className="h-4 w-4 text-purple" strokeWidth={1.5} />
                </motion.div>
              </motion.div>
              <motion.h1 
                className="text-[22px] font-semibold text-foreground tracking-tight"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                Curated Experiences
              </motion.h1>
            </div>
            <motion.p 
              className="text-[13px] text-muted-foreground/55 font-light ml-[38px] tracking-wide"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.4 }}
            >
              Handpicked collections designed for your mood.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Featured Collections with stronger animations */}
        <motion.div 
          className="mt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-[14px] font-semibold text-foreground/80 tracking-tight mb-4"
            variants={itemVariants}
          >
            Featured Collections
          </motion.h2>
          
          <motion.div className="space-y-3">
            {featuredCollections.map((collection, index) => {
              const Icon = collection.icon;
              return (
                <motion.button
                  key={collection.title}
                  variants={featuredItemVariants}
                  whileHover={{ 
                    scale: 1.018,
                    y: -2,
                    boxShadow: "0 14px 36px -10px rgba(139,92,246,0.2), 0 6px 12px rgba(139,92,246,0.08)",
                  }}
                  whileTap={{ 
                    scale: 0.96,
                    boxShadow: "0 4px 12px -4px rgba(139,92,246,0.12), 0 2px 4px rgba(0,0,0,0.04)",
                  }}
                  onClick={() => navigate(collection.route)}
                  className="w-full relative flex items-center gap-4 p-5 bg-gradient-to-br from-card via-card to-secondary/50 border border-border/30 rounded-[22px] shadow-[0_6px_20px_-6px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.02)] hover:border-purple/25 transition-colors group overflow-hidden"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-purple/[0.02] via-transparent to-purple/[0.05] pointer-events-none" />
                  
                  {/* Shimmer effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-[22px] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 4,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Large icon capsule */}
                  <motion.div 
                    className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple/10 via-purple/12 to-purple/18 flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(139,92,246,0.15),inset_0_1px_2px_rgba(255,255,255,0.6)]"
                    variants={iconVariants}
                  >
                    <motion.div
                      whileHover={{ scale: 1.18, rotate: 6 }}
                      transition={{ type: "spring", stiffness: 400, damping: 14 }}
                    >
                      <Icon className="h-6 w-6 text-purple" strokeWidth={1.5} />
                    </motion.div>
                  </motion.div>
                  
                  {/* Text */}
                  <div className="relative flex-1 text-left">
                    <span className="text-[16px] font-semibold text-foreground tracking-tight">
                      {collection.title}
                    </span>
                    <span className="block text-[11px] text-muted-foreground/50 mt-1 font-light tracking-wide">
                      {collection.subtitle}
                    </span>
                  </div>
                  
                  {/* Arrow indicator */}
                  <motion.div 
                    className="relative w-8 h-8 rounded-full bg-purple/8 flex items-center justify-center group-hover:bg-purple/12 transition-colors"
                    whileHover={{ x: 4, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    <ArrowLeft className="h-4 w-4 text-purple/60 rotate-180" strokeWidth={1.5} />
                  </motion.div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* All Experiences with scroll-linked motion */}
        <motion.div 
          className="mt-10"
          initial="hidden"
          animate="visible"
          variants={allExperiencesContainerVariants}
          style={{ y: tilesY }}
        >
          <motion.h2 
            className="text-[14px] font-semibold text-foreground/80 tracking-tight mb-4"
            variants={itemVariants}
          >
            All Experiences
          </motion.h2>
          
          <motion.div className="grid grid-cols-2 gap-3">
            {allExperiences.map((experience, index) => {
              const Icon = experience.icon;
              return (
                <motion.button
                  key={experience.title}
                  variants={tileVariants}
                  whileHover={{ 
                    scale: 1.035,
                    y: -3,
                    boxShadow: "0 10px 28px -10px rgba(139,92,246,0.16), 0 4px 8px rgba(139,92,246,0.06)",
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    boxShadow: "0 2px 8px -2px rgba(0,0,0,0.08)",
                  }}
                  onClick={() => navigate(experience.route)}
                  className="relative flex flex-col items-start gap-3 p-4 bg-gradient-to-br from-card via-card to-secondary/35 border border-border/30 rounded-[18px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:border-purple/22 transition-colors group overflow-hidden"
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-purple/[0.015] via-transparent to-purple/[0.035] pointer-events-none" />
                  
                  {/* Icon capsule with entrance animation */}
                  <motion.div 
                    className="relative w-11 h-11 rounded-full bg-gradient-to-br from-purple/8 via-purple/10 to-purple/15 flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(139,92,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.5)]"
                    initial={{ scale: 0.7, opacity: 0, rotate: -15 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.55 + index * 0.06,
                      type: "spring",
                      stiffness: 380,
                      damping: 18,
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.22, rotate: 8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 14 }}
                    >
                      <Icon className="h-[18px] w-[18px] text-purple" strokeWidth={1.5} />
                    </motion.div>
                  </motion.div>
                  
                  {/* Text */}
                  <div className="relative flex flex-col items-start">
                    <span className="text-[13px] font-semibold text-foreground tracking-tight leading-tight">
                      {experience.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground/45 mt-1 font-light tracking-wide">
                      {experience.subtitle}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CuratedExperiences;
