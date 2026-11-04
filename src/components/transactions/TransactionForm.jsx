import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Sparkles, Save } from "lucide-react";
import { format } from "date-fns";

const categoryOptions = {
  receita: [
    { value: "salario", label: "Salary" },
    { value: "freelance", label: "Freelance" },
    { value: "investimentos", label: "Investments" },
    { value: "outras_receitas", label: "Other Income" }
  ],
  despesa: [
    { value: "alimentacao", label: "Food & Dining" },
    { value: "transporte", label: "Transportation" },
    { value: "moradia", label: "Housing" },
    { value: "contas", label: "Bills & Utilities" },
    { value: "saude", label: "Healthcare" },
    { value: "educacao", label: "Education" },
    { value: "lazer", label: "Entertainment" },
    { value: "compras", label: "Shopping" },
    { value: "outros_gastos", label: "General" }
  ]
};

export default function TransactionForm({ transaction, onSubmit, onCancel, isBillMode = false }) {
  const [formData, setFormData] = useState({
    type: isBillMode ? "despesa" : "despesa",
    amount: "",
    category: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    payment_method: "cartao_credito",
    payment_status: isBillMode ? "a_pagar" : "pago",
    due_date: "",
    recurring: false,
    recurring_day: new Date().getDate()
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description || "",
        date: transaction.date,
        payment_method: transaction.payment_method || "cartao_credito",
        payment_status: transaction.payment_status || "pago",
        due_date: transaction.due_date || "",
        recurring: transaction.recurring || false,
        recurring_day: transaction.recurring_day || new Date().getDate()
      });
    }
  }, [transaction]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    if (!submitData.due_date) delete submitData.due_date;
    if (!submitData.recurring) {
      delete submitData.recurring_day;
    }
    
    onSubmit(submitData);
  };

  const currentCategories = categoryOptions[formData.type] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <div className="rounded-2xl bg-[#12131A]/95 border border-white/[0.12] p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-64 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-tight">
                {transaction ? "Edit Transaction" : isBillMode ? "New Bill" : "New Transaction"}
              </h2>
              <p className="text-xs text-zinc-400">
                {isBillMode ? "Record upcoming scheduled bill" : "Record income or expense into the ledger"}
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
            {!isBillMode && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-300">Transaction Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "despesa", category: "" })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      formData.type === "despesa"
                        ? "bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_15px_-5px_rgba(244,63,94,0.4)]"
                        : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                  >
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "receita", category: "" })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      formData.type === "receita"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_-5px_rgba(16,185,129,0.4)]"
                        : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                  >
                    Income (+)
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
                className="bg-white/[0.04] border-white/[0.1] text-white text-base font-semibold tabular-numbers focus:border-violet-500 h-10 rounded-xl"
              />
            </div>

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
                  {currentCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="bg-white/[0.04] border-white/[0.1] text-white h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-white h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#181A24] border-white/[0.12] text-white">
                  <SelectItem value="cartao_credito">Credit Card</SelectItem>
                  <SelectItem value="cartao_debito">Debit Card</SelectItem>
                  <SelectItem value="dinheiro">Cash</SelectItem>
                  <SelectItem value="pix">Instant Pay</SelectItem>
                  <SelectItem value="transferencia">Bank Wire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Weekly grocery shopping at Spinneys"
                className="bg-white/[0.04] border-white/[0.1] text-white h-10 rounded-xl"
              />
            </div>
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
              {transaction ? "Save Changes" : "Record Transaction"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}