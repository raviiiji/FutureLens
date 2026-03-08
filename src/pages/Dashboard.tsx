import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, ArrowLeft, Loader2, GitBranch, Clock, AlertTriangle, TrendingUp, Sparkles, RotateCcw, History, LogOut, User, GitCompare, TreePine, UserCircle, Share2, BarChart3, Star, Download, Lightbulb, MessageCircle, Shield, Zap, CheckCircle2, ArrowUpRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ScenarioCard from "@/components/ScenarioCard";
import TimelineView from "@/components/TimelineView";
import DecisionTree from "@/components/DecisionTree";
import ThemeToggle from "@/components/ThemeToggle";
import StrategicAdvisor from "@/components/StrategicAdvisor";
import AnalysisSkeleton from "@/components/AnalysisSkeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { exportDecisionPdf } from "@/utils/exportPdf";

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

function generateShareToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function streamFollowUp({
  messages,
  scenarioContext,
  onDelta,
  onDone,
}: {
  messages: { role: string; content: string }[];
  scenarioContext: any;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/follow-up-chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, scenarioContext }),
    }
  );

  if (!resp.ok || !resp.body) {
    const err = await resp.json().catch(() => ({ error: "Stream failed" }));
    throw new Error(err.error || "Failed to start stream");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isGuest, signOut } = useAuth();
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeView, setActiveView] = useState<"scenarios" | "timeline" | "tree" | "advisor">("scenarios");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [mobileTab, setMobileTab] = useState<"chat" | "scenarios" | "timeline" | "tree" | "advisor">("chat");
  const [lastDecisionId, setLastDecisionId] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing, isStreaming]);

  const handleSubmit = async () => {
    if (!input.trim() || isAnalyzing || isStreaming) return;
    const question = input.trim();
    setInput("");

    // If we already have results, this is a follow-up question
    if (result) {
      handleFollowUp(question);
      return;
    }

    setResult(null);
    setSelectedScenario(null);
    setCurrentQuestion(question);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("simulate-decision", { body: { question } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const analysis: AnalysisResult = data;
      setResult(analysis);
      setMessages((prev) => [...prev, { role: "assistant", content: analysis.summary }]);

      if (user) {
        const { data: inserted } = await supabase.from("decisions").insert({
          user_id: user.id,
          question,
          summary: analysis.summary,
          scenarios: analysis.scenarios as any,
        }).select("id").single();
        if (inserted) setLastDecisionId(inserted.id);
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast.error(err.message || "Failed to analyze");
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, an error occurred: ${err.message}. Please try again.` }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFollowUp = async (question: string) => {
    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user" && prev[prev.length - 2]?.content === question) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      await streamFollowUp({
        messages: chatHistory,
        scenarioContext: {
          question: currentQuestion,
          summary: result?.summary,
          scenarios: result?.scenarios,
        },
        onDelta: upsertAssistant,
        onDone: () => setIsStreaming(false),
      });
    } catch (err: any) {
      console.error("Follow-up error:", err);
      toast.error(err.message || "Failed to get response");
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry: ${err.message}` }]);
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    setMessages([]); setResult(null); setSelectedScenario(null);
    setInput(""); setCurrentQuestion(""); setMobileTab("chat"); setLastDecisionId(null);
  };

  const handleShare = async () => {
    if (!lastDecisionId) { toast.error("No decision to share"); return; }
    setShareLoading(true);
    try {
      const token = generateShareToken();
      const { error } = await supabase.from("decisions").update({ share_token: token } as any).eq("id", lastDecisionId);
      if (error) throw error;
      const url = `${window.location.origin}/shared/${token}`;
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.error("Failed to create share link");
    } finally {
      setShareLoading(false);
    }
  };

  const handleExportPdf = () => {
    if (!result) return;
    exportDecisionPdf(currentQuestion, result.summary, result.scenarios);
    toast.success("PDF exported!");
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const exampleQuestions = [
    "Should I learn AI development or cybersecurity?",
    "Is it worth getting a master's degree in 2026?",
    "Should I start a startup or join a big tech company?",
    "Should I switch from web development to data science?",
  ];

  const followUpSuggestions = result ? [
    `What specific skills do I need for "${result.scenarios[0]?.title}"?`,
    "Which path has the best ROI over 5 years?",
    "What are the biggest risks I should prepare for?",
    "Can you compare the first-year actions in more detail?",
  ] : [];

  const viewTabs = [
    { key: "scenarios" as const, label: "Paths", icon: GitBranch },
    { key: "timeline" as const, label: "Timeline", icon: Clock },
    { key: "tree" as const, label: "Tree", icon: TreePine },
    { key: "advisor" as const, label: "Advisor", icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-20 w-[400px] h-[400px] orb-1 rounded-full animate-pulse-glow" />
        <div className="absolute bottom-20 left-10 w-[350px] h-[350px] orb-2 rounded-full animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] orb-4 rounded-full animate-pulse-glow" style={{ animationDelay: "4s" }} />
      </div>

      {/* Header */}
      <header className="glass border-b border-border/30 h-14 flex items-center px-4 sm:px-6 shrink-0 z-50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Home</span>
        </Button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground hidden sm:inline">Aevora</span>
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {result && lastDecisionId && (
            <>
              <Button variant="ghost" size="sm" onClick={() => toggleFavorite(lastDecisionId!)}>
                <Star className={`w-4 h-4 ${isFavorite(lastDecisionId!) ? "fill-primary text-primary" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExportPdf}>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">PDF</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} disabled={shareLoading}>
                {shareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline ml-1">Share</span>
              </Button>
            </>
          )}
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">New</span>
            </Button>
          )}
          {user && !isGuest && (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/analytics")}>
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                <History className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/favorites")}>
                <Star className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/compare")}>
                <GitCompare className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
            <UserCircle className="w-4 h-4" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Mobile tabs */}
      {result && (
        <div className="lg:hidden flex border-b border-border/30 bg-card/50 z-10">
          {(["chat", "scenarios", "timeline", "tree", "advisor"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setMobileTab(tab); if (tab !== "scenarios") setSelectedScenario(null); }}
              className={`flex-1 py-3 text-xs font-display font-medium capitalize transition-all ${
                mobileTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
            >
              {tab === "chat" && "💬 Chat"}
              {tab === "scenarios" && "🔀 Paths"}
              {tab === "timeline" && "📅 Timeline"}
              {tab === "tree" && "🌳 Tree"}
              {tab === "advisor" && "💡 Advisor"}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative z-10">
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
                  <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-6 glow-primary animate-float">
                    <Sparkles className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-3">What decision are you facing?</h2>
                  <p className="text-muted-foreground mb-8 text-sm sm:text-base">Describe your situation and AI will simulate multiple future outcomes.</p>
                  {isGuest && (
                    <div className="glass rounded-xl px-4 py-3 mb-6 text-xs text-muted-foreground border-l-4 border-l-warm">
                      <User className="w-3 h-3 inline mr-1" />
                      Guest mode — <button onClick={() => navigate("/auth")} className="text-primary hover:underline font-medium">Sign up</button> to save decisions permanently
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    {exampleQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="glass glass-hover rounded-xl px-4 py-3 text-sm text-left text-muted-foreground hover:text-foreground transition-all group"
                      >
                        <span className="text-primary mr-2 group-hover:mr-3 transition-all">→</span>
                        {q}
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
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "gradient-primary text-primary-foreground"
                          : "glass"
                      }`}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
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

                {isStreaming && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-2 w-fit">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </motion.div>
                )}

                {/* Follow-up suggestions */}
                {result && !isAnalyzing && !isStreaming && followUpSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">Ask a follow-up</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {followUpSuggestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => setInput(q)}
                          className="glass glass-hover rounded-lg px-3 py-2 text-xs text-left text-muted-foreground hover:text-foreground transition-all group"
                        >
                          <span className="text-primary mr-1.5 group-hover:mr-2 transition-all">→</span>
                          {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t border-border/30">
            <div className="max-w-2xl mx-auto">
              {result && (
                <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> Ask follow-up questions about the scenarios
                </p>
              )}
              <div className="flex gap-2 sm:gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder={result ? "Ask a follow-up question..." : "Describe your decision..."}
                  rows={1}
                  className="input-field flex-1 resize-none"
                />
                <Button variant="hero" size="icon" onClick={handleSubmit} disabled={!input.trim() || isAnalyzing || isStreaming} className="shrink-0 h-[46px] w-[46px]">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <div className={`flex-col overflow-hidden transition-all duration-500 ${
            mobileTab !== "chat" ? "flex w-full lg:w-3/5" : "hidden lg:flex lg:w-3/5"
          }`}>
            <div className="hidden lg:flex items-center gap-2 p-4 border-b border-border/30">
              {viewTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveView(tab.key); setSelectedScenario(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-medium transition-all ${
                    activeView === tab.key ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {(() => {
                  const currentView = mobileTab === "chat" ? activeView : mobileTab === "scenarios" ? "scenarios" : mobileTab === "timeline" ? "timeline" : mobileTab === "advisor" ? "advisor" : "tree";

                  if (currentView === "scenarios" && !selectedScenario) {
                    return (
                      <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="glass-premium rounded-2xl p-4 mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <GitBranch className="w-4 h-4 text-primary" />
                            <h3 className="font-display font-bold text-foreground">Decision Paths</h3>
                          </div>
                          <p className="text-xs text-muted-foreground">{result.scenarios.length} scenarios analyzed • Click to explore in detail</p>
                        </div>
                        <div className="grid gap-4">
                          {result.scenarios.map((s, i) => (
                            <ScenarioCard key={s.id} scenario={s} index={i} onClick={() => setSelectedScenario(s)} />
                          ))}
                        </div>
                      </motion.div>
                    );
                  }

                  if (currentView === "scenarios" && selectedScenario) {
                    return (
                      <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedScenario(null)} className="mb-4">
                          <ArrowLeft className="w-4 h-4 mr-1" /> All Scenarios
                        </Button>
                        <div className="glass-premium rounded-2xl overflow-hidden">
                          {/* Header */}
                          <div className="p-5 sm:p-6 border-b border-border/20">
                            <h3 className="text-xl font-display font-bold text-foreground mb-2">{selectedScenario.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{selectedScenario.description}</p>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                                selectedScenario.riskLevel === "Low" ? "bg-primary/10" : selectedScenario.riskLevel === "Medium" ? "bg-warm/10" : "bg-destructive/10"
                              }`}>
                                {selectedScenario.riskLevel === "Low" ? <Shield className="w-3.5 h-3.5 text-primary" /> : selectedScenario.riskLevel === "Medium" ? <AlertTriangle className="w-3.5 h-3.5 text-warm" /> : <Zap className="w-3.5 h-3.5 text-destructive" />}
                                <span className={`text-xs font-display font-bold ${selectedScenario.riskLevel === "Low" ? "text-primary" : selectedScenario.riskLevel === "Medium" ? "text-warm" : "text-destructive"}`}>
                                  {selectedScenario.riskLevel} Risk
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
                                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-display font-bold text-primary">{selectedScenario.growthPotential}% Growth</span>
                              </div>
                              <div className="flex items-center gap-2 ml-auto">
                                <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${selectedScenario.growthPotential}%` }}
                                    transition={{ duration: 0.8 }}
                                    className="h-full gradient-primary rounded-full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div className="p-5 sm:p-6 border-b border-border/20">
                            <h4 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" /> 5-Year Timeline
                            </h4>
                            <div className="space-y-4 relative">
                              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-accent/30 to-warm/20" />
                              {selectedScenario.timeline.map((t, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.08 }}
                                  className="flex gap-4 items-start relative"
                                >
                                  <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shrink-0 z-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  </div>
                                  <div className="flex-1 glass rounded-lg px-4 py-3">
                                    <span className="text-xs font-display font-bold text-primary">{t.year}</span>
                                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{t.milestone}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="p-5 sm:p-6">
                            <h4 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-accent" /> Recommended Actions
                            </h4>
                            <div className="space-y-3">
                              {selectedScenario.actions.map((a, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.06 }}
                                  className="flex items-start gap-3 glass rounded-lg px-4 py-3 group hover:border-primary/20 transition-all"
                                >
                                  <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                                  <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{a}</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }

                  if (currentView === "timeline") {
                    return (
                      <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <TimelineView scenarios={result.scenarios} />
                      </motion.div>
                    );
                  }

                  if (currentView === "tree") {
                    return (
                      <motion.div key="tree" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto">
                        <DecisionTree scenarios={result.scenarios} question={currentQuestion} />
                      </motion.div>
                    );
                  }

                  if (currentView === "advisor") {
                    return (
                      <motion.div key="advisor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <StrategicAdvisor summary={result.summary} scenarios={result.scenarios} question={currentQuestion} />
                      </motion.div>
                    );
                  }

                  return null;
                })()}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
