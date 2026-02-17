import { getPool } from '../database/connection';

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  category_id?: number;
  date_from?: string;
  date_to?: string;
}

const SELECT_WITH_CATEGORY = `
  SELECT t.*, t.date::text as date,
         c.name as category_name, c.icon as category_icon, c.color as category_color
  FROM transactions t
  LEFT JOIN categories c ON t.category_id = c.id
`;

export async function getTransactions(
  userId: number,
  filters: TransactionFilters
): Promise<{ data: Transaction[]; total: number; page: number; limit: number }> {
  const pool  = getPool();
  const page  = filters.page  ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  let idx = 1;
  const conditions: string[] = [`t.user_id = $${idx++}`];
  const params: unknown[]    = [userId];

  if (filters.type)        { conditions.push(`t.type = $${idx++}`);        params.push(filters.type); }
  if (filters.category_id) { conditions.push(`t.category_id = $${idx++}`); params.push(filters.category_id); }
  if (filters.date_from)   { conditions.push(`t.date >= $${idx++}`);       params.push(filters.date_from); }
  if (filters.date_to)     { conditions.push(`t.date <= $${idx++}`);       params.push(filters.date_to); }

  const where = conditions.join(' AND ');

  const { rows: countRows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM transactions t WHERE ${where}`,
    params
  );
  const total = parseInt(countRows[0].count, 10);

  const { rows: data } = await pool.query<Transaction>(
    `${SELECT_WITH_CATEGORY} WHERE ${where} ORDER BY t.date DESC, t.created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
    [...params, limit, offset]
  );

  return { data, total, page, limit };
}

export async function getTransactionById(id: number, userId: number): Promise<Transaction | null> {
  const pool = getPool();
  const { rows } = await pool.query<Transaction>(
    `${SELECT_WITH_CATEGORY} WHERE t.id = $1 AND t.user_id = $2`,
    [id, userId]
  );
  return rows[0] ?? null;
}

export async function createTransaction(
  userId: number,
  data: { amount: number; type: 'income' | 'expense'; category_id: number; description?: string; date: string }
): Promise<Transaction> {
  const pool = getPool();
  const { rows } = await pool.query<{ id: number }>(
    'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [userId, data.category_id, data.amount, data.type, data.description ?? null, data.date]
  );
  return (await getTransactionById(rows[0].id, userId))!;
}

export async function updateTransaction(
  id: number,
  userId: number,
  data: Partial<{ amount: number; type: string; category_id: number; description: string; date: string }>
): Promise<Transaction | null> {
  const pool = getPool();
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return getTransactionById(id, userId);

  const setClauses = entries.map(([k], i) => `${k} = $${i + 3}`).join(', ');
  const values     = entries.map(([, v]) => v);

  const { rowCount } = await pool.query(
    `UPDATE transactions SET ${setClauses}, updated_at = NOW() WHERE id = $1 AND user_id = $2`,
    [id, userId, ...values]
  );
  if ((rowCount ?? 0) === 0) return null;
  return getTransactionById(id, userId);
}

export async function deleteTransaction(id: number, userId: number): Promise<boolean> {
  const pool = getPool();
  const { rowCount } = await pool.query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (rowCount ?? 0) > 0;
}
