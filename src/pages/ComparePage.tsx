import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, ArrowLeft, GitCompare, Search, Check } from "lucide-react";
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

export default function ComparePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [selected, setSelected] = useState<Decision[]>([]);
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
    if (error) toast.error("Failed to load decisions");
    else setDecisions(data || []);
    setLoading(false);
  };

  const toggleSelect = (d: Decision) => {
    if (selected.find((s) => s.id === d.id)) {
      setSelected(selected.filter((s) => s.id !== d.id));
    } else if (selected.length < 2) {
      setSelected([...selected, d]);
    } else {
      toast.info("You can compare up to 2 decisions");
    }
  };

  const filtered = decisions.filter((d) =>
    d.question.toLowerCase().includes(search.toLowerCase())
  );

  const isComparing = selected.length === 2;

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-10 w-[400px] h-[400px] orb-2 rounded-full animate-pulse-glow" />
        <div className="absolute bottom-20 left-20 w-[350px] h-[350px] orb-3 rounded-full animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <header className="glass border-b border-border/30 h-14 flex items-center px-4 sm:px-6 sticky top-0 z-50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            <GitCompare className="inline w-8 h-8 mr-2 text-primary" />
            Compare Decisions
          </h1>
          <p className="text-muted-foreground">Select 2 past decisions to compare side by side.</p>
        </div>

        {!isComparing && (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search decisions..."
                className="input-field pl-10"
              />
            </div>

            {selected.length > 0 && (
              <div className="mb-4 flex gap-2 flex-wrap">
                {selected.map((s) => (
                  <div key={s.id} className="glass rounded-lg px-3 py-1.5 text-xs text-primary font-display flex items-center gap-2 border border-primary/30">
                    <Check className="w-3 h-3" />
                    {s.question.slice(0, 40)}...
                    <button onClick={() => toggleSelect(s)} className="text-muted-foreground hover:text-destructive ml-1">×</button>
                  </div>
                ))}
                <span className="text-xs text-muted-foreground self-center">
                  {2 - selected.length} more to compare
                </span>
              </div>
            )}

            <div className="grid gap-3">
              {loading ? (
                <div className="text-center py-20 text-muted-foreground">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  {decisions.length === 0 ? "No decisions yet. Start simulating first!" : "No matching decisions."}
                </div>
              ) : (
                filtered.map((d, i) => {
                  const isSelected = !!selected.find((s) => s.id === d.id);
                  return (
                    <motion.button
                      key={d.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => toggleSelect(d)}
                      className={`glass rounded-xl p-4 text-left w-full transition-all ${
                        isSelected ? "border-primary/50 glow-primary" : "glass-hover"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? "border-primary bg-primary/20" : "border-border"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-foreground text-sm truncate">{d.question}</h3>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(d.created_at), "MMM d, yyyy")} · {Array.isArray(d.scenarios) ? d.scenarios.length : 0} scenarios
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </>
        )}

        {isComparing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button variant="glass" size="sm" onClick={() => setSelected([])} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-1" /> Choose Different Decisions
            </Button>

            <div className="grid lg:grid-cols-2 gap-6">
              {selected.map((decision, di) => {
                const scenarios = Array.isArray(decision.scenarios) ? decision.scenarios : [];
                return (
                  <div key={decision.id} className="glass rounded-2xl p-5 sm:p-6">
                    <div className={`w-full h-1 rounded-full mb-4 ${di === 0 ? "gradient-primary" : "gradient-warm"}`} />
                    <h3 className="font-display font-bold text-foreground text-lg mb-2">{decision.question}</h3>
                    {decision.summary && (
                      <p className="text-sm text-muted-foreground mb-4">{decision.summary}</p>
                    )}
                    <p className="text-xs text-muted-foreground mb-4">
                      {format(new Date(decision.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>

                    <div className="space-y-3">
                      {scenarios.map((s: any, si: number) => (
                        <div key={si} className="glass rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-display font-semibold text-sm text-foreground">{s.title}</h4>
                            <span className={`text-[10px] font-display font-bold px-2 py-0.5 rounded-full ${
                              s.riskLevel === "Low" ? "bg-primary/20 text-primary" :
                              s.riskLevel === "Medium" ? "bg-warm/20 text-warm" : "bg-destructive/20 text-destructive"
                            }`}>{s.riskLevel}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{s.description}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full gradient-primary rounded-full" style={{ width: `${s.growthPotential}%` }} />
                              </div>
                            </div>
                            <span className="text-xs font-display font-semibold text-primary">{s.growthPotential}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
