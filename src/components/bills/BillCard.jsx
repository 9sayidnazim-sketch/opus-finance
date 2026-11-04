import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, Calendar, AlertCircle, Clock, Check } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays, isToday, startOfDay } from "date-fns";
import { enUS } from "date-fns/locale";

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

export default function BillCard({ bill, onEdit, onDelete, onMarkAsPaid, isOverdue, isPaid }) {
  const daysUntilDue = differenceInDays(new Date(bill.due_date), startOfDay(new Date()));
  const isDueToday = isToday(new Date(bill.due_date));
  const isDueSoon = daysUntilDue <= 2 && daysUntilDue > 0;

  const getStatusBorder = () => {
    if (isPaid) return "border-emerald-500/30 hover:border-emerald-500/50";
    if (isOverdue) return "border-rose-500/40 hover:border-rose-500/60 shadow-[0_0_25px_-8px_rgba(244,63,94,0.3)]";
    if (isDueToday) return "border-amber-500/40 hover:border-amber-500/60 shadow-[0_0_25px_-8px_rgba(245,158,11,0.3)]";
    if (isDueSoon) return "border-amber-500/30 hover:border-amber-500/50";
    return "border-white/[0.08] hover:border-violet-500/30";
  };

  const getStatusBadge = () => {
    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <CheckCircle className="w-3 h-3" />
          Paid
        </span>
      );
    }
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
          <AlertCircle className="w-3 h-3" />
          Overdue ({Math.abs(daysUntilDue)}d)
        </span>
      );
    }
    if (isDueToday) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <Clock className="w-3 h-3" />
          Due Today
        </span>
      );
    }
    if (isDueSoon) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <Clock className="w-3 h-3" />
          Due in {daysUntilDue}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
        <Clock className="w-3 h-3" />
        In {daysUntilDue} days
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <div className={`rounded-2xl bg-[#12131A]/90 border p-5 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] ${getStatusBorder()}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-lg text-white tracking-tight truncate">
              {bill.description || categoryLabels[bill.category] || bill.category}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {categoryLabels[bill.category] || bill.category}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {!isPaid && onMarkAsPaid && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMarkAsPaid(bill)}
                className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15 rounded-lg border border-emerald-500/20"
                title="Mark as paid"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(bill)}
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(bill.id)}
              className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-white tabular-numbers tracking-tight">
              ${Number(bill.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>
              Due: {bill.due_date ? format(new Date(bill.due_date), "MMM d, yyyy", { locale: enUS }) : "N/A"}
            </span>
          </div>

          {isPaid && bill.paid_date && (
            <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Paid on {format(new Date(bill.paid_date), "MMM d, yyyy", { locale: enUS })}
              </span>
            </div>
          )}

          {bill.recurring && (
            <div className="flex items-center gap-2 text-[11px] font-medium text-violet-300 bg-violet-950/30 border border-violet-500/20 px-2.5 py-1 rounded-xl">
              <span>Recurring Bill • Day {bill.recurring_day} of each month</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}