import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { ArrowLeft, Star, GripVertical, Download, Trash2, Clock, GitBranch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useFavorites } from "@/hooks/useFavorites";
import { exportDecisionPdf } from "@/utils/exportPdf";
import ThemeToggle from "@/components/ThemeToggle";

interface Decision {
  id: string;
  question: string;
  summary: string | null;
  scenarios: any;
  created_at: string;
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [orderedFavs, setOrderedFavs] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("decisions")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDecisions(data || []);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    const favs = decisions.filter((d) => favoriteIds.has(d.id));
    // Preserve existing order, append new ones
    setOrderedFavs((prev) => {
      const prevIds = new Set(prev.map((d) => d.id));
      const kept = prev.filter((d) => favoriteIds.has(d.id));
      const newOnes = favs.filter((d) => !prevIds.has(d.id));
      return [...kept, ...newOnes];
    });
  }, [decisions, favoriteIds]);

  const handleExport = (d: Decision) => {
    const scenarios = Array.isArray(d.scenarios) ? d.scenarios : [];
    exportDecisionPdf(d.question, d.summary || "", scenarios);
    toast.success("PDF downloaded!");
  };

  const handleUnfavorite = async (id: string) => {
    await toggleFavorite(id);
  };

  const getRiskBadge = (scenarios: any) => {
    if (!Array.isArray(scenarios) || scenarios.length === 0) return null;
    const risks = scenarios.map((s: any) => s.riskLevel);
    const hasHigh = risks.includes("High");
    const hasLow = risks.includes("Low");
    if (hasHigh) return { label: "High Risk", color: "bg-destructive/15 text-destructive border-destructive/30" };
    if (hasLow) return { label: "Low Risk", color: "bg-primary/15 text-primary border-primary/30" };
    return { label: "Medium Risk", color: "bg-warm/15 text-warm border-warm/30" };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-[500px] h-[500px] orb-1 rounded-full animate-pulse-glow" />
        <div className="absolute bottom-40 right-20 w-[400px] h-[400px] orb-2 rounded-full animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      <header className="glass border-b border-border/30 h-14 flex items-center px-4 sm:px-6 sticky top-0 z-50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
            <Clock className="w-4 h-4 mr-1" /> History
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            <Star className="inline w-8 h-8 mr-2 text-gold fill-gold" />
            Favorites
          </h1>
          <p className="text-muted-foreground">Your starred decisions. Drag to reorder by priority.</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : orderedFavs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-gold" />
            </div>
            <p className="text-muted-foreground mb-2 text-lg font-display">No favorites yet</p>
            <p className="text-sm text-muted-foreground mb-6">Star decisions from your History or Dashboard to see them here.</p>
            <Button variant="hero" size="lg" onClick={() => navigate("/history")}>
              Browse History
            </Button>
          </motion.div>
        ) : (
          <Reorder.Group axis="y" values={orderedFavs} onReorder={setOrderedFavs} className="space-y-3">
            <AnimatePresence>
              {orderedFavs.map((d, i) => {
                const scenarioCount = Array.isArray(d.scenarios) ? d.scenarios.length : 0;
                const avgGrowth = Array.isArray(d.scenarios) && d.scenarios.length > 0
                  ? Math.round(d.scenarios.reduce((sum: number, s: any) => sum + (s.growthPotential || 0), 0) / d.scenarios.length)
                  : 0;
                const risk = getRiskBadge(d.scenarios);

                return (
                  <Reorder.Item
                    key={d.id}
                    value={d}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass glass-hover rounded-2xl p-5 cursor-grab active:cursor-grabbing border-l-4 border-l-gold/50 group"
                    whileDrag={{ scale: 1.02, boxShadow: "0 10px 40px hsl(45 90% 52% / 0.15)" }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-muted-foreground group-hover:text-gold transition-colors cursor-grab">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground text-sm mb-1">{d.question}</h3>
                        {d.summary && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{d.summary}</p>}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-muted-foreground">{format(new Date(d.created_at), "MMM d, yyyy")}</span>
                          {scenarioCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-display font-semibold flex items-center gap-1">
                              <GitBranch className="w-3 h-3" /> {scenarioCount} scenarios
                            </span>
                          )}
                          {avgGrowth > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-display font-semibold">
                              {avgGrowth}% avg growth
                            </span>
                          )}
                          {risk && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-display font-semibold ${risk.color}`}>
                              {risk.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); handleExport(d); }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gold"
                          onClick={(e) => { e.stopPropagation(); handleUnfavorite(d.id); }}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </Button>
                      </div>
                    </div>
                  </Reorder.Item>
                );
              })}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
