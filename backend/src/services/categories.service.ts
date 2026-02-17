import { getPool } from '../database/connection';

export interface Category {
  id: number;
  user_id: number | null;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  is_default: number;
}

export async function getCategoriesForUser(userId: number): Promise<Category[]> {
  const pool = getPool();
  const { rows } = await pool.query<Category>(
    'SELECT * FROM categories WHERE user_id = $1 OR user_id IS NULL ORDER BY is_default DESC, name ASC',
    [userId]
  );
  return rows;
}

export async function createCategory(
  userId: number,
  data: { name: string; icon: string; color: string; type: 'income' | 'expense' | 'both' }
): Promise<Category> {
  const pool = getPool();
  const { rows } = await pool.query<Category>(
    'INSERT INTO categories (user_id, name, icon, color, type, is_default) VALUES ($1, $2, $3, $4, $5, 0) RETURNING *',
    [userId, data.name, data.icon, data.color, data.type]
  );
  return rows[0];
}

export async function updateCategory(
  id: number,
  userId: number,
  data: Partial<{ name: string; icon: string; color: string; type: string }>
): Promise<Category | null> {
  const pool = getPool();
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) {
    const { rows } = await pool.query<Category>(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rows[0] ?? null;
  }

  const setClauses = entries.map(([k], i) => `${k} = $${i + 3}`).join(', ');
  const values     = entries.map(([, v]) => v);

  const { rows } = await pool.query<Category>(
    `UPDATE categories SET ${setClauses} WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId, ...values]
  );
  return rows[0] ?? null;
}

export async function deleteCategory(id: number, userId: number): Promise<boolean> {
  const pool = getPool();
  const { rowCount } = await pool.query(
    'DELETE FROM categories WHERE id = $1 AND user_id = $2 AND is_default = 0',
    [id, userId]
  );
  return (rowCount ?? 0) > 0;
}
