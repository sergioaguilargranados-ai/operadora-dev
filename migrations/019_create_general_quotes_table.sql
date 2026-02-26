-- Migración 019: Crear tabla de cotizaciones generales y sus items
-- Estas tablas soportan las cotizaciones manuales (no de tours) creadas desde el panel de gestión.

CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE,
    user_id INTEGER,
    created_by INTEGER,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_company VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    destination VARCHAR(255),
    trip_type VARCHAR(50) DEFAULT 'package',
    travel_start_date DATE,
    travel_end_date DATE,
    valid_until DATE,
    total DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'MXN',
    notes TEXT,
    terms_conditions TEXT,
    status VARCHAR(30) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generar quote_number automáticamente
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quote_number IS NULL THEN
        NEW.quote_number := 'COT-' || LPAD(NEW.id::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_quote_number ON quotes;
CREATE TRIGGER trg_quote_number
    BEFORE INSERT ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION generate_quote_number();

-- Tabla de items de cotización
CREATE TABLE IF NOT EXISTS quote_items (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 1,
    category VARCHAR(50) DEFAULT 'custom',
    item_name VARCHAR(500) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_email ON quotes(customer_email);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);

COMMENT ON TABLE quotes IS 'Cotizaciones generales creadas desde el panel de gestión';
COMMENT ON TABLE quote_items IS 'Items/conceptos de cotizaciones generales';
