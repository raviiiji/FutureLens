import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Loader2, GitBranch, Clock, TreePine, Lightbulb, MessageCircle, History, LogOut, User, GitCompare, BarChart3, Star, Download, Share2, Settings, ArrowRight, LayoutDashboard, Target } from "lucide-react";
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
  const [domain, setDomain] = useState("career");
  const [lastDecisionId, setLastDecisionId] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // For mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing, isStreaming]);

  const handleSubmit = async () => {
    if (!input.trim() || isAnalyzing || isStreaming) return;
    const question = input.trim();
    
    setResult(null);
    setCurrentQuestion(question);
    setMessages([]);
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("simulate-decision", { body: { question, domain } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const analysis: AnalysisResult = {
        summary: data.summary || "No summary provided.",
        scenarios: (data.scenarios || []).map((s: any, index: number) => ({
          id: s.id || index,
          title: s.title || "Untitled Scenario",
          description: s.description || "No description provided.",
          riskLevel: ["Low", "Medium", "High"].includes(s.riskLevel) ? s.riskLevel : "Medium",
          growthPotential: typeof s.growthPotential === 'number' ? s.growthPotential : 50,
          timeline: Array.isArray(s.timeline) ? s.timeline : [],
          actions: Array.isArray(s.actions) ? s.actions : [],
        }))
      };
      setResult(analysis);

      if (user && !isGuest) {
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !result) return;
    
    const question = input.trim();
    setInput("");
    
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
    { text: "Should I learn AI development or cybersecurity?", domain: "career" },
    { text: "Is it worth getting a master's degree in 2026?", domain: "education" },
    { text: "Should I invest my savings in an index fund or real estate?", domain: "finance" },
    { text: "Should we migrate our infrastructure to the cloud?", domain: "business" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans selection:bg-primary/20">
      {/* Background ambient elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] orb-1 rounded-full animate-pulse-glow opacity-30" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] orb-2 rounded-full animate-pulse-glow opacity-20" style={{ animationDelay: "2s" }} />
      </div>

      {/* Sidebar */}
      <aside className={`w-64 border-r border-border/40 bg-card/60 backdrop-blur-md flex flex-col z-50 transition-all duration-300 absolute md:relative h-full ${sidebarOpen ? "left-0" : "-left-64 md:left-0"}`}>
        <div className="h-16 flex items-center px-6 border-b border-border/40 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center mr-3 shadow-md">
            <Target className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground tracking-tight">FutureLens</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          <div>
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Simulate</p>
            <div className="space-y-1">
              <button onClick={() => { setResult(null); setInput(""); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-primary/10 text-primary font-medium text-sm transition-colors">
                <LayoutDashboard className="w-4 h-4" /> New Simulation
              </button>
            </div>
          </div>
          
          {user && !isGuest && (
            <div>
              <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Workspace</p>
              <div className="space-y-1">
                <button onClick={() => navigate("/history")} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground font-medium text-sm transition-colors">
                  <History className="w-4 h-4" /> History
                </button>
                <button onClick={() => navigate("/favorites")} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground font-medium text-sm transition-colors">
                  <Star className="w-4 h-4" /> Saved Scenarios
                </button>
                <button onClick={() => navigate("/compare")} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground font-medium text-sm transition-colors">
                  <GitCompare className="w-4 h-4" /> Compare
                </button>
                <button onClick={() => navigate("/analytics")} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground font-medium text-sm transition-colors">
                  <BarChart3 className="w-4 h-4" /> Analytics
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/40 space-y-3 shrink-0">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          {isGuest ? (
            <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
              Sign Up to Save
            </Button>
          ) : (
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive font-medium text-sm transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 bg-background/50">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-border/40 bg-card/30 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-display font-semibold text-foreground tracking-tight hidden sm:block">
              {result ? "Simulation Results" : "Decision Console"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {result && lastDecisionId && (
              <>
                <Button variant="outline" size="sm" onClick={() => toggleFavorite(lastDecisionId!)} className="hidden sm:flex border-border/50 bg-background/50">
                  <Star className={`w-4 h-4 mr-2 ${isFavorite(lastDecisionId!) ? "fill-gold text-gold" : ""}`} />
                  {isFavorite(lastDecisionId!) ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPdf} className="border-border/50 bg-background/50">
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export PDF</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} disabled={shareLoading} className="border-border/50 bg-background/50">
                  {shareLoading ? <Loader2 className="w-4 h-4 animate-spin sm:mr-2" /> : <Share2 className="w-4 h-4 sm:mr-2" />}
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Configuration Panel */}
            <div className="glass-premium rounded-xl border border-border/50 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Simulation Parameters</h2>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-64 shrink-0 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Domain / Context</label>
                  <select 
                    value={domain} 
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={isAnalyzing}
                    className="w-full h-11 bg-background border border-border/50 rounded-lg px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                  >
                    <option value="career">Career & Professional</option>
                    <option value="education">Education & Placement</option>
                    <option value="finance">Finance & Investment</option>
                    <option value="healthcare">Healthcare & Wellness</option>
                    <option value="business">Organization & Business</option>
                  </select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Decision Prompt</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !result) { e.preventDefault(); handleSubmit(); } }}
                        disabled={isAnalyzing || (result !== null)}
                        placeholder={result ? currentQuestion : "e.g., Should we migrate our infrastructure to the cloud?"}
                        className="w-full h-11 bg-background border border-border/50 rounded-lg px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                      />
                    </div>
                    {!result ? (
                      <Button onClick={handleSubmit} disabled={!input.trim() || isAnalyzing} className="h-11 px-6 shadow-lg shadow-primary/20 shrink-0">
                        {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Simulating...</> : <><Brain className="w-4 h-4 mr-2" /> Run Simulation</>}
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => { setResult(null); setInput(""); }} className="h-11 px-6 shrink-0 border-border/50">
                        <RotateCcw className="w-4 h-4 mr-2" /> Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Empty State / Examples */}
            {!isAnalyzing && !result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-8 pb-12">
                <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {exampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q.text); setDomain(q.domain); }}
                      className="glass rounded-xl p-5 text-left border border-border/40 hover:border-primary/40 hover:shadow-md transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                      <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-3">
                        {q.domain}
                      </span>
                      <p className="text-sm font-medium text-foreground leading-relaxed group-hover:text-primary transition-colors">{q.text}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
                <AnalysisSkeleton />
              </motion.div>
            )}

            {/* Results Dashboard */}
            {!isAnalyzing && result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* Top Row: Strategic Advisor & Scenarios */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left Column: Strategic Advisor Overview */}
                  <div className="lg:col-span-1 glass-premium rounded-xl border border-border/50 p-6 flex flex-col shadow-sm">
                    <h3 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-gold" /> Strategic Insight
                    </h3>
                    <div className="prose prose-sm dark:prose-invert text-muted-foreground flex-1">
                      <ReactMarkdown>{result.summary}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Right Column: Scenario Cards Grid */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2 px-1">
                      <GitBranch className="w-5 h-5 text-accent" /> Branching Paths
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {result.scenarios.map((s, i) => (
                        <div key={s.id} className="h-full">
                          <ScenarioCard scenario={s} index={i} onClick={() => {}} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Middle Row: Timeline */}
                <div className="glass-premium rounded-xl border border-border/50 p-6 shadow-sm overflow-hidden">
                  <h3 className="font-display font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-sky" /> Projected Timelines
                  </h3>
                  <div className="overflow-x-auto pb-4">
                    <TimelineView scenarios={result.scenarios} />
                  </div>
                </div>

                {/* Bottom Row: Decision Tree */}
                <div className="glass-premium rounded-xl border border-border/50 p-6 shadow-sm h-[600px] flex flex-col">
                  <h3 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2 shrink-0">
                    <TreePine className="w-5 h-5 text-primary" /> Decision Tree Visualization
                  </h3>
                  <div className="flex-1 relative rounded-lg border border-border/30 overflow-hidden bg-background/50">
                    <DecisionTree scenarios={result.scenarios} question={currentQuestion} />
                  </div>
                </div>

                {/* Interactive Follow-up Chat */}
                <div className="glass-premium rounded-xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-border/40 bg-card/30 flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-primary" /> Deep Dive Analysis
                    </h3>
                    <span className="text-xs text-muted-foreground">Ask FutureLens AI for specifics</span>
                  </div>
                  
                  <div className="p-4 bg-background/30 max-h-[400px] overflow-y-auto space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground">Want to compare specific metrics? Need to know the biggest risk factors? Ask below.</p>
                      </div>
                    )}
                    
                    <AnimatePresence>
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm shadow-md" : "glass border border-border/50 rounded-bl-sm"
                          }`}>
                            {msg.role === "assistant" ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            ) : (
                              msg.content
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {isStreaming && (
                      <div className="flex items-center gap-2 px-4 py-2 glass w-fit rounded-full border border-border/50">
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-4 border-t border-border/40 bg-card/30">
                    <form onSubmit={handleFollowUpSubmit} className="flex gap-3">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="E.g., Compare the first year actions of both scenarios..."
                        className="flex-1 bg-background border border-border/50 rounded-lg px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                      <Button type="submit" disabled={!input.trim() || isStreaming} className="shrink-0 shadow-sm">
                        <Send className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Ask AI</span>
                      </Button>
                    </form>
                  </div>
                </div>

              </motion.div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
