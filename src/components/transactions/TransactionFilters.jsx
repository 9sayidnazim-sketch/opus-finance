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
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <Select value={type} onValueChange={(value) => handleFilterChange("type", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="receita">Income</SelectItem>
            <SelectItem value="despesa">Expenses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <Select value={category} onValueChange={(value) => handleFilterChange("category", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="alimentacao">Food</SelectItem>
            <SelectItem value="transporte">Transport</SelectItem>
            <SelectItem value="moradia">Housing</SelectItem>
            <SelectItem value="contas">Bills</SelectItem>
            <SelectItem value="saude">Health</SelectItem>
            <SelectItem value="salario">Salary</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}