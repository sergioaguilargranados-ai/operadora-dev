'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface CostCenter {
  id: number
  code: string
  name: string
  description: string | null
  budget: number | null
  is_active: boolean
}

interface CostCenterSelectorProps {
  value: string
  onChange: (value: string) => void
  userDepartment?: string
  required?: boolean
  label?: string
  placeholder?: string
  tenantId?: number
}

export function CostCenterSelector({
  value,
  onChange,
  userDepartment,
  required = false,
  label = 'Centro de Costo',
  placeholder = 'Seleccionar centro de costo',
  tenantId = 1
}: CostCenterSelectorProps) {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCostCenters()
  }, [tenantId])

  const fetchCostCenters = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/corporate/cost-centers?tenantId=${tenantId}`)

      if (!res.ok) {
        throw new Error('Error al cargar centros de costo')
      }

      const data = await res.json()
      const activeCCs = data.data?.filter((cc: CostCenter) => cc.is_active) || []
      setCostCenters(activeCCs)

      // Auto-asignar según departamento del usuario si no hay valor seleccionado
      if (userDepartment && !value && activeCCs.length > 0) {
        const autoCC = activeCCs.find((cc: CostCenter) =>
          cc.name.toLowerCase().includes(userDepartment.toLowerCase()) ||
          cc.code.toLowerCase().includes(userDepartment.toLowerCase())
        )

        if (autoCC) {
          console.log(`✅ Auto-assigned cost center: ${autoCC.code} - ${autoCC.name}`)
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
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={loading}
        required={required}
      >
        <SelectTrigger id="costCenter">
          <SelectValue placeholder={loading ? "Cargando..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Sin asignar</SelectItem>
          {costCenters.map((cc) => (
            <SelectItem key={cc.id} value={cc.id.toString()}>
              {cc.code} - {cc.name}
              {cc.budget && (
                <span className="text-xs text-muted-foreground ml-2">
                  (${cc.budget.toLocaleString('es-MX')})
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {required
          ? 'Asigna esta reserva a un centro de costo para tracking de gastos'
          : 'Opcional: Asigna a un centro de costo para mejor control de presupuesto'
        }
      </p>
      {userDepartment && value && (
        <p className="text-xs text-green-600">
          ✓ Auto-asignado según tu departamento: {userDepartment}
        </p>
      )}
    </div>
  )
}
