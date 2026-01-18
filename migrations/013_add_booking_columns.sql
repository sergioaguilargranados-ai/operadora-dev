-- Migración 013: Agregar columnas faltantes a bookings
-- Fecha: 09 Enero 2026

-- Agregar columna service_name
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_name VARCHAR(255);

-- Agregar columna booking_details (JSON)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_details TEXT;

-- Agregar columna traveler_info (JSON)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS traveler_info TEXT;

-- Agregar columna contact_info (JSON)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_info TEXT;

-- Agregar columna payment_info (JSON)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_info TEXT;

-- Agregar columna special_requests
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- Agregar columna is_active
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Agregar columna confirmed_at
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;

-- Agregar columna cancelled_at
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- Agregar columna cancellation_reason
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Agregar columna payment_method
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Agregar columna booking_reference (alias de confirmation_code)
-- Si ya existe confirmation_code, renombrarlo
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'confirmation_code') THEN
    ALTER TABLE bookings RENAME COLUMN confirmation_code TO booking_reference;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_reference') THEN
    ALTER TABLE bookings ADD COLUMN booking_reference VARCHAR(100);
  END IF;
END $$;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);

-- Mostrar resultado
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
