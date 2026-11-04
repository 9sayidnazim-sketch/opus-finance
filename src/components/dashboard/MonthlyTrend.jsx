import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const income = payload.find(p => p.dataKey === 'receitas')?.value || 0;
    const expense = payload.find(p => p.dataKey === 'despesas')?.value || 0;
    const net = income - expense;

    return (
      <div className="rounded-xl bg-[#181A24]/95 border border-white/[0.12] p-3 shadow-2xl backdrop-blur-xl space-y-1.5 min-w-[150px]">
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">{label}</p>
        <div className="space-y-1 pt-1 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium">Income:</span>
            <span className="text-white font-semibold tabular-numbers">${income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-rose-400 font-medium">Expenses:</span>
            <span className="text-white font-semibold tabular-numbers">${expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]">
            <span className="text-zinc-300 font-medium">Net:</span>
            <span className={`font-bold tabular-numbers ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {net >= 0 ? '+' : ''}${net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function MonthlyTrend({ transactions, isLoading }) {
  const chartData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const receitas = monthTransactions
        .filter(t => t.type === 'receita' || t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const despesas = monthTransactions
        .filter(t => t.type === 'despesa' || t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        month: format(month, 'MMM', { locale: enUS }),
        receitas,
        despesas,
        saldo: receitas - despesas
      };
    });
  }, [transactions]);

  return (
    <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="font-heading text-lg font-semibold text-white tracking-tight">Cashflow & Monthly Trend</h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-zinc-300">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
            <span className="text-zinc-300">Expenses</span>
          </div>
        </div>
      </div>

      <div>
        {isLoading ? (
          <Skeleton className="w-full h-72 bg-white/[0.06] rounded-xl" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="receitas"
                  name="Income"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="despesas"
                  name="Expenses"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}