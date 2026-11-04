import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, Pencil, Trash2, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

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
  outros_gastos: "General"
};

const paymentLabels = {
  dinheiro: "Cash",
  cartao_credito: "Credit Card",
  cartao_debito: "Debit Card",
  pix: "Instant Pay",
  transferencia: "Bank Wire"
};

export default function TransactionList({ transactions, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-4 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl bg-white/[0.06]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 bg-white/[0.06]" />
              <Skeleton className="h-3 w-32 bg-white/[0.06]" />
            </div>
            <Skeleton className="h-6 w-24 bg-white/[0.06]" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-12 text-center backdrop-blur-xl">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-zinc-500">
          <CreditCard className="w-6 h-6" />
        </div>
        <p className="text-base font-semibold text-white">No transactions found</p>
        <p className="text-xs text-zinc-400 mt-1">Try adjusting your filters or record a new transaction</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <AnimatePresence>
        {transactions.map((transaction) => {
          const isIncome = transaction.type === 'receita' || transaction.type === 'income';
          const catLabel = categoryLabels[transaction.category] || transaction.category || "General";
          const payLabel = paymentLabels[transaction.payment_method] || transaction.payment_method;
          const dateFormatted = transaction.date ? format(new Date(transaction.date), "MMM dd, yyyy", { locale: enUS }) : "";

          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="group rounded-2xl bg-[#12131A]/90 border border-white/[0.08] hover:border-violet-500/30 p-4 transition-all duration-200 backdrop-blur-xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border transition-transform duration-200 group-hover:scale-105 ${
                      isIncome 
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}>
                      {isIncome ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-white tracking-tight truncate text-[15px]">
                        {transaction.description || catLabel}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                          {catLabel}
                        </span>
                        {payLabel && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20">
                            {payLabel}
                          </span>
                        )}
                        <span className="text-zinc-600 text-xs">•</span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          {dateFormatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className={`text-base sm:text-lg font-bold tabular-numbers tracking-tight ${
                        isIncome ? 'text-emerald-400' : 'text-zinc-100'
                      }`}>
                        {isIncome ? "+" : "-"}${Number(transaction.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                        {isIncome ? 'Income' : 'Expense'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(transaction)}
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(transaction.id)}
                        className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}