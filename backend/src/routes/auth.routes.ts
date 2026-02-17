import { Router } from 'express';
import { z } from 'zod';
import { loginHandler, meHandler } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Nom d\'utilisateur requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

router.post('/login', validate(loginSchema), loginHandler);
router.get('/me', authMiddleware, meHandler);

export default router;
