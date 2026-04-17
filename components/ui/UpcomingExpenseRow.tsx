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
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0">
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: isUrgent ? '#FF6B6B' : 'var(--accent)' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text1 truncate">{name}</p>
        <p className="text-xs text-text3">
          {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Manana' : `En ${daysUntil} dias`} · dia{' '}
          {billingDay}
        </p>
      </div>
      <p className="font-display text-sm font-bold text-text1/85">{amount}</p>
    </div>
  );
}
