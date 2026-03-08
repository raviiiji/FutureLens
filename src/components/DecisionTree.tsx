import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleDot, Zap, Shield, TrendingUp, CheckCircle, Target, ChevronDown, ChevronUp, ArrowRight, Clock, ListChecks } from "lucide-react";

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
  { bg: "bg-primary/8", border: "border-primary/30", text: "text-primary", dot: "bg-primary", glow: "shadow-[0_0_20px_hsl(174_72%_50%/0.12)]", line: "from-primary/40 to-primary/10", ring: "ring-primary/20", gradientBar: "bg-primary" },
  { bg: "bg-accent/8", border: "border-accent/30", text: "text-accent", dot: "bg-accent", glow: "shadow-[0_0_20px_hsl(262_65%_60%/0.12)]", line: "from-accent/40 to-accent/10", ring: "ring-accent/20", gradientBar: "bg-accent" },
  { bg: "bg-warm/8", border: "border-warm/30", text: "text-warm", dot: "bg-warm", glow: "shadow-[0_0_20px_hsl(35_92%_54%/0.12)]", line: "from-warm/40 to-warm/10", ring: "ring-warm/20", gradientBar: "bg-warm" },
  { bg: "bg-rose/8", border: "border-rose/30", text: "text-rose", dot: "bg-rose", glow: "shadow-[0_0_20px_hsl(340_68%_56%/0.12)]", line: "from-rose/40 to-rose/10", ring: "ring-rose/20", gradientBar: "bg-rose" },
];

export default function DecisionTree({ scenarios, question }: DecisionTreeProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Root Decision Node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div className="glass-premium rounded-2xl px-6 py-5 text-center glow-primary border border-primary/30 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-display font-bold uppercase tracking-wider whitespace-nowrap">
            Decision Point
          </div>
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3 animate-float">
            <CircleDot className="w-7 h-7 text-primary-foreground" />
          </div>
          <p className="text-sm font-display font-bold text-foreground leading-snug max-w-sm mx-auto">
            {question || "Your Decision"}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">{scenarios.length} possible paths analyzed</p>
        </div>
      </motion.div>

      {/* Vertical connector */}
      <div className="flex justify-center">
        <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-border/30" />
      </div>

      {/* Scenario Branches - Vertical Layout */}
      <div className="space-y-4">
        {scenarios.map((s, i) => {
          const color = branchColors[i % branchColors.length];
          const isExpanded = expandedId === s.id;
          const RiskIcon = s.riskLevel === "Low" ? Shield : s.riskLevel === "Medium" ? Target : Zap;

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 180, damping: 20 }}
              className="relative"
            >
              {/* Branch connector */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className={`w-px h-4 bg-gradient-to-b ${color.line}`} />
              </div>

              <div
                className={`${color.bg} ${color.border} ${color.glow} border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer`}
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${color.dot} ring-2 ${color.ring} ring-offset-2 ring-offset-background`} />
                      <h4 className={`font-display font-bold text-base ${color.text}`}>{s.title}</h4>
                    </div>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className={`w-5 h-5 ${color.text} opacity-60`} />
                    </motion.div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.description}</p>

                  {/* Metrics Bar */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                      s.riskLevel === "Low" ? "bg-primary/10" : s.riskLevel === "Medium" ? "bg-warm/10" : "bg-destructive/10"
                    }`}>
                      <RiskIcon className={`w-3.5 h-3.5 ${s.riskLevel === "Low" ? "text-primary" : s.riskLevel === "Medium" ? "text-warm" : "text-destructive"}`} />
                      <span className={`text-xs font-display font-bold ${s.riskLevel === "Low" ? "text-primary" : s.riskLevel === "Medium" ? "text-warm" : "text-destructive"}`}>
                        {s.riskLevel} Risk
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-3.5 h-3.5 ${color.text}`} />
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.growthPotential}%` }}
                            transition={{ delay: i * 0.12 + 0.3, duration: 0.8 }}
                            className={`h-full rounded-full ${color.gradientBar}`}
                          />
                        </div>
                        <span className={`text-xs font-display font-bold ${color.text}`}>{s.growthPotential}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-display">{s.timeline.length} milestones</span>
                      <span className="mx-1 text-border">•</span>
                      <ListChecks className="w-3 h-3" />
                      <span className="text-[10px] font-display">{s.actions.length} actions</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-5 border-t border-border/20 pt-4">
                        {/* Timeline */}
                        <div>
                          <h5 className={`font-display font-bold text-sm mb-3 flex items-center gap-2 ${color.text}`}>
                            <Clock className="w-4 h-4" /> Timeline
                          </h5>
                          <div className="space-y-2 relative ml-2">
                            <div className={`absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b ${color.line}`} />
                            {s.timeline.map((t, ti) => (
                              <motion.div
                                key={ti}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ti * 0.06 }}
                                className="flex items-start gap-3 relative"
                              >
                                <div className={`w-3 h-3 rounded-full ${color.dot} border-2 border-background shrink-0 z-10 mt-0.5`} />
                                <div className="flex-1">
                                  <span className={`text-xs font-display font-bold ${color.text}`}>{t.year}</span>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{t.milestone}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div>
                          <h5 className={`font-display font-bold text-sm mb-3 flex items-center gap-2 ${color.text}`}>
                            <CheckCircle className="w-4 h-4" /> Action Items
                          </h5>
                          <div className="space-y-2">
                            {s.actions.map((a, ai) => (
                              <motion.div
                                key={ai}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ai * 0.05 }}
                                className="flex items-start gap-2.5"
                              >
                                <span className={`w-5 h-5 rounded-full ${color.dot} text-background flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5`}>
                                  {ai + 1}
                                </span>
                                <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
