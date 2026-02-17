import { Request, Response } from 'express';
import * as service from '../services/categories.service';

export async function listCategories(req: Request, res: Response): Promise<void> {
  const categories = await service.getCategoriesForUser(req.user!.id);
  res.json(categories);
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const category = await service.createCategory(req.user!.id, req.body);
  res.status(201).json(category);
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  const category = await service.updateCategory(id, req.user!.id, req.body);
  if (!category) {
    res.status(404).json({ error: 'Catégorie introuvable' });
    return;
  }
  res.json(category);
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  const deleted = await service.deleteCategory(id, req.user!.id);
  if (!deleted) {
    res.status(404).json({ error: 'Catégorie introuvable ou non supprimable' });
    return;
  }
  res.status(204).send();
}
