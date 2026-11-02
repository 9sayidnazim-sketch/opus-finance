import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Target, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { differenceInDays, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsBanner({ 
  budgetsWithSpent, 
  goals, 
  transactions,
  settings 
}) {
  const notifications = useMemo(() => {
    const alerts = [];

    // Verificar orçamentos próximos do limite
    if (settings?.budget_alerts_enabled) {
      const threshold = settings.budget_alert_threshold || 80;
      budgetsWithSpent?.forEach(budget => {
        if (!budget?.category) return;
        
        if (budget.percentage >= threshold && !budget.isExceeded) {
          alerts.push({
            id: `budget-${budget.id}`,
            type: 'budget-warning',
            title: 'Budget nearing its limit',
            message: `You've already spent ${budget.percentage.toFixed(0)}% of the ${budget.category} budget`,
            icon: AlertTriangle,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            link: createPageUrl("Budgets")
          });
        }
        if (budget.isExceeded) {
          alerts.push({
            id: `budget-exceeded-${budget.id}`,
            type: 'budget-exceeded',
            title: 'Budget exceeded',
            message: `You exceeded the ${budget.category} budget by ${Math.abs(budget.remaining).toFixed(2)}`,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            link: createPageUrl("Budgets")
          });
        }
      });
    }

    // Verificar metas próximas do vencimento
    if (settings?.goal_deadline_alerts_enabled) {
      const deadlineDays = settings.goal_deadline_days || 7;
      goals
        ?.filter(g => g?.status === 'em_progresso' && g?.target_date && g?.title)
        .forEach(goal => {
          const daysRemaining = differenceInDays(new Date(goal.target_date), new Date());
          if (daysRemaining > 0 && daysRemaining <= deadlineDays) {
            const percentage = ((goal.current_amount || 0) / goal.target_amount) * 100;
            alerts.push({
              id: `goal-${goal.id}`,
              type: 'goal-deadline',
              title: 'Goal deadline approaching',
              message: `${daysRemaining} days left for the goal "${goal.title}" (${percentage.toFixed(0)}% complete)`,
              icon: Target,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50',
              borderColor: 'border-purple-200',
              link: createPageUrl("Goals")
            });
          }
        });
    }

    // Verificar transações grandes recentes (últimas 24h)
    if (settings?.large_transaction_alerts_enabled) {
      const threshold = settings.large_transaction_threshold || 500;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const recentLarge = transactions
        ?.filter(t => {
          if (!t?.amount || !t?.date) return false;
          const tDate = new Date(t.date);
          return t.type === 'despesa' && 
                 t.amount >= threshold && 
                 tDate >= yesterday;
        })
        .slice(0, 3) || [];

      recentLarge.forEach(transaction => {
        alerts.push({
          id: `transaction-${transaction.id}`,
          type: 'large-transaction',
          title: 'Large expense detected',
          message: `Expense of ${transaction.amount.toFixed(2)} on ${transaction.description || transaction.category || 'unspecified category'}`,
          icon: TrendingUp,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          link: createPageUrl("Transactions")
        });
      });
    }

    // Verificar contas a vencer
    if (settings?.bill_due_alerts_enabled) {
      const daysBefore = settings.bill_due_days_before || 2;
      const today = startOfDay(new Date());
      
      transactions
        ?.filter(t => 
          t?.type === 'despesa' && 
          t?.payment_status === 'a_pagar' && 
          t?.due_date &&
          t?.amount
        )
        .forEach(bill => {
          const dueDate = startOfDay(new Date(bill.due_date));
          const daysUntilDue = differenceInDays(dueDate, today);
          const billLabel = bill.description || bill.category || 'Bill';
          
          // Alerta no dia do vencimento
          if (daysUntilDue === 0 && settings.bill_due_day_alert) {
            alerts.push({
              id: `bill-due-today-${bill.id}`,
              type: 'bill-due-today',
              title: 'Bill due today',
              message: `${billLabel}: -${bill.amount.toFixed(2)}`,
              icon: AlertTriangle,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50',
              borderColor: 'border-orange-200',
              link: createPageUrl("Bills")
            });
          }
          
          // Alerta X dias antes
          if (daysUntilDue > 0 && daysUntilDue <= daysBefore) {
            alerts.push({
              id: `bill-upcoming-${bill.id}`,
              type: 'bill-upcoming',
              title: `Bill due in ${daysUntilDue} ${daysUntilDue === 1 ? 'day' : 'days'}`,
              message: `${billLabel}: -${bill.amount.toFixed(2)}`,
              icon: Calendar,
              color: 'text-yellow-600',
              bgColor: 'bg-yellow-50',
              borderColor: 'border-yellow-200',
              link: createPageUrl("Bills")
            });
          }
          
          // Alertar contas vencidas
          if (daysUntilDue < 0) {
            alerts.push({
              id: `bill-overdue-${bill.id}`,
              type: 'bill-overdue',
              title: 'Overdue bill',
              message: `${billLabel}: -${bill.amount.toFixed(2)} - Overdue by ${Math.abs(daysUntilDue)} days`,
              icon: AlertTriangle,
              color: 'text-red-600',
              bgColor: 'bg-red-50',
              borderColor: 'border-red-200',
              link: createPageUrl("Bills")
            });
          }
        });
    }

    return alerts.slice(0, 5);
  }, [budgetsWithSpent, goals, transactions, settings]);

  if (!notifications || notifications.length === 0) return null;

  return (
    <Card className="shadow-lg border-2 border-slate-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold text-slate-900">
              Notifications ({notifications.length})
            </h3>
          </div>
          <Link to={createPageUrl("Settings")}>
            <Button variant="ghost" size="sm">
              Configure
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Link to={notification.link}>
                    <div className={`p-3 rounded-lg border-2 ${notification.bgColor} ${notification.borderColor} hover:shadow-md transition-shadow cursor-pointer`}>
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 ${notification.color} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}