import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

process.env.JWT_SECRET = 'test-secret';

jest.mock('../services/auth.service', () => ({
  login: jest.fn(),
  getUserById: jest.fn(),
}));

import { login, getUserById } from '../services/auth.service';

const mockLogin = login as jest.MockedFunction<typeof login>;
const mockGetUserById = getUserById as jest.MockedFunction<typeof getUserById>;

function makeToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, 'test-secret', { expiresIn: '1h' });
}

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return token on valid credentials', async () => {
      const authResult = {
        token: 'jwt-token',
        user: { id: 1, username: 'user1', display_name: 'User 1' },
      };
      mockLogin.mockResolvedValueOnce(authResult);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'user1', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe('jwt-token');
      expect(res.body.user.username).toBe('user1');
    });

    it('should return 401 on invalid credentials', async () => {
      mockLogin.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'user1', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 on missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Données invalides');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const user = { id: 1, username: 'user1', display_name: 'User 1' };
      mockGetUserById.mockResolvedValueOnce(user);

      const token = makeToken(user);
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('user1');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 404 when user not found', async () => {
      mockGetUserById.mockResolvedValueOnce(null);

      const token = makeToken({ id: 999, username: 'ghost', display_name: 'Ghost' });
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
