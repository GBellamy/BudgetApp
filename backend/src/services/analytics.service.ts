import { getPool } from '../database/connection';

export async function getSummary(userId: number, dateFrom?: string, dateTo?: string) {
  const pool = getPool();

  let idx = 2;
  const conditions: string[] = ['user_id = $1'];
  const params: unknown[]    = [userId];

  if (dateFrom) { conditions.push(`date >= $${idx++}`); params.push(dateFrom); }
  if (dateTo)   { conditions.push(`date <= $${idx++}`); params.push(dateTo); }

  const where = conditions.join(' AND ');

  const { rows: ir } = await pool.query<{ total: string }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE ${where} AND type = 'income'`,
    params
  );
  const { rows: er } = await pool.query<{ total: string }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE ${where} AND type = 'expense'`,
    params
  );

  const income  = parseFloat(ir[0].total);
  const expense = parseFloat(er[0].total);
  return { income, expense, balance: income - expense };
}

export async function getByCategory(
  userId: number,
  type: 'income' | 'expense',
  dateFrom?: string,
  dateTo?: string
) {
  const pool = getPool();

  let idx = 3;
  const conditions: string[] = ['t.user_id = $1', 't.type = $2'];
  const params: unknown[]    = [userId, type];

  if (dateFrom) { conditions.push(`t.date >= $${idx++}`); params.push(dateFrom); }
  if (dateTo)   { conditions.push(`t.date <= $${idx++}`); params.push(dateTo); }

  const where = conditions.join(' AND ');

  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.icon, c.color,
            SUM(t.amount)::float as total, COUNT(t.id)::int as count
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE ${where}
     GROUP BY c.id, c.name, c.icon, c.color
     ORDER BY total DESC`,
    params
  );
  return rows;
}

export async function getByMonth(userId: number, year: number) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT
       TO_CHAR(date, 'YYYY-MM') as month,
       SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END)::float as income,
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)::float as expense
     FROM transactions
     WHERE user_id = $1 AND TO_CHAR(date, 'YYYY') = $2
     GROUP BY TO_CHAR(date, 'YYYY-MM')
     ORDER BY month ASC`,
    [userId, String(year)]
  );
  return rows;
}

export async function getRecentActivity(userId: number, limit: number = 5) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT t.*, t.date::text as date,
            c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.user_id = $1
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
}
