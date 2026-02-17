import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import categoriesRoutes from './routes/categories.routes';
import transactionsRoutes from './routes/transactions.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorMiddleware);

export default app;
