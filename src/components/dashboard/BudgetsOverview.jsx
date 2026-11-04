import { Link } from "react-router-dom";
import { PiggyBank, AlertTriangle, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { createPageUrl } from "@/utils";

const categoryLabels = {
  alimentacao: "Food & Dining",
  transporte: "Transportation",
  moradia: "Housing",
  contas: "Bills & Utilities",
  saude: "Healthcare",
  educacao: "Education",
  lazer: "Entertainment",
  compras: "Shopping",
  outros_gastos: "General"
};

export default function BudgetsOverview({ budgetsWithSpent, isLoading }) {
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

  if (budgetsWithSpent.length === 0) {
    return (
      <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
          <h2 className="font-heading text-lg font-semibold text-white tracking-tight">Active Budgets</h2>
        </div>
        <div className="py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-2 text-zinc-500">
            <PiggyBank className="w-5 h-5" />
          </div>
          <p className="text-xs text-zinc-400 mb-3">No budgets configured for this month</p>
          <Link
            to={createPageUrl("Budgets")}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
          >
            Create Budget
          </Link>
        </div>
      </div>
    );
  }

  const topBudgets = budgetsWithSpent
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4);

  return (
    <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-violet-400" />
          <h2 className="font-heading text-lg font-semibold text-white tracking-tight">Active Budgets</h2>
        </div>
        <Link
          to={createPageUrl("Budgets")}
          className="inline-flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >
          Manage
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-4">
        {topBudgets.map((b) => {
          const cat = categoryLabels[b.category] || b.category;
          const isOver = b.percentage > 100;
          const isWarn = b.isWarning && !isOver;

          return (
            <div key={b.id || b.category} className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-white">{cat}</span>
                  {isOver && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Exceeded
                    </span>
                  )}
                  {isWarn && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Near limit
                    </span>
                  )}
                </div>
                <div className="text-zinc-400 tabular-numbers">
                  <span className="font-semibold text-white">${Number(b.spent || 0).toFixed(0)}</span>
                  <span className="text-zinc-500"> / ${Number(b.amount || 0).toFixed(0)}</span>
                </div>
              </div>

              <div className="relative w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver
                      ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                      : isWarn
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-violet-500 to-indigo-500'
                  }`}
                  style={{ width: `${Math.min(b.percentage, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>{b.percentage.toFixed(0)}% used</span>
                <span>${Math.max(0, b.remaining || 0).toFixed(0)} remaining</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}