import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, GitBranch, Clock, TreePine, AlertTriangle, TrendingUp } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TimelineView from "@/components/TimelineView";
import DecisionTree from "@/components/DecisionTree";
import ThemeToggle from "@/components/ThemeToggle";

interface Scenario {
  id: number;
  title: string;
  description: string;
  riskLevel: "Low" | "Medium" | "High";
  growthPotential: number;
  timeline: { year: string; milestone: string }[];
  actions: string[];
}

export default function SharedDecisionPage() {
  const { token } = useParams<{ token: string }>();
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"scenarios" | "timeline" | "tree">("scenarios");

  useEffect(() => {
    if (!token) return;
    supabase
      .from("decisions")
      .select("*")
      .eq("share_token", token)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) setError("Decision not found or link expired.");
        else setDecision(data);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center animate-pulse">
          <Brain className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold text-foreground mb-2">Not Found</h1>
          <p className="text-muted-foreground">{error || "This shared link is invalid."}</p>
        </div>
      </div>
    );
  }

  const scenarios: Scenario[] = Array.isArray(decision.scenarios) ? decision.scenarios : [];
  const viewTabs = [
    { key: "scenarios" as const, label: "Scenarios", icon: GitBranch },
    { key: "timeline" as const, label: "Timeline", icon: Clock },
    { key: "tree" as const, label: "Tree", icon: TreePine },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-[400px] h-[400px] orb-1 rounded-full animate-pulse-glow" />
        <div className="absolute bottom-20 right-20 w-[350px] h-[350px] orb-2 rounded-full animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      <header className="glass border-b border-border/30 h-14 flex items-center px-4 sm:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">Aevora</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-display">Shared</span>
        </div>
        <div className="ml-auto"><ThemeToggle /></div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">{decision.question}</h1>
          {decision.summary && <p className="text-muted-foreground mb-6">{decision.summary}</p>}

          {/* View tabs */}
          <div className="flex gap-2 mb-6">
            {viewTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-medium transition-all ${
                  activeView === tab.key
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground glass"
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {activeView === "scenarios" && (
            <div className="grid gap-4">
              {scenarios.map((s) => (
                <div key={s.id} className="glass rounded-2xl p-5">
                  <h3 className="font-display font-bold text-foreground text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{s.description}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className={`w-4 h-4 ${s.riskLevel === "Low" ? "text-primary" : s.riskLevel === "Medium" ? "text-warm" : "text-destructive"}`} />
                      <span className="text-xs text-muted-foreground">{s.riskLevel} Risk</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{s.growthPotential}% Growth</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {s.timeline.map((t, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-xs font-display font-semibold text-primary w-16 shrink-0">{t.year}</span>
                        <span className="text-xs text-muted-foreground">{t.milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === "timeline" && <TimelineView scenarios={scenarios} />}
          {activeView === "tree" && (
            <div className="overflow-x-auto">
              <DecisionTree scenarios={scenarios} question={decision.question} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
