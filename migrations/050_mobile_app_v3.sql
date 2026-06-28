-- ==============================================================================
-- Migración 050: App Móvil, Tienda y Roles (Fase 3)
-- ==============================================================================

-- 1. Tenants (Agencias) - Logo oscuro para la tienda
ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS logo_dark_url TEXT;

-- 2. Users (Clientes/Viajeros) - Redes sociales y Seguro
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS facebook_url TEXT,
    ADD COLUMN IF NOT EXISTS instagram_url TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS wants_travel_insurance BOOLEAN DEFAULT false;

-- 3. Productos (Tienda) - Inventario (Stock)
ALTER TABLE store_products
    ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 999;

-- 4. Pedidos de Tienda (Store Orders)
CREATE TABLE IF NOT EXISTS store_orders (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, shipped, completed, cancelled
    payment_transaction_id INTEGER, -- Relación opcional con el pago
    shipping_address TEXT,
    contact_phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES store_products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
);

-- 5. Invitaciones de Grupo (Crea tu grupo)
CREATE TABLE IF NOT EXISTS group_invitations (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    social_network VARCHAR(50) NOT NULL, -- whatsapp, facebook, instagram, contacts
    recipient_identifier VARCHAR(255), -- nombre o handle
    personal_message TEXT,
    status VARCHAR(50) DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
