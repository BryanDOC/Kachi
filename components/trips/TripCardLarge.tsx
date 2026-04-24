'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const STATUS = {
  active: {
    label: 'Activo',
    cls: 'bg-[rgba(61,255,192,0.2)] text-[#3DFFC0] border border-[rgba(61,255,192,0.3)]',
  },
  completed: {
    label: 'Completado',
    cls: 'bg-[rgba(96,165,250,0.2)] text-[#93C5FD] border border-[rgba(96,165,250,0.3)]',
  },
  cancelled: {
    label: 'Cancelado',
    cls: 'bg-[rgba(156,163,175,0.2)] text-[#9CA3AF] border border-[rgba(156,163,175,0.3)]',
  },
};

export interface TripCardLargeProps {
  name: string;
  dates: string;
  totalSpent: string;
  status: 'active' | 'completed' | 'cancelled';
  emoji?: string;
  gradient?: string;
  href: string;
}

export function TripCardLarge({
  name,
  dates,
  totalSpent,
  status,
  emoji = '✈️',
  gradient = 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
  href,
}: TripCardLargeProps) {
  const { label, cls } = STATUS[status];

  return (
    <Link
      href={href}
      className="block w-full h-[200px] rounded-[22px] relative overflow-hidden transition-transform active:scale-[0.98]"
    >
      <div
        className="absolute inset-0 flex items-center justify-center text-[80px]"
        style={{ background: gradient }}
      >
        {emoji}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-3.5">
        <div className="flex justify-end">
          <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.3px]', cls)}>
            {label}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1 text-[12px] text-white/60 mb-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" />
              <path d="M1 5h10" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" />
            </svg>
            {dates}
          </div>
          <p className="font-display text-[22px] font-extrabold text-white tracking-tight mb-1.5">{name}</p>
          <div className="flex items-center justify-between">
            <span className="font-numeric text-[16px] font-bold text-white">{totalSpent} gastado</span>
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7h8M8 4l3 3-3 3"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
