import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { ArrowLeft, Sparkles } from "lucide-react";

import cosbyPasta from "@/assets/menu/cosby-truffle-tagliatelle.jpg";
import cosbyBurrata from "@/assets/menu/cosby-burrata-tomato.jpg";
import yakoyoJollof from "@/assets/menu/yakoyo-jollof-rice.jpg";
import yakoyoSuya from "@/assets/menu/yakoyo-grilled-suya.jpg";
import proxPadThai from "@/assets/menu/prox-pad-thai.jpg";
import proxCurry from "@/assets/menu/prox-green-curry.jpg";

const categories = ['All', 'Romantic', 'Nightlife', 'Fine Dining', 'Groups', 'Budget'];

const collections = [
  {
    id: 1,
    title: 'Date Night',
    subtitle: 'Romantic evenings',
    image: cosbyBurrata,
    category: 'Romantic',
    featured: true,
  },
  {
    id: 2,
    title: 'Trending Now',
    subtitle: 'What everyone loves',
    image: yakoyoJollof,
    category: 'All',
    featured: true,
  },
  {
    id: 3,
    title: 'Fine Dining',
    subtitle: 'Elevated experiences',
    image: cosbyPasta,
    category: 'Fine Dining',
  },
  {
    id: 4,
    title: 'Group Friendly',
    subtitle: 'Perfect for crowds',
    image: yakoyoSuya,
    category: 'Groups',
  },
  {
    id: 5,
    title: 'Hidden Gems',
    subtitle: 'Local secrets',
    image: proxPadThai,
    category: 'All',
  },
  {
    id: 6,
    title: 'Budget Bites',
    subtitle: 'Great value spots',
    image: proxCurry,
    category: 'Budget',
  },
];

const CuratedExperiences = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredCollections = activeFilter === 'All' 
    ? collections 
    : collections.filter(c => c.category === activeFilter);

  const featuredCollections = filteredCollections.filter(c => c.featured);
  const regularCollections = filteredCollections.filter(c => !c.featured);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple" />
            <p className="text-xs font-medium tracking-widest text-purple uppercase">
              Curated for you
            </p>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Collections
          </h1>
          <p className="text-muted-foreground text-sm">
            Handpicked experiences for every mood
          </p>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === cat
                    ? 'bg-purple text-white'
                    : 'bg-card border border-border text-foreground hover:border-purple/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        {featuredCollections.length > 0 && (
          <div className="px-6 mb-8">
            <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
              Featured
            </h3>
            <div className="space-y-4">
              {featuredCollections.map((collection) => (
                <FeaturedCard key={collection.id} collection={collection} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Grid */}
        {regularCollections.length > 0 && (
          <div className="px-6 pb-24">
            <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
              {activeFilter === 'All' ? 'Browse All' : activeFilter}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {regularCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const FeaturedCard = ({ collection }: { collection: typeof collections[0] }) => {
  const navigate = useNavigate();
  
  return (
    <button 
      onClick={() => navigate('/discover')}
      className="w-full relative h-48 rounded-3xl overflow-hidden group transition-transform hover:scale-[1.01] active:scale-[0.99]"
    >
      <img 
        src={collection.image} 
        alt={collection.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-xl font-bold text-white mb-1">{collection.title}</h3>
        <p className="text-white/70 text-sm">{collection.subtitle}</p>
      </div>
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 rounded-full bg-purple/90 backdrop-blur-sm text-white text-xs font-medium">
          Featured
        </span>
      </div>
    </button>
  );
};

const CollectionCard = ({ collection }: { collection: typeof collections[0] }) => {
  const navigate = useNavigate();
  
  return (
    <button 
      onClick={() => navigate('/discover')}
      className="relative aspect-[4/5] rounded-2xl overflow-hidden group transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <img 
        src={collection.image} 
        alt={collection.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h4 className="font-semibold text-white text-sm mb-0.5">{collection.title}</h4>
        <p className="text-white/60 text-xs">{collection.subtitle}</p>
      </div>
    </button>
  );
};

export default CuratedExperiences;
