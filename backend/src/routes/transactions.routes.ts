import { Router } from 'express';
import { z } from 'zod';
import {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactions.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authMiddleware);

const createSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  type: z.enum(['income', 'expense']),
  category_id: z.number().int().positive(),
  description: z.string().max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
});

const updateSchema = createSchema.partial();

router.get('/', listTransactions);
router.get('/:id', getTransaction);
router.post('/', validate(createSchema), createTransaction);
router.put('/:id', validate(updateSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
