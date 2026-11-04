import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import TenantSwitcher from "@/components/tenant/TenantSwitcher";

import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  PiggyBank,
  Target,
  Users,
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  CreditCard
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const baseNavigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard, badge: null },
  { title: "Transactions", url: createPageUrl("Transactions"), icon: ArrowLeftRight, badge: null },
  { title: "Bills", url: createPageUrl("Bills"), icon: Receipt, badge: null },
  { title: "Budgets", url: createPageUrl("Budgets"), icon: PiggyBank, badge: null },
  { title: "Goals", url: createPageUrl("Goals"), icon: Target, badge: null },
  { title: "Family", url: createPageUrl("Family"), icon: Users, badge: null },
  { title: "AI Assistant", url: createPageUrl("Assistant"), icon: Sparkles, badge: "AI" },
  { title: "Settings", url: createPageUrl("Settings"), icon: SettingsIcon, badge: null },
];

export default function Layout({ children, _currentPageName }) {
  const location = useLocation();
  const { user, activeTenant, isAdmin, logout, notifications, unreadCount, markNotificationAsRead } = useAuth();

  const navigationItems = [
    ...baseNavigationItems,
    ...(isAdmin ? [{ 
      title: "Admin Portal", 
      url: "/admin", 
      icon: ShieldCheck, 
      badge: "ADMIN",
      isAdminRoute: true 
    }] : [])
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0B0C10] text-[#F8FAFC]">
        <Sidebar className="border-r border-white/[0.07] bg-[#090A0E]/95 backdrop-blur-2xl">
          <SidebarHeader className="p-4 pb-3 space-y-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-600 to-violet-800 flex items-center justify-center shadow-[0_0_24px_-4px_rgba(139,92,246,0.6)] border border-white/20 transition-transform duration-300 group-hover:scale-105">
                  <span className="font-display text-white text-base font-bold tracking-tight">O</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090A0E] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-heading text-[17px] font-bold tracking-[-0.03em] text-white">OPUS</h2>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/25 uppercase tracking-wider">
                    Finance
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium tracking-tight mt-0.5">by octtapus</p>
              </div>
            </Link>

            {/* Multi-Tenant Switcher */}
            <TenantSwitcher />
          </SidebarHeader>

          <SidebarContent className="px-3 pt-1">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => {
                    const active = location.pathname.toLowerCase() === item.url.toLowerCase();
                    const isAdminItem = item.isAdminRoute;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`group h-10 rounded-xl px-3 transition-all duration-200 border ${
                            active
                              ? isAdminItem
                                ? 'bg-amber-500/15 text-white font-medium border-amber-500/30 shadow-[0_0_20px_-8px_rgba(245,158,11,0.4)]'
                                : 'bg-violet-500/12 text-white font-medium border-violet-500/25 shadow-[0_0_20px_-8px_rgba(139,92,246,0.4)]'
                              : isAdminItem
                              ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 border-transparent font-medium'
                              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border-transparent'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <item.icon className={`w-[18px] h-[18px] transition-colors ${
                                active 
                                  ? isAdminItem ? 'text-amber-400' : 'text-violet-400' 
                                  : isAdminItem ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'
                              }`} />
                              <span className="text-[13.5px] tracking-tight">{item.title}</span>
                            </div>
                            {item.badge ? (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                isAdminItem
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                              }`}>
                                {item.badge}
                              </span>
                            ) : active ? (
                              <ChevronRight className="w-3.5 h-3.5 text-violet-400 opacity-60" />
                            ) : null}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center text-violet-300 font-semibold text-xs">
                  {user?.avatar || (user?.name ? user.name[0].toUpperCase() : 'U')}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#090A0E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-[13px] truncate tracking-tight">
                  {user?.name || user?.username || 'Customer'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400 truncate">
                    {user?.role === 'admin' ? '👑 Administrator' : activeTenant?.plan || 'Pro Plan'}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 relative">
          {/* Subtle Ambient Glow Aura at Top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.12),rgba(255,255,255,0))] pointer-events-none" />

          {/* Top Bar for Desktop and Mobile (with Notification Bell) */}
          <header className="sticky top-0 z-20 bg-[#090A0E]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-white/[0.06] text-white p-2 rounded-xl transition-colors md:hidden" />
              <div className="flex items-center gap-2 md:hidden">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                  O
                </div>
                <div className="leading-none">
                  <h1 className="font-heading text-[15px] font-bold tracking-tight text-white">OPUS</h1>
                  <p className="text-[10px] text-zinc-400">Finance</p>
                </div>
              </div>

              {/* Desktop Workspace Breadcrumb / Indicator */}
              <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-zinc-500">Workspace:</span>
                <span className="text-white font-medium">{activeTenant?.name || "Personal"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                  {activeTenant?.plan || "Pro"}
                </span>
              </div>
            </div>

            {/* Right Header: Notifications Bell & Admin shortcut */}
            <div className="flex items-center gap-2">
              {!isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-medium transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
              )}

              {/* Customer Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-white font-bold text-[9px] flex items-center justify-center shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-80 bg-[#12131A] border-white/[0.1] text-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 rounded-2xl z-50 max-h-[420px] overflow-y-auto"
                >
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel className="p-0 text-xs font-semibold text-white">
                      Notifications & Announcements
                    </DropdownMenuLabel>
                    <span className="text-[10px] text-zinc-400">
                      {notifications.length} message{notifications.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <DropdownMenuSeparator className="bg-white/[0.08] my-1" />

                  <div className="space-y-1.5">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-zinc-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-2.5 rounded-xl flex flex-col items-start gap-1 cursor-pointer transition-all ${
                            n.read 
                              ? 'bg-white/[0.02] text-zinc-400' 
                              : 'bg-violet-500/10 border border-violet-500/20 text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1.5 font-semibold text-xs">
                              {n.type === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                              {n.type === 'subscription' && <CreditCard className="w-3.5 h-3.5 text-emerald-400" />}
                              {n.type === 'info' && <Info className="w-3.5 h-3.5 text-cyan-400" />}
                              <span>{n.title}</span>
                            </div>
                            <span className="text-[9px] text-zinc-500">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">
                            {n.message}
                          </p>
                          {!n.read && (
                            <div className="flex items-center gap-1 text-[10px] text-violet-400 font-medium mt-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Click to mark as read</span>
                            </div>
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 overflow-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}