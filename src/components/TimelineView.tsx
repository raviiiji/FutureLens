import { motion } from "framer-motion";
import { Calendar, TrendingUp, Shield, Zap, Target, CheckCircle2 } from "lucide-react";

interface Scenario {
  id: number;
  title: string;
  timeline: { year: string; milestone: string }[];
  riskLevel: string;
  growthPotential: number;
}

interface TimelineViewProps {
  scenarios: Scenario[];
}

const colors = [
  { dot: "bg-primary", line: "bg-primary/30", label: "text-primary", bg: "bg-primary/8", border: "border-l-primary", borderColor: "hsl(174, 72%, 50%)" },
  { dot: "bg-accent", line: "bg-accent/30", label: "text-accent", bg: "bg-accent/8", border: "border-l-accent", borderColor: "hsl(262, 65%, 60%)" },
  { dot: "bg-warm", line: "bg-warm/30", label: "text-warm", bg: "bg-warm/8", border: "border-l-warm", borderColor: "hsl(35, 92%, 54%)" },
  { dot: "bg-sky", line: "bg-sky/30", label: "text-sky", bg: "bg-sky/8", border: "border-l-sky", borderColor: "hsl(200, 82%, 56%)" },
];

const yearIcons = [Zap, Target, TrendingUp, Shield, CheckCircle2];

export default function TimelineView({ scenarios }: TimelineViewProps) {
  const allYears = Array.from(
    new Set(scenarios.flatMap((s) => s.timeline.map((t) => t.year)))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium rounded-2xl p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl gradient-sky flex items-center justify-center">
            <Calendar className="w-5 h-5 text-sky-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground">5-Year Strategic Timeline</h3>
            <p className="text-xs text-muted-foreground">Projected milestones across all decision paths</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {scenarios.map((s, i) => {
            const c = colors[i % colors.length];
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${c.dot} ring-2 ring-offset-1 ring-offset-background ring-current`} style={{ color: c.borderColor }} />
                <span className={`text-sm font-display font-medium ${c.label}`}>{s.title}</span>
                <span className="text-[10px] text-muted-foreground bg-secondary/50 rounded-full px-2 py-0.5">{s.growthPotential}%</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative pl-2">
        {allYears.map((year, yi) => {
          const YearIcon = yearIcons[yi % yearIcons.length];
          return (
            <motion.div
              key={year}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: yi * 0.1 }}
              className="relative mb-0 last:mb-0"
            >
              {/* Year marker */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center relative z-10">
                  <YearIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-base font-display font-bold text-foreground">{year}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {yi === 0 ? "Foundation" : yi === 1 ? "Growth" : yi === 2 ? "Acceleration" : yi === 3 ? "Mastery" : "Leadership"}
                  </span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent ml-2" />
              </div>

              {/* Milestone cards */}
              <div className="ml-5 pl-8 border-l-2 border-border/30 space-y-3 pb-8 last:pb-0">
                {scenarios.map((s, si) => {
                  const entry = s.timeline.find((t) => t.year === year);
                  if (!entry) return null;
                  const c = colors[si % colors.length];
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: yi * 0.1 + si * 0.05 }}
                      className={`glass glass-hover rounded-xl px-4 py-3.5 border-l-3 ${c.border} relative group`}
                      style={{ borderLeftWidth: '3px', borderLeftColor: c.borderColor }}
                    >
                      <div className="absolute -left-[calc(2rem+10px)] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-background z-10" style={{ backgroundColor: c.borderColor, boxShadow: `0 0 8px ${c.borderColor}` }} />
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                        <span className={`text-xs font-display font-bold ${c.label}`}>{s.title}</span>
                        <span className={`text-[10px] font-display font-semibold px-1.5 py-0.5 rounded-full ${c.bg} ${c.label}`}>
                          {s.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                        {entry.milestone}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
