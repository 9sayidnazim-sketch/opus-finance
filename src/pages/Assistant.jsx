const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Plus, Sparkles, Zap, Bot } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import MessageBubble from "../components/assistant/MessageBubble";
import ConversationsList from "../components/assistant/ConversationsList";
import AudioRecorder from "../components/assistant/AudioRecorder";

const PROMPT_SUGGESTIONS = [
  "Spent $45 on dinner with clients",
  "How much have I spent on food this month?",
  "Check my budget limits",
  "Log $15 coffee with card"
];

export default function AssistantPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

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

  const handleSendMessage = async (textToSend) => {
    const content = (textToSend || messageInput).trim();
    if (!content || !selectedConversation) return;

    setMessageInput("");

    await db.agents.addMessage(selectedConversation, {
      role: "user",
      content,
    });
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
                Qwen AI Copilot
              </span>
              <span className="text-xs text-zinc-400">• Natural language financial ledger</span>
            </div>
            <h1 className="font-heading text-[30px] sm:text-[34px] leading-tight font-bold tracking-[-0.03em] text-white">
              AI Financial Assistant
            </h1>
            <p className="text-zinc-400 text-sm">
              Log transactions with natural speech, check your budget status, or send insights straight to WhatsApp.
            </p>
          </div>

          <Link to="/settings" className="flex-shrink-0">
            <Button className="bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold px-4 h-10 shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)] border border-emerald-400/30">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Gateway
            </Button>
          </Link>
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

            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    {selectedConversation ? selectedConversation.metadata?.name || "Financial Copilot" : "Active Session"}
                  </h2>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    DashScope Qwen-Plus • Connected
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 overflow-auto space-y-4 z-10">
              {!selectedConversation || messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 mb-4 shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)]">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white tracking-tight">How can I assist your finances today?</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 mb-6">
                    Type or speak in plain language. I will categorize, calculate, and record transactions into your app automatically.
                  </p>

                  <div className="w-full space-y-2 text-left">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Try asking:</p>
                    {PROMPT_SUGGESTIONS.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(suggestion)}
                        className="w-full p-2.5 text-xs text-zinc-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-violet-500/30 rounded-xl transition-all flex items-center justify-between group"
                      >
                        <span>"{suggestion}"</span>
                        <Zap className="w-3.5 h-3.5 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, idx) => (
                    <MessageBubble key={idx} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-white/[0.06] bg-[#0E0F16]/90 backdrop-blur-xl z-10">
              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                {PROMPT_SUGGESTIONS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border border-white/[0.06] flex-shrink-0 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <AudioRecorder 
                  onAudioRecorded={handleAudioRecorded}
                  disabled={!selectedConversation}
                />
                <Input
                  placeholder="Tell your AI assistant (e.g. Spent $30 on taxi with card)..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-white/[0.04] border-white/[0.1] text-white h-11 rounded-xl focus:border-violet-500 placeholder:text-zinc-500 text-sm"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!messageInput.trim()}
                  className="bg-violet-600 hover:bg-violet-500 shadow-[0_0_20px_-4px_rgba(139,92,246,0.6)] text-white h-11 px-4 rounded-xl transition-all"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}