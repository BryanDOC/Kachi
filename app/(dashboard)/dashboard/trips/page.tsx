'use client';

import { useState, useRef } from 'react';
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
import { Plus, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// ── MOCK DATA — reemplazar con useTrips() cuando esté listo ──
const MOCK_ACTIVE = [
  {
    id: 'mock-huaraz',
    name: 'Huaraz',
    dates: '10 — 20 Abr 2026',
    totalSpent: 'S/ 348.50',
    status: 'active' as const,
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
  },
  {
    id: 'mock-mancora',
    name: 'Máncora',
    dates: 'Ago 2026 · planeando',
    totalSpent: 'S/ 0.00',
    status: 'active' as const,
    emoji: '🌊',
    gradient: 'linear-gradient(135deg, #0e2a3a, #1a5a7a)',
  },
];

const MOCK_COMPLETED = [
  { id: 'mock-lima', name: 'Lima — Navidad', dates: 'Dic 2025 · 8 días', total: 'S/ 1,240', emoji: '🌇', gradient: 'linear-gradient(135deg, #1a1a2e, #2d2d5e)' },
  { id: 'mock-nazca', name: 'Nazca', dates: 'Oct 2025 · 3 días', total: 'S/ 520', emoji: '🏜️', gradient: 'linear-gradient(135deg, #2d1b00, #6b3f00)' },
  { id: 'mock-cusco', name: 'Cusco', dates: 'Jul 2025 · 5 días', total: 'S/ 890', emoji: '🏛️', gradient: 'linear-gradient(135deg, #3a1000, #6b2200)' },
  { id: 'mock-areq', name: 'Arequipa', dates: 'Mar 2025 · 4 días', total: 'S/ 650', emoji: '🌋', gradient: 'linear-gradient(135deg, #1a0a2e, #3a1a60)' },
  { id: 'mock-iqui', name: 'Iquitos', dates: 'Ene 2025 · 6 días', total: 'S/ 1,100', emoji: '🌿', gradient: 'linear-gradient(135deg, #0a2e0a, #1a601a)' },
];

const CHIPS = ['Todos', 'Activos', 'Completados', 'Cancelados'];
// ─────────────────────────────────────────────────────────────

export default function TripsPage() {
  const { refetch } = useTrips();
  const [activeChip, setActiveChip] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const {
        data: { publicUrl },
      } = supabase.storage.from('trip-covers').getPublicUrl(`${tripId}.${ext}`);
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('No estás autenticado');
        return;
      }

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

  return (
    <div className="max-w-lg mx-auto lg:max-w-none">
      <PageHeader
        title="Viajes"
        action={
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[12px] bg-accent text-bg text-[13px] font-semibold transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={2.5} />
            Nuevo
          </button>
        }
      />

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={cn(
              'h-[34px] px-4 rounded-full text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-all',
              activeChip === chip ? 'bg-accent/15 text-accent' : 'bg-bg-input/60 text-text3'
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Active trips */}
      <p className="text-[12px] font-semibold text-text3 uppercase tracking-[0.5px] mb-3">Activos</p>
      <div className="flex flex-col gap-3.5 mb-6">
        {MOCK_ACTIVE.map((t) => (
          <TripCardLarge
            key={t.id}
            name={t.name}
            dates={t.dates}
            totalSpent={t.totalSpent}
            status={t.status}
            emoji={t.emoji}
            gradient={t.gradient}
            href={`/dashboard/trips/${t.id}`}
          />
        ))}
      </div>

      {/* Completed trips */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold text-text3 uppercase tracking-[0.5px]">Completados</p>
        <Link href="/dashboard/trips/completed" className="text-[12px] text-accent">
          Ver todos
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
        {MOCK_COMPLETED.slice(0, 5).map((t) => (
          <TripCardVertical
            key={t.id}
            name={t.name}
            dates={t.dates}
            total={t.total}
            emoji={t.emoji}
            gradient={t.gradient}
            href={`/dashboard/trips/${t.id}`}
          />
        ))}
      </div>

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
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverImage(null);
                    setCoverPreview(null);
                  }}
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
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-[14px] text-text1 placeholder:text-text3 focus:outline-none focus:border-border-focus text-[14px] transition-colors"
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
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isSubmitting || isUploading}
            >
              Crear
            </Button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
