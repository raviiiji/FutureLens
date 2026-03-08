import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, ArrowLeft, Loader2, GitBranch, Clock, AlertTriangle, TrendingUp, Sparkles, RotateCcw, History, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ScenarioCard from "@/components/ScenarioCard";
import TimelineView from "@/components/TimelineView";

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

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isGuest, signOut } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeView, setActiveView] = useState<"scenarios" | "timeline">("scenarios");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [mobileTab, setMobileTab] = useState<"chat" | "scenarios" | "timeline">("chat");

  const handleSubmit = async () => {
    if (!input.trim() || isAnalyzing) return;
    const question = input.trim();
    setInput("");
    setResult(null);
    setSelectedScenario(null);

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("simulate-decision", {
        body: { question },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const analysis: AnalysisResult = data;
      setResult(analysis);
      setMessages((prev) => [...prev, { role: "assistant", content: analysis.summary }]);

      // Save to database
      if (user) {
        await supabase.from("decisions").insert({
          user_id: user.id,
          question,
          summary: analysis.summary,
          scenarios: analysis.scenarios as any,
        });
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      const errorMsg = err.message || "Failed to analyze decision";
      toast.error(errorMsg);
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, I encountered an error: ${errorMsg}. Please try again.` }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setResult(null);
    setSelectedScenario(null);
    setInput("");
    setMobileTab("chat");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const exampleQuestions = [
    "Should I learn AI development or cybersecurity?",
    "Is it worth getting a master's degree in 2026?",
    "Should I start a startup or join a big tech company?",
    "Should I switch from web development to data science?",
  ];

  // On mobile, show tabs when results exist
  const showMobileTabs = result && window.innerWidth < 1024;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass border-b border-border/30 h-14 flex items-center px-4 sm:px-6 shrink-0 z-50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mr-2 sm:mr-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">Aevora</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">New</span>
            </Button>
          )}
          {user && !isGuest && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              <History className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">History</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">{isGuest ? "Exit" : "Logout"}</span>
          </Button>
        </div>
      </header>

      {/* Mobile tabs */}
      {result && (
        <div className="lg:hidden flex border-b border-border/30 bg-card/50">
          {(["chat", "scenarios", "timeline"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setMobileTab(tab); if (tab !== "scenarios") setSelectedScenario(null); }}
              className={`flex-1 py-3 text-xs font-display font-medium capitalize transition-all ${
                mobileTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
            >
              {tab === "chat" && "💬 Chat"}
              {tab === "scenarios" && "🔀 Scenarios"}
              {tab === "timeline" && "📅 Timeline"}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className={`flex flex-col transition-all duration-500 ${
          result
            ? mobileTab === "chat" ? "w-full lg:w-2/5" : "hidden lg:flex lg:w-2/5"
            : "w-full"
        } lg:border-r border-border/30`}>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg px-4">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 glow-primary">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-3">What decision are you facing?</h2>
                  <p className="text-muted-foreground mb-8 text-sm sm:text-base">Describe your situation and I'll simulate possible future outcomes using AI.</p>
                  {isGuest && (
                    <div className="glass rounded-lg px-4 py-2 mb-6 text-xs text-muted-foreground">
                      <User className="w-3 h-3 inline mr-1" />
                      Guest mode — <button onClick={() => navigate("/auth")} className="text-primary hover:underline">Sign up</button> to save decisions permanently
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    {exampleQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
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
                    <span className="text-sm text-muted-foreground">AI is simulating future scenarios...</span>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-border/30">
            <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3">
              <textarea
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

        {/* Results Panel - Desktop always visible, Mobile tab-based */}
        {result && (
          <div className={`flex-col overflow-hidden transition-all duration-500 ${
            mobileTab !== "chat" ? "flex w-full lg:w-3/5" : "hidden lg:flex lg:w-3/5"
          }`}>
            {/* Desktop view tabs */}
            <div className="hidden lg:flex items-center gap-2 p-4 border-b border-border/30">
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

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {/* Mobile: use mobileTab, Desktop: use activeView */}
                {((mobileTab === "scenarios" && !selectedScenario) || (mobileTab === "chat" && activeView === "scenarios" && !selectedScenario)) && (
                  <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4">
                    {result.scenarios.map((s, i) => (
                      <ScenarioCard key={s.id} scenario={s} index={i} onClick={() => { setSelectedScenario(s); }} />
                    ))}
                  </motion.div>
                )}

                {selectedScenario && (mobileTab === "scenarios" || mobileTab === "chat") && (
                  <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedScenario(null)} className="mb-4">
                      <ArrowLeft className="w-4 h-4 mr-1" /> All Scenarios
                    </Button>
                    <div className="glass rounded-xl p-4 sm:p-6">
                      <h3 className="text-xl font-display font-bold text-foreground mb-2">{selectedScenario.title}</h3>
                      <p className="text-sm text-muted-foreground mb-6">{selectedScenario.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mb-6">
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
                            <div className="w-16 sm:w-20 shrink-0 text-xs font-display font-semibold text-primary">{t.year}</div>
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

                {(mobileTab === "timeline" || (mobileTab === "chat" && activeView === "timeline")) && (
                  <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <TimelineView scenarios={result.scenarios} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
