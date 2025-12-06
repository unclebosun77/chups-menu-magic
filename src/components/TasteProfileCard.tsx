import { useTasteProfile } from '@/context/TasteProfileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChefHat, Flame, Wallet, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TasteProfileCardProps {
  onEditProfile?: () => void;
  className?: string;
}

const spiceLevelIcons: Record<string, { icon: string; label: string }> = {
  mild: { icon: '🌿', label: 'Mild' },
  medium: { icon: '🌶️', label: 'Medium' },
  hot: { icon: '🔥', label: 'Hot' },
};

const priceLabels: Record<string, string> = {
  budget: '£ Budget-Friendly',
  mid: '££ Mid-Range',
  premium: '£££ Premium',
};

const TasteProfileCard = ({ onEditProfile, className }: TasteProfileCardProps) => {
  const { profile, isComplete, resetProfile } = useTasteProfile();

  if (!isComplete || !profile) {
    return (
      <Card className={cn("bg-gradient-to-br from-purple-900/50 to-violet-900/30 border-purple-500/20", className)}>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Outa is learning you
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Set up your taste profile to get personalized recommendations
          </p>
          <Button 
            variant="outline" 
            onClick={onEditProfile}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
          >
            Set Up Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-gradient-to-br from-purple-900/50 to-violet-900/30 border-purple-500/20 overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Your Taste Profile
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={resetProfile}
            className="text-white/50 hover:text-white/80 hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cuisines */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <ChefHat className="w-4 h-4" />
            <span>Favorite Cuisines</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.cuisines.map((cuisine, index) => (
              <Badge 
                key={cuisine}
                variant="secondary"
                className="bg-purple-500/20 text-purple-200 border-purple-500/30 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {cuisine}
              </Badge>
            ))}
          </div>
        </div>

        {/* Spice Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Flame className="w-4 h-4" />
            <span>Spice Level</span>
          </div>
          <span className="flex items-center gap-1 text-white">
            <span>{spiceLevelIcons[profile.spiceLevel].icon}</span>
            <span className="text-sm">{spiceLevelIcons[profile.spiceLevel].label}</span>
          </span>
        </div>

        {/* Price Preference */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Wallet className="w-4 h-4" />
            <span>Price Range</span>
          </div>
          <span className="text-sm text-white">
            {priceLabels[profile.pricePreference]}
          </span>
        </div>

        {/* Proteins */}
        {profile.proteins.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-white/60">Protein Preferences</div>
            <div className="flex flex-wrap gap-1.5">
              {profile.proteins.map((protein, index) => (
                <Badge 
                  key={protein}
                  variant="outline"
                  className="bg-white/5 text-white/80 border-white/20 text-xs animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {protein}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Learning indicator */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-purple-300">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span>Outa is continuously learning your preferences</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TasteProfileCard;
