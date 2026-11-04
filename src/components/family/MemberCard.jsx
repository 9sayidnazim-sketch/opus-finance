import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, Clock, Shield, Edit, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

const roleConfig = {
  admin: {
    label: "Admin",
    icon: Shield,
    color: "bg-rose-500/15 text-rose-300 border-rose-500/30"
  },
  editor: {
    label: "Editor",
    icon: Edit,
    color: "bg-violet-500/15 text-violet-300 border-violet-500/30"
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    color: "bg-white/[0.06] text-zinc-300 border-white/[0.08]"
  }
};

export default function MemberCard({ member, onEdit, onDelete }) {
  const isPending = member.status === 'pending';
  const roleInfo = roleConfig[member.role] || roleConfig.editor;
  const RoleIcon = roleInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <div className={`rounded-2xl bg-[#12131A]/90 border p-5 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] ${
        isPending ? 'border-amber-500/30 bg-amber-950/10' : 'border-white/[0.08] hover:border-violet-500/30'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0 border border-white/20 shadow-md"
              style={{ backgroundColor: member.color || '#6366f1' }}
            >
              {member.avatar || member.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-white tracking-tight truncate text-base">
                {member.name}
              </h3>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                {member.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(member)}
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(member.id)}
              className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 pt-1 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
              <RoleIcon className="w-3 h-3" />
              {roleInfo.label}
            </span>
            
            {isPending ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Clock className="w-3 h-3" />
                Invitation Pending
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircle className="w-3 h-3" />
                Active Member
              </span>
            )}
          </div>

          {member.joined_date && (
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <span>Member since {format(new Date(member.joined_date), "MMM d, yyyy", { locale: enUS })}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}