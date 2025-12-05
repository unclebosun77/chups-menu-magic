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
  
  // Parallax scroll effect
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 150], [0, -30]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.6]);

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
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 12,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const featuredItemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 18,
      scale: 0.96,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 280,
        damping: 22,
      },
    },
  };

  const iconVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.7,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      },
    },
  };

  const allExperiencesContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.4,
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
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.95 }}
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
                  stiffness: 400, 
                  damping: 15,
                  delay: 0.2 
                }}
              >
                <Sparkles className="h-4 w-4 text-purple" strokeWidth={1.5} />
              </motion.div>
              <motion.h1 
                className="text-[22px] font-semibold text-foreground tracking-tight"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                Curated Experiences
              </motion.h1>
            </div>
            <motion.p 
              className="text-[13px] text-muted-foreground/55 font-light ml-[38px] tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Handpicked collections designed for your mood.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Featured Collections */}
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
            {featuredCollections.map((collection) => {
              const Icon = collection.icon;
              return (
                <motion.button
                  key={collection.title}
                  variants={featuredItemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 12px 32px -8px rgba(139,92,246,0.18), 0 4px 8px rgba(139,92,246,0.06)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(collection.route)}
                  className="w-full relative flex items-center gap-4 p-5 bg-gradient-to-br from-card via-card to-secondary/50 border border-border/30 rounded-[22px] shadow-[0_6px_20px_-6px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.02)] hover:border-purple/25 transition-colors group"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-purple/[0.02] via-transparent to-purple/[0.05] pointer-events-none" />
                  
                  {/* Large icon capsule */}
                  <motion.div 
                    className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple/10 via-purple/12 to-purple/18 flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(139,92,246,0.15),inset_0_1px_2px_rgba(255,255,255,0.6)]"
                    variants={iconVariants}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
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
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <ArrowLeft className="h-4 w-4 text-purple/60 rotate-180" strokeWidth={1.5} />
                  </motion.div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* All Experiences */}
        <motion.div 
          className="mt-10"
          initial="hidden"
          animate="visible"
          variants={allExperiencesContainerVariants}
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
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 8px 24px -8px rgba(139,92,246,0.14), 0 2px 6px rgba(139,92,246,0.05)",
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(experience.route)}
                  className="relative flex flex-col items-start gap-3 p-4 bg-gradient-to-br from-card via-card to-secondary/35 border border-border/30 rounded-[18px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:border-purple/22 transition-colors group"
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-purple/[0.015] via-transparent to-purple/[0.035] pointer-events-none" />
                  
                  {/* Icon capsule */}
                  <motion.div 
                    className="relative w-11 h-11 rounded-full bg-gradient-to-br from-purple/8 via-purple/10 to-purple/15 flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(139,92,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.5)]"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.5 + index * 0.05,
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
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
