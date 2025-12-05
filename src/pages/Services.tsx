import { useNavigate } from "react-router-dom";
import { 
  Sparkles, MapPin, UtensilsCrossed, Bookmark, Settings, ChevronRight,
  Heart, Users, TrendingUp, Globe, Star
} from "lucide-react";
import { motion, Variants } from "framer-motion";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Sparkles,
      title: "Ask Outa",
      subtitle: "Your AI dining assistant.",
      route: "/ai-assistant",
    },
    {
      icon: MapPin,
      title: "Your Next Spot",
      subtitle: "A personalized pick chosen for you.",
      route: "/your-next-spot",
    },
    {
      icon: UtensilsCrossed,
      title: "Discover Restaurants",
      subtitle: "Explore top restaurants around you.",
      route: "/discover",
    },
    {
      icon: Star,
      title: "Explore Menus & Profiles",
      subtitle: "See menus, galleries, and restaurant details.",
      route: "/restaurant/yakoyo-demo",
    },
    {
      icon: Bookmark,
      title: "Saved Restaurants",
      subtitle: "Your favourite places in one place.",
      route: "/activity",
    },
    {
      icon: Settings,
      title: "Preferences",
      subtitle: "Tell Outa what you like.",
      route: "/account",
    },
  ];

  const curatedExperiences = [
    {
      icon: Heart,
      label: "Date Night Spots",
      subtitle: "Romantic vibes",
      route: "/curated-experiences",
    },
    {
      icon: Users,
      label: "Group-Friendly",
      subtitle: "Perfect for friends",
      route: "/curated-experiences",
    },
    {
      icon: TrendingUp,
      label: "Trending Now",
      subtitle: "What's hot this week",
      route: "/curated-experiences",
    },
    {
      icon: Globe,
      label: "World Flavors",
      subtitle: "Global cuisines",
      route: "/curated-experiences",
    },
  ];

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
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

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 14,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 320,
        damping: 26,
      },
    },
  };

  const iconVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.75,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 18,
        delay: 0.08,
      },
    },
  };

  const tileVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 12,
      scale: 0.97,
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

  const curatedContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.35,
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="px-4 pb-28">
        {/* Header with entrance animation */}
        <motion.div 
          className="pt-8 pb-6"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-xl font-semibold text-foreground tracking-tight"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            Services
          </motion.h1>
          <motion.p 
            className="text-[13px] text-muted-foreground/60 mt-1.5 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            Everything Outa offers, beautifully organized.
          </motion.p>
        </motion.div>

        {/* Services List with staggered animations */}
        <motion.div 
          className="space-y-2.5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.button
                key={service.title}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.015,
                  boxShadow: "0 4px 16px -4px rgba(139,92,246,0.12)",
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(service.route)}
                className="w-full flex items-center gap-4 p-4 bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:border-purple/25 transition-colors group"
              >
                <motion.div 
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple/8 to-purple/15 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
                  variants={iconVariants}
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Icon className="h-[17px] w-[17px] text-purple" strokeWidth={1.5} />
                  </motion.div>
                </motion.div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-medium text-foreground tracking-tight">{service.title}</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5 font-light">{service.subtitle}</p>
                </div>
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-purple/50 transition-colors" strokeWidth={1.5} />
                </motion.div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Curated Experiences Preview - Premium Design */}
        <motion.div 
          className="mt-12"
          variants={curatedContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="mb-6"
            variants={headerVariants}
          >
            <div className="flex items-center gap-2.5">
              <motion.div 
                className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple/10 to-purple/20 flex items-center justify-center shadow-[0_1px_3px_rgba(139,92,246,0.1)]"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 15,
                  delay: 0.4 
                }}
              >
                <Sparkles className="h-3.5 w-3.5 text-purple" strokeWidth={1.5} />
              </motion.div>
              <motion.h2 
                className="text-[17px] font-semibold text-foreground tracking-tight"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.35 }}
              >
                Curated Experiences
              </motion.h2>
            </div>
            <motion.p 
              className="text-[12px] text-muted-foreground/50 mt-2.5 ml-[34px] font-light tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.35 }}
            >
              Handpicked collections for every mood
            </motion.p>
          </motion.div>

          {/* Premium Tile Grid */}
          <motion.div className="grid grid-cols-2 gap-3.5">
            {curatedExperiences.map((experience, index) => {
              const Icon = experience.icon;
              return (
                <motion.button
                  key={experience.label}
                  variants={tileVariants}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 8px 24px -8px rgba(139,92,246,0.15), 0 2px 6px rgba(139,92,246,0.06)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(experience.route)}
                  className="relative flex flex-col items-start gap-3 p-4 bg-gradient-to-br from-card via-card to-secondary/40 border border-border/30 rounded-[20px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)] hover:border-purple/25 transition-colors group"
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-purple/[0.02] via-transparent to-purple/[0.04] pointer-events-none" />
                  
                  {/* Icon in circular capsule */}
                  <motion.div 
                    className="relative w-11 h-11 rounded-full bg-gradient-to-br from-purple/8 via-purple/10 to-purple/16 flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(139,92,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.6)]"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.5 + index * 0.06,
                      type: "spring",
                      stiffness: 400,
                      damping: 18,
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Icon className="h-[18px] w-[18px] text-purple" strokeWidth={1.5} />
                    </motion.div>
                  </motion.div>
                  
                  {/* Text content */}
                  <div className="relative flex flex-col items-start">
                    <span className="text-[13px] font-semibold text-foreground tracking-tight leading-tight">
                      {experience.label}
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

export default Services;
