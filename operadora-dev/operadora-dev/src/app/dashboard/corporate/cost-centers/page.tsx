'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { exportToExcel } from '@/utils/exportHelpers'

interface CostCenter {
  id: number
  code: string
  name: string
  description: string
  budget: number
  manager_id: number
  is_active: boolean
  total_bookings: number
  total_employees: number
  total_expenses: number
  created_at: string
}

export default function CostCentersPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCC, setEditingCC] = useState<CostCenter | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    budget: '',
    managerId: ''
  })

  useEffect(() => {
    fetchCostCenters()
  }, [])

  const fetchCostCenters = async () => {
    try {
      const res = await fetch('/api/corporate/cost-centers?tenantId=1')
      if (!res.ok) throw new Error('Error al cargar centros de costo')
      const data = await res.json()
      setCostCenters(data.data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingCC(null)
    setFormData({
      code: '',
      name: '',
      description: '',
      budget: '',
      managerId: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (cc: CostCenter) => {
    setEditingCC(cc)
    setFormData({
      code: cc.code,
      name: cc.name,
      description: cc.description || '',
      budget: cc.budget?.toString() || '',
      managerId: cc.manager_id?.toString() || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCC
        ? `/api/corporate/cost-centers/${editingCC.id}`
        : '/api/corporate/cost-centers'

      const method = editingCC ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 1,
          code: formData.code,
          name: formData.name,
          description: formData.description,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          managerId: formData.managerId ? parseInt(formData.managerId) : null
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al guardar')
      }

      toast({
        title: 'Éxito',
        description: editingCC ? 'Centro de costo actualizado' : 'Centro de costo creado'
      })

      setIsModalOpen(false)
      fetchCostCenters()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este centro de costo?')) return

    try {
      const res = await fetch(`/api/corporate/cost-centers/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al eliminar')
      }

      toast({
        title: 'Éxito',
        description: 'Centro de costo eliminado'
      })

      fetchCostCenters()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleToggleActive = async (cc: CostCenter) => {
    try {
      const res = await fetch(`/api/corporate/cost-centers/${cc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !cc.is_active
        })
      })

      if (!res.ok) throw new Error('Error al actualizar estado')

      toast({
        title: 'Éxito',
        description: `Centro de costo ${cc.is_active ? 'desactivado' : 'activado'}`
      })

      fetchCostCenters()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleExportToExcel = () => {
    const data = costCenters.map(cc => ({
      'Código': cc.code,
      'Nombre': cc.name,
      'Descripción': cc.description || 'Sin descripción',
      'Presupuesto': cc.budget ? parseFloat(cc.budget.toString()) : 0,
      'Empleados': cc.total_employees || 0,
      'Reservas': cc.total_bookings || 0,
      'Gastos': typeof cc.total_expenses === 'number' ? cc.total_expenses : parseFloat(cc.total_expenses || '0'),
      'Estado': cc.is_active ? 'Activo' : 'Inactivo'
    }))

    const success = exportToExcel(data, `CentrosCosto_${Date.now()}`, 'Centros de Costo')

    if (success) {
      toast({
        title: 'Exportado',
        description: `${costCenters.length} centros de costo exportados a Excel`
      })
    } else {
      toast({
        title: 'Error',
        description: 'No se pudo exportar',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando centros de costo...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Centros de Costo</h1>
          <p className="text-gray-600">Gestiona centros de costo para tracking de gastos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportToExcel} variant="outline">
            📊 Exportar Excel
          </Button>
          <Button onClick={openCreateModal}>
            + Nuevo Centro de Costo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Total Centros</p>
          <p className="text-3xl font-bold">{costCenters.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Activos</p>
          <p className="text-3xl font-bold text-green-600">
            {costCenters.filter(cc => cc.is_active).length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Total Reservas</p>
          <p className="text-3xl font-bold">
            {costCenters.reduce((sum, cc) => sum + (typeof cc.total_bookings === 'number' ? cc.total_bookings : parseInt(cc.total_bookings || '0')), 0)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Gasto Total</p>
          <p className="text-3xl font-bold">
            ${costCenters.reduce((sum, cc) => sum + (typeof cc.total_expenses === 'number' ? cc.total_expenses : parseFloat(cc.total_expenses || '0')), 0).toLocaleString('es-MX')}
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Presupuesto</TableHead>
                <TableHead className="text-right">Empleados</TableHead>
                <TableHead className="text-right">Reservas</TableHead>
                <TableHead className="text-right">Gastos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costCenters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No hay centros de costo. Crea el primero.
                  </TableCell>
                </TableRow>
              ) : (
                costCenters.map((cc) => (
                  <TableRow key={cc.id}>
                    <TableCell className="font-mono font-semibold">{cc.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cc.name}</p>
                        {cc.description && (
                          <p className="text-xs text-gray-500">{cc.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cc.budget ? (
                        <span className="font-medium">${parseFloat(cc.budget.toString()).toLocaleString('es-MX')}</span>
                      ) : (
                        <span className="text-gray-400">Sin presupuesto</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{cc.total_employees || 0}</TableCell>
                    <TableCell className="text-right">{cc.total_bookings || 0}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">
                        ${(typeof cc.total_expenses === 'number' ? cc.total_expenses : parseFloat(cc.total_expenses || '0')).toLocaleString('es-MX')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cc.is_active ? 'default' : 'destructive'}>
                        {cc.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">•••</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(cc)}>
                            ✏️ Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(cc)}>
                            {cc.is_active ? '🔒 Desactivar' : '✅ Activar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(cc.id)}
                            className="text-red-600"
                          >
                            🗑️ Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCC ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo'}
            </DialogTitle>
            <DialogDescription>
              {editingCC ? 'Actualiza los datos del centro de costo' : 'Completa la información del nuevo centro de costo'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="CC-001"
                required
                disabled={!!editingCC}
              />
              <p className="text-xs text-gray-500 mt-1">
                Código único del centro de costo (ej: CC-VENTAS)
              </p>
            </div>

            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Departamento de Ventas"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional del centro de costo"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="budget">Presupuesto Mensual</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="10000.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Presupuesto mensual asignado (opcional)
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCC ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
