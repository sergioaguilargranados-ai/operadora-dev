-- Migration 010: Sistema de Itinerarios y Cotizaciones
-- Date: 18 Dec 2025 - 06:50 CST
-- Purpose: Crear tablas para itinerarios de viaje y cotizaciones personalizadas

-- ============================================
-- 1. TABLA DE ITINERARIOS
-- ============================================

CREATE TABLE IF NOT EXISTS itineraries (
  id SERIAL PRIMARY KEY,

  -- Relaciones
  booking_id INTEGER REFERENCES bookings(id),
  user_id INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id),

  -- Información básica
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255),
  description TEXT,

  -- Fechas
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,

  -- Detalles del itinerario (JSON)
  days JSONB DEFAULT '[]'::jsonb,
  -- Estructura: [{day: 1, date: "2025-12-20", activities: [{time: "09:00", title: "...", description: "...", location: "..."}]}]

  -- Información adicional
  notes TEXT,
  recommendations TEXT,
  important_info TEXT,

  -- Configuración
  is_shared BOOLEAN DEFAULT false,
  shared_token VARCHAR(100) UNIQUE,

  -- Estado
  status VARCHAR(20) DEFAULT 'draft',
  -- draft | active | completed | cancelled

  -- Metadata
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP,

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_itineraries_booking ON itineraries(booking_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_user ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_dates ON itineraries(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_itineraries_status ON itineraries(status);
CREATE INDEX IF NOT EXISTS idx_itineraries_shared ON itineraries(shared_token) WHERE shared_token IS NOT NULL;

-- Comentarios
COMMENT ON TABLE itineraries IS 'Itinerarios de viaje día por día';
COMMENT ON COLUMN itineraries.days IS 'Actividades por día en formato JSON';


-- ============================================
-- 2. TABLA DE COTIZACIONES (QUOTES)
-- ============================================

CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,

  -- Relaciones
  user_id INTEGER REFERENCES users(id),
  booking_id INTEGER REFERENCES bookings(id),
  created_by INTEGER REFERENCES users(id),

  -- Identificación
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  quote_reference VARCHAR(100),

  -- Cliente
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_company VARCHAR(255),

  -- Detalles del viaje
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255),
  trip_type VARCHAR(50),
  -- flight | hotel | package | custom | mixed

  -- Fechas
  travel_start_date DATE,
  travel_end_date DATE,
  valid_until DATE,

  -- Estado
  status VARCHAR(20) DEFAULT 'draft',
  -- draft | sent | viewed | accepted | rejected | expired

  -- Montos
  subtotal DECIMAL(10,2) DEFAULT 0,
  taxes DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',

  -- Notas
  notes TEXT,
  terms_conditions TEXT,
  internal_notes TEXT,

  -- Archivos
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP,

  -- Seguimiento
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quotes_user ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_booking ON quotes(booking_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_email ON quotes(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotes_dates ON quotes(travel_start_date, travel_end_date);

-- Comentarios
COMMENT ON TABLE quotes IS 'Cotizaciones personalizadas para clientes';
COMMENT ON COLUMN quotes.quote_number IS 'Número único de cotización (ej: Q-2025-001)';


-- ============================================
-- 3. TABLA DE ITEMS DE COTIZACIÓN
-- ============================================

CREATE TABLE IF NOT EXISTS quote_items (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,

  -- Orden
  display_order INTEGER DEFAULT 0,

  -- Categoría
  category VARCHAR(50),
  -- flight | hotel | transfer | activity | insurance | other | custom

  -- Detalles (texto libre)
  item_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Cantidad y precio
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

  -- Metadata
  notes TEXT,
  is_optional BOOLEAN DEFAULT false,

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_order ON quote_items(quote_id, display_order);

-- Comentarios
COMMENT ON TABLE quote_items IS 'Items/rubros de cada cotización';
COMMENT ON COLUMN quote_items.item_name IS 'Nombre del servicio/rubro (texto libre)';


-- ============================================
-- 4. FUNCIÓN PARA GENERAR NÚMERO DE COTIZACIÓN
-- ============================================

CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  year_part VARCHAR(4);
  sequence_num INTEGER;
  quote_num VARCHAR(50);
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  -- Obtener el siguiente número de secuencia para este año
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(quote_number FROM 8) AS INTEGER
    )
  ), 0) + 1
  INTO sequence_num
  FROM quotes
  WHERE quote_number LIKE 'Q-' || year_part || '-%';

  -- Formatear con ceros a la izquierda
  quote_num := 'Q-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');

  RETURN quote_num;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 5. FUNCIÓN PARA CALCULAR TOTALES DE COTIZACIÓN
-- ============================================

CREATE OR REPLACE FUNCTION calculate_quote_totals()
RETURNS TRIGGER AS $$
DECLARE
  items_subtotal DECIMAL(10,2);
BEGIN
  -- Calcular subtotal de todos los items
  SELECT COALESCE(SUM(subtotal), 0)
  INTO items_subtotal
  FROM quote_items
  WHERE quote_id = NEW.id;

  -- Actualizar totales de la cotización
  UPDATE quotes
  SET
    subtotal = items_subtotal,
    total = items_subtotal + COALESCE(taxes, 0) - COALESCE(discount, 0),
    updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Auto-generar número de cotización
CREATE OR REPLACE FUNCTION set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := generate_quote_number();
  END IF;

  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_quote_number
BEFORE INSERT OR UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION set_quote_number();

-- Actualizar totales cuando se modifican items
CREATE TRIGGER trg_update_quote_totals_insert
AFTER INSERT ON quote_items
FOR EACH ROW
EXECUTE FUNCTION calculate_quote_totals();

CREATE TRIGGER trg_update_quote_totals_update
AFTER UPDATE ON quote_items
FOR EACH ROW
EXECUTE FUNCTION calculate_quote_totals();

CREATE TRIGGER trg_update_quote_totals_delete
AFTER DELETE ON quote_items
FOR EACH ROW
EXECUTE FUNCTION calculate_quote_totals();

-- Auto-actualizar updated_at en itineraries
CREATE OR REPLACE FUNCTION update_itinerary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_itinerary_timestamp
BEFORE UPDATE ON itineraries
FOR EACH ROW
EXECUTE FUNCTION update_itinerary_timestamp();


-- ============================================
-- 7. DATOS DE EJEMPLO - ITINERARIOS
-- ============================================

INSERT INTO itineraries (
  booking_id, user_id, created_by,
  title, destination, description,
  start_date, end_date,
  days, notes, recommendations, status
) VALUES
(
  1, 2, 2,
  'Viaje a Cancún - 7 días',
  'Cancún, Quintana Roo',
  'Escapada perfecta al Caribe Mexicano con actividades y relajación',
  '2025-12-20', '2025-12-26',
  '[
    {
      "day": 1,
      "date": "2025-12-20",
      "title": "Llegada a Cancún",
      "activities": [
        {"time": "10:00", "title": "Llegada al aeropuerto", "description": "Vuelo AM 123", "location": "Aeropuerto Internacional de Cancún"},
        {"time": "11:30", "title": "Traslado al hotel", "description": "Servicio privado incluido", "location": "Live Aqua Beach Resort"},
        {"time": "14:00", "title": "Check-in y almuerzo", "description": "Buffet internacional", "location": "Hotel"},
        {"time": "16:00", "title": "Tiempo libre en la playa", "description": "Relájate y disfruta", "location": "Playa del hotel"},
        {"time": "20:00", "title": "Cena de bienvenida", "description": "Restaurante italiano del hotel", "location": "Hotel"}
      ]
    },
    {
      "day": 2,
      "date": "2025-12-21",
      "title": "Exploración de Cancún",
      "activities": [
        {"time": "08:00", "title": "Desayuno", "description": "Buffet", "location": "Hotel"},
        {"time": "10:00", "title": "Tour por Isla Mujeres", "description": "Incluye snorkel y comida", "location": "Puerto"},
        {"time": "17:00", "title": "Regreso al hotel", "description": "", "location": "Hotel"},
        {"time": "20:00", "title": "Cena libre", "description": "Recomendación: La Habichuela Downtown", "location": ""}
      ]
    },
    {
      "day": 3,
      "date": "2025-12-22",
      "title": "Aventura Maya",
      "activities": [
        {"time": "07:00", "title": "Desayuno temprano", "description": "", "location": "Hotel"},
        {"time": "08:00", "title": "Excursión a Chichén Itzá", "description": "Incluye guía y comida", "location": "Chichén Itzá"},
        {"time": "19:00", "title": "Regreso al hotel", "description": "", "location": "Hotel"}
      ]
    }
  ]'::jsonb,
  'Llevar protector solar biodegradable. Moneda local: pesos mexicanos.',
  'Restaurantes recomendados: Harry''s, Porfirio''s, La Habichuela. No olvides visitar el mirador de la Torre Escénica.',
  'active'
);


-- ============================================
-- 8. DATOS DE EJEMPLO - COTIZACIONES
-- ============================================

INSERT INTO quotes (
  user_id, created_by,
  quote_number, customer_name, customer_email, customer_phone,
  title, destination, trip_type,
  travel_start_date, travel_end_date, valid_until,
  subtotal, taxes, discount, total, currency,
  notes, terms_conditions, status
) VALUES
(
  2, 2,
  'Q-2025-0001',
  'Juan Pérez García',
  'juan.perez@empresa.com',
  '+52 55 1234 5678',
  'Paquete Cancún Todo Incluido',
  'Cancún, Q.Roo',
  'package',
  '2026-01-15', '2026-01-22',
  '2025-12-31',
  25000.00, 4000.00, 2000.00, 27000.00, 'MXN',
  'Incluye vuelo redondo, 7 noches de hotel, traslados y tours.',
  'Precios sujetos a disponibilidad. Pago 50% anticipo, 50% 15 días antes del viaje. Cancelaciones: cargo 20% antes de 30 días, 50% antes de 15 días, 100% después.',
  'sent'
),
(
  3, 2,
  'Q-2025-0002',
  'María García López',
  'maria.garcia@email.com',
  '+52 33 9876 5432',
  'Viaje Corporativo CDMX',
  'Ciudad de México',
  'mixed',
  '2026-02-10', '2026-02-12',
  '2026-01-10',
  15000.00, 2400.00, 0.00, 17400.00, 'MXN',
  'Viaje de negocios para 5 personas. Incluye hospedaje y traslados.',
  'Pago contra factura 15 días. Precios más IVA.',
  'draft'
);

-- Items para cotización 1
INSERT INTO quote_items (quote_id, display_order, category, item_name, description, quantity, unit_price, notes) VALUES
(1, 1, 'flight', 'Vuelos redondo MEX-CUN', 'Aeroméxico, clase turista', 2, 3500.00, 'Equipaje documentado incluido'),
(1, 2, 'hotel', 'Hotel Live Aqua Beach Resort', '7 noches, habitación doble, todo incluido', 1, 14000.00, 'Vista al mar'),
(1, 3, 'transfer', 'Traslados aeropuerto-hotel-aeropuerto', 'Servicio privado', 1, 1500.00, null),
(1, 4, 'activity', 'Tour Chichén Itzá', 'Incluye transporte, guía y comida', 2, 1500.00, 'Salida 8:00 AM'),
(1, 5, 'activity', 'Tour Isla Mujeres', 'Incluye snorkel y comida', 2, 1000.00, null);

-- Items para cotización 2
INSERT INTO quote_items (quote_id, display_order, category, item_name, description, quantity, unit_price) VALUES
(2, 1, 'hotel', 'Hotel Hilton Reforma', '2 noches, 5 habitaciones ejecutivas', 10, 1200.00),
(2, 2, 'transfer', 'Traslados aeropuerto', 'Van ejecutiva para 5 personas', 2, 600.00),
(2, 3, 'custom', 'Sala de juntas', 'Renta por 8 horas, día 1', 1, 3000.00);


-- ============================================
-- 9. VISTAS ÚTILES
-- ============================================

-- Vista de itinerarios con info de reserva
CREATE OR REPLACE VIEW v_itineraries_summary AS
SELECT
  i.*,
  b.booking_reference,
  b.booking_type,
  u.name as user_name,
  u.email as user_email
FROM itineraries i
LEFT JOIN bookings b ON i.booking_id = b.id
LEFT JOIN users u ON i.user_id = u.id
ORDER BY i.created_at DESC;

-- Vista de cotizaciones con totales
CREATE OR REPLACE VIEW v_quotes_summary AS
SELECT
  q.*,
  COUNT(qi.id) as items_count,
  CASE
    WHEN q.status = 'draft' THEN 'Borrador'
    WHEN q.status = 'sent' THEN 'Enviada'
    WHEN q.status = 'viewed' THEN 'Vista'
    WHEN q.status = 'accepted' THEN 'Aceptada'
    WHEN q.status = 'rejected' THEN 'Rechazada'
    WHEN q.status = 'expired' THEN 'Expirada'
  END as status_label,
  u.name as customer_user_name
FROM quotes q
LEFT JOIN quote_items qi ON q.id = qi.quote_id
LEFT JOIN users u ON q.user_id = u.id
GROUP BY q.id, u.name
ORDER BY q.created_at DESC;


-- ============================================
-- FINALIZADO
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migración 010 completada:';
  RAISE NOTICE '  - Tabla itineraries creada';
  RAISE NOTICE '  - Tabla quotes creada';
  RAISE NOTICE '  - Tabla quote_items creada';
  RAISE NOTICE '  - % itinerarios de ejemplo', (SELECT COUNT(*) FROM itineraries);
  RAISE NOTICE '  - % cotizaciones de ejemplo', (SELECT COUNT(*) FROM quotes);
  RAISE NOTICE '  - % items de cotización', (SELECT COUNT(*) FROM quote_items);
  RAISE NOTICE '  - Funciones y triggers creados';
  RAISE NOTICE '  - Vistas útiles creadas';
END $$;
