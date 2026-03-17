/**
 * Database Migration Script
 * Run with: docker compose exec backend npm run migrate
 * Or via override command in docker-compose.override.yml
 */
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'postgres',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'appdb',
  user:     process.env.DB_USER     || 'admin',
  password: process.env.DB_PASSWORD || 'password',
});

async function migrate() {
  console.log('[Migrate] Starting database migration...');
  console.log(`[Migrate] Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);

  try {
    await pool.query('SELECT 1');
    console.log('[Migrate] ✅ Database connection successful');

    // Create migrations tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) UNIQUE NOT NULL,
        applied_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Define migrations
    const migrations = [
      {
        name: '001_add_users_table',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id         SERIAL PRIMARY KEY,
            email      VARCHAR(255) UNIQUE NOT NULL,
            name       VARCHAR(255),
            role       VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        `
      },
      {
        name: '002_add_posts_table',
        sql: `
          CREATE TABLE IF NOT EXISTS posts (
            id         SERIAL PRIMARY KEY,
            user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
            title      VARCHAR(500) NOT NULL,
            content    TEXT,
            published  BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
          CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
        `
      },
      {
        name: '003_add_updated_at_trigger',
        sql: `
          CREATE OR REPLACE FUNCTION update_updated_at()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
          END;
          $$ language plpgsql;

          DROP TRIGGER IF EXISTS update_users_updated_at ON users;
          CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
        `
      }
    ];

    // Run each migration if not already applied
    for (const migration of migrations) {
      const existing = await pool.query(
        'SELECT id FROM migrations WHERE name = $1',
        [migration.name]
      );

      if (existing.rows.length === 0) {
        console.log(`[Migrate] Running: ${migration.name}`);
        await pool.query(migration.sql);
        await pool.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name]
        );
        console.log(`[Migrate] ✅ Applied: ${migration.name}`);
      } else {
        console.log(`[Migrate] ⏭  Skipped (already applied): ${migration.name}`);
      }
    }

    // Show applied migrations
    const applied = await pool.query(
      'SELECT name, applied_at FROM migrations ORDER BY applied_at'
    );
    console.log('\n[Migrate] Applied migrations:');
    applied.rows.forEach(row => {
      console.log(`  ✅ ${row.name} (${row.applied_at.toISOString()})`);
    });

    console.log('\n[Migrate] ✅ All migrations complete');
  } catch (err) {
    console.error('[Migrate] ❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
