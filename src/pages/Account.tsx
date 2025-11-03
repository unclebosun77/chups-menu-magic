import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, Bell, Heart, HelpCircle, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
    });
    navigate("/");
  };

  if (!user) {
    return (
      <div className="p-4 space-y-6">
        <div className="pt-4">
          <h1 className="text-3xl font-bold">Account</h1>
          <p className="text-muted-foreground mt-1">Manage your profile</p>
        </div>

        <Card className="p-12 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <CardDescription className="text-lg mb-4">
            Sign in to access your account
          </CardDescription>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { icon: Settings, label: "Settings", action: () => {} },
    { icon: Bell, label: "Notifications", action: () => {} },
    { icon: Heart, label: "Favorites", action: () => {} },
    { icon: HelpCircle, label: "Help & Support", action: () => {} },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground mt-1">Manage your profile</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">
                {user.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{user.email}</CardTitle>
              <CardDescription>CHUPS Member</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.label}
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={item.action}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{item.label}</span>
              </CardContent>
            </Card>
          );
        })}

        <Card
          className="cursor-pointer hover:shadow-lg transition-all border-destructive/20"
          onClick={handleSignOut}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <LogOut className="h-5 w-5 text-destructive" />
            <span className="font-medium text-destructive">Sign Out</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
