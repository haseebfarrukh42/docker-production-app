-- This script runs automatically when the postgres container
-- starts for the FIRST time (only if the data volume is empty)

-- Create application database
CREATE DATABASE appdb;

-- Connect to appdb
\c appdb;

-- Create tables
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data
INSERT INTO services (name, status) VALUES
  ('frontend', 'active'),
  ('backend', 'active'),
  ('api-service', 'active'),
  ('nginx', 'active'),
  ('redis', 'active');

-- Create a user activity table (for Phase 3 demonstration)
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO activity_log (action) VALUES 
  ('Database initialized via Docker init script');
