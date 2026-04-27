'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripSchema, type TripFormData } from '@/lib/validations/trip.schema';
import { useTrips } from '@/lib/hooks/useTrips';
import { createClient } from '@/lib/supabase/client';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { TripCardLarge } from '@/components/trips/TripCardLarge';
import { TripCardVertical } from '@/components/trips/TripCardVertical';
import { PageHeader } from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import Link from 'next/link';
import { Plus, Upload, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trip } from '@/types';

const CHIPS = ['Todos', 'Activos', 'Completados', 'Cancelados'];

const GRADIENTS = [
  'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
  'linear-gradient(135deg, #0e2a3a, #1a5a7a)',
  'linear-gradient(135deg, #1a1a2e, #2d2d5e)',
  'linear-gradient(135deg, #2d1b00, #6b3f00)',
  'linear-gradient(135deg, #3a1000, #6b2200)',
  'linear-gradient(135deg, #1a0a2e, #3a1a60)',
  'linear-gradient(135deg, #0a2e0a, #1a601a)',
];

function formatTripDates(start: string | null, end: string | null): string {
  if (!start) return 'Sin fechas definidas';
  const s = new Date(start + 'T00:00:00');
  if (!end) return format(s, 'MMM yyyy', { locale: es });
  const e = new Date(end + 'T00:00:00');
  const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return `${format(s, 'd MMM', { locale: es })} — ${format(e, 'd MMM yyyy', { locale: es })} · ${days} día${days !== 1 ? 's' : ''}`;
}

function tripGradient(trip: Trip, index: number): string {
  return GRADIENTS[index % GRADIENTS.length];
}

export default function TripsPage() {
  const { trips, activeTrips, completedTrips, cancelledTrips, isLoading, refetch } = useTrips();

  const [activeChip, setActiveChip] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showAllTrips, setShowAllTrips] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filterOpen]);

  const sectionTrips: Trip[] =
    activeChip === 'Todos' ? trips
    : activeChip === 'Activos' ? activeTrips
    : activeChip === 'Completados' ? completedTrips
    : activeChip === 'Cancelados' ? cancelledTrips
    : trips;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: { name: '', description: null, start_date: null, end_date: null, status: 'active' },
  });

  const openModal = () => {
    setCoverImage(null);
    setCoverPreview(null);
    reset({ name: '', description: null, start_date: null, end_date: null, status: 'active' });
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, tripId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const { error } = await supabase.storage
        .from('trip-covers')
        .upload(`${tripId}.${ext}`, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('trip-covers').getPublicUrl(`${tripId}.${ext}`);
      return publicUrl;
    } catch {
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: TripFormData) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('No estás autenticado'); return; }

      const { data: newTrip, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description || null,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          status: data.status,
        })
        .select()
        .single();
      if (error) throw error;

      if (coverImage && newTrip) {
        const url = await uploadImage(coverImage, newTrip.id);
        if (url) await supabase.from('trips').update({ cover_image: url }).eq('id', newTrip.id);
      }

      toast.success('Viaje creado');
      setShowModal(false);
      refetch();
    } catch {
      toast.error('Error al guardar viaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto lg:max-w-none space-y-4 animate-pulse">
        <div className="h-9 rounded-[14px] bg-bg-input w-32" />
        <div className="h-[200px] rounded-[22px] bg-bg-input" />
        <div className="h-[200px] rounded-[22px] bg-bg-input" />
      </div>
    );
  }

  const displayedTrips = showAllTrips ? sectionTrips : sectionTrips.slice(0, 2);

  return (
    <div className="max-w-lg mx-auto lg:max-w-none">
      <PageHeader title="Viajes" />

      {/* Section header with filter dropdown + Ver todos/menos */}
      <div className="flex items-center justify-between px-1 mb-3 mt-6">
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="flex items-center gap-1.5 text-[15px] font-semibold text-text1"
          >
            {activeChip === 'Todos' ? 'Todos los viajes' : activeChip}
            <ChevronDown
              size={15}
              className={cn('text-text3 transition-transform mt-0.5', filterOpen && 'rotate-180')}
            />
          </button>
          {filterOpen && (
            <div className="absolute left-0 top-full mt-2 z-50 bg-bg border border-border rounded-[16px] shadow-xl overflow-hidden min-w-[160px]">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => { setActiveChip(chip); setShowAllTrips(false); setFilterOpen(false); }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-[13px] transition-colors',
                    activeChip === chip ? 'text-accent bg-accent/8' : 'text-text2 hover:bg-bg-input/60'
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
        {sectionTrips.length > 2 && (
          <button
            onClick={() => setShowAllTrips((v) => !v)}
            className="text-[13px] font-medium text-accent"
          >
            {showAllTrips ? 'Ver menos' : 'Ver todos'}
          </button>
        )}
      </div>

      {/* Trip list */}
      <div className="flex flex-col gap-3.5 mb-6">
        {displayedTrips.map((t, i) => (
          <TripCardLarge
            key={t.id}
            name={t.name}
            dates={formatTripDates(t.start_date, t.end_date)}
            totalSpent="—"
            status={t.status}
            gradient={tripGradient(t, i)}
            href={`/dashboard/trips/${t.id}`}
          />
        ))}
        {sectionTrips.length === 0 && (
          <div className="py-10 text-center rounded-[22px] bg-bg-input/40 border border-border">
            <p className="text-text3 text-[13px]">Sin viajes en esta categoría</p>
          </div>
        )}
        <button
          onClick={openModal}
          className="rounded-[22px] border-2 border-dashed border-border flex items-center justify-center gap-2 text-text3 hover:text-text2 hover:border-border-focus transition-colors py-7"
        >
          <Plus size={18} strokeWidth={1.5} />
          <span className="text-[14px] font-medium">Nuevo viaje</span>
        </button>
      </div>

      {/* Completed trips — horizontal scroll */}
      {completedTrips.length > 0 && (
        <>
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-[15px] font-semibold text-text1">Completados</h2>
            <Link href="/dashboard/trips/completed" className="text-[13px] font-medium text-accent">
              Ver todos
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
            {completedTrips.slice(0, 5).map((t, i) => (
              <TripCardVertical
                key={t.id}
                name={t.name}
                dates={formatTripDates(t.start_date, t.end_date)}
                total="—"
                emoji="✈️"
                gradient={tripGradient(t, i)}
                href={`/dashboard/trips/${t.id}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Create BottomSheet */}
      <BottomSheet isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo viaje">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Cover image */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative h-40 rounded-[14px] border-2 border-dashed cursor-pointer transition-colors overflow-hidden',
              coverPreview
                ? 'border-transparent'
                : 'border-border hover:border-border-focus bg-bg-input'
            )}
          >
            {coverPreview ? (
              <>
                <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCoverImage(null); setCoverPreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full"
                >
                  <X size={16} className="text-white" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-text3">
                <Upload size={28} />
                <span className="text-[13px]">Subir imagen de portada</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <Input
            label="Nombre del viaje"
            placeholder="Huaraz 2025, Cumpleaños, etc."
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-text3 mb-1.5">
              Descripción (opcional)
            </label>
            <textarea
              rows={2}
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-[14px] text-text1 placeholder:text-text3 focus:outline-none focus:border-border-focus text-[13px] transition-colors"
              placeholder="Descripción del viaje..."
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicio" type="date" {...register('start_date')} />
            <Input label="Fecha fin" type="date" {...register('end_date')} />
          </div>

          <Select label="Estado" {...register('status')}>
            <option value="active">Activo</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </Select>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting || isUploading}>
              Crear
            </Button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
