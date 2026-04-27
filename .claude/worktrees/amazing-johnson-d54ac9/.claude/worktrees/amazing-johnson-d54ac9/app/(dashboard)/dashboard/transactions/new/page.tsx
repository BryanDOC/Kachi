'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormData } from '@/lib/validations/transaction.schema';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCurrencies } from '@/lib/hooks/useCurrencies';
import { useCategories } from '@/lib/hooks/useCategories';
import { useSubcategories } from '@/lib/hooks/useSubcategories';
import { useTrips } from '@/lib/hooks/useTrips';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function NewTransactionPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto">
          <div className="h-64 bg-zinc-900 rounded-2xl animate-pulse" />
        </div>
      }
    >
      <NewTransactionForm />
    </Suspense>
  );
}

function NewTransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripIdFromUrl = searchParams.get('trip');

  const [isLoading, setIsLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { currencies } = useCurrencies();
  const { categories } = useCategories();
  const { subcategories } = useSubcategories(selectedCategoryId);
  const { activeTrips } = useTrips();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      category_id: null,
      subcategory_id: null,
      trip_id: tripIdFromUrl || null,
      notes: null,
    },
  });

  useEffect(() => {
    if (tripIdFromUrl) {
      setValue('trip_id', tripIdFromUrl);
    }
  }, [tripIdFromUrl, setValue]);

  const categoryId = watch('category_id');

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('No estás autenticado');
        return;
      }

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: data.type,
        amount: data.amount,
        currency_id: data.currency_id,
        category_id: data.type === 'expense' ? data.category_id : null,
        subcategory_id: data.type === 'expense' ? data.subcategory_id : null,
        trip_id: data.trip_id,
        description: data.description,
        date: data.date,
        notes: data.notes,
      });

      if (error) {
        toast.error('Error al crear transacción');
        console.error(error);
      } else {
        toast.success('Transacción creada correctamente');
        if (tripIdFromUrl) {
          router.push(`/dashboard/trips/${tripIdFromUrl}`);
        } else {
          router.push('/dashboard/transactions');
        }
        router.refresh();
      }
    } catch {
      toast.error('Error al crear transacción');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/transactions"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
      >
        <h1 className="text-2xl font-serif font-bold text-white mb-6">Nueva transacción</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Tipo</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setTransactionType('expense');
                  register('type').onChange({ target: { value: 'expense' } });
                }}
                className={cn(
                  'flex-1 py-3 rounded-lg font-medium transition-all',
                  transactionType === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                )}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransactionType('income');
                  register('type').onChange({ target: { value: 'income' } });
                }}
                className={cn(
                  'flex-1 py-3 rounded-lg font-medium transition-all',
                  transactionType === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                )}
              >
                Ingreso
              </button>
            </div>
            <input type="hidden" {...register('type')} value={transactionType} />
          </div>

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Monto"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.amount?.message}
                className="text-3xl font-serif py-4"
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />

          <Select label="Moneda" error={errors.currency_id?.message} {...register('currency_id')}>
            <option value="">Selecciona una moneda</option>
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.id}>
                {currency.symbol} - {currency.name}
              </option>
            ))}
          </Select>

          <Input
            label="Descripción"
            placeholder="¿En qué gastaste?"
            error={errors.description?.message}
            {...register('description')}
          />

          <Input label="Fecha" type="date" error={errors.date?.message} {...register('date')} />

          {transactionType === 'expense' && (
            <>
              <Select
                label="Categoría"
                error={errors.category_id?.message}
                {...register('category_id', {
                  onChange: (e) => setSelectedCategoryId(e.target.value || null),
                })}
              >
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              {categoryId && subcategories.length > 0 && (
                <Select
                  label="Subcategoría (opcional)"
                  error={errors.subcategory_id?.message}
                  {...register('subcategory_id')}
                >
                  <option value="">Sin subcategoría</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </Select>
              )}
            </>
          )}

          {activeTrips.length > 0 && (
            <Select label="Viaje (opcional)" {...register('trip_id')}>
              <option value="">Sin viaje</option>
              {activeTrips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.name}
                </option>
              ))}
            </Select>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              rows={3}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              placeholder="Notas adicionales..."
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
              Crear transacción
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
