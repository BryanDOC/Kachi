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
      <div className="space-y-6">
        <div className="h-64 bg-zinc-900 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Viaje no encontrado</p>
        <Link href="/dashboard/trips" className="text-amber-500 hover:text-amber-400 mt-4 block">
          Volver a viajes
        </Link>
      </div>
    );
  }

  const statusConfig = {
    active: { label: 'Activo', color: 'bg-green-500' },
    completed: { label: 'Completado', color: 'bg-blue-500' },
    cancelled: { label: 'Cancelado', color: 'bg-zinc-500' },
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
    <div className="space-y-8">
      <Link
        href="/dashboard/trips"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        Volver a viajes
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-64 md:h-80 rounded-2xl overflow-hidden"
      >
        {trip.cover_image ? (
          <Image src={trip.cover_image} alt={trip.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={cn(
                'px-3 py-1 rounded text-sm font-medium text-white',
                statusConfig[trip.status].color
              )}
            >
              {statusConfig[trip.status].label}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">{trip.name}</h1>
          {formatDateRange() && (
            <div className="flex items-center gap-2 text-zinc-300">
              <Calendar size={16} />
              <span>{formatDateRange()}</span>
            </div>
          )}
          {trip.description && <p className="text-zinc-400 mt-2 max-w-2xl">{trip.description}</p>}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-900/40 to-amber-950/40 border border-amber-800/50 rounded-xl p-6"
        >
          <p className="text-zinc-400 text-sm mb-1">Total gastado</p>
          <p className="text-3xl font-serif font-bold text-white">
            {formatCurrency(totalSpent, 'PEN')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <p className="text-zinc-400 text-sm mb-1">Transacciones</p>
          <p className="text-3xl font-serif font-bold text-white">{transactions.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <p className="text-zinc-400 text-sm mb-1">Categorías</p>
          <p className="text-3xl font-serif font-bold text-white">{byCategory.length}</p>
        </motion.div>
      </div>

      {/* Chart & Categories */}
      {byCategory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Gastos por categoría</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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
                          <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                            <p className="text-white font-medium">{data.name}</p>
                            <p className="text-zinc-400">{formatCurrency(data.value, 'PEN')}</p>
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
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-zinc-300">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(cat.total, 'PEN')}</p>
                    <p className="text-zinc-500 text-sm">
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Transacciones del viaje</h2>
          <Link
            href={`/dashboard/transactions/new?trip=${id}`}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors text-sm"
          >
            <Plus size={16} />
            Agregar gasto
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500">No hay transacciones en este viaje</p>
            <Link
              href={`/dashboard/transactions/new?trip=${id}`}
              className="inline-block mt-4 text-amber-500 hover:text-amber-400 font-medium"
            >
              Agregar primer gasto
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-zinc-500">{formatDate(transaction.date)}</p>
                    {transaction.categories && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: (transaction.categories.color || '#52525b') + '20',
                          color: transaction.categories.color || '#a1a1aa',
                        }}
                      >
                        {transaction.categories.name}
                      </span>
                    )}
                  </div>
                </div>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
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
