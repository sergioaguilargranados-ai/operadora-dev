-- ================================================================
-- MIGRACIÓN 010: CENTRO DE COMUNICACIÓN COMPLETO
-- Fecha: 20 Diciembre 2025
-- Descripción: Sistema completo de mensajería multicanal con trazabilidad
-- ================================================================

-- ================================================================
-- 1. TABLA: communication_threads (Hilos de conversación)
-- ================================================================
CREATE TABLE IF NOT EXISTS communication_threads (
  id SERIAL PRIMARY KEY,

  -- Tipo y clasificación
  thread_type VARCHAR(50) NOT NULL DEFAULT 'general',
  -- 'booking', 'general', 'complaint', 'inquiry', 'payment', 'itinerary'
  subject VARCHAR(255) NOT NULL,

  -- Referencias
  reference_type VARCHAR(50), -- 'booking', 'payment', 'itinerary', 'quote'
  reference_id INTEGER,

  -- Participantes
  client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  assigned_agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Estados
  status VARCHAR(50) DEFAULT 'active',
  -- 'active', 'pending_client', 'pending_agent', 'closed', 'escalated', 'archived'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- Control de mensajes
  last_message_at TIMESTAMP,
  last_message_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  message_count INTEGER DEFAULT 0,
  unread_count_client INTEGER DEFAULT 0,
  unread_count_agent INTEGER DEFAULT 0,

  -- SLA y tiempos
  sla_deadline TIMESTAMP,
  first_response_at TIMESTAMP,
  last_response_at TIMESTAMP,
  response_time_minutes INTEGER, -- Tiempo promedio de respuesta

  -- Metadata
  tags TEXT[], -- ['confirmacion', 'urgente', 'queja', 'cambio_vuelo']
  category VARCHAR(50), -- Categoría adicional

  -- Control
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMP,
  archived_by INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Multi-tenancy
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,

  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Índices
  CONSTRAINT valid_status CHECK (status IN ('active', 'pending_client', 'pending_agent', 'closed', 'escalated', 'archived')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

CREATE INDEX idx_threads_client ON communication_threads(client_id);
CREATE INDEX idx_threads_agent ON communication_threads(assigned_agent_id);
CREATE INDEX idx_threads_status ON communication_threads(status);
CREATE INDEX idx_threads_reference ON communication_threads(reference_type, reference_id);
CREATE INDEX idx_threads_tenant ON communication_threads(tenant_id);
CREATE INDEX idx_threads_updated ON communication_threads(updated_at DESC);

-- ================================================================
-- 2. TABLA: messages (Mensajes individuales)
-- ================================================================
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES communication_threads(id) ON DELETE CASCADE,

  -- Remitente
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sender_type VARCHAR(50) NOT NULL, -- 'client', 'agent', 'provider', 'system'
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),

  -- Contenido
  subject VARCHAR(255),
  body TEXT NOT NULL,
  body_html TEXT, -- Versión HTML para emails
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'html', 'notification', 'alert', 'system'

  -- Adjuntos
  attachments JSONB DEFAULT '[]',
  -- [{name: 'voucher.pdf', url: 'https://...', type: 'application/pdf', size: 123456}]

  -- Metadata
  metadata JSONB DEFAULT '{}',
  -- {booking_id: 123, payment_amount: 5000, etc.}

  -- Control
  is_internal BOOLEAN DEFAULT false, -- Notas internas solo para staff
  requires_response BOOLEAN DEFAULT false,
  requires_moderation BOOLEAN DEFAULT false, -- Para revisar antes de enviar
  moderated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMP,
  moderation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'

  -- Estados
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'pending', 'sent', 'delivered', 'failed'
  sent_at TIMESTAMP,

  -- Multi-tenancy
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,

  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP, -- Soft delete (solo ocultar, nunca eliminar)
  is_deleted BOOLEAN DEFAULT false
);

CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_moderation ON messages(moderation_status);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_tenant ON messages(tenant_id);

-- ================================================================
-- 3. TABLA: message_deliveries (Entregas por canal)
-- ================================================================
CREATE TABLE IF NOT EXISTS message_deliveries (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,

  -- Canal y destinatario
  channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'in_app', 'push'
  recipient VARCHAR(255) NOT NULL, -- email, phone, user_id

  -- Estados de entrega
  status VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'queued', 'sent', 'delivered', 'read', 'failed', 'bounced'

  -- Trazabilidad
  queued_at TIMESTAMP,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  failed_at TIMESTAMP,

  -- Detalles técnicos
  provider VARCHAR(100), -- 'sendgrid', 'twilio', 'whatsapp_business', 'firebase', etc.
  provider_message_id VARCHAR(255), -- ID del proveedor externo
  provider_response JSONB, -- Respuesta completa del proveedor
  error_message TEXT,
  error_code VARCHAR(50),

  -- Métricas y control
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_retry_at TIMESTAMP,
  next_retry_at TIMESTAMP,

  -- Costos (opcional)
  cost_amount DECIMAL(10, 4), -- Costo del envío
  cost_currency VARCHAR(3) DEFAULT 'MXN',

  -- Multi-tenancy
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,

  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deliveries_message ON message_deliveries(message_id);
CREATE INDEX idx_deliveries_status ON message_deliveries(status);
CREATE INDEX idx_deliveries_channel ON message_deliveries(channel);
CREATE INDEX idx_deliveries_recipient ON message_deliveries(recipient);
CREATE INDEX idx_deliveries_provider_id ON message_deliveries(provider_message_id);
CREATE INDEX idx_deliveries_next_retry ON message_deliveries(next_retry_at) WHERE status = 'failed' AND retry_count < max_retries;

-- ================================================================
-- 4. TABLA: message_reads (Registro de lecturas - Evidencia legal)
-- ================================================================
CREATE TABLE IF NOT EXISTS message_reads (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Detalles de lectura
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_via VARCHAR(50), -- 'web', 'mobile', 'email_client', 'api'

  -- Información técnica (evidencia)
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(100),
  os VARCHAR(100),

  -- Geolocalización (opcional)
  country VARCHAR(100),
  city VARCHAR(100),

  -- Tiempo de lectura
  reading_time_seconds INTEGER, -- Cuánto tiempo estuvo leyendo

  -- Multi-tenancy
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,

  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reads_message ON message_reads(message_id);
CREATE INDEX idx_reads_user ON message_reads(user_id);
CREATE INDEX idx_reads_read_at ON message_reads(read_at DESC);

-- ================================================================
-- 5. TABLA: communication_preferences (Preferencias de usuario)
-- ================================================================
CREATE TABLE IF NOT EXISTS communication_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Canales habilitados
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  in_app_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,

  -- Contactos (pueden ser diferentes al user principal)
  email_address VARCHAR(255),
  phone_number VARCHAR(20),
  whatsapp_number VARCHAR(20),

  -- Tipos de mensajes que acepta
  booking_confirmations BOOLEAN DEFAULT true,
  payment_reminders BOOLEAN DEFAULT true,
  itinerary_changes BOOLEAN DEFAULT true,
  promotional BOOLEAN DEFAULT false,
  newsletters BOOLEAN DEFAULT false,

  -- Horario de contacto (No molestar)
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME, -- Ej: 22:00
  quiet_hours_end TIME,   -- Ej: 08:00
  timezone VARCHAR(50) DEFAULT 'America/Mexico_City',

  -- Preferencias de idioma
  preferred_language VARCHAR(10) DEFAULT 'es',

  -- Multi-tenancy
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,

  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prefs_user ON communication_preferences(user_id);
CREATE INDEX idx_prefs_tenant ON communication_preferences(tenant_id);

-- ================================================================
-- 6. TABLA: message_templates (Plantillas de mensajes)
-- ================================================================
CREATE TABLE IF NOT EXISTS message_templates (
  id SERIAL PRIMARY KEY,

  -- Identificación
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL, -- 'booking_confirmed', 'payment_reminder', etc.
  category VARCHAR(50) NOT NULL, -- 'booking', 'payment', 'complaint', 'general'

  -- Contenido
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  body_html TEXT,

  -- Variables disponibles
  variables JSONB DEFAULT '[]',
  -- ['{{client_name}}', '{{booking_id}}', '{{amount}}', '{{date}}']

  -- Ejemplo de uso
  example_data JSONB,

  -- Control
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- Templates del sistema (no editables)

  -- Multi-tenancy
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,

  -- Auditoría
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_code ON message_templates(code);
CREATE INDEX idx_templates_category ON message_templates(category);
CREATE INDEX idx_templates_tenant ON message_templates(tenant_id);

-- ================================================================
-- 7. TABLA: scheduled_messages (Mensajes programados)
-- ================================================================
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,

  -- Programación
  scheduled_for TIMESTAMP NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/Mexico_City',

  -- Estados
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'

  -- Control
  sent_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancelled_by INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Recurrencia (opcional para futuro)
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- Ej: RRULE:FREQ=DAILY;INTERVAL=1

  -- Multi-tenancy
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,

  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scheduled_for ON scheduled_messages(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_scheduled_status ON scheduled_messages(status);
CREATE INDEX idx_scheduled_tenant ON scheduled_messages(tenant_id);

-- ================================================================
-- 8. TABLA: quick_responses (Respuestas rápidas)
-- ================================================================
CREATE TABLE IF NOT EXISTS quick_responses (
  id SERIAL PRIMARY KEY,

  -- Identificación
  title VARCHAR(255) NOT NULL,
  shortcut VARCHAR(50), -- Ej: '/gracias', '/recibido'

  -- Contenido
  content TEXT NOT NULL,

  -- Clasificación
  category VARCHAR(50), -- 'saludo', 'despedida', 'confirmacion', 'disculpa'
  tags TEXT[],

  -- Control
  is_active BOOLEAN DEFAULT true,
  use_count INTEGER DEFAULT 0, -- Contador de uso

  -- Personalización
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Respuesta personal vs global
  is_global BOOLEAN DEFAULT false, -- Disponible para todos

  -- Multi-tenancy
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,

  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quick_shortcut ON quick_responses(shortcut);
CREATE INDEX idx_quick_category ON quick_responses(category);
CREATE INDEX idx_quick_user ON quick_responses(created_by);
CREATE INDEX idx_quick_tenant ON quick_responses(tenant_id);

-- ================================================================
-- 9. TABLA: communication_settings (Configuración del sistema)
-- ================================================================
CREATE TABLE IF NOT EXISTS communication_settings (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,

  -- Límites de envío
  daily_message_limit INTEGER DEFAULT 100,
  hourly_message_limit INTEGER DEFAULT 20,
  rate_limit_per_user INTEGER DEFAULT 10, -- Mensajes por usuario por hora

  -- Moderación
  moderation_enabled BOOLEAN DEFAULT true,
  auto_approve_agents BOOLEAN DEFAULT true, -- Agentes no necesitan moderación
  moderation_keywords TEXT[], -- Palabras que requieren moderación

  -- Retención de datos
  retention_days INTEGER DEFAULT 2555, -- 7 años = 2555 días
  archive_after_days INTEGER DEFAULT 90, -- Archivar hilos inactivos

  -- SLA
  sla_response_hours INTEGER DEFAULT 24, -- Responder en 24 horas
  sla_resolution_hours INTEGER DEFAULT 72, -- Resolver en 72 horas

  -- Notificaciones
  notify_agents_new_message BOOLEAN DEFAULT true,
  notify_clients_response BOOLEAN DEFAULT true,
  escalate_after_hours INTEGER DEFAULT 48, -- Escalar si no hay respuesta

  -- Proveedores externos
  email_provider VARCHAR(100) DEFAULT 'sendgrid', -- 'sendgrid', 'mailgun', 'ses'
  sms_provider VARCHAR(100) DEFAULT 'twilio',
  whatsapp_provider VARCHAR(100) DEFAULT 'twilio',

  -- API Keys (encriptadas)
  email_api_key_encrypted TEXT,
  sms_api_key_encrypted TEXT,
  whatsapp_api_key_encrypted TEXT,

  -- Configuraciones adicionales
  extra_config JSONB DEFAULT '{}',

  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_tenant ON communication_settings(tenant_id);

-- ================================================================
-- 10. TABLA: message_satisfaction (Encuestas de satisfacción)
-- ================================================================
CREATE TABLE IF NOT EXISTS message_satisfaction (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES communication_threads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Rating
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Feedback
  feedback TEXT,

  -- Aspectos específicos
  response_time_rating INTEGER CHECK (response_time_rating >= 1 AND response_time_rating <= 5),
  resolution_rating INTEGER CHECK (resolution_rating >= 1 AND resolution_rating <= 5),
  agent_rating INTEGER CHECK (agent_rating >= 1 AND agent_rating <= 5),

  -- Control
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Multi-tenancy
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_satisfaction_thread ON message_satisfaction(thread_id);
CREATE INDEX idx_satisfaction_rating ON message_satisfaction(rating);
CREATE INDEX idx_satisfaction_tenant ON message_satisfaction(tenant_id);

-- ================================================================
-- 11. TRIGGERS Y FUNCIONES
-- ================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON communication_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON message_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prefs_updated_at BEFORE UPDATE ON communication_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar contadores en thread al insertar mensaje
CREATE OR REPLACE FUNCTION update_thread_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE communication_threads
  SET
    last_message_at = NEW.created_at,
    last_message_by = NEW.sender_id,
    message_count = message_count + 1,
    unread_count_client = CASE
      WHEN NEW.sender_type != 'client' THEN unread_count_client + 1
      ELSE unread_count_client
    END,
    unread_count_agent = CASE
      WHEN NEW.sender_type = 'client' THEN unread_count_agent + 1
      ELSE unread_count_agent
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_on_message AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_thread_on_new_message();

-- ================================================================
-- 12. DATOS INICIALES
-- ================================================================

-- Insertar configuración por defecto para tenant 1
INSERT INTO communication_settings (tenant_id)
VALUES (1)
ON CONFLICT (tenant_id) DO NOTHING;

-- Insertar templates del sistema
INSERT INTO message_templates (code, name, category, subject, body, is_system, tenant_id) VALUES
('booking_confirmed', 'Confirmación de Reserva', 'booking',
 'Confirmación de Reserva #{{booking_id}}',
 'Hola {{client_name}},\n\nTu reserva #{{booking_id}} ha sido confirmada.\n\nGracias por tu preferencia.',
 true, 1),

('payment_reminder', 'Recordatorio de Pago', 'payment',
 'Recordatorio: Pago pendiente',
 'Hola {{client_name}},\n\nTe recordamos que tienes un pago pendiente de {{amount}} {{currency}}.\n\nPor favor realiza tu pago antes del {{due_date}}.',
 true, 1),

('itinerary_changed', 'Cambio en Itinerario', 'itinerary',
 'Cambio en tu itinerario',
 'Hola {{client_name}},\n\nHubo un cambio en tu itinerario:\n{{change_details}}\n\nPor favor revisa los detalles.',
 true, 1)
ON CONFLICT (code) DO NOTHING;

-- Insertar respuestas rápidas globales
INSERT INTO quick_responses (title, shortcut, content, category, is_global, tenant_id) VALUES
('Gracias por tu mensaje', '/gracias', 'Gracias por tu mensaje. Lo estamos revisando y te responderemos pronto.', 'saludo', true, 1),
('Recibido', '/recibido', 'Hemos recibido tu solicitud. Estamos trabajando en ello.', 'confirmacion', true, 1),
('Disculpa', '/disculpa', 'Lamentamos los inconvenientes. Estamos trabajando para resolver tu situación.', 'disculpa', true, 1),
('Despedida', '/despedida', 'Quedamos a tus órdenes. ¡Buen viaje!', 'despedida', true, 1)
ON CONFLICT DO NOTHING;

-- ================================================================
-- MIGRACIÓN COMPLETADA
-- ================================================================
