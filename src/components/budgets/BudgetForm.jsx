import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, PiggyBank, Save } from "lucide-react";

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

export default function BudgetForm({ budget, onSubmit, onCancel, currentMonth }) {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: currentMonth,
    alert_threshold: 80,
    active: true
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount.toString(),
        month: budget.month,
        alert_threshold: budget.alert_threshold || 80,
        active: budget.active !== false
      });
    }
  }, [budget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <div className="rounded-2xl bg-[#12131A]/95 border border-white/[0.12] p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-tight">
                {budget ? "Edit Category Budget" : "New Category Budget"}
              </h2>
              <p className="text-xs text-zinc-400">
                Set spend limits and automated threshold alerts
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-white h-10 rounded-xl">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#181A24] border-white/[0.12] text-white">
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Monthly Limit ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="500.00"
                required
                className="bg-white/[0.04] border-white/[0.1] text-white text-base font-semibold tabular-numbers focus:border-violet-500 h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold text-zinc-300">Alert Trigger Threshold</Label>
              <span className="text-xs font-bold text-violet-400 tabular-numbers px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">
                {formData.alert_threshold}% of budget
              </span>
            </div>
            <Slider
              value={[formData.alert_threshold]}
              onValueChange={([val]) => setFormData({ ...formData, alert_threshold: val })}
              min={50}
              max={100}
              step={5}
              className="py-2"
            />
            <p className="text-[11px] text-zinc-400">
              You will receive automated dashboard & WhatsApp alerts when spending reaches this threshold.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-xl text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-violet-600 hover:bg-violet-500 shadow-[0_0_24px_-4px_rgba(139,92,246,0.6)] text-white font-semibold rounded-xl text-xs px-5 h-10 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {budget ? "Save Budget" : "Create Budget"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}