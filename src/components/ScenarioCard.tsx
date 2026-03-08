import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, ChevronRight } from "lucide-react";

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

export default function ScenarioCard({ scenario, index, onClick }: ScenarioCardProps) {
  const riskColor =
    scenario.riskLevel === "Low"
      ? "text-primary"
      : scenario.riskLevel === "Medium"
        ? "text-yellow-400"
        : "text-destructive";

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="glass glass-hover rounded-xl p-5 text-left w-full group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {scenario.title}
        </h3>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{scenario.description}</p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className={`w-3.5 h-3.5 ${riskColor}`} />
          <span className="text-xs text-muted-foreground">{scenario.riskLevel} Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">{scenario.growthPotential}% Growth</span>
        </div>
        <div className="ml-auto">
          <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${scenario.growthPotential}%` }}
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
