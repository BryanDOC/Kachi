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
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { TransactionWithRelations } from '@/types';

function groupByDate(transactions: TransactionWithRelations[]) {
  const groups: Record<string, TransactionWithRelations[]> = {};
  for (const tx of transactions) {
    const key = formatDate(tx.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }
  return Object.entries(groups);
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
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

  const grouped = groupByDate(filteredTransactions);

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
      <div className="space-y-4">
        <div className="h-8 bg-bg-input rounded animate-pulse w-1/3" />
        <div className="bg-bg-input/50 border border-border rounded-[20px] overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0">
              <div className="w-9 h-9 rounded-xl bg-bg-input animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-bg-input rounded animate-pulse w-1/2" />
                <div className="h-3 bg-bg-input rounded animate-pulse w-1/4" />
              </div>
              <div className="h-3.5 bg-bg-input rounded animate-pulse w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Transacciones"
        subtitle={`${filteredTransactions.length} movimientos`}
        action={
          <Link
            href="/dashboard/transactions/new"
            className="flex items-center gap-1.5 h-9 px-4 rounded-[12px] bg-accent text-bg text-[13px] font-semibold transition-opacity hover:opacity-90 active:scale-[0.97]"
          >
            <Plus size={13} strokeWidth={2.5} />
            Nuevo
          </Link>
        }
      />

      {/* Filters */}
      <div className="bg-bg-input/50 border border-border rounded-[20px] p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text3" size={15} />
          <input
            type="text"
            placeholder="Buscar transacción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-bg-input border border-border rounded-xl text-[13px] text-text1 placeholder:text-text3 focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
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
        </div>
      </div>

      {/* List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-bg-input/50 border border-border rounded-[20px] py-14 text-center">
          <p className="text-[13px] text-text3">No hay transacciones</p>
          <Link
            href="/dashboard/transactions/new"
            className="inline-block mt-3 text-[13px] text-accent font-medium"
          >
            Crear primera transacción
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([dateLabel, txs], groupIndex) => (
            <motion.div
              key={dateLabel}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.04 }}
            >
              <p className="text-[12px] font-medium text-text3 uppercase tracking-wide px-1 mb-2">
                {dateLabel}
              </p>
              <div className="bg-bg-input/50 border border-border rounded-[20px] overflow-hidden">
                {txs.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0 group"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{
                        background:
                          transaction.type === 'income'
                            ? 'rgba(61,255,192,0.08)'
                            : 'rgba(255,107,107,0.08)',
                      }}
                    >
                      {transaction.type === 'income' ? '💰' : '💸'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-text1 truncate leading-snug">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {transaction.categories && (
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: transaction.categories.color || 'var(--text3)' }}
                          >
                            {transaction.categories.name}
                          </span>
                        )}
                        {transaction.subcategories && (
                          <>
                            <span className="text-[11px] text-text3/50">·</span>
                            <span className="text-[11px] text-text3">
                              {transaction.subcategories.name}
                            </span>
                          </>
                        )}
                        {transaction.notes && (
                          <>
                            <span className="text-[11px] text-text3/50">·</span>
                            <span className="text-[11px] text-text3 truncate">{transaction.notes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p
                        className={cn(
                          'text-[14px] font-semibold tabular-nums',
                          transaction.type === 'income' ? 'text-accent' : 'text-[#FF6B6B]'
                        )}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{' '}
                        {formatCurrency(transaction.amount, transaction.currencies?.code || 'PEN')}
                      </p>

                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDeleteModal(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-text3 hover:text-[#FF6B6B] hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
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
          <p className="text-[14px] text-text2">¿Estás seguro de que quieres eliminar esta transacción?</p>
          {selectedTransaction && (
            <div className="p-3.5 bg-bg-input rounded-xl border border-border">
              <p className="text-[14px] font-medium text-text1">{selectedTransaction.description}</p>
              <p className="text-[12px] text-text3 mt-0.5">
                {formatCurrency(
                  selectedTransaction.amount,
                  selectedTransaction.currencies?.code || 'PEN'
                )}
              </p>
            </div>
          )}
          <div className="flex gap-2.5">
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
