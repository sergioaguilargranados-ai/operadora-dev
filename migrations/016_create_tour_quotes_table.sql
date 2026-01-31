-- Migración 016: Tabla de cotizaciones de tours
-- Fecha: 31 Enero 2026
-- Propósito: Almacenar cotizaciones de tours con seguimiento y notificaciones

-- Crear tabla tour_quotes
CREATE TABLE IF NOT EXISTS tour_quotes (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    tour_id VARCHAR(100) NOT NULL,
    tour_name VARCHAR(255) NOT NULL,
    tour_region VARCHAR(100),
    tour_duration VARCHAR(50),
    tour_cities TEXT,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    num_personas INTEGER DEFAULT 1,
    price_per_person DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) DEFAULT 0,
    special_requests TEXT,
    notification_method VARCHAR(20) DEFAULT 'both', -- 'whatsapp', 'email', 'both'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'contacted', 'quoted', 'confirmed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contacted_at TIMESTAMP,
    quoted_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    notes TEXT
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_tour_quotes_folio ON tour_quotes(folio);
CREATE INDEX IF NOT EXISTS idx_tour_quotes_email ON tour_quotes(contact_email);
CREATE INDEX IF NOT EXISTS idx_tour_quotes_status ON tour_quotes(status);
CREATE INDEX IF NOT EXISTS idx_tour_quotes_created_at ON tour_quotes(created_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_tour_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tour_quotes_updated_at
    BEFORE UPDATE ON tour_quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_tour_quotes_updated_at();

-- Comentarios
COMMENT ON TABLE tour_quotes IS 'Cotizaciones de tours solicitadas por clientes';
COMMENT ON COLUMN tour_quotes.folio IS 'Folio único de la cotización (TOUR-timestamp-random)';
COMMENT ON COLUMN tour_quotes.notification_method IS 'Método preferido de notificación: whatsapp, email, both';
COMMENT ON COLUMN tour_quotes.status IS 'Estado de la cotización: pending, contacted, quoted, confirmed, cancelled';
