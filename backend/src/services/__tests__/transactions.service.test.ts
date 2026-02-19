const mockQuery = jest.fn();
jest.mock('../../database/connection', () => ({
  getPool: () => ({ query: mockQuery }),
}));

import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../transactions.service';

const sampleTransaction = {
  id: 1,
  user_id: 1,
  category_id: 2,
  amount: 50.0,
  type: 'expense',
  description: 'Courses',
  date: '2026-02-01',
  created_at: '2026-02-01T10:00:00Z',
  updated_at: '2026-02-01T10:00:00Z',
  category_name: 'Alimentation',
  category_icon: 'restaurant',
  category_color: '#FF5722',
};

describe('transactions.service', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [sampleTransaction] });

      const result = await getTransactions(1, {});
      expect(result).toEqual({ data: [sampleTransaction], total: 1, page: 1, limit: 20 });
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should apply type filter', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await getTransactions(1, { type: 'expense' });

      const countQuery = mockQuery.mock.calls[0][0] as string;
      expect(countQuery).toContain('t.type = $2');
      expect(mockQuery.mock.calls[0][1]).toContain('expense');
    });

    it('should apply date range filter', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await getTransactions(1, { date_from: '2026-01-01', date_to: '2026-01-31' });

      const countQuery = mockQuery.mock.calls[0][0] as string;
      expect(countQuery).toContain('t.date >= $2');
      expect(countQuery).toContain('t.date <= $3');
    });

    it('should respect page and limit', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '50' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await getTransactions(1, { page: 3, limit: 10 });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      // offset should be (3-1)*10 = 20
      const params = mockQuery.mock.calls[1][1] as unknown[];
      expect(params).toContain(10);  // limit
      expect(params).toContain(20);  // offset
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction when found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [sampleTransaction] });
      const result = await getTransactionById(1, 1);
      expect(result).toEqual(sampleTransaction);
    });

    it('should return null when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const result = await getTransactionById(999, 1);
      expect(result).toBeNull();
    });
  });

  describe('createTransaction', () => {
    it('should insert and return the created transaction', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 5 }] })       // INSERT RETURNING id
        .mockResolvedValueOnce({ rows: [sampleTransaction] }); // getTransactionById

      const result = await createTransaction(1, {
        amount: 50,
        type: 'expense',
        category_id: 2,
        description: 'Courses',
        date: '2026-02-01',
      });

      expect(result).toEqual(sampleTransaction);
      expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO transactions');
    });
  });

  describe('updateTransaction', () => {
    it('should update and return the transaction', async () => {
      mockQuery
        .mockResolvedValueOnce({ rowCount: 1 })               // UPDATE
        .mockResolvedValueOnce({ rows: [sampleTransaction] }); // getTransactionById

      const result = await updateTransaction(1, 1, { amount: 75 });
      expect(result).toEqual(sampleTransaction);
      expect(mockQuery.mock.calls[0][0]).toContain('UPDATE transactions SET');
    });

    it('should return null when transaction not found', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });
      const result = await updateTransaction(999, 1, { amount: 75 });
      expect(result).toBeNull();
    });

    it('should return current transaction when no fields provided', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [sampleTransaction] });
      const result = await updateTransaction(1, 1, {});
      expect(result).toEqual(sampleTransaction);
    });
  });

  describe('deleteTransaction', () => {
    it('should return true when deleted', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      const result = await deleteTransaction(1, 1);
      expect(result).toBe(true);
    });

    it('should return false when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });
      const result = await deleteTransaction(999, 1);
      expect(result).toBe(false);
    });
  });
});
