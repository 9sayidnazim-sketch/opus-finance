const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Save, Sparkles, Calendar } from "lucide-react";
import { toast } from "sonner";

import NotificationToggle from "../components/settings/NotificationToggle";
import NotificationThreshold from "../components/settings/NotificationThreshold";
import WhatsAppConnection from "../components/settings/WhatsAppConnection";
import { getAIConfig, saveAIConfig, testAIConnection } from "@/api/aiClient";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(null);
  const [aiConfig, setAiConfig] = useState(getAIConfig());

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

  const whatsappURL = db.agents.getWhatsAppConnectURL('assistente_financeiro');

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
              <span className="text-xs text-zinc-400">• Automation & Alerts</span>
            </div>
            <h1 className="font-heading text-[30px] sm:text-[34px] leading-tight font-bold tracking-[-0.03em] text-white">
              Notifications & Integrations
            </h1>
            <p className="text-zinc-400 text-sm">
              Configure real-time threshold warnings, WhatsApp gateways, and Qwen AI copilot defaults.
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

        {/* AI Copilot & Auto-Record Card */}
        <div className="rounded-2xl bg-[#12131A]/95 border border-violet-500/30 p-6 backdrop-blur-2xl shadow-[0_0_30px_-10px_rgba(139,92,246,0.2)] relative overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 w-64 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-white tracking-tight">AI Copilot & Natural Language Ledger</h2>
                <p className="text-xs text-zinc-400">
                  Alibaba Cloud Model Studio (Qwen-Plus) automated transaction logging
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 font-mono">
              {aiConfig.model}
            </span>
          </div>

          <div className="space-y-4">
            <NotificationToggle
              label="Auto-Record Transactions in App Ledger"
              description="Automatically extract amount, category, and method from chat messages and record them into your app database"
              enabled={aiConfig.autoRecordTransactions}
              onChange={(val) => {
                const updated = saveAIConfig({ autoRecordTransactions: val });
                setAiConfig(updated);
                toast.success(`Auto-record ${val ? "enabled" : "disabled"}`);
              }}
            />

            <NotificationToggle
              label="Auto-Send WhatsApp Receipt Confirmation"
              description="Automatically send an instant WhatsApp notification receipt whenever the AI logs a new transaction"
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
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <Input
                  placeholder="e.g. 971501234567 or 5511999999999"
                  value={aiConfig.recipientPhone}
                  onChange={(e) => {
                    const updated = saveAIConfig({ recipientPhone: e.target.value });
                    setAiConfig(updated);
                  }}
                  className="bg-white/[0.04] border-white/[0.1] text-white h-10 rounded-xl focus:border-violet-500 font-mono text-sm max-w-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const res = await testAIConnection();
                    if (res.ok) toast.success("AI Gateway connection verified!");
                    else toast.error("Could not reach AI Gateway: " + (res.error || "error"));
                  }}
                  className="border-white/[0.1] bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] rounded-xl text-xs h-10"
                >
                  Test AI Connection
                </Button>
              </div>
              <p className="text-[11px] text-zinc-400">
                Receipts, budget alerts, and AI insights are sent to this WhatsApp recipient.
              </p>
            </div>
          </div>
        </div>

        {/* Budget Alerts Card */}
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

        {/* Goal Alerts Card */}
        <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-tight">Savings Goal Alerts</h2>
              <p className="text-xs text-zinc-400">
                Target milestones and deadline notifications
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <NotificationToggle
              label="Goal Deadline Warnings"
              description="Notify when a target date for a savings goal is approaching"
              enabled={settings.goal_deadline_alerts_enabled}
              onChange={(value) => handleChange('goal_deadline_alerts_enabled', value)}
            />
            
            {settings.goal_deadline_alerts_enabled && (
              <NotificationThreshold
                label="Notice Lead Time"
                description="Number of days before deadline to dispatch notification"
                value={settings.goal_deadline_days}
                onChange={(value) => handleChange('goal_deadline_days', value)}
                min={1}
                max={30}
                step={1}
                suffix=" days"
              />
            )}
          </div>
        </div>

        {/* Bill Due Alerts Card */}
        <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-tight">Bill Due Dates & Overdue Alerts</h2>
              <p className="text-xs text-zinc-400">
                Reminders for scheduled accounts payable and subscriptions
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <NotificationToggle
              label="Upcoming Due Date Alerts"
              description="Notify before a scheduled bill deadline"
              enabled={settings.bill_due_alerts_enabled}
              onChange={(value) => handleChange('bill_due_alerts_enabled', value)}
            />
            
            {settings.bill_due_alerts_enabled && (
              <>
                <NotificationThreshold
                  label="Advance Notice"
                  description="Days before the due date to send the reminder"
                  value={settings.bill_due_days_before}
                  onChange={(value) => handleChange('bill_due_days_before', value)}
                  min={1}
                  max={7}
                  step={1}
                  suffix=" days"
                />

                <NotificationToggle
                  label="Due Day Immediate Alert"
                  description="Also receive a high-priority reminder on the exact due date"
                  enabled={settings.bill_due_day_alert}
                  onChange={(value) => handleChange('bill_due_day_alert', value)}
                />
              </>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-violet-600 hover:bg-violet-500 shadow-[0_0_24px_-4px_rgba(139,92,246,0.6)] text-white font-semibold rounded-xl text-xs px-6 h-11 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save All Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
}