const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Plus, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import MessageBubble from "../components/assistant/MessageBubble";
import ConversationsList from "../components/assistant/ConversationsList";
import AudioRecorder from "../components/assistant/AudioRecorder";

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
        name: `Conversation ${new Date().toLocaleDateString('en-US')}`,
      }
    }),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(newConv);
      setMessages([]);
    },
  });

  useEffect(() => {
    if (selectedConversation) {
      setMessages(selectedConversation.messages || []);
    }
  }, [selectedConversation]);

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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const userMessage = messageInput;
    setMessageInput("");

    await db.agents.addMessage(selectedConversation, {
      role: "user",
      content: userMessage,
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

  const whatsappURL = db.agents.getWhatsAppConnectURL('assistente_financeiro');

  return (
    <div className="p-4 md:p-8 h-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="mb-6">
          <h1 className="font-heading text-[32px] leading-tight font-semibold tracking-[-0.03em] text-foreground mb-2">Virtual Assistant</h1>
          <p className="text-slate-500">
            Chat with your financial assistant or connect via WhatsApp
          </p>
        </div>

        <Card className="bg-accent border-border mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-slate-900">Connect to WhatsApp</p>
                  <p className="text-sm text-slate-600">
                    Record transactions and check your finances straight from WhatsApp
                  </p>
                </div>
              </div>
              <a href={whatsappURL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => createConversationMutation.mutate()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-2">
                <ConversationsList
                  conversations={conversations}
                  selectedId={selectedConversation?.id}
                  onSelect={setSelectedConversation}
                  isLoading={loadingConversations}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">
                  {selectedConversation ? selectedConversation.metadata?.name || "Conversation" : "Select a conversation"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
                {!selectedConversation ? (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div>
                      <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">
                        Select a conversation or create a new one to get started
                      </p>
                      <Button onClick={() => createConversationMutation.mutate()}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Conversation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-auto mb-4 space-y-4">
                      {messages.map((message, idx) => (
                        <MessageBubble key={idx} message={message} />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="flex gap-2">
                      <AudioRecorder 
                        onAudioRecorded={handleAudioRecorded}
                        disabled={!selectedConversation}
                      />
                      <Input
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}