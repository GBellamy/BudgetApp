const mockQuery = jest.fn();
jest.mock('../../database/connection', () => ({
  getPool: () => ({ query: mockQuery }),
}));

import { getSummary, getByCategory, getByMonth, getRecentActivity } from '../analytics.service';

describe('analytics.service', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('getSummary', () => {
    it('should return income, expense and balance', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1500.00' }] })  // income
        .mockResolvedValueOnce({ rows: [{ total: '800.50' }] });   // expense

      const result = await getSummary(1);
      expect(result).toEqual({ income: 1500, expense: 800.5, balance: 699.5 });
    });

    it('should handle zero totals', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [{ total: '0' }] });

      const result = await getSummary(1);
      expect(result).toEqual({ income: 0, expense: 0, balance: 0 });
    });

    it('should pass date filters when provided', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '100' }] })
        .mockResolvedValueOnce({ rows: [{ total: '50' }] });

      await getSummary(1, '2026-01-01', '2026-01-31');

      const query = mockQuery.mock.calls[0][0] as string;
      expect(query).toContain('date >= $2');
      expect(query).toContain('date <= $3');
      expect(mockQuery.mock.calls[0][1]).toEqual([1, '2026-01-01', '2026-01-31']);
    });
  });

  describe('getByCategory', () => {
    it('should return category breakdown', async () => {
      const rows = [
        { id: 1, name: 'Alimentation', icon: 'restaurant', color: '#FF5722', total: 350, count: 12 },
        { id: 2, name: 'Transport', icon: 'directions-car', color: '#2196F3', total: 150, count: 5 },
      ];
      mockQuery.mockResolvedValueOnce({ rows });

      const result = await getByCategory(1, 'expense');
      expect(result).toEqual(rows);
      expect(mockQuery.mock.calls[0][1]).toContain('expense');
    });
  });

  describe('getByMonth', () => {
    it('should return monthly breakdown for year', async () => {
      const rows = [
        { month: '2026-01', income: 2000, expense: 1200 },
        { month: '2026-02', income: 2000, expense: 900 },
      ];
      mockQuery.mockResolvedValueOnce({ rows });

      const result = await getByMonth(1, 2026);
      expect(result).toEqual(rows);
      expect(mockQuery.mock.calls[0][1]).toEqual([1, '2026']);
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent transactions with category info', async () => {
      const rows = [{ id: 1, amount: 50, category_name: 'Alimentation' }];
      mockQuery.mockResolvedValueOnce({ rows });

      const result = await getRecentActivity(1, 5);
      expect(result).toEqual(rows);
      expect(mockQuery.mock.calls[0][1]).toEqual([1, 5]);
    });

    it('should default to 5 items', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      await getRecentActivity(1);
      expect(mockQuery.mock.calls[0][1]).toEqual([1, 5]);
    });
  });
});
