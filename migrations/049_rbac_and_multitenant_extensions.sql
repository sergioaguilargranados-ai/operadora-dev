-- ==============================================================================
-- Migración 049: RBAC (Roles & Permissions) y Extensión Multi-Tenant
-- Descripción: Tablas para módulo de seguridad y campos extra de agencias/agentes.
-- ==============================================================================

-- 1. TABLAS DE SEGURIDAD (RBAC)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'SUPER_ADMIN', 'AGENCY_ADMIN', 'AGENT', 'CLIENT'
    description TEXT,
    is_system BOOLEAN DEFAULT false, -- If true, it shouldn't be deleted from UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'manage_users', 'view_commissions'
    module VARCHAR(50) NOT NULL,       -- e.g. 'security', 'billing', 'crm'
    action VARCHAR(50) NOT NULL,       -- e.g. 'create', 'read', 'update', 'delete'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- Insertar roles básicos del sistema si no existen
INSERT INTO roles (name, description, is_system) VALUES 
('SUPER_ADMIN', 'Administrador principal del sistema AS Operadora', true),
('ADMIN', 'Administrador operativo', true),
('MANAGER', 'Gerente', true),
('EMPLOYEE', 'Empleado administrativo', true),
('AGENCY_ADMIN', 'Administrador de una Agencia (Marca Blanca)', true),
('AGENT', 'Agente de ventas B2B', true),
('CLIENT', 'Cliente Final (Viajero)', true)
ON CONFLICT (name) DO NOTHING;


-- 2. EXTENSIÓN MULTI-TENANT (Agencias)
-- ------------------------------------------------------------------------------
ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS legal_representative VARCHAR(255),
    ADD COLUMN IF NOT EXISTS b2b_agent_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS support_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS support_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS support_whatsapp VARCHAR(50);


-- 3. EXTENSIÓN DE USUARIOS (Agentes y Clientes)
-- ------------------------------------------------------------------------------
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Añadir una tabla genérica de documentos vinculados a Entidades (Agencia, Agente, Cliente)
-- para aprovechar Vercel Blob de forma centralizada.
CREATE TABLE IF NOT EXISTS entity_documents (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'tenant', 'user', 'booking'
    entity_id INTEGER NOT NULL,       -- ID of the tenant or user
    document_type VARCHAR(100),       -- 'acta_constitutiva', 'ine', 'comprobante_domicilio', 'pasaporte'
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,       -- Vercel Blob URL
    uploaded_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entity_documents_type_id ON entity_documents(entity_type, entity_id);
