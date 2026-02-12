# 📋 Plan de Pruebas — Módulo RRHH (Recursos Humanos)

**Versión:** v2.316d  
**Fecha:** 12 de Febrero de 2026  
**Generado por:** AntiGravity AI Assistant  
**Ambiente de pruebas:** https://app.asoperadora.com  
**Ambiente local:** http://localhost:3000  

---

## 📑 Tabla de Contenidos

1. [Pre-requisitos](#1-pre-requisitos)
2. [Acceso y Navegación](#2-acceso-y-navegación)
3. [Dashboard RRHH](#3-dashboard-rrhh)
4. [Departamentos](#4-departamentos)
5. [Empleados](#5-empleados)
6. [Agentes](#6-agentes)
7. [Contratos](#7-contratos)
8. [Asistencia](#8-asistencia)
9. [Ausencias (Permisos)](#9-ausencias-permisos)
10. [Nómina](#10-nómina)
11. [Comisiones](#11-comisiones)
12. [Documentos de Empleados](#12-documentos-de-empleados)
13. [Reclutamiento](#13-reclutamiento)
14. [Auditoría](#14-auditoría)
15. [Documentos de Clientes (CRM)](#15-documentos-de-clientes-crm)
16. [Alertas Automáticas (Cron)](#16-alertas-automáticas-cron)
17. [Control de Acceso (RBAC)](#17-control-de-acceso-rbac)
18. [Pruebas de API directas](#18-pruebas-de-api-directas)
19. [Checklist Final](#19-checklist-final)

---

## 1. Pre-requisitos

### Usuarios de prueba necesarios

| Usuario | Rol | Propósito |
|---------|-----|-----------|
| Admin principal | `SUPER_ADMIN` | Acceso total a RRHH |
| Admin agencia | `AGENCY_ADMIN` | Gestión de su agencia |
| HR Manager | `HR_MANAGER` | Rol específico de RRHH |
| Agente | `AGENT` | NO debe tener acceso a RRHH |
| Cliente | `CLIENT` | NO debe tener acceso a RRHH |

### Base de datos
- ✅ Migración `041_hr_module_core.sql` aplicada (11 tablas HR)
- ✅ Migración `004_documents.sql` + `040_client_documents_extension.sql` aplicada
- ✅ Funciones SQL `get_expiring_documents` y `get_client_documents` creadas
- ✅ Vista `client_documents_view` disponible

### Verificación rápida de base de datos

```bash
# Verificar tablas HR existen
node -e "
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'hr_%' ORDER BY table_name\");
  console.log('Tablas HR:', r.rows.map(r => r.table_name));
  await c.end();
})();
"
```

**Resultado esperado:** 11 tablas (`hr_agent_commissions`, `hr_attendance`, `hr_audit_log`, `hr_contracts`, `hr_departments`, `hr_employee_documents`, `hr_employees`, `hr_leave_requests`, `hr_payroll`, `hr_positions`, `hr_recruitment`)

---

## 2. Acceso y Navegación

### TEST 2.1 — Acceso desde el Dashboard Principal
1. Iniciar sesión como `SUPER_ADMIN`
2. Ir a `/dashboard`
3. En la sección **"Enlaces Útiles"** buscar el botón verde **"👥 RRHH — Recursos Humanos"**
4. Hacer clic → debería navegar a `/dashboard/rrhh`

**✅ Criterio:** El botón existe, navega correctamente, se ve con fondo verde esmeralda.

### TEST 2.2 — Acceso desde el Menú de Usuario (global)
1. Desde **cualquier página** del sitio, hacer clic en el avatar/nombre de usuario (esquina superior derecha)
2. El dropdown debe mostrar una sección **"Módulos"** con:
   - **🎯 CRM — Leads & Clientes** (azul)
   - **👥 RRHH — Recursos Humanos** (verde)
3. Hacer clic en RRHH → navega a `/dashboard/rrhh`

**✅ Criterio:** Ambos enlaces aparecen en el menú dropdown, color correcto, navegación funcional.

### TEST 2.3 — Navegación cross-module desde CRM
1. Ir a `/dashboard/crm`
2. En el sidebar izquierdo (azul), al fondo, debe aparecer el botón **"👥 Ir a RRHH"**
3. Hacer clic → navega a `/dashboard/rrhh`

**✅ Criterio:** El botón verde aparece en el footer del CRM sidebar y navega correctamente.

### TEST 2.4 — Navegación cross-module desde RRHH
1. Ir a `/dashboard/rrhh`
2. En el sidebar izquierdo (verde esmeralda), al fondo, debe haber dos botones:
   - **"🎯 Ir a CRM"** (azul)
   - **"← Dashboard Principal"** (verde)
3. Hacer clic en cada uno y verificar navegación

**✅ Criterio:** Ambos botones funcionan y navegan correctamente.

### TEST 2.5 — Sidebar RRHH completo
1. En `/dashboard/rrhh`, verificar que el sidebar izquierdo muestra:

| Sección | Enlaces |
|---------|---------|
| (sin sección) | Dashboard |
| Personal | Empleados, Agentes, Departamentos |
| Gestión | Contratos, Asistencia, Ausencias |
| Compensación | Nómina, Comisiones |
| Expediente | Documentos, Reclutamiento |
| Sistema | Auditoría |

2. Hacer clic en **CADA enlace** del sidebar y verificar que carga la página correspondiente sin errores
3. Verificar que el enlace activo se resalta con fondo verde y borde derecho verde

**✅ Criterio:** Los 12 enlaces del sidebar funcionan, la sección activa se resalta correctamente.

### TEST 2.6 — Colapsar/expandir sidebar
1. Hacer clic en la flecha `‹` del header del sidebar
2. El sidebar debe colapsar a ~14px mostrando solo íconos
3. Hacer hover sobre un ícono → debe mostrar tooltip con el nombre
4. Hacer clic en `›` para expandir

**✅ Criterio:** Animación suave, íconos legibles, tooltips funcionales.

---

## 3. Dashboard RRHH

**Ruta:** `/dashboard/rrhh`

### TEST 3.1 — Carga inicial
1. Navegar a `/dashboard/rrhh`
2. Debe mostrar un spinner de carga verde "Cargando módulo RRHH..."
3. Después de cargar, debe mostrar las tarjetas de KPIs

**✅ Criterio:** Sin errores de consola, datos se cargan (pueden ser 0 si no hay registros).

### TEST 3.2 — Tarjetas KPI (Row 1 - Personal)
Verificar 4 tarjetas:
- **Total Empleados** (azul) — Con subtexto "X activos"
- **Empleados Internos** (cyan) — Subtexto "Nómina fija"
- **Agentes de Ventas** (morado) — Subtexto "Comisiones"
- **Freelance** (ámbar) — Subtexto "Honorarios"

**✅ Criterio:** Cards visibles, gradientes correctos, datos numéricos (0 si no hay registros).

### TEST 3.3 — Tarjetas KPI (Row 2 - Estado)
Verificar 4 tarjetas:
- **Asistencia Hoy** (verde) — "X ausentes"
- **En Permiso** (naranja) — "X solicitudes pendientes"
- **Contratos Activos** (indigo) — Si hay por vencer: "⚠️ X por vencer"
- **Posiciones Abiertas** (teal) — "En proceso de reclutamiento"

### TEST 3.4 — Tarjetas Financieras (Row 3)
- **Nómina del Mes** — Formato MXN ($0)
- **Comisiones Pendientes** — Formato MXN ($0)

### TEST 3.5 — Alertas Activas
- Si hay solicitudes pendientes → alerta ámbar
- Si hay contratos por vencer → alerta roja
- Si hay ausentes → alerta naranja
- Si no hay alertas → mensaje verde "Sin alertas pendientes ✨"

### TEST 3.6 — Acciones Rápidas
Verificar 6 botones:
1. Nuevo Empleado → `/dashboard/rrhh/employees?new=true`
2. Nuevo Agente → `/dashboard/rrhh/agents?new=true`
3. Registrar Asistencia → `/dashboard/rrhh/attendance`
4. Nueva Ausencia → `/dashboard/rrhh/leaves?new=true`
5. Crear Contrato → `/dashboard/rrhh/contracts?new=true`
6. Nuevo Candidato → `/dashboard/rrhh/recruitment?new=true`

**✅ Criterio:** Todos los botones navegan correctamente.

### TEST 3.7 — Barra de distribución
- Si hay empleados: barra horizontal con colores azul (internos), morado (agentes), ámbar (freelance)
- Si no hay empleados: "Sin registros aún"

### TEST 3.8 — Botón actualizar
- Hacer clic en ícono ↻ (esquina superior derecha) → debe refrescar los datos

### TEST 3.9 — Fecha/hora
- Verificar que muestra la fecha actual en formato largo español (ej: "miércoles, 12 de febrero de 2026 · 03:15")

---

## 4. Departamentos

**Ruta:** `/dashboard/rrhh/departments`

### TEST 4.1 — Listado vacío
1. Navegar a la página
2. Si no hay departamentos, debe mostrar estado vacío adecuado

### TEST 4.2 — Crear departamento (vía API)
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_department",
    "tenant_id": 1,
    "data": {
      "name": "Operaciones",
      "description": "Departamento de operaciones turísticas"
    }
  }'
```

**Resultado esperado:** `{ "success": true, "data": { "id": 1, "name": "Operaciones", ... } }`

### TEST 4.3 — Crear múltiples departamentos
Crear al menos 3 departamentos para pruebas:
- Operaciones
- Ventas
- Administración

### TEST 4.4 — Verificar lista
- Recargar la página → deben aparecer los departamentos creados
- Verificar nombre, descripción, conteo de empleados

---

## 5. Empleados

**Ruta:** `/dashboard/rrhh/employees`

### TEST 5.1 — Crear empleado interno (vía API)
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_employee",
    "data": {
      "tenant_id": 1,
      "first_name": "María",
      "last_name": "González",
      "middle_name": "Elena",
      "email": "maria.gonzalez@asoperadora.com",
      "phone": "+52 55 1234 5678",
      "employee_type": "internal",
      "department_id": 1,
      "employment_status": "active",
      "hire_date": "2025-01-15",
      "rfc": "GOEM900101ABC",
      "curp": "GOEM900101MDFRLN09",
      "nss": "12345678901",
      "birth_date": "1990-01-01",
      "gender": "female",
      "nationality": "Mexicana",
      "emergency_contact_name": "Juan González",
      "emergency_contact_phone": "+52 55 9876 5432",
      "emergency_contact_relationship": "Esposo"
    }
  }'
```

### TEST 5.2 — Crear empleado tipo agente
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_employee",
    "data": {
      "tenant_id": 1,
      "first_name": "Carlos",
      "last_name": "Rodríguez",
      "email": "carlos.rodriguez@asoperadora.com",
      "phone": "+52 720 815 6804",
      "employee_type": "agent",
      "employment_status": "active",
      "hire_date": "2024-06-01",
      "agent_license_number": "LIC-2024-001",
      "agent_license_expiry": "2026-06-01",
      "agent_specialization": "Viajes Grupales",
      "agent_territory": "CDMX y Estado de México"
    }
  }'
```

### TEST 5.3 — Crear empleado freelance
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_employee",
    "data": {
      "tenant_id": 1,
      "first_name": "Ana",
      "last_name": "López",
      "email": "ana.freelance@gmail.com",
      "employee_type": "freelance",
      "employment_status": "active",
      "hire_date": "2025-09-01"
    }
  }'
```

### TEST 5.4 — Listar empleados
```bash
curl "http://localhost:3000/api/hr?action=list_employees&tenant_id=1"
```

**Verificar:**
- Total de empleados correcto
- Filtros por tipo: `employee_type=internal`, `employee_type=agent`, `employee_type=freelance`
- Filtro por estatus: `employment_status=active`
- Búsqueda: `search=María`

### TEST 5.5 — Ver empleado individual
```bash
curl "http://localhost:3000/api/hr?action=get_employee&id=1"
```

**Verificar:** Todos los campos del empleado se devuelven correctamente.

### TEST 5.6 — Actualizar empleado
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_employee",
    "id": 1,
    "data": {
      "phone": "+52 55 0000 1111",
      "notes": "Actualizado como prueba"
    }
  }'
```

### TEST 5.7 — Página frontend de empleados
1. Navegar a `/dashboard/rrhh/employees`
2. Verificar que la tabla/lista muestra los empleados creados
3. Verificar los filtros de la UI (si existen)
4. Verificar campos: nombre, tipo, departamento, estatus

---

## 6. Agentes

**Ruta:** `/dashboard/rrhh/agents`

### TEST 6.1 — Página de agentes
1. Navegar → debe mostrar solo empleados con `employee_type = 'agent'`
2. Verificar campos específicos de agente: licencia, especialización, territorio

### TEST 6.2 — Listar solo agentes via API
```bash
curl "http://localhost:3000/api/hr?action=list_employees&tenant_id=1&employee_type=agent"
```

**Verificar:** Solo se devuelven empleados tipo agente.

---

## 7. Contratos

**Ruta:** `/dashboard/rrhh/contracts`

### TEST 7.1 — Crear contrato
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_contract",
    "data": {
      "tenant_id": 1,
      "employee_id": 1,
      "contract_type": "indefinite",
      "contract_number": "CON-2025-001",
      "start_date": "2025-01-15",
      "salary": 25000,
      "salary_currency": "MXN",
      "salary_period": "monthly",
      "vacation_days": 12,
      "sick_days": 5,
      "notes": "Contrato indefinido primera contratación"
    }
  }'
```

### TEST 7.2 — Crear contrato con fecha de vencimiento (para probar alertas)
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_contract",
    "data": {
      "tenant_id": 1,
      "employee_id": 2,
      "contract_type": "fixed_term",
      "contract_number": "CON-2025-002",
      "start_date": "2025-06-01",
      "end_date": "2026-03-01",
      "salary": 15000,
      "salary_currency": "MXN",
      "salary_period": "monthly",
      "commission_percentage": 8.5,
      "notes": "Contrato a plazo fijo — vence pronto (para prueba de alertas)"
    }
  }'
```

### TEST 7.3 — Listar contratos
```bash
curl "http://localhost:3000/api/hr?action=list_contracts&tenant_id=1"
```

### TEST 7.4 — Listar contratos por empleado
```bash
curl "http://localhost:3000/api/hr?action=list_contracts&tenant_id=1&employee_id=1"
```

### TEST 7.5 — Página frontend
1. Navegar a `/dashboard/rrhh/contracts`
2. Verificar lista de contratos
3. Verificar indicadores de vencimiento (si los hay)

---

## 8. Asistencia

**Ruta:** `/dashboard/rrhh/attendance`

### TEST 8.1 — Registrar check-in
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "check_in",
    "data": {
      "tenant_id": 1,
      "employee_id": 1,
      "attendance_date": "2026-02-12",
      "check_in": "09:00:00",
      "check_in_method": "manual",
      "status": "present"
    }
  }'
```

### TEST 8.2 — Registrar check-out
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "check_out",
    "data": {
      "employee_id": 1,
      "date": "2026-02-12",
      "method": "manual"
    }
  }'
```

### TEST 8.3 — Listar asistencia
```bash
curl "http://localhost:3000/api/hr?action=list_attendance&tenant_id=1&start_date=2026-02-01&end_date=2026-02-28"
```

### TEST 8.4 — Asistencia por empleado
```bash
curl "http://localhost:3000/api/hr?action=list_attendance&tenant_id=1&employee_id=1"
```

### TEST 8.5 — Página frontend
1. Navegar a `/dashboard/rrhh/attendance`
2. Verificar registros de asistencia del día
3. Verificar filtros de fecha

---

## 9. Ausencias (Permisos)

**Ruta:** `/dashboard/rrhh/leaves`

### TEST 9.1 — Crear solicitud de ausencia
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_leave",
    "data": {
      "tenant_id": 1,
      "employee_id": 1,
      "leave_type": "vacation",
      "start_date": "2026-03-15",
      "end_date": "2026-03-22",
      "total_days": 5,
      "reason": "Vacaciones de Semana Santa"
    }
  }'
```

### TEST 9.2 — Crear solicitud de incapacidad
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_leave",
    "data": {
      "tenant_id": 1,
      "employee_id": 2,
      "leave_type": "sick",
      "start_date": "2026-02-13",
      "end_date": "2026-02-14",
      "total_days": 2,
      "half_day": false,
      "reason": "Consulta médica y reposo"
    }
  }'
```

### TEST 9.3 — Aprobar solicitud
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve_leave",
    "data": {
      "leave_id": 1,
      "user_id": 1,
      "approved": true
    }
  }'
```

### TEST 9.4 — Rechazar solicitud
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve_leave",
    "data": {
      "leave_id": 2,
      "user_id": 1,
      "approved": false,
      "reason": "No hay cobertura disponible para esa fecha"
    }
  }'
```

### TEST 9.5 — Listar ausencias
```bash
curl "http://localhost:3000/api/hr?action=list_leaves&tenant_id=1"
curl "http://localhost:3000/api/hr?action=list_leaves&tenant_id=1&status=pending"
curl "http://localhost:3000/api/hr?action=list_leaves&tenant_id=1&employee_id=1"
```

### TEST 9.6 — Página frontend
1. Navegar a `/dashboard/rrhh/leaves`
2. Verificar lista de solicitudes
3. Verificar indicadores de estado (pendiente/aprobado/rechazado)

---

## 10. Nómina

**Ruta:** `/dashboard/rrhh/payroll`

### TEST 10.1 — Crear registro de nómina
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_payroll",
    "data": {
      "tenant_id": 1,
      "employee_id": 1,
      "pay_period_start": "2026-02-01",
      "pay_period_end": "2026-02-15",
      "pay_date": "2026-02-16",
      "payroll_type": "quincenal",
      "base_salary": 12500,
      "overtime_pay": 1500,
      "commission_amount": 0,
      "bonus": 0,
      "tax_isr": 2100,
      "tax_imss": 450,
      "other_deductions": 200,
      "total_deductions": 2750,
      "net_pay": 11250,
      "currency": "MXN",
      "payment_method": "bank_transfer",
      "notes": "Primera quincena febrero 2026"
    }
  }'
```

### TEST 10.2 — Listar nómina
```bash
curl "http://localhost:3000/api/hr?action=list_payroll&tenant_id=1"
curl "http://localhost:3000/api/hr?action=list_payroll&tenant_id=1&employee_id=1"
```

### TEST 10.3 — Página frontend
1. Navegar a `/dashboard/rrhh/payroll`
2. Verificar registros de nómina
3. Verificar formato de moneda MXN

---

## 11. Comisiones

**Ruta:** `/dashboard/rrhh/commissions`

### TEST 11.1 — Página frontend
1. Navegar a `/dashboard/rrhh/commissions`
2. Verificar vista de comisiones de agentes
3. Verificar totales por agente

---

## 12. Documentos de Empleados

**Ruta:** `/dashboard/rrhh/documents`

### TEST 12.1 — Página frontend
1. Navegar a `/dashboard/rrhh/documents`
2. Verificar gestión de documentos por empleado
3. Verificar indicadores de vencimiento

---

## 13. Reclutamiento

**Ruta:** `/dashboard/rrhh/recruitment`

### TEST 13.1 — Crear candidato
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_candidate",
    "data": {
      "tenant_id": 1,
      "candidate_name": "Roberto Sánchez Pérez",
      "candidate_email": "roberto.sanchez@email.com",
      "candidate_phone": "+52 55 8765 4321",
      "position_title": "Agente de Ventas Senior",
      "candidate_type": "agent",
      "source": "referral",
      "notes": "Referido por Carlos Rodríguez. 5 años de experiencia en turismo."
    }
  }'
```

### TEST 13.2 — Actualizar etapa del candidato
```bash
curl -X POST http://localhost:3000/api/hr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_candidate_stage",
    "data": {
      "candidate_id": 1,
      "stage": "interview",
      "notes": "Entrevista programada para el 20 de febrero"
    }
  }'
```

**Etapas válidas del pipeline:**
`new` → `screening` → `interview` → `evaluation` → `offer` → `hired` / `rejected` / `withdrawn`

### TEST 13.3 — Listar candidatos
```bash
curl "http://localhost:3000/api/hr?action=list_recruitment&tenant_id=1"
curl "http://localhost:3000/api/hr?action=list_recruitment&tenant_id=1&stage=interview"
```

### TEST 13.4 — Página frontend
1. Navegar a `/dashboard/rrhh/recruitment`
2. Verificar pipeline visual
3. Verificar cambio de etapas

---

## 14. Auditoría

**Ruta:** `/dashboard/rrhh/audit`

### TEST 14.1 — Verificar log
```bash
curl "http://localhost:3000/api/hr?action=audit_log&tenant_id=1&limit=20"
```

**Verificar:** Cada acción realizada anteriormente debe generar un registro de auditoría con:
- Acción realizada
- Tipo de entidad
- ID de entidad
- Descripción
- Timestamp

### TEST 14.2 — Página frontend
1. Navegar a `/dashboard/rrhh/audit`
2. Verificar lista de eventos
3. Verificar filtros por empleado y acción

---

## 15. Documentos de Clientes (CRM)

**Ruta:** `/dashboard/crm/client-documents`

### TEST 15.1 — Acceso desde CRM
1. Ir a `/dashboard/crm`
2. En el sidebar, sección "Datos", hacer clic en **"Docs Clientes"**
3. Debe navegar a `/dashboard/crm/client-documents`

### TEST 15.2 — KPIs
- Verificar 6 tarjetas: Total, Pendientes, Aprobados, Rechazados, Vencidos, Por Vencer
- Inicialmente todos en 0

### TEST 15.3 — Filtros
- Verificar campo de búsqueda
- Verificar select de estados (Todos, Pendientes, Aprobados, Rechazados, Vencidos)
- Verificar select de categorías (Identificación, Legal, Financiero, etc.)
- Verificar botón "Subir Documento"

### TEST 15.4 — Estado vacío
- Con 0 documentos, debe mostrar ícono y mensaje "Sin documentos"

---

## 16. Alertas Automáticas (Cron)

**Ruta API:** `GET /api/cron/hr-alerts`

### TEST 16.1 — Ejecutar cron manualmente (local)
```bash
curl "http://localhost:3000/api/cron/hr-alerts?secret=hr-alerts-2026"
```

### TEST 16.2 — Ejecutar en producción
```bash
curl "https://app.asoperadora.com/api/cron/hr-alerts?secret=hr-alerts-2026"
```

### TEST 16.3 — Verificar respuesta
La respuesta JSON debe incluir:
```json
{
  "success": true,
  "summary": {
    "total": 0,
    "critical": 0,
    "high": 0,
    "medium": 0,
    "by_type": {
      "contract_expiring": 0,
      "license_expiring": 0,
      "document_expiring": 0,
      "leave_pending": 0,
      "probation_ending": 0
    },
    "executed_at": "2026-02-12T..."
  },
  "alerts": []
}
```

### TEST 16.4 — Probar con datos que generen alertas
1. Crear un contrato con `end_date` = fecha actual + 15 días
2. Crear una solicitud de ausencia y dejarla en `pending` por más de 48h
3. Re-ejecutar el cron
4. Verificar que se generan alertas con las urgencias correctas

### TEST 16.5 — Tipos de alertas a verificar

| Tipo | Condición | Urgencias |
|------|-----------|-----------|
| `contract_expiring` | Contrato vence en ≤30 días | ≤7d=critical, ≤15d=high, else=medium |
| `license_expiring` | Licencia agente vence en ≤60 días | ≤15d=critical, ≤30d=high, else=medium |
| `document_expiring` | Doc empleado vence en ≤30 días | expired=critical, ≤7d=high, else=medium |
| `client_document_expiring` | Doc cliente vence en ≤30 días | expired=critical, ≤7d=high, else=medium |
| `leave_pending_review` | Ausencia pendiente >48h | >96h=high, else=medium |
| `probation_ending` | Período prueba termina en ≤15 días | ≤5d=critical, else=high |

### TEST 16.6 — Schedule Vercel
- Verificar en `vercel.json` que el cron está configurado:
  ```json
  "crons": [{ "path": "/api/cron/hr-alerts", "schedule": "0 14 * * *" }]
  ```
- `0 14 * * *` = Todos los días a las 14:00 UTC = 8:00 AM CST

---

## 17. Control de Acceso (RBAC)

### TEST 17.1 — SUPER_ADMIN accede a RRHH
1. Login como `SUPER_ADMIN`
2. Navegar a `/dashboard/rrhh` → ✅ Acceso permitido

### TEST 17.2 — AGENCY_ADMIN accede a RRHH
1. Login como `AGENCY_ADMIN`
2. Navegar a `/dashboard/rrhh` → ✅ Acceso permitido

### TEST 17.3 — HR_MANAGER accede a RRHH
1. Login como `HR_MANAGER`
2. Navegar a `/dashboard/rrhh` → ✅ Acceso permitido

### TEST 17.4 — AGENT NO accede a RRHH
1. Login como `AGENT`
2. Navegar a `/dashboard/rrhh` → ❌ Redirigido a `/dashboard?access_denied=1`
3. Verificar que se muestra parámetro `required_role=SUPER_ADMIN,AGENCY_ADMIN,HR_MANAGER`

### TEST 17.5 — CLIENT NO accede a RRHH
1. Login como `CLIENT`
2. Navegar a `/dashboard/rrhh` → ❌ Redirigido a `/dashboard?access_denied=1`

### TEST 17.6 — Usuario no autenticado
1. Sin iniciar sesión
2. Navegar a `/dashboard/rrhh` → ❌ Redirigido a `/login?returnUrl=/dashboard/rrhh`

### TEST 17.7 — Visibilidad menú por rol

| Rol | Ve CRM en menú | Ve RRHH en menú |
|-----|----------------|-----------------|
| SUPER_ADMIN | ✅ | ✅ |
| AGENCY_ADMIN | ✅ | ✅ |
| HR_MANAGER | ✅ | ✅ |
| AGENT | ✅ | ✅ (pero redirigido) |
| CLIENT | ❌ | ❌ |

---

## 18. Pruebas de API Directas

### TEST 18.1 — Dashboard stats
```bash
curl "http://localhost:3000/api/hr?action=dashboard&tenant_id=1"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "total_employees": 3,
    "active_employees": 3,
    "internal_count": 1,
    "agent_count": 1,
    "freelance_count": 1,
    "on_leave": 0,
    "pending_leaves": 1,
    "active_contracts": 2,
    "expiring_contracts": 1,
    "open_positions": 0,
    "attendance_today": 1,
    "absent_today": 2,
    "total_payroll_this_month": 11250,
    "pending_commissions": 0
  }
}
```

### TEST 18.2 — Acción inválida
```bash
curl "http://localhost:3000/api/hr?action=invalid_action"
```

**Respuesta esperada:** Error con mensaje descriptivo.

---

## 19. Checklist Final

### Navegación ✅
- [ ] Acceso desde Dashboard Principal (botón verde)
- [ ] Acceso desde UserMenu (dropdown global)
- [ ] Acceso desde CRM sidebar (cross-module)
- [ ] Sidebar RRHH muestra 12 secciones
- [ ] Sidebar colapsa y expande
- [ ] Navegación RRHH → CRM funciona
- [ ] Navegación RRHH → Dashboard funciona

### Frontend ✅
- [ ] Dashboard RRHH carga sin errores
- [ ] KPIs muestran datos correctos (o 0)
- [ ] Alertas se muestran según estado
- [ ] Acciones rápidas navegan correctamente
- [ ] Barra de distribución funciona
- [ ] Todas las 12 sub-páginas cargan sin errores:
  - [ ] Employees
  - [ ] Agents
  - [ ] Departments
  - [ ] Contracts
  - [ ] Attendance
  - [ ] Leaves
  - [ ] Payroll
  - [ ] Commissions
  - [ ] Documents
  - [ ] Recruitment
  - [ ] Audit
- [ ] Docs Clientes carga en CRM sidebar

### API ✅
- [ ] `GET /api/hr?action=dashboard` → stats
- [ ] `POST /api/hr` → create_employee
- [ ] `POST /api/hr` → update_employee
- [ ] `GET /api/hr?action=get_employee`
- [ ] `GET /api/hr?action=list_employees` + filtros
- [ ] `POST /api/hr` → create_department
- [ ] `GET /api/hr?action=list_departments`
- [ ] `POST /api/hr` → create_contract
- [ ] `GET /api/hr?action=list_contracts`
- [ ] `POST /api/hr` → check_in
- [ ] `POST /api/hr` → check_out
- [ ] `GET /api/hr?action=list_attendance`
- [ ] `POST /api/hr` → create_leave
- [ ] `POST /api/hr` → approve_leave
- [ ] `GET /api/hr?action=list_leaves`
- [ ] `POST /api/hr` → create_payroll
- [ ] `GET /api/hr?action=list_payroll`
- [ ] `POST /api/hr` → create_candidate
- [ ] `POST /api/hr` → update_candidate_stage
- [ ] `GET /api/hr?action=list_recruitment`
- [ ] `GET /api/hr?action=audit_log`

### Cron / Alertas ✅
- [ ] `/api/cron/hr-alerts` ejecuta sin errores
- [ ] Devuelve JSON con summary y alerts
- [ ] Detecta contratos por vencer
- [ ] Detecta licencias por vencer
- [ ] Detecta documentos por vencer
- [ ] Detecta ausencias pendientes >48h
- [ ] Detecta períodos de prueba por terminar
- [ ] Vercel cron configurado (0 14 * * *)

### RBAC ✅
- [ ] SUPER_ADMIN accede a RRHH
- [ ] AGENCY_ADMIN accede a RRHH
- [ ] HR_MANAGER accede a RRHH
- [ ] AGENT NO accede a RRHH (redireccionado)
- [ ] CLIENT NO accede a RRHH (redireccionado)
- [ ] Usuario no autenticado → login

### Base de Datos ✅
- [ ] 11 tablas HR creadas
- [ ] 44 índices creados
- [ ] Triggers updated_at funcionales
- [ ] Tabla documents con extensión 040
- [ ] Vista client_documents_view existe
- [ ] Funciones SQL get_expiring_documents / get_client_documents existen

---

## 📝 Notas Adicionales

### Orden sugerido para data seeding (pruebas completas)
1. Crear **departamentos** (Operaciones, Ventas, Administración)
2. Crear **posiciones** (Gerente, Agente Senior, Asistente)
3. Crear **empleados** (interno, agente, freelance — al menos 3)
4. Crear **contratos** (uno indefinido, uno a plazo fijo con fecha cercana)
5. Registrar **asistencia** (check-in y check-out del día)
6. Crear **solicitudes de ausencia** (una pendiente, aprobar otra)
7. Generar **nómina** (un registro de prueba)
8. Crear **candidatos** de reclutamiento
9. Ejecutar **cron de alertas** para verificar detección
10. Revisar **log de auditoría** para verificar que todo se registró

### Campos de cumplimiento legal mexicano
Verificar que los siguientes campos están disponibles y funcionan:
- **RFC** — clave de 13 caracteres (persona física)
- **CURP** — clave de 18 caracteres
- **NSS** — número IMSS de 11 dígitos
- **CLABE** — cuenta interbancaria de 18 dígitos (en contrato/nómina)
- **ISR / IMSS** — deducciones fiscales en nómina

---

*Documento generado automáticamente. Actualizar conforme se agreguen nuevas funcionalidades al módulo.*
