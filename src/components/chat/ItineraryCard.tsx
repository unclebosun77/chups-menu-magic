import { Clock, MapPin, ArrowDown } from 'lucide-react';
import { ItineraryStep } from '@/utils/chatEngine';
import { cn } from '@/lib/utils';

interface ItineraryCardProps {
  steps: ItineraryStep[];
}

const STEP_ICONS: Record<ItineraryStep['type'], string> = {
  'pre-drinks': '🍸',
  'dinner': '🍽️',
  'dessert': '🍰',
  'activity': '🎵',
};

const ItineraryCard = ({ steps }: ItineraryCardProps) => {
  return (
    <div className="space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
      {steps.map((step, index) => (
        <div key={step.id}>
          <div 
            className={cn(
              "p-3 rounded-xl",
              "bg-gradient-to-r from-purple/10 to-neon-pink/5",
              "border border-purple/20",
              "animate-scale-in"
            )}
            style={{ animationDelay: `${300 + index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-purple/20 flex items-center justify-center text-lg flex-shrink-0">
                {STEP_ICONS[step.type]}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground text-sm">{step.title}</h4>
                </div>
                
                {step.venue && (
                  <p className="text-xs text-purple font-medium mt-0.5">{step.venue}</p>
                )}
                
                <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{step.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Connector */}
          {index < steps.length - 1 && step.walkingTime && (
            <div className="flex items-center gap-2 py-1 pl-6">
              <div className="w-0.5 h-4 bg-purple/30" />
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{step.walkingTime}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ItineraryCard;
