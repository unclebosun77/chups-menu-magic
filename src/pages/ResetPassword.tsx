import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PasswordChecklist = ({ password }: { password: string }) => {
  const checks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="grid grid-cols-2 gap-1.5 mt-2">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-1.5">
          <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px]", check.met ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground")}>
            {check.met && <Check className="h-2.5 w-2.5" />}
          </div>
          <span className={cn("text-xs", check.met ? "text-green-600" : "text-muted-foreground")}>{check.label}</span>
        </div>
      ))}
    </div>
  );
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const isValid = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "Signing you in..." });
      // Check role for redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: restaurant } = await supabase.from("restaurants").select("id").eq("user_id", user.id).maybeSingle();
        navigate(restaurant ? "/restaurant/dashboard" : "/");
      } else {
        navigate("/");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple to-neon-pink flex items-center justify-center mx-auto mb-3">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-xl">Set New Password</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Enter your new password below</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" className="h-12" />
              <PasswordChecklist password={password} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="h-12" />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords don't match</p>
              )}
            </div>
            <Button type="submit" disabled={!isValid || isLoading} className="w-full h-12 bg-gradient-to-r from-purple to-neon-pink">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;