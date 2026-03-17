/**
 * Basic Integration Test Script
 * Tests that all services are reachable and healthy
 * Run with: docker compose exec backend npm test
 */
const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'postgres',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'appdb',
  user:     process.env.DB_USER     || 'admin',
  password: process.env.DB_PASSWORD || 'password',
});

// Simple test runner
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ FAIL: ${name}`);
    console.log(`       → ${err.message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n[Test] Running integration tests...\n');
  console.log('── Database Tests ─────────────────────────────');

  await test('PostgreSQL connection', async () => {
    const result = await pool.query('SELECT 1 as ok');
    if (result.rows[0].ok !== 1) throw new Error('Unexpected result');
  });

  await test('Services table exists and has data', async () => {
    const result = await pool.query('SELECT count(*) as count FROM services');
    if (parseInt(result.rows[0].count) === 0) {
      throw new Error('Services table is empty');
    }
  });

  await test('Migrations table exists', async () => {
    await pool.query('SELECT 1 FROM migrations LIMIT 1');
  });

  await test('Users table exists (migration ran)', async () => {
    await pool.query('SELECT 1 FROM users LIMIT 1');
  });

  console.log('\n── API Tests ──────────────────────────────────');

  await test('Health endpoint returns 200', async () => {
    await new Promise((resolve, reject) => {
      http.get('http://localhost:5000/health', (res) => {
        if (res.statusCode === 200) resolve();
        else reject(new Error(`Status: ${res.statusCode}`));
      }).on('error', reject);
    });
  });

  await test('API info endpoint returns 200', async () => {
    await new Promise((resolve, reject) => {
      http.get('http://localhost:5000/api/info', (res) => {
        if (res.statusCode === 200) resolve();
        else reject(new Error(`Status: ${res.statusCode}`));
      }).on('error', reject);
    });
  });

  // Summary
  console.log('\n── Results ────────────────────────────────────');
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total:  ${passed + failed}`);

  if (failed > 0) {
    console.log('\n[Test] ❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('\n[Test] ✅ All tests passed');
  }

  await pool.end();
}

runTests();
