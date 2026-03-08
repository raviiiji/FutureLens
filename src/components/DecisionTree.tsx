import { motion } from "framer-motion";

interface Scenario {
  id: number;
  title: string;
  description: string;
  riskLevel: string;
  growthPotential: number;
  timeline: { year: string; milestone: string }[];
  actions: string[];
}

interface DecisionTreeProps {
  scenarios: Scenario[];
  question?: string;
}

const branchColors = [
  { bg: "bg-primary/15", border: "border-primary/40", text: "text-primary", dot: "bg-primary" },
  { bg: "bg-accent/15", border: "border-accent/40", text: "text-accent", dot: "bg-accent" },
  { bg: "bg-warm/15", border: "border-warm/40", text: "text-warm", dot: "bg-warm" },
  { bg: "bg-rose/15", border: "border-rose/40", text: "text-rose", dot: "bg-rose" },
];

export default function DecisionTree({ scenarios, question }: DecisionTreeProps) {
  return (
    <div className="relative">
      {/* Root node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center mb-8"
      >
        <div className="glass rounded-2xl px-6 py-4 max-w-xs text-center glow-primary border border-primary/30">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-2">
            <span className="text-primary-foreground font-bold text-lg">?</span>
          </div>
          <p className="text-sm font-display font-semibold text-foreground line-clamp-2">
            {question || "Your Decision"}
          </p>
        </div>
      </motion.div>

      {/* Connector lines */}
      <div className="flex justify-center mb-4">
        <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-border" />
      </div>

      {/* Branch connector */}
      <div className="relative flex justify-center mb-4">
        <div
          className="h-px bg-gradient-to-r from-transparent via-border to-transparent"
          style={{ width: `${Math.min(scenarios.length * 220, 900)}px` }}
        />
        {scenarios.map((_, i) => {
          const total = scenarios.length;
          const offset = (i - (total - 1) / 2) * 220;
          return (
            <div
              key={i}
              className="absolute w-px h-8 bg-border"
              style={{ left: `calc(50% + ${offset}px)`, top: 0 }}
            />
          );
        })}
      </div>

      {/* Scenario branches */}
      <div className="flex justify-center gap-4 flex-wrap">
        {scenarios.map((s, i) => {
          const color = branchColors[i % branchColors.length];
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`${color.bg} ${color.border} border rounded-2xl p-5 w-[200px] sm:w-[220px] flex-shrink-0`}
            >
              <div className={`w-3 h-3 rounded-full ${color.dot} mb-3`} />
              <h4 className={`font-display font-bold text-sm mb-2 ${color.text}`}>{s.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{s.description}</p>
              
              {/* Mini timeline */}
              <div className="space-y-2">
                {s.timeline.slice(0, 3).map((t, ti) => (
                  <div key={ti} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${color.dot} mt-1.5 shrink-0`} />
                    <div>
                      <span className={`text-[10px] font-display font-bold ${color.text}`}>{t.year}</span>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{t.milestone}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-3 pt-3 border-t border-border/30 flex justify-between">
                <span className={`text-[10px] font-display font-semibold ${
                  s.riskLevel === "Low" ? "text-primary" : s.riskLevel === "Medium" ? "text-warm" : "text-destructive"
                }`}>
                  {s.riskLevel} Risk
                </span>
                <span className={`text-[10px] font-display font-semibold ${color.text}`}>
                  {s.growthPotential}% Growth
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
