const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import TransactionForm from "../components/transactions/TransactionForm";
import TransactionFilters from "../components/transactions/TransactionFilters";
import TransactionList from "../components/transactions/TransactionList";

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({ type: "all", category: "all" });

  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.entities.Transaction.list("-date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
      setEditingTransaction(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
      setEditingTransaction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Transaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const handleSubmit = (data) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const typeMatch = filters.type === "all" || t.type === filters.type;
    const categoryMatch = filters.category === "all" || t.category === filters.category;
    return typeMatch && categoryMatch;
  });

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-[32px] leading-tight font-semibold tracking-[-0.03em] text-foreground">Transactions</h1>
            <p className="text-slate-500 mt-1">Manage your income and expenses</p>
          </div>
          <Button
            onClick={() => {
              setEditingTransaction(null);
              setShowForm(!showForm);
            }}
            className="bg-violet-600 hover:bg-violet-700 shadow-[0_8px_20px_-10px_rgba(124,58,237,0.6)]"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Transaction
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTransaction(null);
              }}
            />
          )}
        </AnimatePresence>

        <TransactionFilters onFilterChange={setFilters} />

        <TransactionList
          transactions={filteredTransactions}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}