import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, Plane, Car, Home, GraduationCap, Heart, ShoppingBag, Palmtree, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { differenceInDays } from "date-fns";

const iconMap = {
  Plane, Car, Home, GraduationCap, Heart, ShoppingBag, Palmtree, Sparkles
};

export default function GoalCard({ goal, onEdit, onDelete, onClick }) {
  const percentage = Math.min(100, ((goal.current_amount || 0) / (goal.target_amount || 1)) * 100);
  const Icon = iconMap[goal.icon] || Sparkles;
  const isCompleted = goal.status === 'concluida';
  
  const daysRemaining = goal.target_date 
    ? differenceInDays(new Date(goal.target_date), new Date())
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <div 
        className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] hover:border-violet-500/30 p-5 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] cursor-pointer group relative overflow-hidden"
        onClick={onClick}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300 transition-transform duration-200 group-hover:scale-105 shadow-[0_0_15px_-4px_rgba(139,92,246,0.3)]">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-base text-white tracking-tight">
                  {goal.title}
                </h3>
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mt-1">
                    <CheckCircle className="w-3 h-3" />
                    Achieved
                  </span>
                ) : daysRemaining !== null && daysRemaining >= 0 ? (
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    {daysRemaining} days remaining
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(goal)}
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(goal.id)}
                className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs text-zinc-400">Saved Balance</span>
                <span className="text-xl font-bold text-white tabular-numbers">
                  ${Number(goal.current_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-emerald-400 font-semibold tabular-numbers">
                  {percentage.toFixed(0)}% achieved
                </span>
                <span className="text-zinc-400 tabular-numbers">
                  Target: ${Number(goal.target_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs">
              <span className="text-zinc-400">Remaining</span>
              <span className="font-semibold text-zinc-200 tabular-numbers">
                ${Math.max(0, goal.target_amount - (goal.current_amount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}