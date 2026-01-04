-- ============================================================================
-- MIGRACIÓN 003: PAYMENT TRANSACTIONS Y SUBSCRIPTIONS
-- Fecha: 15 de Diciembre de 2025
-- Versión: v2.79
-- Descripción: Tablas para procesar pagos con Stripe y PayPal
-- ============================================================================

-- Tabla de transacciones de pago
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Montos
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',

  -- Estado
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- pending, completed, failed, refunded, cancelled

  -- Método de pago
  payment_method VARCHAR(20) NOT NULL,
  -- stripe, paypal, cash, bank_transfer

  -- IDs de transacción
  transaction_id VARCHAR(255) NOT NULL,
  -- Stripe: payment_intent_id
  -- PayPal: order_id

  capture_id VARCHAR(255),
  -- PayPal: capture_id
  -- Stripe: charge_id

  -- Detalles del pagador
  payer_email VARCHAR(255),
  payer_id VARCHAR(255),

  -- Errores
  error_message TEXT,

  -- Fechas
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT payment_transactions_status_check
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  CONSTRAINT payment_transactions_payment_method_check
    CHECK (payment_method IN ('stripe', 'paypal', 'cash', 'bank_transfer')),
  CONSTRAINT payment_transactions_amount_check
    CHECK (amount > 0)
);

-- Índices para payment_transactions
CREATE INDEX idx_payment_transactions_booking_id ON payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_tenant_id ON payment_transactions(tenant_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_payment_method ON payment_transactions(payment_method);
CREATE INDEX idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- ============================================================================
-- SUBSCRIPTIONS (para empresas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- IDs de subscripción
  stripe_subscription_id VARCHAR(255) UNIQUE,
  paypal_subscription_id VARCHAR(255) UNIQUE,

  -- Estado
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  -- active, cancelled, past_due, unpaid, trialing

  -- Plan
  plan_name VARCHAR(100),
  plan_amount DECIMAL(10, 2),
  plan_currency VARCHAR(3) DEFAULT 'USD',
  plan_interval VARCHAR(20),
  -- month, year

  -- Fechas
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancelled_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  metadata JSONB,

  -- Constraints
  CONSTRAINT subscriptions_status_check
    CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid', 'trialing')),
  CONSTRAINT subscriptions_provider_check
    CHECK (
      (stripe_subscription_id IS NOT NULL AND paypal_subscription_id IS NULL) OR
      (stripe_subscription_id IS NULL AND paypal_subscription_id IS NOT NULL)
    )
);

-- Índices para subscriptions
CREATE INDEX idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_subscriptions_paypal_id ON subscriptions(paypal_subscription_id) WHERE paypal_subscription_id IS NOT NULL;
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================================================
-- ACTUALIZAR TABLA BOOKINGS
-- ============================================================================

-- Agregar campo de estado de pago si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';

    ALTER TABLE bookings
    ADD CONSTRAINT bookings_payment_status_check
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
  END IF;
END $$;

-- Índice para payment_status
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- ============================================================================
-- DATOS DE EJEMPLO (solo desarrollo)
-- ============================================================================

-- Insertar transacción de ejemplo (comentado para producción)
/*
INSERT INTO payment_transactions (
  booking_id,
  user_id,
  tenant_id,
  amount,
  currency,
  status,
  payment_method,
  transaction_id,
  paid_at
) VALUES (
  1, -- booking_id (ajustar según datos reales)
  1, -- user_id
  1, -- tenant_id
  150.00,
  'USD',
  'completed',
  'stripe',
  'pi_example_123456789',
  NOW()
) ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- FUNCIONES ÚTILES
-- ============================================================================

-- Función para calcular total de pagos por tenant
CREATE OR REPLACE FUNCTION get_payment_stats_by_tenant(tenant_id_param INTEGER)
RETURNS TABLE (
  total_transactions BIGINT,
  total_amount DECIMAL,
  pending_amount DECIMAL,
  completed_amount DECIMAL,
  refunded_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_transactions,
    COALESCE(SUM(amount), 0) as total_amount,
    COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as completed_amount,
    COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0) as refunded_amount
  FROM payment_transactions
  WHERE tenant_id = tenant_id_param;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener últimas transacciones
CREATE OR REPLACE FUNCTION get_recent_payments(limit_param INTEGER DEFAULT 10)
RETURNS TABLE (
  transaction_id VARCHAR,
  booking_id INTEGER,
  user_email VARCHAR,
  amount DECIMAL,
  currency VARCHAR,
  status VARCHAR,
  payment_method VARCHAR,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.transaction_id,
    pt.booking_id,
    u.email as user_email,
    pt.amount,
    pt.currency,
    pt.status,
    pt.payment_method,
    pt.created_at
  FROM payment_transactions pt
  LEFT JOIN users u ON pt.user_id = u.id
  ORDER BY pt.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE payment_transactions IS 'Registro de todas las transacciones de pago (Stripe, PayPal, etc.)';
COMMENT ON TABLE subscriptions IS 'Subscripciones recurrentes para empresas';

COMMENT ON COLUMN payment_transactions.status IS 'pending: Iniciado, completed: Pagado, failed: Fallido, refunded: Reembolsado, cancelled: Cancelado';
COMMENT ON COLUMN payment_transactions.payment_method IS 'stripe: Stripe, paypal: PayPal, cash: Efectivo, bank_transfer: Transferencia';
COMMENT ON COLUMN payment_transactions.transaction_id IS 'ID de transacción del proveedor (payment_intent_id de Stripe, order_id de PayPal)';

COMMENT ON COLUMN subscriptions.status IS 'active: Activa, cancelled: Cancelada, past_due: Vencida, unpaid: No pagada, trialing: Periodo de prueba';

-- ============================================================================
-- FIN DE MIGRACIÓN 003
-- ============================================================================

-- Para ejecutar esta migración:
-- psql -U <usuario> -d <base_de_datos> -f 003_payment_transactions.sql
