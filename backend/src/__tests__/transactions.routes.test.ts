import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

process.env.JWT_SECRET = 'test-secret';

jest.mock('../services/transactions.service', () => ({
  getTransactions: jest.fn(),
  getTransactionById: jest.fn(),
  createTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
}));

import * as service from '../services/transactions.service';

const mockGetTransactions = service.getTransactions as jest.MockedFunction<typeof service.getTransactions>;
const mockGetById = service.getTransactionById as jest.MockedFunction<typeof service.getTransactionById>;
const mockCreate = service.createTransaction as jest.MockedFunction<typeof service.createTransaction>;
const mockUpdate = service.updateTransaction as jest.MockedFunction<typeof service.updateTransaction>;
const mockDelete = service.deleteTransaction as jest.MockedFunction<typeof service.deleteTransaction>;

const user = { id: 1, username: 'user1', display_name: 'User 1' };
const token = jwt.sign(user, 'test-secret', { expiresIn: '1h' });
const authHeader = `Bearer ${token}`;

const sampleTransaction = {
  id: 1,
  user_id: 1,
  category_id: 2,
  amount: 50,
  type: 'expense' as const,
  description: 'Courses',
  date: '2026-02-01',
  created_at: '2026-02-01T10:00:00Z',
  updated_at: '2026-02-01T10:00:00Z',
  category_name: 'Alimentation',
  category_icon: 'restaurant',
  category_color: '#FF5722',
};

describe('Transactions routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });

  describe('GET /api/transactions', () => {
    it('should return paginated list', async () => {
      mockGetTransactions.mockResolvedValueOnce({
        data: [sampleTransaction],
        total: 1,
        page: 1,
        limit: 20,
      });

      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should return transaction by id', async () => {
      mockGetById.mockResolvedValueOnce(sampleTransaction);

      const res = await request(app)
        .get('/api/transactions/1')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
    });

    it('should return 404 when not found', async () => {
      mockGetById.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/transactions/999')
        .set('Authorization', authHeader);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a transaction', async () => {
      mockCreate.mockResolvedValueOnce(sampleTransaction);

      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', authHeader)
        .send({
          amount: 50,
          type: 'expense',
          category_id: 2,
          description: 'Courses',
          date: '2026-02-01',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(1);
    });

    it('should return 400 on invalid data', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', authHeader)
        .send({ amount: -10, type: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update a transaction', async () => {
      mockUpdate.mockResolvedValueOnce({ ...sampleTransaction, amount: 75 });

      const res = await request(app)
        .put('/api/transactions/1')
        .set('Authorization', authHeader)
        .send({ amount: 75 });

      expect(res.status).toBe(200);
      expect(res.body.amount).toBe(75);
    });

    it('should return 404 when not found', async () => {
      mockUpdate.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/transactions/999')
        .set('Authorization', authHeader)
        .send({ amount: 75 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete and return 204', async () => {
      mockDelete.mockResolvedValueOnce(true);

      const res = await request(app)
        .delete('/api/transactions/1')
        .set('Authorization', authHeader);

      expect(res.status).toBe(204);
    });

    it('should return 404 when not found', async () => {
      mockDelete.mockResolvedValueOnce(false);

      const res = await request(app)
        .delete('/api/transactions/999')
        .set('Authorization', authHeader);

      expect(res.status).toBe(404);
    });
  });
});
