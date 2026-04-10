import { MapPin } from 'lucide-react';
import { ItineraryStep } from '@/utils/chatEngine';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ItineraryCardProps {
  steps: ItineraryStep[];
  onRestaurantClick?: (restaurant: any) => void;
}

const STEP_COLORS: Record<ItineraryStep['type'], string> = {
  'pre-drinks': 'bg-amber-500',
  'dinner': 'bg-purple',
  'dessert': 'bg-pink-500',
  'activity': 'bg-blue-500',
};

const STEP_ICONS: Record<ItineraryStep['type'], string> = {
  'pre-drinks': '🍸',
  'dinner': '🍽️',
  'dessert': '🍰',
  'activity': '🎵',
};

const ItineraryCard = ({ steps, onRestaurantClick }: ItineraryCardProps) => {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple/8 to-transparent border border-purple/12 animate-slide-up" style={{ animationDelay: '200ms' }}>
      <h4 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
        <span>✨</span> Your Evening Plan
      </h4>

      <div className="relative">
        {steps.map((step, index) => {
          const dotColor = STEP_COLORS[step.type] || 'bg-purple';
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className="flex gap-3 animate-scale-in"
              style={{ animationDelay: `${300 + index * 120}ms` }}
            >
              {/* Timeline column */}
              <div className="flex flex-col items-center flex-shrink-0 w-14">
                {/* Time pill */}
                <span className="text-[10px] font-semibold text-purple bg-purple/10 px-2 py-0.5 rounded-full whitespace-nowrap mb-1.5">
                  {step.time}
                </span>
                {/* Dot */}
                <div className={cn('w-3 h-3 rounded-full border-2 border-background shadow-sm', dotColor)} />
                {/* Connector line */}
                {!isLast && (
                  <div className="w-0.5 flex-1 min-h-[24px] bg-purple/20 my-1" />
                )}
              </div>

              {/* Content */}
              <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{STEP_ICONS[step.type]}</span>
                  <h5 className="font-semibold text-sm text-foreground">{step.title}</h5>
                </div>

                {step.venue && (
                  <p className="text-xs font-medium text-purple mt-0.5">{step.venue}</p>
                )}

                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>

                {/* Action buttons */}
                <div className="flex gap-2 mt-2">
                  {step.type === 'dinner' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] rounded-full border-purple/20 text-purple hover:bg-purple/10"
                      onClick={() => onRestaurantClick?.({ id: step.id, name: step.venue })}
                    >
                      Book this
                    </Button>
                  )}
                  {(step.type === 'pre-drinks' || step.type === 'dessert') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      View on map
                    </Button>
                  )}
                </div>

                {/* Walking time connector text */}
                {!isLast && step.walkingTime && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/60">
                    <MapPin className="h-2.5 w-2.5" />
                    <span>{step.walkingTime}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItineraryCard;
