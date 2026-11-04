import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function TransactionFilters({ onFilterChange }) {
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");

  const handleFilterChange = (filterType, value) => {
    if (filterType === "type") setType(value);
    if (filterType === "category") setCategory(value);
    onFilterChange({
      type: filterType === "type" ? value : type,
      category: filterType === "category" ? value : category
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-2 rounded-2xl bg-[#12131A]/90 border border-white/[0.08] backdrop-blur-xl w-fit">
      <div className="flex items-center gap-2 px-2">
        <Filter className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Filters:</span>
      </div>

      <Select value={type} onValueChange={(value) => handleFilterChange("type", value)}>
        <SelectTrigger className="w-36 h-9 rounded-xl bg-white/[0.04] border-white/[0.08] text-xs font-medium text-white hover:bg-white/[0.08] focus:ring-violet-500">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent className="bg-[#181A24] border-white/[0.12] text-white">
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="receita">Income (+)</SelectItem>
          <SelectItem value="despesa">Expenses (-)</SelectItem>
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={(value) => handleFilterChange("category", value)}>
        <SelectTrigger className="w-44 h-9 rounded-xl bg-white/[0.04] border-white/[0.08] text-xs font-medium text-white hover:bg-white/[0.08] focus:ring-violet-500">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent className="bg-[#181A24] border-white/[0.12] text-white">
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="alimentacao">Food & Dining</SelectItem>
          <SelectItem value="transporte">Transportation</SelectItem>
          <SelectItem value="moradia">Housing</SelectItem>
          <SelectItem value="contas">Bills & Utilities</SelectItem>
          <SelectItem value="saude">Healthcare</SelectItem>
          <SelectItem value="educacao">Education</SelectItem>
          <SelectItem value="lazer">Entertainment</SelectItem>
          <SelectItem value="compras">Shopping</SelectItem>
          <SelectItem value="salario">Salary</SelectItem>
          <SelectItem value="freelance">Freelance</SelectItem>
          <SelectItem value="investimentos">Investments</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}