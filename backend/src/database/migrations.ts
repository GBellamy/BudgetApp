import { getPool } from './connection';

export async function runMigrations(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id           SERIAL PRIMARY KEY,
      username     TEXT NOT NULL UNIQUE,
      password     TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER,
      name       TEXT NOT NULL,
      icon       TEXT NOT NULL,
      color      TEXT NOT NULL,
      type       TEXT NOT NULL CHECK(type IN ('income', 'expense', 'both')),
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      amount      NUMERIC(12,2) NOT NULL,
      type        TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      description TEXT,
      date        DATE NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_user_date
      ON transactions(user_id, date DESC);

    CREATE INDEX IF NOT EXISTS idx_transactions_user_category
      ON transactions(user_id, category_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_user_type
      ON transactions(user_id, type);
  `);

  console.log('Migrations applied successfully');
}
