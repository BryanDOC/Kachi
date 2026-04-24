'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { UpcomingExpenseRow, UpcomingExpenseRowProps } from '@/components/ui/UpcomingExpenseRow';

export interface UpcomingExpense extends UpcomingExpenseRowProps {
  id: string;
}

export interface UpcomingExpensesSectionProps {
  expenses: UpcomingExpense[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
}

export function UpcomingExpensesSection({
  expenses,
  title = 'Proximos cobros',
  subtitle = 'Gastos fijos esta semana',
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
        <h2 className="font-heading text-base font-semibold tracking-wide uppercase text-text1">{title}</h2>
        <Link href={viewAllHref} className="text-[13px] font-medium text-accent">
          Ver todos
        </Link>
      </div>

      <div className="bg-bg-input/50 border border-border rounded-[20px] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect
              x="1"
              y="2"
              width="12"
              height="10"
              rx="2"
              className="stroke-text2"
              strokeWidth="1.2"
            />
            <path d="M1 5h12" className="stroke-text2" strokeWidth="1.2" />
            <circle cx="4" cy="8.5" r="0.8" className="fill-text2" />
          </svg>
          <span className="text-[13px] font-semibold text-text2/80 flex-1">{subtitle}</span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-accent/13 text-accent">
            {expenses.length} pendientes
          </span>
        </div>

        {expenses.map((expense) => (
          <UpcomingExpenseRow
            key={expense.id}
            name={expense.name}
            daysUntil={expense.daysUntil}
            billingDay={expense.billingDay}
            amount={expense.amount}
          />
        ))}
      </div>
    </motion.div>
  );
}
