'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormData } from '@/lib/validations/transaction.schema';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from 'sonner';
import { useCurrencies } from '@/lib/hooks/useCurrencies';
import { useCategories } from '@/lib/hooks/useCategories';
import { useTags } from '@/lib/hooks/useTags';
import { useTrips } from '@/lib/hooks/useTrips';
import { TrendingDown, TrendingUp, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface NewTransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultTripId?: string | null;
}

export function NewTransactionForm({ onSuccess, onCancel, defaultTripId }: NewTransactionFormProps) {
  return (
    <Suspense fallback={<div className="space-y-4 animate-pulse">{[1,2,3,4].map(i=><div key={i} className="h-12 rounded-[14px] bg-bg-input"/>)}</div>}>
      <FormInner onSuccess={onSuccess} onCancel={onCancel} defaultTripId={defaultTripId} />
    </Suspense>
  );
}

function FormInner({ onSuccess, onCancel, defaultTripId }: NewTransactionFormProps) {
  const searchParams = useSearchParams();
  const tripIdFromUrl = defaultTripId ?? searchParams.get('trip');

  const [isLoading, setIsLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagValue, setNewTagValue] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  const { currencies } = useCurrencies();
  const { categories } = useCategories();
  const { tags, refetch: refetchTags } = useTags();
  const { activeTrips } = useTrips();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      category_id: null,
      trip_id: tripIdFromUrl || null,
      notes: null,
    },
  });

  useEffect(() => {
    if (tripIdFromUrl) setValue('trip_id', tripIdFromUrl);
  }, [tripIdFromUrl, setValue]);

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const createAndSelectTag = async () => {
    const name = newTagValue.trim();
    if (!name) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('subcategories')
      .insert({ name, user_id: user.id })
      .select('id')
      .single();
    if (!error && data) {
      await refetchTags();
      setSelectedTagIds((prev) => [...prev, data.id]);
    }
    setNewTagValue('');
    setShowNewTagInput(false);
  };

  const setType = (type: 'expense' | 'income') => {
    setTransactionType(type);
    setValue('type', type);
  };

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('No estás autenticado'); return; }

      const { data: tx, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: data.type,
          amount: data.amount,
          currency_id: data.currency_id,
          category_id: data.type === 'expense' ? data.category_id : null,
          trip_id: data.trip_id,
          description: data.description,
          date: data.date,
          notes: data.notes,
        })
        .select('id')
        .single();

      if (error) throw error;

      if (selectedTagIds.length > 0) {
        await supabase.from('transaction_tags').insert(
          selectedTagIds.map((tagId) => ({ transaction_id: tx.id, subcategory_id: tagId }))
        );
      }

      toast.success('Transacción creada');
      onSuccess?.();
    } catch {
      toast.error('Error al crear transacción');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Segmented control */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-text3 mb-2">
          Tipo
        </label>
        <div className="flex rounded-[14px] border border-border bg-bg p-1">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={cn(
              'flex-1 h-10 rounded-[10px] flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-all',
              transactionType === 'expense' ? 'bg-[rgba(255,107,107,0.18)] text-[#FF6B6B]' : 'text-text3'
            )}
          >
            <TrendingDown size={14} />
            Gasto
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={cn(
              'flex-1 h-10 rounded-[10px] flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-all',
              transactionType === 'income' ? 'bg-accent/15 text-accent' : 'text-text3'
            )}
          >
            <TrendingUp size={14} />
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
            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
          />
        )}
      />

      <Select label="Moneda" error={errors.currency_id?.message} {...register('currency_id')}>
        <option value="">Selecciona una moneda</option>
        {currencies.map((c) => (
          <option key={c.id} value={c.id}>{c.symbol} — {c.name}</option>
        ))}
      </Select>

      <Input
        label="Descripción"
        placeholder="¿En qué gastaste?"
        error={errors.description?.message}
        {...register('description')}
      />

      <Input label="Fecha" type="date" error={errors.date?.message} {...register('date')} />

      {/* Category (expense only) */}
      {transactionType === 'expense' && (
        <Select label="Categoría" error={errors.category_id?.message} {...register('category_id')}>
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      )}

      {/* Tags / chips (expense only) */}
      {transactionType === 'expense' && (
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-text3 mb-2">
            Tags (opcional)
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'h-8 px-3 rounded-full text-[13px] font-medium border transition-all',
                    selected
                      ? 'bg-accent/15 text-accent border-accent/40'
                      : 'bg-bg-input text-text2 border-border hover:border-border-focus'
                  )}
                >
                  {selected && <span className="mr-1">✓</span>}
                  {tag.name}
                </button>
              );
            })}

            {showNewTagInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); createAndSelectTag(); }
                    if (e.key === 'Escape') { setShowNewTagInput(false); setNewTagValue(''); }
                  }}
                  placeholder="Nuevo tag..."
                  className="h-8 px-3 rounded-full text-[13px] bg-bg-input border border-border-focus text-text1 placeholder:text-text3 focus:outline-none w-32"
                />
                <button
                  type="button"
                  onClick={createAndSelectTag}
                  className="h-8 w-8 rounded-full bg-accent/15 text-accent flex items-center justify-center hover:bg-accent/25 transition-colors"
                >
                  <Plus size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewTagInput(false); setNewTagValue(''); }}
                  className="h-8 w-8 rounded-full bg-bg-input text-text3 flex items-center justify-center hover:text-text1 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewTagInput(true)}
                className="h-8 px-3 rounded-full text-[13px] font-medium border border-dashed border-border text-text3 hover:border-border-focus hover:text-text2 transition-all flex items-center gap-1"
              >
                <Plus size={12} />
                Nuevo
              </button>
            )}
          </div>
        </div>
      )}

      {activeTrips.length > 0 && (
        <Select label="Viaje (opcional)" {...register('trip_id')}>
          <option value="">Sin viaje</option>
          {activeTrips.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
      )}

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-text3 mb-1.5">
          Notas (opcional)
        </label>
        <textarea
          rows={2}
          className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-[14px] text-[14px] text-text1 placeholder:text-text3 focus:outline-none focus:border-border-focus transition-colors"
          placeholder="Notas adicionales..."
          {...register('notes')}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 rounded-[14px] bg-bg-input text-text2 font-semibold hover:opacity-80 transition-opacity"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'flex-[2] h-12 rounded-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50',
            transactionType === 'expense' ? 'bg-[#FF6B6B] text-white' : 'bg-accent text-bg'
          )}
        >
          {isLoading ? 'Creando...' : 'Crear transacción'}
        </button>
      </div>
    </form>
  );
}
