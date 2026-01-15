# 🎯 PLAN DE ACCIÓN: SISTEMA CORPORATIVO 100%

**Objetivo:** Completar Sistema Corporativo de 94% a 100%
**Tiempo Estimado:** 6-8 horas (1 día de trabajo)
**Fecha Objetivo:** 16 de Diciembre de 2025

---

## 📊 ESTADO ACTUAL (v2.75)

**Progreso:**
- Sistema Corporativo: **94%**
- Progreso General: **87%**

**Completado:**
- ✅ Dashboard Corporativo (100%)
- ✅ Workflow de Aprobaciones (100%)
- ✅ Gestión de Empleados (100%)
- ✅ Políticas de Viaje (100%)
- ✅ Reportes Corporativos (100%)
- ✅ Centro de Costos (100%)
- ✅ Exportación Excel/PDF (100%)

**Pendiente:**
- 🔴 GAP #1: Validación de Políticas en Búsqueda (80% → 100%)
- 🟡 GAP #2: Asignar Centro de Costo a Reservas (70% → 100%)
- 🟢 GAP #3: API DELETE Empleado (95% → 100%)

---

## 🎯 PLAN DE EJECUCIÓN

### **FASE 1: GAP #1 - Validación en Búsqueda** (2-3 horas)

#### **Objetivo:**
Integrar el servicio de validación de políticas en la búsqueda de vuelos/hoteles para que los resultados muestren automáticamente si cumplen con la política corporativa.

#### **Tareas:**

**1.1. Modificar API de Búsqueda** (30 min)
- Archivo: `src/app/api/search/route.ts`
- Acción: Agregar validación después de obtener resultados
- Código:
```typescript
// Línea ~150 en src/app/api/search/route.ts

import { PolicyValidationService } from '@/services/PolicyValidationService'

// Después de obtener resultados de adaptadores:
if (tenantId && (type === 'flight' || type === 'hotel')) {
  results = await PolicyValidationService.validateSearchResults(
    parseInt(tenantId),
    results,
    type
  )
}

return NextResponse.json({
  success: true,
  results,
  total: results.length
})
```

**1.2. Actualizar Página de Resultados** (1 hora)
- Archivo: `src/app/resultados/page.tsx`
- Acción: Mostrar badges de cumplimiento de política
- Código:
```tsx
import { PolicyBadge, PolicyAlert } from '@/components/PolicyBadge'

// En cada card de resultado, después de la información del precio:
{result.policyValidation && (
  <div className="mt-3 pt-3 border-t">
    <PolicyBadge
      withinPolicy={result.withinPolicy}
      requiresApproval={result.requiresApproval}
      violations={result.policyValidation?.violations}
      warnings={result.policyValidation?.warnings}
      showDetails={true}
    />

    {(result.policyValidation?.violations?.length > 0 ||
      result.policyValidation?.warnings?.length > 0) && (
      <PolicyAlert
        violations={result.policyValidation?.violations || []}
        warnings={result.policyValidation?.warnings || []}
      />
    )}
  </div>
)}
```

**1.3. Agregar Ordenamiento** (30 min)
- Archivo: `src/app/resultados/page.tsx`
- Acción: Ordenar resultados (primero los que cumplen política)
- Código:
```tsx
// En el useState de resultados:
const [sortedResults, setSortedResults] = useState([])

useEffect(() => {
  if (results) {
    const sorted = [...results].sort((a, b) => {
      // Primero los que están dentro de política
      if (a.withinPolicy && !b.withinPolicy) return -1
      if (!a.withinPolicy && b.withinPolicy) return 1

      // Luego por precio
      return (a.price || 0) - (b.price || 0)
    })
    setSortedResults(sorted)
  }
}, [results])

// Usar sortedResults en lugar de results para el mapeo
{sortedResults.map(result => ...)}
```

**1.4. Testing** (30 min)
- Crear política estricta (Economy, $1,000 hotel, 7 días)
- Buscar vuelos/hoteles que excedan límites
- Verificar que se muestran badges correctos
- Verificar ordenamiento

**Resultado Esperado:** ✅
- Resultados muestran badges "Dentro de Política" o "Requiere Aprobación"
- Alertas visuales cuando se excede política
- Resultados ordenados correctamente
- GAP #1: 100% ✅

---

### **FASE 2: GAP #2 - Centro de Costo en Reservas** (3-4 horas)

#### **Objetivo:**
Permitir asignar un centro de costo al crear una reserva y mostrar esta información en los detalles de la reserva.

#### **Tareas:**

**2.1. Modificar API de Booking para Aceptar Centro de Costo** (15 min)
- Archivo: `src/app/api/bookings/route.ts`
- Acción: Agregar campo `cost_center_id` al crear booking
- Código:
```typescript
// En POST handler:
const {
  ...existingFields,
  costCenterId // Nuevo campo
} = await request.json()

const booking = await db.insertOne('bookings', {
  ...existingFields,
  cost_center_id: costCenterId ? parseInt(costCenterId) : null,
  // ... resto de campos
})
```

**2.2. Crear Selector de Centro de Costo (Componente Reutilizable)** (1 hora)
- Archivo: `src/components/CostCenterSelector.tsx` (NUEVO)
- Código:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface CostCenterSelectorProps {
  value: string
  onChange: (value: string) => void
  userDepartment?: string
  required?: boolean
}

export function CostCenterSelector({
  value,
  onChange,
  userDepartment,
  required = false
}: CostCenterSelectorProps) {
  const [costCenters, setCostCenters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCostCenters()
  }, [])

  const fetchCostCenters = async () => {
    try {
      const res = await fetch('/api/corporate/cost-centers?tenantId=1')
      const data = await res.json()
      const activeCCs = data.data.filter((cc: any) => cc.is_active)
      setCostCenters(activeCCs)

      // Auto-asignar según departamento
      if (userDepartment && !value) {
        const autoCC = activeCCs.find((cc: any) =>
          cc.name.toLowerCase().includes(userDepartment.toLowerCase())
        )
        if (autoCC) {
          onChange(autoCC.id.toString())
        }
      }
    } catch (error) {
      console.error('Error loading cost centers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="costCenter">
        Centro de Costo {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger id="costCenter">
          <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar centro de costo"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Sin asignar</SelectItem>
          {costCenters.map((cc: any) => (
            <SelectItem key={cc.id} value={cc.id.toString()}>
              {cc.code} - {cc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Opcional: Asigna esta reserva a un centro de costo para mejor tracking
      </p>
    </div>
  )
}
```

**2.3. Integrar en Página de Checkout** (1 hora)
- Archivo: Crear `src/app/checkout/page.tsx` o modificar página existente
- Acción: Agregar selector de centro de costo
- Código:
```tsx
import { CostCenterSelector } from '@/components/CostCenterSelector'

// En el estado del componente:
const [costCenterId, setCostCenterId] = useState('')

// En el formulario:
<CostCenterSelector
  value={costCenterId}
  onChange={setCostCenterId}
  userDepartment={user?.department}
  required={false}
/>

// Al crear booking:
const bookingData = {
  ...otherFields,
  costCenterId: costCenterId || null
}
```

**2.4. Mostrar en Detalles de Reserva** (45 min)
- Archivo: `src/app/reserva/[id]/page.tsx`
- Acción: Mostrar centro de costo asignado
- Código:
```tsx
// En la sección de detalles:

{booking.cost_center_id && (
  <div className="border-t pt-4 mt-4">
    <h3 className="font-semibold text-lg mb-3">Información Corporativa</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Centro de Costo</p>
        <p className="font-medium">
          {booking.cost_center?.code || 'N/A'}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Nombre</p>
        <p className="font-medium">
          {booking.cost_center?.name || 'Sin asignar'}
        </p>
      </div>
    </div>
  </div>
)}
```

**2.5. Actualizar Query de Booking para Incluir Centro de Costo** (15 min)
- Archivo: `src/app/api/bookings/[id]/route.ts`
- Acción: JOIN con cost_centers
- Código:
```typescript
const booking = await db.queryOne<any>(
  `SELECT
    b.*,
    cc.id as "cost_center.id",
    cc.code as "cost_center.code",
    cc.name as "cost_center.name"
   FROM bookings b
   LEFT JOIN cost_centers cc ON b.cost_center_id = cc.id
   WHERE b.id = $1`,
  [bookingId]
)
```

**2.6. Testing** (30 min)
- Crear reserva sin centro de costo
- Crear reserva con centro de costo manual
- Verificar auto-asignación por departamento
- Ver detalles de reserva con centro asignado

**Resultado Esperado:** ✅
- Selector de centro de costo funcional
- Auto-asignación por departamento
- Centro de costo visible en detalles
- GAP #2: 100% ✅

---

### **FASE 3: GAP #3 - API DELETE Empleado** (1 hora)

#### **Objetivo:**
Agregar endpoint DELETE consistente con el resto de la API para eliminar empleados (soft delete).

#### **Tareas:**

**3.1. Implementar DELETE Endpoint** (30 min)
- Archivo: `src/app/api/corporate/employees/[id]/route.ts`
- Acción: Agregar función DELETE
- Código: (Ver documento REVISION-EXHAUSTIVA-v2.75.md, GAP #3)

**3.2. Actualizar UI para Usar DELETE** (15 min)
- Archivo: `src/app/dashboard/corporate/employees/page.tsx`
- Acción: Cambiar llamada de PUT a DELETE
- Código:
```tsx
const handleDelete = async (id: number) => {
  if (!confirm('¿Estás seguro de eliminar este empleado?')) return

  try {
    const res = await fetch(`/api/corporate/employees/${id}`, {
      method: 'DELETE'
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Error al eliminar')
    }

    toast({
      title: 'Éxito',
      description: 'Empleado eliminado'
    })

    fetchEmployees()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive'
    })
  }
}
```

**3.3. Testing** (15 min)
- Intentar eliminar empleado con reservas activas
- Verificar error de validación
- Eliminar empleado sin reservas
- Verificar soft delete exitoso

**Resultado Esperado:** ✅
- Endpoint DELETE funcional
- Validación de reservas activas
- Soft delete correcto
- GAP #3: 100% ✅

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de dar por completado, verificar:

### **GAP #1: Validación en Búsqueda**
- [ ] API de búsqueda valida contra PolicyValidationService
- [ ] Resultados incluyen campo `policyValidation`
- [ ] Badges visibles en página de resultados
- [ ] Alertas se muestran cuando se excede política
- [ ] Resultados ordenados (primero dentro de política)
- [ ] Testing con política estricta

### **GAP #2: Centro de Costo en Reservas**
- [ ] API acepta `cost_center_id`
- [ ] Componente CostCenterSelector creado
- [ ] Selector integrado en checkout
- [ ] Auto-asignación por departamento funciona
- [ ] Centro de costo visible en detalles de reserva
- [ ] Query de booking hace JOIN con cost_centers

### **GAP #3: API DELETE Empleado**
- [ ] Endpoint DELETE implementado
- [ ] Validación de reservas activas
- [ ] Soft delete de user y tenant_users
- [ ] UI actualizada para usar DELETE
- [ ] Testing de casos de error

---

## 📊 PROGRESO ESPERADO

**Antes (v2.75):**
- Sistema Corporativo: 94%
- Progreso General: 87%

**Después (v2.76):**
- Sistema Corporativo: **100%** ✅
- Progreso General: **90%** ⬆️ +3%

---

## 🎯 ENTREGABLES

Al completar este plan, se entregará:

1. ✅ **Sistema Corporativo 100% Funcional**
   - Todas las funcionalidades sin gaps
   - Listo para producción

2. ✅ **3 Archivos Modificados:**
   - `src/app/api/search/route.ts`
   - `src/app/resultados/page.tsx`
   - `src/app/api/corporate/employees/[id]/route.ts`

3. ✅ **1 Archivo Nuevo:**
   - `src/components/CostCenterSelector.tsx`

4. ✅ **Funcionalidades Agregadas:**
   - Validación de políticas en búsqueda ✨
   - Asignación de centro de costo a reservas ✨
   - API DELETE empleado consistente ✨

5. ✅ **Versión Actualizada:**
   - De v2.75 a **v2.76**

---

## 📅 TIMELINE SUGERIDO

### **Día 1 - Mañana (4 horas):**
- 09:00 - 11:00: FASE 1 - Validación en búsqueda
- 11:00 - 13:00: FASE 2 - Inicio (API + Componente)

### **Día 1 - Tarde (4 horas):**
- 14:00 - 17:00: FASE 2 - Continuación (Integración + Testing)
- 17:00 - 18:00: FASE 3 - DELETE empleado

**Total:** 8 horas (1 día de trabajo)

---

## 🚀 SIGUIENTE PASO DESPUÉS DE 100%

Una vez completado al 100%, proceder con:

1. **Documentación de Usuario** (1-2 días)
   - Guía para admins
   - Guía para managers
   - Guía para empleados
   - Videos tutoriales (opcional)

2. **Testing E2E Completo** (1 día)
   - Flujo completo de aprobación
   - Validación de políticas
   - Exportación de reportes
   - Centro de costos end-to-end

3. **Optimizaciones** (1 día)
   - Cache de consultas frecuentes
   - Lazy loading de componentes
   - Optimización de queries

4. **Deploy a Producción** (2 días)
   - Configuración de servidor
   - Variables de entorno
   - Base de datos en producción
   - Testing post-deploy
   - Dominio personalizado

**Total para Launch:** ~1 semana adicional

---

**Documento creado:** 15 de Diciembre de 2025 - 03:45 UTC
**Versión Objetivo:** v2.76
**Estado Objetivo:** Sistema Corporativo 100% ✅

---

## 📎 REFERENCIAS

- Documento de Revisión: `.same/REVISION-EXHAUSTIVA-v2.75.md`
- Plan Corporativo: `.same/PLAN-CORPORATIVOS.md`
- Todos: `.same/todos.md`
- Progreso: `.same/PROGRESO-DESARROLLO-ACTUALIZADO.md`
