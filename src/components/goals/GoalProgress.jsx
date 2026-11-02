import { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { X, Plus, Plane, Car, Home, GraduationCap, Heart, ShoppingBag, Palmtree, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

const iconMap = {
  Plane, Car, Home, GraduationCap, Heart, ShoppingBag, Palmtree, Sparkles
};

export default function GoalProgress({ goal, onClose, onAddProgress }) {
  const [amount, setAmount] = useState("");
  const Icon = iconMap[goal.icon] || Sparkles;
  const percentage = (goal.current_amount / goal.target_amount) * 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      onAddProgress(goal.id, parseFloat(amount));
      setAmount("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader className={`${goal.color} bg-opacity-10 border-b`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${goal.color} bg-opacity-20`}>
                  <Icon className={`w-6 h-6 ${goal.color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                  <CardTitle className="text-xl">{goal.title}</CardTitle>
                  {goal.description && (
                    <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-slate-600">Current Progress</span>
                <span className="text-3xl font-bold text-purple-600">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(percentage, 100)} 
                className="h-4"
                indicatorClassName="bg-purple-500"
              />
              <div className="flex justify-between items-center mt-3">
                <div>
                  <p className="text-sm text-slate-500">Saved</p>
                  <p className="text-xl font-bold text-slate-900">
                    {goal.current_amount.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Target</p>
                  <p className="text-xl font-bold text-slate-900">
                    {goal.target_amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Left to reach goal</span>
                <span className="text-2xl font-bold text-slate-900">
                  {(goal.target_amount - goal.current_amount).toFixed(2)}
                </span>
              </div>
              {goal.target_date && (
                <p className="text-xs text-slate-500">
                  Target date: {format(new Date(goal.target_date), "MMMM d, yyyy", { locale: enUS })}
                </p>
              )}
            </div>

            {goal.status !== 'concluida' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Add Amount</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <Button 
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!amount || parseFloat(amount) <= 0}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </form>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}