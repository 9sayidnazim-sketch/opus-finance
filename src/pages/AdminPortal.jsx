import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { authService } from '@/api/authService';
import { 
  Users, 
  CreditCard, 
  Bell, 
  Building2, 
  ShieldCheck, 
  Search, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Clock, 
  RefreshCw, 
  Trash2, 
  Crown,
  KeyRound,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';

export default function AdminPortal() {
  const { user, isAdmin, login } = useAuth();
  const { toast } = useToast();

  // Admin login fallback if not authenticated as admin
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Active admin tab
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'subscriptions' | 'notifications' | 'tenants'

  // Data state
  const [users, setUsers] = useState(() => authService.getAllUsers());
  const [tenants, setTenants] = useState(() => authService.getAllTenants());
  const [dispatchedNotifs, setDispatchedNotifs] = useState(() => authService.getAllDispatchedNotifications());

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Subscription Edit Modal State
  const [editingSubUser, setEditingSubUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const [selectedPlanStatus, setSelectedPlanStatus] = useState('active');

  // Customer Notification Composer State
  const [notifTarget, setNotifTarget] = useState('all'); // 'all' or user email
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('info'); // 'info' | 'alert' | 'subscription'
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  const refreshAdminData = () => {
    setUsers(authService.getAllUsers());
    setTenants(authService.getAllTenants());
    setDispatchedNotifs(authService.getAllDispatchedNotifications());
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
      );
    });
  }, [users, searchQuery]);

  // Executive metrics
  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.emailVerified).length;
  const activeSubs = users.filter(u => u.subscriptionStatus === 'active').length;
  const totalTenantsCount = tenants.length;

  // Handle Admin Login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAdminLoginError('');
    try {
      const res = login(adminUsername, adminPassword);
      if (res.success) {
        if (res.user.role === 'admin') {
          toast({
            title: "Admin Portal Unlocked",
            description: "Signed in as System Administrator.",
          });
          refreshAdminData();
        } else {
          setAdminLoginError("This account does not have administrator privileges.");
        }
      } else {
        setAdminLoginError(res.message || "Invalid admin credentials.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Subscription Update
  const handleSaveSubscription = () => {
    if (!editingSubUser) return;
    authService.updateUserSubscription(editingSubUser.id, {
      tier: selectedPlan,
      status: selectedPlanStatus
    });
    toast({
      title: "Subscription Updated",
      description: `Updated ${editingSubUser.name || editingSubUser.email} to ${selectedPlan} (${selectedPlanStatus}).`,
    });
    setEditingSubUser(null);
    refreshAdminData();
  };

  // Handle Role Toggle
  const handleToggleRole = (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    authService.updateUserRole(userId, newRole);
    toast({
      title: "Role Updated",
      description: `Role changed to ${newRole}.`,
    });
    refreshAdminData();
  };

  // Handle Resend Verification manually on behalf of user
  const handleManualResendVerification = (targetEmail) => {
    const res = authService.resendVerificationEmail(targetEmail);
    if (res.success) {
      toast({
        title: "Verification Dispatched",
        description: `Generated code: ${res.code} for ${targetEmail}.`,
      });
      refreshAdminData();
    }
  };

  // Handle User Deletion
  const handleDeleteUser = (userId, userName) => {
    if (confirm(`Are you sure you want to delete user ${userName}?`)) {
      authService.deleteUser(userId);
      toast({
        title: "User Removed",
        description: `Account has been deleted.`,
      });
      refreshAdminData();
    }
  };

  // Handle Dispatch Customer Notification
  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast({
        title: "Incomplete Notification",
        description: "Please provide both a title and message.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingNotif(true);
    try {
      authService.sendCustomerNotification({
        targetUserEmail: notifTarget,
        tenantId: 'all',
        title: notifTitle,
        message: notifMessage,
        type: notifType
      });

      toast({
        title: "Notification Dispatched",
        description: `Delivered to ${notifTarget === 'all' ? 'All Customers' : notifTarget}.`,
      });

      setNotifTitle('');
      setNotifMessage('');
      setDispatchedNotifs(authService.getAllDispatchedNotifications());
    } finally {
      setIsSendingNotif(false);
    }
  };

  // If user is not admin, show dedicated Admin Login Form
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#12131A] border border-amber-500/25 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent)] pointer-events-none" />

          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Admin Portal Access</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Enter administrator credentials to manage customers, subscriptions, and platform notifications.
            </p>
          </div>

          {adminLoginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{adminLoginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Admin Username / Email</Label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="pl-9 bg-white/[0.03] border-white/[0.1] text-white focus:border-amber-500 h-10 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Admin Password</Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="admin"
                  className="pl-9 bg-white/[0.03] border-white/[0.1] text-white focus:border-amber-500 h-10 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <span>Unlock Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/[0.08] text-center text-xs text-zinc-400">
            Default credentials: <span className="font-mono text-amber-300 font-medium">admin</span> / <span className="font-mono text-amber-300 font-medium">admin</span>
          </div>
        </div>
      </div>
    );
  }

  // Admin Authenticated View
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold tracking-wide uppercase">
              Admin Portal
            </span>
            <span className="text-xs text-zinc-400">Signed in as {user?.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Platform Operations & Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Audit customer accounts, manage subscription tiers, and dispatch customer notifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={refreshAdminData}
            className="border-white/[0.1] text-zinc-300 hover:bg-white/[0.06] rounded-xl text-xs h-9 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Executive Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-numbers">{totalUsers}</div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {verifiedUsers} email verified
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Active Subscriptions</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-numbers">{activeSubs}</div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Pro & Enterprise tiers
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Workspaces / Tenants</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-numbers">{totalTenantsCount}</div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Multi-tenant isolated
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Dispatched Alerts</span>
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-numbers">{dispatchedNotifs.length}</div>
          <p className="text-[11px] text-amber-300 mt-1">
            Delivered to user feeds
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'subscriptions'
              ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscription Controls</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Dispatch Customer Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'tenants'
              ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tenant Directory</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: CUSTOMER DIRECTORY                                    */}
      {/* ============================================================ */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers by name or email..."
                className="pl-9 bg-white/[0.03] border-white/[0.08] text-white text-xs h-9 rounded-xl"
              />
            </div>
            <p className="text-xs text-zinc-400">
              Showing {filteredUsers.length} of {totalUsers} accounts
            </p>
          </div>

          <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-[#12131A]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] border-b border-white/[0.06] text-zinc-400 font-medium">
                  <tr>
                    <th className="p-3.5 pl-4">Customer</th>
                    <th className="p-3.5">Email & Verification</th>
                    <th className="p-3.5">Workspace</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Subscription</th>
                    <th className="p-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-sm">
                            {u.avatar || '👤'}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{u.name || u.username}</p>
                            <p className="text-[11px] text-zinc-400">@{u.username || 'user'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1">
                          <p className="text-zinc-200 font-mono text-[11px]">{u.email}</p>
                          {u.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                              <button
                                onClick={() => handleManualResendVerification(u.email)}
                                className="text-[10px] text-violet-400 hover:text-violet-300 underline"
                              >
                                Dispatch Code
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="text-zinc-300 font-medium">
                          {tenants.find(t => t.id === u.tenantId)?.name || u.tenantId || "Default"}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-white/[0.05] text-zinc-300 border-white/[0.1] hover:bg-white/[0.08]'
                          }`}
                          title="Click to toggle role"
                        >
                          {u.role === 'admin' ? '👑 Admin' : 'Customer'}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white text-[11px]">{u.subscriptionTier || 'Pro'}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                            u.subscriptionStatus === 'active' 
                              ? 'bg-emerald-500/15 text-emerald-300' 
                              : 'bg-amber-500/15 text-amber-300'
                          }`}>
                            {u.subscriptionStatus || 'active'}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingSubUser(u);
                              setSelectedPlan(u.subscriptionTier || 'Pro');
                              setSelectedPlanStatus(u.subscriptionStatus || 'active');
                            }}
                            className="h-7 px-2.5 text-[11px] text-violet-400 hover:text-white hover:bg-violet-500/20 rounded-lg"
                          >
                            Edit Plan
                          </Button>
                          {u.id !== user?.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                              className="h-7 w-7 p-0 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SUBSCRIPTION CONTROLS                                 */}
      {/* ============================================================ */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent border border-violet-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Tier & Billing Management</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Assign plans to customer accounts or whole tenant workspaces. Changes take effect instantly.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                Starter Free ($0)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                Pro ($29/mo)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                Enterprise ($199/mo)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(u => (
              <div key={u.id} className="p-4 rounded-2xl bg-[#12131A] border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white truncate">{u.name || u.email}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      u.subscriptionStatus === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {u.subscriptionStatus}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono mb-3">{u.email}</p>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
                    <p className="text-[11px] text-zinc-400">Current Plan</p>
                    <p className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-violet-400" />
                      {u.subscriptionTier || 'Pro'}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setEditingSubUser(u);
                    setSelectedPlan(u.subscriptionTier || 'Pro');
                    setSelectedPlanStatus(u.subscriptionStatus || 'active');
                  }}
                  className="w-full h-9 bg-white/[0.05] hover:bg-violet-600 hover:text-white text-zinc-300 border border-white/[0.1] rounded-xl text-xs font-medium transition-all"
                >
                  Change Subscription Plan
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: CUSTOMER NOTIFICATION DISPATCHER                      */}
      {/* ============================================================ */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dispatch Composer */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#12131A] border border-white/[0.08] space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white">Dispatch Notification</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Send in-app alerts, billing reminders, or announcements to customer dashboards.
              </p>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Target Recipient</Label>
                <Select value={notifTarget} onValueChange={setNotifTarget}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.1] text-white rounded-xl text-xs h-10">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12131A] border-white/[0.1] text-zinc-200">
                    <SelectItem value="all">📢 Broadcast to All Customers</SelectItem>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.email}>
                        👤 {u.name || u.username} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Notification Category</Label>
                <Select value={notifType} onValueChange={setNotifType}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.1] text-white rounded-xl text-xs h-10">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12131A] border-white/[0.1] text-zinc-200">
                    <SelectItem value="info">ℹ️ General Announcement</SelectItem>
                    <SelectItem value="alert">⚠️ Important Alert</SelectItem>
                    <SelectItem value="subscription">💳 Subscription / Billing Notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Notification Title</Label>
                <Input
                  type="text"
                  placeholder="e.g. Monthly Statement & AI Insights Ready"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.1] text-white focus:border-violet-500 h-10 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Message Content</Label>
                <Textarea
                  placeholder="Type the message that will appear in the customer's notification feed..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.1] text-white focus:border-violet-500 rounded-xl text-xs min-h-[90px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSendingNotif}
                className="w-full h-10 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Notification to Customer</span>
              </Button>
            </form>
          </div>

          {/* Dispatched History */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-sm font-semibold text-white">Dispatched Notifications History</h3>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {dispatchedNotifs.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#12131A] border border-white/[0.08] text-zinc-500 text-xs">
                  No customer notifications dispatched yet. Use the composer to broadcast announcements.
                </div>
              ) : (
                dispatchedNotifs.map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl bg-[#12131A] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                        {n.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
                        {n.type === 'subscription' && <CreditCard className="w-4 h-4 text-emerald-400" />}
                        <h4 className="text-xs font-semibold text-white">{n.title}</h4>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">{n.message}</p>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Recipient: <strong className="text-zinc-300">{n.targetUserEmail === 'all' ? 'All Customers (Broadcast)' : n.targetUserEmail}</strong></span>
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 text-[10px]">
                        Delivered
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: TENANTS DIRECTORY                                     */}
      {/* ============================================================ */}
      {activeTab === 'tenants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map(t => (
            <div key={t.id} className="p-5 rounded-2xl bg-[#12131A] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">id: {t.id}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {t.plan || 'Pro'}
                </span>
              </div>

              <p className="text-xs text-zinc-300">{t.description || 'Dedicated multi-tenant workspace'}</p>

              <div className="pt-2.5 border-t border-white/[0.06] text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Owner: <span className="text-zinc-200">{t.ownerEmail}</span></span>
                <span className="text-emerald-400 font-medium">● Isolated</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Edit Dialog */}
      <Dialog open={!!editingSubUser} onOpenChange={() => setEditingSubUser(null)}>
        <DialogContent className="bg-[#12131A] border-white/[0.1] text-white sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-white">
              Update Subscription Tier
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Modifying plan for {editingSubUser?.name || editingSubUser?.email}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Subscription Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.1] text-white rounded-xl text-xs h-10">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#12131A] border-white/[0.1] text-zinc-200">
                  <SelectItem value="Starter Free">Starter Free ($0/mo)</SelectItem>
                  <SelectItem value="Pro">Pro ($29/mo)</SelectItem>
                  <SelectItem value="Family Plan">Family Plan ($49/mo)</SelectItem>
                  <SelectItem value="Family Office">Family Office ($79/mo)</SelectItem>
                  <SelectItem value="Enterprise">Enterprise ($199/mo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Account Status</Label>
              <Select value={selectedPlanStatus} onValueChange={setSelectedPlanStatus}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.1] text-white rounded-xl text-xs h-10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#12131A] border-white/[0.1] text-zinc-200">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trialing</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingSubUser(null)}
              className="border-white/[0.1] text-zinc-300 hover:bg-white/[0.05] rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSubscription}
              className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-medium shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            >
              Save Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
