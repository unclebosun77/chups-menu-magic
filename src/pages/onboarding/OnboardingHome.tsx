import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Image, Utensils, Clock, FileText, Sparkles, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { loadRestaurantDraft, clearDraft, RestaurantDraft } from '@/utils/onboardingStore';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
}

const STEPS: OnboardingStep[] = [
  { id: 1, title: 'Branding', description: 'Upload logo & cover photo', icon: Image, route: '/restaurant/onboarding/branding' },
  { id: 2, title: 'Details', description: 'Restaurant info & location', icon: FileText, route: '/restaurant/onboarding/details' },
  { id: 3, title: 'Menu', description: 'Build your menu', icon: Utensils, route: '/restaurant/onboarding/menu' },
  { id: 4, title: 'Gallery', description: 'Add photos', icon: Image, route: '/restaurant/onboarding/gallery' },
  { id: 5, title: 'Hours', description: 'Set opening hours', icon: Clock, route: '/restaurant/onboarding/hours' },
  { id: 6, title: 'Review', description: 'Final review & publish', icon: Sparkles, route: '/restaurant/onboarding/review' },
];

const OnboardingHome = () => {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<RestaurantDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedDraft = loadRestaurantDraft();
    setDraft(savedDraft);
    setIsLoading(false);
  }, []);

  const handleStartOver = useCallback(() => {
    clearDraft();
    const newDraft = loadRestaurantDraft();
    setDraft(newDraft);
  }, []);

  const handleStepClick = useCallback((step: OnboardingStep) => {
    navigate(step.route);
  }, [navigate]);

  const completedCount = draft?.completedSteps.length || 0;
  const progressPercent = (completedCount / STEPS.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-purple/30 border-t-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Restaurant Setup</h1>
              <p className="text-xs text-muted-foreground">Create your Outa profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Hero Card */}
        <Card className="p-6 bg-gradient-to-br from-purple/10 to-neon-pink/5 border-purple/20 animate-slide-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple to-neon-pink flex items-center justify-center shadow-lg shadow-purple/30">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {draft?.profile.name || 'Welcome to Outa'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {completedCount === 0 
                  ? "Let's set up your restaurant" 
                  : `${completedCount} of ${STEPS.length} steps completed`}
              </p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Profile completeness</span>
              <span className="font-medium text-purple">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-secondary/50" />
          </div>
        </Card>

        {/* Steps List */}
        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = draft?.completedSteps.includes(step.id) || false;
            const isCurrent = draft?.step === step.id;
            
            return (
              <Card
                key={step.id}
                onClick={() => handleStepClick(step)}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-300 animate-slide-up",
                  "hover:shadow-lg hover:border-purple/30 active:scale-[0.98]",
                  isCompleted && "border-green-500/30 bg-green-500/5",
                  isCurrent && "border-purple/50 bg-purple/5 shadow-lg shadow-purple/10",
                )}
                style={{ animationDelay: `${100 + index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                    isCompleted 
                      ? "bg-green-500/20 text-green-500" 
                      : isCurrent 
                        ? "bg-purple/20 text-purple"
                        : "bg-secondary/50 text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground/60">Step {step.id}</span>
                      {isCompleted && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-500">
                          Done
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple/20 text-purple">
                          Current
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground/70">{step.description}</p>
                  </div>
                  
                  <ChevronRight className={cn(
                    "h-5 w-5 transition-colors",
                    isCompleted ? "text-green-500" : "text-muted-foreground/30"
                  )} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => handleStepClick(STEPS[draft?.step ? draft.step - 1 : 0])}
            className="w-full h-12 bg-gradient-to-r from-purple to-neon-pink text-white font-medium rounded-xl shadow-lg shadow-purple/30"
          >
            {completedCount === 0 ? 'Start Setup' : 'Continue Setup'}
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
          
          {completedCount > 0 && (
            <Button
              variant="outline"
              onClick={handleStartOver}
              className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingHome;
