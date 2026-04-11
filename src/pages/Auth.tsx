import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Mail, Lock, User, ChefHat, Check, Info } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Password requirement checker
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
          <div className={cn(
            "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
            check.met ? "bg-green-500" : "bg-muted border border-border"
          )}>
            {check.met && <Check className="h-2.5 w-2.5 text-white" />}
          </div>
          <span className={cn(
            "text-xs transition-colors",
            check.met ? "text-green-600" : "text-muted-foreground"
          )}>{check.label}</span>
        </div>
      ))}
    </div>
  );
};

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"customer" | "restaurant">("customer");
  const [resetEmail, setResetEmail] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");
  const [showSettingUp, setShowSettingUp] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [activeTab, setActiveTab] = useState("signin");
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      const from = (location.state as { from?: Location })?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Role-aware redirect: restaurant owners → dashboard, consumers → home
        const userRole = user.user_metadata?.role;
        if (userRole === 'restaurant') {
          supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()
            .then(({ data }) => {
              navigate(data ? '/restaurant/dashboard' : '/restaurant/onboarding', { replace: true });
            });
        } else {
          navigate('/', { replace: true });
        }
      }
    }
  }, [user, authLoading, navigate, location]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const validationResult = signInSchema.safeParse({
      email: formData.get("signin-email"),
      password: formData.get("signin-password"),
    });

    if (!validationResult.success) {
      toast({
        title: "Validation error",
        description: validationResult.error.errors.map(e => e.message).join(", "),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { email, password } = validationResult.data;
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let message = error.message;
      if (error.message.includes("Invalid login credentials")) {
        message = "Invalid email or password. Please try again.";
      }
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      toast({ title: "Error signing in", description: message, variant: "destructive" });

      // After 3 failed attempts, auto-open forgot password
      if (newAttempts >= 3) {
        setTimeout(() => {
          setResetDialogOpen(true);
          setFailedAttempts(0);
        }, 500);
      }

      setIsLoading(false);
      return;
    }

    setFailedAttempts(0);
    const { data: { user: signedInUser } } = await supabase.auth.getUser();
    const userRole = signedInUser?.user_metadata?.role;
    const displayName = signedInUser?.user_metadata?.full_name || signedInUser?.email?.split("@")[0] || "there";

    // Show welcome overlay
    setWelcomeName(displayName);
    setShowWelcome(true);

    setTimeout(async () => {
      setShowWelcome(false);

      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (userRole === 'restaurant' && signedInUser) {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('user_id', signedInUser.id)
          .maybeSingle();
        navigate(restaurant ? '/restaurant/dashboard' : '/restaurant/onboarding');
      } else {
        navigate('/');
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const validationResult = signUpSchema.safeParse({
      fullName: formData.get("signup-fullname"),
      email: formData.get("signup-email"),
      password: formData.get("signup-password"),
    });

    if (!validationResult.success) {
      toast({
        title: "Validation error",
        description: validationResult.error.errors.map(e => e.message).join(", "),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { fullName, email, password } = validationResult.data;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: { role, full_name: fullName },
      },
    });

    if (error) {
      let message = error.message;
      if (error.message.includes("already registered")) {
        toast({
          title: "Email already registered",
          description: "This email is already in use. Try signing in instead.",
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => setActiveTab("signin")}
            >
              Sign in
            </Button>
          ),
        });
        setIsLoading(false);
        return;
      }
      toast({ title: "Error signing up", description: message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Show loading screen for restaurant owners
    if (role === "restaurant") {
      setShowSettingUp(true);
    }

    toast({ title: "Welcome to CHUPS!", description: "Setting up your account..." });

    // Wait for session
    await new Promise<void>((resolve) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) { resolve(); return; }
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe();
            resolve();
          }
        });
        setTimeout(() => { subscription.unsubscribe(); resolve(); }, 5000);
      });
    });

    setShowSettingUp(false);

    if (role === "restaurant") {
      navigate("/restaurant/onboarding");
    } else {
      navigate("/");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    const validationResult = resetPasswordSchema.safeParse({ email: resetEmail });

    if (!validationResult.success) {
      toast({
        title: "Validation error",
        description: validationResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "Password reset link sent!" });
      setResetDialogOpen(false);
      setResetEmail("");
    }
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Welcome back overlay
  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-scale-in">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple to-neon-pink rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-purple/30">
            <span className="text-3xl font-bold text-white">C</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back, {welcomeName}!</h2>
          <p className="text-muted-foreground">Taking you to your space...</p>
        </div>
      </div>
    );
  }

  // Setting up overlay for restaurant owners
  if (showSettingUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-scale-in">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple to-neon-pink rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-purple/30">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Setting up your account...</h2>
          <p className="text-muted-foreground mb-4">Getting everything ready for your restaurant</p>
          <Loader2 className="h-6 w-6 animate-spin text-purple mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple/8 via-neon-pink/4 to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple/10 via-purple/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />

      <div className="relative p-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 pb-8">
        <Card className="w-full max-w-md border-0 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex items-center justify-center mb-2">
              <div className="w-14 h-14 bg-gradient-to-br from-purple to-neon-pink rounded-2xl flex items-center justify-center shadow-lg shadow-purple/30">
                <span className="text-xl font-bold text-white">C</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Welcome to <span className="bg-gradient-to-r from-purple to-neon-pink bg-clip-text text-transparent">CHUPS</span>
            </CardTitle>
            <CardDescription>Sign in to discover amazing dining experiences</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" ref={tabsRef}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-email" name="signin-email" type="email" placeholder="you@example.com" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-password" name="signin-password" type="password" placeholder="••••••••" className="pl-10" required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                  </Button>

                  <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="w-full text-sm">Forgot password?</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>Enter your email and we'll send you a reset link.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input type="email" placeholder="you@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                        <Button onClick={handleResetPassword} className="w-full" disabled={isLoading}>
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-fullname" name="signup-fullname" type="text" placeholder="Your full name" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" name="signup-email" type="email" placeholder="you@example.com" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="signup-password"
                        type="password"
                        placeholder="Create a strong password"
                        className="pl-10"
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                      />
                    </div>
                    <PasswordChecklist password={signUpPassword} />
                  </div>

                  <div className="space-y-3">
                    <Label>I am a...</Label>
                    <div className="space-y-2">
                      <div
                        onClick={() => setRole("customer")}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                          role === "customer"
                            ? "border-purple bg-purple/5 shadow-sm"
                            : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          role === "customer" ? "border-purple" : "border-muted-foreground/40"
                        )}>
                          {role === "customer" && <div className="w-2.5 h-2.5 rounded-full bg-purple" />}
                        </div>
                        <User className={cn("h-4 w-4", role === "customer" ? "text-purple" : "text-muted-foreground")} />
                        <div className="flex-1">
                          <span className={cn("font-medium", role === "customer" && "text-purple")}>Food Lover</span>
                          <p className="text-xs text-muted-foreground">Discover restaurants and order food</p>
                        </div>
                      </div>
                      <div
                        onClick={() => setRole("restaurant")}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                          role === "restaurant"
                            ? "border-purple bg-purple/5 shadow-sm"
                            : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          role === "restaurant" ? "border-purple" : "border-muted-foreground/40"
                        )}>
                          {role === "restaurant" && <div className="w-2.5 h-2.5 rounded-full bg-purple" />}
                        </div>
                        <ChefHat className={cn("h-4 w-4", role === "restaurant" ? "text-purple" : "text-muted-foreground")} />
                        <div className="flex-1">
                          <span className={cn("font-medium", role === "restaurant" && "text-purple")}>Restaurant Owner</span>
                          <p className="text-xs text-muted-foreground">Manage your restaurant on CHUPS</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Restaurant owner info card */}
                  {role === "restaurant" && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple/5 border border-purple/20 animate-slide-up">
                      <Info className="h-4 w-4 text-purple mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        You'll set up your restaurant profile after creating your account. It takes about 5 minutes.
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : role === "restaurant" ? (
                      "Create Account & Set Up Restaurant"
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;