import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { PoundSterling } from 'lucide-react';

interface BudgetPlannerCardProps {
  onSubmit: (budget: number) => void;
}

const BudgetPlannerCard = ({ onSubmit }: BudgetPlannerCardProps) => {
  const [budget, setBudget] = useState(40);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple/10 via-purple/5 to-transparent border border-purple/15 animate-scale-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-purple/15 flex items-center justify-center">
          <PoundSterling className="h-4 w-4 text-purple" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Budget Planner</h4>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Slide to set your budget — Outa will find options that fit.
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">£10</span>
          <span className="text-lg font-bold text-purple">£{budget}</span>
          <span className="text-xs text-muted-foreground">£200</span>
        </div>

        <Slider
          value={[budget]}
          onValueChange={(v) => setBudget(v[0])}
          min={10}
          max={200}
          step={5}
          className="[&_[role=slider]]:bg-purple [&_[role=slider]]:border-purple [&_[data-orientation=horizontal]>.bg-primary]:bg-purple"
        />

        <p className="text-center text-xs text-muted-foreground">
          For <span className="font-semibold text-foreground">£{budget} per head</span>, Outa will find options that fit
        </p>

        <Button
          onClick={() => onSubmit(budget)}
          className="w-full bg-purple hover:bg-purple/90 text-white rounded-xl h-10 text-sm font-medium"
        >
          Find restaurants in this budget
        </Button>
      </div>
    </div>
  );
};

export default BudgetPlannerCard;
