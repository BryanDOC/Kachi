'use client';

import { useState } from 'react';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useCategories } from '@/lib/hooks/useCategories';
import { formatCurrency } from '@/lib/utils/currency';
import { subMonths, addMonths } from 'date-fns';
import { formatDate, getDateRangeForMonth, formatMonthYear } from '@/lib/utils/date';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUI } from '@/lib/context/ui-context';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { TransactionWithRelations } from '@/types';
import { TransactionRow } from '@/components/ui/TransactionRow';

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
  const { openTxSheet, openEditTxSheet, txVersion } = useUI();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithRelations | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { start, end } = getDateRangeForMonth(selectedMonth);
  const { transactions, isLoading, refetch } = useTransactions({
    startDate: start,
    endDate: end,
    type: typeFilter,
    categoryId: categoryFilter || undefined,
    version: txVersion,
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Transacciones"
        subtitle={`${filteredTransactions.length} movimientos`}
      />

      {/* Filters */}
      <div className="bg-bg-input/50 border border-border rounded-[20px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMonth((m) => subMonths(m, 1))}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text3 hover:text-text1 hover:bg-bg-input transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[14px] font-semibold text-text1 capitalize">
            {formatMonthYear(selectedMonth)}
          </span>
          <button
            onClick={() => setSelectedMonth((m) => addMonths(m, 1))}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text3 hover:text-text1 hover:bg-bg-input transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
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
      {isLoading ? (
        <div className="space-y-5">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="h-3 bg-bg-input rounded animate-pulse w-1/4 mb-2 ml-1" />
              <div className="bg-bg-input/50 border border-border rounded-[20px] overflow-hidden">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0">
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
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-bg-input/50 border border-border rounded-[20px] py-14 text-center">
          <p className="text-[13px] text-text3">No hay transacciones</p>
          <button
            onClick={() => openTxSheet()}
            className="inline-block mt-3 text-[13px] text-accent font-medium"
          >
            Crear primera transacción
          </button>
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
                  <TransactionRow
                    key={transaction.id}
                    description={transaction.description}
                    date={formatDate(transaction.date, 'd MMM')}
                    category={transaction.categories?.name}
                    iconName={transaction.categories?.icon ?? null}
                    amount={formatCurrency(transaction.amount, transaction.currencies?.code || 'PEN')}
                    type={transaction.type as 'income' | 'expense'}
                    onEdit={() => openEditTxSheet(transaction)}
                    onDelete={() => {
                      setSelectedTransaction(transaction);
                      setShowDeleteModal(true);
                    }}
                  />
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
