import { useMemo } from 'react';
import { AlertTriangle, Target, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { differenceInDays, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsBanner({ 
  budgetsWithSpent, 
  goals, 
  _transactions,
  settings 
}) {
  const notifications = useMemo(() => {
    const alerts = [];

    // Budget warnings
    if (settings?.budget_alerts_enabled) {
      const threshold = settings.budget_alert_threshold || 80;
      budgetsWithSpent?.forEach(budget => {
        if (!budget?.category) return;
        
        if (budget.percentage >= threshold && !budget.isExceeded) {
          alerts.push({
            id: `budget-${budget.id}`,
            type: 'budget-warning',
            title: 'Budget nearing limit',
            message: `You've spent ${budget.percentage.toFixed(0)}% of your ${budget.category} budget`,
            icon: AlertTriangle,
            color: 'text-amber-300',
            bgColor: 'bg-amber-950/30',
            borderColor: 'border-amber-500/25',
            link: createPageUrl("Budgets")
          });
        }
        if (budget.isExceeded) {
          alerts.push({
            id: `budget-exceeded-${budget.id}`,
            type: 'budget-exceeded',
            title: 'Budget limit exceeded',
            message: `Over the ${budget.category} budget by $${Math.abs(budget.remaining || 0).toFixed(2)}`,
            icon: AlertTriangle,
            color: 'text-rose-300',
            bgColor: 'bg-rose-950/30',
            borderColor: 'border-rose-500/25',
            link: createPageUrl("Budgets")
          });
        }
      });
    }

    // Goals deadlines
    if (settings?.goal_deadline_alerts_enabled) {
      const deadlineDays = settings.goal_deadline_days || 7;
      goals
        ?.filter(g => g?.status === 'em_progresso' && g?.target_date && g?.title)
        .forEach(goal => {
          const daysRemaining = differenceInDays(new Date(goal.target_date), startOfDay(new Date()));
          if (daysRemaining >= 0 && daysRemaining <= deadlineDays) {
            alerts.push({
              id: `goal-${goal.id}`,
              type: 'goal-deadline',
              title: 'Goal deadline approaching',
              message: `Goal "${goal.title}" deadline in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
              icon: Target,
              color: 'text-violet-300',
              bgColor: 'bg-violet-950/30',
              borderColor: 'border-violet-500/25',
              link: createPageUrl("Goals")
            });
          }
        });
    }

    return alerts.slice(0, 3);
  }, [budgetsWithSpent, goals, settings]);

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-2.5 mb-8">
      <AnimatePresence>
        {notifications.map((alert) => {
          const Icon = alert.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Link to={alert.link}>
                <div className={`p-4 rounded-xl border backdrop-blur-md flex items-center justify-between hover:scale-[1.005] transition-all duration-200 ${alert.bgColor} ${alert.borderColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-black/20 ${alert.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${alert.color}`}>
                        {alert.title}
                      </p>
                      <p className="text-xs text-zinc-300 mt-0.5">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${alert.color} opacity-70`} />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}