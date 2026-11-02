import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const categoryLabels = {
  alimentacao: "Food",
  transporte: "Transport",
  moradia: "Housing",
  contas: "Bills",
  saude: "Health",
  educacao: "Education",
  lazer: "Leisure",
  compras: "Shopping",
  outros_gastos: "Other Expenses"
};

export default function BudgetAlerts({ alerts }) {
  const exceeded = alerts.filter(a => a.isExceeded);
  const warnings = alerts.filter(a => a.isWarning && !a.isExceeded);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {exceeded.length > 0 && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  Exceeded Budgets ({exceeded.length})
                </h3>
                <div className="space-y-1">
                  {exceeded.map((alert) => (
                    <p key={alert.id} className="text-sm text-red-700">
                      <strong>{categoryLabels[alert.category]}:</strong> -{alert.spent.toFixed(2)} of {alert.amount.toFixed(2)} 
                      <span className="ml-1">({alert.percentage.toFixed(0)}%)</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {warnings.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  Budget Warnings ({warnings.length})
                </h3>
                <div className="space-y-1">
                  {warnings.map((alert) => (
                    <p key={alert.id} className="text-sm text-orange-700">
                      <strong>{categoryLabels[alert.category]}:</strong> -{alert.spent.toFixed(2)} of {alert.amount.toFixed(2)}
                      <span className="ml-1">({alert.percentage.toFixed(0)}%)</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}