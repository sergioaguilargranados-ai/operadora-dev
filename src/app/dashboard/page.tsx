"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  DollarSign,
  CreditCard,
  Users,
  TrendingUp,
  TrendingDown,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { ReceivablesChart, PayablesChart, CommissionsChart } from '@/components/charts/FinancialCharts'
import PDFService from '@/services/PDFService'
import ExcelService from '@/services/ExcelService'
import { useToast } from '@/hooks/use-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    invoices: null,
    receivables: null,
    payables: null,
    commissions: null
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadDashboardData()
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')

      // Cargar estadísticas en paralelo
      const [invoicesRes, receivablesRes, payablesRes, commissionsRes] = await Promise.all([
        fetch('/api/invoices', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null),
        fetch('/api/accounts-receivable?action=stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null),
        fetch('/api/accounts-payable?action=stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null),
        fetch('/api/commissions?action=stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null)
      ])

      const statsData = {
        invoices: invoicesRes?.ok ? await invoicesRes.json() : null,
        receivables: receivablesRes?.ok ? await receivablesRes.json() : null,
        payables: payablesRes?.ok ? await payablesRes.json() : null,
        commissions: commissionsRes?.ok ? await commissionsRes.json() : null
      }

      setStats(statsData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReceivables = async (format: 'pdf' | 'excel') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/accounts-receivable', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()

        if (format === 'pdf') {
          const reportData = {
            reportType: 'receivables' as const,
            dateRange: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX'),
              end: new Date().toLocaleDateString('es-MX')
            },
            data: data.data || [],
            summary: stats.receivables?.data || {}
          }
          const pdf = PDFService.generateFinancialReport(reportData)
          PDFService.downloadPDF(pdf, `cuentas_por_cobrar_${Date.now()}.pdf`)
        } else {
          ExcelService.exportReceivables(data.data || [])
        }

        toast({
          title: 'Reporte exportado',
          description: `Se ha descargado el reporte en formato ${format.toUpperCase()}`
        })
      }
    } catch (error) {
      console.error('Error exporting:', error)
      toast({
        title: 'Error',
        description: 'No se pudo exportar el reporte',
        variant: 'destructive'
      })
    }
  }

  const handleExportPayables = async (format: 'pdf' | 'excel') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/accounts-payable', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()

        if (format === 'pdf') {
          const reportData = {
            reportType: 'payables' as const,
            dateRange: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX'),
              end: new Date().toLocaleDateString('es-MX')
            },
            data: data.data || [],
            summary: stats.payables?.data || {}
          }
          const pdf = PDFService.generateFinancialReport(reportData)
          PDFService.downloadPDF(pdf, `cuentas_por_pagar_${Date.now()}.pdf`)
        } else {
          ExcelService.exportPayables(data.data || [])
        }

        toast({
          title: 'Reporte exportado',
          description: `Se ha descargado el reporte en formato ${format.toUpperCase()}`
        })
      }
    } catch (error) {
      console.error('Error exporting:', error)
      toast({
        title: 'Error',
        description: 'No se pudo exportar el reporte',
        variant: 'destructive'
      })
    }
  }

  const handleExportCommissions = async (format: 'pdf' | 'excel') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/commissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()

        if (format === 'pdf') {
          const reportData = {
            reportType: 'commissions' as const,
            dateRange: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX'),
              end: new Date().toLocaleDateString('es-MX')
            },
            data: data.data || [],
            summary: stats.commissions?.data || {}
          }
          const pdf = PDFService.generateFinancialReport(reportData)
          PDFService.downloadPDF(pdf, `comisiones_${Date.now()}.pdf`)
        } else {
          ExcelService.exportCommissions(data.data || [])
        }

        toast({
          title: 'Reporte exportado',
          description: `Se ha descargado el reporte en formato ${format.toUpperCase()}`
        })
      }
    } catch (error) {
      console.error('Error exporting:', error)
      toast({
        title: 'Error',
        description: 'No se pudo exportar el reporte',
        variant: 'destructive'
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Financiero</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {user?.name}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Ir al inicio
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Facturas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 border-none shadow-medium hover:shadow-hard transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Facturas Emitidas
              </h3>
              <p className="text-3xl font-bold mb-2">
                {stats.invoices?.total || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </Card>
          </motion.div>

          {/* Cuentas por Cobrar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 border-none shadow-medium hover:shadow-hard transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Por Cobrar
              </h3>
              <p className="text-3xl font-bold mb-2">
                {formatCurrency(stats.receivables?.data?.monto_pendiente || 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.receivables?.data?.pendientes || 0} cuentas pendientes
              </p>
            </Card>
          </motion.div>

          {/* Cuentas por Pagar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 border-none shadow-medium hover:shadow-hard transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-red-600" />
                </div>
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Por Pagar
              </h3>
              <p className="text-3xl font-bold mb-2">
                {formatCurrency(stats.payables?.data?.monto_pendiente || 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.payables?.data?.pendientes || 0} cuentas pendientes
              </p>
            </Card>
          </motion.div>

          {/* Comisiones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 border-none shadow-medium hover:shadow-hard transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Comisiones Pendientes
              </h3>
              <p className="text-3xl font-bold mb-2">
                {formatCurrency(stats.commissions?.data?.monto_pendiente || 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.commissions?.data?.pendientes || 0} por pagar
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Tabs con detalles */}
        <Tabs defaultValue="receivables" className="w-full">
          <TabsList className="mb-6 bg-white shadow-soft p-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="receivables" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Cuentas por Cobrar
            </TabsTrigger>
            <TabsTrigger value="payables" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Cuentas por Pagar
            </TabsTrigger>
            <TabsTrigger value="commissions" className="gap-2">
              <Users className="w-4 h-4" />
              Comisiones
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="w-4 h-4" />
              Facturas
            </TabsTrigger>
          </TabsList>

          {/* Cuentas por Cobrar */}
          <TabsContent value="receivables">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="p-6 border-none shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cobrado</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(stats.receivables?.data?.monto_cobrado || 0)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.receivables?.data?.pagadas || 0} cuentas pagadas
                </p>
              </Card>

              <Card className="p-6 border-none shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pendiente</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(stats.receivables?.data?.monto_pendiente || 0)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.receivables?.data?.pendientes || 0} cuentas activas
                </p>
              </Card>

              <Card className="p-6 border-none shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vencido</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(stats.receivables?.data?.monto_vencido || 0)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.receivables?.data?.vencidas || 0} cuentas vencidas
                </p>
              </Card>
            </div>

            {/* Gráfica */}
            {stats.receivables?.data && (
              <Card className="p-6 border-none shadow-soft mb-6">
                <h3 className="text-lg font-semibold mb-4">Distribución de Cuentas</h3>
                <ReceivablesChart data={stats.receivables.data} />
              </Card>
            )}

            <Card className="p-6 border-none shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Acciones Rápidas</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleExportReceivables('pdf')}
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleExportReceivables('excel')}
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start">
                  Ver cuentas vencidas
                </Button>
                <Button variant="outline" className="justify-start">
                  Enviar recordatorios
                </Button>
                <Button variant="outline" className="justify-start">
                  Nueva cuenta por cobrar
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Cuentas por Pagar */}
          <TabsContent value="payables">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="p-6 border-none shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pagado</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(stats.payables?.data?.monto_pagado || 0)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.payables?.data?.pagadas || 0} cuentas pagadas
                </p>
              </Card>

              <Card className="p-6 border-none shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Por Pagar</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(stats.payables?.data?.monto_pendiente || 0)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.payables?.data?.pendientes || 0} cuentas activas
                </p>
              </Card>

              <Card className="p-6 border-none shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vencido</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(stats.payables?.data?.monto_vencido || 0)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.payables?.data?.vencidas || 0} cuentas vencidas
                </p>
              </Card>
            </div>

            {/* Gráfica */}
            {stats.payables?.data && (
              <Card className="p-6 border-none shadow-soft mb-6">
                <h3 className="text-lg font-semibold mb-4">Distribución de Cuentas</h3>
                <PayablesChart data={stats.payables.data} />
              </Card>
            )}

            <Card className="p-6 border-none shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Acciones Rápidas</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleExportPayables('pdf')}
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleExportPayables('excel')}
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start">
                  Ver pagos próximos
                </Button>
                <Button variant="outline" className="justify-start">
                  Registrar pago
                </Button>
                <Button variant="outline" className="justify-start">
                  Nueva cuenta por pagar
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Comisiones */}
          <TabsContent value="commissions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="p-6 border-none shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pagadas</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(stats.commissions?.data?.monto_pagado || 0)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.commissions?.data?.pagadas || 0} comisiones
                </p>
              </Card>

              <Card className="p-6 border-none shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(stats.commissions?.data?.monto_pendiente || 0)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.commissions?.data?.pendientes || 0} por pagar
                </p>
              </Card>

              <Card className="p-6 border-none shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Promedio</p>
                    <p className="text-xl font-bold">
                      {(stats.commissions?.data?.promedio_porcentaje || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comisión promedio
                </p>
              </Card>
            </div>

            {/* Gráfica */}
            {stats.commissions?.data && (
              <Card className="p-6 border-none shadow-soft mb-6">
                <h3 className="text-lg font-semibold mb-4">Análisis de Comisiones</h3>
                <CommissionsChart data={stats.commissions.data} />
              </Card>
            )}

            <Card className="p-6 border-none shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Acciones Rápidas</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleExportCommissions('pdf')}
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleExportCommissions('excel')}
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start">
                  Ver por agencia
                </Button>
                <Button variant="outline" className="justify-start">
                  Marcar como pagada
                </Button>
                <Button variant="outline" className="justify-start">
                  Calcular comisiones
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Facturas */}
          <TabsContent value="invoices">
            <Card className="p-6 border-none shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Facturas CFDI</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.invoices?.total || 0} facturas emitidas
                  </p>
                </div>
                <Button className="gap-2">
                  <FileText className="w-4 h-4" />
                  Nueva Factura
                </Button>
              </div>

              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Conecta Facturama para empezar a generar facturas CFDI
                </p>
                <Button variant="outline">
                  Configurar Facturama
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
