'use client';

import { useState } from 'react';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useCategories } from '@/lib/hooks/useCategories';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate, getMonthDateRange } from '@/lib/utils/date';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { TransactionWithRelations } from '@/types';

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRange, setDateRange] = useState<'month' | 'custom'>('month');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithRelations | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { start, end } = getMonthDateRange();
  const { transactions, isLoading, refetch } = useTransactions({
    startDate: start,
    endDate: end,
    type: typeFilter,
    categoryId: categoryFilter || undefined,
  });

  const { categories } = useCategories();

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!selectedTransaction) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', selectedTransaction.id);

      if (error) {
        toast.error('Error al eliminar transacción');
      } else {
        toast.success('Transacción eliminada');
        setShowDeleteModal(false);
        setSelectedTransaction(null);
        refetch();
      }
    } catch {
      toast.error('Error al eliminar transacción');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-zinc-900 rounded animate-pulse w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-zinc-900 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Transacciones</h1>
          <p className="text-zinc-400">{filteredTransactions.length} transacciones</p>
        </div>
        <Link
          href="/dashboard/transactions/new"
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
        >
          <Plus size={20} />
          Nueva
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'expense' | 'income')}
          >
            <option value="all">Todos</option>
            <option value="expense">Gastos</option>
            <option value="income">Ingresos</option>
          </Select>

          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'month' | 'custom')}
          >
            <option value="month">Este mes</option>
            <option value="custom">Personalizado</option>
          </Select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500">No hay transacciones</p>
          <Link
            href="/dashboard/transactions/new"
            className="inline-block mt-4 text-amber-500 hover:text-amber-400 font-medium"
          >
            Crear primera transacción
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{transaction.description}</h3>
                    {transaction.categories && (
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: transaction.categories.color + '20',
                          color: transaction.categories.color || '#fff',
                        }}
                      >
                        {transaction.categories.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span>{formatDate(transaction.date)}</span>
                    {transaction.subcategories && (
                      <span className="text-zinc-600">• {transaction.subcategories.name}</span>
                    )}
                    {transaction.notes && (
                      <span className="text-zinc-600">• {transaction.notes}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p
                    className={cn(
                      'text-2xl font-serif font-bold',
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, transaction.currencies?.code || 'PEN')}
                  </p>

                  <button
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar transacción"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-zinc-300">¿Estás seguro de que quieres eliminar esta transacción?</p>
          {selectedTransaction && (
            <div className="p-4 bg-zinc-950 rounded-lg">
              <p className="text-white font-medium">{selectedTransaction.description}</p>
              <p className="text-zinc-500 text-sm mt-1">
                {formatCurrency(
                  selectedTransaction.amount,
                  selectedTransaction.currencies?.code || 'PEN'
                )}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-red-500 hover:bg-red-400"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
