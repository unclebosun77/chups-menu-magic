import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Bell, Globe, Vibrate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PreferencesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const readBool = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(key);
  return v === null ? fallback : v === "true";
};

const PreferencesSheet = ({ open, onOpenChange }: PreferencesSheetProps) => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(() =>
    readBool("pref:darkMode", document.documentElement.classList.contains("dark"))
  );
  const [notifications, setNotifications] = useState(() => readBool("pref:notifications", true));
  const [haptics, setHaptics] = useState(() => readBool("pref:haptics", true));

  // Apply dark mode live
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("pref:darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("pref:notifications", String(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("pref:haptics", String(haptics));
  }, [haptics]);

  const handleNotifications = async (next: boolean) => {
    setNotifications(next);
    if (next && "Notification" in window && Notification.permission === "default") {
      try {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setNotifications(false);
          toast({ title: "Notifications blocked", description: "Enable them in your browser settings." });
        }
      } catch {
        /* noop */
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Preferences</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
            </div>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="notifications" className="font-medium">Push Notifications</Label>
            </div>
            <Switch id="notifications" checked={notifications} onCheckedChange={handleNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="haptics" className="font-medium">Haptic Feedback</Label>
            </div>
            <Switch id="haptics" checked={haptics} onCheckedChange={setHaptics} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="font-medium">Language</Label>
                <p className="text-xs text-muted-foreground">English (UK)</p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">🇬🇧</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PreferencesSheet;
