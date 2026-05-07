-- Migration 042: AI Trip Designer - Diseñador de Viajes con IA
-- Date: 09 de Abril de 2026
-- Purpose: Tablas para propuestas de itinerario generadas por IA,
--          revisadas por agentes y enviadas a clientes.

-- =====================================================
-- TABLA: ai_trip_proposals
-- Propuesta de viaje completa con requisitos del cliente
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_trip_proposals (
  id SERIAL PRIMARY KEY,
  folio VARCHAR(20) UNIQUE,

  -- Datos del viajero
  traveler_name VARCHAR(255) NOT NULL,
  traveler_email VARCHAR(255),
  traveler_phone VARCHAR(20),
  num_adults INTEGER DEFAULT 1,
  num_children INTEGER DEFAULT 0,
  num_infants INTEGER DEFAULT 0,
  children_ages INTEGER[],

  -- Datos del viaje
  destination VARCHAR(255) NOT NULL,
  specific_cities TEXT[],
  origin_city VARCHAR(255),
  start_date DATE,
  end_date DATE,
  duration_nights INTEGER,
  flexibility VARCHAR(20) DEFAULT 'flexible',
    -- 'exact', 'flexible_3days', 'flexible_week', 'open'

  -- Preferencias de experiencia
  trip_type VARCHAR(30),
    -- 'cultural', 'playa', 'aventura', 'romance', 'familiar',
    -- 'negocios', 'gastronomico', 'religioso', 'naturaleza', 'shopping'
  travel_style VARCHAR(20) DEFAULT 'comfort',
    -- 'backpacker', 'budget', 'comfort', 'premium', 'luxury'
  pace VARCHAR(20) DEFAULT 'moderate',
    -- 'relaxed', 'moderate', 'intense'
  interests TEXT[],
  must_see TEXT[],
  avoid TEXT[],

  -- Presupuesto
  budget_total DECIMAL(12,2),
  budget_currency VARCHAR(3) DEFAULT 'MXN',
  budget_flexibility VARCHAR(20) DEFAULT 'flexible',
    -- 'strict', 'flexible', 'open'
  hotel_category VARCHAR(20),
    -- '2_star', '3_star', '4_star', '5_star', 'boutique', 'airbnb'
  meal_preference VARCHAR(20),
    -- 'none', 'breakfast', 'half_board', 'full_board', 'all_inclusive'
  transport_preference TEXT[],

  -- Necesidades especiales
  dietary_restrictions TEXT[],
  mobility_needs TEXT,
  special_occasions TEXT[],
  additional_notes TEXT,

  -- Datos de la conversación IA
  chat_history JSONB DEFAULT '[]',
  captured_fields JSONB DEFAULT '{}',

  -- Itinerario generado por IA (JSON completo antes de parsear a trip_days)
  ai_itinerary JSONB,
  ai_model_used VARCHAR(50),
  ai_prompt_tokens INTEGER,
  ai_completion_tokens INTEGER,
  ai_generated_at TIMESTAMP,

  -- Estado y flujo de trabajo
  status VARCHAR(20) DEFAULT 'capturing',
    -- 'capturing'     → Chat en progreso, capturando datos
    -- 'captured'      → Todos los campos requeridos listos
    -- 'ai_pending'    → Esperando respuesta de IA
    -- 'ai_generated'  → IA generó itinerario
    -- 'in_review'     → Agente está revisando
    -- 'completed'     → Agente completó/aprobó
    -- 'sent'          → Enviado al cliente
    -- 'accepted'      → Cliente aceptó
    -- 'rejected'      → Cliente rechazó
    -- 'expired'       → Expiró sin respuesta

  -- Asignación de agente
  assigned_agent_id INTEGER,
  reviewed_at TIMESTAMP,
  agent_notes TEXT,

  -- Envío
  sent_at TIMESTAMP,
  sent_via VARCHAR(20),
  sent_pdf_url TEXT,

  -- Precios consolidados (calculados por agente)
  total_cost_price DECIMAL(12,2),
  total_sale_price DECIMAL(12,2),
  total_currency VARCHAR(3) DEFAULT 'MXN',

  -- Relaciones
  client_id INTEGER,
  booking_id INTEGER,
  quote_id INTEGER,
  communication_thread_id INTEGER,

  -- Multi-tenant
  tenant_id INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_trip_proposals_status ON ai_trip_proposals(status);
CREATE INDEX IF NOT EXISTS idx_trip_proposals_agent ON ai_trip_proposals(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_trip_proposals_folio ON ai_trip_proposals(folio);
CREATE INDEX IF NOT EXISTS idx_trip_proposals_tenant ON ai_trip_proposals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trip_proposals_created ON ai_trip_proposals(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_trip_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trip_proposals_updated_at ON ai_trip_proposals;
CREATE TRIGGER trip_proposals_updated_at
  BEFORE UPDATE ON ai_trip_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_proposals_updated_at();

-- Secuencia para folios
CREATE SEQUENCE IF NOT EXISTS trip_proposal_folio_seq START WITH 1;

-- Función para generar folio automático
CREATE OR REPLACE FUNCTION generate_trip_folio()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.folio IS NULL THEN
    NEW.folio = 'AS-TRIP-' || LPAD(NEXTVAL('trip_proposal_folio_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trip_proposal_folio_trigger ON ai_trip_proposals;
CREATE TRIGGER trip_proposal_folio_trigger
  BEFORE INSERT ON ai_trip_proposals
  FOR EACH ROW
  EXECUTE FUNCTION generate_trip_folio();


-- =====================================================
-- TABLA: ai_trip_days
-- Detalle día por día del itinerario
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_trip_days (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER NOT NULL REFERENCES ai_trip_proposals(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE,
  city VARCHAR(255),
  title VARCHAR(255),

  -- Actividades del día (JSON array)
  -- Cada actividad: { time, name, description, type, duration_hours,
  --                   estimated_cost, currency, provider, booking_url,
  --                   our_service_id, agent_notes, is_ai_suggested }
  activities JSONB DEFAULT '[]',

  -- Alojamiento
  hotel_name VARCHAR(255),
  hotel_category VARCHAR(20),
  hotel_address TEXT,
  hotel_estimated_cost DECIMAL(10,2),
  hotel_our_service_id INTEGER,
  hotel_confirmed BOOLEAN DEFAULT false,

  -- Transporte principal del día
  transport_type VARCHAR(20),
  transport_details TEXT,
  transport_estimated_cost DECIMAL(10,2),

  -- Comidas sugeridas
  -- Cada comida: { type, restaurant, cuisine, estimated_cost, notes, address }
  meals JSONB DEFAULT '[]',

  -- Costos del día
  estimated_day_cost DECIMAL(10,2),

  -- Editado por agente
  agent_modified BOOLEAN DEFAULT false,
  agent_modified_at TIMESTAMP,
  agent_notes TEXT,

  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(proposal_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_trip_days_proposal ON ai_trip_days(proposal_id);


-- =====================================================
-- TABLA: ai_trip_services
-- Servicios propios que agrega el agente al itinerario
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_trip_services (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER NOT NULL REFERENCES ai_trip_proposals(id) ON DELETE CASCADE,
  day_id INTEGER REFERENCES ai_trip_days(id) ON DELETE SET NULL,

  -- Servicio
  service_type VARCHAR(30) NOT NULL,
    -- 'flight', 'hotel', 'tour', 'transfer', 'insurance',
    -- 'restaurant', 'activity', 'car_rental', 'guide', 'other'
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(255),

  -- Precios
  cost_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'MXN',

  -- Referencia interna
  internal_reference VARCHAR(50),
  megatravel_id INTEGER,

  -- Estado
  status VARCHAR(20) DEFAULT 'proposed',
    -- 'proposed', 'confirmed', 'cancelled'
  confirmed_at TIMESTAMP,

  -- Notas
  agent_notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trip_services_proposal ON ai_trip_services(proposal_id);
CREATE INDEX IF NOT EXISTS idx_trip_services_day ON ai_trip_services(day_id);


-- =====================================================
-- Registrar feature en el catálogo de features
-- =====================================================
INSERT INTO features (code, name, description, category, is_global_enabled, icon, sort_order)
VALUES ('SYSTEM_TRIP_DESIGNER', 'Diseñador de Viajes IA', 'Generador de itinerarios personalizados con IA', 'sistema', true, 'Sparkles', 3)
ON CONFLICT (code) DO NOTHING;

-- Dar acceso a SUPER_ADMIN y ADMIN
INSERT INTO feature_role_access (feature_id, role, web_enabled, mobile_enabled)
SELECT id, 'SUPER_ADMIN', true, true FROM features WHERE code = 'SYSTEM_TRIP_DESIGNER'
ON CONFLICT (feature_id, role) DO NOTHING;

INSERT INTO feature_role_access (feature_id, role, web_enabled, mobile_enabled)
SELECT id, 'ADMIN', true, true FROM features WHERE code = 'SYSTEM_TRIP_DESIGNER'
ON CONFLICT (feature_id, role) DO NOTHING;

-- También acceso para EMPLOYEE (cualquier usuario puede diseñar viaje)
INSERT INTO feature_role_access (feature_id, role, web_enabled, mobile_enabled)
SELECT id, 'EMPLOYEE', true, true FROM features WHERE code = 'SYSTEM_TRIP_DESIGNER'
ON CONFLICT (feature_id, role) DO NOTHING;


-- =====================================================
-- VERIFICACIÓN
-- =====================================================
DO $$
DECLARE
  proposals_exists BOOLEAN;
  days_exists BOOLEAN;
  services_exists BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_trip_proposals') INTO proposals_exists;
  SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_trip_days') INTO days_exists;
  SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_trip_services') INTO services_exists;

  RAISE NOTICE '✅ Migración 042 - AI Trip Designer completada';
  RAISE NOTICE '   ai_trip_proposals: %', CASE WHEN proposals_exists THEN '✅' ELSE '❌' END;
  RAISE NOTICE '   ai_trip_days: %', CASE WHEN days_exists THEN '✅' ELSE '❌' END;
  RAISE NOTICE '   ai_trip_services: %', CASE WHEN services_exists THEN '✅' ELSE '❌' END;
END $$;
