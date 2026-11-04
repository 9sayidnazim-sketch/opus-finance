const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Wallet, Calendar, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 text-xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Live Overview
              </span>
              <span className="text-xs text-zinc-400">• {format(new Date(), "MMMM yyyy", { locale: enUS })}</span>
            </div>
            <h1 className="font-heading text-[30px] sm:text-[34px] leading-tight font-bold tracking-[-0.03em] text-white">
              Financial Intelligence
            </h1>
            <p className="text-zinc-400 text-[14px]">
              Real-time wealth tracking, automated budgets, and AI insights.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/assistant"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-zinc-200 transition-colors"
            >
              Ask AI Copilot
            </a>
            <a
              href="/transactions"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 shadow-[0_0_24px_-4px_rgba(139,92,246,0.6)] text-xs font-semibold text-white transition-all hover:scale-[1.02]"
            >
              + New Transaction
            </a>
          </div>
        </div>

        <NotificationsBanner
          budgetsWithSpent={budgetsWithSpent}
          goals={goals}
          transactions={transactions}
          settings={settings}
        />

        {loadingTransactions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatsCard
              title="Net Balance"
              value={`$${stats.saldo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={Wallet}
              variant={stats.saldo >= 0 ? "violet" : "rose"}
              trend={stats.saldo >= 0 ? "+ Positive" : "- Negative"}
              subtitle="All accounts combined"
            />
            <StatsCard
              title="Monthly Income"
              value={`+$${stats.totalReceitas.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={ArrowUpCircle}
              variant="emerald"
              trend={`+${stats.transactionsCount} entries`}
              subtitle="This month"
            />
            <StatsCard
              title="Monthly Expenses"
              value={`-$${stats.totalDespesas.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={ArrowDownCircle}
              variant="rose"
              trend={`${Math.abs(stats.despesasChange)}%`}
              subtitle="vs last month"
            />
            <StatsCard
              title="Total Transactions"
              value={transactions.length.toString()}
              icon={Calendar}
              variant="cyan"
              trend="Active ledger"
              subtitle="Synced with AI"
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