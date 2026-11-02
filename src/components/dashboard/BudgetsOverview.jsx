import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingDown, AlertTriangle, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

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

export default function BudgetsOverview({ budgetsWithSpent, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Monthly Budgets</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budgetsWithSpent.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Monthly Budgets</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <TrendingDown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No budgets set</p>
          <Link to={createPageUrl("Budgets")}>
            <Button variant="outline" size="sm">
              Create Budgets
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const topBudgets = budgetsWithSpent
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Budgets</CardTitle>
          <Link to={createPageUrl("Budgets")}>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {topBudgets.map((budget) => (
            <div key={budget.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">
                    {categoryLabels[budget.category]}
                  </span>
                  {(budget.isExceeded || budget.isWarning) && (
                    <AlertTriangle className={`w-3 h-3 ${
                      budget.isExceeded ? 'text-red-500' : 'text-orange-500'
                    }`} />
                  )}
                </div>
                <span className={`text-sm font-semibold ${
                  budget.isExceeded ? 'text-red-600' : 
                  budget.isWarning ? 'text-orange-600' : 
                  'text-slate-600'
                }`}>
                  {budget.percentage.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={Math.min(budget.percentage, 100)} 
                className="h-2"
                indicatorClassName={
                  budget.isExceeded ? 'bg-red-500' : 
                  budget.isWarning ? 'bg-orange-500' : 
                  'bg-blue-500'
                }
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>-{budget.spent.toFixed(2)}</span>
                <span>of {budget.amount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}