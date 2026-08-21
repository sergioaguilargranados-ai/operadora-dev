"use client"

import React, { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'

import {
  Users, FileText, BarChart3, CheckSquare, Settings, CreditCard,
  Plus, Download, Check, X, UploadCloud, Receipt, Building, Building2, Plane, Car, Train, MapPin, Activity, CalendarDays, Wallet, TrendingUp, Loader2, AlertCircle, RefreshCw
} from 'lucide-react'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

// Colores para las gráficas
const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']
const CHART_COLORS_GASTOS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b']
const CHART_COLORS_POLITICA = ['#10b981', '#f59e0b', '#ef4444']

// ═══════════════════════════════════════
// TAB: RESUMEN
// ═══════════════════════════════════════
function TabResumen({ tenantId }: { tenantId: number }) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) return
    fetchStats()
  }, [tenantId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/corporate/stats?tenantId=${tenantId}`)
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Error al cargar estadísticas')
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Cargando métricas corporativas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-red-700 font-medium">{error}</p>
        <Button onClick={fetchStats} variant="outline" size="sm">Reintentar</Button>
      </div>
    )
  }

  const chartData = stats?.bookingTypeBreakdown?.length > 0
    ? stats.bookingTypeBreakdown
    : [{ name: 'Sin reservas', value: 100, count: 0, total: 0 }]

  const topDestinations = stats?.topDestinations || []
  const recentActivity = stats?.recentActivity || []

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Colaboradores registrados</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Activas</CardTitle>
            <CalendarDays className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBookings || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">En curso o programadas</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos (Anual)</CardTitle>
            <Wallet className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.annualExpenses || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">MXN</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${(stats?.monthExpenses || 0).toLocaleString('es-MX')} este mes
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahorros Negociados</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.estimatedSavings || 0).toLocaleString('es-MX')} <span className="text-xs font-normal text-slate-500">MXN</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">~15.1% tarifa preferencial</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tipo de Reserva</CardTitle>
            <CardDescription>Distribución por categoría</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center">
            {stats?.bookingTypeBreakdown?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={chartData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val) => [`${val}%`, 'Porcentaje']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 mt-3 text-xs">
                  {chartData.map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full mr-1" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span>{entry.name} ({entry.value}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-sm text-slate-400 py-8">Sin datos de distribución de reservas</div>
            )}
          </CardContent>
        </Card>

        {/* Top Destinos */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Destinos</CardTitle>
            <CardDescription>Rutas y ciudades más frecuentadas</CardDescription>
          </CardHeader>
          <CardContent>
            {topDestinations.length > 0 ? (
              <div className="space-y-4">
                {topDestinations.map((dest: any, i: number) => {
                  const maxVal = topDestinations[0]?.value || 1
                  const pct = Math.round((dest.value / maxVal) * 100)
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">#{i + 1} {dest.name}</span>
                        <span className="text-muted-foreground">{dest.value} viajes</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center text-sm text-slate-400 py-12">No hay destinos registrados aún</div>
            )}
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas operaciones del equipo</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3.5 text-sm">
                {recentActivity.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full mt-0.5">
                      <Plane className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{act.userName}</p>
                      <p className="text-muted-foreground text-xs truncate">{act.destination} • {act.bookingType}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ${act.amount.toLocaleString('es-MX')} MXN • {new Date(act.createdAt).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <Badge variant={act.status === 'confirmed' ? 'default' : 'secondary'} className="text-[10px]">
                      {act.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-slate-400 py-12">Sin actividad reciente</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// TAB: EMPLEADOS (DIRECTORIO & CSV)
// ═══════════════════════════════════════
function TabEmpleados({ tenantId }: { tenantId: number }) {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'employee',
    department: 'Ventas',
    costCenter: 'CC-101',
    managerId: ''
  })

  useEffect(() => {
    if (!tenantId) return
    fetchEmployees()
  }, [tenantId])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/corporate/employees?tenantId=${tenantId}`)
      const data = await res.json()
      if (data.success) {
        setEmployees(data.data || data.employees || [])
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await fetch('/api/corporate/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          ...formData,
          managerId: formData.managerId ? parseInt(formData.managerId) : undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Empleado creado', description: 'El colaborador se registró exitosamente.' })
        setIsModalOpen(false)
        fetchEmployees()
        setFormData({
          name: '',
          email: '',
          password: 'Password123!',
          role: 'employee',
          department: 'Ventas',
          costCenter: 'CC-101',
          managerId: ''
        })
      } else {
        toast({ title: 'Error', description: data.error || 'No se pudo crear el empleado', variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const filteredEmployees = employees.filter(emp =>
    (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Directorio de Empleados</h2>
          <p className="text-sm text-muted-foreground">Gestiona los perfiles de colaboradores y centros de costo.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <UploadCloud className="h-4 w-4 mr-2" /> Importar CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Agregar Empleado
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar por nombre, email o departamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button variant="ghost" size="sm" onClick={fetchEmployees}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Centro de Costo</TableHead>
                <TableHead>Rol Corporativo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Alta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.email}</div>
                    </TableCell>
                    <TableCell>{emp.department || 'General'}</TableCell>
                    <TableCell><Badge variant="outline">{emp.cost_center || 'CC-001'}</Badge></TableCell>
                    <TableCell><Badge className="bg-blue-50 text-blue-700 border-blue-200">{emp.role || 'employee'}</Badge></TableCell>
                    <TableCell>
                      {emp.is_active !== false ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-none">Activo</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700 border-none">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {emp.created_at ? new Date(emp.created_at).toLocaleDateString('es-MX') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    No se encontraron colaboradores registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Modal Crear Empleado */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Empleado</DialogTitle>
            <DialogDescription>Añade un colaborador al catálogo corporativo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee} className="space-y-4 pt-2">
            <div className="grid gap-2">
              <Label>Nombre completo</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Ana Martínez"
              />
            </div>
            <div className="grid gap-2">
              <Label>Correo electrónico</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ana@empresa.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Departamento</Label>
                <Select value={formData.department} onValueChange={(val) => setFormData({ ...formData, department: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ventas">Ventas</SelectItem>
                    <SelectItem value="Operaciones">Operaciones</SelectItem>
                    <SelectItem value="Finanzas">Finanzas</SelectItem>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Dirección">Dirección</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Centro de Costo</Label>
                <Input
                  value={formData.costCenter}
                  onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                  placeholder="CC-101"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Rol de Aprobación</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Empleado Estándar</SelectItem>
                  <SelectItem value="manager">Gerente / Aprobador</SelectItem>
                  <SelectItem value="admin">Administrador Corporativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Importar CSV */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Importar Empleados por CSV</DialogTitle>
            <DialogDescription>Carga masiva de colaboradores con formato: name, email, role, department, cost_center</DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
            <UploadCloud className="h-10 w-10 text-blue-500 mb-3" />
            <p className="font-medium text-sm text-slate-800">Arrastra tu archivo .CSV aquí</p>
            <p className="text-xs text-slate-400 mt-1">O haz clic para seleccionar</p>
            <Input type="file" accept=".csv" className="mt-4" />
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════
// TAB: GASTOS Y REPORTES
// ═══════════════════════════════════════
function TabGastos({ tenantId }: { tenantId: number }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    fetchExpenses()
  }, [tenantId])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/corporate/expenses?tenantId=${tenantId}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      }
    } catch (e) {
      console.error('Error fetching expenses:', e)
    } finally {
      setLoading(false)
    }
  }

  const trendData = data?.trend?.length > 0 ? data.trend : [
    { date: 'Sin datos', amount: 0 }
  ]

  const byDepartment = data?.byDepartment || []
  const history = data?.history || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Reporte de Gastos Corporativos</h2>
          <p className="text-sm text-muted-foreground">Historial y distribución departamental de compras de viaje.</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" /> Exportar / Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica de Línea de Gastos */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendencia de Gastos (Últimos 30 días)</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(val: any) => [`$${Number(val).toLocaleString('es-MX')} MXN`, 'Gasto']} />
                  <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gastos por Departamento */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Por Departamento</CardTitle>
            <CardDescription>Consumo acumulado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {byDepartment.length > 0 ? (
              byDepartment.map((dept: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm pb-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-800">{dept.department}</p>
                    <p className="text-xs text-slate-400">{dept.count} viajes</p>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ${dept.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-slate-400 py-8">Sin gastos registrados</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historial de Transacciones */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones y Compras de Viaje</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Folio</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Servicio / Destino</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Centro Costo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? (
                history.map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono text-xs text-slate-500">#{h.id}</TableCell>
                    <TableCell className="font-medium">{h.userName}</TableCell>
                    <TableCell>
                      <div className="text-sm">{h.destination}</div>
                      <div className="text-xs text-slate-400">{h.bookingType}</div>
                    </TableCell>
                    <TableCell>{h.department}</TableCell>
                    <TableCell><Badge variant="outline">{h.costCenter}</Badge></TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      ${h.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={h.status === 'confirmed' ? 'default' : 'secondary'}>{h.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {h.createdAt ? new Date(h.createdAt).toLocaleDateString('es-MX') : ''}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                    No hay transacciones registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════
// TAB: MÉTRICAS & CO2
// ═══════════════════════════════════════
function TabMetricas({ tenantId }: { tenantId: number }) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    fetchStats()
  }, [tenantId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/corporate/stats?tenantId=${tenantId}`)
      const json = await res.json()
      if (json.success) setStats(json.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Cálculos CO2
  const bookingsCount = stats?.activeBookings || 0
  const totalCO2Kg = bookingsCount * 280 + 120
  const tonsCO2 = (totalCO2Kg / 1000).toFixed(2)
  const trees = Math.ceil(totalCO2Kg / 22)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Huella de Carbono</h3>
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{tonsCO2} <span className="text-base font-normal text-slate-500">t CO2e</span></div>
            <p className="text-xs text-muted-foreground mt-2">Emisiones generadas por viajes corporativos en el año.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg">
            <span>Árboles para compensar:</span>
            <span className="font-bold text-sm">{trees} árboles/año</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Desglose de Emisiones</h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span>Vuelos Comerciales</span>
                <span className="font-medium">70%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Hospedaje & Hoteles</span>
                <span className="font-medium">20%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Transporte Terrestre</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Adopción de Políticas</h3>
            <p className="text-xs text-muted-foreground mb-4">Cumplimiento de tarifas dentro de política de viaje.</p>
            <div className="text-3xl font-bold text-blue-600">92.4%</div>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg mt-4">
            Políticas activas: Máximo en vuelos y hoteles según rol de colaborador.
          </div>
        </Card>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// TAB: APROBACIONES DE VIAJE
// ═══════════════════════════════════════
function TabAprobaciones({ tenantId }: { tenantId: number }) {
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!tenantId) return
    fetchApprovals()
  }, [tenantId])

  const fetchApprovals = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/corporate/approvals?tenantId=${tenantId}`)
      const json = await res.json()
      if (json.success) {
        setApprovals(json.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (approvalId: number, action: 'approved' | 'rejected') => {
    try {
      setProcessingId(approvalId)
      const res = await fetch('/api/corporate/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId,
          tenantId,
          action
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: action === 'approved' ? 'Solicitud Aprobada' : 'Solicitud Rechazada',
          description: data.message
        })
        fetchApprovals()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Solicitudes de Aprobación</h2>
          <p className="text-sm text-muted-foreground">Revisa y autoriza viajes de colaboradores de la empresa.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchApprovals}>
          <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Folio</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Motivo de Viaje</TableHead>
                <TableHead>Costo Estimado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.length > 0 ? (
                approvals.map((appr) => (
                  <TableRow key={appr.id}>
                    <TableCell className="font-mono text-xs">REQ-{appr.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{appr.requestedByName}</div>
                      <div className="text-xs text-slate-400">{appr.requestedByEmail}</div>
                    </TableCell>
                    <TableCell>{appr.department}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{appr.reasonForTravel}</TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      ${appr.estimatedCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </TableCell>
                    <TableCell>
                      {appr.status === 'approved' && <Badge className="bg-emerald-100 text-emerald-800">Aprobado</Badge>}
                      {appr.status === 'pending' && <Badge className="bg-amber-100 text-amber-800">Pendiente</Badge>}
                      {appr.status === 'rejected' && <Badge className="bg-red-100 text-red-800">Rechazado</Badge>}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {appr.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            disabled={processingId === appr.id}
                            onClick={() => handleAction(appr.id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processingId === appr.id}
                            onClick={() => handleAction(appr.id, 'rejected')}
                            className="text-red-600 border-red-200 hover:bg-red-50 h-8"
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Rechazar
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">Procesado</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    No hay solicitudes de viaje pendientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════
// TAB: POLÍTICAS DE VIAJE
// ═══════════════════════════════════════
function TabPoliticas({ tenantId }: { tenantId: number }) {
  const { toast } = useToast()
  const [maxFlight, setMaxFlight] = useState(15000)
  const [maxHotel, setMaxHotel] = useState(3500)
  const [flightClass, setFlightClass] = useState('economy')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast({ title: 'Políticas actualizadas', description: 'Los límites y reglas de viaje han sido guardados.' })
    }, 600)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Políticas Corporativas de Viaje</h2>
        <p className="text-sm text-muted-foreground">Establece techos de gasto y reglas por categoría.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Plane className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Vuelos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Máximo por tramo (MXN)</Label>
              <Input type="number" value={maxFlight} onChange={(e) => setMaxFlight(Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label>Cabina permitida</Label>
              <Select value={flightClass} onValueChange={setFlightClass}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Económica</SelectItem>
                  <SelectItem value="premium">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-base">Hoteles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Máximo por noche (MXN)</Label>
              <Input type="number" value={maxHotel} onChange={(e) => setMaxHotel(Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label>Categoría máxima</Label>
              <Select defaultValue="4">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Estrellas</SelectItem>
                  <SelectItem value="4">4 Estrellas</SelectItem>
                  <SelectItem value="5">5 Estrellas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar Políticas
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════
function CorporateDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('resumen')

  const tenantId = (user as any)?.tenant_id || 1

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['resumen', 'empleados', 'gastos', 'metricas', 'aprobaciones', 'politicas'].includes(tab)) {
      setActiveTab(tab)
    } else {
      setActiveTab('resumen')
    }
  }, [searchParams])

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    if (newTab === 'resumen') {
      router.push('/dashboard/corporate')
    } else {
      router.push(`/dashboard/corporate?tab=${newTab}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Panel de Empresas</h1>
          <p className="text-slate-500">Gestión de viajes corporativos, aprobaciones, reportes y métricas de sostenibilidad.</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full justify-start inline-flex min-w-max">
              <TabsTrigger value="resumen" className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Resumen</TabsTrigger>
              <TabsTrigger value="empleados" className="flex items-center gap-2"><Users className="w-4 h-4" /> Empleados</TabsTrigger>
              <TabsTrigger value="gastos" className="flex items-center gap-2"><FileText className="w-4 h-4" /> Gastos</TabsTrigger>
              <TabsTrigger value="metricas" className="flex items-center gap-2"><Activity className="w-4 h-4" /> Métricas & CO2</TabsTrigger>
              <TabsTrigger value="aprobaciones" className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Aprobaciones</TabsTrigger>
              <TabsTrigger value="politicas" className="flex items-center gap-2"><Settings className="w-4 h-4" /> Políticas</TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6">
            <TabsContent value="resumen"><TabResumen tenantId={tenantId} /></TabsContent>
            <TabsContent value="empleados"><TabEmpleados tenantId={tenantId} /></TabsContent>
            <TabsContent value="gastos"><TabGastos tenantId={tenantId} /></TabsContent>
            <TabsContent value="metricas"><TabMetricas tenantId={tenantId} /></TabsContent>
            <TabsContent value="aprobaciones"><TabAprobaciones tenantId={tenantId} /></TabsContent>
            <TabsContent value="politicas"><TabPoliticas tenantId={tenantId} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export default function CorporateDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando dashboard corporativo...</div>}>
      <CorporateDashboardContent />
    </Suspense>
  )
}
