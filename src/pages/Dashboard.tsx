import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, ArrowLeft, Loader2, GitBranch, Clock, AlertTriangle, TrendingUp, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ScenarioCard from "@/components/ScenarioCard";
import TimelineView from "@/components/TimelineView";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Scenario {
  id: number;
  title: string;
  description: string;
  riskLevel: "Low" | "Medium" | "High";
  growthPotential: number;
  timeline: { year: string; milestone: string }[];
  actions: string[];
}

interface AnalysisResult {
  summary: string;
  scenarios: Scenario[];
}

// Simulated AI analysis (replace with real AI later)
function generateAnalysis(question: string): AnalysisResult {
  const q = question.toLowerCase();

  if (q.includes("ai") || q.includes("machine learning") || q.includes("artificial intelligence")) {
    return {
      summary: `Great question about AI career paths. Based on current industry trends, market demand, and skill trajectories, here are the most likely scenarios for pursuing AI development:`,
      scenarios: [
        {
          id: 1,
          title: "Full-Stack AI Engineer",
          description: "Dive deep into AI/ML engineering, combining software development skills with machine learning expertise. High demand, competitive salaries.",
          riskLevel: "Medium",
          growthPotential: 92,
          timeline: [
            { year: "Year 1", milestone: "Complete ML fundamentals & build portfolio projects" },
            { year: "Year 2", milestone: "Land junior AI/ML role, gain production experience" },
            { year: "Year 3", milestone: "Specialize in a domain (NLP, Computer Vision, etc.)" },
            { year: "Year 5", milestone: "Senior AI Engineer, potential team lead" },
          ],
          actions: ["Learn Python & TensorFlow/PyTorch", "Build 3-5 ML projects", "Contribute to open source AI", "Network in AI communities"],
        },
        {
          id: 2,
          title: "AI Product Manager",
          description: "Bridge the gap between technical AI capabilities and business needs. Growing role that combines strategic thinking with AI understanding.",
          riskLevel: "Low",
          growthPotential: 85,
          timeline: [
            { year: "Year 1", milestone: "Learn AI/ML concepts & product management" },
            { year: "Year 2", milestone: "Join an AI company in a product role" },
            { year: "Year 3", milestone: "Lead AI product initiatives" },
            { year: "Year 5", milestone: "VP of Product at an AI startup" },
          ],
          actions: ["Study AI fundamentals (not coding-heavy)", "Get product management certification", "Understand AI ethics & limitations", "Build domain expertise"],
        },
        {
          id: 3,
          title: "AI Research Scientist",
          description: "Push the boundaries of what AI can do. Requires deep mathematical and theoretical foundations. High impact, but longer path.",
          riskLevel: "High",
          growthPotential: 95,
          timeline: [
            { year: "Year 1-2", milestone: "Pursue advanced degree (Masters/PhD)" },
            { year: "Year 3", milestone: "Publish research papers, build reputation" },
            { year: "Year 4", milestone: "Join research lab (Google, OpenAI, etc.)" },
            { year: "Year 6+", milestone: "Lead research team, shape AI's future" },
          ],
          actions: ["Strong math foundation (linear algebra, statistics)", "Apply to graduate programs", "Start publishing papers early", "Attend AI conferences"],
        },
      ],
    };
  }

  if (q.includes("cybersecurity") || q.includes("security")) {
    return {
      summary: `Cybersecurity is a critical and growing field. Here are the projected paths for a career in cybersecurity:`,
      scenarios: [
        {
          id: 1,
          title: "Security Analyst",
          description: "Monitor and protect organizations from cyber threats. Strong entry point with clear progression.",
          riskLevel: "Low",
          growthPotential: 80,
          timeline: [
            { year: "Year 1", milestone: "Get CompTIA Security+ certification" },
            { year: "Year 2", milestone: "SOC Analyst role" },
            { year: "Year 3", milestone: "Senior Security Analyst" },
            { year: "Year 5", milestone: "Security Operations Manager" },
          ],
          actions: ["Get certified (Security+, CEH)", "Set up a home lab", "Practice on CTF platforms", "Learn SIEM tools"],
        },
        {
          id: 2,
          title: "Penetration Tester",
          description: "Ethical hacking to find vulnerabilities before malicious actors do. Exciting, hands-on work.",
          riskLevel: "Medium",
          growthPotential: 88,
          timeline: [
            { year: "Year 1", milestone: "Learn networking & scripting" },
            { year: "Year 2", milestone: "OSCP certification, junior pentester" },
            { year: "Year 3", milestone: "Bug bounty success, senior pentester" },
            { year: "Year 5", milestone: "Red team lead or independent consultant" },
          ],
          actions: ["Master Linux and networking", "Practice on HackTheBox", "Get OSCP certification", "Build bug bounty track record"],
        },
      ],
    };
  }

  // Generic fallback
  return {
    summary: `Interesting decision! Based on analysis of this choice, here are the projected future scenarios:`,
    scenarios: [
      {
        id: 1,
        title: "Optimistic Path",
        description: "Best-case trajectory where conditions align favorably. Requires consistent effort and some luck.",
        riskLevel: "Low",
        growthPotential: 85,
        timeline: [
          { year: "Year 1", milestone: "Foundation building and initial progress" },
          { year: "Year 2", milestone: "Meaningful results and growing momentum" },
          { year: "Year 3", milestone: "Established position with clear advancement" },
          { year: "Year 5", milestone: "Significant achievement and recognition" },
        ],
        actions: ["Start immediately with small steps", "Build a support network", "Track progress monthly", "Stay adaptable to changes"],
      },
      {
        id: 2,
        title: "Moderate Path",
        description: "Most probable outcome with typical challenges and steady progress. Realistic and achievable.",
        riskLevel: "Medium",
        growthPotential: 70,
        timeline: [
          { year: "Year 1", milestone: "Learning curve and early challenges" },
          { year: "Year 2", milestone: "Finding your rhythm and gaining traction" },
          { year: "Year 3", milestone: "Stable progress with periodic setbacks" },
          { year: "Year 5", milestone: "Solid foundation with room to grow" },
        ],
        actions: ["Set realistic expectations", "Prepare for setbacks", "Invest in continuous learning", "Build financial buffer"],
      },
      {
        id: 3,
        title: "Challenging Path",
        description: "Scenario where significant obstacles arise. Valuable to prepare for, even if unlikely.",
        riskLevel: "High",
        growthPotential: 45,
        timeline: [
          { year: "Year 1", milestone: "Significant hurdles and slow start" },
          { year: "Year 2", milestone: "Pivoting or adjusting strategy" },
          { year: "Year 3", milestone: "Rebuilding with lessons learned" },
          { year: "Year 5", milestone: "Recovery and new direction" },
        ],
        actions: ["Have a backup plan", "Build emergency savings", "Seek mentorship early", "Stay resilient through setbacks"],
      },
    ],
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeView, setActiveView] = useState<"scenarios" | "timeline">("scenarios");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isAnalyzing) return;
    const question = input.trim();
    setInput("");
    setResult(null);
    setSelectedScenario(null);

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsAnalyzing(true);

    // Simulate AI processing
    setTimeout(() => {
      const analysis = generateAnalysis(question);
      setResult(analysis);
      setMessages((prev) => [...prev, { role: "assistant", content: analysis.summary }]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleReset = () => {
    setMessages([]);
    setResult(null);
    setSelectedScenario(null);
    setInput("");
  };

  const exampleQuestions = [
    "Should I learn AI development or cybersecurity?",
    "Is it worth getting a master's degree in 2026?",
    "Should I start a startup or join a big tech company?",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass border-b border-border/30 h-14 flex items-center px-6 shrink-0 z-50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">Aevora</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Decision Intelligence</span>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" className="ml-auto" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" /> New Decision
          </Button>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat / Input Section */}
        <div className={`flex flex-col ${result ? "w-full lg:w-2/5" : "w-full"} transition-all duration-500 border-r border-border/30`}>
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 glow-primary">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-3">What decision are you facing?</h2>
                  <p className="text-muted-foreground mb-8">Describe your situation and I'll simulate possible future outcomes.</p>
                  <div className="flex flex-col gap-3">
                    {exampleQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        className="glass glass-hover rounded-lg px-4 py-3 text-sm text-left text-muted-foreground hover:text-foreground transition-all"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4 max-w-2xl mx-auto">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary/20 text-foreground border border-primary/30"
                          : "glass text-foreground"
                      }`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isAnalyzing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 glass rounded-xl px-4 py-3 w-fit">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">Simulating future scenarios...</span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/30">
            <div className="max-w-2xl mx-auto flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="Describe your decision..."
                rows={1}
                className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-body"
              />
              <Button variant="hero" size="icon" onClick={handleSubmit} disabled={!input.trim() || isAnalyzing} className="shrink-0 h-[46px] w-[46px]">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex flex-col w-3/5 overflow-hidden"
          >
            {/* View Tabs */}
            <div className="flex items-center gap-2 p-4 border-b border-border/30">
              <button
                onClick={() => { setActiveView("scenarios"); setSelectedScenario(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-medium transition-all ${
                  activeView === "scenarios" ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GitBranch className="w-4 h-4" /> Scenarios
              </button>
              <button
                onClick={() => setActiveView("timeline")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-medium transition-all ${
                  activeView === "timeline" ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="w-4 h-4" /> Timeline
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeView === "scenarios" && !selectedScenario && (
                  <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4">
                    {result.scenarios.map((s, i) => (
                      <ScenarioCard key={s.id} scenario={s} index={i} onClick={() => setSelectedScenario(s)} />
                    ))}
                  </motion.div>
                )}

                {activeView === "scenarios" && selectedScenario && (
                  <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedScenario(null)} className="mb-4">
                      <ArrowLeft className="w-4 h-4 mr-1" /> All Scenarios
                    </Button>
                    <div className="glass rounded-xl p-6">
                      <h3 className="text-xl font-display font-bold text-foreground mb-2">{selectedScenario.title}</h3>
                      <p className="text-sm text-muted-foreground mb-6">{selectedScenario.description}</p>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${selectedScenario.riskLevel === "Low" ? "text-primary" : selectedScenario.riskLevel === "Medium" ? "text-yellow-400" : "text-destructive"}`} />
                          <span className="text-sm text-muted-foreground">Risk: {selectedScenario.riskLevel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">Growth: {selectedScenario.growthPotential}%</span>
                        </div>
                      </div>

                      <h4 className="font-display font-semibold text-foreground mb-3">Timeline</h4>
                      <div className="space-y-3 mb-6">
                        {selectedScenario.timeline.map((t, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-20 shrink-0 text-xs font-display font-semibold text-primary">{t.year}</div>
                            <div className="text-sm text-muted-foreground">{t.milestone}</div>
                          </div>
                        ))}
                      </div>

                      <h4 className="font-display font-semibold text-foreground mb-3">Recommended Actions</h4>
                      <ul className="space-y-2">
                        {selectedScenario.actions.map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeView === "timeline" && (
                  <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <TimelineView scenarios={result.scenarios} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
