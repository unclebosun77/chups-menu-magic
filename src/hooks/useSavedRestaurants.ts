import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useSavedRestaurants = () => {
  const { user } = useAuth();
  const [savedRestaurants, setSavedRestaurants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved restaurants on mount and when user changes
  useEffect(() => {
    if (!user) {
      setSavedRestaurants([]);
      setIsLoading(false);
      return;
    }

    const loadSaved = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("saved_restaurants")
        .select("restaurant_id")
        .eq("user_id", user.id);

      if (!error && data) {
        setSavedRestaurants(data.map((r) => r.restaurant_id));
      }
      setIsLoading(false);
    };

    loadSaved();
  }, [user]);

  const isSaved = useCallback(
    (restaurantId: string) => savedRestaurants.includes(restaurantId),
    [savedRestaurants]
  );

  const saveRestaurant = useCallback(
    async (restaurantId: string) => {
      if (!user) return { error: "Not authenticated" };

      const { error } = await supabase.from("saved_restaurants").insert({
        user_id: user.id,
        restaurant_id: restaurantId,
      });

      if (!error) {
        setSavedRestaurants((prev) => [...prev, restaurantId]);
      }

      return { error: error?.message };
    },
    [user]
  );

  const unsaveRestaurant = useCallback(
    async (restaurantId: string) => {
      if (!user) return { error: "Not authenticated" };

      const { error } = await supabase
        .from("saved_restaurants")
        .delete()
        .eq("user_id", user.id)
        .eq("restaurant_id", restaurantId);

      if (!error) {
        setSavedRestaurants((prev) => prev.filter((id) => id !== restaurantId));
      }

      return { error: error?.message };
    },
    [user]
  );

  const toggleSave = useCallback(
    async (restaurantId: string) => {
      if (isSaved(restaurantId)) {
        return unsaveRestaurant(restaurantId);
      } else {
        return saveRestaurant(restaurantId);
      }
    },
    [isSaved, saveRestaurant, unsaveRestaurant]
  );

  return {
    savedRestaurants,
    isLoading,
    isSaved,
    saveRestaurant,
    unsaveRestaurant,
    toggleSave,
  };
};
