# 🏢 PLAN FUNCIONALIDADES CORPORATIVAS

**Fecha:** 14 de Diciembre de 2025
**Objetivo:** Sistema listo para presentación con clientes corporativos
**Timeline:** 1-2 semanas

---

## 🎯 VISIÓN CORPORATIVA

**Cliente Típico:**
Empresa mediana-grande (50-500 empleados) que necesita:
- Gestión centralizada de viajes de empleados
- Control de presupuesto y gastos
- Aprobaciones de viajes según jerarquía
- Reportes para contabilidad y finanzas
- Cumplimiento de políticas de viaje

**Usuarios del Sistema:**
1. **Admin Corporativo** - CFO, Controller
2. **Travel Manager** - Gestiona reservas
3. **Manager/Director** - Aprueba viajes de su equipo
4. **Empleado** - Solicita viajes

---

## 📋 FUNCIONALIDADES PRIORITARIAS

### **1️⃣ WORKFLOW DE APROBACIÓN** ⭐⭐⭐

**Flujo:**
```
Empleado solicita viaje
    ↓
Manager revisa y aprueba/rechaza
    ↓ (si aprueba)
Travel Manager hace la reserva
    ↓
Confirmación automática al empleado
```

**Implementación:**

#### **Backend:**
- [x] Tabla `travel_approvals` (ya existe en BD)
- [ ] `src/services/ApprovalService.ts`
- [ ] `/api/approvals/pending` GET
- [ ] `/api/approvals/[id]/approve` POST
- [ ] `/api/approvals/[id]/reject` POST
- [ ] `/api/approvals/history` GET

#### **Frontend:**
- [ ] `/approvals` - Panel de aprobaciones
- [ ] Componente `ApprovalCard`
- [ ] Modal con detalles de solicitud
- [ ] Botones Aprobar/Rechazar
- [ ] Notificaciones en tiempo real (opcional)

**Tiempo estimado:** 2-3 días

---

### **2️⃣ DASHBOARD CORPORATIVO** ⭐⭐⭐

**Vista Principal:**
- Resumen del mes (# reservas, gasto total)
- Pendientes de aprobación (número)
- Top 5 destinos
- Top 5 empleados viajeros
- Gráfica de gastos por departamento
- Gráfica de gastos por mes

**Implementación:**

#### **Backend:**
- [ ] `/api/corporate/stats` - Estadísticas generales
- [ ] `/api/corporate/top-destinations` - Top destinos
- [ ] `/api/corporate/top-travelers` - Top viajeros
- [ ] `/api/corporate/expenses-by-dept` - Por departamento
- [ ] `/api/corporate/expenses-timeline` - Histórico

#### **Frontend:**
- [ ] `/dashboard/corporate` - Página principal
- [ ] Componente `CorporateStats`
- [ ] Gráficas con Recharts
- [ ] Filtros de fecha (mes, trimestre, año)

**Tiempo estimado:** 3-4 días

---

### **3️⃣ GESTIÓN DE EMPLEADOS** ⭐⭐⭐

**Funcionalidad:**
- Lista de todos los empleados
- Agregar/editar/desactivar empleados
- Asignar departamento y centro de costo
- Asignar rol (Admin, Manager, Empleado)
- Importación masiva desde Excel/CSV

**Implementación:**

#### **Backend:**
- [x] Tabla `tenant_users` (ya existe)
- [ ] `/api/corporate/employees` GET/POST
- [ ] `/api/corporate/employees/[id]` GET/PUT/DELETE
- [ ] `/api/corporate/employees/import` POST (CSV)

#### **Frontend:**
- [ ] `/dashboard/corporate/employees` - Lista
- [ ] Modal para agregar/editar empleado
- [ ] Upload de CSV para importación masiva
- [ ] Filtros por departamento, rol, status

**Tiempo estimado:** 2-3 días

---

### **4️⃣ POLÍTICAS DE VIAJE** ⭐⭐

**Configuraciones:**
- Clase de vuelo máxima permitida (Economy, Business, First)
- Precio máximo de hotel por noche
- Anticipación mínima para reservar (días)
- Destinos permitidos/restringidos (opcional)
- Requiere aprobación siempre/solo sobre X monto

**Implementación:**

#### **Backend:**
- [x] Tabla `travel_policies` (ya existe)
- [ ] `/api/corporate/policies` GET/POST/PUT
- [ ] Validación en `/api/search` y `/api/bookings`
- [ ] Función `validateAgainstPolicy(booking, policy)`

#### **Frontend:**
- [ ] `/dashboard/corporate/policies` - Configuración
- [ ] Formulario de políticas
- [ ] Alertas visuales cuando se excede política
- [ ] Toggle "Requiere aprobación"

**Tiempo estimado:** 2 días

---

### **5️⃣ REPORTES CORPORATIVOS** ⭐⭐

**Reportes Necesarios:**

**A) Reporte de Gastos por Período**
- Total gastado
- Desglose por tipo (vuelos, hoteles, paquetes)
- Comparativa con períodos anteriores

**B) Reporte por Departamento**
- Gasto por departamento
- # de viajes por departamento
- Empleados más viajeros por depto

**C) Reporte por Empleado**
- Historial completo de viajes
- Gasto total por empleado
- Destinos visitados

**D) Cumplimiento de Políticas**
- % de viajes dentro de política
- % que requirieron aprobación especial
- Ahorro vs sin política

**Implementación:**

#### **Backend:**
- [ ] `/api/corporate/reports/expenses` GET
- [ ] `/api/corporate/reports/departments` GET
- [ ] `/api/corporate/reports/employees` GET
- [ ] `/api/corporate/reports/policy-compliance` GET
- [ ] Exportación a Excel (usar ExcelService)
- [ ] Exportación a PDF (usar PDFService)

#### **Frontend:**
- [ ] `/dashboard/corporate/reports` - Hub de reportes
- [ ] Selector de tipo de reporte
- [ ] Filtros de fecha, departamento, empleado
- [ ] Botones de exportación (Excel/PDF)
- [ ] Gráficas visuales

**Tiempo estimado:** 3-4 días

---

### **6️⃣ CENTRO DE COSTOS** ⭐

**Funcionalidad:**
- Crear centros de costo
- Asignar reservas a centro de costo
- Reportes por centro de costo

**Implementación:**

#### **Backend:**
- [ ] Tabla `cost_centers`
- [ ] `/api/corporate/cost-centers` CRUD
- [ ] Campo en `bookings` table

#### **Frontend:**
- [ ] Gestión de centros de costo
- [ ] Selector al hacer reserva

**Tiempo estimado:** 1-2 días

---

## 📊 CRONOGRAMA SUGERIDO

| Día | Tarea | Output |
|-----|-------|--------|
| **Día 1-2** | Workflow Aprobación | APIs + Panel básico |
| **Día 3-4** | Dashboard Corporativo | Estadísticas + Gráficas |
| **Día 5-6** | Gestión Empleados | CRUD + Import CSV |
| **Día 7** | Políticas de Viaje | Config + Validación |
| **Día 8-10** | Reportes Corporativos | 4 reportes + Export |
| **Día 11** | Centro de Costos | CRUD básico |
| **Día 12-13** | Testing y Pulido | QA completo |
| **Día 14** | Documentación | Guía de usuario |

**Total:** 2 semanas para MVP Corporativo

---

## 🎨 DISEÑO DE INTERFACES

### **Dashboard Corporativo - Wireframe:**

```
┌─────────────────────────────────────────────────┐
│ 🏢 Dashboard Corporativo - Noviembre 2025      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ 45   │  │$125K │  │  12  │  │ 98%  │       │
│  │Viajes│  │Gasto │  │Pend. │  │Policy│       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                 │
│  ┌─────────────────────┐  ┌──────────────────┐ │
│  │ Gastos por Depto    │  │ Top Destinos     │ │
│  │                     │  │                  │ │
│  │  [Bar Chart]        │  │  1. CDMX - 15    │ │
│  │                     │  │  2. GDL - 10     │ │
│  │                     │  │  3. MTY - 8      │ │
│  └─────────────────────┘  └──────────────────┘ │
│                                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ Últimas Solicitudes de Aprobación         │ │
│  │                                            │ │
│  │ Juan Pérez - CDMX - $5,600 [Aprobar]      │ │
│  │ María López - CUN - $8,900 [Aprobar]      │ │
│  │ Carlos Ruiz - GDL - $3,200 [Aprobar]      │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### **Panel de Aprobaciones - Wireframe:**

```
┌─────────────────────────────────────────────────┐
│ ✅ Aprobaciones Pendientes (12)                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  🔴 URGENTE                                     │
│  ┌────────────────────────────────────────────┐ │
│  │ Juan Pérez Gómez                           │ │
│  │ Depto: Ventas | Manager: Ana Martínez      │ │
│  │                                            │ │
│  │ 📍 CDMX → Cancún                           │ │
│  │ 📅 15-20 Dic 2025 (5 noches)               │ │
│  │ ✈️  Vuelo: $4,200 (Economy)                │ │
│  │ 🏨 Hotel: $1,400/noche                     │ │
│  │ 💰 Total: $11,200 MXN                      │ │
│  │                                            │ │
│  │ ⚠️  Excede política: Hotel máx $1,000       │ │
│  │                                            │ │
│  │ [✅ Aprobar] [❌ Rechazar] [👁️ Ver Detalles]│ │
│  └────────────────────────────────────────────┘ │
│                                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ María López...                             │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 🔧 CONSIDERACIONES TÉCNICAS

### **Permisos y Roles:**

```typescript
// Matriz de permisos
const CORPORATE_PERMISSIONS = {
  ADMIN: {
    view_dashboard: true,
    manage_employees: true,
    manage_policies: true,
    view_all_bookings: true,
    approve_bookings: true,
    view_reports: true
  },
  TRAVEL_MANAGER: {
    view_dashboard: true,
    manage_employees: false,
    manage_policies: false,
    view_all_bookings: true,
    approve_bookings: true,
    create_bookings: true
  },
  MANAGER: {
    view_dashboard: false,
    approve_bookings: true, // Solo de su equipo
    view_team_bookings: true
  },
  EMPLOYEE: {
    request_booking: true,
    view_own_bookings: true
  }
}
```

### **Notificaciones Automáticas:**

**Triggers:**
- Empleado crea solicitud → Email a Manager
- Manager aprueba → Email a Travel Manager + Empleado
- Manager rechaza → Email a Empleado con razón
- Reserva confirmada → Email a Empleado con voucher
- 24h antes de viaje → Reminder al empleado

### **Validaciones:**

```typescript
// Validar contra política
function validateBooking(booking, policy) {
  const errors = []

  if (booking.flightClass > policy.maxFlightClass) {
    errors.push('Clase de vuelo excede política')
  }

  if (booking.hotelPricePerNight > policy.maxHotelPrice) {
    errors.push(`Hotel excede máximo: $${policy.maxHotelPrice}`)
  }

  const daysInAdvance = getDaysBetween(today, booking.date)
  if (daysInAdvance < policy.minAdvanceDays) {
    errors.push(`Mínimo ${policy.minAdvanceDays} días de anticipación`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    requiresApproval: errors.length > 0 || policy.requiresApproval
  }
}
```

---

## 📈 MÉTRICAS DE ÉXITO

**Para considerar el MVP corporativo completo:**

✅ Admin puede configurar políticas de viaje
✅ Admin puede ver dashboard con estadísticas
✅ Admin puede agregar empleados manualmente o CSV
✅ Empleado puede solicitar viaje
✅ Manager puede aprobar/rechazar viajes de su equipo
✅ Travel Manager puede hacer reservas aprobadas
✅ Sistema valida automáticamente contra políticas
✅ Notificaciones email en cada paso
✅ Reportes exportables a Excel/PDF
✅ 3 reportes principales funcionando

---

## 🚀 DEMO FLOW (Para Presentación)

**Historia:**
"Acme Corp tiene 100 empleados y necesita gestionar viajes..."

**1. Configuración Inicial (Admin)**
- Crear empresa "Acme Corp"
- Configurar política: Economy max, $1,000/noche max, 7 días anticipación
- Importar 10 empleados desde CSV
- Asignar roles y departamentos

**2. Solicitud de Viaje (Empleado)**
- Juan Pérez (Ventas) solicita viaje CDMX → GDL
- Sistema muestra opciones dentro de política
- Juan selecciona vuelo + hotel
- Solicitud creada, email enviado a su manager

**3. Aprobación (Manager)**
- Ana Martínez (Manager Ventas) recibe email
- Entra a panel de aprobaciones
- Ve detalles del viaje de Juan
- Aprueba con un click
- Email a Juan y Travel Manager

**4. Reserva (Travel Manager)**
- Carlos (Travel Manager) ve aprobación
- Confirma la reserva
- Voucher generado y enviado a Juan

**5. Reportes (Admin)**
- CFO entra al dashboard
- Ve que Ventas gastó $50K este mes
- Exporta reporte a Excel para contabilidad
- 95% de cumplimiento de políticas

---

**Documento creado:** 14 de Diciembre de 2025
**Próxima revisión:** Al completar implementación
