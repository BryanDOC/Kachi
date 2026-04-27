'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  fixedExpenseSchema,
  type FixedExpenseFormData,
} from '@/lib/validations/fixedExpense.schema';
import { useFixedExpenses } from '@/lib/hooks/useFixedExpenses';
import { useCurrencies } from '@/lib/hooks/useCurrencies';
import { useCategories } from '@/lib/hooks/useCategories';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils/currency';
import { FixedExpenseWithRelations } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Edit2, Calendar, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FixedExpensesPage() {
  const { fixedExpenses, isLoading, refetch, totalActiveAmount } = useFixedExpenses();
  const { currencies } = useCurrencies();
  const { categories } = useCategories();

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpenseWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FixedExpenseFormData>({
    resolver: zodResolver(fixedExpenseSchema),
    defaultValues: {
      name: '',
      amount: 0,
      currency_id: '',
      category_id: null,
      billing_day: null,
      notes: null,
    },
  });

  const openCreateModal = () => {
    setEditingExpense(null);
    reset({
      name: '',
      amount: 0,
      currency_id: currencies[0]?.id || '',
      category_id: null,
      billing_day: null,
      notes: null,
    });
    setShowModal(true);
  };

  const openEditModal = (expense: FixedExpenseWithRelations) => {
    setEditingExpense(expense);
    reset({
      name: expense.name,
      amount: expense.amount,
      currency_id: expense.currency_id,
      category_id: expense.category_id,
      billing_day: expense.billing_day,
      notes: expense.notes,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: FixedExpenseFormData) => {
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

      if (editingExpense) {
        const { error } = await supabase
          .from('fixed_expenses')
          .update({
            name: data.name,
            amount: data.amount,
            currency_id: data.currency_id,
            category_id: data.category_id || null,
            billing_day: data.billing_day,
            notes: data.notes,
            last_updated: new Date().toISOString(),
          })
          .eq('id', editingExpense.id);

        if (error) throw error;
        toast.success('Gasto fijo actualizado');
      } else {
        const { error } = await supabase.from('fixed_expenses').insert({
          user_id: user.id,
          name: data.name,
          amount: data.amount,
          currency_id: data.currency_id,
          category_id: data.category_id || null,
          billing_day: data.billing_day,
          notes: data.notes,
          is_active: true,
        });

        if (error) throw error;
        toast.success('Gasto fijo creado');
      }

      setShowModal(false);
      refetch();
    } catch {
      toast.error('Error al guardar gasto fijo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (expense: FixedExpenseWithRelations) => {
    setTogglingId(expense.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('fixed_expenses')
        .update({ is_active: !expense.is_active })
        .eq('id', expense.id);

      if (error) throw error;
      toast.success(expense.is_active ? 'Gasto fijo desactivado' : 'Gasto fijo activado');
      refetch();
    } catch {
      toast.error('Error al cambiar estado');
    } finally {
      setTogglingId(null);
    }
  };

  const activeExpenses = fixedExpenses.filter((fe) => fe.is_active);
  const inactiveExpenses = fixedExpenses.filter((fe) => !fe.is_active);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-zinc-900 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Gastos Fijos</h1>
          <p className="text-zinc-400">Gestiona tus gastos recurrentes mensuales</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
        >
          <Plus size={20} />
          Nuevo
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-900/40 to-amber-950/40 border border-amber-800/50 rounded-xl p-6"
      >
        <p className="text-zinc-400 text-sm mb-1">Total de gastos fijos activos al mes</p>
        <p className="text-3xl font-serif font-bold text-white">
          {formatCurrency(totalActiveAmount, 'PEN')}
        </p>
        <p className="text-zinc-500 text-sm mt-2">
          {activeExpenses.length} gasto{activeExpenses.length !== 1 ? 's' : ''} activo
          {activeExpenses.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {activeExpenses.length === 0 && inactiveExpenses.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500">No tienes gastos fijos registrados</p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-amber-500 hover:text-amber-400 font-medium"
          >
            Crear primer gasto fijo
          </button>
        </div>
      ) : (
        <>
          {activeExpenses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {activeExpenses.map((expense, index) => (
                  <FixedExpenseCard
                    key={expense.id}
                    expense={expense}
                    index={index}
                    onEdit={() => openEditModal(expense)}
                    onToggle={() => toggleActive(expense)}
                    isToggling={togglingId === expense.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {inactiveExpenses.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-zinc-400 mb-4">Inactivos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {inactiveExpenses.map((expense, index) => (
                    <FixedExpenseCard
                      key={expense.id}
                      expense={expense}
                      index={index}
                      onEdit={() => openEditModal(expense)}
                      onToggle={() => toggleActive(expense)}
                      isToggling={togglingId === expense.id}
                      inactive
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingExpense ? 'Editar gasto fijo' : 'Nuevo gasto fijo'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Netflix, Luz, Spotify..."
            error={errors.name?.message}
            {...register('name')}
          />

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
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.id}>
                {currency.symbol} - {currency.name}
              </option>
            ))}
          </Select>

          <Select label="Categoría (opcional)" {...register('category_id')}>
            <option value="">Sin categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <Controller
            name="billing_day"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Día de cobro (1-31)"
                type="number"
                min={1}
                max={31}
                placeholder="15"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
              />
            )}
          />

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              rows={2}
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
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
              {editingExpense ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function FixedExpenseCard({
  expense,
  index,
  onEdit,
  onToggle,
  isToggling,
  inactive,
}: {
  expense: FixedExpenseWithRelations;
  index: number;
  onEdit: () => void;
  onToggle: () => void;
  isToggling: boolean;
  inactive?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'bg-zinc-900 border rounded-xl p-5 transition-all',
        inactive ? 'border-zinc-800 opacity-60' : 'border-zinc-800 hover:border-zinc-700'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className={cn('font-semibold text-lg', inactive ? 'text-zinc-500' : 'text-white')}>
          {expense.name}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onToggle}
            disabled={isToggling}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              expense.is_active
                ? 'text-green-500 hover:bg-green-500/10'
                : 'text-zinc-500 hover:bg-zinc-800'
            )}
          >
            {expense.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
        </div>
      </div>

      <p
        className={cn(
          'text-2xl font-serif font-bold mb-3',
          inactive ? 'text-zinc-500' : 'text-white'
        )}
      >
        {formatCurrency(expense.amount, expense.currencies?.code || 'PEN')}
      </p>

      <div className="space-y-2 text-sm">
        {expense.billing_day && (
          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar size={14} />
            <span>Se cobra el día {expense.billing_day} de cada mes</span>
          </div>
        )}
        {expense.categories && (
          <div className="flex items-center gap-2 text-zinc-400">
            <Tag size={14} />
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: (expense.categories.color || '#52525b') + '20',
                color: expense.categories.color || '#a1a1aa',
              }}
            >
              {expense.categories.name}
            </span>
          </div>
        )}
        {expense.notes && <p className="text-zinc-500 text-xs mt-2">{expense.notes}</p>}
      </div>
    </motion.div>
  );
}
