import { Request } from 'express';

export interface AuthUser {
  id: number;
  username: string;
  display_name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
