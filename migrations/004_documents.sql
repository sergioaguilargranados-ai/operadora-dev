-- ============================================================================
-- MIGRACIÓN 004: DOCUMENTS Y AUDIT LOGS
-- Fecha: 15 de Diciembre de 2025
-- Versión: v81
-- Descripción: Sistema de documentos seguros y logs de auditoría
-- ============================================================================

-- Tabla de documentos (pasaportes, visas, IDs, etc.)
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,

  -- Tipo de documento
  document_type VARCHAR(50) NOT NULL,
  -- passport, visa, id, driver_license, other

  -- Detalles del archivo
  file_name VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,

  -- Metadata
  description TEXT,
  metadata JSONB,

  -- Fechas
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,

  -- Constraints
  CONSTRAINT documents_document_type_check
    CHECK (document_type IN ('passport', 'visa', 'id', 'driver_license', 'other')),
  CONSTRAINT documents_file_size_check
    CHECK (file_size > 0 AND file_size <= 10485760) -- Max 10MB
);

-- Índices para documents
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_booking_id ON documents(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_deleted_at ON documents(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- AUDIT LOGS - Registro de acceso a datos sensibles
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,

  -- Quién
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,

  -- Qué
  action VARCHAR(50) NOT NULL,
  -- view, create, update, delete, download, share

  resource_type VARCHAR(50) NOT NULL,
  -- document, payment, booking, user, etc.

  resource_id VARCHAR(255) NOT NULL,

  -- Dónde
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Detalles
  details JSONB,

  -- Cuándo
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT audit_logs_action_check
    CHECK (action IN ('view', 'create', 'update', 'delete', 'download', 'share', 'login', 'logout'))
);

-- Índices para audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- FUNCIONES ÚTILES
-- ============================================================================

-- Función para registrar acceso a documento
CREATE OR REPLACE FUNCTION log_document_access(
  p_user_id INTEGER,
  p_tenant_id INTEGER,
  p_document_id VARCHAR,
  p_action VARCHAR,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    tenant_id,
    action,
    resource_type,
    resource_id,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    p_user_id,
    p_tenant_id,
    p_action,
    'document',
    p_document_id,
    p_ip_address,
    p_user_agent,
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener documentos por usuario
CREATE OR REPLACE FUNCTION get_user_documents(user_id_param INTEGER)
RETURNS TABLE (
  id VARCHAR,
  document_type VARCHAR,
  file_name VARCHAR,
  file_size INTEGER,
  created_at TIMESTAMP,
  booking_id INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.document_type,
    d.file_name,
    d.file_size,
    d.created_at,
    d.booking_id
  FROM documents d
  WHERE d.user_id = user_id_param
    AND d.deleted_at IS NULL
  ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener logs de auditoría por usuario
CREATE OR REPLACE FUNCTION get_user_audit_logs(
  user_id_param INTEGER,
  limit_param INTEGER DEFAULT 100
)
RETURNS TABLE (
  id INTEGER,
  action VARCHAR,
  resource_type VARCHAR,
  resource_id VARCHAR,
  created_at TIMESTAMP,
  ip_address VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.resource_type,
    al.resource_id,
    al.created_at,
    al.ip_address
  FROM audit_logs al
  WHERE al.user_id = user_id_param
  ORDER BY al.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Función para soft delete de documento
CREATE OR REPLACE FUNCTION soft_delete_document(document_id_param VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE documents
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = document_id_param
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para actualizar updated_at en documents
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- Trigger para registrar eliminación de documentos en audit log
CREATE OR REPLACE FUNCTION log_document_deletion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    tenant_id,
    action,
    resource_type,
    resource_id,
    details,
    created_at
  ) VALUES (
    OLD.user_id,
    OLD.tenant_id,
    'delete',
    'document',
    OLD.id,
    jsonb_build_object(
      'file_name', OLD.file_name,
      'document_type', OLD.document_type
    ),
    NOW()
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_document_deletion
  BEFORE DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION log_document_deletion();

-- ============================================================================
-- DATOS DE EJEMPLO (comentados para producción)
-- ============================================================================

/*
-- Ejemplo de documento
INSERT INTO documents (
  id,
  user_id,
  tenant_id,
  document_type,
  file_name,
  file_size,
  file_type,
  url,
  description
) VALUES (
  'doc_example_123',
  1,
  1,
  'passport',
  'passport_john_doe.pdf',
  1024000,
  'application/pdf',
  'https://example.com/documents/passport_john_doe.pdf',
  'Pasaporte de John Doe'
) ON CONFLICT DO NOTHING;

-- Ejemplo de audit log
INSERT INTO audit_logs (
  user_id,
  tenant_id,
  action,
  resource_type,
  resource_id,
  ip_address
) VALUES (
  1,
  1,
  'view',
  'document',
  'doc_example_123',
  '192.168.1.1'
) ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE documents IS 'Documentos sensibles (pasaportes, visas, IDs) almacenados en Vercel Blob';
COMMENT ON TABLE audit_logs IS 'Registro de auditoría de acceso a datos sensibles';

COMMENT ON COLUMN documents.document_type IS 'passport, visa, id, driver_license, other';
COMMENT ON COLUMN documents.url IS 'URL de Vercel Blob (acceso mediante URL firmada)';
COMMENT ON COLUMN documents.deleted_at IS 'Soft delete - NULL si activo';

COMMENT ON COLUMN audit_logs.action IS 'view, create, update, delete, download, share, login, logout';
COMMENT ON COLUMN audit_logs.resource_type IS 'Tipo de recurso accedido: document, payment, booking, user, etc.';
COMMENT ON COLUMN audit_logs.ip_address IS 'Dirección IP del usuario que realizó la acción';

-- ============================================================================
-- FIN DE MIGRACIÓN 004
-- ============================================================================

-- Para ejecutar esta migración:
-- psql -U <usuario> -d <base_de_datos> -f 004_documents.sql
