import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const mockQuery = jest.fn();
jest.mock('../../database/connection', () => ({
  getPool: () => ({ query: mockQuery }),
}));

process.env.JWT_SECRET = 'test-secret';

import { login, getUserById } from '../auth.service';

describe('auth.service', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('login', () => {
    const hashedPassword = bcrypt.hashSync('password123', 10);

    it('should return token and user on valid credentials', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, username: 'user1', password: hashedPassword, display_name: 'User 1' }],
      });

      const result = await login('user1', 'password123');

      expect(result).not.toBeNull();
      expect(result!.user).toEqual({ id: 1, username: 'user1', display_name: 'User 1' });
      expect(typeof result!.token).toBe('string');

      const decoded = jwt.verify(result!.token, 'test-secret') as Record<string, unknown>;
      expect(decoded.id).toBe(1);
      expect(decoded.username).toBe('user1');
    });

    it('should return null for unknown username', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const result = await login('unknown', 'password123');
      expect(result).toBeNull();
    });

    it('should return null for wrong password', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, username: 'user1', password: hashedPassword, display_name: 'User 1' }],
      });
      const result = await login('user1', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, username: 'user1', display_name: 'User 1' }],
      });
      const user = await getUserById(1);
      expect(user).toEqual({ id: 1, username: 'user1', display_name: 'User 1' });
      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1]);
    });

    it('should return null when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const user = await getUserById(999);
      expect(user).toBeNull();
    });
  });
});
