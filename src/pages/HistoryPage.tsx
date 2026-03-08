import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, ArrowLeft, Trash2, Clock, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

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
    const { data, error } = await supabase
      .from("decisions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load history");
      console.error(error);
    } else {
      setDecisions(data || []);
    }
    setLoading(false);
  };

  const deleteDecision = async (id: string) => {
    const { error } = await supabase.from("decisions").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setDecisions((prev) => prev.filter((d) => d.id !== id));
      toast.success("Decision removed");
    }
  };

  const filtered = decisions.filter((d) =>
    d.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border/30 h-14 flex items-center px-4 sm:px-6 sticky top-0 z-50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground hidden sm:inline">Decision History</span>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Your Decisions</h1>
          <p className="text-muted-foreground">Review past simulations and revisit your decision paths.</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions..."
            className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {search ? "No matching decisions found" : "No decisions yet. Start simulating!"}
            </p>
            <Button variant="hero" size="lg" className="mt-4" onClick={() => navigate("/dashboard")}>
              Simulate a Decision
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass glass-hover rounded-xl p-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-sm truncate mb-1">{d.question}</h3>
                    {d.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{d.summary}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(d.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      {d.scenarios && (
                        <span className="text-xs text-primary">
                          {Array.isArray(d.scenarios) ? d.scenarios.length : 0} scenarios
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteDecision(d.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
