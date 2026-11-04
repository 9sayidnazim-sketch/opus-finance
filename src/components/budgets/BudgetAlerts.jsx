import { AlertTriangle, AlertCircle } from "lucide-react";
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

export default function BudgetAlerts({ alerts }) {
  const exceeded = alerts.filter(a => a.isExceeded);
  const warnings = alerts.filter(a => a.isWarning && !a.isExceeded);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 space-y-3"
    >
      {exceeded.length > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 backdrop-blur-xl shadow-[0_0_20px_-5px_rgba(244,63,94,0.2)]">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-rose-300 text-sm mb-1 tracking-tight">
                Exceeded Budgets ({exceeded.length})
              </h3>
              <div className="space-y-1">
                {exceeded.map((alert) => (
                  <p key={alert.id} className="text-xs text-zinc-300">
                    <strong className="text-white">{categoryLabels[alert.category] || alert.category}:</strong> ${alert.spent.toFixed(2)} spent of ${alert.amount.toFixed(2)} cap
                    <span className="ml-1 text-rose-400 font-semibold">({alert.percentage.toFixed(0)}%)</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 backdrop-blur-xl shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-300 text-sm mb-1 tracking-tight">
                Budget Warnings ({warnings.length})
              </h3>
              <div className="space-y-1">
                {warnings.map((alert) => (
                  <p key={alert.id} className="text-xs text-zinc-300">
                    <strong className="text-white">{categoryLabels[alert.category] || alert.category}:</strong> ${alert.spent.toFixed(2)} spent of ${alert.amount.toFixed(2)} limit
                    <span className="ml-1 text-amber-400 font-semibold">({alert.percentage.toFixed(0)}%)</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}