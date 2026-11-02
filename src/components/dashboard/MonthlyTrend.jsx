import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';

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
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + t.amount, 0);

      const despesas = monthTransactions
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'MMM', { locale: enUS }),
        receitas,
        despesas,
        saldo: receitas - despesas
      };
    });
  }, [transactions]);

  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="border-b">
        <CardTitle>Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <Skeleton className="w-full h-64" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toFixed(2)}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receitas" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}