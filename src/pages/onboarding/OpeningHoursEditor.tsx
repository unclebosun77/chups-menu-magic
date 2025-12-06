import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Copy, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { loadRestaurantDraft, saveRestaurantDraft, updateDraftStep, OpeningHoursDraft } from '@/utils/onboardingStore';
import { cn } from '@/lib/utils';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const OpeningHoursEditor = () => {
  const navigate = useNavigate();
  const [hours, setHours] = useState<Record<string, OpeningHoursDraft>>({});

  useEffect(() => {
    const draft = loadRestaurantDraft();
    setHours(draft.hours);
  }, []);

  const handleSave = useCallback(() => {
    saveRestaurantDraft('hours', hours);
    updateDraftStep(6, true);
    navigate('/restaurant/onboarding/review');
  }, [hours, navigate]);

  const updateHours = useCallback((day: string, field: keyof OpeningHoursDraft, value: any) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  }, []);

  const copyToAll = useCallback(() => {
    const mondayHours = hours.monday;
    const updated: Record<string, OpeningHoursDraft> = {};
    DAYS.forEach(day => {
      updated[day] = { ...mondayHours };
    });
    setHours(updated);
  }, [hours.monday]);

  const toggleClosed = useCallback((day: string) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed }
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/restaurant/onboarding/gallery')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <p className="text-xs text-purple font-medium">Step 5 of 6</p>
              <h1 className="text-xl font-bold text-foreground">Opening Hours</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Quick Action */}
        <Button
          variant="outline"
          onClick={copyToAll}
          className="w-full gap-2 border-purple/30 text-purple hover:bg-purple/10"
        >
          <Copy className="h-4 w-4" />
          Copy Monday to All Days
        </Button>

        {/* Days List */}
        {DAYS.map((day, index) => {
          const dayHours = hours[day] || { open: '10:00', close: '22:00', closed: false };
          
          return (
            <Card 
              key={day}
              className={cn(
                "p-4 animate-slide-up",
                dayHours.closed && "opacity-60"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">{DAY_LABELS[day]}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {dayHours.closed ? 'Closed' : 'Open'}
                  </span>
                  <Switch
                    checked={!dayHours.closed}
                    onCheckedChange={() => toggleClosed(day)}
                  />
                </div>
              </div>
              
              {!dayHours.closed && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">Opens</label>
                    <Input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => updateHours(day, 'open', e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <span className="text-muted-foreground mt-5">—</span>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">Closes</label>
                    <Input
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => updateHours(day, 'close', e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {/* Info Card */}
        <Card className="p-4 bg-purple/5 border-purple/20 animate-slide-up">
          <p className="text-xs text-purple font-medium mb-1">💡 Tip</p>
          <p className="text-sm text-muted-foreground">
            Accurate opening hours help customers find you when you're open.
          </p>
        </Card>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <Button
          onClick={handleSave}
          className="w-full h-12 bg-gradient-to-r from-purple to-neon-pink text-white font-medium rounded-xl"
        >
          Continue to Review
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OpeningHoursEditor;
