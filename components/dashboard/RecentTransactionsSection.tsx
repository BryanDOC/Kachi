'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TransactionRow, TransactionRowProps } from '@/components/ui/TransactionRow';

export interface Transaction extends TransactionRowProps {
  id: string;
}

export interface RecentTransactionsSectionProps {
  transactions: Transaction[];
  title?: string;
  viewAllHref?: string;
  emptyMessage?: string;
  createHref?: string;
  createLabel?: string;
}

export function RecentTransactionsSection({
  transactions,
  title = 'Ultimas transacciones',
  viewAllHref = '/dashboard/transactions',
  emptyMessage = 'No hay transacciones este mes',
  createHref = '/dashboard/transactions/new',
  createLabel = 'Crear primera transaccion',
}: RecentTransactionsSectionProps) {
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
          <Link href={createHref} className="inline-block mt-4 text-accent font-medium">
            {createLabel}
          </Link>
        </div>
      ) : (
        <div className="bg-bg-input/50 border border-border rounded-[20px] overflow-hidden">
          {transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              description={tx.description}
              date={tx.date}
              category={tx.category}
              icon={tx.icon}
              amount={tx.amount}
              type={tx.type}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
