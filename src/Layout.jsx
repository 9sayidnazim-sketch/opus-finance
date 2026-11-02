const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { LayoutDashboard, List, MessageCircle, TrendingDown, Target, Settings, Receipt, Users, LogOut } from "lucide-react";
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

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Transactions", url: createPageUrl("Transactions"), icon: List },
  { title: "Bills", url: createPageUrl("Bills"), icon: Receipt },
  { title: "Budgets", url: createPageUrl("Budgets"), icon: TrendingDown },
  { title: "Goals", url: createPageUrl("Goals"), icon: Target },
  { title: "Family", url: createPageUrl("Family"), icon: Users },
  { title: "Assistant", url: createPageUrl("Assistant"), icon: MessageCircle },
  { title: "Notifications", url: createPageUrl("Settings"), icon: Settings },
];

export default function Layout({ children, _currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border/80 bg-white/70 backdrop-blur-2xl">
          <SidebarHeader className="p-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-violet-500 to-violet-700 flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(124,58,237,0.7)]">
                <span className="font-display text-white text-lg font-semibold tracking-tight">O</span>
              </div>
              <div className="leading-none">
                <h2 className="font-heading text-[17px] font-semibold tracking-[-0.02em] text-foreground">OPUS</h2>
                <p className="text-[11px] text-muted-foreground mt-1 tracking-tight">by octtapus</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const active = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`group h-10 rounded-xl mb-0.5 transition-all duration-200 ${
                            active
                              ? 'bg-accent text-accent-foreground font-medium'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3">
                            <item.icon className={`w-[18px] h-[18px] transition-colors ${active ? 'text-primary' : ''}`} />
                            <span className="text-[13.5px] tracking-tight">{item.title}</span>
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
            <div className="flex items-center gap-3 rounded-2xl bg-secondary/70 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-violet-400 to-violet-600 flex items-center justify-center">
                <span className="text-white font-medium text-xs">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-[13px] truncate tracking-tight">User</p>
                <p className="text-[11px] text-muted-foreground truncate">Your finances</p>
              </div>
              <button
                onClick={() => db.auth.logout()}
                className="p-2 rounded-full hover:bg-white/80 transition-colors duration-200"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-border/70 px-4 py-3 md:hidden">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-secondary p-2 rounded-xl transition-colors duration-200" />
              <div className="leading-none">
                <h1 className="font-heading text-[15px] font-semibold tracking-[-0.02em]">OPUS</h1>
                <p className="text-[10px] text-muted-foreground mt-1">by octtapus</p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}