import { motion } from "framer-motion";
import { CircleDot, ArrowDownRight, Zap, Shield, TrendingUp, CheckCircle, Target } from "lucide-react";

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
  { bg: "bg-primary/8", border: "border-primary/25", text: "text-primary", dot: "bg-primary", glow: "shadow-[0_0_20px_hsl(174_72%_50%/0.15)]", gradient: "from-primary/10 to-transparent", ring: "ring-primary/20" },
  { bg: "bg-accent/8", border: "border-accent/25", text: "text-accent", dot: "bg-accent", glow: "shadow-[0_0_20px_hsl(262_65%_60%/0.15)]", gradient: "from-accent/10 to-transparent", ring: "ring-accent/20" },
  { bg: "bg-warm/8", border: "border-warm/25", text: "text-warm", dot: "bg-warm", glow: "shadow-[0_0_20px_hsl(35_92%_54%/0.15)]", gradient: "from-warm/10 to-transparent", ring: "ring-warm/20" },
  { bg: "bg-rose/8", border: "border-rose/25", text: "text-rose", dot: "bg-rose", glow: "shadow-[0_0_20px_hsl(340_68%_56%/0.15)]", gradient: "from-rose/10 to-transparent", ring: "ring-rose/20" },
];

export default function DecisionTree({ scenarios, question }: DecisionTreeProps) {
  return (
    <div className="relative min-w-[600px]">
      {/* Root node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center mb-6"
      >
        <div className="glass-premium rounded-2xl px-8 py-5 max-w-sm text-center glow-primary border border-primary/30 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-display font-bold uppercase tracking-wider">
            Decision Point
          </div>
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3 animate-float">
            <CircleDot className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm font-display font-bold text-foreground leading-snug">
            {question || "Your Decision"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{scenarios.length} possible paths analyzed</p>
        </div>
      </motion.div>

      {/* Connector lines */}
      <div className="flex justify-center mb-3">
        <div className="w-px h-6 bg-gradient-to-b from-primary/60 to-border/30" />
      </div>

      <div className="relative flex justify-center mb-3">
        <div
          className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          style={{ width: `${Math.min(scenarios.length * 240, 960)}px` }}
        />
        {scenarios.map((_, i) => {
          const total = scenarios.length;
          const offset = (i - (total - 1) / 2) * 240;
          return (
            <div
              key={i}
              className="absolute w-px h-6 bg-gradient-to-b from-border/50 to-border/20"
              style={{ left: `calc(50% + ${offset}px)`, top: 0 }}
            />
          );
        })}
      </div>

      {/* Branch cards */}
      <div className="flex justify-center gap-5 flex-wrap">
        {scenarios.map((s, i) => {
          const color = branchColors[i % branchColors.length];
          const riskIcon = s.riskLevel === "Low" ? Shield : s.riskLevel === "Medium" ? Target : Zap;
          const RiskIcon = riskIcon;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`${color.bg} ${color.border} ${color.glow} border rounded-2xl w-[220px] flex-shrink-0 transition-all duration-300 overflow-hidden`}
            >
              {/* Card header with gradient */}
              <div className={`bg-gradient-to-b ${color.gradient} p-4 pb-3`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3.5 h-3.5 rounded-full ${color.dot} ring-2 ${color.ring} ring-offset-1 ring-offset-background`} />
                  <h4 className={`font-display font-bold text-sm ${color.text} flex-1`}>{s.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{s.description}</p>
              </div>

              <div className="px-4 pb-4 space-y-3">
                {/* Metrics */}
                <div className="flex items-center gap-3 py-2 border-y border-border/20">
                  <div className="flex items-center gap-1">
                    <RiskIcon className={`w-3 h-3 ${s.riskLevel === "Low" ? "text-primary" : s.riskLevel === "Medium" ? "text-warm" : "text-destructive"}`} />
                    <span className={`text-[10px] font-display font-bold ${s.riskLevel === "Low" ? "text-primary" : s.riskLevel === "Medium" ? "text-warm" : "text-destructive"}`}>
                      {s.riskLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-3 h-3 ${color.text}`} />
                    <span className={`text-[10px] font-display font-bold ${color.text}`}>{s.growthPotential}%</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.growthPotential}%` }}
                        transition={{ delay: i * 0.12 + 0.3, duration: 0.8 }}
                        className={`h-full rounded-full ${color.dot}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Key milestones */}
                <div className="space-y-1.5">
                  {s.timeline.slice(0, 3).map((t, ti) => (
                    <div key={ti} className="flex items-start gap-2">
                      <ArrowDownRight className={`w-3 h-3 ${color.text} mt-0.5 shrink-0 opacity-60`} />
                      <div className="min-w-0">
                        <span className={`text-[10px] font-display font-bold ${color.text}`}>{t.year}</span>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 leading-tight">{t.milestone}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top action */}
                {s.actions[0] && (
                  <div className="pt-2 border-t border-border/20">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle className={`w-3 h-3 ${color.text} mt-0.5 shrink-0`} />
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                        {s.actions[0]}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
