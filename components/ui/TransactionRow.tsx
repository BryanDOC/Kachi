'use client';

import { cn } from '@/lib/utils';

export interface TransactionRowProps {
  description: string;
  date: string;
  category?: string;
  icon?: string;
  amount: string;
  type: 'income' | 'expense';
}

export function TransactionRow({
  description,
  date,
  category,
  icon,
  amount,
  type,
}: TransactionRowProps) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-bg-input/50 border border-border rounded-2xl">
      <div
        className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center text-lg flex-shrink-0"
        style={{
          background: type === 'income' ? 'rgba(61,255,192,0.08)' : 'rgba(255,107,107,0.1)',
        }}
      >
        {icon || (type === 'income' ? '💰' : '💸')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text1 truncate">{description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text3">{date}</span>
          {category && (
            <span
              className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
              style={{
                background: type === 'income' ? 'rgba(61,255,192,0.08)' : 'rgba(255,107,107,0.08)',
                color: type === 'income' ? 'var(--accent)' : '#FF6B6B',
              }}
            >
              {category}
            </span>
          )}
        </div>
      </div>
      <p
        className={cn(
          'font-display text-[15px] font-bold flex-shrink-0',
          type === 'income' ? 'text-accent' : 'text-[#FF6B6B]'
        )}
      >
        {type === 'income' ? '+' : '-'}
        {amount}
      </p>
    </div>
  );
}
