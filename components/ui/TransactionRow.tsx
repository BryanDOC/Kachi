'use client';

import { TrendingUp, TrendingDown, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

export interface TransactionRowProps {
  description: string;
  date: string;
  category?: string;
  iconName?: string | null;
  amount: string;
  type: 'income' | 'expense';
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TransactionRow({ description, date, category, iconName, amount, type, onEdit, onDelete }: TransactionRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0 group">
      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
        {iconName ? (
          <CategoryIcon name={iconName} size={18} style={{ stroke: 'url(#icon-card-gradient)' }} />
        ) : type === 'income' ? (
          <TrendingUp size={18} style={{ stroke: 'url(#icon-card-gradient)' }} />
        ) : (
          <TrendingDown size={18} style={{ stroke: 'url(#icon-card-gradient)' }} />
        )}
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
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className={cn('text-[14px] font-semibold tabular-nums', type === 'income' ? 'text-accent' : 'text-[#FF6B6B]')}>
          {type === 'income' ? '+' : '-'} {amount}
        </p>
        {onEdit && (
          <button
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-text3 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
          >
            <Pencil size={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-text3 hover:text-[#FF6B6B] hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
