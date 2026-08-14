-- Migration 060: Reestructura de Portal - Tablas para Viajeros Vinculados, Facturación CFDI Completa y Configuración de Agencia
-- Date: 27 Jul 2026

-- 1. TABLA DE VIAJEROS VINCULADOS (Compañeros de Viaje tipo Expedia)
CREATE TABLE IF NOT EXISTS linked_travelers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    relationship VARCHAR(50) DEFAULT 'family', -- 'family' | 'friend' | 'colleague' | 'other'
    date_of_birth DATE,
    passport_number VARCHAR(50),
    passport_expiry DATE,
    nationality VARCHAR(100),
    gender VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_linked_travelers_user ON linked_travelers(user_id);

-- 2. TABLA DE CONFIGURACIÓN DE FACTURACIÓN POR AGENCIA / TENANT
CREATE TABLE IF NOT EXISTS agency_billing_config (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    rfc VARCHAR(13) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    regimen_fiscal VARCHAR(5) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    pac_provider VARCHAR(50) DEFAULT 'facturama', -- 'facturama' | 'finkok' | 'sw_sapien'
    pac_api_user VARCHAR(255),
    pac_api_password_encrypted TEXT,
    pac_is_sandbox BOOLEAN DEFAULT true,
    pac_certificate_file TEXT,
    pac_private_key_file TEXT,
    pac_private_key_password TEXT,
    invoice_serie VARCHAR(10) DEFAULT 'A',
    next_folio INTEGER DEFAULT 1,
    complement_serie VARCHAR(10) DEFAULT 'CP',
    complement_next_folio INTEGER DEFAULT 1,
    default_currency VARCHAR(3) DEFAULT 'MXN',
    iva_rate DECIMAL(5,4) DEFAULT 0.1600,
    logo_factura_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agency_billing_config_tenant ON agency_billing_config(tenant_id);

-- 3. CONCEPTOS DE FACTURAS (INVOICE ITEMS)
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1.00,
    unit_code VARCHAR(10) DEFAULT 'E48',
    unit_name VARCHAR(50) DEFAULT 'Servicio',
    unit_price DECIMAL(12,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    sat_product_code VARCHAR(10) DEFAULT '90111501',
    discount DECIMAL(12,2) DEFAULT 0.00,
    tax_name VARCHAR(10) DEFAULT 'IVA',
    tax_rate DECIMAL(5,4) DEFAULT 0.1600,
    tax_amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- 4. COMPLEMENTOS DE PAGO
CREATE TABLE IF NOT EXISTS invoice_complements (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    complement_invoice_id INTEGER REFERENCES invoices(id),
    payment_date DATE NOT NULL,
    payment_form VARCHAR(5) NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    partiality_number INTEGER DEFAULT 1,
    previous_balance DECIMAL(12,2),
    remaining_balance DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'MXN',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_complements_invoice ON invoice_complements(invoice_id);

-- 5. CAMPOS ADICIONALES EN LA TABLA DE FACTURAS
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS complement_type VARCHAR(10);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS parent_invoice_id INTEGER REFERENCES invoices(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pac_provider VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_con_letra TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS regimen_fiscal_emisor VARCHAR(5);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS regimen_fiscal_receptor VARCHAR(5);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS codigo_postal_receptor VARCHAR(10);
