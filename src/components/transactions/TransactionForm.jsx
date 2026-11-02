import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { format } from "date-fns";

const categoryOptions = {
  receita: [
    { value: "salario", label: "Salary" },
    { value: "freelance", label: "Freelance" },
    { value: "investimentos", label: "Investments" },
    { value: "outras_receitas", label: "Other Income" }
  ],
  despesa: [
    { value: "alimentacao", label: "Food" },
    { value: "transporte", label: "Transport" },
    { value: "moradia", label: "Housing" },
    { value: "contas", label: "Bills" },
    { value: "saude", label: "Health" },
    { value: "educacao", label: "Education" },
    { value: "lazer", label: "Leisure" },
    { value: "compras", label: "Shopping" },
    { value: "outros_gastos", label: "Other Expenses" }
  ]
};

export default function TransactionForm({ transaction, onSubmit, onCancel, isBillMode = false }) {
  const [formData, setFormData] = useState({
    type: isBillMode ? "despesa" : "despesa",
    amount: "",
    category: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    payment_method: "dinheiro",
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
        payment_method: transaction.payment_method || "dinheiro",
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
    
    // Remove campos vazios
    if (!submitData.due_date) delete submitData.due_date;
    if (!submitData.recurring) {
      delete submitData.recurring_day;
    }
    
    onSubmit(submitData);
  };

  const currentCategories = categoryOptions[formData.type] || [];
  const showPaymentStatus = formData.type === 'despesa' && formData.due_date;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="mb-8 shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>
              {transaction ? "Edit Transaction" : isBillMode ? "New Bill" : "New Transaction"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {!isBillMode && (
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value, category: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Income</SelectItem>
                      <SelectItem value="despesa">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              {formData.type === 'despesa' && (
                <>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>

                  {showPaymentStatus && (
                    <div>
                      <Label>Payment Status</Label>
                      <Select
                        value={formData.payment_status}
                        onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pago">Paid</SelectItem>
                          <SelectItem value="a_pagar">To Pay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              <div>
                <Label>Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Cash</SelectItem>
                    <SelectItem value="cartao_credito">Credit Card</SelectItem>
                    <SelectItem value="cartao_debito">Debit Card</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'despesa' && (
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex-1">
                  <Label className="text-base font-medium">Recurring Expense</Label>
                  <p className="text-sm text-slate-500 mt-1">
                    This bill repeats every month
                  </p>
                </div>
                <Switch
                  checked={formData.recurring}
                  onCheckedChange={(value) => setFormData({ ...formData, recurring: value })}
                />
              </div>
            )}

            {formData.recurring && (
              <div>
                <Label>Day of the Month (for recurrence)</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.recurring_day}
                  onChange={(e) => setFormData({ ...formData, recurring_day: parseInt(e.target.value) })}
                />
              </div>
            )}

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about this transaction..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                {transaction ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}