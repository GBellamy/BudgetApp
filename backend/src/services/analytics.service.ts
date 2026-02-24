import { getPool } from '../database/connection';

// All analytics aggregate the full household (no user_id filter on reads)

export async function getSummary(_userId: number, dateFrom?: string, dateTo?: string) {
  const pool = getPool();

  let idx = 1;
  const conditions: string[] = [];
  const params: unknown[]    = [];

  if (dateFrom) { conditions.push(`date >= $${idx++}`); params.push(dateFrom); }
  if (dateTo)   { conditions.push(`date <= $${idx++}`); params.push(dateTo); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: ir } = await pool.query<{ total: string }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions ${where} ${where ? 'AND' : 'WHERE'} type = 'income'`,
    params
  );
  const { rows: er } = await pool.query<{ total: string }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions ${where} ${where ? 'AND' : 'WHERE'} type = 'expense'`,
    params
  );

  const income  = parseFloat(ir[0].total);
  const expense = parseFloat(er[0].total);
  return { income, expense, balance: income - expense };
}

export async function getByCategory(
  _userId: number,
  type: 'income' | 'expense',
  dateFrom?: string,
  dateTo?: string
) {
  const pool = getPool();

  let idx = 2;
  const conditions: string[] = ['t.type = $1'];
  const params: unknown[]    = [type];

  if (dateFrom) { conditions.push(`t.date >= $${idx++}`); params.push(dateFrom); }
  if (dateTo)   { conditions.push(`t.date <= $${idx++}`); params.push(dateTo); }

  const where = conditions.join(' AND ');

  const { rows } = await pool.query(
    `WITH per_user AS (
       SELECT t.category_id, t.user_id, u.display_name,
              SUM(t.amount)::float  AS user_total,
              COUNT(t.id)::int      AS user_count
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE ${where}
       GROUP BY t.category_id, t.user_id, u.display_name
     )
     SELECT c.id, c.name, c.icon, c.color,
            SUM(pu.user_total)::float AS total,
            SUM(pu.user_count)::int   AS count,
            json_agg(
              json_build_object(
                'user_id',      pu.user_id,
                'display_name', pu.display_name,
                'total',        pu.user_total
              ) ORDER BY pu.user_total DESC
            ) AS user_totals
     FROM per_user pu
     LEFT JOIN categories c ON pu.category_id = c.id
     GROUP BY c.id, c.name, c.icon, c.color
     ORDER BY total DESC`,
    params
  );
  return rows;
}

export async function getByMonth(_userId: number, year: number) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT
       TO_CHAR(date, 'YYYY-MM') as month,
       SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END)::float as income,
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)::float as expense
     FROM transactions
     WHERE TO_CHAR(date, 'YYYY') = $1
     GROUP BY TO_CHAR(date, 'YYYY-MM')
     ORDER BY month ASC`,
    [String(year)]
  );
  return rows;
}

export async function getRecentActivity(_userId: number, limit: number = 5) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT t.*, t.date::text as date,
            c.name as category_name, c.icon as category_icon, c.color as category_color,
            u.display_name as user_display_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN users u ON t.user_id = u.id
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}
