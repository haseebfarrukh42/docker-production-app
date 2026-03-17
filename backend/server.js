const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Read Docker secret helper
// Read Docker secret helper
function readSecret(name, fallback) {
  try {
    const p = `/run/secrets/${name}`;
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8').trim();
    }
  } catch(e) {
    console.error(`[Backend] Error reading secret '${name}':`, e.message);
  }
  return fallback;
}

const DB_PASSWORD = readSecret('db_password', process.env.DB_PASSWORD);
const DB_USER     = readSecret('db_user',     process.env.DB_USER || 'admin');
const JWT_SECRET  = readSecret('jwt_secret',  process.env.JWT_SECRET);

const pool = new Pool({
  host:     process.env.DB_HOST || 'postgres',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'appdb',
  user:     DB_USER,
  password: DB_PASSWORD,
  max: 10,
  connectionTimeoutMillis: 2000,
});

const startTime = Date.now();

// ── Health check ─────────────────────────────────────────────
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbLatency = null;

  try {
    const t = Date.now();
    await pool.query('SELECT 1');
    dbStatus  = 'connected';
    dbLatency = Date.now() - t;
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const mem = process.memoryUsage();
  const status = dbStatus === 'connected' ? 'healthy' : 'unhealthy';

  res.status(status === 'healthy' ? 200 : 503).json({
    status,
    service:        'backend',
    version:        process.env.APP_VERSION || '1.0.0',
    environment:    process.env.NODE_ENV,
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp:      new Date().toISOString(),
    checks: {
      database: { status: dbStatus, latency_ms: dbLatency },
      memory: {
        heap_used_mb:  Math.round(mem.heapUsed  / 1024 / 1024),
        rss_mb:        Math.round(mem.rss       / 1024 / 1024)
      }
    },
    secrets_loaded: {
      db_password: DB_PASSWORD ? '✅' : '❌',
      jwt_secret:  JWT_SECRET  ? '✅' : '❌'
    }
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    message:     'Docker Production App — Backend Service',
    version:     process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV
  });
});

app.get('/api/instance', (req, res) => {
  res.json({
    instance_id:    process.env.HOSTNAME,
    pid:            process.pid,
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000)
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT NOW() as time, current_user as user, current_database() as db'
    );
    res.json({ success: true, data: r.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/config', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM app_config ORDER BY key');
    res.json({ success: true, config: r.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/live-test', (req, res) => {
  res.json({ message: 'Live test endpoint', timestamp: new Date().toISOString() });
});

process.on('SIGTERM', async () => {
  console.log('[Backend] Graceful shutdown...');
  await pool.end();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend] Running on port ${PORT}`);
  console.log(`[Backend] Node.js ${process.version}`);
  console.log(`[Backend] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Backend] DB: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});
