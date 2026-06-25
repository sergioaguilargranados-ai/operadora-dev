-- Migración 045: Tabla para el contenido de la aplicación móvil (PWA) por Tenant
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS mobile_app_content (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    welcome_phrase VARCHAR(255) DEFAULT '¿Listo para tu próxima experiencia?',
    logo_url VARCHAR(512),
    home_banner_url VARCHAR(512),
    store_banner_url VARCHAR(512),
    help_phone VARCHAR(50),
    help_email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuraciones iniciales por defecto para el tenant principal (tenant_id = 1)
INSERT INTO mobile_app_content (tenant_id, welcome_phrase, logo_url, home_banner_url, store_banner_url, help_phone, help_email)
VALUES (
    1,
    '¿Listo para tu próxima experiencia?',
    '/logo.png',
    '/banner-home.jpg',
    '/banner-store.jpg',
    '+527208156804',
    'support@asoperadora.com'
)
ON CONFLICT (tenant_id) DO NOTHING;
