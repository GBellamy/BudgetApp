import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { Summary, CategoryAnalytics, MonthlyAnalytics } from '../types/api';

export function useSummary(dateFrom?: string, dateTo?: string) {
  return useQuery<Summary>({
    queryKey: ['analytics', 'summary', dateFrom, dateTo],
    queryFn: async () => {
      const response = await apiClient.get('/api/analytics/summary', {
        params: { date_from: dateFrom, date_to: dateTo },
      });
      return response.data;
    },
  });
}

export function useCategoryAnalytics(type: 'income' | 'expense', dateFrom?: string, dateTo?: string) {
  return useQuery<CategoryAnalytics[]>({
    queryKey: ['analytics', 'by-category', type, dateFrom, dateTo],
    queryFn: async () => {
      const response = await apiClient.get('/api/analytics/by-category', {
        params: { type, date_from: dateFrom, date_to: dateTo },
      });
      return response.data;
    },
  });
}

export function useMonthlyAnalytics(year: number) {
  return useQuery<MonthlyAnalytics[]>({
    queryKey: ['analytics', 'by-month', year],
    queryFn: async () => {
      const response = await apiClient.get('/api/analytics/by-month', { params: { year } });
      return response.data;
    },
  });
}

export function useRecentActivity(limit: number = 5) {
  return useQuery({
    queryKey: ['analytics', 'recent-activity', limit],
    queryFn: async () => {
      const response = await apiClient.get('/api/analytics/recent-activity', { params: { limit } });
      return response.data;
    },
  });
}
