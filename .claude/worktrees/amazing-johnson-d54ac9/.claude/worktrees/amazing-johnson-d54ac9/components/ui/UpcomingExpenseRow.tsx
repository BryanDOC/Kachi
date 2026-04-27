'use client';

export interface UpcomingExpenseRowProps {
  name: string;
  daysUntil: number;
  billingDay: number;
  amount: string;
}

export function UpcomingExpenseRow({
  name,
  daysUntil,
  billingDay,
  amount,
}: UpcomingExpenseRowProps) {
  const isUrgent = daysUntil === 0;

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0">
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
        style={{ background: isUrgent ? '#FF6B6B' : 'var(--accent)' }}
      />
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
