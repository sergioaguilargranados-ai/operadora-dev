-- ═══════════════════════════════════════════
-- CRM Sprint 3: Smart Notifications + Automation
-- Migration v2.315 — 2026-02-11
-- ═══════════════════════════════════════════

-- ──────────────────────────────────
-- 1. Smart Notifications
-- ──────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_smart_notifications (
    id              SERIAL PRIMARY KEY,
    tenant_id       INTEGER REFERENCES tenants(id),
    contact_id      INTEGER REFERENCES crm_contacts(id) ON DELETE CASCADE,
    user_id         INTEGER,
    notification_type VARCHAR(60) NOT NULL DEFAULT 'system',
    priority        VARCHAR(20) NOT NULL DEFAULT 'medium',
    title           VARCHAR(300) NOT NULL,
    message         TEXT,
    action_url      VARCHAR(500),
    action_label    VARCHAR(100),
    auto_dismiss_hours INTEGER DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    is_read         BOOLEAN NOT NULL DEFAULT false,
    read_at         TIMESTAMPTZ,
    is_dismissed    BOOLEAN NOT NULL DEFAULT false,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_notif_user       ON crm_smart_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_notif_contact    ON crm_smart_notifications(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_notif_type       ON crm_smart_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_crm_notif_priority   ON crm_smart_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_crm_notif_read       ON crm_smart_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_crm_notif_created    ON crm_smart_notifications(created_at DESC);

-- ──────────────────────────────────
-- 2. Automation Rules
-- ──────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_automation_rules (
    id                  SERIAL PRIMARY KEY,
    tenant_id           INTEGER REFERENCES tenants(id),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    trigger_event       VARCHAR(60) NOT NULL,
    trigger_conditions  JSONB DEFAULT '{}',
    action_type         VARCHAR(60) NOT NULL,
    action_config       JSONB NOT NULL DEFAULT '{}',
    is_active           BOOLEAN NOT NULL DEFAULT true,
    priority            INTEGER NOT NULL DEFAULT 50,
    execution_count     INTEGER NOT NULL DEFAULT 0,
    last_executed_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_auto_trigger  ON crm_automation_rules(trigger_event);
CREATE INDEX IF NOT EXISTS idx_crm_auto_active   ON crm_automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_crm_auto_priority ON crm_automation_rules(priority);

-- ──────────────────────────────────
-- 3. Automation Execution Log
-- ──────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_automation_log (
    id              SERIAL PRIMARY KEY,
    rule_id         INTEGER REFERENCES crm_automation_rules(id) ON DELETE SET NULL,
    contact_id      INTEGER REFERENCES crm_contacts(id) ON DELETE SET NULL,
    trigger_event   VARCHAR(60) NOT NULL,
    action_result   JSONB DEFAULT '{}',
    status          VARCHAR(20) NOT NULL DEFAULT 'success',
    error_message   TEXT,
    executed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_autolog_rule    ON crm_automation_log(rule_id);
CREATE INDEX IF NOT EXISTS idx_crm_autolog_contact ON crm_automation_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_autolog_status  ON crm_automation_log(status);
CREATE INDEX IF NOT EXISTS idx_crm_autolog_time    ON crm_automation_log(executed_at DESC);

-- ──────────────────────────────────
-- 4. Seed: Default Automation Rules
-- ──────────────────────────────────
INSERT INTO crm_automation_rules (name, description, trigger_event, action_type, action_config, priority)
VALUES
    ('Tarea de bienvenida', 
     'Crea una tarea de primer contacto cuando se registra un lead nuevo',
     'contact_created', 'create_task',
     '{"title":"Primer contacto con lead","task_type":"followup","due_hours":4,"priority":"high"}',
     10),

    ('Notificación de score alto',
     'Alerta cuando un contacto alcanza score alto',
     'score_threshold', 'send_notification',
     '{"title":"🔥 Nuevo lead caliente","message":"Un contacto ha alcanzado score alto","priority":"high"}',
     20),

    ('Tag VIP automático',
     'Agrega tag VIP cuando un contacto llega a etapa de negociación',
     'stage_changed', 'add_tag',
     '{"tag":"VIP"}',
     30),

    ('Seguimiento post-cotización',
     'Crea tarea de seguimiento 48h después de enviar cotización',
     'quote_sent', 'create_task',
     '{"title":"Seguimiento de cotización","task_type":"followup","due_hours":48,"priority":"medium"}',
     40)
ON CONFLICT DO NOTHING;

-- Done!
SELECT 'CRM Sprint 3 migration complete: crm_smart_notifications + crm_automation_rules + crm_automation_log' AS result;
