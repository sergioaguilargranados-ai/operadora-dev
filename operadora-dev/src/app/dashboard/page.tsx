"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/PageHeader'
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
  ArrowDownRight,
  Loader2
} from 'lucide-react'

interface DashboardStats {
  totalInvoices: number
  totalReceivables: number
  totalPayables: number
  totalCommissions: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchDashboardStats()
  }, [isAuthenticated])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      // Fetch basic stats
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <PageHeader showBackButton={true} backButtonHref="/">
        <div>
          <h1 className="text-xl font-bold">Dashboard Financiero</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido, {user?.name}
          </p>
        </div>
      </PageHeader>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Facturas</h3>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats?.totalInvoices || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Total emitidas</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Por Cobrar</h3>
              <ArrowDownRight className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">${(stats?.totalReceivables || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">MXN</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Por Pagar</h3>
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold">${(stats?.totalPayables || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">MXN</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Comisiones</h3>
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold">${(stats?.totalCommissions || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">MXN</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Acciones Rápidas</h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/payments?tab=invoices')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver facturas
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/payments?tab=receivables')}
              >
                <ArrowDownRight className="w-4 h-4 mr-2" />
                Cuentas por cobrar
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/payments?tab=payables')}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Cuentas por pagar
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/payments?tab=commissions')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Comisiones
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Enlaces Útiles</h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/corporate')}
              >
                <Users className="w-4 h-4 mr-2" />
                Dashboard Corporativo
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/mis-reservas')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Mis Reservas
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/approvals')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprobaciones
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
