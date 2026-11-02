import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpCircle, ArrowDownCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

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

export default function MemberActivity({ members, transactions }) {
  const [selectedMember, setSelectedMember] = useState("all");

  const filteredTransactions = useMemo(() => {
    if (selectedMember === "all") {
      return transactions;
    }
    const member = members.find(m => m.id === selectedMember);
    return transactions.filter(t => t.created_by === member?.email);
  }, [transactions, selectedMember, members]);

  const recentTransactions = filteredTransactions.slice(0, 10);

  const getMemberByEmail = (email) => {
    return members.find(m => m.email === email);
  };

  return (
    <div className="mb-8">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <span>{member.avatar}</span>
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No recent activity
              </div>
            ) : (
              recentTransactions.map((transaction) => {
                const member = getMemberByEmail(transaction.created_by);
                const isIncome = transaction.type === 'receita';

                return (
                  <div key={transaction.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {member && (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-white flex-shrink-0"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.avatar}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900 truncate">
                            {transaction.description || categoryLabels[transaction.category]}
                          </p>
                          {member && (
                            <span className="text-xs text-slate-500">
                              by {member.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[transaction.category]}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(transaction.date), "MMM d", { locale: enUS })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isIncome ? (
                          <ArrowUpCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                          {isIncome ? '+' : '-'}{transaction.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}