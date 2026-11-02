const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useMemo } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { startOfMonth, format } from "date-fns";
import { enUS } from "date-fns/locale";

import BudgetForm from "../components/budgets/BudgetForm";
import BudgetCard from "../components/budgets/BudgetCard";
import BudgetAlerts from "../components/budgets/BudgetAlerts";

export default function BudgetsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  const queryClient = useQueryClient();
  const currentMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const { data: budgets, isLoading: loadingBudgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => db.entities.Budget.list("-created_date"),
    initialData: [],
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.entities.Transaction.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Budget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setShowForm(false);
      setEditingBudget(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Budget.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setShowForm(false);
      setEditingBudget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Budget.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const handleSubmit = (data) => {
    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteMutation.mutate(id);
    }
  };

  const currentMonthBudgets = useMemo(() => {
    return budgets.filter(b => b.month === currentMonth && b.active);
  }, [budgets, currentMonth]);

  const budgetsWithSpent = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    
    return currentMonthBudgets.map(budget => {
      const spent = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'despesa' && 
                 t.category === budget.category && 
                 tDate >= monthStart;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.amount) * 100;
      const isWarning = percentage >= budget.alert_threshold;
      const isExceeded = percentage > 100;

      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage,
        isWarning,
        isExceeded
      };
    });
  }, [currentMonthBudgets, transactions]);

  const alerts = budgetsWithSpent.filter(b => b.isWarning || b.isExceeded);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-[32px] leading-tight font-semibold tracking-[-0.03em] text-foreground">Budgets</h1>
            <p className="text-slate-500 mt-1">
              Set monthly limits by category - {format(new Date(), "MMMM yyyy", { locale: enUS })}
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingBudget(null);
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Budget
          </Button>
        </div>

        {alerts.length > 0 && (
          <BudgetAlerts alerts={alerts} />
        )}

        <AnimatePresence>
          {showForm && (
            <BudgetForm
              budget={editingBudget}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingBudget(null);
              }}
              currentMonth={currentMonth}
            />
          )}
        </AnimatePresence>

        {loadingBudgets || loadingTransactions ? (
          <div className="text-center py-12 text-slate-500">
            Loading budgets...
          </div>
        ) : budgetsWithSpent.length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              You haven't set any budgets for this month yet
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Budget
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetsWithSpent.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}