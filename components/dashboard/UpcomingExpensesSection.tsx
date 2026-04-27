'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { UpcomingExpenseRow, UpcomingExpenseRowProps } from '@/components/ui/UpcomingExpenseRow';

export interface UpcomingExpense extends UpcomingExpenseRowProps {
  id: string;
  logoUrl?: string | null;
  brandColor?: string | null;
}

export interface UpcomingExpensesSectionProps {
  expenses: UpcomingExpense[];
  title?: string;
  viewAllHref?: string;
}

export function UpcomingExpensesSection({
  expenses,
  title = 'Proximos cobros',
  viewAllHref = '/dashboard/fixed',
}: UpcomingExpensesSectionProps) {
  if (expenses.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between px-1 mb-3">
        <h2 className="text-[15px] font-semibold text-text1">{title}</h2>
        <Link href={viewAllHref} className="text-[13px] font-medium text-accent">
          Ver todos
        </Link>
      </div>

      <div className="bg-bg-input/50 border border-border rounded-[20px] overflow-hidden">
        {expenses.map((expense) => (
          <UpcomingExpenseRow
            key={expense.id}
            name={expense.name}
            daysUntil={expense.daysUntil}
            billingDay={expense.billingDay}
            amount={expense.amount}
            logoUrl={expense.logoUrl}
            brandColor={expense.brandColor}
          />
        ))}
      </div>
    </motion.div>
  );
}
