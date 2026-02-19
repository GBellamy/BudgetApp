const mockQuery = jest.fn();
jest.mock('../../database/connection', () => ({
  getPool: () => ({ query: mockQuery }),
}));

import {
  getCategoriesForUser,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../categories.service';

const sampleCategory = {
  id: 1,
  user_id: null,
  name: 'Alimentation',
  icon: 'restaurant',
  color: '#FF5722',
  type: 'expense' as const,
  is_default: 1,
};

describe('categories.service', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('getCategoriesForUser', () => {
    it('should return categories for user and defaults', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [sampleCategory] });
      const result = await getCategoriesForUser(1);
      expect(result).toEqual([sampleCategory]);
      expect(mockQuery.mock.calls[0][1]).toEqual([1]);
    });
  });

  describe('createCategory', () => {
    it('should create and return a new category', async () => {
      const newCat = { ...sampleCategory, id: 5, user_id: 1, is_default: 0 };
      mockQuery.mockResolvedValueOnce({ rows: [newCat] });

      const result = await createCategory(1, {
        name: 'Alimentation',
        icon: 'restaurant',
        color: '#FF5722',
        type: 'expense',
      });

      expect(result).toEqual(newCat);
      expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO categories');
    });
  });

  describe('updateCategory', () => {
    it('should update and return the category', async () => {
      const updated = { ...sampleCategory, name: 'Nourriture' };
      mockQuery.mockResolvedValueOnce({ rows: [updated] });

      const result = await updateCategory(1, 1, { name: 'Nourriture' });
      expect(result).toEqual(updated);
      expect(mockQuery.mock.calls[0][0]).toContain('UPDATE categories SET');
    });

    it('should return null when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const result = await updateCategory(999, 1, { name: 'Test' });
      expect(result).toBeNull();
    });

    it('should return current category when no fields provided', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [sampleCategory] });
      const result = await updateCategory(1, 1, {});
      expect(result).toEqual(sampleCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should return true when non-default category deleted', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      const result = await deleteCategory(5, 1);
      expect(result).toBe(true);
    });

    it('should return false for default category (is_default = 1)', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });
      const result = await deleteCategory(1, 1);
      expect(result).toBe(false);
    });
  });
});
