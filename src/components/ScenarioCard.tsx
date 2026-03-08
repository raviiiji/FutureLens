import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, ChevronRight, Shield, Zap, CheckCircle2 } from "lucide-react";

interface Scenario {
  id: number;
  title: string;
  description: string;
  riskLevel: "Low" | "Medium" | "High";
  growthPotential: number;
  timeline: { year: string; milestone: string }[];
  actions: string[];
}

interface ScenarioCardProps {
  scenario: Scenario;
  index: number;
  onClick: () => void;
}

const cardColors = [
  { border: "border-l-primary", accent: "from-primary/5 to-transparent", dot: "bg-primary", text: "text-primary", ring: "ring-primary/15" },
  { border: "border-l-accent", accent: "from-accent/5 to-transparent", dot: "bg-accent", text: "text-accent", ring: "ring-accent/15" },
  { border: "border-l-warm", accent: "from-warm/5 to-transparent", dot: "bg-warm", text: "text-warm", ring: "ring-warm/15" },
  { border: "border-l-sky", accent: "from-sky/5 to-transparent", dot: "bg-sky", text: "text-sky", ring: "ring-sky/15" },
];

export default function ScenarioCard({ scenario, index, onClick }: ScenarioCardProps) {
  const riskColor =
    scenario.riskLevel === "Low" ? "text-primary" :
    scenario.riskLevel === "Medium" ? "text-warm" : "text-destructive";
  const riskBg =
    scenario.riskLevel === "Low" ? "bg-primary/10" :
    scenario.riskLevel === "Medium" ? "bg-warm/10" : "bg-destructive/10";
  const RiskIcon = scenario.riskLevel === "Low" ? Shield : scenario.riskLevel === "Medium" ? AlertTriangle : Zap;

  const colorSet = cardColors[index % cardColors.length];

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`glass glass-hover rounded-xl p-5 text-left w-full group border-l-4 ${colorSet.border} bg-gradient-to-r ${colorSet.accent} transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${colorSet.dot} ring-2 ${colorSet.ring} ring-offset-1 ring-offset-background`} />
          <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
            {scenario.title}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{scenario.description}</p>
      
      {/* Metrics row */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${riskBg}`}>
          <RiskIcon className={`w-3 h-3 ${riskColor}`} />
          <span className={`text-xs font-display font-bold ${riskColor}`}>{scenario.riskLevel} Risk</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10">
          <TrendingUp className="w-3 h-3 text-primary" />
          <span className="text-xs font-display font-bold text-primary">{scenario.growthPotential}%</span>
        </div>
        <div className="ml-auto flex-shrink-0">
          <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scenario.growthPotential}%` }}
              transition={{ delay: index * 0.08 + 0.3, duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${colorSet.dot}`}
            />
          </div>
        </div>
      </div>

      {/* Preview of first action */}
      {scenario.actions[0] && (
        <div className="pt-3 border-t border-border/20">
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className={`w-3.5 h-3.5 ${colorSet.text} mt-0.5 shrink-0 opacity-60`} />
            <p className="text-xs text-muted-foreground line-clamp-1">{scenario.actions[0]}</p>
          </div>
        </div>
      )}
    </motion.button>
  );
}
