/**
 * Database Seed Script
 * Populates database with test data for development
 * Run with: docker compose exec backend npm run seed
 */
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'postgres',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'appdb',
  user:     process.env.DB_USER     || 'admin',
  password: process.env.DB_PASSWORD || 'password',
});

async function seed() {
  console.log('[Seed] Starting database seeding...');

  try {
    // Check if users table exists (migration must run first)
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'users'
      ) as exists
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('[Seed] ❌ Users table not found. Run migrations first.');
      console.error('[Seed]    npm run migrate');
      process.exit(1);
    }

    // Clear existing seed data
    await pool.query('DELETE FROM posts WHERE user_id IN \
      (SELECT id FROM users WHERE email LIKE \'%@example.com\')');
    await pool.query(
      'DELETE FROM users WHERE email LIKE \'%@example.com\''
    );

    // Insert test users
    const users = await pool.query(`
      INSERT INTO users (email, name, role) VALUES
        ('admin@example.com', 'Admin User', 'admin'),
        ('alice@example.com', 'Alice Johnson', 'user'),
        ('bob@example.com',   'Bob Smith',    'user'),
        ('carol@example.com', 'Carol White',  'editor')
      RETURNING id, email, name
    `);

    console.log('[Seed] ✅ Created users:');
    users.rows.forEach(u => console.log(`  - ${u.name} (${u.email})`));

    // Insert test posts
    const adminId = users.rows[0].id;
    const aliceId = users.rows[1].id;

    await pool.query(`
      INSERT INTO posts (user_id, title, content, published) VALUES
        ($1, 'Welcome to Docker App',
             'This is a production-grade Docker setup.', true),
        ($1, 'Phase 6: Dev Workflow',
             'Live reloading and bind mounts explained.', true),
        ($2, 'My First Post',
             'Learning Docker Compose the right way.', false),
        ($2, 'Docker Networking Deep Dive',
             'Understanding frontend and backend networks.', true)
    `, [adminId, aliceId]);

    console.log('[Seed] ✅ Created 4 sample posts');

    // Final summary
    const counts = await pool.query(`
      SELECT
        (SELECT count(*) FROM users) as users,
        (SELECT count(*) FROM posts) as posts,
        (SELECT count(*) FROM services) as services
    `);
    console.log('\n[Seed] Database summary:');
    console.log(`  users:    ${counts.rows[0].users}`);
    console.log(`  posts:    ${counts.rows[0].posts}`);
    console.log(`  services: ${counts.rows[0].services}`);
    console.log('\n[Seed] ✅ Seeding complete');

  } catch (err) {
    console.error('[Seed] ❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
