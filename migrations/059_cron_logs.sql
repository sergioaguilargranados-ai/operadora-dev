-- Migration: Create cron logs table
-- Description: Stores execution history for automated tasks (crons)
-- Date: 23 Jul 2026

CREATE TABLE IF NOT EXISTS cron_logs (
    id SERIAL PRIMARY KEY,
    cron_key VARCHAR(100) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds NUMERIC,
    status VARCHAR(20) NOT NULL, -- 'running', 'success', 'error'
    message TEXT,
    details JSONB
);

CREATE INDEX idx_cron_logs_key ON cron_logs(cron_key);
CREATE INDEX idx_cron_logs_started_at ON cron_logs(started_at DESC);

COMMENT ON TABLE cron_logs IS 'Bitácora de procesos automáticos';
