import { Request, Response } from 'express';
import * as service from '../services/transactions.service';

export async function listTransactions(req: Request, res: Response): Promise<void> {
  const filters = {
    page:        req.query.page        ? parseInt(req.query.page as string, 10)        : 1,
    limit:       req.query.limit       ? parseInt(req.query.limit as string, 10)       : 20,
    type:        req.query.type        as 'income' | 'expense' | undefined,
    category_id: req.query.category_id ? parseInt(req.query.category_id as string, 10) : undefined,
    date_from:   req.query.date_from   as string | undefined,
    date_to:     req.query.date_to     as string | undefined,
  };
  res.json(await service.getTransactions(req.user!.id, filters));
}

export async function getTransaction(req: Request, res: Response): Promise<void> {
  const transaction = await service.getTransactionById(parseInt(req.params.id, 10), req.user!.id);
  if (!transaction) { res.status(404).json({ error: 'Transaction introuvable' }); return; }
  res.json(transaction);
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
  const transaction = await service.createTransaction(req.user!.id, req.body);
  res.status(201).json(transaction);
}

export async function updateTransaction(req: Request, res: Response): Promise<void> {
  const transaction = await service.updateTransaction(parseInt(req.params.id, 10), req.user!.id, req.body);
  if (!transaction) { res.status(404).json({ error: 'Transaction introuvable' }); return; }
  res.json(transaction);
}

export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  const deleted = await service.deleteTransaction(parseInt(req.params.id, 10), req.user!.id);
  if (!deleted) { res.status(404).json({ error: 'Transaction introuvable' }); return; }
  res.status(204).send();
}
