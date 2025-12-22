"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/PageHeader'
import {
  Briefcase,
  DollarSign,
  Clock,
  TrendingUp,
  MapPin,
  Users,
  FileText,
  AlertCircle,
  Loader2,
  Download,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface CorporateStats {
  totalBookings: number
  totalExpenses: number
  pendingApprovals: number
  policyCompliance: number
  topDestinations: Array<{ destination: string; count: number }>
  topTravelers: Array<{ name: string; trips: number; expenses: number }>
  expensesByDepartment: Array<{ department: string; total: number }>
}

const COLORS = ['#0066FF', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function CorporateDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<CorporateStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month') // month, quarter, year

  // Modal personalizar periodo
  const [showPeriodModal, setShowPeriodModal] = useState(false)
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchStats()
  }, [isAuthenticated, dateRange])

  const fetchStats = async () => {
    try {
      setLoading(true)

      // TODO: Obtener tenantId del usuario autenticado
      const tenantId = 1 // Temporal

      const res = await fetch(`/api/corporate/stats?tenantId=${tenantId}`)
      const data = await res.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handlePersonalizarPeriodo = () => {
    setShowPeriodModal(true)
  }

  const handleAplicarPeriodo = async () => {
    if (!customDateFrom || !customDateTo) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar fecha inicio y fin"
      })
      return
    }

    try {
      setLoading(true)
      const tenantId = 1
      const res = await fetch(`/api/corporate/stats?tenantId=${tenantId}&dateFrom=${customDateFrom}&dateTo=${customDateTo}`)
      const data = await res.json()

      if (data.success) {
        setStats(data.data)
        setShowPeriodModal(false)
        toast({
          title: "Periodo actualizado",
          description: `Mostrando datos del ${customDateFrom} al ${customDateTo}`
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el periodo"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportarReporte = () => {
    if (!stats) return

    const reportData = {
      fecha_generacion: new Date().toLocaleString('es-MX'),
      total_reservas: stats.totalBookings,
      total_gastos: formatCurrency(stats.totalExpenses),
      aprobaciones_pendientes: stats.pendingApprovals,
      cumplimiento_politicas: `${stats.policyCompliance}%`
    }

    const jsonStr = JSON.stringify(reportData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-corporativo-${Date.now()}.json`
    a.click()

    toast({
      title: "Reporte exportado",
      description: "El reporte se descargó exitosamente"
    })
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Botón Volver */}
        <PageHeader showBackButton={true} backButtonHref="/dashboard" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard Corporativo</h1>
            <p className="text-muted-foreground">
              Resumen de viajes y gastos de tu organización
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={handlePersonalizarPeriodo}>
              <Calendar className="w-4 h-4" />
              Personalizar Período
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500" onClick={handleExportarReporte}>
              <Download className="w-4 h-4" />
              Exportar Reporte
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="secondary">Este mes</Badge>
              </div>
              <h3 className="text-3xl font-bold mb-1">{stats?.totalBookings || 0}</h3>
              <p className="text-sm text-muted-foreground">Reservas Totales</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12% vs mes anterior</span>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <Badge variant="secondary">Total</Badge>
              </div>
              <h3 className="text-3xl font-bold mb-1">
                {formatCurrency(stats?.totalExpenses || 0)}
              </h3>
              <p className="text-sm text-muted-foreground">Gastos en Viajes</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Promedio por viaje: {formatCurrency((stats?.totalExpenses || 0) / (stats?.totalBookings || 1))}</span>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Pendientes
                </Badge>
              </div>
              <h3 className="text-3xl font-bold mb-1">{stats?.pendingApprovals || 0}</h3>
              <p className="text-sm text-muted-foreground">Aprobaciones Pendientes</p>
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/approvals')}
                >
                  Ver Solicitudes
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <Badge
                  variant="secondary"
                  className={
                    (stats?.policyCompliance || 0) >= 90
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {stats?.policyCompliance || 0}%
                </Badge>
              </div>
              <h3 className="text-3xl font-bold mb-1">{stats?.policyCompliance || 0}%</h3>
              <p className="text-sm text-muted-foreground">Cumplimiento de Políticas</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats?.policyCompliance || 0}%` }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gastos por Departamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gastos por Departamento
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.expensesByDepartment || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="total" fill="#0066FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Top Destinos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Top Destinos
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.topDestinations || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.destination} (${entry.count})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(stats?.topDestinations || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Top Travelers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Empleados Más Viajeros
            </h3>
            <div className="space-y-4">
              {(stats?.topTravelers || []).map((traveler, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{traveler.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {traveler.trips} viajes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(traveler.expenses)}</p>
                    <p className="text-sm text-muted-foreground">Gasto total</p>
                  </div>
                </div>
              ))}

              {(!stats?.topTravelers || stats.topTravelers.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de viajeros en este período
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modal Personalizar Período */}
      <Dialog open={showPeriodModal} onOpenChange={setShowPeriodModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personalizar Período</DialogTitle>
            <DialogDescription>
              Selecciona el rango de fechas para visualizar las estadísticas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="date-from">Fecha Inicio</Label>
              <Input
                id="date-from"
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="date-to">Fecha Fin</Label>
              <Input
                id="date-to"
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPeriodModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAplicarPeriodo}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
