'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/PageHeader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

interface TravelPolicy {
  id: number
  tenant_id: number
  max_flight_class: string
  max_hotel_price: number
  min_advance_days: number
  requires_approval: boolean
  created_at: string
}

export default function PoliciesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [policy, setPolicy] = useState<TravelPolicy | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    maxFlightClass: 'economy',
    maxHotelPrice: 2000,
    minAdvanceDays: 7,
    requiresApproval: true
  })

  // Preview state
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchPolicy()
  }, [])

  const fetchPolicy = async () => {
    try {
      const res = await fetch('/api/corporate/policies')
      if (res.ok) {
        const data = await res.json()
        if (data.policy) {
          setPolicy(data.policy)
          setFormData({
            maxFlightClass: data.policy.max_flight_class,
            maxHotelPrice: data.policy.max_hotel_price,
            minAdvanceDays: data.policy.min_advance_days,
            requiresApproval: data.policy.requires_approval
          })
        }
      }
    } catch (error: any) {
      console.error('Error loading policy:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/corporate/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Error al guardar política')
      }

      const data = await res.json()
      setPolicy(data.policy)

      toast({
        title: 'Política guardada',
        description: 'La política de viaje ha sido actualizada exitosamente'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const getImpactPreview = () => {
    const impacts = []

    // Flight class impact
    if (formData.maxFlightClass === 'economy') {
      impacts.push({
        type: 'restriction',
        text: 'Solo se permitirán vuelos en clase Economy',
        icon: '✈️'
      })
    } else if (formData.maxFlightClass === 'business') {
      impacts.push({
        type: 'allowed',
        text: 'Se permitirán vuelos hasta clase Business',
        icon: '✈️'
      })
    } else {
      impacts.push({
        type: 'allowed',
        text: 'Se permitirán vuelos en todas las clases',
        icon: '✈️'
      })
    }

    // Hotel price impact
    if (formData.maxHotelPrice <= 1000) {
      impacts.push({
        type: 'restriction',
        text: `Hoteles económicos únicamente (máx $${formData.maxHotelPrice}/noche)`,
        icon: '🏨'
      })
    } else if (formData.maxHotelPrice <= 2500) {
      impacts.push({
        type: 'allowed',
        text: `Hoteles de rango medio (máx $${formData.maxHotelPrice}/noche)`,
        icon: '🏨'
      })
    } else {
      impacts.push({
        type: 'allowed',
        text: `Hoteles premium permitidos (máx $${formData.maxHotelPrice}/noche)`,
        icon: '🏨'
      })
    }

    // Advance days impact
    if (formData.minAdvanceDays >= 14) {
      impacts.push({
        type: 'restriction',
        text: `Reservas con ${formData.minAdvanceDays}+ días de anticipación (planificación extendida)`,
        icon: '📅'
      })
    } else if (formData.minAdvanceDays >= 7) {
      impacts.push({
        type: 'allowed',
        text: `Reservas con ${formData.minAdvanceDays}+ días de anticipación (estándar)`,
        icon: '📅'
      })
    } else {
      impacts.push({
        type: 'flexible',
        text: `Reservas con solo ${formData.minAdvanceDays} días de anticipación (flexible)`,
        icon: '📅'
      })
    }

    // Approval impact
    if (formData.requiresApproval) {
      impacts.push({
        type: 'warning',
        text: 'Todas las reservas requerirán aprobación de manager',
        icon: '✅'
      })
    } else {
      impacts.push({
        type: 'flexible',
        text: 'Reservas automáticas sin aprobación (dentro de límites)',
        icon: '⚡'
      })
    }

    return impacts
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando políticas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Políticas de Viaje</h1>
        <p className="text-gray-600">
          Configura los límites y reglas para las reservas corporativas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Flight Class */}
              <div>
                <Label htmlFor="maxFlightClass" className="text-base font-semibold mb-3 block">
                  Clase de Vuelo Máxima
                </Label>
                <Select
                  value={formData.maxFlightClass}
                  onValueChange={(val) => setFormData({ ...formData, maxFlightClass: val })}
                >
                  <SelectTrigger id="maxFlightClass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-2">
                  Los empleados solo podrán reservar vuelos hasta esta clase
                </p>
              </div>

              {/* Hotel Price */}
              <div>
                <Label htmlFor="maxHotelPrice" className="text-base font-semibold mb-3 block">
                  Precio Máximo de Hotel (por noche)
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      id="maxHotelPrice"
                      type="number"
                      min="500"
                      max="10000"
                      step="100"
                      value={formData.maxHotelPrice}
                      onChange={(e) => setFormData({ ...formData, maxHotelPrice: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <span className="text-2xl font-bold text-gray-700">
                    ${formData.maxHotelPrice.toLocaleString('es-MX')}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={formData.maxHotelPrice}
                  onChange={(e) => setFormData({ ...formData, maxHotelPrice: parseInt(e.target.value) })}
                  className="w-full mt-3"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$500</span>
                  <span>$5,000</span>
                </div>
              </div>

              {/* Advance Days */}
              <div>
                <Label htmlFor="minAdvanceDays" className="text-base font-semibold mb-3 block">
                  Anticipación Mínima (días)
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      id="minAdvanceDays"
                      type="number"
                      min="1"
                      max="90"
                      value={formData.minAdvanceDays}
                      onChange={(e) => setFormData({ ...formData, minAdvanceDays: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <span className="text-2xl font-bold text-gray-700">
                    {formData.minAdvanceDays} días
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={formData.minAdvanceDays}
                  onChange={(e) => setFormData({ ...formData, minAdvanceDays: parseInt(e.target.value) })}
                  className="w-full mt-3"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 día</span>
                  <span>30 días</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Tiempo mínimo entre la reserva y la fecha de viaje
                </p>
              </div>

              {/* Requires Approval */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requiresApproval" className="text-base font-semibold block">
                      Requiere Aprobación
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Todas las reservas necesitarán aprobación de un manager
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, requiresApproval: !formData.requiresApproval })}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      formData.requiresApproval ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        formData.requiresApproval ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Guardando...' : policy ? 'Actualizar Política' : 'Crear Política'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Ocultar' : 'Ver'} Impacto
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            <h3 className="text-lg font-semibold mb-4">Impacto de la Política</h3>

            <div className="space-y-3">
              {getImpactPreview().map((impact, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-3 rounded-lg border-l-4 ${
                    impact.type === 'restriction'
                      ? 'bg-red-50 border-red-500'
                      : impact.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-500'
                      : impact.type === 'allowed'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{impact.icon}</span>
                    <p className="text-sm flex-1">{impact.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-semibold mb-3">Nivel de Restricción</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Vuelos:</span>
                  <span className="font-medium">
                    {formData.maxFlightClass === 'economy' ? 'Estricto' : formData.maxFlightClass === 'business' ? 'Moderado' : 'Flexible'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hoteles:</span>
                  <span className="font-medium">
                    {formData.maxHotelPrice <= 1500 ? 'Estricto' : formData.maxHotelPrice <= 3000 ? 'Moderado' : 'Flexible'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Anticipación:</span>
                  <span className="font-medium">
                    {formData.minAdvanceDays >= 14 ? 'Estricto' : formData.minAdvanceDays >= 7 ? 'Moderado' : 'Flexible'}
                  </span>
                </div>
              </div>
            </div>

            {/* Savings Estimate */}
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💰</span>
                <h4 className="font-semibold">Ahorro Estimado</h4>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {formData.maxFlightClass === 'economy' && formData.maxHotelPrice <= 2000 ? '30-40%' :
                 formData.maxFlightClass === 'business' || formData.maxHotelPrice <= 3000 ? '15-25%' : '5-15%'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                vs. viajes sin política
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold">Control de Gastos</h3>
          </div>
          <p className="text-sm text-gray-600">
            Las políticas ayudan a mantener los gastos de viaje dentro del presupuesto corporativo
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="font-semibold">Cumplimiento</h3>
          </div>
          <p className="text-sm text-gray-600">
            Garantiza que todos los empleados sigan las mismas reglas de viaje
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold">Automatización</h3>
          </div>
          <p className="text-sm text-gray-600">
            Las alertas y aprobaciones se gestionan automáticamente según la política
          </p>
        </Card>
      </div>
    </div>
  )
}
