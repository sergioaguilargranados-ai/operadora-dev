"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Plane,
  Hotel,
  Package,
  Calendar,
  MapPin,
  Users,
  Download,
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

interface Booking {
  id: number
  booking_reference: string
  booking_type: string
  status: string
  total_amount: number
  currency: string
  created_at: string
  booking_details: any
}

export default function MisReservasPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadBookings()
  }, [isAuthenticated, filter])

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()

      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await fetch(`/api/bookings?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.data || [])
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; icon: any }> = {
      confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: X },
      pending_confirmation: { label: 'Por confirmar', color: 'bg-blue-100 text-blue-800', icon: AlertCircle }
    }

    const badge = badges[status] || badges.pending
    const Icon = badge.icon

    return (
      <Badge className={`${badge.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      flight: Plane,
      hotel: Hotel,
      package: Package
    }
    return icons[type] || Package
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN'
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando reservas...</p>
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
              <h1 className="text-2xl font-bold">Mis Reservas</h1>
              <p className="text-sm text-muted-foreground">
                {bookings.length} reserva{bookings.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Buscar viajes
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Filtros */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="bg-white shadow-soft">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmadas</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de reservas */}
        {bookings.length === 0 ? (
          <Card className="p-12 text-center border-none shadow-soft">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No hay reservas</h3>
            <p className="text-muted-foreground mb-6">
              {filter === 'all'
                ? 'Aún no has realizado ninguna reserva'
                : `No tienes reservas con estado "${filter}"`
              }
            </p>
            <Button onClick={() => router.push('/')}>
              Buscar viajes
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => {
              const Icon = getTypeIcon(booking.booking_type)

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 border-none shadow-soft hover:shadow-medium transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Icono */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>

                      {/* Detalles */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              Reserva #{booking.booking_reference}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(booking.created_at)}</span>
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        {/* Información específica por tipo */}
                        {booking.booking_type === 'flight' && booking.booking_details?.outbound && (
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {booking.booking_details.outbound.origin} → {booking.booking_details.outbound.destination}
                              </span>
                            </div>
                            {booking.booking_details.airline && (
                              <div className="flex items-center gap-2">
                                <Plane className="w-4 h-4 text-muted-foreground" />
                                <span>{booking.booking_details.airline}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {booking.booking_type === 'hotel' && booking.booking_details?.name && (
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Hotel className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.booking_details.name}</span>
                            </div>
                            {booking.booking_details.city && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{booking.booking_details.city}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Precio y acciones */}
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right mb-4">
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(booking.total_amount, booking.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Monto total
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/reserva/${booking.id}`)}
                          >
                            Ver detalles
                          </Button>
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="default"
                              className="gap-1"
                              onClick={() => router.push(`/reserva/${booking.id}`)}
                            >
                              <Download className="w-4 h-4" />
                              Voucher
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
