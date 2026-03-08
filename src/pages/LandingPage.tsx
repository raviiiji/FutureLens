import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Brain, GitBranch, Sparkles, Zap, Star, Download, Clock, TreePine, Lightbulb, MessageCircle, ChevronRight, Target, ArrowUpRight, Shield, TrendingUp, Users, Globe, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useCountUp } from "@/hooks/useCountUp";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  { icon: Brain, title: "Decision Simulation", description: "Generate 2-4 AI-powered future scenarios with risk analysis, growth projections, and strategic recommendations.", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", glow: "hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]" },
  { icon: GitBranch, title: "Scenario Comparison", description: "Compare branching outcomes side by side — risk levels, growth potential, and 5-year timelines at a glance.", color: "text-accent", bg: "bg-accent/10", border: "border-accent/20", glow: "hover:shadow-[0_0_30px_hsl(var(--accent)/0.15)]" },
  { icon: Clock, title: "5-Year Timelines", description: "Visualize how each decision path unfolds with detailed yearly milestones from foundation to leadership.", color: "text-sky", bg: "bg-sky/10", border: "border-sky/20", glow: "hover:shadow-[0_0_30px_hsl(var(--sky)/0.15)]" },
  { icon: TreePine, title: "Interactive Decision Tree", description: "Explore your options through an expandable tree with metrics, milestones, and action items per branch.", color: "text-warm", bg: "bg-warm/10", border: "border-warm/20", glow: "hover:shadow-[0_0_30px_hsl(var(--warm)/0.15)]" },
  { icon: Lightbulb, title: "Strategic Advisor", description: "AI identifies the highest-growth, safest, and best-balanced paths with a recommended course of action.", color: "text-rose", bg: "bg-rose/10", border: "border-rose/20", glow: "hover:shadow-[0_0_30px_hsl(var(--rose)/0.15)]" },
  { icon: MessageCircle, title: "Follow-Up Chat", description: "Ask clarifying questions about any scenario and get streaming, context-aware AI responses in real time.", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", glow: "hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]" },
  { icon: Star, title: "Favorites & Drag Reorder", description: "Star important decisions, drag to reorder priorities, and build your personal decision library.", color: "text-gold", bg: "bg-gold/10", border: "border-gold/20", glow: "hover:shadow-[0_0_30px_hsl(var(--gold)/0.15)]" },
  { icon: Download, title: "PDF Export & Sharing", description: "Download beautifully formatted reports or share decision simulations with anyone via a unique link.", color: "text-accent", bg: "bg-accent/10", border: "border-accent/20", glow: "hover:shadow-[0_0_30px_hsl(var(--accent)/0.15)]" },
];

const steps = [
  { number: "01", title: "Describe Your Decision", description: "Type your question naturally — career moves, education paths, business strategies, anything.", icon: MessageCircle, gradient: "gradient-primary" },
  { number: "02", title: "AI Simulates Futures", description: "Aevora's intelligence engine analyzes trends, risks, and opportunities across multiple scenarios.", icon: Brain, gradient: "gradient-aurora" },
  { number: "03", title: "Explore & Compare", description: "Review timelines, decision trees, and strategic insights. Ask follow-up questions for deeper clarity.", icon: GitBranch, gradient: "gradient-warm" },
  { number: "04", title: "Decide with Confidence", description: "Choose your path armed with data-driven analysis, risk assessment, and concrete action steps.", icon: Target, gradient: "gradient-sky" },
];

const testimonials = [
  { quote: "Aevora helped me decide between pursuing a master's degree and entering the job market. The 5-year timeline comparison was eye-opening.", name: "Career Changer", role: "Software Engineer → Data Scientist", avatar: "🎯" },
  { quote: "I used it to compare bootstrapping vs. raising VC funding. The risk analysis and strategic advisor gave me clarity I couldn't find anywhere else.", name: "Startup Founder", role: "Tech Entrepreneur", avatar: "🚀" },
  { quote: "The follow-up chat is incredible — I could drill into specific scenarios and get actionable advice on demand.", name: "Product Manager", role: "Big Tech Company", avatar: "💡" },
];

const useCases = [
  { emoji: "🎯", title: "Career Pivots", desc: "\"Should I switch to AI development or stay in web dev?\"", metrics: "85% growth • Low risk" },
  { emoji: "🎓", title: "Education Decisions", desc: "\"Is a master's degree worth it for my career goals?\"", metrics: "70% growth • Medium risk" },
  { emoji: "🚀", title: "Startup Strategy", desc: "\"Should I bootstrap or seek venture capital?\"", metrics: "92% growth • High risk" },
  { emoji: "💻", title: "Technology Choices", desc: "\"Which tech stack should I invest in learning?\"", metrics: "78% growth • Low risk" },
  { emoji: "🏠", title: "Life Decisions", desc: "\"Should I relocate for this job opportunity?\"", metrics: "65% growth • Medium risk" },
  { emoji: "📈", title: "Investment Strategy", desc: "\"Should I diversify or focus my portfolio?\"", metrics: "75% growth • Medium risk" },
];

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const { count, ref } = useCountUp(target, 2200);
  return (
    <div ref={ref} className="text-3xl md:text-4xl font-display font-bold gradient-text-aurora tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Ambient orbs — bigger + more visible in dark */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-[700px] h-[700px] orb-1 rounded-full animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] orb-2 rounded-full animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] orb-3 rounded-full animate-pulse-glow" style={{ animationDelay: "3s" }} />
        <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] orb-4 rounded-full animate-pulse-glow" style={{ animationDelay: "4.5s" }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-primary">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Aevora</span>
            <span className="hidden sm:inline text-[10px] font-display font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors font-display">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors font-display">How It Works</a>
            <a href="#use-cases" className="text-sm text-muted-foreground hover:text-primary transition-colors font-display">Use Cases</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-primary transition-colors font-display">Stories</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="hero" size="sm" onClick={() => navigate("/dashboard")} className="group">
              Launch App <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 grid-pattern opacity-[0.15] dark:opacity-[0.08]" />
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-primary/20 mb-8 group cursor-default">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-display font-medium text-foreground">AI Decision Intelligence Platform</span>
              <ChevronRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl lg:text-[5.5rem] font-display font-bold leading-[1.05] mb-6 tracking-tight">
              Simulate Tomorrow.{" "}
              <br className="hidden md:block" />
              <span className="gradient-text-aurora glow-text">Decide Today.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Explore every possible future of your choices. AI-powered scenario analysis with 5-year timelines, risk assessment, and strategic intelligence — all in seconds.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate("/dashboard")} className="group text-base">
                Start Simulating Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="glass" size="xl" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="text-base">
                Explore Features
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-muted-foreground font-display uppercase tracking-widest">Scroll to explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-5 h-8 rounded-full border-2 border-primary/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== ANIMATED STATS ===== */}
      <section className="py-20 relative z-10 -mt-10">
        <div className="container mx-auto px-6">
          <div className="glass-premium rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto glow-primary border border-primary/15">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { target: 500, suffix: "+", label: "Decisions Simulated", icon: Brain },
                { target: 2000, suffix: "+", label: "Scenarios Generated", icon: GitBranch },
                { target: 98, suffix: "%", label: "User Satisfaction", icon: Star },
                { target: 24, suffix: "/7", label: "Always Available", icon: Zap },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-3 opacity-60" />
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  <div className="text-[11px] text-muted-foreground mt-1.5 font-display uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <span className="text-xs font-display font-bold uppercase tracking-widest text-primary mb-4 block">Capabilities</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-5">
              Everything You Need to{" "}
              <span className="gradient-text-aurora">Decide Smarter</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Eight powerful features that transform uncertainty into strategic clarity.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className={`group glass rounded-2xl p-6 border ${f.border} hover:border-primary/30 transition-all duration-300 ${f.glow}`}
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-display text-base font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <span className="text-xs font-display font-bold uppercase tracking-widest text-accent mb-4 block">Process</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-5">
              Four Steps to{" "}
              <span className="gradient-text">Strategic Clarity</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">From question to confidence in minutes, not months.</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {steps.map((s, i) => (
                <motion.div
                  key={s.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/20 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Step number watermark */}
                  <div className="absolute -top-2 -right-2 text-8xl font-display font-bold text-foreground/[0.03] dark:text-foreground/[0.04] select-none">{s.number}</div>
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl ${s.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <s.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-display font-bold text-primary uppercase tracking-wider">Step {s.number}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEMO PREVIEW ===== */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-display font-bold uppercase tracking-widest text-warm mb-4 block">Preview</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-5">
              See Aevora <span className="gradient-text-warm">In Action</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto glass-premium rounded-3xl p-6 sm:p-8 glow-primary relative overflow-hidden"
          >
            {/* Subtle grid overlay */}
            <div className="absolute inset-0 grid-pattern opacity-[0.04] rounded-3xl" />
            <div className="relative">
              {/* Mock chat */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-end">
                  <div className="gradient-primary rounded-2xl rounded-br-md px-5 py-3 max-w-sm">
                    <p className="text-sm font-medium text-primary-foreground">Should I learn AI development or cybersecurity?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="glass rounded-2xl rounded-bl-md px-5 py-3 max-w-lg border border-border/30">
                    <p className="text-sm text-foreground/80 leading-relaxed">Based on 2024-2026 market analysis, both fields show strong growth. AI development offers higher ceiling potential (92%) but requires continuous learning, while cybersecurity provides more stability...</p>
                  </div>
                </div>
              </div>

              {/* Mock scenario cards */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { title: "AI Development", risk: "Medium", growth: 92, color: "border-l-primary", dot: "bg-primary", riskBg: "bg-warm/10 text-warm" },
                  { title: "Cybersecurity", risk: "Low", growth: 78, color: "border-l-accent", dot: "bg-accent", riskBg: "bg-primary/10 text-primary" },
                  { title: "Hybrid Approach", risk: "Medium", growth: 85, color: "border-l-warm", dot: "bg-warm", riskBg: "bg-warm/10 text-warm" },
                ].map((s, i) => (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ y: -2 }}
                    className={`glass rounded-xl p-4 border-l-4 ${s.color} transition-all duration-200`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                      <span className="text-sm font-display font-bold text-foreground">{s.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-display font-bold px-2 py-0.5 rounded-full ${s.riskBg}`}>{s.risk}</span>
                      <span className="text-[10px] font-display font-bold text-primary">{s.growth}% growth</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.growth}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                        className={`h-full rounded-full ${s.dot}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== USE CASES ===== */}
      <section id="use-cases" className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-display font-bold uppercase tracking-widest text-sky mb-4 block">Applications</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-5">
              Real-World <span className="gradient-text-warm">Use Cases</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">From career pivots to investment strategy — Aevora handles it all.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {useCases.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-5 cursor-pointer group border border-border/30 hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.08)]"
                onClick={() => navigate("/dashboard")}
              >
                <span className="text-3xl mb-3 block">{c.emoji}</span>
                <h3 className="font-display text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="text-sm text-muted-foreground italic mb-3">{c.desc}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border/20">
                  <span className="text-[10px] font-display font-medium text-muted-foreground">{c.metrics}</span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-display font-bold uppercase tracking-widest text-gold mb-4 block">Stories</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-5">
              Trusted by <span className="gradient-text-aurora">Decision Makers</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 border border-border/30 hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
              >
                {/* Quote mark */}
                <div className="absolute top-4 right-4 text-5xl font-display text-foreground/[0.04] dark:text-foreground/[0.06] select-none leading-none">"</div>
                <div className="relative">
                  <div className="text-4xl mb-4">{t.avatar}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.quote}"</p>
                  <div className="pt-4 border-t border-border/20">
                    <p className="font-display font-bold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rainbow-border rounded-3xl p-12 sm:p-20 max-w-4xl mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03]" />
            <div className="absolute inset-0 grid-pattern opacity-[0.03]" />
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="w-20 h-20 rounded-3xl gradient-aurora flex items-center justify-center mx-auto mb-8 glow-primary"
              >
                <Brain className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
                Ready to <span className="gradient-text-aurora">Simulate Your Future?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Stop guessing. Start exploring. Make your next big decision with AI-powered foresight and strategic intelligence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="xl" onClick={() => navigate("/dashboard")} className="group text-base">
                  Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="glass" size="xl" onClick={() => navigate("/auth")} className="text-base">
                  Create Account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/30 py-12 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-sm font-bold text-foreground">Aevora</span>
              <span className="text-[10px] font-display text-muted-foreground">AI Decision Intelligence</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-xs text-muted-foreground hover:text-primary transition-colors font-display">Features</a>
              <a href="#how-it-works" className="text-xs text-muted-foreground hover:text-primary transition-colors font-display">How It Works</a>
              <a href="#use-cases" className="text-xs text-muted-foreground hover:text-primary transition-colors font-display">Use Cases</a>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 Aevora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
