'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { PageHeader } from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import {
  type LucideIcon,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
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
}

const EMPTY_FORM: CatFormState = { name: '', color: COLORS[0], icon: 'Package' };

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; category: Category }
  | { type: 'delete'; category: Category }
  | null;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<CatFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTxCount, setDeleteTxCount] = useState<number | null>(null);
  const [addTagValue, setAddTagValue] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [editTagId, setEditTagId] = useState<string | null>(null);
  const [editTagValue, setEditTagValue] = useState('');

  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    const [catRes, tagRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('subcategories').select('*').order('name'),
    ]);
    if (catRes.error) toast.error('Error al cargar categorías');
    else setCategories(catRes.data || []);
    if (!tagRes.error) setTags(tagRes.data || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ type: 'add' });
  };

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      color: cat.color || COLORS[0],
      icon: cat.icon || 'Package',
    });
    setModal({ type: 'edit', category: cat });
  };

  const openDelete = async (cat: Category) => {
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', cat.id);
    setDeleteTxCount(count ?? 0);
    setModal({ type: 'delete', category: cat });
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

  const deleteCategory = async (cat: Category) => {
    const { error } = await supabase.from('categories').delete().eq('id', cat.id);
    if (error) {
      toast.error('Error al eliminar categoría');
    } else {
      toast.success('Categoría eliminada');
      setModal(null);
      fetchCategories();
    }
  };

  const addTag = async () => {
    const name = addTagValue.trim();
    if (!name) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('subcategories').insert({ name, user_id: user.id });
    if (error) toast.error('Error al crear tag');
    else { setAddTagValue(''); setShowAddTag(false); fetchCategories(); }
  };

  const saveTag = async (id: string) => {
    const name = editTagValue.trim();
    if (!name) return;
    const { error } = await supabase.from('subcategories').update({ name }).eq('id', id);
    if (error) toast.error('Error al actualizar tag');
    else { setEditTagId(null); setEditTagValue(''); fetchCategories(); }
  };

  const deleteTag = async (id: string, name: string) => {
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) toast.error('Error al eliminar tag');
    else { toast.success(`"${name}" eliminado`); fetchCategories(); }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-9 bg-bg-input rounded-[14px] w-48" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[68px] bg-bg-input rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto lg:max-w-none space-y-4">
      <PageHeader
        title="Categorías"
        subtitle={`${categories.length} categoría${categories.length !== 1 ? 's' : ''} configurada${categories.length !== 1 ? 's' : ''}`}
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[12px] bg-accent text-bg text-[13px] font-semibold transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={2.5} />
            Nueva
          </button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-[14px] bg-bg-input/60 border border-border">
        <Search size={15} className="text-text3 flex-shrink-0" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar categoría..."
          className="flex-1 bg-transparent text-[14px] text-text1 placeholder:text-text3 focus:outline-none"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-14 rounded-[20px] bg-bg-input/40 border border-border">
          <Package size={36} className="mx-auto text-text3 mb-3" />
          <p className="text-text3 text-sm">
            {searchQuery ? 'Sin resultados' : 'No tienes categorías aún'}
          </p>
          {!searchQuery && (
            <button onClick={openAdd} className="mt-3 text-accent text-sm font-medium">
              Crear primera categoría
            </button>
          )}
        </div>
      )}

      {/* Category list */}
      <div className="space-y-2">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 p-3.5 rounded-[20px] bg-bg-input/40 border border-border"
          >
            <div
              className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: (cat.color || '#71717a') + '22' }}
            >
              <CategoryIcon name={cat.icon} size={18} style={{ color: cat.color || '#71717a' }} />
            </div>
            <p className="font-sans text-[14px] font-semibold text-text1 flex-1 min-w-0 truncate">
              {cat.name}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => openEdit(cat)}
                className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => openDelete(cat)}
                className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center bg-[rgba(255,107,107,0.10)] text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.18)] transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tags section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-sans text-[15px] font-semibold text-text1">Tags</p>
            <p className="text-[12px] text-text3 mt-0.5">{tags.length} tag{tags.length !== 1 ? 's' : ''} globales</p>
          </div>
          <button
            onClick={() => setShowAddTag(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[12px] bg-accent/10 text-accent text-[13px] font-semibold transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={2.5} />
            Nuevo
          </button>
        </div>

        <div className="rounded-[20px] bg-bg-input/40 border border-border overflow-hidden">
          {tags.length === 0 && !showAddTag ? (
            <div className="text-center py-10">
              <p className="text-text3 text-sm">Sin tags aún</p>
              <button onClick={() => setShowAddTag(true)} className="mt-2 text-accent text-sm font-medium">
                Crear primer tag
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-3 px-4 py-3 group">
                  {editTagId === tag.id ? (
                    <>
                      <input
                        autoFocus
                        value={editTagValue}
                        onChange={(e) => setEditTagValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTag(tag.id);
                          if (e.key === 'Escape') setEditTagId(null);
                        }}
                        className="flex-1 px-3 py-1.5 bg-bg-input border border-border-focus rounded-[10px] text-sm text-text1 focus:outline-none"
                      />
                      <button onClick={() => saveTag(tag.id)} className="p-1.5 text-accent hover:bg-bg-input rounded-lg transition-colors">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditTagId(null)} className="p-1.5 text-text3 hover:bg-bg-input rounded-lg transition-colors">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-accent/60 flex-shrink-0" />
                      <span className="flex-1 text-[14px] text-text1">{tag.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditTagId(tag.id); setEditTagValue(tag.name); }}
                          className="p-1.5 text-text3 hover:text-text1 hover:bg-bg-input rounded-lg transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => deleteTag(tag.id, tag.name)}
                          className="p-1.5 text-text3 hover:text-[#FF6B6B] hover:bg-bg-input rounded-lg transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {showAddTag && (
                <div className="flex items-center gap-2 px-4 py-3">
                  <input
                    autoFocus
                    value={addTagValue}
                    onChange={(e) => setAddTagValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTag();
                      if (e.key === 'Escape') { setShowAddTag(false); setAddTagValue(''); }
                    }}
                    placeholder="Nombre del tag"
                    className="flex-1 px-3 py-1.5 bg-bg-input border border-border-focus rounded-[10px] text-sm text-text1 placeholder:text-text3 focus:outline-none"
                  />
                  <button onClick={addTag} className="p-1.5 text-accent hover:bg-bg-input rounded-lg transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={() => { setShowAddTag(false); setAddTagValue(''); }} className="p-1.5 text-text3 hover:bg-bg-input rounded-lg transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit BottomSheet */}
      <BottomSheet
        isOpen={modal?.type === 'add' || modal?.type === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.type === 'add' ? 'Nueva categoría' : 'Editar categoría'}
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-text3 mb-1.5">
              Nombre
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Alimentación"
              className="w-full px-4 py-2.5 bg-bg-input border border-border rounded-[14px] text-text1 placeholder:text-text3 focus:outline-none focus:border-border-focus text-[14px] transition-colors"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-text3 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 relative flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {form.color === color && (
                    <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-text3 mb-2">
              Ícono
            </label>
            <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {Object.keys(ICONS).map((iconName) => {
                const Icon = ICONS[iconName];
                return (
                  <button
                    key={iconName}
                    onClick={() => setForm((f) => ({ ...f, icon: iconName }))}
                    title={iconName}
                    className={cn(
                      'w-9 h-9 rounded-[12px] flex items-center justify-center transition-colors',
                      form.icon === iconName
                        ? 'bg-accent text-bg'
                        : 'bg-bg-input text-text3 hover:text-text1 hover:bg-bg-input/80'
                    )}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-bg-input/50 border border-border rounded-[14px]">
            <div
              className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: form.color + '33' }}
            >
              <CategoryIcon name={form.icon} size={18} style={{ color: form.color }} />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: form.color }} />
              <span className="text-text1 text-[14px] font-medium">
                {form.name || 'Nombre de categoría'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setModal(null)}
              className="flex-1 h-12 rounded-[14px] bg-bg-input text-text2 font-semibold hover:bg-bg-input/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={saveCategory}
              disabled={saving}
              className="flex-[2] h-12 rounded-[14px] bg-accent text-bg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Guardando...' : modal?.type === 'add' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Delete BottomSheet */}
      <BottomSheet
        isOpen={modal?.type === 'delete'}
        onClose={() => setModal(null)}
        title="Eliminar categoría"
      >
        {modal?.type === 'delete' && (
          <div className="space-y-4">
            <p className="text-text2 text-[14px] leading-relaxed">
              ¿Estás seguro de eliminar{' '}
              <span className="text-text1 font-semibold">&quot;{modal.category.name}&quot;</span>?
            </p>
            {deleteTxCount !== null && deleteTxCount > 0 && (
              <div className="px-4 py-3 rounded-[12px] bg-[rgba(255,107,107,0.10)] border border-[rgba(255,107,107,0.20)]">
                <p className="text-[13px] text-[#FF6B6B] leading-relaxed">
                  Esta categoría tiene{' '}
                  <span className="font-bold">{deleteTxCount} transacciones</span> asociadas. No se
                  puede eliminar.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 h-12 rounded-[14px] bg-bg-input text-text2 font-semibold hover:bg-bg-input/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteCategory(modal.category)}
                disabled={!!deleteTxCount && deleteTxCount > 0}
                className="flex-[2] h-12 rounded-[14px] bg-[#FF4444] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
