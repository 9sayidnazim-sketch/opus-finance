import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";

const categoryLabels = {
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
    >
      <Card className="mb-8 shadow-lg border-blue-200">
        <CardHeader className="border-b bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900">
              {budget ? "Edit Budget" : "New Budget"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
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
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Monthly Limit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">
                Limit Alert: {formData.alert_threshold}%
              </Label>
              <Slider
                value={[formData.alert_threshold]}
                onValueChange={(value) => setFormData({ ...formData, alert_threshold: value[0] })}
                min={50}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-slate-500 mt-2">
                You'll be alerted when you reach {formData.alert_threshold}% of the limit
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {budget ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}