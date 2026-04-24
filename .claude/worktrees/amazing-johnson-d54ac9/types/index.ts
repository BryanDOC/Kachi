export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  is_default: boolean;
  user_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  budget_limit: number | null;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface FixedExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency_id: string;
  category_id: string | null;
  billing_day: number | null;
  is_active: boolean;
  last_updated: string;
  notes: string | null;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  status: 'active' | 'completed' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'expense' | 'income';
  amount: number;
  currency_id: string;
  category_id: string | null;
  subcategory_id: string | null;
  trip_id: string | null;
  fixed_expense_id: string | null;
  description: string;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface TransactionWithRelations extends Transaction {
  currencies?: Currency;
  categories?: Category;
  subcategories?: Subcategory;
  trips?: Trip;
}

export interface FixedExpenseWithRelations extends FixedExpense {
  currencies?: Currency;
  categories?: Category;
}
