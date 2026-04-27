import { FixedExpenseWithRelations } from '@/types';
import { formatCurrency } from '@/lib/utils/currency';

export interface UpcomingExpenseItem {
  id: string;
  name: string;
  daysUntil: number;
  billingDay: number;
  amount: string;
  logoUrl: string | null;
  brandColor: string | null;
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function effectiveBillingDay(billingDay: number, year: number, month: number): number {
  return Math.min(billingDay, lastDayOfMonth(year, month));
}

function daysUntilBilling(billingDay: number, today: Date): number {
  const y = today.getFullYear();
  const m = today.getMonth() + 1;

  const effectiveDay = effectiveBillingDay(billingDay, y, m);
  const billingDate = new Date(y, m - 1, effectiveDay);
  billingDate.setHours(0, 0, 0, 0);

  const todayNorm = new Date(today);
  todayNorm.setHours(0, 0, 0, 0);

  if (billingDate >= todayNorm) {
    return Math.round((billingDate.getTime() - todayNorm.getTime()) / 86_400_000);
  }

  // Billing day already passed this month — look at next month
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? y + 1 : y;
  const nextEffective = effectiveBillingDay(billingDay, nextY, nextM);
  const nextBillingDate = new Date(nextY, nextM - 1, nextEffective);
  nextBillingDate.setHours(0, 0, 0, 0);
  return Math.round((nextBillingDate.getTime() - todayNorm.getTime()) / 86_400_000);
}

export function getUpcomingExpenses(
  expenses: FixedExpenseWithRelations[],
  windowDays = 7
): UpcomingExpenseItem[] {
  const today = new Date();

  return expenses
    .filter((e) => e.is_active && e.billing_day !== null)
    .map((e) => ({
      id: e.id,
      name: e.name,
      daysUntil: daysUntilBilling(e.billing_day!, today),
      billingDay: e.billing_day!,
      amount: formatCurrency(e.amount, e.currencies?.code ?? 'PEN'),
      logoUrl: e.logo_url,
      brandColor: e.brand_color,
    }))
    .filter((e) => e.daysUntil <= windowDays)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
