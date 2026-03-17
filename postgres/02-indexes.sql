-- This runs AFTER 01-schema.sql (alphabetical order)
-- Connect to appdb (already created in 01-schema.sql)
\c appdb;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_services_name
  ON services(name);

CREATE INDEX IF NOT EXISTS idx_activity_log_time
  ON activity_log(logged_at DESC);

-- Add a configuration table
CREATE TABLE IF NOT EXISTS app_config (
    key   VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_config (key, value) VALUES
  ('app_version', '1.0.0'),
  ('maintenance_mode', 'false'),
  ('max_connections', '100')
ON CONFLICT (key) DO NOTHING;

INSERT INTO activity_log (action)
  VALUES ('Indexes and config table created by 02-indexes.sql');
