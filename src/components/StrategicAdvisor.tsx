import { motion } from "framer-motion";
import { Brain, Shield, Zap, Target, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

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

  const insights = [
    {
      icon: TrendingUp,
      title: "Highest Growth Potential",
      value: `${bestGrowth.title} — ${bestGrowth.growthPotential}%`,
      detail: bestGrowth.description,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Shield,
      title: "Safest Path",
      value: `${lowestRisk.title} — ${lowestRisk.riskLevel} Risk`,
      detail: `This path offers the most stability with ${lowestRisk.growthPotential}% growth potential.`,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: AlertTriangle,
      title: "Risk Assessment",
      value: `${highRiskCount} high-risk ${highRiskCount === 1 ? "path" : "paths"} detected`,
      detail: `Average growth across all scenarios: ${avgGrowth}%. Consider your risk tolerance carefully.`,
      color: "text-warm",
      bg: "bg-warm/10",
    },
    {
      icon: Lightbulb,
      title: "Action Items",
      value: `${totalActions} recommended actions across all paths`,
      detail: "Review the actions for each scenario to identify common first steps that apply regardless of your choice.",
      color: "text-sky",
      bg: "bg-sky/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* AI Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium rounded-2xl p-6 border-l-4 border-l-primary"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center animate-float">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground">AI Strategic Analysis</h3>
            <p className="text-xs text-muted-foreground">Powered by Aevora Intelligence Engine</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
      </motion.div>

      {/* Key Insights Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass glass-hover rounded-2xl p-5"
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

      {/* Comparison Quick View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Quick Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left font-display font-semibold text-muted-foreground pb-3 pr-4">Scenario</th>
                <th className="text-center font-display font-semibold text-muted-foreground pb-3 px-2">Risk</th>
                <th className="text-center font-display font-semibold text-muted-foreground pb-3 px-2">Growth</th>
                <th className="text-center font-display font-semibold text-muted-foreground pb-3 pl-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.id} className="border-b border-border/20 last:border-0">
                  <td className="py-3 pr-4 font-display font-medium text-foreground">{s.title}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`text-xs font-display font-semibold px-2 py-1 rounded-full ${
                      s.riskLevel === "Low" ? "bg-primary/15 text-primary" :
                      s.riskLevel === "Medium" ? "bg-warm/15 text-warm" :
                      "bg-destructive/15 text-destructive"
                    }`}>
                      {s.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full gradient-primary rounded-full" style={{ width: `${s.growthPotential}%` }} />
                      </div>
                      <span className="text-xs text-primary font-display font-bold">{s.growthPotential}%</span>
                    </div>
                  </td>
                  <td className="py-3 pl-2 text-center text-xs text-muted-foreground">{s.actions.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
