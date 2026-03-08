import { motion } from "framer-motion";
import { ArrowRight, Brain, GitBranch, BarChart3, Sparkles, Zap, Shield, Star, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  { icon: Brain, title: "Decision Simulation", description: "Generate multiple future scenarios from a single decision to explore every possible path.", color: "text-primary", bg: "bg-primary/10", glow: "group-hover:glow-primary" },
  { icon: GitBranch, title: "Scenario Modeling", description: "Compare branching outcomes side by side with risk levels, growth potential, and timelines.", color: "text-accent", bg: "bg-accent/10", glow: "group-hover:glow-accent" },
  { icon: BarChart3, title: "Future Timelines", description: "Visualize how your decisions unfold over 5 years with structured timelines.", color: "text-sky", bg: "bg-sky/10", glow: "" },
  { icon: Star, title: "Favorites & Bookmarks", description: "Star your most important decisions and quickly access them anytime.", color: "text-warm", bg: "bg-warm/10", glow: "" },
  { icon: Download, title: "PDF Export", description: "Download beautifully formatted reports of your decision analysis.", color: "text-rose", bg: "bg-rose/10", glow: "" },
  { icon: Share2, title: "Public Sharing", description: "Share your decision simulations with anyone via a unique link.", color: "text-primary", bg: "bg-primary/10", glow: "group-hover:glow-primary" },
];

const steps = [
  { number: "01", title: "Ask Your Question", description: "Describe the decision you're facing in natural language.", color: "gradient-text" },
  { number: "02", title: "AI Analyzes", description: "Our engine evaluates context, trends, and possible trajectories.", color: "gradient-text-warm" },
  { number: "03", title: "Explore Scenarios", description: "Review multiple future paths with timelines and risk levels.", color: "gradient-text" },
  { number: "04", title: "Decide with Confidence", description: "Choose your path armed with strategic intelligence.", color: "gradient-text-warm" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-[600px] h-[600px] orb-1 rounded-full animate-pulse-glow" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] orb-2 rounded-full animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-20 left-1/3 w-[400px] h-[400px] orb-3 rounded-full animate-pulse-glow" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/3 right-1/3 w-[350px] h-[350px] orb-4 rounded-full animate-pulse-glow" style={{ animationDelay: "4.5s" }} />
      </div>

      <nav className="fixed top-0 w-full z-50 glass border-b border-border/30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center animate-float">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Aevora</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</a>
            <a href="#use-cases" className="text-sm text-muted-foreground hover:text-primary transition-colors">Use Cases</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="hero" size="sm" onClick={() => navigate("/dashboard")}>
              Launch App <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-[0.06] dark:opacity-[0.08]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" className="max-w-4xl mx-auto">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">AI Decision Intelligence Platform</span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-tight mb-6">
              Simulate Tomorrow.{" "}
              <span className="gradient-text-aurora">Decide Today.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Explore the possible future outcomes of your choices. AI-powered scenario analysis transforms decision-making from guesswork into strategy.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate("/dashboard")} className="group">
                Start Simulating <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="glass" size="xl" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                Learn More
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                { value: "AI", label: "Powered Analysis" },
                { value: "∞", label: "Scenarios" },
                { value: "24/7", label: "Available" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-display font-bold gradient-text-aurora">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Powerful <span className="gradient-text-aurora">Features</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need to make strategic decisions.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group glass glass-hover rounded-2xl p-6 ${f.glow}`}
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              How <span className="gradient-text">It Works</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Four simple steps to transform uncertainty into clarity.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className={`text-5xl font-display font-bold ${s.color} mb-4`}>{s.number}</div>
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Real-World <span className="gradient-text-warm">Applications</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: "🎯 Career Planning", desc: "\"Should I switch to AI development or stay in web dev?\"", color: "border-l-primary" },
              { title: "🎓 Education Paths", desc: "\"Is a master's degree worth it for my career goals?\"", color: "border-l-accent" },
              { title: "🚀 Entrepreneurship", desc: "\"Should I bootstrap or seek venture capital?\"", color: "border-l-warm" },
              { title: "💻 Skill Development", desc: "\"Which programming language should I learn next?\"", color: "border-l-sky" },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`glass glass-hover rounded-xl p-6 border-l-4 ${c.color}`}
              >
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{c.title}</h3>
                <p className="text-muted-foreground italic text-sm">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass-premium rounded-3xl p-12 sm:p-16 max-w-3xl mx-auto glow-primary">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to <span className="gradient-text-aurora">Simulate Your Future?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Stop guessing. Start exploring. Make your next big decision with AI-powered foresight.
            </p>
            <Button variant="hero" size="xl" onClick={() => navigate("/dashboard")} className="group">
              Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border/30 py-8 relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground">Aevora</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Aevora. AI Decision Intelligence Platform.</p>
        </div>
      </footer>
    </div>
  );
}
