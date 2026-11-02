const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Save } from "lucide-react";
import { toast } from "sonner";

import NotificationToggle from "../components/settings/NotificationToggle";
import NotificationThreshold from "../components/settings/NotificationThreshold";
import WhatsAppConnection from "../components/settings/WhatsAppConnection";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(null);

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
      // Criar configurações padrão
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
        weekly_summary_day: "domingo",
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            Loading settings...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-[32px] leading-tight font-semibold tracking-[-0.03em] text-foreground mb-2">Notification Settings</h1>
          <p className="text-slate-500">
            Configure how and when you want to receive financial alerts
          </p>
        </div>

        <div className="space-y-6">
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

          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Budget Alerts</CardTitle>
                  <CardDescription>
                    Get notified when your spending approaches the limit
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <NotificationToggle
                label="Budget Alerts"
                description="Notify when the configured budget percentage is reached"
                enabled={settings.budget_alerts_enabled}
                onChange={(value) => handleChange('budget_alerts_enabled', value)}
              />
              
              {settings.budget_alerts_enabled && (
                <NotificationThreshold
                  label="Alert Percentage"
                  description="Alert when this budget percentage is reached"
                  value={settings.budget_alert_threshold}
                  onChange={(value) => handleChange('budget_alert_threshold', value)}
                  min={50}
                  max={100}
                  step={5}
                  suffix="%"
                />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Goal Alerts</CardTitle>
                  <CardDescription>
                    Get reminders about your savings goals
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <NotificationToggle
                label="Deadline Alerts"
                description="Notify when a goal's target date is approaching"
                enabled={settings.goal_deadline_alerts_enabled}
                onChange={(value) => handleChange('goal_deadline_alerts_enabled', value)}
              />
              
              {settings.goal_deadline_alerts_enabled && (
                <NotificationThreshold
                  label="Alert Lead Time"
                  description="Alert this many days before the target date"
                  value={settings.goal_deadline_days}
                  onChange={(value) => handleChange('goal_deadline_days', value)}
                  min={1}
                  max={30}
                  step={1}
                  suffix=" days"
                />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-orange-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Large Transaction Alerts</CardTitle>
                  <CardDescription>
                    Get notified when you spend above a set amount
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <NotificationToggle
                label="Large Expense Alerts"
                description="Notify when an expense above the set amount is recorded"
                enabled={settings.large_transaction_alerts_enabled}
                onChange={(value) => handleChange('large_transaction_alerts_enabled', value)}
              />
              
              {settings.large_transaction_alerts_enabled && (
                <NotificationThreshold
                  label="Minimum Amount"
                  description="Consider transactions large from this amount up"
                  value={settings.large_transaction_threshold}
                  onChange={(value) => handleChange('large_transaction_threshold', value)}
                  min={100}
                  max={5000}
                  step={100}
                  suffix=""
                />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-red-50 to-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Due Date Alerts</CardTitle>
                  <CardDescription>
                    Get reminders about upcoming bills
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <NotificationToggle
                label="Bill Due Alerts"
                description="Notify about bills nearing their due date"
                enabled={settings.bill_due_alerts_enabled}
                onChange={(value) => handleChange('bill_due_alerts_enabled', value)}
              />
              
              {settings.bill_due_alerts_enabled && (
                <>
                  <NotificationThreshold
                    label="Alert Lead Time"
                    description="Alert X days before the due date"
                    value={settings.bill_due_days_before}
                    onChange={(value) => handleChange('bill_due_days_before', value)}
                    min={1}
                    max={7}
                    step={1}
                    suffix=" days"
                  />

                  <div className="pl-12">
                    <NotificationToggle
                      label="Alert on Due Date"
                      description="Also get notified on the day the bill is due"
                      enabled={settings.bill_due_day_alert}
                      onChange={(value) => handleChange('bill_due_day_alert', value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Automatic Summaries</CardTitle>
                  <CardDescription>
                    Get periodic summaries of your finances
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <NotificationToggle
                label="Weekly Summary"
                description="Get a weekly report with your transactions and financial status"
                enabled={settings.weekly_summary_enabled}
                onChange={(value) => handleChange('weekly_summary_enabled', value)}
              />
              
              {settings.weekly_summary_enabled && (
                <div className="pl-12">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Day of the Week
                  </label>
                  <select
                    value={settings.weekly_summary_day}
                    onChange={(e) => handleChange('weekly_summary_day', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="segunda">Monday</option>
                    <option value="terca">Tuesday</option>
                    <option value="quarta">Wednesday</option>
                    <option value="quinta">Thursday</option>
                    <option value="sexta">Friday</option>
                    <option value="sabado">Saturday</option>
                    <option value="domingo">Sunday</option>
                  </select>
                </div>
              )}

              <NotificationToggle
                label="Monthly Summary"
                description="Get a complete monthly report of your finances"
                enabled={settings.monthly_summary_enabled}
                onChange={(value) => handleChange('monthly_summary_enabled', value)}
              />
              
              {settings.monthly_summary_enabled && (
                <NotificationThreshold
                  label="Day of the Month"
                  description="Day you want to receive the monthly summary"
                  value={settings.monthly_summary_day}
                  onChange={(value) => handleChange('monthly_summary_day', value)}
                  min={1}
                  max={28}
                  step={1}
                  suffix=""
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900 mb-2">
                    How do notifications work?
                  </h3>
                  <ul className="space-y-1 text-sm text-emerald-800">
                    <li>• <strong>Budgets:</strong> You'll be alerted when spending reaches the configured percentage</li>
                    <li>• <strong>Goals:</strong> You'll get reminders when the target date approaches</li>
                    <li>• <strong>Large Transactions:</strong> You'll be notified when an expense above the set amount is recorded</li>
                    <li>• <strong>Due Dates:</strong> You'll get alerts before and on the day bills are due</li>
                    <li>• <strong>Summaries:</strong> Automatic reports analyzing your finances</li>
                  </ul>
                  <p className="text-sm text-emerald-700 mt-3">
                    💡 Connect your WhatsApp above to start receiving notifications!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}