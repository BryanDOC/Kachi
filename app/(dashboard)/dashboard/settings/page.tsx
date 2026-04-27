'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { Plus, Trash2, Star, User, AlertTriangle, LogOut } from 'lucide-react';
import { Currency, Profile } from '@/types';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [addCurrModal, setAddCurrModal] = useState(false);
  const [currForm, setCurrForm] = useState({ code: '', name: '', symbol: '' });
  const [savingCurr, setSavingCurr] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (prof) {
        setProfile(prof);
        setFullName(prof.full_name || '');
      }

      setLoadingCurrencies(true);
      const { data: curr } = await supabase
        .from('currencies')
        .select('*')
        .order('is_default', { ascending: false });
      setCurrencies(curr || []);
      setLoadingCurrencies(false);
    };
    load();
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', profile.id);
    if (error) {
      toast.error('Error al guardar perfil');
    } else {
      toast.success('Perfil actualizado');
      setProfile((p) => (p ? { ...p, full_name: fullName.trim() } : p));
    }
    setSavingProfile(false);
  };

  const uploadAvatar = async (file: File) => {
    if (!profile) return;
    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const path = `${profile.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('Error al subir imagen: ' + uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profile.id);

    if (updateError) {
      toast.error('Error al actualizar avatar');
    } else {
      setProfile((p) => (p ? { ...p, avatar_url: publicUrl } : p));
      toast.success('Avatar actualizado');
    }
    setUploadingAvatar(false);
  };

  const setDefaultCurrency = async (id: string) => {
    await supabase
      .from('currencies')
      .update({ is_default: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('currencies').update({ is_default: true }).eq('id', id);
    setCurrencies((prev) => prev.map((c) => ({ ...c, is_default: c.id === id })));
    toast.success('Divisa predeterminada actualizada');
  };

  const deleteCurrency = async (curr: Currency) => {
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('currency_id', curr.id);

    if (count && count > 0) {
      toast.error(`No puedes eliminar "${curr.code}" — se usa en ${count} transacciones`);
      return;
    }
    if (curr.is_default) {
      toast.error('No puedes eliminar la divisa predeterminada');
      return;
    }

    const { error } = await supabase.from('currencies').delete().eq('id', curr.id);
    if (error) {
      toast.error('Error al eliminar divisa');
    } else {
      setCurrencies((prev) => prev.filter((c) => c.id !== curr.id));
      toast.success('Divisa eliminada');
    }
  };

  const addCurrency = async () => {
    if (!currForm.code.trim() || !currForm.name.trim() || !currForm.symbol.trim()) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    setSavingCurr(true);
    const { data, error } = await supabase
      .from('currencies')
      .insert({
        code: currForm.code.trim().toUpperCase(),
        name: currForm.name.trim(),
        symbol: currForm.symbol.trim(),
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      toast.error('Error al agregar divisa');
    } else {
      setCurrencies((prev) => [...prev, data]);
      setAddCurrModal(false);
      setCurrForm({ code: '', name: '', symbol: '' });
      toast.success('Divisa agregada');
    }
    setSavingCurr(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINAR') return;
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error || 'Error al eliminar cuenta');
        setDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      router.push('/login');
    } catch {
      toast.error('Error al eliminar cuenta');
      setDeleting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-bg-input border border-border rounded-[14px] text-[14px] text-text1 placeholder:text-text3 focus:outline-none focus:border-border-focus transition-colors';

  const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.5px] text-text3 mb-1.5';

  return (
    <div className="space-y-6 max-w-lg mx-auto lg:max-w-2xl">
      {/* Page title */}
      <div>
        <h1 className="font-sans text-[20px] font-bold text-text1">Configuración</h1>
        <p className="text-[13px] text-text3 mt-0.5">Perfil, divisas y cuenta</p>
      </div>

      {/* Profile section */}
      <section className="bg-bg-input/50 border border-border rounded-[20px] p-5 space-y-5">
        <h2 className="text-[15px] font-semibold text-text1 flex items-center gap-2">
          <User size={16} className="text-accent" />
          Perfil
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-bg-input border-2 border-border flex items-center justify-center">
                <User size={24} className="text-text3" />
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="px-4 py-2 bg-bg-input border border-border text-text2 rounded-[12px] hover:border-border-focus transition-colors text-[13px] font-medium disabled:opacity-50"
            >
              {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
            </button>
            <p className="text-[11px] text-text3 mt-1">JPG, PNG o GIF. Máx 2MB.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar(file);
              }}
            />
          </div>
        </div>

        {/* Full name */}
        <div>
          <label className={labelClass}>Nombre completo</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="Tu nombre"
          />
        </div>

        <button
          onClick={saveProfile}
          disabled={savingProfile}
          className="px-5 py-2.5 bg-accent text-bg text-[13px] font-semibold rounded-[12px] hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          {savingProfile ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </section>

      {/* Currencies section */}
      <section className="bg-bg-input/50 border border-border rounded-[20px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-text1">Divisas</h2>
          <button
            onClick={() => setAddCurrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-input border border-border text-text2 rounded-[10px] hover:border-border-focus transition-colors text-[13px]"
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>

        {loadingCurrencies ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 bg-bg-input rounded-[14px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {currencies.map((curr) => (
              <div key={curr.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-10 h-10 rounded-[12px] bg-bg-input border border-border flex items-center justify-center font-semibold text-text2 text-[13px] flex-shrink-0">
                  {curr.symbol}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-text1">{curr.code}</span>
                    {curr.is_default && (
                      <span className="text-[11px] px-1.5 py-0.5 bg-accent/12 text-accent rounded-full font-medium">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-text3">{curr.name}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!curr.is_default && (
                    <button
                      onClick={() => setDefaultCurrency(curr.id)}
                      title="Establecer como predeterminada"
                      className="p-1.5 text-text3 hover:text-accent hover:bg-accent/10 rounded-[8px] transition-colors"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteCurrency(curr)}
                    className="p-1.5 text-text3 hover:text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.10)] rounded-[8px] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-5 py-4 bg-bg-input/50 border border-border rounded-[20px] text-text2 hover:text-text1 hover:border-border-focus transition-colors"
      >
        <LogOut size={18} className="flex-shrink-0" />
        <span className="text-[14px] font-medium">Cerrar sesión</span>
      </button>

      {/* Danger zone */}
      <section className="bg-bg-input/50 border border-[rgba(255,107,107,0.25)] rounded-[20px] p-5 space-y-4">
        <h2 className="text-[15px] font-semibold text-[#FF6B6B] flex items-center gap-2">
          <AlertTriangle size={16} />
          Zona de peligro
        </h2>
        <p className="text-[13px] text-text3">
          Eliminar tu cuenta borrará permanentemente todos tus datos. Esta acción no se puede
          deshacer.
        </p>
        <button
          onClick={() => {
            setDeleteConfirmText('');
            setDeleteModal(true);
          }}
          className="px-4 py-2.5 bg-[rgba(255,107,107,0.10)] text-[#FF6B6B] border border-[rgba(255,107,107,0.25)] rounded-[12px] hover:bg-[rgba(255,107,107,0.18)] transition-colors text-[13px] font-medium"
        >
          Eliminar cuenta
        </button>
      </section>

      {/* Add currency modal */}
      <Modal
        isOpen={addCurrModal}
        onClose={() => setAddCurrModal(false)}
        title="Agregar divisa"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>
              Código <span className="text-text3/60 normal-case tracking-normal">(ej: EUR)</span>
            </label>
            <input
              value={currForm.code}
              onChange={(e) => setCurrForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="USD"
              maxLength={5}
              className={cn(inputClass, 'uppercase')}
            />
          </div>
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              value={currForm.name}
              onChange={(e) => setCurrForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Euro"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Símbolo</label>
            <input
              value={currForm.symbol}
              onChange={(e) => setCurrForm((f) => ({ ...f, symbol: e.target.value }))}
              placeholder="€"
              maxLength={5}
              className={inputClass}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setAddCurrModal(false)}
              className="flex-1 px-4 py-2.5 bg-bg-input border border-border text-text2 rounded-[12px] hover:border-border-focus transition-colors text-[13px] font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={addCurrency}
              disabled={savingCurr}
              className="flex-1 px-4 py-2.5 bg-accent text-bg rounded-[12px] hover:opacity-85 transition-opacity text-[13px] font-semibold disabled:opacity-50"
            >
              {savingCurr ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete account confirmation modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Eliminar cuenta"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-text2">
            Esto eliminará permanentemente tu cuenta y todos tus datos (transacciones, categorías,
            viajes).
          </p>
          <div>
            <label className={labelClass}>
              Escribe{' '}
              <span className="text-[#FF6B6B] font-mono font-semibold normal-case tracking-normal">
                ELIMINAR
              </span>{' '}
              para confirmar
            </label>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className={inputClass}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal(false)}
              className="flex-1 px-4 py-2.5 bg-bg-input border border-border text-text2 rounded-[12px] hover:border-border-focus transition-colors text-[13px] font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={deleteAccount}
              disabled={deleteConfirmText !== 'ELIMINAR' || deleting}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-[12px] text-[13px] font-semibold transition-colors',
                deleteConfirmText === 'ELIMINAR'
                  ? 'bg-[#FF4444] text-white hover:opacity-90'
                  : 'bg-bg-input border border-border text-text3 cursor-not-allowed'
              )}
            >
              {deleting ? 'Eliminando...' : 'Eliminar cuenta'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
