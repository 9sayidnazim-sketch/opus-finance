import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { 
  Building2, 
  Check, 
  ChevronsUpDown, 
  Plus, 
  Layers
} from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function TenantSwitcher({ className = "" }) {
  const { activeTenant, tenants, switchTenant, createTenant, isAdmin } = useAuth();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectTenant = (tenantId) => {
    if (tenantId === activeTenant?.id) return;
    switchTenant(tenantId);
    toast({
      title: "Workspace Switched",
      description: `Active tenant updated.`,
    });
  };

  const handleCreateTenant = (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    setIsSubmitting(true);
    try {
      const created = createTenant(newWorkspaceName, newWorkspaceDesc);
      if (created) {
        setIsCreateOpen(false);
        setNewWorkspaceName('');
        setNewWorkspaceDesc('');
        toast({
          title: "Workspace Created",
          description: `Created and switched to "${created.name}".`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] transition-all text-left group ${className}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/25 to-indigo-600/30 border border-violet-500/35 flex items-center justify-center text-violet-300 shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate tracking-tight">
                    {activeTenant?.name || "Personal Workspace"}
                  </span>
                  <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase shrink-0">
                    {activeTenant?.plan || "Pro"}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate">
                  {isAdmin ? "Admin Tenant Mode" : "Multi-Tenant Workspace"}
                </p>
              </div>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="start" 
          className="w-64 bg-[#12131A] border-white/[0.1] text-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.7)] p-1.5 rounded-xl z-50"
        >
          <DropdownMenuLabel className="text-[11px] font-medium text-zinc-400 px-2 py-1">
            Available Workspaces
          </DropdownMenuLabel>

          <div className="space-y-0.5 my-1">
            {tenants.map((t) => {
              const isCurrent = t.id === activeTenant?.id;
              return (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => handleSelectTenant(t.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    isCurrent 
                      ? 'bg-violet-500/15 text-white font-medium border border-violet-500/25' 
                      : 'hover:bg-white/[0.05] text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Layers className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{t.plan || "Pro"}</p>
                    </div>
                  </div>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator className="bg-white/[0.08]" />

          <DropdownMenuItem
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 p-2 rounded-lg text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 cursor-pointer font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create New Workspace Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#12131A] border-white/[0.1] text-white sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-white">Create New Workspace</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Each workspace maintains its own isolated transactions, budgets, bills, and family members.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTenant} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Workspace Name</Label>
              <Input
                type="text"
                placeholder="e.g. Commercial Real Estate or Acme Corp"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="bg-white/[0.03] border-white/[0.1] text-white focus:border-violet-500 h-10 rounded-xl text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Description (Optional)</Label>
              <Input
                type="text"
                placeholder="e.g. Business expenses and vendor accounts"
                value={newWorkspaceDesc}
                onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                className="bg-white/[0.03] border-white/[0.1] text-white focus:border-violet-500 h-10 rounded-xl text-sm"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-white/[0.1] text-zinc-300 hover:bg-white/[0.05] rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !newWorkspaceName.trim()}
                className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-medium shadow-[0_0_15px_rgba(139,92,246,0.4)]"
              >
                Create Workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
