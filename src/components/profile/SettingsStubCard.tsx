import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsStubCardProps {
  className?: string;
}

const settingsItems = [
  { 
    icon: Settings, 
    label: "Preferences", 
    subtitle: "App customization",
    comingSoon: true 
  },
  { 
    icon: Bell, 
    label: "Notifications", 
    subtitle: "Alerts & updates",
    comingSoon: true 
  },
  { 
    icon: Shield, 
    label: "Privacy & Security", 
    subtitle: "Account protection",
    comingSoon: true 
  },
];

const SettingsStubCard = ({ className }: SettingsStubCardProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {settingsItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            className={cn(
              "glass-card transition-all animate-slide-up",
              item.comingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-lg hover:border-purple/20 active:scale-[0.98]"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple/10 to-secondary flex items-center justify-center">
                <Icon className="h-5 w-5 text-purple" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{item.label}</p>
                  {item.comingSoon && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-secondary text-muted-foreground">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SettingsStubCard;