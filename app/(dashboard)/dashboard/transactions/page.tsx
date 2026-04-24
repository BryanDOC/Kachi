'use client';

import { useState } from 'react';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { PageHeader } from '@/components/ui/PageHeader';
import { useUI } from '@/lib/context/ui-context';
import { useCategories } from '@/lib/hooks/useCategories';
import { getMonthDateRange } from '@/lib/utils/date';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// ── MOCK DATA ──
interface MockTx {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  date: string;
  catName: string | null;
  catColor: string | null;
  subcatName: string | null;
  notes: string | null;
}

const MOCK_TXS: MockTx[] = [
  { id: 't1', description: 'Almuerzo Wong', amount: 45.50, type: 'expense', date: '2026-04-19', catName: 'Alimentación', catColor: '#22c55e', subcatName: null, notes: null },
  { id: 't2', description: 'Sueldo abril', amount: 3200.00, type: 'income', date: '2026-04-15', catName: null, catColor: null, subcatName: null, notes: null },
  { id: 't3', description: 'Uber al aeropuerto', amount: 28.00, type: 'expense', date: '2026-04-14', catName: 'Transporte', catColor: '#3b82f6', subcatName: null, notes: null },
  { id: 't4', description: 'Farmacia Inkafarma', amount: 67.80, type: 'expense', date: '2026-04-13', catName: 'Salud', catColor: '#ef4444', subcatName: null, notes: null },
  { id: 't5', description: 'Netflix', amount: 38.90, type: 'expense', date: '2026-04-12', catName: 'Entretenimiento', catColor: '#8b5cf6', subcatName: null, notes: null },
  { id: 't6', description: 'Freelance diseño', amount: 450.00, type: 'income', date: '2026-04-10', catName: null, catColor: null, subcatName: null, notes: 'Proyecto logo' },
  { id: 't7', description: 'Supermercado Plaza Vea', amount: 189.40, type: 'expense', date: '2026-04-08', catName: 'Alimentación', catColor: '#22c55e', subcatName: 'Despensa', notes: null },
  { id: 't8', description: 'Gimnasio', amount: 120.00, type: 'expense', date: '2026-04-01', catName: 'Salud', catColor: '#ef4444', subcatName: null, notes: null },
];

const MOCK_GASTOS = MOCK_TXS.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
const MOCK_INGRESOS = MOCK_TXS.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
// ─────────────

const TYPE_CHIPS = [
  { value: 'all', label: 'Todos' },
  { value: 'expense', label: 'Gastos' },
  { value: 'income', label: 'Ingresos' },
] as const;

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTx, setSelectedTx] = useState<MockTx | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { openTxSheet } = useUI();
  const { start, end } = getMonthDateRange();
  const { refetch } = useTransactions({ startDate: start, endDate: end, type: typeFilter });
  const { categories } = useCategories();

  const filtered = MOCK_TXS.filter((t) => {
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchCat = !categoryFilter || t.catName === categoryFilter;
    const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchCat && matchSearch;
  });

  const handleDelete = async () => {
    if (!selectedTx) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('transactions').delete().eq('id', selectedTx.id);
      if (error) throw error;
      toast.success('Transacción eliminada');
      setShowDelete(false);
      setSelectedTx(null);
      refetch();
    } catch {
      toast.error('Error al eliminar transacción');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto lg:max-w-none space-y-5">
      <PageHeader
        title="Transacciones"
        subtitle={`${filtered.length} movimientos · Abril 2026`}
        action={
          <button
            onClick={() => openTxSheet()}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[12px] bg-accent text-bg text-[13px] font-semibold transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={2.5} />
            Nueva
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-[16px] p-3.5 bg-bg-input/40 border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={13} className="text-[#FF6B6B]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.4px] text-text3">Gastos</p>
          </div>
          <p className="font-numeric text-[16px] font-extrabold text-[#FF6B6B]">
            S/ {MOCK_GASTOS.toFixed(2)}
          </p>
        </div>
        <div className="rounded-[16px] p-3.5 bg-bg-input/40 border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={13} className="text-accent" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.4px] text-text3">Ingresos</p>
          </div>
          <p className="font-numeric text-[16px] font-extrabold text-accent">
            S/ {MOCK_INGRESOS.toFixed(2)}
          </p>
        </div>
        <div className="rounded-[16px] p-3.5 bg-bg-input/40 border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet size={13} className="text-text2" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.4px] text-text3">Balance</p>
          </div>
          <p className={cn(
            'font-numeric text-[16px] font-extrabold',
            MOCK_INGRESOS - MOCK_GASTOS >= 0 ? 'text-accent' : 'text-[#FF6B6B]'
          )}>
            S/ {(MOCK_INGRESOS - MOCK_GASTOS).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Type chips */}
        <div className="flex rounded-[14px] border border-border bg-bg-input/40 p-1">
          {TYPE_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setTypeFilter(chip.value)}
              className={cn(
                'flex-1 h-9 rounded-[10px] text-[13px] font-semibold transition-all',
                typeFilter === chip.value
                  ? chip.value === 'expense'
                    ? 'bg-[rgba(255,107,107,0.18)] text-[#FF6B6B]'
                    : chip.value === 'income'
                    ? 'bg-accent/15 text-accent'
                    : 'bg-bg text-text1 shadow-sm'
                  : 'text-text3'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search + Category */}
        <div className="flex gap-2.5">
          <div className="flex items-center gap-2.5 flex-1 px-3.5 h-11 rounded-[14px] bg-bg-input/60 border border-border">
            <Search size={14} className="text-text3 flex-shrink-0" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-[14px] text-text1 placeholder:text-text3 focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 px-3 rounded-[14px] bg-bg-input/60 border border-border text-[13px] text-text2 focus:outline-none focus:border-border-focus transition-colors"
          >
            <option value="">Categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 rounded-[20px] bg-bg-input/40 border border-border">
          <p className="text-text3 text-sm">Sin transacciones</p>
          <Link href="/dashboard/transactions/new" className="inline-block mt-3 text-accent text-sm font-medium">
            Agregar primera
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] bg-bg-input/40 border border-border"
            >
              {/* Type dot */}
              <div
                className={cn(
                  'w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0',
                  tx.type === 'income' ? 'bg-accent/12' : 'bg-[rgba(255,107,107,0.12)]'
                )}
              >
                {tx.type === 'income' ? (
                  <TrendingUp size={16} className="text-accent" />
                ) : (
                  <TrendingDown size={16} className="text-[#FF6B6B]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-text1 truncate">{tx.description}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[12px] text-text3">{formatShortDate(tx.date)}</span>
                  {tx.catName && (
                    <span
                      className="text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: (tx.catColor || '#52525b') + '20',
                        color: tx.catColor || '#a1a1aa',
                      }}
                    >
                      {tx.catName}
                    </span>
                  )}
                  {tx.subcatName && (
                    <span className="text-[11px] text-text3">· {tx.subcatName}</span>
                  )}
                </div>
              </div>

              {/* Amount + delete */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <p
                  className={cn(
                    'font-numeric text-[15px] font-bold',
                    tx.type === 'income' ? 'text-accent' : 'text-[#FF6B6B]'
                  )}
                >
                  {tx.type === 'income' ? '+' : '-'}S/ {tx.amount.toFixed(2)}
                </p>
                <button
                  onClick={() => { setSelectedTx(tx); setShowDelete(true); }}
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center text-text3 hover:text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.10)] transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete BottomSheet */}
      <BottomSheet
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Eliminar transacción"
      >
        {selectedTx && (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-[14px] bg-bg-input/60 border border-border">
              <p className="text-[14px] font-medium text-text1">{selectedTx.description}</p>
              <p className={cn('text-[13px] font-semibold mt-0.5', selectedTx.type === 'income' ? 'text-accent' : 'text-[#FF6B6B]')}>
                {selectedTx.type === 'income' ? '+' : '-'}S/ {selectedTx.amount.toFixed(2)}
              </p>
            </div>
            <p className="text-[13px] text-text2">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 h-12 rounded-[14px] bg-bg-input text-text2 font-semibold hover:opacity-80 transition-opacity"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-[2] h-12 rounded-[14px] bg-[#FF4444] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
