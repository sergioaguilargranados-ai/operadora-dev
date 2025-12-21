-- =========================================
-- DATOS DE PRUEBA COMPLETOS - AS OPERADORA
-- =========================================
-- Versión: v88
-- Fecha: 15 de Diciembre de 2025
-- Propósito: Datos de prueba para todas las funcionalidades

-- IMPORTANTE: Ejecutar después de las migraciones
-- psql $DATABASE_URL -f datos-prueba-completos.sql

BEGIN;

-- =========================================
-- 1. TENANTS (Empresas)
-- =========================================

INSERT INTO tenants (id, name, subdomain, settings, is_active, created_at, updated_at)
VALUES
  (1, 'AS Operadora', 'asoperadora', '{"theme": "yellow", "currency": "MXN"}', true, NOW(), NOW()),
  (2, 'Empresa Demo S.A.', 'empresa-demo', '{"theme": "blue", "currency": "USD"}', true, NOW(), NOW()),
  (3, 'Tech Corp', 'techcorp', '{"theme": "green", "currency": "USD"}', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- =========================================
-- 2. USUARIOS (6 usuarios con diferentes roles)
-- =========================================

INSERT INTO users (email, password_hash, full_name, role, is_active, tenant_id, created_at, updated_at)
VALUES
  -- Hash de "Password123!" = $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky
  ('superadmin@asoperadora.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'Super Administrador', 'SUPER_ADMIN', true, 1, NOW() - INTERVAL '180 days', NOW()),
  ('admin@asoperadora.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'Administrador General', 'ADMIN', true, 1, NOW() - INTERVAL '150 days', NOW()),
  ('manager@empresa.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'Manager de Operaciones', 'MANAGER', true, 1, NOW() - INTERVAL '120 days', NOW()),
  ('empleado@empresa.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'Empleado Regular', 'EMPLOYEE', true, 1, NOW() - INTERVAL '90 days', NOW()),
  ('juan.perez@empresa.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'Juan Pérez', 'EMPLOYEE', true, 1, NOW() - INTERVAL '60 days', NOW()),
  ('maria.garcia@empresa.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky', 'María García', 'MANAGER', true, 1, NOW() - INTERVAL '100 days', NOW())
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- =========================================
-- 3. CENTRO DE COSTOS
-- =========================================

INSERT INTO cost_centers (name, code, budget, department, is_active, tenant_id, created_at, updated_at)
VALUES
  ('Marketing Digital', 'MKT-001', 50000.00, 'Marketing', true, 1, NOW(), NOW()),
  ('Desarrollo de Software', 'DEV-001', 80000.00, 'IT', true, 1, NOW(), NOW()),
  ('Recursos Humanos', 'RH-001', 30000.00, 'Recursos Humanos', true, 1, NOW(), NOW()),
  ('Ventas Nacional', 'VTA-001', 60000.00, 'Ventas', true, 1, NOW(), NOW()),
  ('Administración', 'ADM-001', 40000.00, 'Administración', true, 1, NOW(), NOW())
ON CONFLICT (code, tenant_id) DO NOTHING;

-- =========================================
-- 4. EMPLEADOS CORPORATIVOS
-- =========================================

INSERT INTO employees (
  first_name, last_name, email, department, position,
  employee_number, hire_date, is_active, tenant_id,
  created_at, updated_at
)
VALUES
  ('Carlos', 'Rodríguez', 'carlos.rodriguez@empresa.com', 'IT', 'Developer Senior', 'EMP-001', '2023-01-15', true, 1, NOW(), NOW()),
  ('Ana', 'Martínez', 'ana.martinez@empresa.com', 'Marketing', 'Marketing Manager', 'EMP-002', '2023-03-20', true, 1, NOW(), NOW()),
  ('Luis', 'Hernández', 'luis.hernandez@empresa.com', 'Ventas', 'Sales Executive', 'EMP-003', '2023-05-10', true, 1, NOW(), NOW()),
  ('Patricia', 'López', 'patricia.lopez@empresa.com', 'Recursos Humanos', 'HR Coordinator', 'EMP-004', '2023-07-01', true, 1, NOW(), NOW()),
  ('Roberto', 'González', 'roberto.gonzalez@empresa.com', 'IT', 'DevOps Engineer', 'EMP-005', '2023-09-15', true, 1, NOW(), NOW()),
  ('Laura', 'Sánchez', 'laura.sanchez@empresa.com', 'Marketing', 'Content Creator', 'EMP-006', '2023-11-20', true, 1, NOW(), NOW()),
  ('Miguel', 'Ramírez', 'miguel.ramirez@empresa.com', 'Ventas', 'Account Manager', 'EMP-007', '2024-01-10', true, 1, NOW(), NOW()),
  ('Sofía', 'Torres', 'sofia.torres@empresa.com', 'Administración', 'Office Manager', 'EMP-008', '2024-03-05', true, 1, NOW(), NOW()),
  ('Diego', 'Flores', 'diego.flores@empresa.com', 'IT', 'QA Engineer', 'EMP-009', '2024-05-12', true, 1, NOW(), NOW()),
  ('Valentina', 'Morales', 'valentina.morales@empresa.com', 'Marketing', 'Social Media Manager', 'EMP-010', '2024-07-18', true, 1, NOW(), NOW())
ON CONFLICT (employee_number, tenant_id) DO NOTHING;

-- =========================================
-- 5. POLÍTICAS DE VIAJE
-- =========================================

INSERT INTO travel_policies (
  name, description, max_flight_cost, max_hotel_cost,
  max_daily_expenses, requires_approval, tenant_id,
  is_active, created_at, updated_at
)
VALUES
  ('Política Estándar', 'Política para empleados regulares', 15000.00, 2500.00, 1500.00, true, 1, true, NOW(), NOW()),
  ('Política Ejecutiva', 'Política para ejecutivos y gerentes', 30000.00, 5000.00, 3000.00, true, 1, true, NOW(), NOW()),
  ('Política Básica', 'Política para viajes nacionales cortos', 8000.00, 1500.00, 800.00, false, 1, true, NOW(), NOW()),
  ('Política Internacional', 'Política para viajes internacionales', 50000.00, 8000.00, 5000.00, true, 1, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =========================================
-- 6. RESERVAS (Bookings)
-- =========================================

-- Obtener IDs de usuarios para las reservas
DO $$
DECLARE
  user_admin_id INT;
  user_employee_id INT;
  user_manager_id INT;
  user_juan_id INT;
BEGIN
  SELECT id INTO user_admin_id FROM users WHERE email = 'admin@asoperadora.com';
  SELECT id INTO user_employee_id FROM users WHERE email = 'empleado@empresa.com';
  SELECT id INTO user_manager_id FROM users WHERE email = 'manager@empresa.com';
  SELECT id INTO user_juan_id FROM users WHERE email = 'juan.perez@empresa.com';

  -- Reserva 1: Vuelo MEX-NYC (Confirmado)
  INSERT INTO bookings (
    user_id, tenant_id, type, status,
    origin, destination, departure_date, return_date,
    passengers, total_amount, currency,
    confirmation_code, provider, payment_status,
    cost_center_id, created_at, updated_at
  )
  VALUES (
    user_employee_id, 1, 'flight', 'confirmed',
    'MEX', 'NYC', '2025-12-20', '2025-12-27',
    1, 18500.00, 'MXN',
    'AA-' || LPAD((random() * 999999)::INT::TEXT, 6, '0'), 'Amadeus', 'paid',
    (SELECT id FROM cost_centers WHERE code = 'MKT-001' LIMIT 1),
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'
  );

  -- Reserva 2: Hotel en Cancún (Confirmado)
  INSERT INTO bookings (
    user_id, tenant_id, type, status,
    destination, departure_date, return_date,
    passengers, total_amount, currency,
    confirmation_code, provider, payment_status,
    cost_center_id, created_at, updated_at
  )
  VALUES (
    user_manager_id, 1, 'hotel', 'confirmed',
    'Cancún, México', '2025-12-18', '2025-12-22',
    2, 12000.00, 'MXN',
    'HTL-' || LPAD((random() * 999999)::INT::TEXT, 6, '0'), 'Booking.com', 'paid',
    (SELECT id FROM cost_centers WHERE code = 'VTA-001' LIMIT 1),
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
  );

  -- Reserva 3: Paquete MEX-LAX (Pendiente de pago)
  INSERT INTO bookings (
    user_id, tenant_id, type, status,
    origin, destination, departure_date, return_date,
    passengers, total_amount, currency,
    confirmation_code, provider, payment_status,
    cost_center_id, created_at, updated_at
  )
  VALUES (
    user_juan_id, 1, 'package', 'pending',
    'MEX', 'LAX', '2026-01-10', '2026-01-17',
    1, 22000.00, 'MXN',
    'PKG-' || LPAD((random() * 999999)::INT::TEXT, 6, '0'), 'Expedia', 'pending',
    (SELECT id FROM cost_centers WHERE code = 'DEV-001' LIMIT 1),
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  );

  -- Reserva 4: Vuelo MEX-GDL (Confirmado)
  INSERT INTO bookings (
    user_id, tenant_id, type, status,
    origin, destination, departure_date, return_date,
    passengers, total_amount, currency,
    confirmation_code, provider, payment_status,
    cost_center_id, created_at, updated_at
  )
  VALUES (
    user_admin_id, 1, 'flight', 'confirmed',
    'MEX', 'GDL', '2025-12-16', '2025-12-18',
    1, 3500.00, 'MXN',
    'AM-' || LPAD((random() * 999999)::INT::TEXT, 6, '0'), 'Amadeus', 'paid',
    (SELECT id FROM cost_centers WHERE code = 'ADM-001' LIMIT 1),
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
  );

  -- Reserva 5: Hotel en CDMX (Pendiente)
  INSERT INTO bookings (
    user_id, tenant_id, type, status,
    destination, departure_date, return_date,
    passengers, total_amount, currency,
    confirmation_code, provider, payment_status,
    cost_center_id, created_at, updated_at
  )
  VALUES (
    user_employee_id, 1, 'hotel', 'pending',
    'Ciudad de México', '2026-01-05', '2026-01-08',
    1, 4500.00, 'MXN',
    'HTL-' || LPAD((random() * 999999)::INT::TEXT, 6, '0'), 'Booking.com', 'pending',
    (SELECT id FROM cost_centers WHERE code = 'RH-001' LIMIT 1),
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  );

  -- Reserva 6: Paquete internacional (Cancelado)
  INSERT INTO bookings (
    user_id, tenant_id, type, status,
    origin, destination, departure_date, return_date,
    passengers, total_amount, currency,
    confirmation_code, provider, payment_status,
    cost_center_id, created_at, updated_at
  )
  VALUES (
    user_manager_id, 1, 'package', 'cancelled',
    'MEX', 'MAD', '2025-11-20', '2025-11-30',
    2, 65000.00, 'MXN',
    'PKG-' || LPAD((random() * 999999)::INT::TEXT, 6, '0'), 'Expedia', 'refunded',
    (SELECT id FROM cost_centers WHERE code = 'VTA-001' LIMIT 1),
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '20 days'
  );

END $$;

-- =========================================
-- 7. APROBACIONES (Approval Requests)
-- =========================================

DO $$
DECLARE
  booking_pending_id INT;
  booking_package_id INT;
  user_employee_id INT;
  user_juan_id INT;
  user_manager_id INT;
BEGIN
  SELECT id INTO user_employee_id FROM users WHERE email = 'empleado@empresa.com';
  SELECT id INTO user_juan_id FROM users WHERE email = 'juan.perez@empresa.com';
  SELECT id INTO user_manager_id FROM users WHERE email = 'manager@empresa.com';

  SELECT id INTO booking_pending_id FROM bookings WHERE status = 'pending' AND type = 'hotel' LIMIT 1;
  SELECT id INTO booking_package_id FROM bookings WHERE status = 'pending' AND type = 'package' LIMIT 1;

  -- Aprobación 1: Pendiente
  INSERT INTO approval_requests (
    booking_id, user_id, approver_id, status,
    requested_at, notes, tenant_id
  )
  VALUES (
    booking_pending_id, user_employee_id, user_manager_id, 'pending',
    NOW() - INTERVAL '1 day', 'Viaje de capacitación a Ciudad de México', 1
  );

  -- Aprobación 2: Pendiente
  INSERT INTO approval_requests (
    booking_id, user_id, approver_id, status,
    requested_at, notes, tenant_id
  )
  VALUES (
    booking_package_id, user_juan_id, user_manager_id, 'pending',
    NOW() - INTERVAL '2 days', 'Conferencia de tecnología en Los Ángeles', 1
  );

  -- Aprobación 3: Aprobada
  INSERT INTO approval_requests (
    booking_id, user_id, approver_id, status,
    requested_at, approved_at, notes, approver_notes, tenant_id
  )
  SELECT
    id, user_id, user_manager_id, 'approved',
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days',
    'Viaje de negocios a Nueva York', 'Aprobado según política estándar', 1
  FROM bookings WHERE type = 'flight' AND destination = 'NYC' LIMIT 1;

  -- Aprobación 4: Rechazada
  INSERT INTO approval_requests (
    booking_id, user_id, approver_id, status,
    requested_at, rejected_at, notes, approver_notes, tenant_id
  )
  SELECT
    id, user_id, user_manager_id, 'rejected',
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days',
    'Viaje internacional a Madrid', 'Excede presupuesto aprobado para este trimestre', 1
  FROM bookings WHERE status = 'cancelled' LIMIT 1;

END $$;

-- =========================================
-- 8. TRANSACCIONES DE PAGO
-- =========================================

DO $$
DECLARE
  booking_id_temp INT;
  user_id_temp INT;
BEGIN
  -- Pago 1: Stripe - Exitoso
  SELECT id, user_id INTO booking_id_temp, user_id_temp
  FROM bookings WHERE payment_status = 'paid' AND type = 'flight' AND destination = 'NYC' LIMIT 1;

  INSERT INTO payment_transactions (
    booking_id, user_id, amount, currency, status,
    payment_method, provider, provider_transaction_id,
    tenant_id, created_at, updated_at
  )
  VALUES (
    booking_id_temp, user_id_temp, 18500.00, 'MXN', 'completed',
    'credit_card', 'stripe', 'pi_' || substr(md5(random()::text), 1, 24),
    1, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'
  );

  -- Pago 2: PayPal - Exitoso
  SELECT id, user_id INTO booking_id_temp, user_id_temp
  FROM bookings WHERE payment_status = 'paid' AND type = 'hotel' LIMIT 1;

  INSERT INTO payment_transactions (
    booking_id, user_id, amount, currency, status,
    payment_method, provider, provider_transaction_id,
    tenant_id, created_at, updated_at
  )
  VALUES (
    booking_id_temp, user_id_temp, 12000.00, 'MXN', 'completed',
    'paypal', 'paypal', 'PAYID-' || substr(md5(random()::text), 1, 20),
    1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
  );

  -- Pago 3: Stripe - Pendiente
  SELECT id, user_id INTO booking_id_temp, user_id_temp
  FROM bookings WHERE payment_status = 'pending' AND type = 'package' LIMIT 1;

  INSERT INTO payment_transactions (
    booking_id, user_id, amount, currency, status,
    payment_method, provider, provider_transaction_id,
    tenant_id, created_at, updated_at
  )
  VALUES (
    booking_id_temp, user_id_temp, 22000.00, 'MXN', 'pending',
    'credit_card', 'stripe', 'pi_' || substr(md5(random()::text), 1, 24),
    1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  );

  -- Pago 4: Reembolso
  SELECT id, user_id INTO booking_id_temp, user_id_temp
  FROM bookings WHERE payment_status = 'refunded' LIMIT 1;

  INSERT INTO payment_transactions (
    booking_id, user_id, amount, currency, status,
    payment_method, provider, provider_transaction_id,
    tenant_id, created_at, updated_at
  )
  VALUES (
    booking_id_temp, user_id_temp, -65000.00, 'MXN', 'refunded',
    'credit_card', 'stripe', 're_' || substr(md5(random()::text), 1, 24),
    1, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'
  );

END $$;

-- =========================================
-- 9. FACTURAS (Invoices)
-- =========================================

DO $$
DECLARE
  booking_id_temp INT;
  user_id_temp INT;
  invoice_counter INT := 1000;
BEGIN
  FOR booking_id_temp IN (SELECT id FROM bookings WHERE payment_status = 'paid' LIMIT 4)
  LOOP
    SELECT user_id INTO user_id_temp FROM bookings WHERE id = booking_id_temp;

    INSERT INTO invoices (
      booking_id, user_id, invoice_number,
      subtotal, tax, total, currency,
      status, issued_at, due_date, tenant_id,
      created_at, updated_at
    )
    SELECT
      booking_id_temp, user_id_temp,
      'INV-2025-' || LPAD(invoice_counter::TEXT, 5, '0'),
      total_amount / 1.16, total_amount * 0.16 / 1.16, total_amount, currency,
      'paid', created_at, created_at + INTERVAL '30 days', tenant_id,
      created_at, created_at
    FROM bookings WHERE id = booking_id_temp;

    invoice_counter := invoice_counter + 1;
  END LOOP;
END $$;

-- =========================================
-- 10. CUENTAS POR COBRAR
-- =========================================

DO $$
DECLARE
  invoice_id_temp INT;
  user_id_temp INT;
BEGIN
  FOR invoice_id_temp IN (SELECT id FROM invoices LIMIT 3)
  LOOP
    SELECT user_id INTO user_id_temp FROM invoices WHERE id = invoice_id_temp;

    INSERT INTO accounts_receivable (
      invoice_id, user_id, amount, currency,
      status, due_date, tenant_id,
      created_at, updated_at
    )
    SELECT
      invoice_id_temp, user_id, total, currency,
      CASE WHEN status = 'paid' THEN 'paid' ELSE 'pending' END,
      due_date, tenant_id,
      created_at, updated_at
    FROM invoices WHERE id = invoice_id_temp;
  END LOOP;
END $$;

-- =========================================
-- 11. CUENTAS POR PAGAR
-- =========================================

INSERT INTO accounts_payable (
  vendor, description, amount, currency,
  status, due_date, tenant_id,
  created_at, updated_at
)
VALUES
  ('Amadeus', 'Comisión vuelos Diciembre 2025', 15000.00, 'MXN', 'pending', NOW() + INTERVAL '15 days', 1, NOW(), NOW()),
  ('Booking.com', 'Comisión hoteles Diciembre 2025', 8500.00, 'MXN', 'paid', NOW() - INTERVAL '5 days', 1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'),
  ('Expedia', 'Comisión paquetes Noviembre 2025', 12000.00, 'MXN', 'paid', NOW() - INTERVAL '20 days', 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '20 days'),
  ('SendGrid', 'Servicio de email Diciembre 2025', 2500.00, 'USD', 'pending', NOW() + INTERVAL '10 days', 1, NOW(), NOW());

-- =========================================
-- 12. COMISIONES
-- =========================================

DO $$
DECLARE
  booking_record RECORD;
BEGIN
  FOR booking_record IN (SELECT id, total_amount, currency, provider, created_at, tenant_id FROM bookings WHERE payment_status = 'paid' LIMIT 4)
  LOOP
    INSERT INTO commissions (
      booking_id, amount, currency, percentage,
      status, provider, tenant_id,
      created_at, updated_at
    )
    VALUES (
      booking_record.id,
      booking_record.total_amount * 0.10,
      booking_record.currency,
      10.00,
      'paid',
      booking_record.provider,
      booking_record.tenant_id,
      booking_record.created_at,
      booking_record.created_at
    );
  END LOOP;
END $$;

-- =========================================
-- 13. FAVORITOS
-- =========================================

DO $$
DECLARE
  user_employee_id INT;
  user_juan_id INT;
BEGIN
  SELECT id INTO user_employee_id FROM users WHERE email = 'empleado@empresa.com';
  SELECT id INTO user_juan_id FROM users WHERE email = 'juan.perez@empresa.com';

  INSERT INTO favorites (
    user_id, item_type, item_id,
    destination, notes, tenant_id,
    created_at
  )
  VALUES
    (user_employee_id, 'destination', 1, 'Nueva York, USA', 'Viaje de negocios frecuente', 1, NOW() - INTERVAL '30 days'),
    (user_employee_id, 'destination', 2, 'Cancún, México', 'Vacaciones anuales', 1, NOW() - INTERVAL '20 days'),
    (user_juan_id, 'destination', 3, 'Los Ángeles, USA', 'Conferencias de tech', 1, NOW() - INTERVAL '10 days'),
    (user_juan_id, 'destination', 4, 'Guadalajara, México', 'Visita a oficina regional', 1, NOW() - INTERVAL '5 days');
END $$;

-- =========================================
-- 14. AUDIT LOGS
-- =========================================

DO $$
DECLARE
  user_admin_id INT;
  user_manager_id INT;
BEGIN
  SELECT id INTO user_admin_id FROM users WHERE email = 'admin@asoperadora.com';
  SELECT id INTO user_manager_id FROM users WHERE email = 'manager@empresa.com';

  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id,
    ip_address, user_agent, tenant_id,
    created_at
  )
  VALUES
    (user_admin_id, 'login', 'user', user_admin_id, '192.168.1.100', 'Mozilla/5.0', 1, NOW() - INTERVAL '1 hour'),
    (user_manager_id, 'create', 'booking', 2, '192.168.1.101', 'Mozilla/5.0', 1, NOW() - INTERVAL '10 days'),
    (user_admin_id, 'update', 'employee', 1, '192.168.1.100', 'Mozilla/5.0', 1, NOW() - INTERVAL '5 days'),
    (user_manager_id, 'approve', 'approval', 1, '192.168.1.101', 'Mozilla/5.0', 1, NOW() - INTERVAL '14 days'),
    (user_admin_id, 'export', 'report', 0, '192.168.1.100', 'Mozilla/5.0', 1, NOW() - INTERVAL '2 days');
END $$;

-- =========================================
-- 15. ACTUALIZAR SECUENCIAS
-- =========================================

SELECT setval('tenants_id_seq', (SELECT MAX(id) FROM tenants));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('cost_centers_id_seq', (SELECT MAX(id) FROM cost_centers));
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));
SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));
SELECT setval('approval_requests_id_seq', (SELECT MAX(id) FROM approval_requests));
SELECT setval('payment_transactions_id_seq', (SELECT MAX(id) FROM payment_transactions));
SELECT setval('invoices_id_seq', (SELECT MAX(id) FROM invoices));
SELECT setval('accounts_receivable_id_seq', (SELECT MAX(id) FROM accounts_receivable));
SELECT setval('accounts_payable_id_seq', (SELECT MAX(id) FROM accounts_payable));
SELECT setval('commissions_id_seq', (SELECT MAX(id) FROM commissions));
SELECT setval('favorites_id_seq', (SELECT MAX(id) FROM favorites));
SELECT setval('audit_logs_id_seq', (SELECT MAX(id) FROM audit_logs));

COMMIT;

-- =========================================
-- RESUMEN DE DATOS CREADOS
-- =========================================

SELECT
  'Tenants' as tabla, COUNT(*) as registros FROM tenants
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM users
UNION ALL
SELECT 'Centro de Costos', COUNT(*) FROM cost_centers
UNION ALL
SELECT 'Empleados', COUNT(*) FROM employees
UNION ALL
SELECT 'Políticas de Viaje', COUNT(*) FROM travel_policies
UNION ALL
SELECT 'Reservas', COUNT(*) FROM bookings
UNION ALL
SELECT 'Aprobaciones', COUNT(*) FROM approval_requests
UNION ALL
SELECT 'Transacciones de Pago', COUNT(*) FROM payment_transactions
UNION ALL
SELECT 'Facturas', COUNT(*) FROM invoices
UNION ALL
SELECT 'Cuentas por Cobrar', COUNT(*) FROM accounts_receivable
UNION ALL
SELECT 'Cuentas por Pagar', COUNT(*) FROM accounts_payable
UNION ALL
SELECT 'Comisiones', COUNT(*) FROM commissions
UNION ALL
SELECT 'Favoritos', COUNT(*) FROM favorites
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM audit_logs;

-- =========================================
-- VERIFICACIÓN RÁPIDA
-- =========================================

-- Ver usuarios creados
\echo '\n📊 USUARIOS CREADOS:'
SELECT email, full_name, role, is_active FROM users ORDER BY role, email;

-- Ver reservas
\echo '\n✈️ RESERVAS CREADAS:'
SELECT id, type, status, origin, destination, total_amount, payment_status FROM bookings;

-- Ver aprobaciones
\echo '\n✅ APROBACIONES:'
SELECT id, status, requested_at FROM approval_requests;

-- Ver transacciones
\echo '\n💳 TRANSACCIONES DE PAGO:'
SELECT id, amount, currency, status, provider FROM payment_transactions;

\echo '\n✅ DATOS DE PRUEBA CARGADOS EXITOSAMENTE!'
\echo '📝 Puedes hacer login con cualquier usuario usando la contraseña: Password123!'
\echo '🌐 Ir a: http://localhost:3000/login'
