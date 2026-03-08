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
  { dot: "bg-primary", line: "bg-primary/30", label: "text-primary" },
  { dot: "bg-accent", line: "bg-accent/30", label: "text-accent" },
  { dot: "bg-yellow-400", line: "bg-yellow-400/30", label: "text-yellow-400" },
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

      {/* Unified timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[100px] top-0 bottom-0 w-px bg-border" />

        {/* Collect all unique years */}
        {(() => {
          const allYears = Array.from(
            new Set(scenarios.flatMap((s) => s.timeline.map((t) => t.year)))
          );

          return allYears.map((year, yi) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: yi * 0.15 }}
              className="relative mb-8 last:mb-0"
            >
              {/* Year label */}
              <div className="absolute left-0 top-0 w-[80px] text-right">
                <span className="text-sm font-display font-bold text-foreground">{year}</span>
              </div>

              {/* Dot */}
              <div className="absolute left-[96px] top-1 w-[9px] h-[9px] rounded-full bg-primary border-2 border-background z-10" />

              {/* Milestones for this year */}
              <div className="ml-[124px] space-y-2">
                {scenarios.map((s, si) => {
                  const entry = s.timeline.find((t) => t.year === year);
                  if (!entry) return null;
                  return (
                    <div
                      key={s.id}
                      className={`glass rounded-lg px-4 py-3 border-l-2`}
                      style={{ borderLeftColor: si === 0 ? "hsl(174, 72%, 52%)" : si === 1 ? "hsl(262, 60%, 58%)" : "#facc15" }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${colors[si % colors.length].dot}`} />
                        <span className={`text-xs font-display font-semibold ${colors[si % colors.length].label}`}>{s.title}</span>
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
