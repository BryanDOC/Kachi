'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { Plus, Trash2, Star, User, AlertTriangle } from 'lucide-react';
import { Currency, Profile } from '@/types';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Currencies state
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [addCurrModal, setAddCurrModal] = useState(false);
  const [currForm, setCurrForm] = useState({ code: '', name: '', symbol: '' });
  const [savingCurr, setSavingCurr] = useState(false);

  // Delete account state
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
    // Remove default from all, then set chosen
    await supabase
      .from('currencies')
      .update({ is_default: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // update all
    await supabase.from('currencies').update({ is_default: true }).eq('id', id);
    setCurrencies((prev) =>
      prev.map((c) => ({ ...c, is_default: c.id === id }))
    );
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

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Configuración</h1>
        <p className="text-zinc-400">Administra tu perfil, divisas y cuenta</p>
      </div>

      {/* Profile section */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <User size={18} className="text-amber-500" />
          Perfil
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                <User size={28} className="text-zinc-500" />
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
            </button>
            <p className="text-xs text-zinc-500 mt-1">JPG, PNG o GIF. Máx 2MB.</p>
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
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Nombre completo
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={saveProfile}
          disabled={savingProfile}
          className="px-5 py-2.5 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
        >
          {savingProfile ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </section>

      {/* Currencies section */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Divisas</h2>
          <button
            onClick={() => setAddCurrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
          >
            <Plus size={14} />
            Agregar
          </button>
        </div>

        {loadingCurrencies ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 bg-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {currencies.map((curr) => (
              <div
                key={curr.id}
                className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center font-bold text-zinc-300 text-sm">
                  {curr.symbol}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{curr.code}</span>
                    {curr.is_default && (
                      <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded font-medium">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">{curr.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {!curr.is_default && (
                    <button
                      onClick={() => setDefaultCurrency(curr.id)}
                      title="Establecer como predeterminada"
                      className="p-1.5 text-zinc-500 hover:text-amber-500 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteCurrency(curr)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section className="bg-zinc-900 border border-red-900/50 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
          <AlertTriangle size={18} />
          Zona de peligro
        </h2>
        <p className="text-zinc-400 text-sm">
          Eliminar tu cuenta borrará permanentemente todos tus datos. Esta acción no se puede
          deshacer.
        </p>
        <button
          onClick={() => {
            setDeleteConfirmText('');
            setDeleteModal(true);
          }}
          className="px-4 py-2.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium"
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
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Código <span className="text-zinc-500">(ej: EUR)</span>
            </label>
            <input
              value={currForm.code}
              onChange={(e) => setCurrForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="USD"
              maxLength={5}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre</label>
            <input
              value={currForm.name}
              onChange={(e) => setCurrForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Euro"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Símbolo</label>
            <input
              value={currForm.symbol}
              onChange={(e) => setCurrForm((f) => ({ ...f, symbol: e.target.value }))}
              placeholder="€"
              maxLength={5}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setAddCurrModal(false)}
              className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={addCurrency}
              disabled={savingCurr}
              className="flex-1 px-4 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-medium disabled:opacity-50"
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
          <p className="text-zinc-300 text-sm">
            Esto eliminará permanentemente tu cuenta y todos tus datos (transacciones,
            categorías, viajes).
          </p>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Escribe{' '}
              <span className="text-red-400 font-mono font-semibold">ELIMINAR</span> para
              confirmar
            </label>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal(false)}
              className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={deleteAccount}
              disabled={deleteConfirmText !== 'ELIMINAR' || deleting}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors',
                deleteConfirmText === 'ELIMINAR'
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
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
