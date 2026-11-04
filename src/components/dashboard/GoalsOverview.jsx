import { Link } from "react-router-dom";
import { Target, ChevronRight, Plane, Car, Home, GraduationCap, Heart, ShoppingBag, Palmtree, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { createPageUrl } from "@/utils";

const iconMap = {
  Plane, Car, Home, GraduationCap, Heart, ShoppingBag, Palmtree, Sparkles
};

export default function GoalsOverview({ goals, isLoading }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl">
        <div className="pb-4 border-b border-white/[0.06] mb-4">
          <Skeleton className="h-5 w-36 bg-white/[0.06]" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-white/[0.06] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter(g => g.status === 'em_progresso');

  if (activeGoals.length === 0) {
    return (
      <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
          <h2 className="font-heading text-lg font-semibold text-white tracking-tight">Financial Goals</h2>
        </div>
        <div className="py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-2 text-zinc-500">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-xs text-zinc-400 mb-3">No active savings goals</p>
          <Link
            to={createPageUrl("Goals")}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
          >
            Create Goal
          </Link>
        </div>
      </div>
    );
  }

  const topGoals = activeGoals.slice(0, 3);

  return (
    <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h2 className="font-heading text-lg font-semibold text-white tracking-tight">Savings Goals</h2>
        </div>
        <Link
          to={createPageUrl("Goals")}
          className="inline-flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >
          View all
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-4">
        {topGoals.map((goal) => {
          const Icon = iconMap[goal.icon] || Sparkles;
          const percentage = Math.min(100, ((goal.current_amount || 0) / (goal.target_amount || 1)) * 100);

          return (
            <div key={goal.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-300 flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate tracking-tight">{goal.title}</p>
                    <p className="text-[11px] text-zinc-400 tabular-numbers">
                      ${Number(goal.current_amount || 0).toLocaleString()} of ${Number(goal.target_amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 tabular-numbers">
                  {percentage.toFixed(0)}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}