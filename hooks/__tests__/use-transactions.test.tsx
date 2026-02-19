import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();
jest.mock('../../lib/api-client', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

import { useTransactions, useCreateTransaction } from '../use-transactions';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch transactions', async () => {
    const mockData = {
      data: [{ id: 1, amount: 50, type: 'expense' }],
      total: 1,
      page: 1,
      limit: 20,
    };
    mockGet.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(mockGet).toHaveBeenCalledWith('/api/transactions', { params: {} });
  });

  it('should pass filters as params', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [], total: 0, page: 1, limit: 20 } });

    const filters = { type: 'expense' as const, page: 2 };
    const { result } = renderHook(() => useTransactions(filters), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith('/api/transactions', {
      params: { type: 'expense', page: 2 },
    });
  });
});

describe('useCreateTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should post transaction data', async () => {
    const newTx = { id: 2, amount: 100, type: 'income' };
    mockPost.mockResolvedValueOnce({ data: newTx });

    const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() });

    result.current.mutate({
      amount: 100,
      type: 'income',
      category_id: 1,
      date: '2026-02-01',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith('/api/transactions', {
      amount: 100,
      type: 'income',
      category_id: 1,
      date: '2026-02-01',
    });
  });
});
