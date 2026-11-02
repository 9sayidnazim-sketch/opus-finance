const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Wallet, Calendar, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { enUS } from "date-fns/locale";

import StatsCard from "../components/dashboard/StatsCard";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import CategoryChart from "../components/dashboard/CategoryChart";
import MonthlyTrend from "../components/dashboard/MonthlyTrend";
import BudgetsOverview from "../components/dashboard/BudgetsOverview";
import GoalsOverview from "../components/dashboard/GoalsOverview";
import NotificationsBanner from "../components/dashboard/NotificationsBanner";

export default function Dashboard() {
  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.entities.Transaction.list("-date"),
    initialData: [],
  });

  const { data: budgets, isLoading: loadingBudgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => db.entities.Budget.list(),
    initialData: [],
  });

  const { data: goals, isLoading: loadingGoals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => db.entities.Goal.list(),
    initialData: [],
  });

  const { data: settingsList, isLoading: _loadingSettings } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => db.entities.NotificationSettings.list(),
    initialData: [],
  });

  const settings = settingsList[0];

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const thisMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= monthStart && tDate <= monthEnd;
    });

    const totalReceitas = thisMonthTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalDespesas = thisMonthTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const saldo = totalReceitas - totalDespesas;

    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    
    const lastMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= lastMonthStart && tDate <= lastMonthEnd;
    });

    const lastMonthDespesas = lastMonthTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const despesasChange = lastMonthDespesas > 0 
      ? ((totalDespesas - lastMonthDespesas) / lastMonthDespesas * 100).toFixed(1)
      : 0;

    return {
      totalReceitas,
      totalDespesas,
      saldo,
      despesasChange,
      transactionsCount: thisMonthTransactions.length
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    
    const thisMonthDespesas = transactions.filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'despesa' && tDate >= monthStart;
    });

    const categories = {};
    thisMonthDespesas.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const currentMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");
  
  const budgetsWithSpent = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const currentMonthBudgets = budgets.filter(b => b.month === currentMonth && b.active);
    
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
  }, [budgets, transactions, currentMonth]);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-[34px] leading-tight font-semibold tracking-[-0.03em] text-foreground mb-1.5">Financial Dashboard</h1>
          <p className="text-muted-foreground capitalize text-[15px]">
            {format(new Date(), "MMMM yyyy", { locale: enUS })}
          </p>
        </div>

        <NotificationsBanner
          budgetsWithSpent={budgetsWithSpent}
          goals={goals}
          transactions={transactions}
          settings={settings}
        />

        {loadingTransactions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Monthly Balance"
              value={`${stats.saldo.toFixed(2)}`}
              icon={Wallet}
              bgColor={stats.saldo >= 0 ? "bg-violet-500" : "bg-rose-500"}
              trend={stats.saldo >= 0 ? "Positive" : "Negative"}
            />
            <StatsCard
              title="Income"
              value={`+${stats.totalReceitas.toFixed(2)}`}
              icon={ArrowUpCircle}
              bgColor="bg-green-500"
              trend={`${stats.transactionsCount} transactions`}
            />
            <StatsCard
              title="Expenses"
              value={`-${stats.totalDespesas.toFixed(2)}`}
              icon={ArrowDownCircle}
              bgColor="bg-rose-500"
              trend={`${Math.abs(stats.despesasChange)}% vs last month`}
            />
            <StatsCard
              title="Transactions"
              value={transactions.length}
              icon={Calendar}
              bgColor="bg-violet-400"
              trend="All recorded"
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <MonthlyTrend transactions={transactions} isLoading={loadingTransactions} />
            <RecentTransactions transactions={transactions} isLoading={loadingTransactions} />
          </div>

          <div className="space-y-6">
            <CategoryChart data={categoryData} isLoading={loadingTransactions} />
            <BudgetsOverview 
              budgetsWithSpent={budgetsWithSpent} 
              isLoading={loadingBudgets || loadingTransactions} 
            />
            <GoalsOverview 
              goals={goals} 
              isLoading={loadingGoals} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}