'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { UpcomingExpensesSection } from '@/components/dashboard/UpcomingExpensesSection';
import { RecentTransactionsSection, Transaction } from '@/components/dashboard/RecentTransactionsSection';
import { useUI } from '@/lib/context/ui-context';
import { useUpcomingFixedExpenses } from '@/lib/hooks/useUpcomingFixedExpenses';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';

export default function DashboardPage() {
  const { openTxSheet, txVersion } = useUI();
  const { upcoming } = useUpcomingFixedExpenses();

  const { transactions, isLoading } = useTransactions({ version: txVersion });

  const balance = transactions.reduce((acc, tx) =>
    tx.type === 'income' ? acc + tx.amount : acc - tx.amount, 0
  );

  const defaultCurrencyCode = transactions.find((t) => t.currencies?.code)?.currencies?.code ?? 'PEN';
  const balanceStr = formatCurrency(balance, defaultCurrencyCode);
  const period = format(new Date(), "MMMM yyyy", { locale: es });

  const recentTransactions: Transaction[] = transactions.slice(0, 5).map((tx) => ({
    id: tx.id,
    description: tx.description,
    date: formatDate(tx.date, 'd MMM'),
    category: tx.categories?.name,
    iconName: tx.categories?.icon ?? null,
    amount: formatCurrency(tx.amount, tx.currencies?.code ?? 'PEN'),
    type: tx.type as 'income' | 'expense',
  }));

  return (
    <div className="space-y-6 max-w-lg mx-auto lg:max-w-none">
      <BalanceCard balance={isLoading ? '...' : balanceStr} period={period} />
      <UpcomingExpensesSection expenses={upcoming} />
      <RecentTransactionsSection
        transactions={recentTransactions}
        isLoading={isLoading}
        onCreateClick={openTxSheet}
      />
    </div>
  );
}
