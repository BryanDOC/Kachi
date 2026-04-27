'use client';

import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fixedExpenseSchema, type FixedExpenseFormData } from '@/lib/validations/fixedExpense.schema';
import { useFixedExpenses } from '@/lib/hooks/useFixedExpenses';
import { useCurrencies } from '@/lib/hooks/useCurrencies';
import { useCategories } from '@/lib/hooks/useCategories';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils/currency';
import { extractDominantColor } from '@/lib/utils/colorExtractor';
import { EXPENSE_SUGGESTIONS, type ExpenseSuggestion } from '@/lib/data/fixedExpenseSuggestions';
import { FixedExpenseWithRelations } from '@/types';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FixedExpenseCard } from '@/components/fixed/FixedExpenseCard';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, ImagePlus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function FixedExpensesPage() {
  const { fixedExpenses, isLoading, refetch, totalActiveAmount } = useFixedExpenses();
  const { currencies } = useCurrencies();
  const { categories } = useCategories();

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpenseWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showAllActive, setShowAllActive] = useState(false);

  // Logo & brand color state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggestions
  const [suggestions, setSuggestions] = useState<ExpenseSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FixedExpenseFormData>({
    resolver: zodResolver(fixedExpenseSchema),
    defaultValues: { name: '', amount: 0, currency_id: '', category_id: null, billing_day: null, notes: null },
  });

  const openCreateModal = () => {
    setEditingExpense(null);
    setLogoUrl(null);
    setBrandColor(null);
    setSuggestions([]);
    setShowSuggestions(false);
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
    setLogoUrl(expense.logo_url ?? null);
    setBrandColor(expense.brand_color ?? null);
    setSuggestions([]);
    setShowSuggestions(false);
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length >= 1) {
      const filtered = EXPENSE_SUGGESTIONS.filter((s) =>
        s.name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: ExpenseSuggestion) => {
    setValue('name', suggestion.name);
    setBrandColor(suggestion.brandColor);
    if (suggestion.logoUrl) setLogoUrl(suggestion.logoUrl);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleLogoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split('.').pop() || 'png';
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from('logos').upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;
      setLogoUrl(publicUrl);

      const color = await extractDominantColor(publicUrl);
      setBrandColor(color);
    } catch {
      toast.error('Error al subir logo');
    } finally {
      setIsUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoUrl(null);
  };

  const onSubmit = async (data: FixedExpenseFormData) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('No estás autenticado'); return; }

      const payload = {
        name: data.name,
        amount: data.amount,
        currency_id: data.currency_id,
        category_id: data.category_id || null,
        billing_day: data.billing_day,
        notes: data.notes,
        logo_url: logoUrl,
        brand_color: brandColor,
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('fixed_expenses')
          .update({ ...payload, last_updated: new Date().toISOString() })
          .eq('id', editingExpense.id);
        if (error) throw error;
        toast.success('Gasto fijo actualizado');
      } else {
        const { error } = await supabase
          .from('fixed_expenses')
          .insert({ ...payload, user_id: user.id, is_active: true });
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
      toast.success(expense.is_active ? 'Desactivado' : 'Activado');
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
      <div className="space-y-4 animate-pulse">
        <div className="h-[88px] rounded-[18px] bg-bg-input" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (<div key={i} className="h-[164px] rounded-[18px] bg-bg-input" />))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto lg:max-w-none space-y-5">
      <PageHeader
        title="Gastos Fijos"
        subtitle="Suscripciones y recurrentes"
      />

      {/* Summary banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-[18px] px-5 py-4 bg-accent/8 border border-accent/15"
      >
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.5px] text-accent/70 mb-1">
            Total mensual activo
          </p>
          <p className="font-sans text-[24px] font-bold text-accent tabular-nums">
            {formatCurrency(totalActiveAmount, currencies[0]?.code || 'PEN')}
          </p>
          <p className="text-[12px] text-accent/50 mt-0.5">
            {activeExpenses.length} gasto{activeExpenses.length !== 1 ? 's' : ''} activo{activeExpenses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-accent/8 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 13l4-4 3 3 5-7" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.div>

      {/* Active */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-text1">Activos</h2>
        {activeExpenses.length > 3 && (
          <button
            onClick={() => setShowAllActive((v) => !v)}
            className="text-[13px] font-medium text-accent"
          >
            {showAllActive ? 'Ver menos' : 'Ver todos'}
          </button>
        )}
      </div>
      <AnimatePresence>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {(showAllActive ? activeExpenses : activeExpenses.slice(0, 3)).map((expense, index) => (
            <FixedExpenseCard
              key={expense.id}
              expense={expense}
              index={index}
              onEdit={() => openEditModal(expense)}
              onToggle={() => toggleActive(expense)}
              isToggling={togglingId === expense.id}
            />
          ))}
          <button
            onClick={openCreateModal}
            className="rounded-[18px] border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-text3 hover:text-text2 hover:border-border-focus transition-colors"
            style={{ minHeight: 164 }}
          >
            <Plus size={20} strokeWidth={1.5} />
            <span className="text-[13px] font-medium">Nuevo</span>
          </button>
        </div>
      </AnimatePresence>

      {/* Inactive */}
      {inactiveExpenses.length > 0 && (
        <>
          <h2 className="text-[15px] font-semibold text-text1 mt-2">Inactivos</h2>
          <AnimatePresence>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
            </div>
          </AnimatePresence>
        </>
      )}

      {/* BottomSheet */}
      <BottomSheet
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingExpense ? 'Editar gasto fijo' : 'Nuevo gasto fijo'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Logo upload */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-text3 mb-2">
              Logo (opcional)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={cn(
                  'w-[56px] h-[56px] rounded-[14px] flex items-center justify-center border-2 border-dashed transition-colors flex-shrink-0',
                  logoUrl
                    ? 'border-transparent overflow-hidden p-0'
                    : 'border-border hover:border-border-focus bg-bg-input/50'
                )}
              >
                {isUploading ? (
                  <Loader2 size={20} className="text-text3 animate-spin" />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
                ) : (
                  <ImagePlus size={20} className="text-text3" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                {logoUrl ? (
                  <div className="flex items-center gap-2">
                    {brandColor && (
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: brandColor }} />
                    )}
                    <span className="text-[13px] text-text2 truncate">Logo subido</span>
                    <button type="button" onClick={removeLogo} className="text-text3 hover:text-[#FF6B6B] transition-colors flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="text-[13px] text-text3">
                    Sube el logo para personalizar el card
                  </p>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
                e.target.value = '';
              }}
            />
          </div>

          {/* Name with suggestions */}
          <div className="relative">
            <Input
              label="Nombre"
              placeholder="Netflix, Luz, Spotify..."
              error={errors.name?.message}
              {...register('name', { onChange: handleNameChange })}
              autoComplete="off"
            />
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 right-0 top-full mt-1 z-50 rounded-[14px] bg-bg border border-border shadow-xl overflow-hidden"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => selectSuggestion(s)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-input/60 transition-colors text-left"
                    >
                      {s.logoUrl ? (
                        <img
                          src={s.logoUrl}
                          alt={s.name}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          className="w-6 h-6 rounded-[6px] object-contain flex-shrink-0 bg-white"
                        />
                      ) : (
                        <div
                          className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[13px] flex-shrink-0"
                          style={{ backgroundColor: s.brandColor + '22' }}
                        >
                          {s.emoji}
                        </div>
                      )}
                      <span className="text-[14px] text-text1">{s.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  label="Monto"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.amount?.message}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    field.onChange(raw === '' ? undefined : parseFloat(raw));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
            <Select label="Moneda" error={errors.currency_id?.message} {...register('currency_id')}>
              <option value="">Selecciona</option>
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>{c.symbol} - {c.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <Select label="Categoría (opcional)" {...register('category_id')}>
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-text3 mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              rows={2}
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-[14px] text-text1 placeholder:text-text3 focus:outline-none focus:border-border-focus text-[13px] transition-colors"
              placeholder="Notas adicionales..."
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
              {editingExpense ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
