import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6'];

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

export default function CategoryChart({ data, isLoading }) {
  const chartData = data.map(item => ({
    name: categoryLabels[item.name] || item.name,
    value: item.value
  }));

  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="border-b">
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <Skeleton className="w-full h-64" />
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500">
            No expenses this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `-${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}