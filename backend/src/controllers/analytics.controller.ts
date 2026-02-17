import { Request, Response } from 'express';
import * as service from '../services/analytics.service';

export async function summary(req: Request, res: Response): Promise<void> {
  res.json(await service.getSummary(
    req.user!.id,
    req.query.date_from as string | undefined,
    req.query.date_to   as string | undefined
  ));
}

export async function byCategory(req: Request, res: Response): Promise<void> {
  res.json(await service.getByCategory(
    req.user!.id,
    (req.query.type as 'income' | 'expense') || 'expense',
    req.query.date_from as string | undefined,
    req.query.date_to   as string | undefined
  ));
}

export async function byMonth(req: Request, res: Response): Promise<void> {
  const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
  res.json(await service.getByMonth(req.user!.id, year));
}

export async function recentActivity(req: Request, res: Response): Promise<void> {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
  res.json(await service.getRecentActivity(req.user!.id, limit));
}
