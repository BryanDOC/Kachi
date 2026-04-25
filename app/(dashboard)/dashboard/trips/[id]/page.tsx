'use client';

import { use } from 'react';
import { useTrip, useTripTransactions } from '@/lib/hooks/useTrips';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { trip, isLoading: tripLoading } = useTrip(id);
  const {
    transactions,
    totalSpent,
    byCategory,
    isLoading: transactionsLoading,
  } = useTripTransactions(id);

  const isLoading = tripLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-bg-input rounded-[20px]" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-bg-input rounded-[18px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-text3 text-[14px]">Viaje no encontrado</p>
        <Link href="/dashboard/trips" className="text-accent mt-4 block text-[13px] font-medium">
          Volver a viajes
        </Link>
      </div>
    );
  }

  const statusConfig = {
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

  const formatDateRange = () => {
    if (!trip.start_date && !trip.end_date) return null;
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const start = trip.start_date
      ? new Date(trip.start_date).toLocaleDateString('es-PE', options)
      : '';
    const end = trip.end_date ? new Date(trip.end_date).toLocaleDateString('es-PE', options) : '';
    if (start && end) return `${start} - ${end}`;
    return start || end;
  };

  const pieData = byCategory.map((cat) => ({
    name: cat.name,
    value: cat.total,
    color: cat.color,
  }));

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/trips"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text3 hover:text-text1 transition-colors"
      >
        <ArrowLeft size={15} />
        Volver a viajes
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-56 md:h-72 rounded-[22px] overflow-hidden"
      >
        {trip.cover_image ? (
          <Image src={trip.cover_image} alt={trip.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bg-input to-bg" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2 inline-block', statusConfig[trip.status].cls)}>
            {statusConfig[trip.status].label}
          </span>
          <h1 className="font-sans text-[22px] font-bold text-white mt-1">{trip.name}</h1>
          {formatDateRange() && (
            <div className="flex items-center gap-1.5 text-[12px] text-white/60 mt-1">
              <Calendar size={13} />
              <span>{formatDateRange()}</span>
            </div>
          )}
          {trip.description && (
            <p className="text-[13px] text-white/55 mt-1.5 line-clamp-2">{trip.description}</p>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total gastado', value: formatCurrency(totalSpent, 'PEN'), accent: true },
          { label: 'Transacciones', value: String(transactions.length), accent: false },
          { label: 'Categorías', value: String(byCategory.length), accent: false },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * (i + 1) }}
            className={cn(
              'rounded-[18px] px-4 py-4 border',
              stat.accent
                ? 'bg-accent/8 border-accent/15'
                : 'bg-bg-input/50 border-border'
            )}
          >
            <p className="text-[11px] font-medium text-text3 mb-1">{stat.label}</p>
            <p className={cn(
              'font-sans text-[20px] font-bold tabular-nums leading-none',
              stat.accent ? 'text-accent' : 'text-text1'
            )}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart & Categories */}
      {byCategory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="bg-bg-input/50 border border-border rounded-[20px] p-5"
        >
          <h2 className="font-sans text-[15px] font-semibold text-text1 mb-4">Gastos por categoría</h2>
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
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-bg border border-border rounded-[12px] px-3 py-2 shadow-xl">
                            <p className="text-text1 text-[13px] font-medium">{data.name}</p>
                            <p className="text-text3 text-[12px]">{formatCurrency(data.value, 'PEN')}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {byCategory.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[13px] text-text2">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-text1 tabular-nums">{formatCurrency(cat.total, 'PEN')}</p>
                    <p className="text-[11px] text-text3">
                      {totalSpent > 0 ? Math.round((cat.total / totalSpent) * 100) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-bg-input/50 border border-border rounded-[20px] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <h2 className="font-sans text-[15px] font-semibold text-text1">Transacciones del viaje</h2>
          <Link
            href={`/dashboard/transactions/new?trip=${id}`}
            className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] bg-accent text-bg text-[12px] font-semibold transition-opacity hover:opacity-90"
          >
            <Plus size={12} strokeWidth={2.5} />
            Agregar
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[13px] text-text3">No hay transacciones en este viaje</p>
            <Link
              href={`/dashboard/transactions/new?trip=${id}`}
              className="inline-block mt-3 text-[13px] text-accent font-medium"
            >
              Agregar primer gasto
            </Link>
          </div>
        ) : (
          <div>
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50 last:border-0"
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
                  <p className="text-[14px] font-medium text-text1 truncate">{transaction.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[11px] text-text3">{formatDate(transaction.date)}</p>
                    {transaction.categories && (
                      <>
                        <span className="text-[11px] text-text3/50">·</span>
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: transaction.categories.color || 'var(--text3)' }}
                        >
                          {transaction.categories.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <p
                  className={cn(
                    'text-[14px] font-semibold tabular-nums flex-shrink-0',
                    transaction.type === 'income' ? 'text-accent' : 'text-[#FF6B6B]'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, transaction.currencies?.code || 'PEN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
