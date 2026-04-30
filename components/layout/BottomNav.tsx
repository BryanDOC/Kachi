'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUI } from '@/lib/context/ui-context';

const navItems = [
  {
    href: '/dashboard',
    label: 'Inicio',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 11L12 4l9 7"
          className={active ? 'stroke-accent' : 'stroke-text3'}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 9.5V19a1 1 0 001 1h4v-4.5a1 1 0 011-1h2a1 1 0 011 1V20h4a1 1 0 001-1V9.5"
          className={active ? 'stroke-accent' : 'stroke-text3'}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/transactions',
    label: 'Movimientos',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 6h16M4 12h12M4 18h8"
          className={active ? 'stroke-accent' : 'stroke-text3'}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/reports',
    label: 'Reportes',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          className={active ? 'stroke-accent' : 'stroke-text3'}
          strokeWidth="1.6"
        />
        <path
          d="M9 12l2 2 4-4"
          className={active ? 'stroke-accent' : 'stroke-text3'}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Perfil',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="8"
          r="4"
          className={active ? 'stroke-accent' : 'stroke-text3'}
          strokeWidth="1.6"
        />
        <path
          d="M5 20s0-5 7-5 7 5 7 5"
          className={active ? 'stroke-accent' : 'stroke-text3'}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { openTxSheet } = useUI();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[83px] bg-bg border-t border-border z-40 flex items-start justify-around px-2 pt-3">
      {navItems.slice(0, 2).map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 flex-1"
          >
            {item.icon(isActive)}
            <span
              className={cn('text-[10px] font-medium', isActive ? 'text-accent' : 'text-text3')}
            >
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* FAB */}
      <button
        onClick={() => openTxSheet()}
        className="w-[52px] h-[52px] rounded-full flex items-center justify-center -mt-6 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
        style={{ background: 'var(--card-bg)' }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 4v14M4 11h14"
            className="stroke-white dark:stroke-[#1A1A2E]"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {navItems.slice(2).map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 flex-1"
          >
            {item.icon(isActive)}
            <span
              className={cn('text-[10px] font-medium', isActive ? 'text-accent' : 'text-text3')}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
