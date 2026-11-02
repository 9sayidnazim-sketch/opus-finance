import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function MemberStats({ members, transactions, _budgets, goals }) {
  const memberContributions = useMemo(() => {
    return members.map(member => {
      const memberTransactions = transactions.filter(
        t => t.created_by === member.email
      );

      const income = memberTransactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = memberTransactions
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + t.amount, 0);

      const contribution = income - expense;
      const transactionCount = memberTransactions.length;

      // Contribuições para metas
      const goalContributions = goals.map(goal => {
        // Aqui você poderia ter uma lógica mais sofisticada
        // Por agora, assumimos distribuição proporcional à contribuição
        return {
          goalId: goal.id,
          goalTitle: goal.title,
          amount: 0 // Placeholder - poderia ser calculado baseado em transações específicas
        };
      });

      return {
        ...member,
        income,
        expense,
        contribution,
        transactionCount,
        goalContributions
      };
    });
  }, [members, transactions, goals]);

  const sortedByContribution = [...memberContributions].sort(
    (a, b) => b.contribution - a.contribution
  );

  const totalIncome = memberContributions.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = memberContributions.reduce((sum, m) => sum + m.expense, 0);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">
        Individual Contributions (This Month)
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedByContribution.map((member) => {
          const incomePercent = totalIncome > 0 ? (member.income / totalIncome * 100) : 0;
          const expensePercent = totalExpense > 0 ? (member.expense / totalExpense * 100) : 0;

          return (
            <Card key={member.id} className="border-l-4" style={{ borderLeftColor: member.color }}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-white"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{member.name}</CardTitle>
                    <p className="text-xs text-slate-500">
                      {member.transactionCount} transactions
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-600">Income</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {member.income.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {incomePercent.toFixed(1)}% of total
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-slate-600">Expenses</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      -{member.expense.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {expensePercent.toFixed(1)}% of total
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-slate-700">Contribution</span>
                    </div>
                    <p className={`font-bold ${member.contribution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {member.contribution >= 0 ? '+' : ''}{member.contribution.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {totalIncome.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                -{totalExpense.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Family Balance</p>
              <p className={`text-2xl font-bold ${(totalIncome - totalExpense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(totalIncome - totalExpense).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}