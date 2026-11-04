const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useMemo } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Receipt, AlertCircle, CheckCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { differenceInDays, isBefore, startOfDay } from "date-fns";

import TransactionForm from "../components/transactions/TransactionForm";
import BillCard from "../components/bills/BillCard";
import BillsCalendar from "../components/bills/BillsCalendar";

export default function BillsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.entities.Transaction.list("-due_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
      setEditingBill(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
      setEditingBill(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Transaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const handleSubmit = (data) => {
    if (editingBill) {
      updateMutation.mutate({ id: editingBill.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this bill?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleMarkAsPaid = (bill) => {
    updateMutation.mutate({
      id: bill.id,
      data: {
        ...bill,
        payment_status: 'pago',
        paid_date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const bills = useMemo(() => {
    return transactions.filter(t => t.type === 'despesa' && t.due_date);
  }, [transactions]);

  const { pending, overdue, paid, upcoming } = useMemo(() => {
    const today = startOfDay(new Date());
    
    const pending = bills.filter(b => 
      b.payment_status === 'a_pagar' && 
      !isBefore(new Date(b.due_date), today)
    );
    
    const overdue = bills.filter(b => 
      b.payment_status === 'a_pagar' && 
      isBefore(new Date(b.due_date), today)
    );
    
    const paid = bills.filter(b => b.payment_status === 'pago');
    
    const upcoming = pending.filter(b => {
      const daysUntilDue = differenceInDays(new Date(b.due_date), today);
      return daysUntilDue <= 7 && daysUntilDue >= 0;
    });

    return { pending, overdue, paid, upcoming };
  }, [bills]);

  const stats = {
    total: pending.length + overdue.length,
    overdue: overdue.length,
    upcoming: upcoming.length,
    totalAmount: [...pending, ...overdue].reduce((sum, b) => sum + b.amount, 0)
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 uppercase tracking-wider">
                Accounts Payable
              </span>
              <span className="text-xs text-zinc-400">• {stats.total} scheduled</span>
            </div>
            <h1 className="font-heading text-[30px] sm:text-[34px] leading-tight font-bold tracking-[-0.03em] text-white">
              Bills & Scheduled Payments
            </h1>
            <p className="text-zinc-400 text-sm">
              Keep track of recurring obligations, upcoming due dates, and paid invoices.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingBill(null);
              setShowForm(!showForm);
            }}
            className="bg-violet-600 hover:bg-violet-500 shadow-[0_0_24px_-4px_rgba(139,92,246,0.6)] text-white font-semibold rounded-xl text-xs px-4 h-10 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Bill
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 backdrop-blur-xl relative overflow-hidden group hover:border-violet-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Pending Bills</p>
                <p className="text-2xl font-bold text-white mt-1 tabular-numbers">
                  {stats.total}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Awaiting payment</p>
          </div>

          <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 backdrop-blur-xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Overdue</p>
                <p className="text-2xl font-bold text-rose-400 mt-1 tabular-numbers">
                  {stats.overdue}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Requires immediate attention</p>
          </div>

          <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Next 7 Days</p>
                <p className="text-2xl font-bold text-amber-400 mt-1 tabular-numbers">
                  {stats.upcoming}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Due in the upcoming week</p>
          </div>

          <div className="rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Pending Total</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1 tabular-numbers">
                  ${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Total committed balance</p>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <TransactionForm
              transaction={editingBill}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingBill(null);
              }}
              isBillMode={true}
            />
          )}
        </AnimatePresence>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-4 gap-2 bg-[#12131A]/90 border border-white/[0.08] p-1.5 rounded-2xl backdrop-blur-xl">
            <TabsTrigger
              value="pending"
              className="rounded-xl text-xs font-semibold data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_-4px_rgba(139,92,246,0.6)] text-zinc-400 hover:text-white"
            >
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger
              value="overdue"
              className="rounded-xl text-xs font-semibold data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_-4px_rgba(244,63,94,0.6)] text-zinc-400 hover:text-white"
            >
              Overdue ({overdue.length})
            </TabsTrigger>
            <TabsTrigger
              value="paid"
              className="rounded-xl text-xs font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_-4px_rgba(16,185,129,0.6)] text-zinc-400 hover:text-white"
            >
              Paid ({paid.length})
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="rounded-xl text-xs font-semibold data-[state=active]:bg-white/[0.1] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 text-zinc-400 hover:text-white"
            >
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : pending.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-slate-500">No pending bills</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pending.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onMarkAsPaid={handleMarkAsPaid}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            {overdue.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-slate-500">No overdue bills</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {overdue.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onMarkAsPaid={handleMarkAsPaid}
                    isOverdue={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            {paid.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No paid bills recorded</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {paid.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isPaid={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <BillsCalendar bills={bills} onBillClick={handleEdit} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}