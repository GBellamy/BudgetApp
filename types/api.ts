import { Transaction } from './transaction';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type TransactionListResponse = PaginatedResponse<Transaction>;

export interface Summary {
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryUserTotal {
  user_id: number;
  display_name: string;
  total: number;
}

export interface CategoryAnalytics {
  id: number;
  name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
  user_totals?: CategoryUserTotal[];
}

export interface MonthlyAnalytics {
  month: string;
  income: number;
  expense: number;
}

export interface ApiError {
  error: string;
  details?: { field: string; message: string }[];
}
