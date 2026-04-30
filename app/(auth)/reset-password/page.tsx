'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
    if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return; }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Contraseña actualizada');
        router.push('/dashboard');
      }
    } catch {
      toast.error('Error al actualizar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = cn(
    'w-full h-[54px] bg-bg-input border border-border rounded-2xl',
    'text-text1 text-[13px] px-4',
    'placeholder:text-text3 outline-none',
    'transition-all duration-200 focus:border-border-focus'
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-[390px]"
      >
        <h2 className="text-[20px] font-bold text-text1 mb-1">Nueva contraseña</h2>
        <p className="text-[13px] text-text2 mb-6">Elige una contraseña segura para tu cuenta.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={cn(inputClass, 'pr-11')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text3 p-1"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M1 9s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className={inputClass}
          />
          <button
            type="submit"
            disabled={isLoading || !password || !confirm}
            className={cn(
              'w-full h-[54px] rounded-[18px] font-semibold text-[14px] mt-2',
              'text-white dark:text-[#1A1A2E] transition-opacity',
              'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            style={{ background: 'var(--card-bg)' }}
          >
            {isLoading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
