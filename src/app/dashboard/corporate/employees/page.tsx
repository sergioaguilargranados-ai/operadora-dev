'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { exportToExcel } from '@/utils/exportHelpers'

interface Employee {
  id: number
  name: string
  email: string
  role: string
  department: string
  cost_center: string
  manager_id: number | null
  is_active: boolean
  created_at: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterRole, setFilterRole] = useState('all')
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    costCenter: '',
    managerId: ''
  })

  // CSV state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [employees, searchTerm, filterDepartment, filterRole])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/corporate/employees')
      if (!res.ok) throw new Error('Error al cargar empleados')
      const data = await res.json()
      setEmployees(data.employees || [])
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

  const filterEmployees = () => {
    let filtered = employees

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === filterDepartment)
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(emp => emp.role === filterRole)
    }

    setFilteredEmployees(filtered)
  }

  const openCreateModal = () => {
    setEditingEmployee(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: '',
      costCenter: '',
      managerId: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '',
      role: employee.role,
      department: employee.department,
      costCenter: employee.cost_center,
      managerId: employee.manager_id?.toString() || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingEmployee
        ? `/api/corporate/employees/${editingEmployee.id}`
        : '/api/corporate/employees'

      const method = editingEmployee ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          role: formData.role,
          department: formData.department,
          costCenter: formData.costCenter,
          managerId: formData.managerId ? parseInt(formData.managerId) : undefined
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Error al guardar empleado')
      }

      toast({
        title: 'Éxito',
        description: editingEmployee ? 'Empleado actualizado' : 'Empleado creado'
      })

      setIsModalOpen(false)
      fetchEmployees()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este empleado? Esta acción no se puede deshacer.')) return

    try {
      const res = await fetch(`/api/corporate/employees/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 1 // TODO: Get from auth context
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar empleado')
      }

      toast({
        title: 'Éxito',
        description: data.message || 'Empleado eliminado exitosamente'
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

  const handleToggleActive = async (employee: Employee) => {
    try {
      const res = await fetch(`/api/corporate/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 1, // TODO: Get from auth context
          isActive: !employee.is_active
        })
      })

      if (!res.ok) throw new Error('Error al actualizar estado')

      toast({
        title: 'Éxito',
        description: `Empleado ${employee.is_active ? 'desactivado' : 'activado'}`
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

  const handleCSVDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
    } else {
      toast({
        title: 'Error',
        description: 'Solo se permiten archivos CSV',
        variant: 'destructive'
      })
    }
  }

  const handleCSVSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCsvFile(file)
    }
  }

  const handleCSVImport = async () => {
    if (!csvFile) return

    try {
      const formData = new FormData()
      formData.append('file', csvFile)

      const res = await fetch('/api/corporate/employees/import', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Error al importar empleados')

      const result = await res.json()

      toast({
        title: 'Importación completa',
        description: `${result.success} empleados importados. ${result.errors.length} errores.`
      })

      setIsImportModalOpen(false)
      setCsvFile(null)
      fetchEmployees()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))]
  const roles = [...new Set(employees.map(e => e.role).filter(Boolean))]

  const handleExportToExcel = () => {
    const data = filteredEmployees.map(emp => ({
      'Nombre': emp.name,
      'Email': emp.email,
      'Departamento': emp.department || 'Sin departamento',
      'Rol': emp.role,
      'Centro Costo': emp.cost_center || 'Sin asignar',
      'Estado': emp.is_active ? 'Activo' : 'Inactivo',
      'Fecha Creación': new Date(emp.created_at).toLocaleDateString('es-MX')
    }))

    const success = exportToExcel(data, `Empleados_${Date.now()}`, 'Empleados')

    if (success) {
      toast({
        title: 'Exportado',
        description: `${filteredEmployees.length} empleados exportados a Excel`
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
            <p className="text-gray-600">Cargando empleados...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Empleados</h1>
        <p className="text-gray-600">Administra empleados, departamentos y permisos</p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />

          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {roles.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExportToExcel} variant="outline">
            📊 Exportar Excel
          </Button>
          <Button onClick={() => setIsImportModalOpen(true)} variant="outline">
            📥 Importar CSV
          </Button>
          <Button onClick={openCreateModal}>
            + Agregar Empleado
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Centro Costo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No se encontraron empleados
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.department || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                        {employee.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.cost_center || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={employee.is_active ? 'default' : 'destructive'}>
                        {employee.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">•••</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(employee)}>
                            ✏️ Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(employee)}>
                            {employee.is_active ? '🔒 Desactivar' : '✅ Activar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(employee.id)}
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

      {/* Employee Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee ? 'Actualiza la información del empleado' : 'Completa los datos del nuevo empleado'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!editingEmployee}
              />
            </div>

            {!editingEmployee && (
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="role">Rol</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="travel_manager">Travel Manager</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Empleado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="costCenter">Centro de Costo</Label>
              <Input
                id="costCenter"
                value={formData.costCenter}
                onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="managerId">Manager (ID)</Label>
              <Select
                value={formData.managerId}
                onValueChange={(val) => setFormData({ ...formData, managerId: val })}
              >
                <SelectTrigger id="managerId">
                  <SelectValue placeholder="Sin manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin manager</SelectItem>
                  {employees
                    .filter(e => e.role === 'manager' || e.role === 'admin')
                    .map(manager => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        {manager.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingEmployee ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar Empleados desde CSV</DialogTitle>
            <DialogDescription>
              Arrastra un archivo CSV o haz clic para seleccionar
            </DialogDescription>
          </DialogHeader>

          <div
            onDrop={handleCSVDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            {csvFile ? (
              <div>
                <p className="text-green-600 font-medium">📄 {csvFile.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(csvFile.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setCsvFile(null)}
                >
                  Cambiar archivo
                </Button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">📁</div>
                <p className="text-gray-600 mb-2">
                  Arrastra tu archivo CSV aquí
                </p>
                <p className="text-sm text-gray-500 mb-4">o</p>
                <label htmlFor="csv-upload">
                  <Button type="button" variant="outline" asChild>
                    <span>Seleccionar archivo</span>
                  </Button>
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCSVSelect}
                />
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Formato esperado del CSV:</p>
            <code className="text-xs bg-white px-2 py-1 rounded block">
              name,email,role,department,cost_center,manager_email
            </code>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCSVImport} disabled={!csvFile}>
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
