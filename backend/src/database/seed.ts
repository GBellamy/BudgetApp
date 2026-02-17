import bcrypt from 'bcryptjs';
import { getPool } from './connection';
import { runMigrations } from './migrations';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_CATEGORIES = [
  { name: 'Alimentation',    icon: 'restaurant',     color: '#FF6384', type: 'expense' },
  { name: 'Transport',       icon: 'directions-car', color: '#36A2EB', type: 'expense' },
  { name: 'Logement',        icon: 'home',            color: '#FFCE56', type: 'expense' },
  { name: 'Santé',           icon: 'local-hospital', color: '#4BC0C0', type: 'expense' },
  { name: 'Shopping',        icon: 'shopping-bag',   color: '#9966FF', type: 'expense' },
  { name: 'Loisirs',         icon: 'sports-esports', color: '#FF9F40', type: 'expense' },
  { name: 'Abonnements',     icon: 'subscriptions',  color: '#FF6384', type: 'expense' },
  { name: 'Éducation',       icon: 'school',          color: '#36A2EB', type: 'expense' },
  { name: 'Restaurants',     icon: 'local-dining',   color: '#FFCE56', type: 'expense' },
  { name: 'Voyages',         icon: 'flight',          color: '#4BC0C0', type: 'expense' },
  { name: 'Autres dépenses', icon: 'more-horiz',     color: '#9E9E9E', type: 'expense' },
  { name: 'Salaire',         icon: 'work',            color: '#4CAF50', type: 'income'  },
  { name: 'Freelance',       icon: 'laptop',          color: '#66BB6A', type: 'income'  },
  { name: 'Investissements', icon: 'trending-up',    color: '#26A69A', type: 'income'  },
  { name: 'Cadeaux',         icon: 'card-giftcard',  color: '#AB47BC', type: 'income'  },
  { name: 'Remboursements',  icon: 'replay',          color: '#42A5F5', type: 'income'  },
  { name: 'Autres revenus',  icon: 'attach-money',   color: '#8BC34A', type: 'income'  },
];

async function seed() {
  await runMigrations();
  const pool = getPool();

  const { rows } = await pool.query('SELECT COUNT(*)::int as count FROM users');
  if (rows[0].count > 0) {
    console.log('Database already seeded, skipping...');
    process.exit(0);
  }

  const password1    = process.env.USER1_PASSWORD || 'password123';
  const password2    = process.env.USER2_PASSWORD || 'password123';
  const user1Name    = process.env.USER1_NAME     || 'Utilisateur 1';
  const user2Name    = process.env.USER2_NAME     || 'Utilisateur 2';
  const user1Username = process.env.USER1_USERNAME || 'user1';
  const user2Username = process.env.USER2_USERNAME || 'user2';

  const hash1 = await bcrypt.hash(password1, 10);
  const hash2 = await bcrypt.hash(password2, 10);

  await pool.query(
    'INSERT INTO users (username, password, display_name) VALUES ($1, $2, $3)',
    [user1Username, hash1, user1Name]
  );
  await pool.query(
    'INSERT INTO users (username, password, display_name) VALUES ($1, $2, $3)',
    [user2Username, hash2, user2Name]
  );

  console.log(`Created users: ${user1Username} and ${user2Username}`);

  for (const cat of DEFAULT_CATEGORIES) {
    await pool.query(
      'INSERT INTO categories (user_id, name, icon, color, type, is_default) VALUES (NULL, $1, $2, $3, $4, 1)',
      [cat.name, cat.icon, cat.color, cat.type]
    );
  }

  console.log(`Created ${DEFAULT_CATEGORIES.length} default categories`);
  console.log('Seed completed successfully!');
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
