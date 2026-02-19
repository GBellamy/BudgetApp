import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockGet = jest.fn();
jest.mock('../../lib/api-client', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

import { useSummary, useCategoryAnalytics, useMonthlyAnalytics } from '../use-analytics';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useSummary', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should fetch summary data', async () => {
    const summary = { income: 2000, expense: 1200, balance: 800 };
    mockGet.mockResolvedValueOnce({ data: summary });

    const { result } = renderHook(() => useSummary('2026-02-01', '2026-02-28'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(summary);
    expect(mockGet).toHaveBeenCalledWith('/api/analytics/summary', {
      params: { date_from: '2026-02-01', date_to: '2026-02-28' },
    });
  });
});

describe('useCategoryAnalytics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should fetch category breakdown', async () => {
    const data = [{ id: 1, name: 'Alimentation', total: 350, count: 12 }];
    mockGet.mockResolvedValueOnce({ data });

    const { result } = renderHook(() => useCategoryAnalytics('expense'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(data);
  });
});

describe('useMonthlyAnalytics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should fetch monthly data for a year', async () => {
    const data = [
      { month: '2026-01', income: 2000, expense: 1200 },
      { month: '2026-02', income: 2000, expense: 900 },
    ];
    mockGet.mockResolvedValueOnce({ data });

    const { result } = renderHook(() => useMonthlyAnalytics(2026), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(data);
    expect(mockGet).toHaveBeenCalledWith('/api/analytics/by-month', { params: { year: 2026 } });
  });
});
