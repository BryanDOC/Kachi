'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripSchema, type TripFormData } from '@/lib/validations/trip.schema';
import { useTrip, useTripTransactions } from '@/lib/hooks/useTrips';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { Plus, Pencil, Trash2, Upload, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI } from '@/lib/context/ui-context';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TransactionRow } from '@/components/ui/TransactionRow';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

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

function formatTripDates(start: string | null, end: string | null): string {
  if (!start) return 'Sin fechas definidas';
  const s = new Date(start + 'T00:00:00');
  if (!end) return format(s, 'MMM yyyy', { locale: es });
  const e = new Date(end + 'T00:00:00');
  const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return `${format(s, 'd MMM', { locale: es })} — ${format(e, 'd MMM yyyy', { locale: es })} · ${days} día${days !== 1 ? 's' : ''}`;
}

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { openTxSheet, openEditTxSheet, txVersion } = useUI();
  const { trip, isLoading: tripLoading, refetch: refetchTrip } = useTrip(id);
  const { transactions, totalSpent, byCategory, isLoading: txLoading } = useTripTransactions(id, txVersion);

  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
  });

  const openEdit = () => {
    if (!trip) return;
    reset({ name: trip.name, description: trip.description || null, start_date: trip.start_date || null, end_date: trip.end_date || null, status: trip.status });
    setCoverPreview(trip.cover_image || null);
    setCoverImage(null);
    setEditSheetOpen(true);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const { error } = await supabase.storage.from('trip-covers').upload(`${id}.${ext}`, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('trip-covers').getPublicUrl(`${id}.${ext}`);
      return publicUrl;
    } catch { return null; }
    finally { setIsUploading(false); }
  };

  const onEditSubmit = async (data: TripFormData) => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const payload = { name: data.name, description: data.description || null, start_date: data.start_date || null, end_date: data.end_date || null, status: data.status };
      const { error } = await supabase.from('trips').update(payload).eq('id', id);
      if (error) throw error;
      if (coverImage) {
        const url = await uploadImage(coverImage);
        if (url) await supabase.from('trips').update({ cover_image: url }).eq('id', id);
      }
      toast.success('Viaje actualizado');
      setEditSheetOpen(false);
      refetchTrip();
    } catch { toast.error('Error al actualizar viaje'); }
    finally { setIsSaving(false); }
  };

  const handleComplete = async () => {
    const supabase = createClient();
    const { error } = await supabase.from('trips').update({ status: 'completed' }).eq('id', id);
    if (error) { toast.error('Error al completar viaje'); return; }
    toast.success('Viaje completado');
    refetchTrip();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from('transactions').update({ trip_id: null }).eq('trip_id', id);
      const { error } = await supabase.from('trips').delete().eq('id', id);
      if (error) throw error;
      toast.success('Viaje eliminado');
      router.push('/dashboard/trips');
    } catch { toast.error('Error al eliminar viaje'); }
    finally { setIsDeleting(false); }
  };

  const isLoading = tripLoading || txLoading;
  const pieData = byCategory.map((c) => ({ name: c.name, value: c.total, color: c.color }));

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto lg:max-w-none space-y-4 animate-pulse">
        <div className="h-[260px] rounded-[22px] bg-bg-input" />
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-[16px] bg-bg-input" />)}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-[66px] rounded-[16px] bg-bg-input" />)}
        </div>
        <div className="h-[200px] rounded-[20px] bg-bg-input" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-lg mx-auto lg:max-w-none py-20 text-center">
        <p className="text-text3 text-[13px]">Viaje no encontrado</p>
      </div>
    );
  }

  const badge = STATUS_BADGE[trip.status];
  const dates = formatTripDates(trip.start_date, trip.end_date);

  return (
    <div className="max-w-lg mx-auto lg:max-w-none space-y-5">
      {/* Hero */}
      <div className="relative w-full h-[260px] rounded-[22px] overflow-hidden">
        {trip.cover_image ? (
          <img src={trip.cover_image} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f, #3a8a5a)' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={openEdit} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors">
            <Pencil size={13} className="text-white" />
          </button>
          <button onClick={() => setDeleteModalOpen(true)} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors">
            <Trash2 size={13} className="text-white" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span
            className={cn(
              'text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-[0.3px] inline-block mb-2',
              badge.cls
            )}
          >
            {badge.label}
          </span>
          <p className="font-sans text-[24px] font-bold text-white mb-1">{trip.name}</p>
          <div className="flex items-center gap-1.5 text-[12px] text-white/60">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="2" width="11" height="10" rx="2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" />
              <path d="M1 5.5h11" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" />
            </svg>
            {dates}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { val: formatCurrency(totalSpent, 'PEN'), lbl: 'Gastado', accent: true },
          { val: transactions.length.toString(), lbl: 'Movimientos', accent: false },
          { val: byCategory.length.toString(), lbl: 'Categorías', accent: false },
        ].map(({ val, lbl, accent }) => (
          <div key={lbl} className="rounded-[16px] p-3.5 bg-bg-input/40 border border-border">
            <p
              className={cn(
                'font-sans text-[15px] font-bold tabular-nums mb-0.5 truncate',
                accent ? 'text-accent' : 'text-text1'
              )}
            >
              {val}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-text3">{lbl}</p>
          </div>
        ))}
      </div>

      {trip.status === 'active' && (
        <button
          onClick={handleComplete}
          className="w-full h-11 rounded-[16px] bg-[rgba(61,255,192,0.12)] text-[#3DFFC0] border border-[rgba(61,255,192,0.3)] text-[14px] font-semibold hover:bg-[rgba(61,255,192,0.22)] transition-colors flex items-center justify-center gap-2"
        >
          <Check size={15} strokeWidth={2.5} />
          Completar viaje
        </button>
      )}

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div>
          <p className="font-sans text-[15px] font-semibold text-text1 mb-3">Por categoría</p>
          <div className="flex flex-col gap-2">
            {byCategory.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-3.5 py-3 rounded-[16px] bg-bg-input/40 border border-border"
              >
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: (cat.color || '#6366F1') + '22' }}
                >
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background: cat.color || '#6366F1' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-text1">{cat.name}</p>
                  <p className="text-[12px] text-text3 mt-0.5">
                    {totalSpent > 0 ? Math.round((cat.total / totalSpent) * 100) : 0}% del total
                  </p>
                </div>
                <p className="font-sans text-[14px] font-semibold text-text1/85 tabular-nums flex-shrink-0">
                  {formatCurrency(cat.total, 'PEN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PieChart */}
      {byCategory.length > 1 && (
        <div className="rounded-[20px] p-5 bg-bg-input/40 border border-border">
          <p className="font-sans text-[15px] font-semibold text-text1 mb-5">Distribución</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
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
                          <p className="text-text1 font-medium text-[13px]">{d.name}</p>
                          <p className="text-text3 text-[12px]">{formatCurrency(d.value, 'PEN')}</p>
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
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-text2 text-[13px]">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-text1 font-semibold text-[13px] tabular-nums">
                      {formatCurrency(cat.total, 'PEN')}
                    </p>
                    <p className="text-text3 text-[11px]">
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
          <p className="font-sans text-[15px] font-semibold text-text1">Movimientos</p>
          <button
            onClick={() => openTxSheet(id)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-white dark:text-[#1A1A2E] text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--card-bg)' }}
          >
            <Plus size={12} strokeWidth={2.5} />
            Agregar
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-text3 text-[13px]">No hay movimientos en este viaje</p>
            <button
              onClick={() => openTxSheet(id)}
              className="inline-block mt-3 text-accent text-[13px] font-medium"
            >
              Agregar primer gasto
            </button>
          </div>
        ) : (
          <div className="-mx-5 overflow-hidden">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                description={tx.description}
                date={formatDate(tx.date, 'd MMM')}
                category={tx.categories?.name}
                iconName={tx.categories?.icon ?? null}
                amount={formatCurrency(tx.amount, tx.currencies?.code || 'PEN')}
                type={tx.type as 'income' | 'expense'}
                onEdit={() => openEditTxSheet(tx)}
              />
            ))}
          </div>
        )}
      </div>
      {/* Edit trip sheet */}
      <BottomSheet isOpen={editSheetOpen} onClose={() => setEditSheetOpen(false)} title="Editar viaje">
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn('relative h-36 rounded-[14px] border-2 border-dashed cursor-pointer transition-colors overflow-hidden', coverPreview ? 'border-transparent' : 'border-border hover:border-border-focus bg-bg-input')}
          >
            {coverPreview ? (
              <>
                <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                <button type="button" onClick={(e) => { e.stopPropagation(); setCoverImage(null); setCoverPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full">
                  <X size={14} className="text-white" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-text3">
                <Upload size={24} />
                <span className="text-[13px]">Cambiar portada</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCoverImage(f); const r = new FileReader(); r.onloadend = () => setCoverPreview(r.result as string); r.readAsDataURL(f); }}} className="hidden" />
          </div>
          <Input label="Nombre" error={errors.name?.message} {...register('name')} />
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-text3 mb-1.5">Descripción (opcional)</label>
            <textarea rows={2} className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-[14px] text-text1 placeholder:text-text3 focus:outline-none focus:border-border-focus text-[13px] transition-colors" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Inicio" type="date" {...register('start_date')} />
            <Input label="Fin" type="date" {...register('end_date')} />
          </div>
          <Select label="Estado" {...register('status')}>
            <option value="active">Activo</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </Select>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditSheetOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isSaving || isUploading}>Guardar</Button>
          </div>
        </form>
      </BottomSheet>

      {/* Delete confirm modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Eliminar viaje" size="sm">
        <div className="space-y-4">
          <p className="text-[14px] text-text2">¿Eliminar <span className="font-semibold text-text1">{trip?.name}</span>? Las transacciones se mantendrán sin viaje asignado.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteModalOpen(false)} className="flex-1 h-11 rounded-[12px] bg-bg-input border border-border text-text2 text-[13px] font-medium hover:border-border-focus transition-colors">Cancelar</button>
            <button onClick={handleDelete} disabled={isDeleting} className="flex-1 h-11 rounded-[12px] bg-[#FF4444] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
