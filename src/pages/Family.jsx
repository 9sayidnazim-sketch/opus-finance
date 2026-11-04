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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 uppercase tracking-wider">
                Multi-User Workspace
              </span>
              <span className="text-xs text-zinc-400">• {activeMembers.length} active members</span>
            </div>
            <h1 className="font-heading text-[30px] sm:text-[34px] leading-tight font-bold tracking-[-0.03em] text-white">
              Family & Household Workspace
            </h1>
            <p className="text-zinc-400 text-sm">
              Manage member roles, permissions, and shared financial goals.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingMember(null);
              setShowForm(!showForm);
            }}
            className="bg-violet-600 hover:bg-violet-500 shadow-[0_0_24px_-4px_rgba(139,92,246,0.6)] text-white font-semibold rounded-xl text-xs px-4 h-10 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 backdrop-blur-xl relative overflow-hidden group hover:border-violet-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Active Members</p>
                <p className="text-3xl font-bold text-white mt-1 tabular-numbers">
                  {activeMembers.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Shared workspace access</p>
          </div>

          <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Family Net Balance</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1 tabular-numbers">
                  ${familyStats.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Combined month cashflow</p>
          </div>

          <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Monthly Activity</p>
                <p className="text-3xl font-bold text-cyan-400 mt-1 tabular-numbers">
                  {familyStats.transactionsCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Recorded transactions</p>
          </div>
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