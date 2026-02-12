-- ═══════════════════════════════════════════════════════════════
-- MIGRACIÓN 040: Client Documents Extension
-- Build: 12 Feb 2026 - v2.316
-- Descripción: Extiende tabla documents para soportar documentos
--              de clientes ligados a agency_clients con alertas de vencimiento
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────
-- 1. Extender tabla documents con nuevos campos
-- ───────────────────────────────────────────

-- Agregar FK a agency_clients
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS agency_client_id INTEGER,
  ADD COLUMN IF NOT EXISTS crm_contact_id INTEGER,
  ADD COLUMN IF NOT EXISTS expiry_date DATE,
  ADD COLUMN IF NOT EXISTS document_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS issuing_country VARCHAR(100),
  ADD COLUMN IF NOT EXISTS issuing_authority VARCHAR(200),
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_by INTEGER,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'identification';

-- Eliminar constraint viejo de document_type para agregar nuevos tipos
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Nuevo constraint con tipos extendidos
ALTER TABLE documents ADD CONSTRAINT documents_document_type_check
  CHECK (document_type IN (
    'passport', 'visa', 'id', 'driver_license', 'other',
    'ine', 'curp', 'rfc', 'comprobante_domicilio',
    'acta_nacimiento', 'cedula_profesional',
    'carta_poder', 'contrato', 'factura',
    'licencia_conducir', 'tarjeta_circulacion',
    'poliza_seguro', 'certificado_medico',
    'foto_personal', 'comprobante_ingresos'
  ));

-- Status constraint
ALTER TABLE documents ADD CONSTRAINT documents_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'expired'));

-- Category constraint
ALTER TABLE documents ADD CONSTRAINT documents_category_check
  CHECK (category IN ('identification', 'legal', 'financial', 'medical', 'travel', 'other'));

-- ───────────────────────────────────────────
-- 2. Índices para nuevos campos
-- ───────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_documents_agency_client ON documents(agency_client_id) WHERE agency_client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_crm_contact ON documents(crm_contact_id) WHERE crm_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_verified ON documents(verified) WHERE verified = false;
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- ───────────────────────────────────────────
-- 3. Vista de documentos de clientes
-- ───────────────────────────────────────────

CREATE OR REPLACE VIEW client_documents_view AS
SELECT
  d.id,
  d.document_type,
  d.file_name,
  d.file_size,
  d.file_type,
  d.url,
  d.description,
  d.document_number,
  d.issuing_country,
  d.expiry_date,
  d.status,
  d.category,
  d.verified,
  d.verified_at,
  d.created_at,
  d.updated_at,
  d.agency_client_id,
  d.crm_contact_id,
  d.user_id,
  d.tenant_id,
  ac.client_name,
  ac.client_email,
  ac.client_phone,
  CASE
    WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE THEN 'expired'
    WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
    WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '90 days' THEN 'expiring_warning'
    ELSE 'valid'
  END AS expiry_status
FROM documents d
LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
WHERE d.deleted_at IS NULL;

-- ───────────────────────────────────────────
-- 4. Función para buscar documentos próximos a vencer
-- ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_expiring_documents(
  p_tenant_id INTEGER,
  p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  document_id VARCHAR,
  document_type VARCHAR,
  file_name VARCHAR,
  expiry_date DATE,
  days_until_expiry INTEGER,
  agency_client_id INTEGER,
  client_name VARCHAR,
  client_email VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id AS document_id,
    d.document_type,
    d.file_name,
    d.expiry_date,
    (d.expiry_date - CURRENT_DATE)::INTEGER AS days_until_expiry,
    ac.id AS agency_client_id,
    ac.client_name,
    ac.client_email
  FROM documents d
  LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
  WHERE d.tenant_id = p_tenant_id
    AND d.deleted_at IS NULL
    AND d.expiry_date IS NOT NULL
    AND d.expiry_date <= CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL
    AND d.expiry_date >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY d.expiry_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────
-- 5. Función para obtener documentos por cliente
-- ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_client_documents(p_agency_client_id INTEGER)
RETURNS TABLE (
  id VARCHAR,
  document_type VARCHAR,
  file_name VARCHAR,
  file_size INTEGER,
  expiry_date DATE,
  status VARCHAR,
  category VARCHAR,
  verified BOOLEAN,
  created_at TIMESTAMP,
  expiry_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.document_type,
    d.file_name,
    d.file_size,
    d.expiry_date,
    d.status,
    d.category,
    d.verified,
    d.created_at,
    CASE
      WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE THEN 'expired'
      WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
      ELSE 'valid'
    END AS expiry_status
  FROM documents d
  WHERE d.agency_client_id = p_agency_client_id
    AND d.deleted_at IS NULL
  ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════
-- FIN DE MIGRACIÓN 040
-- Campos agregados a documents: 10
-- Vistas creadas: 1 (client_documents_view)
-- Funciones creadas: 2
-- ═══════════════════════════════════════════
