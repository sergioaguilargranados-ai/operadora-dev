-- USUARIOS DE PRUEBA PARA AS OPERADORA
-- Fecha: 15 de Diciembre de 2025
-- Versión: v87

-- IMPORTANTE: Estas contraseñas son hashes bcrypt de contraseñas conocidas
-- Todas las contraseñas son: "Password123!"

-- 1. SUPER ADMIN
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  is_active,
  tenant_id,
  created_at,
  updated_at
) VALUES (
  'superadmin@asoperadora.com',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky',
  'Super Administrador',
  'SUPER_ADMIN',
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 2. ADMIN
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  is_active,
  tenant_id,
  created_at,
  updated_at
) VALUES (
  'admin@asoperadora.com',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky',
  'Administrador General',
  'ADMIN',
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 3. MANAGER
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  is_active,
  tenant_id,
  created_at,
  updated_at
) VALUES (
  'manager@empresa.com',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky',
  'Manager de Operaciones',
  'MANAGER',
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 4. EMPLOYEE
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  is_active,
  tenant_id,
  created_at,
  updated_at
) VALUES (
  'empleado@empresa.com',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky',
  'Empleado Regular',
  'EMPLOYEE',
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 5. EMPLOYEE 2 (para probar aprobaciones)
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  is_active,
  tenant_id,
  created_at,
  updated_at
) VALUES (
  'juan.perez@empresa.com',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky',
  'Juan Pérez',
  'EMPLOYEE',
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 6. MANAGER 2 (otro departamento)
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  is_active,
  tenant_id,
  created_at,
  updated_at
) VALUES (
  'maria.garcia@empresa.com',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky',
  'María García',
  'MANAGER',
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verificar que se crearon correctamente
SELECT
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM users
ORDER BY
  CASE role
    WHEN 'SUPER_ADMIN' THEN 1
    WHEN 'ADMIN' THEN 2
    WHEN 'MANAGER' THEN 3
    WHEN 'EMPLOYEE' THEN 4
    ELSE 5
  END,
  email;

-- ========================================
-- INSTRUCCIONES PARA USAR:
-- ========================================

-- 1. Ejecutar este archivo en tu base de datos Neon:
--    psql $DATABASE_URL -f usuarios-prueba.sql

-- 2. Credenciales para login:
--
--    SUPER ADMIN:
--    Email: superadmin@asoperadora.com
--    Password: Password123!
--
--    ADMIN:
--    Email: admin@asoperadora.com
--    Password: Password123!
--
--    MANAGER:
--    Email: manager@empresa.com
--    Password: Password123!
--
--    EMPLOYEE:
--    Email: empleado@empresa.com
--    Password: Password123!

-- 3. Probar en: http://localhost:3000/login

-- 4. Verificar permisos:
--    - SUPER_ADMIN: Acceso total
--    - ADMIN: Dashboard corporativo + Gestión de empleados
--    - MANAGER: Dashboard + Aprobaciones + Reportes
--    - EMPLOYEE: Solo búsqueda y reservas propias

-- ========================================
-- NOTA SOBRE EL HASH DE CONTRASEÑA:
-- ========================================

-- Si quieres generar tu propio hash para otra contraseña:
/*
const bcrypt = require('bcrypt');
const password = 'TuContraseñaAqui';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
*/

-- O ejecuta en Node.js:
-- bun x bcryptjs TuContraseñaAqui
