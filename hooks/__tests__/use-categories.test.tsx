import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockGet = jest.fn();
jest.mock('../../lib/api-client', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

import { useCategories } from '../use-categories';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCategories', () => {
  it('should fetch categories', async () => {
    const categories = [
      { id: 1, name: 'Alimentation', icon: 'restaurant', color: '#FF5722', type: 'expense' },
      { id: 2, name: 'Salaire', icon: 'attach-money', color: '#4CAF50', type: 'income' },
    ];
    mockGet.mockResolvedValueOnce({ data: categories });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(categories);
    expect(mockGet).toHaveBeenCalledWith('/api/categories');
  });
});
