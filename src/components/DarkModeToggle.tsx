import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon } from "lucide-react";

interface DarkModeToggleProps {
  className?: string;
  description?: string;
}

const DarkModeToggle = ({ className, description }: DarkModeToggleProps) => {
  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.classList.toggle("light", !darkMode);
    localStorage.setItem("chups-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Moon className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="dark-mode-toggle" className="font-medium">Dark Mode</Label>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        <Switch id="dark-mode-toggle" checked={darkMode} onCheckedChange={setDarkMode} />
      </div>
    </div>
  );
};

export default DarkModeToggle;
