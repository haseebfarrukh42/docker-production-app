const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const SERVICE   = process.env.SERVICE_NAME || 'backend';
const LEVELS    = { debug: 0, info: 1, warn: 2, error: 3 };
const current   = LEVELS[LOG_LEVEL] ?? 1;

function log(level, message, meta = {}) {
  if (LEVELS[level] < current) return;
  const entry = {
    timestamp:   new Date().toISOString(),
    level:       level.toUpperCase(),
    service:     SERVICE,
    environment: process.env.NODE_ENV || 'development',
    hostname:    process.env.HOSTNAME,
    message,
    ...meta
  };
  const out = level === 'error' ? process.stderr : process.stdout;
  out.write(JSON.stringify(entry) + '\n');
}

module.exports = {
  debug: (m, meta) => log('debug', m, meta),
  info:  (m, meta) => log('info',  m, meta),
  warn:  (m, meta) => log('warn',  m, meta),
  error: (m, meta) => log('error', m, meta),
};
