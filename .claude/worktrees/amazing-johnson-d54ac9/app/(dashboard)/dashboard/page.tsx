'use client';

import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { UpcomingExpensesSection } from '@/components/dashboard/UpcomingExpensesSection';
import { RecentTransactionsSection } from '@/components/dashboard/RecentTransactionsSection';

// ============ MOCK DATA ============
const MOCK_BALANCE = 'S/ 1,353';
const MOCK_PERIOD = 'Abril 2026';
const MOCK_USER_NAME = 'Kachi';

const MOCK_UPCOMING_EXPENSES = [
  { id: '1', name: 'Netflix', daysUntil: 0, billingDay: 15, amount: 'S/ 38.90' },
  { id: '2', name: 'Internet Claro', daysUntil: 2, billingDay: 17, amount: 'S/ 89.00' },
];

const MOCK_TRANSACTIONS = [
  {
    id: '1',
    description: 'Plaza Vea',
    date: '14 abr',
    category: 'Alimentacion',
    icon: '🛒',
    amount: 'S/ 127.50',
    type: 'expense' as const,
  },
  {
    id: '2',
    description: 'Salario Caja Piura',
    date: '1 abr',
    category: 'Trabajo',
    icon: '💼',
    amount: 'S/ 3,200.00',
    type: 'income' as const,
  },
  {
    id: '3',
    description: 'Bus Piura - Huaraz',
    date: '10 abr',
    category: 'Transporte',
    icon: '🚌',
    amount: 'S/ 85.00',
    type: 'expense' as const,
  },
  {
    id: '4',
    description: 'Restaurante La Brisa',
    date: '8 abr',
    category: 'Salidas',
    icon: '🍽️',
    amount: 'S/ 67.00',
    type: 'expense' as const,
  },
];
// ===================================

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto lg:max-w-none">
      <BalanceCard balance={MOCK_BALANCE} period={MOCK_PERIOD} userName={MOCK_USER_NAME} />
      <UpcomingExpensesSection expenses={MOCK_UPCOMING_EXPENSES} />
      <RecentTransactionsSection transactions={MOCK_TRANSACTIONS} />
    </div>
  );
}
