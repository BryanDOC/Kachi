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
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{
          background: type === 'income' ? 'rgba(61,255,192,0.08)' : 'rgba(255,107,107,0.08)',
        }}
      >
        {icon || (type === 'income' ? '💰' : '💸')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-text1 truncate leading-snug">{description}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[12px] text-text3">{date}</span>
          {category && (
            <>
              <span className="text-[12px] text-text3/50">·</span>
              <span className="text-[12px] text-text3">{category}</span>
            </>
          )}
        </div>
      </div>
      <p
        className={cn(
          'text-[14px] font-semibold flex-shrink-0 tabular-nums',
          type === 'income' ? 'text-accent' : 'text-[#FF6B6B]'
        )}
      >
        {type === 'income' ? '+' : '-'} {amount}
      </p>
    </div>
  );
}
