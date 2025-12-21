-- ================================================
-- MIGRACIÓN 008: TABLA PAYMENT_TRANSACTIONS
-- Transacciones de pago individuales (Stripe, PayPal, etc.)
-- ================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  tenant_id INTEGER DEFAULT 1,

  -- Monto
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',

  -- Estado
  status VARCHAR(20) DEFAULT 'pending',
  -- Estados: pending, completed, failed, refunded

  -- Método de pago
  payment_method VARCHAR(20) NOT NULL,
  -- Métodos: stripe, paypal, transfer, cash

  -- IDs de proveedor
  transaction_id VARCHAR(255),
  capture_id VARCHAR(255),
  payer_email VARCHAR(255),
  payer_id VARCHAR(255),

  -- Error (si falló)
  error_message TEXT,

  -- Metadata adicional
  metadata JSONB,

  -- Fechas
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_tenant ON payment_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_method ON payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_transactions_updated_at_trigger
BEFORE UPDATE ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION update_payment_transactions_updated_at();
