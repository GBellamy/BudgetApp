import { Request, Response } from 'express';
import { login, getUserById } from '../services/auth.service';

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const result = await login(req.body.username, req.body.password);
  if (!result) {
    res.status(401).json({ error: 'Identifiants incorrects' });
    return;
  }
  res.json(result);
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  const user = await getUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
    return;
  }
  res.json(user);
}
