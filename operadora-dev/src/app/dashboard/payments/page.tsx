'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { exportToExcel } from '@/utils/exportHelpers'

interface PaymentTransaction {
  id: number
  booking_id: number
  user_name: string
  user_email: string
  amount: number
  currency: string
  status: string
  payment_method: string
  transaction_id: string
  booking_type: string
  service_name: string
  created_at: string
  paid_at: string | null
  refunded_at: string | null
}

interface PaymentStats {
  total_transactions: number
  total_amount: number
  pending_amount: number
  completed_amount: number
  refunded_amount: number
  failed_amount: number
}

export default function PaymentsDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    total_transactions: 0,
    total_amount: 0,
    pending_amount: 0,
    completed_amount: 0,
    refunded_amount: 0,
    failed_amount: 0
  })
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMethod, setFilterMethod] = useState('all')
  const [filterSearch, setFilterSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchPayments()
  }, [filterStatus, filterMethod, startDate, endDate, currentPage])

  const fetchPayments = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        tenantId: '1', // TODO: Get from auth context
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString()
      })

      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterMethod !== 'all') params.append('paymentMethod', filterMethod)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const res = await fetch(`/api/payments?${params}`)
      if (!res.ok) throw new Error('Error al cargar pagos')

      const data = await res.json()
      setPayments(data.data || [])
      setTotalPages(Math.ceil(data.total / itemsPerPage))

      // Calcular estadísticas
      calculateStats(data.data || [])

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

  const calculateStats = (paymentsData: PaymentTransaction[]) => {
    const stats: PaymentStats = {
      total_transactions: paymentsData.length,
      total_amount: 0,
      pending_amount: 0,
      completed_amount: 0,
      refunded_amount: 0,
      failed_amount: 0
    }

    paymentsData.forEach(payment => {
      stats.total_amount += payment.amount

      switch (payment.status) {
        case 'pending':
          stats.pending_amount += payment.amount
          break
        case 'completed':
          stats.completed_amount += payment.amount
          break
        case 'refunded':
          stats.refunded_amount += payment.amount
          break
        case 'failed':
          stats.failed_amount += payment.amount
          break
      }
    })

    setStats(stats)
  }

  const handleExportToExcel = () => {
    const data = payments.map(payment => ({
      'ID Transacción': payment.transaction_id,
      'Reserva': `#${payment.booking_id}`,
      'Cliente': payment.user_name,
      'Email': payment.user_email,
      'Servicio': payment.service_name,
      'Monto': payment.amount,
      'Moneda': payment.currency,
      'Estado': payment.status,
      'Método': payment.payment_method,
      'Fecha Creación': new Date(payment.created_at).toLocaleString('es-MX'),
      'Fecha Pago': payment.paid_at ? new Date(payment.paid_at).toLocaleString('es-MX') : 'Pendiente',
      'Fecha Reembolso': payment.refunded_at ? new Date(payment.refunded_at).toLocaleString('es-MX') : '-'
    }))

    const success = exportToExcel(data, `Transacciones_${Date.now()}`, 'Pagos')

    if (success) {
      toast({
        title: 'Exportado',
        description: `${payments.length} transacciones exportadas a Excel`
      })
    } else {
      toast({
        title: 'Error',
        description: 'No se pudo exportar',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      completed: 'default',
      failed: 'destructive',
      refunded: 'secondary',
      cancelled: 'destructive'
    }

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      completed: 'Completado',
      failed: 'Fallido',
      refunded: 'Reembolsado',
      cancelled: 'Cancelado'
    }

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const getMethodBadge = (method: string) => {
    const icons: Record<string, string> = {
      stripe: '💳',
      paypal: '🅿️',
      cash: '💵',
      bank_transfer: '🏦'
    }

    const labels: Record<string, string> = {
      stripe: 'Stripe',
      paypal: 'PayPal',
      cash: 'Efectivo',
      bank_transfer: 'Transferencia'
    }

    return (
      <span className="flex items-center gap-1">
        <span>{icons[method]}</span>
        <span>{labels[method] || method}</span>
      </span>
    )
  }

  const filteredPayments = payments.filter(payment => {
    if (!filterSearch) return true

    const searchLower = filterSearch.toLowerCase()
    return (
      payment.user_name.toLowerCase().includes(searchLower) ||
      payment.user_email.toLowerCase().includes(searchLower) ||
      payment.transaction_id.toLowerCase().includes(searchLower) ||
      payment.booking_id.toString().includes(searchLower)
    )
  })

  if (loading && payments.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando transacciones...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Botón Volver */}
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transacciones de Pago</h1>
        <p className="text-gray-600">Gestiona y monitorea todos los pagos del sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transacciones</p>
              <p className="text-2xl font-bold">{stats.total_transactions}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">Completados</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.completed_amount.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </Card>

        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${stats.pending_amount.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </Card>

        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 mb-1">Reembolsados</p>
              <p className="text-2xl font-bold text-red-600">
                ${stats.refunded_amount.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">↩️</div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Buscar por nombre, email, ID..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="failed">Fallido</SelectItem>
              <SelectItem value="refunded">Reembolsado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los métodos</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="bank_transfer">Transferencia</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />

          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              setFilterStatus('all')
              setFilterMethod('all')
              setFilterSearch('')
              setStartDate('')
              setEndDate('')
            }}
            variant="outline"
          >
            Limpiar filtros
          </Button>

          <Button onClick={handleExportToExcel} variant="outline">
            📊 Exportar a Excel
          </Button>
        </div>
      </Card>

      {/* Tabla de transacciones */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Transacción</TableHead>
                <TableHead>Reserva</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No se encontraron transacciones
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">
                      {payment.transaction_id.substring(0, 20)}...
                    </TableCell>
                    <TableCell>
                      <a
                        href={`/reserva/${payment.booking_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        #{payment.booking_id}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.user_name}</p>
                        <p className="text-xs text-gray-500">{payment.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="secondary" className="text-xs mb-1">
                          {payment.booking_type}
                        </Badge>
                        <p className="text-xs text-gray-600">{payment.service_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">
                        ${payment.amount.toLocaleString()} {payment.currency.toUpperCase()}
                      </p>
                    </TableCell>
                    <TableCell>
                      {getMethodBadge(payment.payment_method)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <p className="text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString('es-MX')}
                        </p>
                        <p className="text-gray-500">
                          {new Date(payment.created_at).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
