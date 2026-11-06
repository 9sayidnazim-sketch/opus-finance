const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  Send, 
  Plus, 
  Sparkles, 
  Bot, 
  Database, 
  BrainCircuit, 
  ChevronDown, 
  Check, 
  Cpu,
  Trash2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import MessageBubble from "../components/assistant/MessageBubble";
import ConversationsList from "../components/assistant/ConversationsList";
import AudioRecorder from "../components/assistant/AudioRecorder";
import { 
  getAIConfig, 
  saveAIConfig, 
  PROVIDERS_CATALOG, 
  getActiveProviderDetails,
  getAIMemoryScope,
  setAIMemoryScope,
  getAIMemory,
  addAIMemoryFact,
  deleteAIMemoryFact,
  clearAIMemory,
  getDatabaseMode,
  setDatabaseMode
} from "@/api/aiClient";

const PROMPT_SUGGESTIONS = [
  "Spent $45 on dinner with clients",
  "How much have I spent on food this month?",
  "Check my budget limits",
  "Remember that rent is $1200 due on the 10th",
  "Log $15 coffee with card"
];

export default function AssistantPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Multi-model & storage state
  const [aiConfig, setAiConfig] = useState(getAIConfig());
  const [activeDetails, setActiveDetails] = useState(getActiveProviderDetails());
  const [dbMode, setDbModeState] = useState(getDatabaseMode());
  const [memScope, setMemScopeState] = useState(getAIMemoryScope());
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [aiMemory, setAiMemory] = useState(getAIMemory());
  const [newMemoryInput, setNewMemoryInput] = useState("");

  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => db.agents.listConversations({ agent_name: "assistente_financeiro" }),
    initialData: [],
  });

  const createConversationMutation = useMutation({
    mutationFn: () => db.agents.createConversation({
      agent_name: "assistente_financeiro",
      metadata: {
        name: `Chat • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      }
    }),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(newConv);
      setMessages([]);
    },
  });

  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(selectedConversation.messages || []);
    }
  }, [selectedConversation]);

  useEffect(() => {
    const onStart = () => setIsThinking(true);
    const onFinish = () => setIsThinking(false);
    window.addEventListener("opus_ai_thinking_started", onStart);
    window.addEventListener("opus_ai_thinking_finished", onFinish);
    return () => {
      window.removeEventListener("opus_ai_thinking_started", onStart);
      window.removeEventListener("opus_ai_thinking_finished", onFinish);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === "assistant") {
        setIsThinking(false);
      }
    }
  }, [messages]);

  useEffect(() => {
    const handleTxCreated = (e) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      const tx = e.detail;
      if (tx) {
        toast.success(`Transaction recorded: ${tx.description} (${tx.type === 'income' ? '+' : '-'}$${Number(tx.amount).toFixed(2)})`);
      }
    };
    window.addEventListener("opus_transaction_created", handleTxCreated);
    return () => window.removeEventListener("opus_transaction_created", handleTxCreated);
  }, [queryClient]);

  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = db.agents.subscribeToConversation(
      selectedConversation.id,
      (data) => {
        setMessages(data.messages);
      }
    );

    return () => unsubscribe();
  }, [selectedConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Model switch
  const handleModelSelect = (providerId, modelName) => {
    const nextConfigs = {
      ...aiConfig.providerConfigs,
      [providerId]: {
        ...aiConfig.providerConfigs?.[providerId],
        model: modelName
      }
    };
    const updated = saveAIConfig({
      activeProvider: providerId,
      providerConfigs: nextConfigs
    });
    setAiConfig(updated);
    setActiveDetails(getActiveProviderDetails());
    toast.success(`AI switched to ${PROVIDERS_CATALOG[providerId]?.name} (${modelName})`);
  };

  // Database switch
  const handleToggleDbMode = (mode) => {
    setDatabaseMode(mode);
    setDbModeState(mode);
    queryClient.invalidateQueries();
    toast.success(`Database switched to ${mode === 'single' ? 'Single Unified Database' : 'Separate Workspace Database'}`);
  };

  // Memory scope switch
  const handleToggleMemScope = (scope) => {
    setAIMemoryScope(scope);
    setMemScopeState(scope);
    setAiMemory(getAIMemory());
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    toast.success(`AI Memory switched to ${scope === 'single' ? 'Single Global Memory' : 'Separate Workspace Memory'}`);
  };

  const handleAddMemory = (e) => {
    e.preventDefault();
    if (!newMemoryInput.trim()) return;
    const updated = addAIMemoryFact(newMemoryInput);
    setAiMemory(updated);
    setNewMemoryInput("");
    toast.success("Fact committed to AI financial memory");
  };

  const handleDeleteMemory = (idx) => {
    const updated = deleteAIMemoryFact(idx);
    setAiMemory(updated);
    toast.success("Memory entry deleted");
  };

  const handleClearMemory = () => {
    if (confirm("Reset AI financial memory for this scope?")) {
      const empty = clearAIMemory();
      setAiMemory(empty);
      toast.success("AI memory reset");
    }
  };

  const handleSendMessage = async (textToSend) => {
    const content = (textToSend || messageInput).trim();
    if (!content) return;

    setMessageInput("");

    let targetConv = selectedConversation;
    if (!targetConv) {
      if (conversations && conversations.length > 0) {
        targetConv = conversations[0];
        setSelectedConversation(targetConv);
      } else {
        try {
          targetConv = await db.agents.createConversation({
            agent_name: "assistente_financeiro",
            metadata: {
              name: `Chat • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
            }
          });
          setSelectedConversation(targetConv);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        } catch (err) {
          console.error("Failed to auto-create conversation:", err);
          targetConv = { id: `conv-${Date.now()}`, metadata: { name: "Active Chat" } };
          setSelectedConversation(targetConv);
        }
      }
    }

    setIsThinking(true);

    try {
      await db.agents.addMessage(targetConv, {
        role: "user",
        content,
      });
    } catch (err) {
      setIsThinking(false);
      toast.error(`Message error: ${err.message}`);
    }
  };

  const handleAudioRecorded = async (audioFile) => {
    if (!selectedConversation) return;

    const { file_url } = await db.integrations.Core.UploadFile({ file: audioFile });

    await db.agents.addMessage(selectedConversation, {
      role: "user",
      content: "🎤 Audio message",
      file_urls: [file_url]
    });
  };

  return (
    <div className="p-4 md:p-8 min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-violet-400" />
                {activeDetails.badge} Copilot
              </span>
              <span className="text-xs text-zinc-400">• Multi-Model AI Ledger</span>
            </div>
            <h1 className="font-heading text-[30px] sm:text-[34px] leading-tight font-bold tracking-[-0.03em] text-white">
              AI Financial Assistant
            </h1>
            <p className="text-zinc-400 text-sm">
              Log transactions with natural speech, reason over budgets with GLM 5.3, DeepSeek, or Qwen, and manage shared memory.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/settings" className="flex-shrink-0">
              <Button className="bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold px-4 h-10 shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)] border border-emerald-400/30">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Gateway
              </Button>
            </Link>
          </div>
        </div>

        {/* Chat Workspace */}
        <div className="grid lg:grid-cols-4 gap-6 flex-1 min-h-[600px] overflow-hidden">
          {/* Conversation History Sidebar */}
          <div className="lg:col-span-1 rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-4 flex flex-col backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">History</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => createConversationMutation.mutate()}
                className="h-8 px-2.5 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                New Chat
              </Button>
            </div>
            <div className="flex-1 overflow-auto pr-1">
              <ConversationsList
                conversations={conversations}
                selectedId={selectedConversation?.id}
                onSelect={setSelectedConversation}
                isLoading={loadingConversations}
              />
            </div>
          </div>

          {/* Main Chat Stream */}
          <div className="lg:col-span-3 rounded-2xl bg-[#12131A]/90 border border-white/[0.08] flex flex-col backdrop-blur-xl overflow-hidden relative">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-80 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Toolbar: Model Selector + Database Pill + Memory Pill */}
            <div className="p-3.5 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2.5 z-10 bg-white/[0.01]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white tracking-tight truncate">
                    {selectedConversation ? selectedConversation.metadata?.name || "Financial Copilot" : "Active Session"}
                  </h2>
                  <p className="text-[10px] text-zinc-400 truncate">
                    Autonomous entity extraction & financial memory
                  </p>
                </div>
              </div>

              {/* Controls: Model Switcher, DB Mode, Memory Scope */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Multi-Model Selector Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-xs font-semibold transition-all">
                      <Cpu className="w-3.5 h-3.5 text-violet-400" />
                      <span>{activeDetails.badge}: {activeDetails.model}</span>
                      <ChevronDown className="w-3 h-3 text-violet-400 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-[#12131A] border-white/[0.1] text-zinc-200 p-1.5 rounded-xl z-50">
                    <DropdownMenuLabel className="text-[10px] text-zinc-400 px-2 py-1 uppercase tracking-wider font-semibold">
                      Switch AI Brain
                    </DropdownMenuLabel>
                    
                    {/* GLM 5.3 */}
                    <DropdownMenuItem 
                      onClick={() => handleModelSelect("glm", "z-ai/glm-5.3-flash")}
                      className="p-2 rounded-lg cursor-pointer text-xs hover:bg-white/[0.05] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">Z-AI GLM 5.3 Flash</p>
                        <p className="text-[10px] text-zinc-400">NVIDIA NIM • High Speed</p>
                      </div>
                      {activeDetails.providerKey === "glm" && activeDetails.model === "z-ai/glm-5.3-flash" && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </DropdownMenuItem>

                    {/* GLM 5.2 */}
                    <DropdownMenuItem 
                      onClick={() => handleModelSelect("glm", "z-ai/glm-5.2")}
                      className="p-2 rounded-lg cursor-pointer text-xs hover:bg-white/[0.05] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">Z-AI GLM 5.2</p>
                        <p className="text-[10px] text-zinc-400">NVIDIA NIM • Custom/Legacy</p>
                      </div>
                      {activeDetails.providerKey === "glm" && activeDetails.model === "z-ai/glm-5.2" && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </DropdownMenuItem>

                    {/* DeepSeek */}
                    <DropdownMenuItem 
                      onClick={() => handleModelSelect("deepseek", "deepseek-ai/deepseek-v4.1-flash")}
                      className="p-2 rounded-lg cursor-pointer text-xs hover:bg-white/[0.05] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">DeepSeek V4.1 Flash</p>
                        <p className="text-[10px] text-zinc-400">NVIDIA NIM • Deep Reasoning</p>
                      </div>
                      {activeDetails.providerKey === "deepseek" && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </DropdownMenuItem>

                    {/* Qwen */}
                    <DropdownMenuItem 
                      onClick={() => handleModelSelect("qwen", "qwen-plus")}
                      className="p-2 rounded-lg cursor-pointer text-xs hover:bg-white/[0.05] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">Alibaba Qwen-Plus</p>
                        <p className="text-[10px] text-zinc-400">DashScope • Multilingual</p>
                      </div>
                      {activeDetails.providerKey === "qwen" && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Database Scope Pill */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all">
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      <span>DB: {dbMode === 'single' ? 'Single' : 'Separate'}</span>
                      <ChevronDown className="w-3 h-3 text-cyan-400 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 bg-[#12131A] border-white/[0.1] text-zinc-200 p-1.5 rounded-xl z-50">
                    <DropdownMenuLabel className="text-[10px] text-zinc-400 px-2 py-1 uppercase tracking-wider font-semibold">
                      Database Scope
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => handleToggleDbMode("separate")}
                      className="p-2 rounded-lg cursor-pointer text-xs hover:bg-white/[0.05] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">Separate Database</p>
                        <p className="text-[10px] text-zinc-400">Workspace Isolated</p>
                      </div>
                      {dbMode === "separate" && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleToggleDbMode("single")}
                      className="p-2 rounded-lg cursor-pointer text-xs hover:bg-white/[0.05] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">Single Database</p>
                        <p className="text-[10px] text-zinc-400">Unified Cross-Tenant Ledger</p>
                      </div>
                      {dbMode === "single" && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* AI Memory Pill & Modal Trigger */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all">
                      <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Memory: {memScope === 'single' ? 'Single' : 'Separate'}</span>
                      <ChevronDown className="w-3 h-3 text-indigo-400 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-[#12131A] border-white/[0.1] text-zinc-200 p-1.5 rounded-xl z-50">
                    <DropdownMenuLabel className="text-[10px] text-zinc-400 px-2 py-1 uppercase tracking-wider font-semibold">
                      AI Memory Scope
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => handleToggleMemScope("separate")}
                      className="p-2 rounded-lg cursor-pointer text-xs hover:bg-white/[0.05] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">Separate Memory</p>
                        <p className="text-[10px] text-zinc-400">Workspace Isolated Facts</p>
                      </div>
                      {memScope === "separate" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleToggleMemScope("single")}
                      className="p-2 rounded-lg cursor-pointer text-xs hover:bg-white/[0.05] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">Single Memory</p>
                        <p className="text-[10px] text-zinc-400">Global Across All Workspaces</p>
                      </div>
                      {memScope === "single" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/[0.08]" />
                    <DropdownMenuItem 
                      onClick={() => setIsMemoryOpen(true)}
                      className="p-2 rounded-lg cursor-pointer text-xs text-indigo-300 hover:text-white hover:bg-indigo-500/20 font-medium"
                    >
                      View & Teach Memory Bank ({aiMemory.facts?.length || 0})
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 sm:p-6 overflow-auto space-y-4 z-10">
              {!selectedConversation || messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 mb-4 shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)]">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white tracking-tight">How can I assist your finances today?</h3>
                  <p className="text-zinc-400 text-xs mt-1 mb-6">
                    Running <strong className="text-violet-300">{activeDetails.name}</strong> • Database: <strong className="text-cyan-300">{dbMode}</strong> • Memory: <strong className="text-indigo-300">{memScope}</strong>
                  </p>

                  <div className="grid gap-2 w-full">
                    {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(suggestion)}
                        className="p-3 text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-violet-500/30 transition-all text-xs text-zinc-300 hover:text-white"
                      >
                        "{suggestion}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble key={message.id || index} message={message} />
                ))
              )}

              {isThinking && (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-violet-500/25 backdrop-blur-md animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin text-violet-300" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-violet-300">{activeDetails.badge} is reasoning...</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Evaluating finances ({dbMode} DB, {memScope} memory) with {activeDetails.model}
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-white/[0.06] bg-black/20 z-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Input
                    placeholder={isThinking ? `Formulating financial analysis with ${activeDetails.badge}...` : `Tell ${activeDetails.badge} about an expense, budget check, or rule...`}
                    value={messageInput}
                    disabled={isThinking}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="bg-white/[0.03] border-white/[0.08] focus:border-violet-500 text-white rounded-xl pr-10 text-xs sm:text-sm h-11"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <AudioRecorder onRecordingComplete={handleAudioRecorded} />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!messageInput.trim() || isThinking}
                  className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl h-11 px-4 shadow-[0_0_20px_-4px_rgba(139,92,246,0.6)] disabled:opacity-40"
                >
                  {isThinking ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Bank Modal */}
      <Dialog open={isMemoryOpen} onOpenChange={setIsMemoryOpen}>
        <DialogContent className="bg-[#12131A] border-white/[0.1] text-white sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              <span>AI Financial Memory Bank</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
              Active Scope: <strong className="uppercase">{memScope}</strong>. Facts here are recalled by {activeDetails.badge} when formulating transaction classifications and financial summaries.
            </div>

            {/* Add Fact */}
            <form onSubmit={handleAddMemory} className="flex gap-2">
              <Input
                placeholder="Teach a new rule or preference..."
                value={newMemoryInput}
                onChange={(e) => setNewMemoryInput(e.target.value)}
                className="bg-white/[0.03] border-white/[0.1] text-white text-xs h-9 rounded-xl focus:border-indigo-500"
              />
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs h-9 px-3 shrink-0">
                Teach
              </Button>
            </form>

            {/* List */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {aiMemory.facts?.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">No facts recorded.</p>
              ) : (
                aiMemory.facts.map((fact, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
                    <span className="text-zinc-200">• {fact}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMemory(idx)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={handleClearMemory}
                className="text-rose-400 hover:text-rose-300 underline"
              >
                Clear all facts
              </button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMemoryOpen(false)}
                className="border-white/[0.1] text-zinc-300 hover:bg-white/[0.05] rounded-xl text-xs h-8"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
