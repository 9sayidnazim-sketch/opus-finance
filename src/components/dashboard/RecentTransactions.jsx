import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft, ChevronRight, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const categoryLabels = {
  salario: "Salary",
  freelance: "Freelance",
  investimentos: "Investments",
  outras_receitas: "Other Income",
  alimentacao: "Food & Dining",
  transporte: "Transportation",
  moradia: "Housing",
  contas: "Bills & Utilities",
  saude: "Healthcare",
  educacao: "Education",
  lazer: "Entertainment",
  compras: "Shopping",
  outros_gastos: "General Expenses"
};

export default function RecentTransactions({ transactions, isLoading }) {
  const recentTransactions = transactions.slice(0, 7);

  return (
    <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-heading text-lg font-semibold text-white tracking-tight">Recent Transactions</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-medium">
            {transactions.length}
          </span>
        </div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >
          View all
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-1">
        {isLoading ? (
          <div className="py-2 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl bg-white/[0.06]" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36 bg-white/[0.06]" />
                    <Skeleton className="h-3 w-20 bg-white/[0.06]" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20 bg-white/[0.06]" />
              </div>
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-zinc-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <p className="text-sm text-zinc-400 font-medium">No transactions recorded yet</p>
            <p className="text-xs text-zinc-600 mt-1">Start by telling your AI Copilot or adding manually</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === "receita" || tx.type === "income";
              const dateStr = tx.date ? format(new Date(tx.date), "MMM dd, yyyy", { locale: enUS }) : "Recent";
              const catLabel = categoryLabels[tx.category] || tx.category || "General";

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-white/[0.03] transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-transform duration-200 group-hover:scale-105 ${
                      isIncome
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}>
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-white truncate tracking-tight">
                        {tx.description || catLabel}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11.5px] text-zinc-400 font-medium">
                          {catLabel}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[11px] text-zinc-500">
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right pl-3 flex-shrink-0">
                    <div className={`text-[14.5px] font-semibold tabular-numbers tracking-tight ${
                      isIncome ? 'text-emerald-400' : 'text-zinc-100'
                    }`}>
                      {isIncome ? "+" : "-"}${Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {tx.payment_method && (
                      <span className="text-[10.5px] text-zinc-500 uppercase tracking-wider block">
                        {tx.payment_method.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}