import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, CheckCircle, Calendar, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays, isToday, startOfDay } from "date-fns";
import { enUS } from "date-fns/locale";

const categoryLabels = {
  alimentacao: "Food",
  transporte: "Transport",
  moradia: "Housing",
  contas: "Bills",
  saude: "Health",
  educacao: "Education",
  lazer: "Leisure",
  compras: "Shopping",
  outros_gastos: "Other"
};

export default function BillCard({ bill, onEdit, onDelete, onMarkAsPaid, isOverdue, isPaid }) {
  const daysUntilDue = differenceInDays(new Date(bill.due_date), startOfDay(new Date()));
  const isDueToday = isToday(new Date(bill.due_date));
  const isDueSoon = daysUntilDue <= 2 && daysUntilDue > 0;

  const getStatusColor = () => {
    if (isPaid) return "border-green-500 bg-green-50";
    if (isOverdue) return "border-red-500 bg-red-50";
    if (isDueToday) return "border-orange-500 bg-orange-50";
    if (isDueSoon) return "border-yellow-500 bg-yellow-50";
    return "border-blue-200 bg-white";
  };

  const getStatusBadge = () => {
    if (isPaid) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paid
        </Badge>
      );
    }
    if (isOverdue) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue ({Math.abs(daysUntilDue)} days)
        </Badge>
      );
    }
    if (isDueToday) {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
          <Clock className="w-3 h-3 mr-1" />
          Due Today
        </Badge>
      );
    }
    if (isDueSoon) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Due in {daysUntilDue} days
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
        <Clock className="w-3 h-3 mr-1" />
        {daysUntilDue} days
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={`hover:shadow-lg transition-all border-2 ${getStatusColor()}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-slate-900 truncate">
                {bill.description || categoryLabels[bill.category]}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {categoryLabels[bill.category]}
              </p>
            </div>
            <div className="flex gap-1 ml-2">
              {!isPaid && onMarkAsPaid && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMarkAsPaid(bill)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(bill)}
              >
                <Pencil className="w-4 h-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(bill.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-900">
                -{bill.amount.toFixed(2)}
              </span>
              {getStatusBadge()}
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>
                Due: {format(new Date(bill.due_date), "MMM d", { locale: enUS })}
              </span>
            </div>

            {isPaid && bill.paid_date && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span>
                  Paid on: {format(new Date(bill.paid_date), "MMM d", { locale: enUS })}
                </span>
              </div>
            )}

            {bill.recurring && (
              <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">
                <span>🔄 Recurring Expense - Day {bill.recurring_day}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}