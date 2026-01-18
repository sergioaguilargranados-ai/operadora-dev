-- Migración 014: Crear tabla payment_transactions
-- Fecha: 09 Enero 2026
-- Propósito: Guardar todas las transacciones de pago (Stripe, PayPal, MercadoPago)

-- Crear tabla de transacciones de pago
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,

  -- Relaciones
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,

  -- Información del pago
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'MXN',

  -- Estado
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Valores: pending, processing, completed, failed, cancelled, refunded

  -- Método de pago
  payment_method VARCHAR(50) NOT NULL,
  -- Valores: stripe, paypal, mercadopago, oxxo, spei, transfer

  -- IDs externos
  transaction_id VARCHAR(255), -- ID del proveedor (pi_xxx, PAY-xxx, etc)
  external_reference VARCHAR(255), -- Referencia externa para tracking

  -- Detalles del pago
  payment_details JSONB, -- Info adicional del proveedor

  -- Tarjeta (si aplica, últimos 4 dígitos)
  card_last_four VARCHAR(4),
  card_brand VARCHAR(50), -- visa, mastercard, amex

  -- Errores
  error_code VARCHAR(100),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Índices implícitos por constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('stripe', 'paypal', 'mercadopago', 'oxxo', 'spei', 'transfer', 'cash'))
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_method ON payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER trigger_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_transactions_updated_at();

-- Comentarios
COMMENT ON TABLE payment_transactions IS 'Registro de todas las transacciones de pago';
COMMENT ON COLUMN payment_transactions.transaction_id IS 'ID único del proveedor de pagos';
COMMENT ON COLUMN payment_transactions.payment_details IS 'JSON con detalles adicionales del proveedor';

-- Verificar creación
SELECT 'Tabla payment_transactions creada exitosamente' AS resultado;
