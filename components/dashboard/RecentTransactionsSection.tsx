'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TransactionRow, TransactionRowProps } from '@/components/ui/TransactionRow';

export interface Transaction extends TransactionRowProps {
  id: string;
}

export interface RecentTransactionsSectionProps {
  transactions: Transaction[];
  isLoading?: boolean;
  title?: string;
  viewAllHref?: string;
  emptyMessage?: string;
  onCreateClick?: () => void;
  createLabel?: string;
}

export function RecentTransactionsSection({
  transactions,
  isLoading = false,
  title = 'Ultimas transacciones',
  viewAllHref = '/dashboard/transactions',
  emptyMessage = 'No hay transacciones este mes',
  onCreateClick,
  createLabel = 'Crear primera transaccion',
}: RecentTransactionsSectionProps) {
  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between px-1 mb-3">
          <div className="h-4 w-36 bg-bg-input rounded animate-pulse" />
        </div>
        <div className="bg-bg-input/50 border border-border rounded-[20px] overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0">
              <div className="w-9 h-9 rounded-xl bg-bg-input animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-bg-input rounded animate-pulse w-1/2" />
                <div className="h-3 bg-bg-input rounded animate-pulse w-1/4" />
              </div>
              <div className="h-3.5 bg-bg-input rounded animate-pulse w-16" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between px-1 mb-3">
        <h2 className="text-[15px] font-semibold text-text1">{title}</h2>
        <Link href={viewAllHref} className="text-[13px] font-medium text-accent">
          Ver todo
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-bg-input/50 rounded-[20px] border border-border">
          <p className="text-text3">{emptyMessage}</p>
          {onCreateClick && (
            <button onClick={onCreateClick} className="inline-block mt-4 text-accent font-medium">
              {createLabel}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-bg-input/50 border border-border rounded-[20px] overflow-hidden">
          {transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              description={tx.description}
              date={tx.date}
              category={tx.category}
              iconName={tx.iconName}
              amount={tx.amount}
              type={tx.type}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
