-- Migration: Create cron settings table
-- Description: Stores configuration for automated tasks (crons) like weather, rates and sync.
-- Date: 23 Jul 2026

CREATE TABLE IF NOT EXISTS cron_settings (
    id SERIAL PRIMARY KEY,
    cron_key VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    scheduled_hour VARCHAR(5) DEFAULT '03:00',
    last_run TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar configuraciones por defecto
INSERT INTO cron_settings (cron_key, is_active, scheduled_hour) 
VALUES 
    ('update_weather', true, '03:00'),
    ('update_rates', true, '03:15'),
    ('megatravel_sync', true, '04:00')
ON CONFLICT (cron_key) DO NOTHING;

COMMENT ON TABLE cron_settings IS 'Configuración de procesos automáticos para el tablero de control';
