import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MessageSquare, Star } from "lucide-react";

const Activity = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  if (!user) {
    return (
      <div className="p-4 space-y-6">
        <div className="pt-4">
          <h1 className="text-3xl font-bold">Activity</h1>
          <p className="text-muted-foreground mt-1">Track your orders and engagement</p>
        </div>

        <Card className="p-12 text-center">
          <CardDescription className="text-lg mb-4">
            Sign in to view your activity
          </CardDescription>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-muted-foreground mt-1">Track your orders and engagement</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4 mt-4">
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate("/my-orders")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                    <CardDescription>View your order history</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">View All</Badge>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4 mt-4">
          <Card className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardDescription>No community posts yet</CardDescription>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 mt-4">
          <Card className="p-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardDescription>No reviews yet</CardDescription>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Activity;
