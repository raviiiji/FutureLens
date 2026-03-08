import { motion } from "framer-motion";
import { Brain, GitBranch, Clock, TreePine, Lightbulb } from "lucide-react";

export default function AnalysisSkeleton() {
  const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent before:animate-[shimmer_2s_infinite]";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="glass-premium rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center animate-pulse">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="space-y-2 flex-1">
            <div className={`h-4 w-48 bg-secondary/80 rounded-lg ${shimmerClass}`} />
            <div className={`h-3 w-32 bg-secondary/60 rounded-lg ${shimmerClass}`} />
          </div>
        </div>
        <div className="space-y-2">
          <div className={`h-3 w-full bg-secondary/50 rounded-lg ${shimmerClass}`} />
          <div className={`h-3 w-5/6 bg-secondary/50 rounded-lg ${shimmerClass}`} />
          <div className={`h-3 w-4/6 bg-secondary/50 rounded-lg ${shimmerClass}`} />
        </div>
      </div>

      {/* Scenario cards skeleton */}
      <div className="grid gap-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="glass rounded-xl p-5 border-l-4 border-l-secondary"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full bg-secondary/80 animate-pulse`} />
              <div className={`h-5 w-40 bg-secondary/70 rounded-lg ${shimmerClass}`} />
            </div>
            <div className="space-y-2 mb-4">
              <div className={`h-3 w-full bg-secondary/40 rounded-lg ${shimmerClass}`} />
              <div className={`h-3 w-3/4 bg-secondary/40 rounded-lg ${shimmerClass}`} />
            </div>
            <div className="flex items-center gap-3">
              <div className={`h-6 w-20 bg-secondary/50 rounded-full ${shimmerClass}`} />
              <div className={`h-6 w-16 bg-secondary/50 rounded-full ${shimmerClass}`} />
              <div className="ml-auto">
                <div className={`h-1.5 w-20 bg-secondary/40 rounded-full ${shimmerClass}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab hints */}
      <div className="flex items-center justify-center gap-6 pt-4">
        {[
          { icon: GitBranch, label: "Paths" },
          { icon: Clock, label: "Timeline" },
          { icon: TreePine, label: "Tree" },
          { icon: Lightbulb, label: "Advisor" },
        ].map((tab, i) => (
          <motion.div
            key={tab.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex items-center gap-1.5 text-muted-foreground"
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="text-xs font-display">{tab.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
