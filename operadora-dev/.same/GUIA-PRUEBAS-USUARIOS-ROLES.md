# 🧪 GUÍA DE PRUEBAS - USUARIOS Y ROLES

**Versión:** v86
**Fecha:** 15 de Diciembre de 2025
**Estado:** Sistema de autenticación y roles implementado ✅

---

## 📋 ÍNDICE

1. [Sistema de Roles Implementado](#sistema-de-roles-implementado)
2. [Cómo Probar Usuarios y Roles](#cómo-probar-usuarios-y-roles)
3. [Casos de Prueba](#casos-de-prueba)
4. [APIs de Autenticación](#apis-de-autenticación)
5. [Permisos por Rol](#permisos-por-rol)
6. [Troubleshooting](#troubleshooting)

---

## 🎭 SISTEMA DE ROLES IMPLEMENTADO

### **Roles Disponibles:**

1. **SUPER_ADMIN** 👑
   - Acceso total al sistema
   - Gestión de tenants
   - Configuración global
   - Auditoría completa

2. **ADMIN** 🔧
   - Gestión de usuarios del tenant
   - Configuración de políticas
   - Reportes completos
   - Aprobaciones

3. **MANAGER** 📊
   - Aprobación de viajes
   - Reportes de su departamento
   - Gestión de empleados
   - Políticas de lectura

4. **EMPLOYEE** 👤
   - Búsqueda de viajes
   - Reservas personales
   - Ver sus aprobaciones
   - Favoritos

5. **GUEST** 🌐
   - Solo búsqueda pública
   - Sin acceso a reservas
   - Sin dashboard

---

## 🧪 CÓMO PROBAR USUARIOS Y ROLES

### **PASO 1: Crear Usuarios de Prueba**

#### **Opción A: Desde la UI**

1. **Ir a:** http://localhost:3000/registro

2. **Crear usuarios con diferentes roles:**

```
Usuario 1 - Super Admin:
- Email: admin@asoperadora.com
- Nombre: Super Admin
- Contraseña: Admin123!
- Rol: SUPER_ADMIN (se asigna en BD)

Usuario 2 - Manager:
- Email: manager@empresa.com
- Nombre: Manager Test
- Contraseña: Manager123!
- Rol: MANAGER (se asigna en BD)

Usuario 3 - Empleado:
- Email: empleado@empresa.com
- Nombre: Empleado Test
- Contraseña: Empleado123!
- Rol: EMPLOYEE (por defecto)
```

#### **Opción B: Desde la BD (SQL)**

```sql
-- Insertar Super Admin
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  is_active,
  tenant_id
) VALUES (
  'admin@asoperadora.com',
  -- Hash de "Admin123!" (debes generarlo con bcrypt)
  '$2b$10$...',
  'Super Admin',
  'SUPER_ADMIN',
  true,
  1
);

-- Insertar Manager
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  is_active,
  tenant_id
) VALUES (
  'manager@empresa.com',
  -- Hash de "Manager123!"
  '$2b$10$...',
  'Manager Test',
  'MANAGER',
  true,
  1
);

-- Insertar Employee
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  is_active,
  tenant_id
) VALUES (
  'empleado@empresa.com',
  -- Hash de "Empleado123!"
  '$2b$10$...',
  'Empleado Test',
  'EMPLOYEE',
  true,
  1
);
```

**Generar Hash de Contraseña:**
```javascript
// En Node.js o consola del navegador
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('Admin123!', 10);
console.log(hash);
```

---

### **PASO 2: Probar Login**

#### **Via UI:**

1. **Ir a:** http://localhost:3000/login

2. **Probar con cada usuario:**
   - Email: admin@asoperadora.com
   - Password: Admin123!
   - Click "Iniciar Sesión"

3. **Verificar:**
   - ✅ Redirige al dashboard
   - ✅ Muestra nombre del usuario arriba a la derecha
   - ✅ Token JWT guardado en localStorage

#### **Via API (Postman/Thunder Client):**

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@asoperadora.com",
  "password": "Admin123!"
}
```

**Respuesta Esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@asoperadora.com",
    "full_name": "Super Admin",
    "role": "SUPER_ADMIN",
    "tenant_id": 1
  }
}
```

---

### **PASO 3: Probar Permisos por Rol**

#### **Test 1: Dashboard Corporativo (Solo ADMIN, MANAGER, SUPER_ADMIN)**

```bash
# Login como EMPLOYEE
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"empleado@empresa.com","password":"Empleado123!"}'

# Intentar acceder a dashboard corporativo
# Debería DENEGAR acceso (403 Forbidden o redirect)
```

**Verificar en UI:**
1. Login como `empleado@empresa.com`
2. Ir a: http://localhost:3000/dashboard/corporate
3. **Resultado Esperado:** ❌ Acceso denegado o redirect a /dashboard

---

#### **Test 2: Aprobación de Viajes (Solo ADMIN, MANAGER)**

```bash
# Login como EMPLOYEE
# Token JWT del login anterior

# Intentar aprobar una solicitud
curl -X POST http://localhost:3000/api/approvals/1/approve \
  -H "Authorization: Bearer <TOKEN_EMPLOYEE>" \
  -H "Content-Type: application/json"

# Resultado: 403 Forbidden
```

**Verificar en UI:**
1. Login como `manager@empresa.com`
2. Ir a: http://localhost:3000/approvals
3. Debe ver lista de solicitudes pendientes
4. Click "Aprobar" → ✅ Debe funcionar

---

#### **Test 3: Gestión de Empleados (Solo ADMIN, MANAGER, SUPER_ADMIN)**

```bash
# Login como ADMIN
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@asoperadora.com","password":"Admin123!"}'

# Crear empleado (debe funcionar)
curl -X POST http://localhost:3000/api/corporate/employees \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@empresa.com",
    "department": "IT",
    "position": "Developer"
  }'

# Resultado: 201 Created ✅
```

---

## 📝 CASOS DE PRUEBA COMPLETOS

### **CASO 1: Empleado Normal**

**Usuario:** empleado@empresa.com
**Rol:** EMPLOYEE

**Acciones Permitidas:**
- ✅ Buscar vuelos y hoteles
- ✅ Crear reservas personales
- ✅ Ver sus propias reservas en /mis-reservas
- ✅ Ver estado de aprobaciones
- ✅ Guardar favoritos

**Acciones DENEGADAS:**
- ❌ Acceder a /dashboard/corporate
- ❌ Aprobar solicitudes de otros
- ❌ Ver reportes corporativos
- ❌ Gestionar empleados
- ❌ Configurar políticas

**Prueba:**
```bash
# 1. Login
POST /api/auth/login
{
  "email": "empleado@empresa.com",
  "password": "Empleado123!"
}

# 2. Buscar vuelos (PERMITIDO)
GET /api/search?type=flights&origin=MEX&destination=NYC&departure=2025-12-20

# 3. Crear reserva (PERMITIDO)
POST /api/bookings
{
  "type": "flight",
  "details": {...}
}

# 4. Intentar acceder a dashboard corporativo (DENEGADO)
GET /api/corporate/stats
# Respuesta: 403 Forbidden
```

---

### **CASO 2: Manager**

**Usuario:** manager@empresa.com
**Rol:** MANAGER

**Acciones Permitidas:**
- ✅ Todo lo de EMPLOYEE +
- ✅ Aprobar solicitudes de su departamento
- ✅ Ver reportes de su departamento
- ✅ Gestionar empleados de su departamento
- ✅ Acceder a dashboard corporativo

**Acciones DENEGADAS:**
- ❌ Ver reportes de otros departamentos
- ❌ Configurar políticas globales
- ❌ Gestionar otros tenants

**Prueba:**
```bash
# 1. Login
POST /api/auth/login
{
  "email": "manager@empresa.com",
  "password": "Manager123!"
}

# 2. Ver solicitudes pendientes (PERMITIDO)
GET /api/approvals/pending

# 3. Aprobar solicitud (PERMITIDO)
POST /api/approvals/1/approve
{
  "comments": "Aprobado por manager"
}

# 4. Ver reportes (PERMITIDO)
GET /api/corporate/reports/expenses?department=IT

# 5. Intentar ver otros departamentos (DENEGADO)
GET /api/corporate/reports/expenses?department=Marketing
# Resultado: 403 Forbidden (si no es su departamento)
```

---

### **CASO 3: Super Admin**

**Usuario:** admin@asoperadora.com
**Rol:** SUPER_ADMIN

**Acciones Permitidas:**
- ✅ TODO sin restricciones
- ✅ Gestionar todos los tenants
- ✅ Ver todos los reportes
- ✅ Configurar políticas globales
- ✅ Acceder a logs de auditoría

**Prueba:**
```bash
# 1. Login
POST /api/auth/login
{
  "email": "admin@asoperadora.com",
  "password": "Admin123!"
}

# 2. Ver todos los tenants (PERMITIDO)
GET /api/tenants

# 3. Crear nuevo tenant (PERMITIDO)
POST /api/tenants
{
  "name": "Nueva Empresa",
  "subdomain": "nueva-empresa",
  "settings": {...}
}

# 4. Ver reportes globales (PERMITIDO)
GET /api/corporate/reports/expenses

# 5. Acceder a audit logs (PERMITIDO)
GET /api/audit-logs
```

---

## 🔐 APIS DE AUTENTICACIÓN

### **1. Register (Registro)**

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "nuevo@empresa.com",
  "password": "Password123!",
  "full_name": "Nuevo Usuario",
  "tenant_id": 1
}
```

**Respuesta:**
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": 5,
    "email": "nuevo@empresa.com",
    "full_name": "Nuevo Usuario",
    "role": "EMPLOYEE",
    "tenant_id": 1
  }
}
```

---

### **2. Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@asoperadora.com",
  "password": "Admin123!"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@asoperadora.com",
    "full_name": "Super Admin",
    "role": "SUPER_ADMIN",
    "tenant_id": 1,
    "is_active": true
  }
}
```

---

### **3. Usar Token JWT**

En cada request subsecuente:

```http
GET /api/bookings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛡️ PERMISOS POR ROL

| Funcionalidad | GUEST | EMPLOYEE | MANAGER | ADMIN | SUPER_ADMIN |
|---------------|-------|----------|---------|-------|-------------|
| Búsqueda pública | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear reservas | ❌ | ✅ | ✅ | ✅ | ✅ |
| Ver mis reservas | ❌ | ✅ | ✅ | ✅ | ✅ |
| Aprobar solicitudes | ❌ | ❌ | ✅ | ✅ | ✅ |
| Reportes corporativos | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gestionar empleados | ❌ | ❌ | ✅* | ✅ | ✅ |
| Configurar políticas | ❌ | ❌ | ❌ | ✅ | ✅ |
| Gestionar tenants | ❌ | ❌ | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | ❌ | ❌ | ✅ |

*✅ MANAGER: Solo su departamento

---

## 🧪 SCRIPT DE PRUEBA COMPLETO

```bash
#!/bin/bash

# Script para probar todos los roles
BASE_URL="http://localhost:3000"

echo "=== PRUEBA 1: Login como EMPLOYEE ==="
EMPLOYEE_TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"empleado@empresa.com","password":"Empleado123!"}' \
  | jq -r '.token')

echo "Token EMPLOYEE: $EMPLOYEE_TOKEN"

echo "\n=== PRUEBA 2: Buscar vuelos (PERMITIDO) ==="
curl -X GET "$BASE_URL/api/search?type=flights&origin=MEX&destination=NYC" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"

echo "\n=== PRUEBA 3: Intentar acceder a dashboard corporativo (DENEGADO) ==="
curl -X GET "$BASE_URL/api/corporate/stats" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"

echo "\n=== PRUEBA 4: Login como ADMIN ==="
ADMIN_TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@asoperadora.com","password":"Admin123!"}' \
  | jq -r '.token')

echo "Token ADMIN: $ADMIN_TOKEN"

echo "\n=== PRUEBA 5: Acceder a dashboard corporativo (PERMITIDO) ==="
curl -X GET "$BASE_URL/api/corporate/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo "\n✅ Pruebas completadas"
```

---

## 🐛 TROUBLESHOOTING

### **Problema 1: "Unauthorized" en todas las requests**

**Causa:** Token JWT inválido o expirado

**Solución:**
```bash
# 1. Verificar que el token esté en localStorage
console.log(localStorage.getItem('token'))

# 2. Verificar que el header Authorization esté correcto
# Formato: "Bearer <token>"

# 3. Hacer login de nuevo para obtener token fresco
```

---

### **Problema 2: "403 Forbidden" al acceder a una ruta**

**Causa:** El rol del usuario no tiene permisos

**Solución:**
```sql
-- Verificar rol del usuario en BD
SELECT id, email, full_name, role FROM users WHERE email = 'usuario@empresa.com';

-- Cambiar rol si es necesario
UPDATE users SET role = 'ADMIN' WHERE email = 'usuario@empresa.com';
```

---

### **Problema 3: No puedo crear usuarios ADMIN desde el registro**

**Causa:** Por seguridad, el registro público solo crea EMPLOYEE

**Solución:**
```sql
-- Promover usuario a ADMIN desde BD
UPDATE users
SET role = 'ADMIN'
WHERE email = 'usuario@empresa.com';
```

---

## 📚 PRÓXIMOS PASOS

Después de probar usuarios y roles:

1. **Probar flujo completo de aprobaciones**
2. **Probar dashboard corporativo**
3. **Probar reportes con filtros**
4. **Probar sistema de pagos**
5. **Probar documentos con URLs firmadas**

---

**Guía preparada:** 15 de Diciembre de 2025
**Versión:** v86
**Estado:** ✅ Sistema de roles implementado y documentado
