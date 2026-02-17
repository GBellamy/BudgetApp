import { Router } from 'express';
import { z } from 'zod';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authMiddleware);

const createSchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  type: z.enum(['income', 'expense', 'both']),
});

const updateSchema = createSchema.partial();

router.get('/', listCategories);
router.post('/', validate(createSchema), createCategory);
router.put('/:id', validate(updateSchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
