# 📋 INSTRUCCIONES PARA PROBAR EL SISTEMA COMPLETO

**Versión:** v88
**Fecha:** 15 de Diciembre de 2025

---

## 🚀 PASO 1: CARGAR DATOS DE PRUEBA

### **Ejecutar el script SQL:**

```bash
cd operadora-dev
psql $DATABASE_URL -f datos-prueba-completos.sql
```

### **¿Qué se creará?**

| Tabla | Cantidad | Detalles |
|-------|----------|----------|
| **Tenants** | 3 | AS Operadora, Empresa Demo, Tech Corp |
| **Usuarios** | 6 | 1 SUPER_ADMIN, 2 ADMIN, 2 MANAGER, 2 EMPLOYEE |
| **Centro de Costos** | 5 | Marketing, IT, RRHH, Ventas, Admin |
| **Empleados** | 10 | Diferentes departamentos y puestos |
| **Políticas de Viaje** | 4 | Estándar, Ejecutiva, Básica, Internacional |
| **Reservas** | 6 | 2 vuelos, 2 hoteles, 2 paquetes |
| **Aprobaciones** | 4 | 2 pending, 1 approved, 1 rejected |
| **Pagos** | 4 | 2 completados, 1 pendiente, 1 reembolso |
| **Facturas** | 4 | Todas pagadas |
| **Cuentas por Cobrar** | 3 | Mixtas |
| **Cuentas por Pagar** | 4 | 2 pagadas, 2 pendientes |
| **Comisiones** | 4 | Todas pagadas |
| **Favoritos** | 4 | Destinos favoritos |
| **Audit Logs** | 5 | Acciones recientes |

---

## 👤 PASO 2: USUARIOS DISPONIBLES

Todos usan la contraseña: **`Password123!`**

| Email | Rol | Usar para probar |
|-------|-----|------------------|
| superadmin@asoperadora.com | SUPER_ADMIN | Acceso total, gestión de tenants |
| admin@asoperadora.com | ADMIN | Dashboard corporativo, gestión empleados |
| manager@empresa.com | MANAGER | Aprobaciones, reportes departamento |
| maria.garcia@empresa.com | MANAGER | Otro manager para comparar |
| empleado@empresa.com | EMPLOYEE | Búsquedas, reservas propias |
| juan.perez@empresa.com | EMPLOYEE | Otro empleado con reservas |

---

## 📱 PASO 3: QUÉ VER EN CADA MENÚ

### **1. DASHBOARD PRINCIPAL** (`/dashboard`)

**Login como:** Cualquier usuario

**Deberías ver:**
- ✅ 4 tarjetas con estadísticas generales
- ✅ Gráfica de reservas recientes
- ✅ Lista de últimas reservas
- ✅ Menú lateral con opciones según tu rol

**Menú lateral incluye:**
- Dashboard
- Mis Reservas
- Perfil
- Configuración
- (Más opciones si eres ADMIN/MANAGER)

---

### **2. MIS RESERVAS** (`/mis-reservas`)

**Login como:** `empleado@empresa.com` o `juan.perez@empresa.com`

**Deberías ver:**
- ✅ Lista de tus reservas (2-3 reservas)
- ✅ Filtros por tipo: Vuelos, Hoteles, Paquetes
- ✅ Filtros por estado: Todas, Confirmadas, Pendientes, Canceladas
- ✅ Botones de acción: Ver detalles, Cancelar

**Datos específicos:**
- **empleado@empresa.com** tiene:
  - 1 vuelo MEX-NYC (confirmado, pagado)
  - 1 hotel en CDMX (pendiente)

- **juan.perez@empresa.com** tiene:
  - 1 paquete MEX-LAX (pendiente de pago)

---

### **3. DETALLES DE RESERVA** (`/reserva/[id]`)

**Login como:** Cualquier usuario con reservas

**Click en** "Ver detalles" en cualquier reserva

**Deberías ver:**
- ✅ Información completa del viaje
- ✅ Código de confirmación
- ✅ Estado de pago
- ✅ Centro de costo asignado
- ✅ Fechas de viaje
- ✅ Precio total
- ✅ Botones: Descargar voucher, Cancelar reserva

---

### **4. PERFIL** (`/perfil`)

**Login como:** Cualquier usuario

**Tabs disponibles:**

**Personal:**
- ✅ Nombre completo editable
- ✅ Email (no editable)
- ✅ Teléfono editable

**Seguridad:**
- ✅ Cambiar contraseña
- ✅ Activar/desactivar 2FA

**Notificaciones:**
- ✅ Toggle de notificaciones por email
- ✅ Toggle de emails de marketing

**Facturación:**
- ✅ Métodos de pago guardados (vacío por ahora)
- ✅ Historial de pagos

---

### **5. CONFIGURACIÓN** (`/configuracion`)

**Login como:** Cualquier usuario

**Tabs disponibles:**

**General:**
- ✅ Cambiar idioma: ES, EN, PT, FR
- ✅ Moneda: MXN, USD, EUR, GBP, CAD
- ✅ Zona horaria
- ✅ Formato de fecha

**Apariencia:**
- ✅ Tema: Claro, Oscuro, Auto
- ✅ Tamaño de fuente: Pequeño, Mediano, Grande
- ✅ Color principal: 5 opciones

**Privacidad:**
- ✅ Visibilidad de perfil
- ✅ Guardar historial de búsquedas
- ✅ Análisis de uso

**Datos:**
- ✅ Exportar datos personales
- ✅ Limpiar caché
- ✅ Eliminar historial

---

### **6. DASHBOARD CORPORATIVO** (`/dashboard/corporate`)

**Login como:** `admin@asoperadora.com` o `manager@empresa.com`

**Deberías ver:**
- ✅ 4 métricas corporativas:
  - Total de empleados: 10
  - Reservas pendientes: 2
  - Presupuesto utilizado
  - Centro de costos activos: 5

- ✅ Gráfica de gastos por departamento
- ✅ Gráfica de tendencia mensual
- ✅ Tabla de últimas aprobaciones

---

### **7. GESTIÓN DE EMPLEADOS** (`/dashboard/corporate/employees`)

**Login como:** `admin@asoperadora.com`

**Deberías ver:**
- ✅ Lista de 10 empleados
- ✅ Filtro por departamento: IT, Marketing, Ventas, RRHH, Admin
- ✅ Barra de búsqueda
- ✅ Botones: Agregar empleado, Import CSV, Exportar Excel

**Empleados visibles:**
1. Carlos Rodríguez - IT - Developer Senior
2. Ana Martínez - Marketing - Marketing Manager
3. Luis Hernández - Ventas - Sales Executive
4. Patricia López - RRHH - HR Coordinator
5. Roberto González - IT - DevOps Engineer
6. Laura Sánchez - Marketing - Content Creator
7. Miguel Ramírez - Ventas - Account Manager
8. Sofía Torres - Admin - Office Manager
9. Diego Flores - IT - QA Engineer
10. Valentina Morales - Marketing - Social Media Manager

---

### **8. CENTRO DE COSTOS** (`/dashboard/corporate/cost-centers`)

**Login como:** `admin@asoperadora.com` o `manager@empresa.com`

**Deberías ver:**
- ✅ 5 centros de costo:

  | Código | Nombre | Departamento | Presupuesto |
  |--------|--------|--------------|-------------|
  | MKT-001 | Marketing Digital | Marketing | $50,000 |
  | DEV-001 | Desarrollo Software | IT | $80,000 |
  | RH-001 | Recursos Humanos | RRHH | $30,000 |
  | VTA-001 | Ventas Nacional | Ventas | $60,000 |
  | ADM-001 | Administración | Admin | $40,000 |

- ✅ Botones: Crear centro de costo, Editar, Desactivar

---

### **9. POLÍTICAS DE VIAJE** (`/dashboard/corporate/policies`)

**Login como:** `admin@asoperadora.com`

**Deberías ver:**
- ✅ 4 políticas configuradas:

  | Política | Max Vuelo | Max Hotel | Max Diario | Requiere Aprobación |
  |----------|-----------|-----------|------------|---------------------|
  | Estándar | $15,000 | $2,500 | $1,500 | Sí |
  | Ejecutiva | $30,000 | $5,000 | $3,000 | Sí |
  | Básica | $8,000 | $1,500 | $800 | No |
  | Internacional | $50,000 | $8,000 | $5,000 | Sí |

- ✅ Botones: Crear política, Editar, Activar/Desactivar

---

### **10. APROBACIONES** (`/approvals`)

**Login como:** `manager@empresa.com` o `maria.garcia@empresa.com`

**Deberías ver:**
- ✅ **Solicitudes Pendientes (2):**
  1. Hotel en CDMX - empleado@empresa.com - $4,500
  2. Paquete MEX-LAX - juan.perez@empresa.com - $22,000

- ✅ **Historial:**
  - 1 aprobada: Vuelo MEX-NYC
  - 1 rechazada: Paquete MEX-MAD

- ✅ Botones en pendientes: Aprobar, Rechazar, Ver detalles

---

### **11. REPORTES CORPORATIVOS** (`/dashboard/corporate/reports`)

**Login como:** `admin@asoperadora.com` o `manager@empresa.com`

**Tabs disponibles:**

**Gastos:**
- ✅ Filtros: Fecha inicio, Fecha fin, Departamento
- ✅ Gráfica de gastos totales
- ✅ Tabla con detalle de gastos
- ✅ Total gastado visible
- ✅ Botón: Exportar a Excel

**Empleados:**
- ✅ Lista de 10 empleados con sus gastos
- ✅ Botón: Exportar a Excel

**Departamentos:**
- ✅ Gráfica por departamento
- ✅ Tabla de resumen
- ✅ Botón: Exportar a Excel

---

### **12. DASHBOARD DE PAGOS** (`/dashboard/payments`)

**Login como:** `admin@asoperadora.com`

**Deberías ver:**
- ✅ Lista de 4 transacciones:
  1. Stripe - $18,500 - Completado
  2. PayPal - $12,000 - Completado
  3. Stripe - $22,000 - Pendiente
  4. Stripe - -$65,000 - Reembolso

- ✅ Filtros:
  - Por estado: Todos, Completados, Pendientes, Reembolsados
  - Por proveedor: Todos, Stripe, PayPal
  - Por fecha

- ✅ Total de transacciones visible
- ✅ Botón: Exportar a Excel

---

### **13. AUDIT LOGS** (`/dashboard/security/audit-logs`)

**Login como:** `superadmin@asoperadora.com` o `admin@asoperadora.com`

**Deberías ver:**
- ✅ 5 registros de actividad:
  1. Login - admin@asoperadora.com - Hace 1 hora
  2. Crear reserva - manager@empresa.com - Hace 10 días
  3. Actualizar empleado - admin@asoperadora.com - Hace 5 días
  4. Aprobar solicitud - manager@empresa.com - Hace 14 días
  5. Exportar reporte - admin@asoperadora.com - Hace 2 días

- ✅ Filtros por:
  - Acción: Login, Create, Update, Delete, Approve, Export
  - Usuario
  - Fecha

---

### **14. BÚSQUEDA** (`/` - Homepage)

**Login como:** Cualquier usuario (o sin login)

**Tabs de búsqueda:**

**Vuelos:**
- ✅ Origen, Destino
- ✅ Fecha ida, Fecha vuelta
- ✅ Adultos, Niños
- ✅ Filtro por aerolínea

**Hoteles:**
- ✅ Destino
- ✅ Check-in, Check-out
- ✅ Huéspedes, Habitaciones

**Paquetes:**
- ✅ Destino
- ✅ Fechas
- ✅ Viajeros

**Nota:** Los resultados serán de ejemplo ya que las APIs externas requieren keys

---

## 🧪 CASOS DE PRUEBA SUGERIDOS

### **Test 1: Flujo de Empleado**

1. Login como `empleado@empresa.com`
2. Ver "Mis Reservas" (2 reservas)
3. Click en detalles del vuelo NYC
4. Ver estado: Confirmado, Pagado
5. Ir a Perfil y cambiar teléfono
6. Ir a Configuración y cambiar idioma

### **Test 2: Flujo de Manager**

1. Login como `manager@empresa.com`
2. Ir a Dashboard Corporativo (ver 10 empleados)
3. Ir a Aprobaciones (2 pendientes)
4. Aprobar una solicitud
5. Ver que cambia a "Aprobadas"
6. Ir a Reportes > Gastos
7. Exportar a Excel

### **Test 3: Flujo de Admin**

1. Login como `admin@asoperadora.com`
2. Ir a Gestión de Empleados (10 empleados)
3. Filtrar por departamento "IT" (3 empleados)
4. Ir a Centro de Costos (5 centros)
5. Ver presupuestos asignados
6. Ir a Políticas de Viaje (4 políticas)
7. Ir a Dashboard de Pagos (4 transacciones)
8. Exportar transacciones a Excel

### **Test 4: Flujo de Super Admin**

1. Login como `superadmin@asoperadora.com`
2. Acceso a TODO sin restricciones
3. Ver Audit Logs (5 registros)
4. Filtrar por acción "Login"
5. Ver todos los reportes
6. Gestionar todos los tenants

---

## 🎯 VERIFICACIÓN RÁPIDA

### **¿Funcionó todo?**

Ejecuta estos comandos para verificar:

```sql
-- Ver usuarios
SELECT email, role FROM users;

-- Ver reservas
SELECT id, type, status, total_amount FROM bookings;

-- Ver aprobaciones pendientes
SELECT COUNT(*) FROM approval_requests WHERE status = 'pending';

-- Ver transacciones
SELECT provider, status, amount FROM payment_transactions;

-- Ver empleados
SELECT COUNT(*) FROM employees;

-- Ver centro de costos
SELECT code, name, budget FROM cost_centers;
```

**Resultados esperados:**
- 6 usuarios
- 6 reservas
- 2 aprobaciones pendientes
- 4 transacciones
- 10 empleados
- 5 centros de costo

---

## 🐛 PROBLEMAS COMUNES

### **1. "No se crearon datos"**

**Solución:**
```bash
# Verificar que el script se ejecutó sin errores
psql $DATABASE_URL -f datos-prueba-completos.sql 2>&1 | grep ERROR

# Si hay errores, ejecutar las migraciones primero
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_cost_centers.sql
psql $DATABASE_URL -f migrations/003_payment_transactions.sql
psql $DATABASE_URL -f migrations/004_documents.sql
```

### **2. "No puedo hacer login"**

**Verificar:**
- Contraseña correcta: `Password123!` (con mayúscula y símbolo)
- Usuario existe: `SELECT email FROM users WHERE email = 'admin@asoperadora.com';`
- Servidor corriendo: `bun dev`

### **3. "No veo el menú lateral"**

**Solución:**
- Hacer login primero
- Ir a `/dashboard` (no solo `/`)
- Hard refresh: Ctrl + Shift + R

### **4. "Las tablas están vacías"**

**Verificar que ejecutaste el script:**
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM bookings;
```

Si retorna 0, ejecuta de nuevo: `psql $DATABASE_URL -f datos-prueba-completos.sql`

---

## ✅ CHECKLIST DE PRUEBAS

- [ ] Login exitoso con todos los usuarios
- [ ] Dashboard muestra estadísticas
- [ ] Mis Reservas muestra lista
- [ ] Detalles de reserva se ven completos
- [ ] Perfil permite editar datos
- [ ] Configuración guarda cambios
- [ ] Dashboard Corporativo (ADMIN) muestra métricas
- [ ] Gestión de Empleados muestra 10 empleados
- [ ] Centro de Costos muestra 5 centros
- [ ] Políticas muestra 4 políticas
- [ ] Aprobaciones muestra 2 pendientes
- [ ] Reportes se pueden exportar
- [ ] Dashboard Pagos muestra 4 transacciones
- [ ] Audit Logs muestra actividad

---

**¡Listo para probar! 🚀**

**Si algo no funciona, revisa la consola del navegador (F12) para ver errores.**
