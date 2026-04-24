'use client';

import { useTrip, useTripTransactions } from '@/lib/hooks/useTrips';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { ArrowLeft, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUI } from '@/lib/context/ui-context';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// ── MOCK DATA — reemplazar con useTrip/useTripTransactions cuando esté listo ──
const MOCK = {
  name: 'Huaraz',
  dates: '10 — 20 Abr 2026 · 10 días',
  status: 'active' as const,
  emoji: '🏔️',
  gradient: 'linear-gradient(135deg, #1a3a2a, #2d6a4f, #3a8a5a)',
  totalSpent: 'S/ 348.50',
  movimientos: 12,
};

const MOCK_CATS = [
  { id: '1', emoji: '🚌', name: 'Transporte', count: 4, amount: 'S/ 142.00', bg: 'rgba(96,165,250,0.12)' },
  { id: '2', emoji: '🍽️', name: 'Alimentación', count: 5, amount: 'S/ 118.50', bg: 'rgba(61,255,192,0.10)' },
  { id: '3', emoji: '🏨', name: 'Alojamiento', count: 2, amount: 'S/ 68.00', bg: 'rgba(252,211,77,0.10)' },
  { id: '4', emoji: '🎒', name: 'Actividades', count: 1, amount: 'S/ 20.00', bg: 'rgba(167,139,250,0.10)' },
];
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  active: {
    label: 'Activo',
    cls: 'bg-[rgba(61,255,192,0.2)] text-[#3DFFC0] border border-[rgba(61,255,192,0.3)]',
  },
  completed: {
    label: 'Completado',
    cls: 'bg-[rgba(96,165,250,0.2)] text-[#93C5FD] border border-[rgba(96,165,250,0.3)]',
  },
  cancelled: {
    label: 'Cancelado',
    cls: 'bg-[rgba(156,163,175,0.2)] text-[#9CA3AF] border border-[rgba(156,163,175,0.3)]',
  },
};

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { openTxSheet } = useUI();
  const { isLoading: tripLoading } = useTrip(id);
  const { transactions, totalSpent, byCategory, isLoading: txLoading } = useTripTransactions(id);

  const isLoading = tripLoading || txLoading;
  const badge = STATUS_BADGE[MOCK.status];
  const pieData = byCategory.map((c) => ({ name: c.name, value: c.total, color: c.color }));

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto lg:max-w-none space-y-4 animate-pulse">
        <div className="h-[260px] rounded-[22px] bg-bg-input" />
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-[16px] bg-bg-input" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto lg:max-w-none space-y-5">
      {/* Back */}
      <Link
        href="/dashboard/trips"
        className="inline-flex items-center gap-1.5 text-sm text-text2 hover:text-text1 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a viajes
      </Link>

      {/* Hero */}
      <div className="relative w-full h-[260px] rounded-[22px] overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center text-[120px]"
          style={{ background: MOCK.gradient }}
        >
          {MOCK.emoji}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span
            className={cn(
              'text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.3px] inline-block mb-2',
              badge.cls
            )}
          >
            {badge.label}
          </span>
          <p className="font-display text-[28px] font-extrabold text-white tracking-tight mb-1">
            {MOCK.name}
          </p>
          <div className="flex items-center gap-1.5 text-[13px] text-white/60">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect
                x="1"
                y="2"
                width="11"
                height="10"
                rx="2"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.1"
              />
              <path d="M1 5.5h11" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" />
            </svg>
            {MOCK.dates}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { val: MOCK.totalSpent, lbl: 'Gastado', accent: true },
          { val: MOCK.movimientos.toString(), lbl: 'Movimientos', accent: false },
          { val: MOCK_CATS.length.toString(), lbl: 'Categorías', accent: false },
        ].map(({ val, lbl, accent }) => (
          <div key={lbl} className="rounded-[16px] p-3.5 bg-bg-input/40 border border-border">
            <p
              className={cn(
                'font-numeric text-[18px] font-extrabold mb-0.5',
                accent ? 'text-accent' : 'text-text1'
              )}
            >
              {val}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-text3">{lbl}</p>
          </div>
        ))}
      </div>

      {/* Category list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-display text-[15px] font-bold text-text1">Por categoría</p>
          <span className="text-[12px] text-accent cursor-pointer">Ver todo</span>
        </div>
        <div className="flex flex-col gap-2">
          {MOCK_CATS.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-3.5 py-3 rounded-[16px] bg-bg-input/40 border border-border"
            >
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[18px] flex-shrink-0"
                style={{ background: cat.bg }}
              >
                {cat.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-text1">{cat.name}</p>
                <p className="text-[12px] text-text3 mt-0.5">{cat.count} movimientos</p>
              </div>
              <p className="font-numeric text-[15px] font-bold text-text1/85 flex-shrink-0">
                {cat.amount}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* PieChart — datos reales */}
      {byCategory.length > 0 && (
        <div className="rounded-[20px] p-5 bg-bg-input/40 border border-border">
          <p className="font-display text-[15px] font-bold text-text1 mb-5">Distribución</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-bg-input border border-border rounded-[12px] px-3 py-2">
                          <p className="text-text1 font-medium text-sm">{d.name}</p>
                          <p className="text-text3 text-xs">{formatCurrency(d.value, 'PEN')}</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5">
              {byCategory.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-text2 text-sm">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-text1 font-medium text-sm">
                      {formatCurrency(cat.total, 'PEN')}
                    </p>
                    <p className="text-text3 text-xs">
                      {totalSpent > 0 ? Math.round((cat.total / totalSpent) * 100) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="rounded-[20px] p-5 bg-bg-input/40 border border-border">
        <div className="flex items-center justify-between mb-5">
          <p className="font-display text-[15px] font-bold text-text1">Movimientos</p>
          <button
            onClick={() => openTxSheet(id)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] bg-accent text-bg text-[13px] font-semibold transition-opacity hover:opacity-90"
          >
            <Plus size={12} strokeWidth={2.5} />
            Agregar
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-text3 text-sm">No hay movimientos en este viaje</p>
            <button
              onClick={() => openTxSheet(id)}
              className="inline-block mt-3 text-accent text-sm font-medium"
            >
              Agregar primer gasto
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-[14px] bg-bg-input/60"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-text1 font-medium text-sm truncate">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-text3 text-xs">{formatDate(tx.date)}</p>
                    {tx.categories && (
                      <span
                        className="text-[11px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: (tx.categories.color || '#52525b') + '20',
                          color: tx.categories.color || '#a1a1aa',
                        }}
                      >
                        {tx.categories.name}
                      </span>
                    )}
                  </div>
                </div>
                <p
                  className={cn(
                    'text-sm font-semibold font-numeric flex-shrink-0 ml-3',
                    tx.type === 'income' ? 'text-accent' : 'text-[#FF6B6B]'
                  )}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount, tx.currencies?.code || 'PEN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
