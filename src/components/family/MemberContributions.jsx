import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Target, Wallet } from "lucide-react";
import { startOfMonth } from "date-fns";

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

export default function MemberContributions({ member, transactions, goals, budgets }) {
  const contributions = useMemo(() => {
    const memberTransactions = transactions.filter(t => t.created_by === member.user_email);
    const monthStart = startOfMonth(new Date());
    const thisMonth = memberTransactions.filter(t => new Date(t.date) >= monthStart);

    // Contribuições em metas
    const memberGoals = goals.filter(g => g.created_by === member.user_email);
    const totalGoalContribution = memberGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);

    // Contribuições em orçamentos (gastos por categoria)
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
    const activeBudgets = budgets.filter(b => b.month === currentMonth && b.active);
    
    const budgetContributions = activeBudgets.map(budget => {
      const memberSpent = thisMonth
        .filter(t => t.type === 'despesa' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalSpent = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'despesa' && 
                 t.category === budget.category && 
                 tDate >= monthStart;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        category: budget.category,
        memberSpent,
        totalSpent,
        budgetAmount: budget.amount,
        percentage: totalSpent > 0 ? (memberSpent / totalSpent * 100).toFixed(1) : 0
      };
    });

    return {
      totalTransactions: memberTransactions.length,
      monthTransactions: thisMonth.length,
      totalSpent: thisMonth.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0),
      totalIncome: thisMonth.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0),
      goalsCount: memberGoals.length,
      totalGoalContribution,
      budgetContributions: budgetContributions.filter(b => b.memberSpent > 0)
    };
  }, [member, transactions, goals, budgets]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            {member.name}'s Contributions - {new Date().toLocaleDateString('en-US', { month: 'long' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Transactions This Month</p>
              <p className="text-2xl font-bold text-slate-900">
                {contributions.monthTransactions}
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">
                -{contributions.totalSpent.toFixed(2)}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-700">
                {contributions.totalIncome.toFixed(2)}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Balance</p>
              <p className={`text-2xl font-bold ${
                contributions.totalIncome - contributions.totalSpent >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {(contributions.totalIncome - contributions.totalSpent).toFixed(2)}
              </p>
            </div>
          </div>

          {contributions.budgetContributions.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Budget Contribution
              </h3>
              <div className="space-y-3">
                {contributions.budgetContributions.map((contrib, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">
                        {categoryLabels[contrib.category]}
                      </span>
                      <Badge variant="outline">{contrib.percentage}% of total</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">
                        -{contrib.memberSpent.toFixed(2)} of {contrib.totalSpent.toFixed(2)}
                      </span>
                      <span className="text-slate-500">
                        Budget: {contrib.budgetAmount.toFixed(2)}
                      </span>
                    </div>
                    <Progress 
                      value={(contrib.memberSpent / contrib.totalSpent) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {contributions.totalGoalContribution > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Goal Contribution
              </h3>
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600">Total Saved in Goals</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">
                      {contributions.totalGoalContribution.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-600">Active Goals</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">
                      {contributions.goalsCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}