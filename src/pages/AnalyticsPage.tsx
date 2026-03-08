import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, TrendingUp, Brain, Calendar, Flame, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, isAfter } from "date-fns";
import ThemeToggle from "@/components/ThemeToggle";

interface Decision {
  id: string;
  question: string;
  summary: string | null;
  scenarios: any;
  created_at: string;
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

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

  const stats = useMemo(() => {
    const total = decisions.length;
    const last7 = decisions.filter((d) => isAfter(new Date(d.created_at), subDays(new Date(), 7))).length;
    const last30 = decisions.filter((d) => isAfter(new Date(d.created_at), subDays(new Date(), 30))).length;

    const totalScenarios = decisions.reduce((sum, d) => sum + (Array.isArray(d.scenarios) ? d.scenarios.length : 0), 0);
    const avgScenarios = total > 0 ? (totalScenarios / total).toFixed(1) : "0";

    // Topic extraction: simple keyword frequency
    const wordMap: Record<string, number> = {};
    decisions.forEach((d) => {
      const words = d.question
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !["should", "would", "could", "about", "with", "from", "that", "this", "have", "what", "which", "them", "their", "learn", "start"].includes(w));
      words.forEach((w) => { wordMap[w] = (wordMap[w] || 0) + 1; });
    });
    const topTopics = Object.entries(wordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({ word, count }));

    // Risk distribution
    const riskCounts = { Low: 0, Medium: 0, High: 0 };
    decisions.forEach((d) => {
      if (Array.isArray(d.scenarios)) {
        d.scenarios.forEach((s: any) => {
          if (s.riskLevel in riskCounts) riskCounts[s.riskLevel as keyof typeof riskCounts]++;
        });
      }
    });

    // Activity by day of week
    const dayActivity = [0, 0, 0, 0, 0, 0, 0];
    decisions.forEach((d) => { dayActivity[new Date(d.created_at).getDay()]++; });
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Streak calculation
    const uniqueDays = new Set(decisions.map((d) => format(new Date(d.created_at), "yyyy-MM-dd")));
    let streak = 0;
    let checkDate = new Date();
    while (uniqueDays.has(format(checkDate, "yyyy-MM-dd"))) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }

    return { total, last7, last30, avgScenarios, totalScenarios, topTopics, riskCounts, dayActivity, dayNames, streak };
  }, [decisions]);

  const maxDayActivity = Math.max(...stats.dayActivity, 1);
  const riskTotal = stats.riskCounts.Low + stats.riskCounts.Medium + stats.riskCounts.High || 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-20 w-[400px] h-[400px] orb-1 rounded-full animate-pulse-glow" />
        <div className="absolute bottom-40 left-10 w-[350px] h-[350px] orb-2 rounded-full animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      <header className="glass border-b border-border/30 h-14 flex items-center px-4 sm:px-6 sticky top-0 z-50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
        <div className="ml-auto"><ThemeToggle /></div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            <BarChart3 className="inline w-8 h-8 mr-2 text-primary" />
            Analytics
          </h1>
          <p className="text-muted-foreground">Your decision-making insights at a glance.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading analytics...</div>
        ) : decisions.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No data yet. Start simulating decisions!</p>
            <Button variant="hero" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Decisions", value: stats.total, icon: Brain, color: "text-primary", bg: "bg-primary/10" },
                { label: "Last 7 Days", value: stats.last7, icon: Calendar, color: "text-accent", bg: "bg-accent/10" },
                { label: "Avg Scenarios", value: stats.avgScenarios, icon: TrendingUp, color: "text-warm", bg: "bg-warm/10" },
                { label: "Day Streak", value: `${stats.streak} 🔥`, icon: Flame, color: "text-rose", bg: "bg-rose/10" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weekly Activity */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">Weekly Activity</h3>
                <div className="flex items-end gap-3 h-32">
                  {stats.dayActivity.map((count, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-display font-semibold text-primary">{count}</span>
                      <div
                        className="w-full rounded-t-lg gradient-primary transition-all duration-500"
                        style={{ height: `${(count / maxDayActivity) * 100}%`, minHeight: count > 0 ? "8px" : "2px" }}
                      />
                      <span className="text-[10px] text-muted-foreground">{stats.dayNames[i]}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Risk Distribution */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">
                  <PieChart className="inline w-4 h-4 mr-2 text-primary" />
                  Risk Distribution
                </h3>
                <div className="space-y-4">
                  {([
                    { label: "Low Risk", count: stats.riskCounts.Low, color: "bg-primary", textColor: "text-primary" },
                    { label: "Medium Risk", count: stats.riskCounts.Medium, color: "bg-warm", textColor: "text-warm" },
                    { label: "High Risk", count: stats.riskCounts.High, color: "bg-destructive", textColor: "text-destructive" },
                  ]).map((r) => (
                    <div key={r.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`font-display font-medium ${r.textColor}`}>{r.label}</span>
                        <span className="text-muted-foreground">{r.count} ({Math.round((r.count / riskTotal) * 100)}%)</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} rounded-full transition-all duration-700`} style={{ width: `${(r.count / riskTotal) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Top Topics */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-foreground mb-4">Common Topics</h3>
              {stats.topTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.topTopics.map((t, i) => (
                    <span
                      key={t.word}
                      className={`px-3 py-1.5 rounded-full text-sm font-display font-medium border transition-all ${
                        i === 0
                          ? "bg-primary/15 text-primary border-primary/30"
                          : i < 3
                            ? "bg-accent/15 text-accent border-accent/30"
                            : "bg-secondary text-muted-foreground border-border"
                      }`}
                    >
                      {t.word} <span className="text-xs opacity-60">×{t.count}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not enough data to extract topics yet.</p>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-foreground mb-4">Recent Decisions</h3>
              <div className="space-y-2">
                {decisions.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-sm text-foreground truncate flex-1">{d.question}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{format(new Date(d.created_at), "MMM d")}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
