'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const STATUS = {
  active: { label: 'Activo', cls: 'bg-[rgba(61,255,192,0.15)] text-[#3DFFC0]' },
  completed: { label: 'Completado', cls: 'bg-[rgba(96,165,250,0.15)] text-[#93C5FD]' },
  cancelled: { label: 'Cancelado', cls: 'bg-[rgba(156,163,175,0.15)] text-[#9CA3AF]' },
};

export interface TripCardSmallProps {
  name: string;
  dates: string;
  total: string;
  status: 'active' | 'completed' | 'cancelled';
  emoji?: string;
  href: string;
}

export function TripCardSmall({ name, dates, total, status, emoji = '✈️', href }: TripCardSmallProps) {
  const { label, cls } = STATUS[status];

  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 p-3 rounded-[18px] bg-bg-input/40 border border-border transition-opacity hover:opacity-80"
    >
      <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0 bg-bg-input">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-[15px] font-bold text-text1 mb-0.5 truncate">{name}</p>
        <p className="text-[12px] text-text3">{dates}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-numeric text-[14px] font-bold text-text1">{total}</p>
        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block', cls)}>
          {label}
        </span>
      </div>
    </Link>
  );
}
