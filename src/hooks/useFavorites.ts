import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    supabase
      .from("favorites")
      .select("decision_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setFavoriteIds(new Set(data.map((f: any) => f.decision_id)));
      });
  }, [user]);

  const toggleFavorite = async (decisionId: string) => {
    if (!user) return;
    const isFav = favoriteIds.has(decisionId);
    if (isFav) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("decision_id", decisionId);
      if (error) { toast.error("Failed to unfavorite"); return; }
      setFavoriteIds((prev) => { const n = new Set(prev); n.delete(decisionId); return n; });
      toast.success("Removed from favorites");
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, decision_id: decisionId });
      if (error) { toast.error("Failed to favorite"); return; }
      setFavoriteIds((prev) => new Set(prev).add(decisionId));
      toast.success("Added to favorites ⭐");
    }
  };

  return { favoriteIds, toggleFavorite, isFavorite: (id: string) => favoriteIds.has(id) };
}
