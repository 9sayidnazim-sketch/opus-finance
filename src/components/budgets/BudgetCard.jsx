import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
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

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const getStatusColor = () => {
    if (budget.isExceeded) return "text-red-600";
    if (budget.isWarning) return "text-orange-600";
    return "text-green-600";
  };

  const getProgressColor = () => {
    if (budget.isExceeded) return "bg-red-500";
    if (budget.isWarning) return "bg-orange-500";
    return "bg-blue-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="hover:shadow-lg transition-shadow relative overflow-hidden">
        {budget.isExceeded && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-5 rounded-full transform translate-x-16 -translate-y-16" />
        )}
        {budget.isWarning && !budget.isExceeded && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-5 rounded-full transform translate-x-16 -translate-y-16" />
        )}
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900">
                {categoryLabels[budget.category]}
              </h3>
              {budget.isExceeded ? (
                <Badge className="mt-1 bg-red-100 text-red-700 border-red-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Limit Exceeded
                </Badge>
              ) : budget.isWarning ? (
                <Badge className="mt-1 bg-orange-100 text-orange-700 border-orange-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Warning
                </Badge>
              ) : (
                <Badge className="mt-1 bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  On Track
                </Badge>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(budget)}
              >
                <Pencil className="w-4 h-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(budget.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-slate-500">Spent</span>
                <span className={`text-2xl font-bold ${getStatusColor()}`}>
                  -{budget.spent.toFixed(2)}
                </span>
              </div>
              <Progress 
                value={Math.min(budget.percentage, 100)} 
                className="h-3"
                indicatorClassName={getProgressColor()}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-500">
                  {budget.percentage.toFixed(1)}% of budget
                </span>
                <span className="text-xs font-medium text-slate-700">
                  Limit: {budget.amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between items-center">
              <span className="text-sm text-slate-500">Remaining</span>
              <span className={`text-lg font-semibold ${
                budget.remaining < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {budget.remaining.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}