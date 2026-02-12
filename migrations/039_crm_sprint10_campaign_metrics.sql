-- ═══════════════════════════════════════════════════════════════
-- SPRINT 10: Campaign Metrics + A/B Testing + Deep Links
-- ═══════════════════════════════════════════════════════════════

-- Tabla de estadísticas por campaña
CREATE TABLE IF NOT EXISTS crm_campaign_stats (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(100) UNIQUE NOT NULL,
    template_id VARCHAR(100),
    template_name VARCHAR(255),
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de eventos individuales por contacto
CREATE TABLE IF NOT EXISTS crm_campaign_events (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(100) NOT NULL,
    contact_id INTEGER REFERENCES crm_contacts(id),
    event_type VARCHAR(20) NOT NULL, -- sent, delivered, opened, clicked, bounced, unsubscribed
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign ON crm_campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_contact ON crm_campaign_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_type ON crm_campaign_events(event_type);
CREATE INDEX IF NOT EXISTS idx_campaign_events_date ON crm_campaign_events(created_at);

-- Evitar duplicados de eventos (un open por contacto por campaña)
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_events_unique
    ON crm_campaign_events(campaign_id, contact_id, event_type)
    WHERE event_type IN ('opened', 'unsubscribed');

-- Tabla de A/B tests
CREATE TABLE IF NOT EXISTS crm_ab_tests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    variant_a JSONB NOT NULL,
    variant_b JSONB NOT NULL,
    winning_criteria VARCHAR(20) DEFAULT 'open_rate', -- open_rate, click_rate, ctr
    status VARCHAR(20) DEFAULT 'draft', -- draft, running, completed
    winner VARCHAR(5), -- A, B, tie
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de deep link routes para la app móvil
CREATE TABLE IF NOT EXISTS crm_deep_links (
    id SERIAL PRIMARY KEY,
    route_pattern VARCHAR(255) NOT NULL, -- e.g. /crm/contact/:id
    mobile_route VARCHAR(255) NOT NULL,  -- e.g. CRMContactDetail
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar deep links predefinidos
INSERT INTO crm_deep_links (route_pattern, mobile_route, description) VALUES
    ('/dashboard/crm', 'CRMDashboard', 'Dashboard principal del CRM'),
    ('/dashboard/crm/contacts/:id', 'CRMContactDetail', 'Detalle de contacto 360°'),
    ('/dashboard/crm/pipeline', 'CRMPipeline', 'Pipeline visual de ventas'),
    ('/dashboard/crm/tasks', 'CRMTasks', 'Listado de tareas'),
    ('/dashboard/crm/calendar', 'CRMCalendar', 'Calendario CRM'),
    ('/dashboard/crm/predictive', 'CRMPredictive', 'Scoring predictivo'),
    ('/dashboard/crm/whatsapp', 'CRMWhatsApp', 'WhatsApp CRM'),
    ('/dashboard/crm/notifications', 'CRMNotifications', 'Notificaciones CRM')
ON CONFLICT DO NOTHING;
