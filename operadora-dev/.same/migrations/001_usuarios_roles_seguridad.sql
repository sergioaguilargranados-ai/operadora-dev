-- =====================================================
-- MIGRACIÓN 001: Sistema de Usuarios, Roles y Seguridad
-- Versión: v2.51
-- Fecha: 13 de Diciembre de 2025
-- =====================================================

-- =====================================================
-- 1. MODIFICAR TABLA USERS (Extender funcionalidad)
-- =====================================================

-- Agregar nuevos campos a users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) NOT NULL DEFAULT 'cliente',
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'cliente',
ADD COLUMN IF NOT EXISTS company_id INTEGER,
ADD COLUMN IF NOT EXISTS agency_id INTEGER,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by INTEGER,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS membership_type VARCHAR(20) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fiscal_data_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'MX',
ADD COLUMN IF NOT EXISTS social_facebook VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_instagram VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_twitter VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_linkedin VARCHAR(255),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS nationality VARCHAR(2),
ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS passport_expiry DATE,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255),
ADD COLUMN IF NOT EXISTS recovery_codes JSONB;

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_type_role ON users(user_type, role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_agency ON users(agency_id) WHERE agency_id IS NOT NULL;

-- =====================================================
-- 2. TABLA DE EMPRESAS (CORPORATIVOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50) UNIQUE,
    industry VARCHAR(100),
    employee_count INTEGER,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(2) DEFAULT 'MX',
    postal_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',
    credit_limit DECIMAL(10,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30,
    logo_url TEXT,
    sso_enabled BOOLEAN DEFAULT false,
    sso_provider VARCHAR(50),
    sso_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_tax_id ON companies(tax_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- =====================================================
-- 3. TABLA DE AGENCIAS
-- =====================================================

CREATE TABLE IF NOT EXISTS agencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50) UNIQUE,
    license_number VARCHAR(100),
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(2) DEFAULT 'MX',
    postal_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    payment_method VARCHAR(50),
    logo_url TEXT,
    website VARCHAR(255),
    tenant_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agencies_name ON agencies(name);
CREATE INDEX IF NOT EXISTS idx_agencies_tax_id ON agencies(tax_id);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(status);

-- =====================================================
-- 4. TABLA DE ROLES
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    description TEXT,
    user_type VARCHAR(20) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. TABLA DE PERMISOS
-- =====================================================

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100),
    description TEXT,
    UNIQUE(module, action, resource)
);

CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);

-- =====================================================
-- 6. TABLA RELACIONAL: USUARIO-ROL
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

-- =====================================================
-- 7. TABLA DE SESIONES ACTIVAS
-- =====================================================

CREATE TABLE IF NOT EXISTS active_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires ON active_sessions(expires_at);

-- =====================================================
-- 8. TABLA DE LOGS DE ACCESO
-- =====================================================

CREATE TABLE IF NOT EXISTS access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    country VARCHAR(2),
    city VARCHAR(100),
    action VARCHAR(50),
    action_details JSONB,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip ON access_logs(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON access_logs(action);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at DESC);

-- =====================================================
-- 9. TABLA DE CONSENTIMIENTOS DE COOKIES
-- =====================================================

CREATE TABLE IF NOT EXISTS cookie_consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    necessary_cookies BOOLEAN DEFAULT true,
    analytics_cookies BOOLEAN DEFAULT false,
    marketing_cookies BOOLEAN DEFAULT false,
    personalization_cookies BOOLEAN DEFAULT false,
    consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_cookie_consents_session ON cookie_consents(session_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_user ON cookie_consents(user_id);

-- =====================================================
-- 10. TABLA DE RATE LIMITING
-- =====================================================

CREATE TABLE IF NOT EXISTS rate_limits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_blocked BOOLEAN DEFAULT false,
    block_until TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint, window_start);

-- =====================================================
-- 11. TABLA DE EVENTOS DE NEGOCIO
-- =====================================================

CREATE TABLE IF NOT EXISTS business_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    event_data JSONB NOT NULL,
    revenue_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_business_events_type ON business_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_events_user ON business_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_events_session ON business_events(session_id);

-- =====================================================
-- 12. TABLA DE ALERTAS DE SEGURIDAD
-- =====================================================

CREATE TABLE IF NOT EXISTS security_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    user_id INTEGER REFERENCES users(id),
    ip_address VARCHAR(45),
    description TEXT,
    alert_data JSONB,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status, severity, created_at DESC);

-- =====================================================
-- 13. TABLA DE PAÍSES BLOQUEADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS blocked_countries (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL UNIQUE,
    country_name VARCHAR(100),
    block_type VARCHAR(20) DEFAULT 'total',
    blocked_modules JSONB,
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 14. TABLA DE DOCUMENTOS DE ENTIDADES
-- =====================================================

CREATE TABLE IF NOT EXISTS entity_documents (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL,
    entity_id INTEGER NOT NULL,
    document_type VARCHAR(50),
    document_name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT false,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    expires_at DATE
);

CREATE INDEX IF NOT EXISTS idx_entity_documents_entity ON entity_documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_documents_verified ON entity_documents(verified);

-- =====================================================
-- 15. AGREGAR FOREIGN KEYS A USERS
-- =====================================================

ALTER TABLE users
ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_users_agency FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_users_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- =====================================================
-- 16. INSERTAR ROLES PREDEFINIDOS
-- =====================================================

INSERT INTO roles (name, display_name, description, user_type, permissions) VALUES
-- Cliente
('cliente', 'Cliente', 'Usuario cliente final', 'cliente', '{
    "bookings": ["create", "read_own", "update_own", "cancel_own"],
    "searches": ["create", "read_own"],
    "favorites": ["create", "read_own", "delete_own"],
    "profile": ["read_own", "update_own"],
    "reviews": ["create", "read", "update_own"]
}'),

-- Corporativo Admin
('corporativo_admin', 'Corporativo Administrador', 'Administrador de empresa corporativa', 'corporativo', '{
    "bookings": ["create", "read_company", "update_company", "cancel_company", "approve"],
    "employees": ["create", "read", "update", "delete", "approve"],
    "reports": ["read_company"],
    "budget": ["manage"],
    "approvals": ["manage"]
}'),

-- Corporativo Empleado
('corporativo_employee', 'Corporativo Empleado', 'Empleado de empresa', 'corporativo', '{
    "bookings": ["create", "read_own"],
    "searches": ["create", "read_own"],
    "profile": ["read_own", "update_own"]
}'),

-- Agencia Admin
('agencia_admin', 'Agencia Administrador', 'Administrador de agencia', 'agencia', '{
    "bookings": ["create", "read_agency", "update_agency", "cancel_agency"],
    "clients": ["create", "read", "update", "manage"],
    "operators": ["create", "read", "update", "delete", "approve"],
    "commissions": ["read"],
    "reports": ["read_agency"],
    "quotes": ["create", "read", "send"]
}'),

-- Agencia Operador
('agencia_operator', 'Agencia Operador', 'Operador de agencia', 'agencia', '{
    "bookings": ["create", "read_agency", "update_own"],
    "clients": ["create", "read"],
    "searches": ["create"],
    "quotes": ["create", "read_own"]
}'),

-- Director
('director', 'Director', 'Director general', 'interno', '{
    "all": ["*"]
}'),

-- Ventas
('ventas', 'Ventas', 'Personal de ventas', 'interno', '{
    "bookings": ["create", "read", "update"],
    "clients": ["create", "read", "update"],
    "quotes": ["create", "read", "send"],
    "reports": ["read_sales"],
    "commissions": ["read_own"]
}'),

-- Operativo
('operativo', 'Operativo', 'Personal operativo', 'interno', '{
    "bookings": ["read", "update", "confirm"],
    "hotels": ["create", "update", "review"],
    "flights": ["confirm", "reissue"],
    "providers": ["manage"],
    "inventory": ["manage"]
}'),

-- Administrativo
('administrativo', 'Administrativo', 'Personal administrativo', 'interno', '{
    "users": ["create", "read", "update", "approve", "suspend"],
    "companies": ["create", "read", "update"],
    "agencies": ["create", "read", "update"],
    "invoices": ["create", "read", "update", "cancel"],
    "payments": ["manage"],
    "reports": ["read_all"]
}'),

-- IT
('it', 'IT', 'Personal de sistemas', 'interno', '{
    "system": ["manage"],
    "users": ["read", "update", "reset_password"],
    "logs": ["read"],
    "security": ["manage"],
    "integrations": ["manage"]
}')

ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 17. INSERTAR PERMISOS BÁSICOS
-- =====================================================

INSERT INTO permissions (module, action, resource, description) VALUES
('bookings', 'create', NULL, 'Crear reservas'),
('bookings', 'read_own', NULL, 'Ver propias reservas'),
('bookings', 'read_company', NULL, 'Ver reservas de la empresa'),
('bookings', 'read_agency', NULL, 'Ver reservas de la agencia'),
('bookings', 'update_own', NULL, 'Modificar propias reservas'),
('bookings', 'cancel_own', NULL, 'Cancelar propias reservas'),
('bookings', 'approve', NULL, 'Aprobar reservas'),
('users', 'create', NULL, 'Crear usuarios'),
('users', 'read', NULL, 'Ver usuarios'),
('users', 'update', NULL, 'Modificar usuarios'),
('users', 'approve', NULL, 'Aprobar usuarios'),
('users', 'suspend', NULL, 'Suspender usuarios'),
('reports', 'read_sales', NULL, 'Ver reportes de ventas'),
('reports', 'read_all', NULL, 'Ver todos los reportes'),
('system', 'manage', NULL, 'Administrar sistema')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 18. FUNCIÓN PARA LIMPIAR LOGS ANTIGUOS
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_logs() RETURNS void AS $$
BEGIN
    -- Eliminar access_logs mayores a 2 años
    DELETE FROM access_logs WHERE created_at < NOW() - INTERVAL '2 years';

    -- Eliminar business_events mayores a 2 años
    DELETE FROM business_events WHERE created_at < NOW() - INTERVAL '2 years';

    -- Eliminar sesiones expiradas
    DELETE FROM active_sessions WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 19. COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE companies IS 'Empresas corporativas que contratan servicios';
COMMENT ON TABLE agencies IS 'Agencias de viajes asociadas';
COMMENT ON TABLE roles IS 'Roles del sistema con permisos';
COMMENT ON TABLE permissions IS 'Permisos granulares del sistema';
COMMENT ON TABLE active_sessions IS 'Sesiones activas de usuarios';
COMMENT ON TABLE access_logs IS 'Registro de accesos y actividad';
COMMENT ON TABLE cookie_consents IS 'Consentimientos de cookies (GDPR)';
COMMENT ON TABLE business_events IS 'Eventos de negocio para analytics';
COMMENT ON TABLE security_alerts IS 'Alertas de seguridad detectadas';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
