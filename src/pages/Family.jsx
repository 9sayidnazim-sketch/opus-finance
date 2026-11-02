const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useMemo } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, TrendingUp, Wallet } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { startOfMonth } from "date-fns";

import MemberCard from "../components/family/MemberCard";
import AddMemberForm from "../components/family/AddMemberForm";
import MemberStats from "../components/family/MemberStats";
import MemberActivity from "../components/family/MemberActivity";

export default function FamilyPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const queryClient = useQueryClient();

  const { data: members, isLoading: _isLoading } = useQuery({
    queryKey: ['family-members'],
    queryFn: () => db.entities.FamilyMember.list("-created_date"),
    initialData: [],
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.entities.Transaction.list("-date"),
    initialData: [],
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => db.entities.Budget.list(),
    initialData: [],
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => db.entities.Goal.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.FamilyMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      setShowForm(false);
      setEditingMember(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.FamilyMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      setShowForm(false);
      setEditingMember(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.FamilyMember.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
    },
  });

  const handleSubmit = (data) => {
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to remove this member?")) {
      deleteMutation.mutate(id);
    }
  };

  const activeMembers = members.filter(m => m.status === 'active');
  const pendingMembers = members.filter(m => m.status === 'pending');

  const monthStart = startOfMonth(new Date());
  const thisMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= monthStart;
  });

  const familyStats = useMemo(() => {
    const totalIncome = thisMonthTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = thisMonthTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionsCount: thisMonthTransactions.length
    };
  }, [thisMonthTransactions]);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-[32px] leading-tight font-semibold tracking-[-0.03em] text-foreground">Family</h1>
            <p className="text-slate-500 mt-1">
              Manage members and share financial control
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingMember(null);
              setShowForm(!showForm);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Member
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Members</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {activeMembers.length}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Family Balance</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {familyStats.balance.toFixed(2)}
                  </p>
                </div>
                <Wallet className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Transactions (month)</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {familyStats.transactionsCount}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <AddMemberForm
              member={editingMember}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingMember(null);
              }}
            />
          )}
        </AnimatePresence>

        {pendingMembers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Pending Invites ({pendingMembers.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Active Members ({activeMembers.length})
          </h2>
          {activeMembers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">
                  No active members yet
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {activeMembers.length > 0 && (
          <>
            <MemberStats 
              members={activeMembers} 
              transactions={thisMonthTransactions}
              budgets={budgets}
              goals={goals}
            />
            
            <MemberActivity 
              members={activeMembers}
              transactions={transactions}
            />
          </>
        )}
      </div>
    </div>
  );
}