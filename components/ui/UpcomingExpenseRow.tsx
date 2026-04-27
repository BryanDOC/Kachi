'use client';

import Image from 'next/image';

export interface UpcomingExpenseRowProps {
  name: string;
  daysUntil: number;
  billingDay: number;
  amount: string;
  logoUrl?: string | null;
  brandColor?: string | null;
}

export function UpcomingExpenseRow({
  name,
  daysUntil,
  billingDay,
  amount,
  logoUrl,
  brandColor,
}: UpcomingExpenseRowProps) {
  const isUrgent = daysUntil === 0;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0">
      {logoUrl ? (
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-bg-input border border-border/50">
          <Image src={logoUrl} alt={name} width={36} height={36} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[15px] font-bold text-white"
          style={{ background: brandColor ?? (isUrgent ? '#FF6B6B' : 'var(--accent)') }}
        >
          {initial}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-text1 truncate leading-snug">{name}</p>
        <p className="text-[12px] text-text3 mt-0.5">
          {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `En ${daysUntil} días`} · día{' '}
          {billingDay}
        </p>
      </div>

      <p
        className="text-[14px] font-semibold tabular-nums flex-shrink-0"
        style={{ color: isUrgent ? '#FF6B6B' : 'var(--text1)' }}
      >
        {amount}
      </p>
    </div>
  );
}
