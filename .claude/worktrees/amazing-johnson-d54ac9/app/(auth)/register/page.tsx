'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schema';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          full_name: data.fullName,
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        await fetch('/api/seed', { method: 'POST' });
        toast.success('Cuenta creada correctamente');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        setIsGoogleLoading(false);
      }
    } catch {
      toast.error('Error al registrarse con Google');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="w-full max-w-[390px]"
      >
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col items-center pb-8"
        >
          <div className="w-[72px] h-[72px] mb-5">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="36" className="fill-accent/10" />
              <circle cx="36" cy="36" r="35.5" className="stroke-accent/25" strokeWidth="1" />
              <rect x="18" y="16" width="6" height="40" rx="3" className="fill-accent" />
              <line
                x1="24"
                y1="36"
                x2="46"
                y2="18"
                className="stroke-accent"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <polyline
                points="24,52 34,42 42,48 54,33"
                className="stroke-accent"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <polyline
                points="46,31 54,31 54,39"
                className="stroke-accent"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <h1 className="font-display text-[32px] font-extrabold text-text1 tracking-tight mb-1.5">
            Kachi
          </h1>
          <p className="text-sm text-text2 font-light tracking-wide">
            Tu gestor financiero personal
          </p>
        </motion.div>

        {/* Form Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.09 }}
        >
          <h2 className="font-display text-[22px] font-bold text-text1 mb-1">Crear cuenta</h2>
          <p className="text-sm text-text2 mb-6">Empieza a gestionar tus finanzas</p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Name Input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text3 pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3 14s0-4 6-4 6 4 6 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Nombre completo"
              className={cn(
                'w-full h-[54px] bg-bg-input border border-border rounded-2xl',
                'text-text1 text-[15px] pl-11 pr-4',
                'placeholder:text-text3 outline-none',
                'transition-all duration-200',
                'focus:border-border-focus focus:bg-accent/[0.04]',
                errors.fullName && 'border-red-500'
              )}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-sm text-red-400 mt-1">{errors.fullName.message}</p>
            )}
          </motion.div>

          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.19 }}
            className="relative"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text3 pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect
                  x="2"
                  y="4"
                  width="14"
                  height="11"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M2 7l7 4 7-4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              type="email"
              placeholder="Correo electronico"
              className={cn(
                'w-full h-[54px] bg-bg-input border border-border rounded-2xl',
                'text-text1 text-[15px] pl-11 pr-4',
                'placeholder:text-text3 outline-none',
                'transition-all duration-200',
                'focus:border-border-focus focus:bg-accent/[0.04]',
                errors.email && 'border-red-500'
              )}
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.23 }}
            className="relative"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text3 pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect
                  x="3"
                  y="8"
                  width="12"
                  height="8"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M6 8V6a3 3 0 1 1 6 0v2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contrasena"
              className={cn(
                'w-full h-[54px] bg-bg-input border border-border rounded-2xl',
                'text-text1 text-[15px] pl-11 pr-11',
                'placeholder:text-text3 outline-none',
                'transition-all duration-200',
                'focus:border-border-focus focus:bg-accent/[0.04]',
                errors.password && 'border-red-500'
              )}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text3 p-1"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M1 9s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
            {errors.password && (
              <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
            )}
          </motion.div>

          {/* Confirm Password Input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.27 }}
            className="relative mb-6"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text3 pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect
                  x="3"
                  y="8"
                  width="12"
                  height="8"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M6 8V6a3 3 0 1 1 6 0v2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirmar contrasena"
              className={cn(
                'w-full h-[54px] bg-bg-input border border-border rounded-2xl',
                'text-text1 text-[15px] pl-11 pr-4',
                'placeholder:text-text3 outline-none',
                'transition-all duration-200',
                'focus:border-border-focus focus:bg-accent/[0.04]',
                errors.confirmPassword && 'border-red-500'
              )}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400 mt-1">{errors.confirmPassword.message}</p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32 }}
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full h-[58px] rounded-[20px] border-none',
              'bg-accent text-bg',
              'font-display text-base font-bold tracking-wide',
              'cursor-pointer',
              'transition-all duration-150',
              'hover:-translate-y-0.5',
              'active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
            ) : (
              'Crear cuenta'
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.37 }}
          className="flex items-center gap-3 my-6"
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-[13px] text-text3 whitespace-nowrap">o continua con</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Social Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.42 }}
          className="flex gap-3 mb-8"
        >
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className={cn(
              'flex-1 h-[54px] rounded-2xl',
              'border border-border bg-bg-input',
              'flex items-center justify-center',
              'transition-all duration-150',
              'hover:border-text3/20 hover:bg-text1/[0.09]',
              'disabled:opacity-50'
            )}
          >
            {isGoogleLoading ? (
              <svg className="animate-spin h-5 w-5 text-text2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M20.64 11.2c0-.637-.057-1.251-.164-1.84H11v3.481h5.419a4.63 4.63 0 0 1-2.008 3.04v2.524h3.252c1.9-1.75 3-4.33 3-5.744"
                  fill="#4285F4"
                />
                <path
                  d="M11 21c2.7 0 4.964-.895 6.618-2.423l-3.252-2.524C13.38 16.78 12.29 17.1 11 17.1c-2.61 0-4.82-1.762-5.61-4.13H2.04v2.607A9.997 9.997 0 0 0 11 21"
                  fill="#34A853"
                />
                <path
                  d="M5.39 12.97A6.015 6.015 0 0 1 5.07 11c0-.684.12-1.348.32-1.97V6.423H2.04A9.997 9.997 0 0 0 1 11c0 1.612.386 3.138 1.04 4.577l3.35-2.607Z"
                  fill="#FBBC05"
                />
                <path
                  d="M11 4.9c1.47 0 2.791.506 3.83 1.5l2.872-2.872C15.96 1.99 13.697 1 11 1A9.997 9.997 0 0 0 2.04 6.423l3.35 2.607C6.18 6.66 8.39 4.9 11 4.9"
                  fill="#EA4335"
                />
              </svg>
            )}
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 h-[54px] rounded-2xl',
              'border border-border bg-bg-input',
              'flex items-center justify-center',
              'transition-all duration-150',
              'hover:border-text3/20 hover:bg-text1/[0.09]'
            )}
          >
            <svg width="20" height="22" viewBox="0 0 814 1000" className="fill-text1">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.8 0 695.6 0 604.1c0-106.5 56.8-162.7 108.2-163.7 42.2-.9 83.3 29.8 107.3 29.8c23.9 0 71.8-35.4 124.4-35.4 20.3 0 80.4 2.4 118.4 54.7zm-159.8-67.6c3.2-17.6 4.5-34.2 4.5-50.7 0-63.7-26.6-112.8-74.3-150.3C528.6 37.7 479 17 424.4 17c-3 17.4-5.4 34.5-5.4 51.8 0 70.3 27.2 127.3 75 169.5 45.4 40.1 100 65.7 134.3 35.0z" />
            </svg>
          </button>
        </motion.div>

        {/* Footer Link */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.47 }}
          className="text-center text-sm text-text2"
        >
          Ya tienes cuenta?{' '}
          <Link href="/login" className="text-accent font-medium">
            Inicia sesion
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
