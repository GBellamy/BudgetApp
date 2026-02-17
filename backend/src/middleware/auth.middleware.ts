import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types/express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token manquant ou invalide' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser & { iat: number; exp: number };
    req.user = {
      id: decoded.id,
      username: decoded.username,
      display_name: decoded.display_name,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}
