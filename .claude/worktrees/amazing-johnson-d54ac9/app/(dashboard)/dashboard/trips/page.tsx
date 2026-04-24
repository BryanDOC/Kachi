'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripSchema, type TripFormData } from '@/lib/validations/trip.schema';
import { useTrips } from '@/lib/hooks/useTrips';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils/currency';
import { Trip } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Calendar, Upload, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function TripsPage() {
  const { activeTrips, completedTrips, isLoading, refetch } = useTrips();
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
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
    defaultValues: {
      name: '',
      description: null,
      start_date: null,
      end_date: null,
      status: 'active',
    },
  });

  const openCreateModal = () => {
    setEditingTrip(null);
    setCoverImage(null);
    setCoverPreview(null);
    reset({
      name: '',
      description: null,
      start_date: null,
      end_date: null,
      status: 'active',
    });
    setShowModal(true);
  };

  const openEditModal = (trip: Trip) => {
    setEditingTrip(trip);
    setCoverImage(null);
    setCoverPreview(trip.cover_image);
    reset({
      name: trip.name,
      description: trip.description,
      start_date: trip.start_date,
      end_date: trip.end_date,
      status: trip.status,
    });
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, tripId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${tripId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-covers')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('trip-covers').getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
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

      if (editingTrip) {
        let coverUrl = editingTrip.cover_image;

        if (coverImage) {
          const uploadedUrl = await uploadImage(coverImage, editingTrip.id);
          if (uploadedUrl) coverUrl = uploadedUrl;
        }

        const { error } = await supabase
          .from('trips')
          .update({
            name: data.name,
            description: data.description || null,
            start_date: data.start_date || null,
            end_date: data.end_date || null,
            status: data.status,
            cover_image: coverUrl,
          })
          .eq('id', editingTrip.id);

        if (error) throw error;
        toast.success('Viaje actualizado');
      } else {
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
          const uploadedUrl = await uploadImage(coverImage, newTrip.id);
          if (uploadedUrl) {
            await supabase.from('trips').update({ cover_image: uploadedUrl }).eq('id', newTrip.id);
          }
        }

        toast.success('Viaje creado');
      }

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
      <div className="space-y-6">
        <div className="h-10 bg-zinc-900 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Viajes</h1>
          <p className="text-zinc-400">Organiza tus gastos por viaje o evento</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
        >
          <Plus size={20} />
          Nuevo viaje
        </button>
      </div>

      {activeTrips.length === 0 && completedTrips.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <MapPin size={48} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-500">No tienes viajes registrados</p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-amber-500 hover:text-amber-400 font-medium"
          >
            Crear primer viaje
          </button>
        </div>
      ) : (
        <>
          {activeTrips.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Viajes activos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {activeTrips.map((trip, index) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      index={index}
                      onEdit={() => openEditModal(trip)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {completedTrips.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-zinc-400 mb-4">Viajes completados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {completedTrips.map((trip, index) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      index={index}
                      onEdit={() => openEditModal(trip)}
                      completed
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}
        </>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTrip ? 'Editar viaje' : 'Nuevo viaje'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative h-40 rounded-lg border-2 border-dashed cursor-pointer transition-colors overflow-hidden',
              coverPreview
                ? 'border-transparent'
                : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900'
            )}
          >
            {coverPreview ? (
              <>
                <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverImage(null);
                    setCoverPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <Upload size={32} className="mb-2" />
                <span className="text-sm">Clic para subir imagen de portada</span>
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
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              rows={2}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
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

          <div className="flex gap-3 pt-4">
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
              {editingTrip ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TripCard({
  trip,
  index,
  onEdit,
  completed,
}: {
  trip: Trip;
  index: number;
  onEdit: () => void;
  completed?: boolean;
}) {
  const [totalSpent, setTotalSpent] = useState<number | null>(null);

  // Fetch total spent for this trip
  useState(() => {
    const fetchTotal = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('transactions')
        .select('amount')
        .eq('trip_id', trip.id)
        .eq('type', 'expense');

      if (data) {
        const total = data.reduce((sum, t) => sum + t.amount, 0);
        setTotalSpent(total);
      }
    };
    fetchTotal();
  });

  const formatDateRange = () => {
    if (!trip.start_date && !trip.end_date) return null;
    const start = trip.start_date
      ? new Date(trip.start_date).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })
      : '';
    const end = trip.end_date
      ? new Date(trip.end_date).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })
      : '';
    if (start && end) return `${start} - ${end}`;
    return start || end;
  };

  const statusConfig = {
    active: { label: 'Activo', color: 'bg-green-500' },
    completed: { label: 'Completado', color: 'bg-blue-500' },
    cancelled: { label: 'Cancelado', color: 'bg-zinc-500' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={cn('group relative rounded-xl overflow-hidden', completed && 'opacity-75')}
    >
      <Link href={`/dashboard/trips/${trip.id}`}>
        <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900">
          {trip.cover_image && (
            <Image
              src={trip.cover_image}
              alt={trip.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute top-3 right-3">
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-medium text-white',
                statusConfig[trip.status].color
              )}
            >
              {statusConfig[trip.status].label}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-serif font-bold text-white mb-1">{trip.name}</h3>
            {formatDateRange() && (
              <div className="flex items-center gap-1.5 text-zinc-300 text-sm mb-2">
                <Calendar size={14} />
                <span>{formatDateRange()}</span>
              </div>
            )}
            {totalSpent !== null && totalSpent > 0 && (
              <p className="text-amber-400 font-semibold">
                {formatCurrency(totalSpent, 'PEN')} gastado
              </p>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          onEdit();
        }}
        className="absolute top-3 left-3 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
      >
        <span className="text-white text-xs">Editar</span>
      </button>
    </motion.div>
  );
}
