export type TransactionType = 'income' | 'expense';
export type CategoryType = 'income' | 'expense' | 'both';

export interface Category {
  id: number;
  user_id: number | null;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  is_default: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  type: TransactionType;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  user_display_name?: string;
}

export interface TransactionFormData {
  amount: number;
  type: TransactionType;
  category_id: number;
  description?: string;
  date: string;
}
