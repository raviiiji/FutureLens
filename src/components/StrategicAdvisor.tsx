import { motion } from "framer-motion";
import { Brain, Shield, Zap, Target, TrendingUp, AlertTriangle, Lightbulb, BarChart3, Layers, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface Scenario {
  id: number;
  title: string;
  description: string;
  riskLevel: "Low" | "Medium" | "High";
  growthPotential: number;
  timeline: { year: string; milestone: string }[];
  actions: string[];
}

interface StrategicAdvisorProps {
  summary: string;
  scenarios: Scenario[];
  question: string;
}

export default function StrategicAdvisor({ summary, scenarios, question }: StrategicAdvisorProps) {
  const bestGrowth = scenarios.reduce((best, s) => s.growthPotential > best.growthPotential ? s : best, scenarios[0]);
  const lowestRisk = scenarios.find((s) => s.riskLevel === "Low") || scenarios[0];
  const highRiskCount = scenarios.filter((s) => s.riskLevel === "High").length;
  const avgGrowth = Math.round(scenarios.reduce((sum, s) => sum + s.growthPotential, 0) / scenarios.length);
  const totalActions = scenarios.reduce((sum, s) => sum + s.actions.length, 0);

  // Find balanced pick (medium risk + high growth)
  const balancedPick = [...scenarios].sort((a, b) => {
    const riskScore = (r: string) => r === "Low" ? 1 : r === "Medium" ? 2 : 3;
    const scoreA = a.growthPotential - riskScore(a.riskLevel) * 15;
    const scoreB = b.growthPotential - riskScore(b.riskLevel) * 15;
    return scoreB - scoreA;
  })[0];

  const insights = [
    {
      icon: TrendingUp,
      title: "Highest Growth Potential",
      value: `${bestGrowth.title} — ${bestGrowth.growthPotential}%`,
      detail: bestGrowth.description,
      color: "text-primary",
      bg: "bg-primary/10",
      borderColor: "border-l-primary",
    },
    {
      icon: Shield,
      title: "Safest Path",
      value: `${lowestRisk.title} — ${lowestRisk.riskLevel} Risk`,
      detail: `This path offers the most stability with ${lowestRisk.growthPotential}% growth potential.`,
      color: "text-accent",
      bg: "bg-accent/10",
      borderColor: "border-l-accent",
    },
    {
      icon: AlertTriangle,
      title: "Risk Assessment",
      value: `${highRiskCount} high-risk ${highRiskCount === 1 ? "path" : "paths"} detected`,
      detail: `Average growth across all scenarios: ${avgGrowth}%. Consider your risk tolerance carefully.`,
      color: "text-warm",
      bg: "bg-warm/10",
      borderColor: "border-l-warm",
    },
    {
      icon: Lightbulb,
      title: "Total Action Items",
      value: `${totalActions} recommended actions`,
      detail: "Review common first steps that apply regardless of your choice.",
      color: "text-sky",
      bg: "bg-sky/10",
      borderColor: "border-l-sky",
    },
  ];

  return (
    <div className="space-y-6">
      {/* AI Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium rounded-2xl p-6 border-l-4 border-l-primary relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center animate-float">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-lg">AI Strategic Analysis</h3>
              <p className="text-xs text-muted-foreground">Powered by FutureLens Intelligence Engine</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </div>
      </motion.div>

      {/* Balanced Pick Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rainbow-border rounded-2xl p-5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl gradient-aurora flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-display font-bold text-foreground">Recommended Path</h4>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">Best Balance</span>
            </div>
            <p className="font-display font-semibold text-primary text-sm mb-1">{balancedPick.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{balancedPick.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-primary" /> {balancedPick.growthPotential}% Growth
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className={`w-3 h-3 ${balancedPick.riskLevel === "Low" ? "text-primary" : balancedPick.riskLevel === "Medium" ? "text-warm" : "text-destructive"}`} />
                {balancedPick.riskLevel} Risk
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Insights Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className={`glass glass-hover rounded-2xl p-5 border-l-3 ${insight.borderColor}`}
            style={{ borderLeftWidth: '3px' }}
          >
            <div className={`w-9 h-9 rounded-lg ${insight.bg} flex items-center justify-center mb-3`}>
              <insight.icon className={`w-4 h-4 ${insight.color}`} />
            </div>
            <h4 className="font-display font-semibold text-foreground text-sm mb-1">{insight.title}</h4>
            <p className={`text-sm font-display font-medium ${insight.color} mb-2`}>{insight.value}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{insight.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6 overflow-hidden"
      >
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> Side-by-Side Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left font-display font-bold text-muted-foreground pb-3 pr-4">Path</th>
                <th className="text-center font-display font-bold text-muted-foreground pb-3 px-2">Risk</th>
                <th className="text-center font-display font-bold text-muted-foreground pb-3 px-2">Growth</th>
                <th className="text-center font-display font-bold text-muted-foreground pb-3 px-2">Steps</th>
                <th className="text-center font-display font-bold text-muted-foreground pb-3 pl-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, si) => (
                <tr key={s.id} className="border-b border-border/20 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${["bg-primary", "bg-accent", "bg-warm", "bg-rose"][si % 4]}`} />
                      <span className="font-display font-semibold text-foreground">{s.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <span className={`text-xs font-display font-bold px-2.5 py-1 rounded-full ${
                      s.riskLevel === "Low" ? "bg-primary/15 text-primary" :
                      s.riskLevel === "Medium" ? "bg-warm/15 text-warm" :
                      "bg-destructive/15 text-destructive"
                    }`}>
                      {s.riskLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.growthPotential}%` }}
                          transition={{ delay: 0.6 + si * 0.1, duration: 0.6 }}
                          className={`h-full rounded-full ${["bg-primary", "bg-accent", "bg-warm", "bg-rose"][si % 4]}`}
                        />
                      </div>
                      <span className="text-xs text-primary font-display font-bold">{s.growthPotential}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-center text-xs font-display font-medium text-muted-foreground">{s.timeline.length}</td>
                  <td className="py-3.5 pl-2 text-center text-xs font-display font-medium text-muted-foreground">{s.actions.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Top Actions Across All Scenarios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" /> Priority Actions by Path
        </h3>
        <div className="space-y-4">
          {scenarios.map((s, si) => (
            <div key={s.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${["bg-primary", "bg-accent", "bg-warm", "bg-rose"][si % 4]}`} />
                <span className={`text-sm font-display font-bold ${["text-primary", "text-accent", "text-warm", "text-rose"][si % 4]}`}>{s.title}</span>
              </div>
              <div className="ml-5 space-y-1.5">
                {s.actions.slice(0, 3).map((action, ai) => (
                  <div key={ai} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
