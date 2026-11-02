const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import GoalForm from "../components/goals/GoalForm";
import GoalCard from "../components/goals/GoalCard";
import GoalProgress from "../components/goals/GoalProgress";

export default function GoalsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => db.entities.Goal.list("-created_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowForm(false);
      setEditingGoal(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowForm(false);
      setEditingGoal(null);
      setSelectedGoal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Goal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setSelectedGoal(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
    setSelectedGoal(null);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddProgress = (goalId, amount) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const newAmount = goal.current_amount + amount;
      const status = newAmount >= goal.target_amount ? 'concluida' : 'em_progresso';
      updateMutation.mutate({ 
        id: goalId, 
        data: { 
          current_amount: newAmount,
          status
        } 
      });
    }
  };

  const activeGoals = goals.filter(g => g.status === 'em_progresso');
  const completedGoals = goals.filter(g => g.status === 'concluida');

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-[32px] leading-tight font-semibold tracking-[-0.03em] text-foreground">Financial Goals</h1>
            <p className="text-slate-500 mt-1">Set and track your savings goals</p>
          </div>
          <Button
            onClick={() => {
              setEditingGoal(null);
              setShowForm(!showForm);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Goal
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <GoalForm
              goal={editingGoal}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingGoal(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedGoal && (
            <GoalProgress
              goal={selectedGoal}
              onClose={() => setSelectedGoal(null)}
              onAddProgress={handleAddProgress}
            />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="text-center py-12 text-slate-500">
            Loading goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              You haven't set any financial goals yet
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {activeGoals.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Goals in Progress ({activeGoals.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onClick={() => setSelectedGoal(goal)}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Completed Goals ({completedGoals.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onClick={() => setSelectedGoal(goal)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}