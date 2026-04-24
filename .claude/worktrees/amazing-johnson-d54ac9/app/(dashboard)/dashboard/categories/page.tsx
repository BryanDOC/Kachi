'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import {
  type LucideIcon,
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  Car,
  ShoppingCart,
  Utensils,
  Gamepad2,
  Heart,
  BookOpen,
  Home,
  Shirt,
  Plane,
  Coffee,
  DollarSign,
  Briefcase,
  Music,
  Tv,
  Globe,
  Package,
  Gift,
  Fuel,
  Train,
  Dumbbell,
  GraduationCap,
  ShoppingBag,
  Zap,
  Camera,
  Laptop,
  Wallet,
  Receipt,
  Stethoscope,
  Baby,
  Star,
  Pizza,
} from 'lucide-react';
import { Category, Subcategory } from '@/types';

interface CategoryWithSubs extends Category {
  subcategories: Subcategory[];
}

const COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
];

const ICONS: Record<string, LucideIcon> = {
  Car,
  ShoppingCart,
  Utensils,
  Gamepad2,
  Heart,
  BookOpen,
  Home,
  Shirt,
  Plane,
  Coffee,
  DollarSign,
  Briefcase,
  Music,
  Tv,
  Globe,
  Package,
  Gift,
  Fuel,
  Train,
  Dumbbell,
  GraduationCap,
  ShoppingBag,
  Zap,
  Camera,
  Laptop,
  Wallet,
  Receipt,
  Stethoscope,
  Baby,
  Star,
  Pizza,
};

function CategoryIcon({
  name,
  size = 18,
  className,
  style,
}: {
  name: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = (name && ICONS[name]) || Package;
  return <Icon size={size} className={className} style={style} />;
}

interface CatFormState {
  name: string;
  color: string;
  icon: string;
  budgetLimit: string;
}

const EMPTY_FORM: CatFormState = {
  name: '',
  color: COLORS[0],
  icon: 'Package',
  budgetLimit: '',
};

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; category: CategoryWithSubs }
  | { type: 'delete'; category: CategoryWithSubs }
  | null;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<CatFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  // Subcategory inline state
  const [addSubCatId, setAddSubCatId] = useState<string | null>(null);
  const [addSubValue, setAddSubValue] = useState('');
  const [editSubId, setEditSubId] = useState<string | null>(null);
  const [editSubValue, setEditSubValue] = useState('');

  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*, subcategories(*)')
      .order('name');
    if (error) {
      toast.error('Error al cargar categorías');
    } else {
      setCategories(
        (data || []).map((c: CategoryWithSubs) => ({
          ...c,
          subcategories: (c.subcategories || []).sort((a: Subcategory, b: Subcategory) =>
            a.name.localeCompare(b.name)
          ),
        }))
      );
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ type: 'add' });
  };

  const openEdit = (cat: CategoryWithSubs) => {
    setForm({
      name: cat.name,
      color: cat.color || COLORS[0],
      icon: cat.icon || 'Package',
      budgetLimit: cat.budget_limit ? String(cat.budget_limit) : '',
    });
    setModal({ type: 'edit', category: cat });
  };

  const saveCategory = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      color: form.color,
      icon: form.icon,
      budget_limit: form.budgetLimit ? parseFloat(form.budgetLimit) : null,
    };

    if (modal?.type === 'add') {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) {
        toast.error('Error al crear categoría');
      } else {
        toast.success('Categoría creada');
        setModal(null);
        fetchCategories();
      }
    } else if (modal?.type === 'edit') {
      const { error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', modal.category.id);
      if (error) {
        toast.error('Error al actualizar categoría');
      } else {
        toast.success('Categoría actualizada');
        setModal(null);
        fetchCategories();
      }
    }
    setSaving(false);
  };

  const deleteCategory = async (cat: CategoryWithSubs) => {
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', cat.id);

    if (count && count > 0) {
      toast.error(`No puedes eliminar "${cat.name}" — tiene ${count} transacciones asociadas`);
      setModal(null);
      return;
    }

    const { error } = await supabase.from('categories').delete().eq('id', cat.id);
    if (error) {
      toast.error('Error al eliminar categoría');
    } else {
      toast.success('Categoría eliminada');
      setModal(null);
      fetchCategories();
    }
  };

  const addSubcategory = async (categoryId: string) => {
    if (!addSubValue.trim()) return;
    const { error } = await supabase
      .from('subcategories')
      .insert({ name: addSubValue.trim(), category_id: categoryId });
    if (error) {
      toast.error('Error al agregar subcategoría');
    } else {
      setAddSubCatId(null);
      setAddSubValue('');
      fetchCategories();
    }
  };

  const saveSubcategory = async (subId: string) => {
    if (!editSubValue.trim()) return;
    const { error } = await supabase
      .from('subcategories')
      .update({ name: editSubValue.trim() })
      .eq('id', subId);
    if (error) {
      toast.error('Error al actualizar subcategoría');
    } else {
      setEditSubId(null);
      setEditSubValue('');
      fetchCategories();
    }
  };

  const deleteSubcategory = async (subId: string, name: string) => {
    const { error } = await supabase.from('subcategories').delete().eq('id', subId);
    if (error) {
      toast.error('Error al eliminar subcategoría');
    } else {
      toast.success(`"${name}" eliminada`);
      fetchCategories();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-zinc-900 rounded-lg animate-pulse w-48" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Categorías</h1>
          <p className="text-zinc-400">Gestiona tus categorías y subcategorías</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
        >
          <Plus size={18} />
          Nueva categoría
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Package size={40} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-400">No tienes categorías aún</p>
          <button
            onClick={openAdd}
            className="mt-4 text-amber-500 hover:text-amber-400 font-medium text-sm"
          >
            Crear primera categoría
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const expanded = expandedIds.has(cat.id);
            return (
              <div
                key={cat.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
              >
                {/* Category row */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => toggleExpand(cat.id)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
                  >
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>

                  {/* Color swatch + icon */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: (cat.color || '#71717a') + '33' }}
                  >
                    <CategoryIcon
                      name={cat.icon}
                      size={18}
                      className="flex-shrink-0"
                      style={{ color: cat.color || '#71717a' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color || '#71717a' }}
                      />
                      <span className="text-white font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-zinc-500">
                        {cat.subcategories.length} subcategoría
                        {cat.subcategories.length !== 1 ? 's' : ''}
                      </span>
                      {cat.budget_limit && (
                        <span className="text-xs text-amber-500">
                          Presupuesto: {formatCurrency(cat.budget_limit, 'PEN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setModal({ type: 'delete', category: cat })}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Subcategories expanded */}
                {expanded && (
                  <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-3 space-y-2">
                    {cat.subcategories.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-2 group">
                        {editSubId === sub.id ? (
                          <>
                            <input
                              autoFocus
                              value={editSubValue}
                              onChange={(e) => setEditSubValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveSubcategory(sub.id);
                                if (e.key === 'Escape') setEditSubId(null);
                              }}
                              className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-600 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                            />
                            <button
                              onClick={() => saveSubcategory(sub.id)}
                              className="p-1.5 text-green-400 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditSubId(null)}
                              className="p-1.5 text-zinc-500 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0 ml-1" />
                            <span className="flex-1 text-sm text-zinc-300">{sub.name}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditSubId(sub.id);
                                  setEditSubValue(sub.name);
                                }}
                                className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => deleteSubcategory(sub.id, sub.name)}
                                className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {/* Add subcategory inline */}
                    {addSubCatId === cat.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          autoFocus
                          value={addSubValue}
                          onChange={(e) => setAddSubValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addSubcategory(cat.id);
                            if (e.key === 'Escape') {
                              setAddSubCatId(null);
                              setAddSubValue('');
                            }
                          }}
                          placeholder="Nombre de subcategoría"
                          className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-600 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={() => addSubcategory(cat.id)}
                          className="p-1.5 text-green-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setAddSubCatId(null);
                            setAddSubValue('');
                          }}
                          className="p-1.5 text-zinc-500 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddSubCatId(cat.id);
                          setAddSubValue('');
                        }}
                        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-amber-500 transition-colors mt-1 ml-2"
                      >
                        <Plus size={12} />
                        Agregar subcategoría
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modal?.type === 'add' || modal?.type === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.type === 'add' ? 'Nueva categoría' : 'Editar categoría'}
        size="md"
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Alimentación"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: color }}
                >
                  {form.color === color && (
                    <Check
                      size={14}
                      className="absolute inset-0 m-auto text-white drop-shadow"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Ícono</label>
            <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {Object.keys(ICONS).map((iconName) => {
                const Icon = ICONS[iconName];
                return (
                  <button
                    key={iconName}
                    onClick={() => setForm((f) => ({ ...f, icon: iconName }))}
                    title={iconName}
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                      form.icon === iconName
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    )}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget limit */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Límite de presupuesto mensual{' '}
              <span className="text-zinc-500 font-normal">(opcional)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-sm">S/</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.budgetLimit}
                onChange={(e) => setForm((f) => ({ ...f, budgetLimit: e.target.value }))}
                placeholder="0.00"
                className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: form.color + '33' }}
            >
              <CategoryIcon name={form.icon} size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: form.color }}
                />
                <span className="text-white text-sm font-medium">
                  {form.name || 'Nombre de categoría'}
                </span>
              </div>
              {form.budgetLimit && (
                <span className="text-xs text-amber-500">
                  S/ {parseFloat(form.budgetLimit || '0').toLocaleString('es-PE', { minimumFractionDigits: 2 })} / mes
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setModal(null)}
              className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={saveCategory}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Guardando...' : modal?.type === 'add' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={modal?.type === 'delete'}
        onClose={() => setModal(null)}
        title="Eliminar categoría"
        size="sm"
      >
        {modal?.type === 'delete' && (
          <div className="space-y-4">
            <p className="text-zinc-300">
              ¿Eliminar la categoría{' '}
              <span className="text-white font-semibold">"{modal.category.name}"</span>? Esta
              acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteCategory(modal.category)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
