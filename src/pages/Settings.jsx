const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  Save, 
  Sparkles, 
  Database, 
  BrainCircuit, 
  Layers, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Activity,
  Zap,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

import NotificationToggle from "../components/settings/NotificationToggle";
import NotificationThreshold from "../components/settings/NotificationThreshold";
import WhatsAppConnection from "../components/settings/WhatsAppConnection";
import { 
  getAIConfig, 
  saveAIConfig, 
  testAIConnection, 
  PROVIDERS_CATALOG,
  getAIMemoryScope,
  setAIMemoryScope,
  getAIMemory,
  addAIMemoryFact,
  deleteAIMemoryFact,
  clearAIMemory,
  getDatabaseMode,
  setDatabaseMode
} from "@/api/aiClient";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(null);

  // Multi-model AI Config State
  const [aiConfig, setAiConfig] = useState(getAIConfig());
  const [activeProviderKey, setActiveProviderKey] = useState(aiConfig.activeProvider || "glm");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { ok, latencyMs, error }
  const [isTesting, setIsTesting] = useState(false);

  // Database Mode State
  const [dbMode, setDbModeState] = useState(getDatabaseMode());

  // AI Memory Architecture State
  const [memScope, setMemScopeState] = useState(getAIMemoryScope());
  const [aiMemory, setAiMemory] = useState(getAIMemory());
  const [newFactText, setNewFactText] = useState("");

  const { data: settingsList, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const result = await db.entities.NotificationSettings.list();
      return result;
    },
    initialData: [],
  });

  useEffect(() => {
    if (settingsList && settingsList.length > 0) {
      setSettings(settingsList[0]);
    } else if (!isLoading && settingsList.length === 0) {
      createMutation.mutate({
        budget_alerts_enabled: true,
        budget_alert_threshold: 80,
        goal_deadline_alerts_enabled: true,
        goal_deadline_days: 7,
        large_transaction_alerts_enabled: true,
        large_transaction_threshold: 500,
        bill_due_alerts_enabled: true,
        bill_due_days_before: 2,
        bill_due_day_alert: true,
        weekly_summary_enabled: true,
        weekly_summary_day: "sunday",
        monthly_summary_enabled: true,
        monthly_summary_day: 1,
        whatsapp_connected: false,
        notifications_channel: "whatsapp"
      });
    }
  }, [settingsList, isLoading]);

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.NotificationSettings.create(data),
    onSuccess: (newSettings) => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      setSettings(newSettings);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.NotificationSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success("Settings saved successfully!");
    },
  });

  const handleSave = () => {
    if (settings?.id) {
      updateMutation.mutate({ id: settings.id, data: settings });
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Provider config update
  const handleProviderChange = (providerId) => {
    setActiveProviderKey(providerId);
    setTestStatus(null);
    const updated = saveAIConfig({ activeProvider: providerId });
    setAiConfig(updated);
    toast.success(`Active AI provider switched to ${PROVIDERS_CATALOG[providerId]?.name}`);
  };

  const handleProviderFieldChange = (providerId, field, val) => {
    const nextConfigs = {
      ...aiConfig.providerConfigs,
      [providerId]: {
        ...aiConfig.providerConfigs?.[providerId],
        [field]: val
      }
    };
    const updated = saveAIConfig({ providerConfigs: nextConfigs });
    setAiConfig(updated);
  };

  const handleTestConnection = async (targetProvider) => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await testAIConnection(targetProvider || activeProviderKey);
      setTestStatus(res);
      if (res.ok) {
        toast.success(`Connected to ${res.provider} (${res.latencyMs}ms)`);
      } else {
        toast.error(`Connection failed: ${res.error || "Check key and endpoint"}`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  // Database Mode Toggle
  const handleDbModeToggle = (mode) => {
    setDatabaseMode(mode);
    setDbModeState(mode);
    queryClient.invalidateQueries();
    toast.success(`Database Mode switched to ${mode === 'single' ? 'Single Unified Ledger' : 'Separate Workspace Isolated'}`);
  };

  // Memory Scope Toggle
  const handleMemoryScopeToggle = (scope) => {
    setAIMemoryScope(scope);
    setMemScopeState(scope);
    setAiMemory(getAIMemory());
    toast.success(`AI Memory Scope switched to ${scope === 'single' ? 'Single (Global Memory)' : 'Separate (Workspace Memory)'}`);
  };

  const handleAddMemoryFact = (e) => {
    e.preventDefault();
    if (!newFactText.trim()) return;
    const updated = addAIMemoryFact(newFactText);
    setAiMemory(updated);
    setNewFactText("");
    toast.success("Fact recorded in AI financial memory");
  };

  const handleDeleteMemoryFact = (idx) => {
    const updated = deleteAIMemoryFact(idx);
    setAiMemory(updated);
    toast.success("Memory entry removed");
  };

  const handleClearMemory = () => {
    if (confirm("Are you sure you want to clear AI memory for this scope?")) {
      const empty = clearAIMemory();
      setAiMemory(empty);
      toast.success("Memory cleared");
    }
  };

  const whatsappURL = db.agents.getWhatsAppConnectURL('assistente_financeiro');
  const activeMeta = PROVIDERS_CATALOG[activeProviderKey] || PROVIDERS_CATALOG.glm;
  const currentProviderConfig = aiConfig.providerConfigs?.[activeProviderKey] || {};

  if (isLoading || !settings) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto py-12 text-center text-zinc-500">
          Loading preferences...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 uppercase tracking-wider">
                System Preferences
              </span>
              <span className="text-xs text-zinc-400">• Multi-Model AI & Storage</span>
            </div>
            <h1 className="font-heading text-[30px] sm:text-[34px] leading-tight font-bold tracking-[-0.03em] text-white">
              AI Models, Database & Memory
            </h1>
            <p className="text-zinc-400 text-sm">
              Configure Z-AI GLM 5.2/5.3, DeepSeek, Qwen AI, Separate vs. Single Database, and Memory architecture.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-violet-600 hover:bg-violet-500 shadow-[0_0_24px_-4px_rgba(139,92,246,0.6)] text-white font-semibold rounded-xl text-xs px-5 h-10 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {/* ============================================================ */}
        {/* 1. MULTI-MODEL AI COPILOT HUB                                */}
        {/* ============================================================ */}
        <div className="rounded-2xl bg-[#12131A]/95 border border-violet-500/30 p-6 backdrop-blur-2xl shadow-[0_0_30px_-10px_rgba(139,92,246,0.2)] relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-64 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>AI Copilot & Multi-Model Engine</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-mono">
                    Active: {activeMeta.badge}
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Switch dynamically between Z-AI GLM, DeepSeek, and Alibaba Qwen models
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTestConnection(activeProviderKey)}
              disabled={isTesting}
              className="border-white/[0.12] bg-white/[0.04] text-zinc-200 hover:text-white hover:bg-white/[0.08] rounded-xl text-xs h-9"
            >
              <Activity className={`w-3.5 h-3.5 mr-1.5 ${isTesting ? 'animate-spin text-violet-400' : 'text-emerald-400'}`} />
              {isTesting ? "Testing..." : `Test ${activeMeta.badge} Connection`}
            </Button>
          </div>

          {/* Provider Selection Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Choose Active AI Provider</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {Object.values(PROVIDERS_CATALOG).map((p) => {
                const isActive = activeProviderKey === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderChange(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isActive
                        ? "bg-violet-600/20 border-violet-500/60 shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]"
                        : "bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{p.name.split(" ")[0]}</span>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">{p.badge}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Provider Configuration Card */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-white">{activeMeta.name} Configuration</h3>
                <p className="text-[11px] text-zinc-400">{activeMeta.description}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                {currentProviderConfig.model || activeMeta.defaultModel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Model Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-300">Model</label>
                <select
                  value={currentProviderConfig.model || activeMeta.defaultModel}
                  onChange={(e) => handleProviderFieldChange(activeProviderKey, "model", e.target.value)}
                  className="w-full bg-[#12131A] border border-white/[0.1] text-white text-xs h-10 rounded-xl px-3 focus:outline-none focus:border-violet-500 font-mono"
                >
                  {activeMeta.models.map((m) => (
                    <option key={m} value={m} className="bg-[#12131A] text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Endpoint Base URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-300">API Endpoint URL</label>
                <Input
                  value={currentProviderConfig.baseUrl || activeMeta.defaultBaseUrl}
                  onChange={(e) => handleProviderFieldChange(activeProviderKey, "baseUrl", e.target.value)}
                  className="bg-white/[0.03] border-white/[0.1] text-white h-10 rounded-xl font-mono text-xs focus:border-violet-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-zinc-300">API Key</label>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showApiKey ? "Hide" : "Show"}</span>
                </button>
              </div>
              <Input
                type={showApiKey ? "text" : "password"}
                value={currentProviderConfig.apiKey ?? activeMeta.defaultApiKey}
                onChange={(e) => handleProviderFieldChange(activeProviderKey, "apiKey", e.target.value)}
                className="bg-white/[0.03] border-white/[0.1] text-white h-10 rounded-xl font-mono text-xs focus:border-violet-500"
                placeholder="Enter API Key..."
              />
            </div>

            {/* Connection Test Result Badge */}
            {testStatus && (
              <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                testStatus.ok 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                <div className="flex items-center gap-2">
                  {testStatus.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Zap className="w-4 h-4 text-rose-400" />}
                  <span>
                    {testStatus.ok 
                      ? `Verified ${testStatus.provider} (${testStatus.model}) in ${testStatus.latencyMs}ms` 
                      : `Failed: ${testStatus.error}`}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase">{testStatus.ok ? "HTTP 200" : "ERROR"}</span>
              </div>
            )}
          </div>

          {/* Automation Toggles */}
          <div className="space-y-3 pt-2">
            <NotificationToggle
              label="Auto-Record Transactions in App Ledger"
              description="Automatically formulate and record expenses and income when mentioned in natural language"
              enabled={aiConfig.autoRecordTransactions}
              onChange={(val) => {
                const updated = saveAIConfig({ autoRecordTransactions: val });
                setAiConfig(updated);
                toast.success(`Auto-record ${val ? "enabled" : "disabled"}`);
              }}
            />

            <NotificationToggle
              label="Auto-Send WhatsApp Receipt Confirmation"
              description="Automatically dispatch instant WhatsApp receipt when transactions are logged"
              enabled={aiConfig.autoSendWhatsAppReceipt}
              onChange={(val) => {
                const updated = saveAIConfig({ autoSendWhatsAppReceipt: val });
                setAiConfig(updated);
                toast.success(`WhatsApp receipt auto-dispatch ${val ? "enabled" : "disabled"}`);
              }}
            />

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Destination WhatsApp Phone Number (with Country Code)
              </label>
              <Input
                placeholder="e.g. 971501234567"
                value={aiConfig.recipientPhone}
                onChange={(e) => {
                  const updated = saveAIConfig({ recipientPhone: e.target.value });
                  setAiConfig(updated);
                }}
                className="bg-white/[0.04] border-white/[0.1] text-white h-10 rounded-xl focus:border-violet-500 font-mono text-sm max-w-sm"
              />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. DATABASE ARCHITECTURE: SEPARATE VS SINGLE DATABASE        */}
        {/* ============================================================ */}
        <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-6 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Database Storage Architecture</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-mono uppercase">
                  {dbMode === 'single' ? 'Single Unified' : 'Separate Workspace'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Choose whether data is partitioned per workspace or stored in a single unified ledger
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Separate Database Card */}
            <div
              onClick={() => handleDbModeToggle("separate")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                dbMode === "separate"
                  ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Separate Database</span>
                </div>
                {dbMode === "separate" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong>Workspace Isolated:</strong> Each workspace (Personal, Demo, Business) maintains completely separate transactions, budgets, bills, and family records.
              </p>
              <div className="mt-3 pt-2 border-t border-white/[0.06] text-[10px] text-zinc-500 font-mono">
                Key: b44_data_[tenantId]_[entity]
              </div>
            </div>

            {/* Single Database Card */}
            <div
              onClick={() => handleDbModeToggle("single")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                dbMode === "single"
                  ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Single Database</span>
                </div>
                {dbMode === "single" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong>Unified Cross-Tenant Ledger:</strong> All accounts and workspaces write to a single consolidated database. Ideal for single-household global tracking.
              </p>
              <div className="mt-3 pt-2 border-t border-white/[0.06] text-[10px] text-zinc-500 font-mono">
                Key: b44_data_single_[entity]
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. AI MEMORY ARCHITECTURE: SEPARATE VS SINGLE MEMORY         */}
        {/* ============================================================ */}
        <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-6 backdrop-blur-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>AI Financial Memory Architecture</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-mono uppercase">
                    {memScope === 'single' ? 'Single Global Memory' : 'Separate Workspace Memory'}
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Manage how OPUS AI retains financial rules, user habits, and recurring budget facts
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleClearMemory}
              className="border-white/[0.1] text-rose-300 hover:text-white hover:bg-rose-500/20 text-xs h-8 rounded-xl"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Memory
            </Button>
          </div>

          {/* Scope Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => handleMemoryScopeToggle("separate")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                memScope === "separate"
                  ? "bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Separate Memory</span>
                {memScope === "separate" && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-xs text-zinc-300">
                The AI remembers financial rules and conversation facts strictly within the active workspace.
              </p>
            </div>

            <div
              onClick={() => handleMemoryScopeToggle("single")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                memScope === "single"
                  ? "bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Single (Global Memory)</span>
                {memScope === "single" && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-xs text-zinc-300">
                The AI remembers your preferences, recurring rules, and habits globally across all workspaces.
              </p>
            </div>
          </div>

          {/* Memory Facts Inspector */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <h3 className="text-xs font-semibold text-white flex items-center justify-between">
              <span>Learned Financial Memory Bank ({aiMemory.facts?.length || 0} facts)</span>
              <span className="text-[10px] text-zinc-400 font-mono">Injected into system prompt</span>
            </h3>

            {/* Add Custom Fact */}
            <form onSubmit={handleAddMemoryFact} className="flex gap-2">
              <Input
                placeholder="Teach AI a financial rule (e.g. 'Payday is the 1st and 15th' or 'Primary card is Chase')..."
                value={newFactText}
                onChange={(e) => setNewFactText(e.target.value)}
                className="bg-white/[0.03] border-white/[0.1] text-white text-xs h-9 rounded-xl focus:border-indigo-500"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs h-9 px-3 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Fact
              </Button>
            </form>

            {/* List of Facts */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {aiMemory.facts?.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">No custom facts learned yet. Add one above or tell the AI in chat.</p>
              ) : (
                aiMemory.facts.map((fact, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-xs">
                    <span className="text-zinc-200">• {fact}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMemoryFact(idx)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                      title="Delete fact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Connection Hub */}
        <WhatsAppConnection 
          isConnected={settings.whatsapp_connected}
          whatsappURL={whatsappURL}
          onConnectionChange={(connected) => {
            handleChange('whatsapp_connected', connected);
            if (settings?.id) {
              updateMutation.mutate({ 
                id: settings.id, 
                data: { ...settings, whatsapp_connected: connected } 
              });
            }
          }}
        />

        {/* Budget Limit Alerts */}
        <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-tight">Budget Limit Alerts</h2>
              <p className="text-xs text-zinc-400">
                Get notified when your monthly category spending reaches critical limits
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <NotificationToggle
              label="Budget Threshold Warnings"
              description="Notify when spending crosses your threshold percentage"
              enabled={settings.budget_alerts_enabled}
              onChange={(value) => handleChange('budget_alerts_enabled', value)}
            />
            
            {settings.budget_alerts_enabled && (
              <NotificationThreshold
                label="Trigger Threshold Percentage"
                description="Alert triggered when category reaches this percentage of budget"
                value={settings.budget_alert_threshold}
                onChange={(value) => handleChange('budget_alert_threshold', value)}
                min={50}
                max={100}
                step={5}
                suffix="%"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
