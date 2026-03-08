import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, ArrowLeft, Trash2, Clock, Search, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import ThemeToggle from "@/components/ThemeToggle";

interface Decision {
  id: string;
  question: string;
  summary: string | null;
  scenarios: any;
  created_at: string;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    loadDecisions();
  }, [user]);

  const loadDecisions = async () => {
    const { data, error } = await supabase.from("decisions").select("*").order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load history"); console.error(error); }
    else setDecisions(data || []);
    setLoading(false);
  };

  const deleteDecision = async (id: string) => {
    const { error } = await supabase.from("decisions").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { setDecisions((prev) => prev.filter((d) => d.id !== id)); toast.success("Decision removed"); }
  };

  const filtered = decisions.filter((d) => d.question.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-[500px] h-[500px] orb-1 rounded-full animate-pulse-glow" />
        <div className="absolute bottom-40 right-20 w-[400px] h-[400px] orb-3 rounded-full animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      <header className="glass border-b border-border/30 h-14 flex items-center px-4 sm:px-6 sticky top-0 z-50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/compare")}>
            <GitCompare className="w-4 h-4 mr-1" /> Compare
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            <Clock className="inline w-8 h-8 mr-2 text-primary" />
            Decision History
          </h1>
          <p className="text-muted-foreground">Review past simulations and revisit your decision paths.</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search decisions..." className="input-field pl-10" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">{search ? "No matching decisions found" : "No decisions yet. Start simulating!"}</p>
            <Button variant="hero" size="lg" onClick={() => navigate("/dashboard")}>Simulate a Decision</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((d, i) => {
              const scenarioCount = Array.isArray(d.scenarios) ? d.scenarios.length : 0;
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass glass-hover rounded-2xl p-5 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground text-sm mb-1">{d.question}</h3>
                      {d.summary && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{d.summary}</p>}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{format(new Date(d.created_at), "MMM d, yyyy")}</span>
                        {scenarioCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-display font-semibold">{scenarioCount} scenarios</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive shrink-0"
                      onClick={(e) => { e.stopPropagation(); deleteDecision(d.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
