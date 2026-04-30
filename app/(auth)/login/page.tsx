'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Sesion iniciada correctamente');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('Error al iniciar sesion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
      toast.error('Error al iniciar sesion con Google');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
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
              <circle cx="36" cy="36" r="36" className="fill-accent/10 dark:fill-accent/10" />
              <circle
                cx="36"
                cy="36"
                r="35.5"
                className="stroke-accent/25 dark:stroke-accent/25"
                strokeWidth="1"
              />
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
          <h1 className="font-brand text-[36px] text-text1 tracking-wide mb-1.5">
            KACHI
          </h1>
          <p className="text-[13px] text-text2 font-light tracking-wide">
            Tu gestor financiero personal
          </p>
        </motion.div>

        {/* Form Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.09 }}
        >
          <h2 className="text-[20px] font-bold text-text1 mb-1">Bienvenido</h2>
          <p className="text-[13px] text-text2 mb-6">Ingresa a tu cuenta para continuar</p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.17 }}
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
              type="email"
              placeholder="Correo electronico"
              className={cn(
                'w-full h-[54px] bg-bg-input border border-border rounded-2xl',
                'text-text1 text-[13px] pl-11 pr-4',
                'placeholder:text-text3 outline-none',
                'transition-all duration-200',
                'focus:border-border-focus focus:bg-accent/[0.04]',
                errors.email && 'border-red-500'
              )}
              {...register('email')}
            />
            {errors.email && <p className="text-[12px] text-red-400 mt-1">{errors.email.message}</p>}
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
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
                <circle cx="9" cy="12" r="1.2" fill="currentColor" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contrasena"
              className={cn(
                'w-full h-[54px] bg-bg-input border border-border rounded-2xl',
                'text-text1 text-[13px] pl-11 pr-11',
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
              <p className="text-[12px] text-red-400 mt-1">{errors.password.message}</p>
            )}
          </motion.div>

          {/* Forgot Password */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            className="flex justify-end pt-1 pb-4"
          >
            <Link
              href="/forgot-password"
              className="text-[13px] text-accent opacity-85 hover:opacity-100 transition-opacity"
            >
              Olvidaste tu contraseña?
            </Link>
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
              'font-sans text-[15px] font-semibold tracking-wide',
              'cursor-pointer shadow-[0_8px_32px_rgba(var(--accent-rgb),0.25)]',
              'transition-all duration-150',
              'hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(var(--accent-rgb),0.35)]',
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
              'Iniciar sesion'
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
          className="mb-8"
        >
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className={cn(
              'w-full h-[54px] rounded-2xl',
              'border border-border bg-bg-input',
              'flex items-center justify-center gap-3',
              'text-[14px] font-medium text-text1',
              'transition-all duration-150',
              'hover:border-border-focus hover:bg-text1/[0.05]',
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
              <>
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
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
                Continuar con Google
              </>
            )}
          </button>
        </motion.div>

        {/* Footer Link */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.47 }}
          className="text-center text-[13px] text-text2"
        >
          No tienes cuenta?{' '}
          <Link href="/register" className="text-accent font-medium">
            Registrate
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
