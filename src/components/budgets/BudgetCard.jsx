import { Button } from "@/components/ui/button";
import { Pencil, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

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

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const isExceeded = budget.isExceeded || budget.percentage > 100;
  const isWarning = budget.isWarning && !isExceeded;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <div className={`relative overflow-hidden rounded-2xl bg-[#12131A]/90 border p-5 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] ${
        isExceeded 
          ? 'border-rose-500/30 hover:border-rose-500/50' 
          : isWarning
          ? 'border-amber-500/30 hover:border-amber-500/50'
          : 'border-white/[0.08] hover:border-violet-500/30'
      }`}>
        {/* Subtle Ambient Radial Glow */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-30 ${
          isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-violet-600'
        }`} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-lg text-white tracking-tight">
                {categoryLabels[budget.category] || budget.category}
              </h3>
              <div className="mt-1">
                {isExceeded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    Limit Exceeded
                  </span>
                ) : isWarning ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    Near Limit (80%+)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3" />
                    On Track
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(budget)}
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(budget.id)}
                className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs text-zinc-400">Total Spent</span>
                <span className={`text-2xl font-bold tabular-numbers tracking-tight ${
                  isExceeded ? 'text-rose-400' : 'text-white'
                }`}>
                  ${Number(budget.spent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isExceeded
                      ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                      : isWarning
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                  }`}
                  style={{ width: `${Math.min(budget.percentage || 0, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-zinc-500">
                  {Number(budget.percentage || 0).toFixed(0)}% of limit
                </span>
                <span className="font-medium text-zinc-400 tabular-numbers">
                  Cap: ${Number(budget.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs">
              <span className="text-zinc-400">Remaining</span>
              <span className={`text-sm font-semibold tabular-numbers ${
                budget.remaining < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                ${Number(budget.remaining || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}