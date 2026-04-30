'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
      }
    } catch {
      toast.error('Error al enviar el correo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-[390px]"
      >
        <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] text-text2 hover:text-text1 transition-colors mb-8">
          <ArrowLeft size={15} />
          Volver al inicio de sesión
        </Link>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent" />
              </svg>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-text1">Correo enviado</h2>
              <p className="text-[13px] text-text2 mt-1">
                Revisa tu bandeja de entrada en <span className="font-medium text-text1">{email}</span> y sigue el enlace para restablecer tu contraseña.
              </p>
            </div>
            <Link href="/login" className="inline-block text-[13px] text-accent font-medium">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-[20px] font-bold text-text1 mb-1">Olvidaste tu contraseña?</h2>
            <p className="text-[13px] text-text2 mb-6">
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(
                  'w-full h-[54px] bg-bg-input border border-border rounded-2xl',
                  'text-text1 text-[13px] px-4',
                  'placeholder:text-text3 outline-none',
                  'transition-all duration-200 focus:border-border-focus'
                )}
              />
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className={cn(
                  'w-full h-[54px] rounded-[18px] font-semibold text-[14px]',
                  'text-white dark:text-[#1A1A2E] transition-opacity',
                  'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                style={{ background: 'var(--card-bg)' }}
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
