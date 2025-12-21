-- Migration 009: Sistema de Facturación CFDI
-- Date: 18 Dec 2025 - 05:00 CST
-- Purpose: Crear tabla de facturas y datos de ejemplo

-- ============================================
-- 1. TABLA DE FACTURAS
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),

  -- Identificadores de factura
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  folio_fiscal UUID,  -- UUID del SAT
  serie VARCHAR(10),
  folio VARCHAR(20),

  -- Datos del receptor (cliente)
  rfc_receptor VARCHAR(13) NOT NULL,
  nombre_receptor VARCHAR(255) NOT NULL,
  email_receptor VARCHAR(255),

  -- Montos
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  impuestos DECIMAL(10,2) DEFAULT 0,
  descuentos DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'MXN',

  -- Estado de la factura
  status VARCHAR(20) DEFAULT 'draft',
  -- draft | issued | paid | overdue | cancelled

  -- Fechas
  fecha_emision TIMESTAMP,
  fecha_pago TIMESTAMP,
  fecha_vencimiento TIMESTAMP,
  fecha_cancelacion TIMESTAMP,
  motivo_cancelacion TEXT,

  -- Datos SAT (CFDI)
  sello_digital_cfdi TEXT,
  sello_digital_sat TEXT,
  cadena_original_sat TEXT,
  numero_certificado_sat VARCHAR(50),
  rfc_proveedor_certificacion VARCHAR(13),

  -- URLs de archivos
  pdf_url TEXT,
  xml_url TEXT,

  -- Integración Facturama
  facturama_id VARCHAR(100),
  facturama_status VARCHAR(50),

  -- Notas adicionales
  notas TEXT,
  uso_cfdi VARCHAR(10) DEFAULT 'G03',  -- G03 = Gastos en general
  forma_pago VARCHAR(10) DEFAULT '03',  -- 03 = Transferencia
  metodo_pago VARCHAR(10) DEFAULT 'PUE', -- PUE = Pago en una sola exhibición

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id)
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_rfc ON invoices(rfc_receptor);
CREATE INDEX IF NOT EXISTS idx_invoices_fecha ON invoices(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_invoices_folio_fiscal ON invoices(folio_fiscal);

-- Comentarios
COMMENT ON TABLE invoices IS 'Facturas CFDI generadas para reservas';
COMMENT ON COLUMN invoices.status IS 'draft=Borrador, issued=Emitida, paid=Pagada, overdue=Vencida, cancelled=Cancelada';
COMMENT ON COLUMN invoices.uso_cfdi IS 'Uso de CFDI según catálogo SAT';


-- ============================================
-- 2. TABLA DE CUENTAS POR COBRAR
-- ============================================

CREATE TABLE IF NOT EXISTS accounts_receivable (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id),
  booking_id INTEGER REFERENCES bookings(id),

  -- Datos del deudor
  customer_name VARCHAR(255) NOT NULL,
  customer_rfc VARCHAR(13),
  customer_email VARCHAR(255),

  -- Montos
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  amount_remaining DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',

  -- Fechas
  due_date DATE NOT NULL,
  paid_date DATE,

  -- Estado
  status VARCHAR(20) DEFAULT 'pending',
  -- pending | partial | paid | overdue | cancelled

  -- Notas
  notes TEXT,

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ar_invoice ON accounts_receivable(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ar_status ON accounts_receivable(status);
CREATE INDEX IF NOT EXISTS idx_ar_due_date ON accounts_receivable(due_date);

COMMENT ON TABLE accounts_receivable IS 'Cuentas por cobrar a clientes';


-- ============================================
-- 3. TABLA DE CUENTAS POR PAGAR
-- ============================================

CREATE TABLE IF NOT EXISTS accounts_payable (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),

  -- Datos del proveedor
  supplier_name VARCHAR(255) NOT NULL,
  supplier_rfc VARCHAR(13),
  supplier_contact VARCHAR(255),

  -- Referencia de factura del proveedor
  supplier_invoice_number VARCHAR(100),

  -- Montos
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  amount_remaining DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',

  -- Fechas
  invoice_date DATE,
  due_date DATE NOT NULL,
  paid_date DATE,

  -- Estado
  status VARCHAR(20) DEFAULT 'pending',
  -- pending | partial | paid | overdue | cancelled

  -- Categoría de gasto
  expense_category VARCHAR(50),
  -- hotels | flights | transportation | activities | other

  -- Notas
  notes TEXT,

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ap_booking ON accounts_payable(booking_id);
CREATE INDEX IF NOT EXISTS idx_ap_status ON accounts_payable(status);
CREATE INDEX IF NOT EXISTS idx_ap_due_date ON accounts_payable(due_date);
CREATE INDEX IF NOT EXISTS idx_ap_category ON accounts_payable(expense_category);

COMMENT ON TABLE accounts_payable IS 'Cuentas por pagar a proveedores';


-- ============================================
-- 4. DATOS DE EJEMPLO - FACTURAS
-- ============================================

-- Insertar facturas de ejemplo (basadas en reservas existentes)
INSERT INTO invoices (
  booking_id, invoice_number, serie, folio,
  rfc_receptor, nombre_receptor, email_receptor,
  total, subtotal, impuestos,
  status, fecha_emision, fecha_pago,
  uso_cfdi, forma_pago, metodo_pago,
  pdf_url, xml_url,
  created_by, notas
) VALUES
-- Factura 1 - Reserva de hotel
(
  1,
  'A-001',
  'A',
  '001',
  'XAXX010101000',
  'Juan Pérez García',
  'juan.perez@empresa.com',
  23200.00,
  20000.00,
  3200.00,
  'paid',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '10 days',
  'G03',
  '03',
  'PUE',
  'https://example.com/facturas/A-001.pdf',
  'https://example.com/facturas/A-001.xml',
  2,
  'Reserva de hotel corporativo - 5 noches en Ciudad de México'
),

-- Factura 2 - Vuelo + Hotel
(
  2,
  'A-002',
  'A',
  '002',
  'SAGM850615A10',
  'María García Sánchez',
  'maria.garcia@empresa.com',
  31350.00,
  27000.00,
  4350.00,
  'paid',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '8 days',
  'G03',
  '04',
  'PUE',
  'https://example.com/facturas/A-002.pdf',
  'https://example.com/facturas/A-002.xml',
  3,
  'Paquete completo vuelo + hotel a Cancún'
),

-- Factura 3 - Vuelo corporativo
(
  3,
  'A-003',
  'A',
  '003',
  'EMP090101XY8',
  'Empresa Demo SA de CV',
  'admin@empresa.com',
  17400.00,
  15000.00,
  2400.00,
  'issued',
  NOW() - INTERVAL '5 days',
  NULL,
  'G03',
  '99',
  'PPD',
  'https://example.com/facturas/A-003.pdf',
  'https://example.com/facturas/A-003.xml',
  2,
  'Vuelo redondo Ciudad de México - Monterrey'
),

-- Factura 4 - Pendiente de pago
(
  4,
  'A-004',
  'A',
  '004',
  'XAXX010101000',
  'Carlos Rodríguez López',
  'empleado@empresa.com',
  34800.00,
  30000.00,
  4800.00,
  'issued',
  NOW() - INTERVAL '3 days',
  NULL,
  'G03',
  '03',
  'PPD',
  'https://example.com/facturas/A-004.pdf',
  'https://example.com/facturas/A-004.xml',
  2,
  'Reserva de hotel de lujo 7 noches'
),

-- Factura 5 - Vencida
(
  5,
  'A-005',
  'A',
  '005',
  'EMP090101XY8',
  'Empresa Demo SA de CV',
  'admin@empresa.com',
  12760.00,
  11000.00,
  1760.00,
  'overdue',
  NOW() - INTERVAL '45 days',
  NULL,
  'G03',
  '03',
  'PPD',
  'https://example.com/facturas/A-005.pdf',
  'https://example.com/facturas/A-005.xml',
  2,
  'Paquete fin de semana - VENCIDA'
);


-- ============================================
-- 5. DATOS DE EJEMPLO - CUENTAS POR COBRAR
-- ============================================

INSERT INTO accounts_receivable (
  invoice_id, booking_id,
  customer_name, customer_rfc, customer_email,
  amount_due, amount_paid, amount_remaining,
  due_date, paid_date, status, notes
) VALUES
-- Cuenta 1 - Pagada completamente
(
  1, 1,
  'Juan Pérez García',
  'XAXX010101000',
  'juan.perez@empresa.com',
  23200.00,
  23200.00,
  0.00,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days',
  'paid',
  'Pago recibido por transferencia bancaria'
),

-- Cuenta 2 - Pagada
(
  2, 2,
  'María García Sánchez',
  'SAGM850615A10',
  'maria.garcia@empresa.com',
  31350.00,
  31350.00,
  0.00,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days',
  'paid',
  'Pago recibido por tarjeta de crédito'
),

-- Cuenta 3 - Pendiente
(
  3, 3,
  'Empresa Demo SA de CV',
  'EMP090101XY8',
  'admin@empresa.com',
  17400.00,
  0.00,
  17400.00,
  NOW() + INTERVAL '15 days',
  NULL,
  'pending',
  'Pendiente de pago - Crédito 30 días'
),

-- Cuenta 4 - Pago parcial
(
  4, 4,
  'Carlos Rodríguez López',
  'XAXX010101000',
  'empleado@empresa.com',
  34800.00,
  20000.00,
  14800.00,
  NOW() + INTERVAL '10 days',
  NULL,
  'partial',
  'Anticipo del 57% recibido, saldo pendiente'
),

-- Cuenta 5 - Vencida
(
  5, 5,
  'Empresa Demo SA de CV',
  'EMP090101XY8',
  'admin@empresa.com',
  12760.00,
  0.00,
  12760.00,
  NOW() - INTERVAL '15 days',
  NULL,
  'overdue',
  'VENCIDA - Contactar para pago inmediato'
);


-- ============================================
-- 6. DATOS DE EJEMPLO - CUENTAS POR PAGAR
-- ============================================

INSERT INTO accounts_payable (
  booking_id, supplier_name, supplier_rfc, supplier_contact,
  supplier_invoice_number,
  amount_due, amount_paid, amount_remaining,
  invoice_date, due_date, paid_date,
  status, expense_category, notes
) VALUES
-- Cuenta 1 - Hotel pagado
(
  1,
  'Hotel Marriott Ciudad de México',
  'HMM850101XY9',
  'facturacion@marriott.com.mx',
  'HMEX-2024-12-001',
  18000.00,
  18000.00,
  0.00,
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days',
  'paid',
  'hotels',
  'Pago por 5 noches en habitación ejecutiva'
),

-- Cuenta 2 - Aerolínea pagada
(
  2,
  'Aeroméxico',
  'AMX901010AB3',
  'corporativo@aeromexico.com',
  'AM-12345678',
  8000.00,
  8000.00,
  0.00,
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days',
  'paid',
  'flights',
  'Vuelo redondo MEX-CUN'
),

-- Cuenta 3 - Hotel Cancún (pagado)
(
  2,
  'Live Aqua Beach Resort Cancún',
  'LAQ950101CD5',
  'reservas@liveaqua.com',
  'LAQ-CUN-2024-456',
  19000.00,
  19000.00,
  0.00,
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days',
  'paid',
  'hotels',
  'Habitación vista al mar - 7 noches'
),

-- Cuenta 4 - Pendiente de pago
(
  3,
  'Viva Aerobus',
  'VAB970101EF7',
  'corporativo@vivaaerobus.com',
  'VB-87654321',
  12500.00,
  0.00,
  12500.00,
  NOW() - INTERVAL '10 days',
  NOW() + INTERVAL '5 days',
  NULL,
  'pending',
  'flights',
  'Vuelo MEX-MTY - Pendiente de pago'
),

-- Cuenta 5 - Traslados pendiente
(
  4,
  'Transportes Ejecutivos SA',
  'TEX001010GH9',
  'cobranza@transejec.com.mx',
  'TE-2024-789',
  2500.00,
  0.00,
  2500.00,
  NOW() - INTERVAL '8 days',
  NOW() + INTERVAL '7 days',
  NULL,
  'pending',
  'transportation',
  'Traslados aeropuerto - hotel - aeropuerto'
),

-- Cuenta 6 - Vencida
(
  5,
  'Tours y Excursiones Riviera Maya',
  'TRM880101IJ1',
  'pagos@toursriviera.com',
  'TRM-2024-321',
  3800.00,
  0.00,
  3800.00,
  NOW() - INTERVAL '50 days',
  NOW() - INTERVAL '20 days',
  NULL,
  'overdue',
  'activities',
  'VENCIDA - Tours incluidos en paquete'
);


-- ============================================
-- 7. FUNCIÓN PARA GENERAR NÚMERO DE FACTURA
-- ============================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  next_folio INTEGER;
  invoice_num VARCHAR(50);
BEGIN
  -- Obtener el siguiente folio
  SELECT COALESCE(MAX(CAST(folio AS INTEGER)), 0) + 1
  INTO next_folio
  FROM invoices
  WHERE serie = 'A';

  -- Formatear con ceros a la izquierda
  invoice_num := 'A-' || LPAD(next_folio::TEXT, 3, '0');

  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 8. TRIGGER PARA AUTO-GENERAR NÚMERO
-- ============================================

CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
    NEW.serie := 'A';
    NEW.folio := SUBSTRING(NEW.invoice_number FROM 3);
  END IF;

  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_invoice_number
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_invoice_number();


-- ============================================
-- 9. VISTAS ÚTILES
-- ============================================

-- Vista de resumen de facturas
CREATE OR REPLACE VIEW v_invoices_summary AS
SELECT
  i.id,
  i.invoice_number,
  i.booking_id,
  b.booking_reference,
  b.booking_type,
  i.rfc_receptor,
  i.nombre_receptor,
  i.email_receptor,
  i.total,
  i.subtotal,
  i.impuestos,
  i.status,
  i.fecha_emision,
  i.fecha_pago,
  i.pdf_url,
  i.xml_url,
  CASE
    WHEN i.status = 'paid' THEN 'Pagada'
    WHEN i.status = 'issued' THEN 'Emitida'
    WHEN i.status = 'overdue' THEN 'Vencida'
    WHEN i.status = 'cancelled' THEN 'Cancelada'
    ELSE 'Borrador'
  END AS status_label,
  CASE
    WHEN i.status = 'paid' THEN 0
    WHEN i.status = 'issued' AND i.fecha_emision < NOW() - INTERVAL '30 days' THEN i.total
    ELSE 0
  END AS amount_overdue
FROM invoices i
LEFT JOIN bookings b ON i.booking_id = b.id
ORDER BY i.fecha_emision DESC;


-- Vista de cuentas por cobrar pendientes
CREATE OR REPLACE VIEW v_ar_pending AS
SELECT
  ar.*,
  i.invoice_number,
  i.pdf_url,
  CASE
    WHEN ar.due_date < NOW() THEN 'Vencida'
    WHEN ar.due_date < NOW() + INTERVAL '7 days' THEN 'Próxima a vencer'
    ELSE 'Al corriente'
  END AS urgency_status
FROM accounts_receivable ar
LEFT JOIN invoices i ON ar.invoice_id = i.id
WHERE ar.status IN ('pending', 'partial', 'overdue')
ORDER BY ar.due_date ASC;


-- Vista de cuentas por pagar pendientes
CREATE OR REPLACE VIEW v_ap_pending AS
SELECT
  ap.*,
  b.booking_reference,
  CASE
    WHEN ap.due_date < NOW() THEN 'Vencida'
    WHEN ap.due_date < NOW() + INTERVAL '7 days' THEN 'Próxima a vencer'
    ELSE 'Al corriente'
  END AS urgency_status
FROM accounts_payable ap
LEFT JOIN bookings b ON ap.booking_id = b.id
WHERE ap.status IN ('pending', 'partial', 'overdue')
ORDER BY ap.due_date ASC;


-- ============================================
-- FINALIZADO
-- ============================================

-- Mostrar resumen
DO $$
BEGIN
  RAISE NOTICE '✅ Migración 009 completada:';
  RAISE NOTICE '  - Tabla invoices creada';
  RAISE NOTICE '  - Tabla accounts_receivable creada';
  RAISE NOTICE '  - Tabla accounts_payable creada';
  RAISE NOTICE '  - % facturas de ejemplo insertadas', (SELECT COUNT(*) FROM invoices);
  RAISE NOTICE '  - % cuentas por cobrar insertadas', (SELECT COUNT(*) FROM accounts_receivable);
  RAISE NOTICE '  - % cuentas por pagar insertadas', (SELECT COUNT(*) FROM accounts_payable);
  RAISE NOTICE '  - Funciones y triggers creados';
  RAISE NOTICE '  - Vistas útiles creadas';
END $$;
