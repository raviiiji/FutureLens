import { motion } from "framer-motion";

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
  { dot: "bg-primary", line: "bg-primary/30", label: "text-primary", border: "hsl(174, 72%, 52%)" },
  { dot: "bg-accent", line: "bg-accent/30", label: "text-accent", border: "hsl(262, 60%, 58%)" },
  { dot: "bg-warm", line: "bg-warm/30", label: "text-warm", border: "hsl(35, 90%, 55%)" },
];

export default function TimelineView({ scenarios }: TimelineViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 mb-2">
        {scenarios.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colors[i % colors.length].dot}`} />
            <span className={`text-sm font-display font-medium ${colors[i % colors.length].label}`}>{s.title}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-[100px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/30 to-warm/20" />

        {(() => {
          const allYears = Array.from(
            new Set(scenarios.flatMap((s) => s.timeline.map((t) => t.year)))
          );

          return allYears.map((year, yi) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: yi * 0.12 }}
              className="relative mb-8 last:mb-0"
            >
              <div className="absolute left-0 top-0 w-[80px] text-right">
                <span className="text-sm font-display font-bold text-foreground">{year}</span>
              </div>

              <div className="absolute left-[96px] top-1 w-[9px] h-[9px] rounded-full bg-primary border-2 border-background z-10 shadow-[0_0_8px_hsl(174_72%_52%/0.5)]" />

              <div className="ml-[124px] space-y-2">
                {scenarios.map((s, si) => {
                  const entry = s.timeline.find((t) => t.year === year);
                  if (!entry) return null;
                  const c = colors[si % colors.length];
                  return (
                    <div
                      key={s.id}
                      className="glass rounded-lg px-4 py-3 border-l-2 hover:scale-[1.01] transition-transform"
                      style={{ borderLeftColor: c.border }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                        <span className={`text-xs font-display font-semibold ${c.label}`}>{s.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.milestone}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ));
        })()}
      </div>
    </div>
  );
}
