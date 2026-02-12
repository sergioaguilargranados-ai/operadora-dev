-- ═══════════════════════════════════════════════════════════════
-- MIGRACIÓN 034: CRM Core Tables
-- Build: 11 Feb 2026 - v2.314
-- Descripción: Tablas fundamentales del módulo CRM
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────
-- 1. Pipeline Stages (primero, porque contacts referencia)
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  stage_key VARCHAR(50) NOT NULL,
  stage_label VARCHAR(100) NOT NULL,
  stage_order INTEGER NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  icon VARCHAR(50) DEFAULT '📋',
  auto_task_template JSONB,
  sla_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  is_win_stage BOOLEAN DEFAULT false,
  is_loss_stage BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, stage_key)
);

-- Insertar etapas default (null tenant_id = global defaults)
INSERT INTO crm_pipeline_stages (tenant_id, stage_key, stage_label, stage_order, color, icon, is_default, is_win_stage, is_loss_stage) VALUES
  (NULL, 'new',         'Nuevo',        1,  '#94A3B8', '🆕', true,  false, false),
  (NULL, 'qualified',   'Calificado',   2,  '#3B82F6', '✅', false, false, false),
  (NULL, 'quoted',      'Cotizado',     3,  '#8B5CF6', '💰', false, false, false),
  (NULL, 'negotiation', 'Negociación',  4,  '#F59E0B', '🤝', false, false, false),
  (NULL, 'reserved',    'Reservado',    5,  '#10B981', '📅', false, false, false),
  (NULL, 'paid',        'Pagado',       6,  '#059669', '💳', false, false, false),
  (NULL, 'traveling',   'Viajando',     7,  '#06B6D4', '✈️', false, false, false),
  (NULL, 'post_trip',   'Post-Viaje',   8,  '#8B5CF6', '⭐', false, false, false),
  (NULL, 'won',         'Ganado',       9,  '#22C55E', '🏆', false, true,  false),
  (NULL, 'lost',        'Perdido',      10, '#EF4444', '❌', false, false, true)
ON CONFLICT DO NOTHING;

-- ───────────────────────────────────────────
-- 2. CRM Contacts (tabla central)
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_contacts (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  user_id INTEGER REFERENCES users(id),
  agency_client_id INTEGER,

  -- Datos de contacto
  contact_type VARCHAR(30) NOT NULL DEFAULT 'lead',
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  company VARCHAR(200),
  position VARCHAR(100),
  avatar_url TEXT,

  -- Clasificación
  source VARCHAR(100),
  source_detail VARCHAR(500),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),

  -- Pipeline
  pipeline_stage VARCHAR(50) DEFAULT 'new',
  stage_changed_at TIMESTAMP DEFAULT NOW(),
  days_in_stage INTEGER DEFAULT 0,
  lost_reason VARCHAR(500),

  -- Scoring
  lead_score INTEGER DEFAULT 0,
  score_signals JSONB DEFAULT '{}',
  is_hot_lead BOOLEAN DEFAULT false,

  -- Asignación
  assigned_agent_id INTEGER,
  assigned_at TIMESTAMP,
  last_agent_contact_at TIMESTAMP,

  -- Viaje (específico del negocio)
  interested_destination VARCHAR(200),
  travel_dates_start DATE,
  travel_dates_end DATE,
  num_travelers INTEGER,
  budget_min NUMERIC(12,2),
  budget_max NUMERIC(12,2),
  budget_currency VARCHAR(3) DEFAULT 'MXN',
  travel_type VARCHAR(50),
  special_requirements TEXT,

  -- Métricas
  ltv NUMERIC(12,2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_quotes INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,

  -- Fechas
  first_contact_at TIMESTAMP DEFAULT NOW(),
  last_contact_at TIMESTAMP,
  next_followup_at TIMESTAMP,
  last_booking_at TIMESTAMP,
  birthday DATE,

  -- Control
  status VARCHAR(20) DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_tenant ON crm_contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_agent ON crm_contacts(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_stage ON crm_contacts(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_score ON crm_contacts(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON crm_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_followup ON crm_contacts(next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_hot ON crm_contacts(is_hot_lead) WHERE is_hot_lead = true;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_type ON crm_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_source ON crm_contacts(source);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON crm_contacts(status);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user ON crm_contacts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_fulltext ON crm_contacts USING gin(to_tsvector('spanish', COALESCE(full_name,'') || ' ' || COALESCE(email,'') || ' ' || COALESCE(phone,'') || ' ' || COALESCE(company,'')));

-- ───────────────────────────────────────────
-- 3. CRM Interactions
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_interactions (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  contact_id INTEGER NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,

  interaction_type VARCHAR(50) NOT NULL,
  channel VARCHAR(30),
  direction VARCHAR(10),

  subject VARCHAR(500),
  body TEXT,
  summary TEXT,

  outcome VARCHAR(50),
  next_action VARCHAR(500),

  quote_id INTEGER,
  booking_id INTEGER,
  thread_id INTEGER,

  duration_seconds INTEGER,

  performed_by INTEGER REFERENCES users(id),
  performed_by_name VARCHAR(200),

  is_automated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_interactions_contact ON crm_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_tenant ON crm_interactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_type ON crm_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_date ON crm_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_performer ON crm_interactions(performed_by);

-- ───────────────────────────────────────────
-- 4. CRM Tasks
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_tasks (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  contact_id INTEGER REFERENCES crm_contacts(id) ON DELETE SET NULL,
  quote_id INTEGER,
  booking_id INTEGER,

  assigned_to INTEGER NOT NULL REFERENCES users(id),
  created_by INTEGER REFERENCES users(id),

  task_type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,

  due_date TIMESTAMP NOT NULL,
  reminder_at TIMESTAMP,
  reminder_sent BOOLEAN DEFAULT false,

  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',

  completed_at TIMESTAMP,
  completion_notes TEXT,
  outcome VARCHAR(50),

  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50),
  parent_task_id INTEGER REFERENCES crm_tasks(id),

  is_automated BOOLEAN DEFAULT false,
  source_trigger VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned ON crm_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_contact ON crm_tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due ON crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_tenant ON crm_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_overdue ON crm_tasks(status, due_date) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_crm_tasks_reminder ON crm_tasks(reminder_at) WHERE reminder_sent = false AND reminder_at IS NOT NULL;

-- ───────────────────────────────────────────
-- 5. Smart Notifications
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_smart_notifications (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  contact_id INTEGER REFERENCES crm_contacts(id) ON DELETE SET NULL,

  recipient_user_id INTEGER NOT NULL REFERENCES users(id),
  recipient_type VARCHAR(30) DEFAULT 'agent',

  notification_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',

  title VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  ai_summary TEXT,
  suggested_action VARCHAR(500),
  action_url VARCHAR(500),
  mobile_deeplink VARCHAR(500),

  channels VARCHAR(30)[] DEFAULT '{in_app}',

  escalation_level INTEGER DEFAULT 1,
  escalation_deadline TIMESTAMP,
  escalated_from INTEGER REFERENCES crm_smart_notifications(id),

  status VARCHAR(20) DEFAULT 'pending',
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  actioned_at TIMESTAMP,

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_notif_recipient ON crm_smart_notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_crm_notif_contact ON crm_smart_notifications(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_notif_status ON crm_smart_notifications(status);
CREATE INDEX IF NOT EXISTS idx_crm_notif_type ON crm_smart_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_crm_notif_escalation ON crm_smart_notifications(escalation_deadline) WHERE status IN ('pending', 'sent');
CREATE INDEX IF NOT EXISTS idx_crm_notif_tenant ON crm_smart_notifications(tenant_id);

-- ───────────────────────────────────────────
-- 6. Automation Rules
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_automation_rules (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),

  rule_name VARCHAR(200) NOT NULL,
  description TEXT,

  trigger_event VARCHAR(100) NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',

  actions JSONB NOT NULL,

  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_rules_tenant ON crm_automation_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_rules_trigger ON crm_automation_rules(trigger_event);
CREATE INDEX IF NOT EXISTS idx_crm_rules_active ON crm_automation_rules(is_active) WHERE is_active = true;

-- ───────────────────────────────────────────
-- 7. Automation Execution Log
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_automation_log (
  id SERIAL PRIMARY KEY,
  rule_id INTEGER REFERENCES crm_automation_rules(id) ON DELETE SET NULL,
  tenant_id INTEGER REFERENCES tenants(id),
  contact_id INTEGER REFERENCES crm_contacts(id) ON DELETE SET NULL,

  trigger_event VARCHAR(100),
  actions_executed JSONB,
  result VARCHAR(20) DEFAULT 'success',
  error_message TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_autolog_rule ON crm_automation_log(rule_id);
CREATE INDEX IF NOT EXISTS idx_crm_autolog_date ON crm_automation_log(created_at DESC);

-- ───────────────────────────────────────────
-- 8. Insert default automation rules
-- ───────────────────────────────────────────
INSERT INTO crm_automation_rules (tenant_id, rule_name, description, trigger_event, trigger_conditions, actions, is_active, priority) VALUES
  (NULL, 'Lead sin atender 24h', 'Escalar si el agente no atiende en 24 horas', 'no_response_check',
   '{"hours_threshold": 24}',
   '[{"type": "send_notification", "params": {"notification_type": "lead_abandoned", "priority": "high", "escalation_level": 2}}]',
   true, 10),
  (NULL, 'Lead sin atender 48h - Escalar a admin', 'Escalar al dueño de agencia si 48h sin respuesta', 'no_response_check',
   '{"hours_threshold": 48}',
   '[{"type": "send_notification", "params": {"notification_type": "escalation", "priority": "urgent", "recipient_type": "agency_admin", "escalation_level": 3}}]',
   true, 20),
  (NULL, 'Cotización creada → Follow-up', 'Crear tarea de seguimiento al enviar cotización', 'stage_changed',
   '{"new_stage": "quoted"}',
   '[{"type": "create_task", "params": {"task_type": "followup", "title": "Seguimiento de cotización enviada", "due_hours": 48, "priority": "high"}}]',
   true, 5),
  (NULL, 'Booking confirmado → Actualizar pipeline', 'Mover a Reservado al confirmar booking', 'booking_confirmed',
   '{}',
   '[{"type": "change_stage", "params": {"new_stage": "reserved"}}, {"type": "send_notification", "params": {"notification_type": "milestone", "priority": "normal"}}]',
   true, 5),
  (NULL, 'Post-viaje → Solicitar review', 'Enviar solicitud de review 1 día después del viaje', 'stage_changed',
   '{"new_stage": "post_trip"}',
   '[{"type": "create_task", "params": {"task_type": "review", "title": "Solicitar evaluación al cliente", "due_hours": 24, "priority": "medium"}}, {"type": "send_notification", "params": {"notification_type": "milestone"}}]',
   true, 5)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════
-- FIN DE MIGRACIÓN 034
-- Tablas creadas: 7 (crm_pipeline_stages, crm_contacts, crm_interactions,
--                     crm_tasks, crm_smart_notifications, crm_automation_rules,
--                     crm_automation_log)
-- Índices creados: ~30
-- ═══════════════════════════════════════════
