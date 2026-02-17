import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { TransactionListResponse } from '../types/api';
import { TransactionFormData } from '../types/transaction';

interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  category_id?: number;
  date_from?: string;
  date_to?: string;
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery<TransactionListResponse>({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined)
      );
      const response = await apiClient.get('/api/transactions', { params });
      return response.data;
    },
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/transactions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await apiClient.post('/api/transactions', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateTransaction(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<TransactionFormData>) => {
      const response = await apiClient.put(`/api/transactions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/transactions/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
