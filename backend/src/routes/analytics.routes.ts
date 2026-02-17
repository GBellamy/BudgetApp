import { Router } from 'express';
import { summary, byCategory, byMonth, recentActivity } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/summary', summary);
router.get('/by-category', byCategory);
router.get('/by-month', byMonth);
router.get('/recent-activity', recentActivity);

export default router;
