-- ================================================
-- MIGRACIÓN 009: DATOS DE PRUEBA
-- Transacciones de Pago y Aprobaciones
-- ================================================

-- ==================== TRANSACCIONES DE PAGO ====================

-- Limpiar datos anteriores (solo para pruebas)
TRUNCATE TABLE payment_transactions RESTART IDENTITY CASCADE;

-- 10 transacciones de prueba con diferentes estados y métodos
INSERT INTO payment_transactions (
  booking_id, user_id, tenant_id, amount, currency, status,
  payment_method, transaction_id, capture_id, payer_email,
  payer_id, created_at, paid_at
) VALUES
-- Pagos completados con Stripe
(1, 5, 1, 15000.00, 'MXN', 'completed', 'stripe', 'pi_1234567890', 'ch_1234567890',
 'empleado@empresa.com', 'cus_stripe_001', '2025-12-10 10:30:00', '2025-12-10 10:30:15'),

(2, 6, 1, 8500.00, 'MXN', 'completed', 'stripe', 'pi_0987654321', 'ch_0987654321',
 'juan.perez@empresa.com', 'cus_stripe_002', '2025-12-12 14:20:00', '2025-12-12 14:20:10'),

(3, 5, 1, 25000.00, 'MXN', 'completed', 'stripe', 'pi_1111222233', 'ch_1111222233',
 'empleado@empresa.com', 'cus_stripe_001', '2025-12-15 09:00:00', '2025-12-15 09:00:20'),

-- Pagos completados con PayPal
(4, 6, 1, 12000.00, 'MXN', 'completed', 'paypal', '5AB12345CD678901', 'CAPTURE123456',
 'juan.perez@empresa.com', 'PAYERID001', '2025-12-11 16:45:00', '2025-12-11 16:45:25'),

(5, 5, 1, 18500.00, 'MXN', 'completed', 'paypal', '6CD23456DE789012', 'CAPTURE234567',
 'empleado@empresa.com', 'PAYERID002', '2025-12-13 11:15:00', '2025-12-13 11:15:30'),

-- Pagos pendientes
(6, 5, 1, 9800.00, 'MXN', 'pending', 'stripe', 'pi_pending_001', NULL,
 'empleado@empresa.com', 'cus_stripe_001', '2025-12-17 08:00:00', NULL),

(NULL, 6, 1, 14500.00, 'MXN', 'pending', 'paypal', '7DE34567EF890123', NULL,
 'juan.perez@empresa.com', NULL, '2025-12-17 15:30:00', NULL),

-- Pagos fallidos
(NULL, 5, 1, 5500.00, 'MXN', 'failed', 'stripe', 'pi_failed_001', NULL,
 'empleado@empresa.com', 'cus_stripe_001', '2025-12-16 13:20:00', NULL),

(NULL, 6, 1, 7200.00, 'MXN', 'failed', 'paypal', '8EF45678FG901234', NULL,
 'juan.perez@empresa.com', NULL, '2025-12-16 17:00:00', NULL),

-- Pago reembolsado
(3, 5, 1, 3500.00, 'MXN', 'refunded', 'stripe', 'pi_refund_001', 'ch_refund_001',
 'empleado@empresa.com', 'cus_stripe_001', '2025-12-14 10:00:00', '2025-12-14 10:00:15');

-- Actualizar refunded_at para el reembolso
UPDATE payment_transactions
SET refunded_at = '2025-12-15 14:30:00',
    error_message = 'Reembolso solicitado por cliente'
WHERE transaction_id = 'pi_refund_001';

-- Agregar mensajes de error a los fallidos
UPDATE payment_transactions
SET error_message = 'Tarjeta declinada - fondos insuficientes'
WHERE transaction_id = 'pi_failed_001';

UPDATE payment_transactions
SET error_message = 'PayPal account validation failed'
WHERE transaction_id = '8EF45678FG901234';


-- ==================== APROBACIONES DE VIAJE ====================

-- Nota: La tabla travel_approvals ya existe en la BD
-- Columnas: id, booking_id, tenant_id, requested_by, approved_by, status,
--           estimated_cost, reason_for_travel, rejection_reason, created_at, updated_at

-- Limpiar datos anteriores
TRUNCATE TABLE travel_approvals RESTART IDENTITY CASCADE;

-- 8 aprobaciones de prueba con diferentes estados
INSERT INTO travel_approvals (
  booking_id, requested_by, approved_by, tenant_id, status,
  estimated_cost, reason_for_travel, rejection_reason, created_at, updated_at
) VALUES
-- Pendientes (sin approved_by)
(1, 5, NULL, 1, 'pending', 15000.00, 'Viaje a Cancún, México del 25 al 30 de diciembre 2025',
 NULL, '2025-12-18 09:00:00', '2025-12-18 09:00:00'),

(2, 6, NULL, 1, 'pending', 8500.00, 'Viaje a Monterrey, México del 20 al 22 de diciembre 2025',
 NULL, '2025-12-18 10:30:00', '2025-12-18 10:30:00'),

(NULL, 5, NULL, 1, 'pending', 22000.00, 'Viaje a Miami, USA del 15 al 20 de enero 2026',
 NULL, '2025-12-17 14:00:00', '2025-12-17 14:00:00'),

-- Aprobadas (con approved_by = manager)
(3, 5, 3, 1, 'approved', 12000.00, 'Viaje de negocios a Guadalajara del 22 al 24 de diciembre 2025',
 NULL, '2025-12-16 08:00:00', '2025-12-16 15:30:00'),

(4, 6, 3, 1, 'approved', 18500.00, 'Conferencia anual en Ciudad de México del 28 de diciembre al 2 de enero',
 NULL, '2025-12-15 11:00:00', '2025-12-15 16:00:00'),

(NULL, 5, 4, 1, 'approved', 9800.00, 'Incentivo de ventas en Los Cabos del 10 al 13 de enero 2026',
 NULL, '2025-12-14 09:30:00', '2025-12-14 14:00:00'),

-- Rechazadas
(NULL, 6, 3, 1, 'rejected', 45000.00, 'Viaje a París, Francia del 1 al 10 de febrero 2026',
 'Rechazado - excede presupuesto del departamento', '2025-12-13 10:00:00', '2025-12-13 17:00:00'),

(NULL, 5, 4, 1, 'rejected', 35000.00, 'Viaje a Tokio, Japón del 15 al 25 de marzo 2026',
 'Rechazado - viaje no justificado', '2025-12-12 13:00:00', '2025-12-12 18:30:00');


-- ==================== VERIFICACIÓN ====================

-- Mostrar resumen de transacciones
SELECT
  status,
  payment_method,
  COUNT(*) as cantidad,
  SUM(amount) as total_monto
FROM payment_transactions
GROUP BY status, payment_method
ORDER BY status, payment_method;

-- Mostrar resumen de aprobaciones
SELECT
  status,
  COUNT(*) as cantidad,
  SUM(amount) as total_monto
FROM travel_approvals
GROUP BY status
ORDER BY
  CASE status
    WHEN 'pending' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'rejected' THEN 3
  END;
