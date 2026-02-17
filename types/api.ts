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

export interface CategoryAnalytics {
  id: number;
  name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
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
