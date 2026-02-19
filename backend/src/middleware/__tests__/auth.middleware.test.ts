import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../auth.middleware';

process.env.JWT_SECRET = 'test-secret';

function createMocks(authHeader?: string) {
  const req = { headers: { authorization: authHeader } } as unknown as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('authMiddleware', () => {
  it('should call next() and set req.user for valid token', () => {
    const payload = { id: 1, username: 'user1', display_name: 'User 1' };
    const token = jwt.sign(payload, 'test-secret');
    const { req, res, next } = createMocks(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(payload);
  });

  it('should return 401 when no Authorization header', () => {
    const { req, res, next } = createMocks();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token manquant ou invalide' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when header does not start with Bearer', () => {
    const { req, res, next } = createMocks('Basic abc123');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token', () => {
    const { req, res, next } = createMocks('Bearer invalid.token.here');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token invalide ou expiré' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for expired token', () => {
    const token = jwt.sign({ id: 1, username: 'user1', display_name: 'User 1' }, 'test-secret', { expiresIn: '-1s' });
    const { req, res, next } = createMocks(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
