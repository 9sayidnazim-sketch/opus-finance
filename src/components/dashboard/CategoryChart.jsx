import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart as PieIcon } from "lucide-react";

const COLORS = [
  '#8B5CF6', // Electric Violet
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#F43F5E', // Rose
  '#14B8A6'  // Teal
];

const categoryLabels = {
  alimentacao: "Food & Dining",
  transporte: "Transportation",
  moradia: "Housing",
  contas: "Bills & Utilities",
  saude: "Healthcare",
  educacao: "Education",
  lazer: "Entertainment",
  compras: "Shopping",
  outros_gastos: "General"
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-xl bg-[#181A24]/95 border border-white/[0.12] p-3 shadow-2xl backdrop-blur-xl">
        <p className="text-xs text-zinc-400 font-medium">{data.name}</p>
        <p className="text-base font-bold text-white tabular-numbers mt-0.5">
          ${Number(data.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ data, isLoading }) {
  const chartData = data.map(item => ({
    name: categoryLabels[item.name] || item.name,
    value: item.value
  }));

  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl h-full flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-violet-400" />
          <h2 className="font-heading text-lg font-semibold text-white tracking-tight">Expenses by Category</h2>
        </div>
        {totalValue > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 tabular-numbers">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-[260px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-56">
            <Skeleton className="w-44 h-44 rounded-full bg-white/[0.06]" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-2 text-zinc-500">
              <PieIcon className="w-4 h-4" />
            </div>
            <p className="text-xs text-zinc-400">No expenses recorded for this month</p>
          </div>
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="rgba(18, 19, 26, 0.8)"
                  strokeWidth={2}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Total</span>
              <span className="text-sm font-bold text-white tabular-numbers">
                ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend List */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.04]">
          {chartData.slice(0, 4).map((item, idx) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-xs text-zinc-300 truncate tracking-tight">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}