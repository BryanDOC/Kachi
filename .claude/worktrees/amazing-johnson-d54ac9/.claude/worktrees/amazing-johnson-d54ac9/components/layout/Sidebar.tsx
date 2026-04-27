'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Plane,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Tag,
  Moon,
  Sun,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTheme } from './ThemeProvider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transacciones', icon: Receipt },
  { href: '/dashboard/trips', label: 'Viajes', icon: Plane },
  { href: '/dashboard/fixed', label: 'Gastos Fijos', icon: CreditCard },
  { href: '/dashboard/reports', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/categories', label: 'Categorias', icon: Tag },
  { href: '/dashboard/settings', label: 'Configuracion', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Sesion cerrada');
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-bg-input border border-border rounded-lg text-text1"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-70 bg-bg border-r border-border z-40',
          'lg:translate-x-0 transition-transform duration-300'
        )}
      >
        <div className="flex flex-col h-full p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10">
                <svg width="40" height="40" viewBox="0 0 72 72" fill="none">
                  <circle cx="36" cy="36" r="36" className="fill-accent/10" />
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
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-text1">Kachi</h1>
                <p className="text-xs text-text2">Gestor personal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-accent/12 text-accent font-medium'
                      : 'text-text2 hover:bg-bg-input hover:text-text1'
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-text2 hover:bg-bg-input hover:text-text1 transition-all duration-200 w-full"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              <span>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-text2 hover:bg-bg-input hover:text-text1 transition-all duration-200 w-full"
            >
              <LogOut size={20} />
              <span>Cerrar sesion</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
