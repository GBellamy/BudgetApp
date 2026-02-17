import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { runMigrations } from './database/migrations';

const PORT = parseInt(process.env.PORT || '3000', 10);

runMigrations()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`BudgetApp backend running on http://0.0.0.0:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to run migrations:', err);
    process.exit(1);
  });
