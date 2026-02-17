import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../database/connection';
import { AuthUser } from '../types/express';

interface UserRow {
  id: number;
  username: string;
  password: string;
  display_name: string;
}

export async function login(username: string, password: string): Promise<{ token: string; user: AuthUser } | null> {
  const pool = getPool();
  const { rows } = await pool.query<UserRow>(
    'SELECT id, username, password, display_name FROM users WHERE username = $1',
    [username]
  );
  const user = rows[0];
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  const payload: AuthUser = { id: user.id, username: user.username, display_name: user.display_name };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

  return { token, user: payload };
}

export async function getUserById(id: number): Promise<AuthUser | null> {
  const pool = getPool();
  const { rows } = await pool.query<AuthUser>(
    'SELECT id, username, display_name FROM users WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}
