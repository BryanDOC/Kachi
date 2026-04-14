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
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transacciones', icon: Receipt },
  { href: '/dashboard/trips', label: 'Viajes', icon: Plane },
  { href: '/dashboard/fixed', label: 'Gastos Fijos', icon: CreditCard },
  { href: '/dashboard/reports', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Sesión cerrada');
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
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
          'fixed lg:sticky top-0 left-0 h-screen w-70 bg-zinc-950 border-r border-zinc-800 z-40',
          'lg:translate-x-0 transition-transform duration-300'
        )}
      >
        <div className="flex flex-col h-full p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-serif font-bold text-amber-500">Gastos</h1>
            <p className="text-sm text-zinc-500">Gestor personal</p>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-amber-500 text-black font-medium'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all duration-200 mt-auto"
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
