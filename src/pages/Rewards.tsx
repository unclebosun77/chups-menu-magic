import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Trophy, Star, CreditCard, Send, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface RewardsAccount {
  points_balance: number;
  lifetime_points: number;
  tier: string;
}

interface RewardsTransaction {
  id: string;
  points: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface GiftCard {
  id: string;
  code: string;
  initial_amount: number;
  current_balance: number;
  recipient_email: string;
  recipient_name: string | null;
  status: string;
  created_at: string;
}

const Rewards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rewardsAccount, setRewardsAccount] = useState<RewardsAccount | null>(null);
  const [transactions, setTransactions] = useState<RewardsTransaction[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGiftCardDialog, setShowGiftCardDialog] = useState(false);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [giftCardForm, setGiftCardForm] = useState({
    amount: "",
    recipientEmail: "",
    recipientName: "",
    message: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchRewardsData(user.id);
  };

  const fetchRewardsData = async (userId: string) => {
    try {
      // Fetch or create rewards account
      let { data: account, error: accountError } = await supabase
        .from("rewards_accounts")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (accountError && accountError.code === "PGRST116") {
        // Account doesn't exist, create it
        const { data: newAccount, error: createError } = await supabase
          .from("rewards_accounts")
          .insert({ user_id: userId })
          .select()
          .single();

        if (createError) throw createError;
        account = newAccount;
      } else if (accountError) {
        throw accountError;
      }

      setRewardsAccount(account);

      // Fetch transactions
      const { data: txns, error: txnsError } = await supabase
        .from("rewards_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (txnsError) throw txnsError;
      setTransactions(txns || []);

      // Fetch gift cards
      const { data: cards, error: cardsError } = await supabase
        .from("gift_cards")
        .select("*")
        .eq("purchaser_user_id", userId)
        .order("created_at", { ascending: false });

      if (cardsError) throw cardsError;
      setGiftCards(cards || []);
    } catch (error) {
      console.error("Error fetching rewards data:", error);
      toast({
        title: "Error",
        description: "Failed to load rewards data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseGiftCard = async () => {
    if (!giftCardForm.amount || !giftCardForm.recipientEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(giftCardForm.amount);
    if (isNaN(amount) || amount < 10 || amount > 500) {
      toast({
        title: "Invalid Amount",
        description: "Gift card amount must be between $10 and $500",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate gift card code
      const { data: codeData, error: codeError } = await supabase.rpc("generate_gift_card_code");
      if (codeError) throw codeError;

      const { error } = await supabase.from("gift_cards").insert({
        code: codeData,
        initial_amount: amount,
        current_balance: amount,
        purchaser_user_id: user.id,
        recipient_email: giftCardForm.recipientEmail,
        recipient_name: giftCardForm.recipientName || null,
        message: giftCardForm.message || null,
      });

      if (error) throw error;

      toast({
        title: "Gift Card Purchased!",
        description: `A $${amount} gift card has been sent to ${giftCardForm.recipientEmail}`,
      });

      setShowGiftCardDialog(false);
      setGiftCardForm({ amount: "", recipientEmail: "", recipientName: "", message: "" });
      fetchRewardsData(user.id);
    } catch (error) {
      console.error("Error purchasing gift card:", error);
      toast({
        title: "Error",
        description: "Failed to purchase gift card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      bronze: "bg-orange-500",
      silver: "bg-gray-400",
      gold: "bg-yellow-500",
      platinum: "bg-purple-500",
    };
    return (
      <Badge className={`${colors[tier as keyof typeof colors]} text-white`}>
        {tier.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading rewards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/services")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-purple-glow bg-clip-text text-transparent">
            Rewards & Gift Cards
          </h1>
          <p className="text-muted-foreground mt-1">Earn points and send gift cards</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Points Balance Card */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                <CardTitle>Your Rewards</CardTitle>
              </div>
              {rewardsAccount && getTierBadge(rewardsAccount.tier)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Points</p>
                <p className="text-4xl font-bold text-primary">
                  {rewardsAccount?.points_balance || 0}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Lifetime Points</p>
                  <p className="text-xl font-semibold">
                    {rewardsAccount?.lifetime_points || 0}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setShowGiftCardDialog(true)}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Purchase Gift Card</CardTitle>
              </div>
              <CardDescription>Send a gift card to friends & family</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setShowRedeemDialog(true)}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Redeem Points</CardTitle>
              </div>
              <CardDescription>Use your points for rewards</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs for History and Gift Cards */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Transaction History
            </TabsTrigger>
            <TabsTrigger value="giftcards">
              <Gift className="h-4 w-4 mr-2" />
              My Gift Cards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-3">
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No transaction history yet. Start earning points!
                </CardContent>
              </Card>
            ) : (
              transactions.map((txn) => (
                <Card key={txn.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{txn.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(txn.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`text-xl font-bold ${txn.points > 0 ? "text-green-600" : "text-red-600"}`}>
                        {txn.points > 0 ? "+" : ""}{txn.points}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="giftcards" className="space-y-3">
            {giftCards.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No gift cards purchased yet
                </CardContent>
              </Card>
            ) : (
              giftCards.map((card) => (
                <Card key={card.id}>
                  <CardContent className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={card.status === "active" ? "default" : "secondary"}>
                          {card.status}
                        </Badge>
                        <p className="text-lg font-bold text-primary">
                          ${card.current_balance.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Code</p>
                        <p className="font-mono font-semibold">{card.code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sent to</p>
                        <p className="font-medium">{card.recipient_email}</p>
                        {card.recipient_name && (
                          <p className="text-sm">{card.recipient_name}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Purchased on {new Date(card.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* How to Earn Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Gift className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Place Orders</p>
                <p className="text-sm text-muted-foreground">Earn 1 point for every $1 spent</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Book Experiences</p>
                <p className="text-sm text-muted-foreground">Earn bonus points on bookings</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Leave Reviews</p>
                <p className="text-sm text-muted-foreground">Earn 50 points per review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gift Card Purchase Dialog */}
      <Dialog open={showGiftCardDialog} onOpenChange={setShowGiftCardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Purchase Gift Card
            </DialogTitle>
            <DialogDescription>
              Send a digital gift card to anyone via email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($10 - $500) *</Label>
              <Input
                id="amount"
                type="number"
                min="10"
                max="500"
                placeholder="50"
                value={giftCardForm.amount}
                onChange={(e) => setGiftCardForm({ ...giftCardForm, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="friend@example.com"
                value={giftCardForm.recipientEmail}
                onChange={(e) => setGiftCardForm({ ...giftCardForm, recipientEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
              <Input
                id="recipientName"
                placeholder="John Doe"
                value={giftCardForm.recipientName}
                onChange={(e) => setGiftCardForm({ ...giftCardForm, recipientName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Happy birthday! Enjoy a meal on me..."
                value={giftCardForm.message}
                onChange={(e) => setGiftCardForm({ ...giftCardForm, message: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
            <Button
              onClick={handlePurchaseGiftCard}
              disabled={isSubmitting}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Processing..." : "Purchase & Send"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Redeem Points Dialog */}
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Redeem Points
            </DialogTitle>
            <DialogDescription>
              Use your points for discounts and rewards
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Card className="cursor-pointer hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">$5 Off</CardTitle>
                <CardDescription>500 points</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">$10 Off</CardTitle>
                <CardDescription>900 points</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">$25 Off</CardTitle>
                <CardDescription>2000 points</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Free Dessert</CardTitle>
                <CardDescription>300 points</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rewards;
