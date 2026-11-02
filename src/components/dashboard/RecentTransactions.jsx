import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const categoryLabels = {
  salario: "Salary",
  freelance: "Freelance",
  investimentos: "Investments",
  outras_receitas: "Other Income",
  alimentacao: "Food",
  transporte: "Transport",
  moradia: "Housing",
  contas: "Bills",
  saude: "Health",
  educacao: "Education",
  lazer: "Leisure",
  compras: "Shopping",
  outros_gastos: "Other Expenses"
};

export default function RecentTransactions({ transactions, isLoading }) {
  const recentTransactions = transactions.slice(0, 10);

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No transactions recorded yet
          </div>
        ) : (
          <div className="divide-y">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4"
              >
                <div className={`p-2 rounded-full ${
                  transaction.type === 'receita' 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  {transaction.type === 'receita' ? (
                    <ArrowUpCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {transaction.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabels[transaction.category]}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(transaction.date), "MMM d", { locale: enUS })}
                    </span>
                  </div>
                </div>
                <div className={`font-bold ${
                  transaction.type === 'receita' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {transaction.type === 'receita' ? '+' : '-'}{transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}