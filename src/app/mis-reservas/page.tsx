"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/PageHeader'
import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'
import {
  Plane,
  Hotel,
  Package,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  Eye,
  CreditCard,
  FileText,
  MessageCircle,
  Building2,
  Target,
  TrendingUp,
  Settings,
  ChevronDown,
  Filter
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

interface Booking {
  id: number
  booking_reference: string
  booking_type: string
  status: string
  total_amount: number
  total_price: number
  paid_amount?: number
  currency: string
  payment_status: string
  lead_traveler_name: string
  lead_traveler_email: string
  destination: string
  service_name: string
  created_at: string
  check_in?: string
  check_out?: string
  booking_details: any
  special_requests: any
  traveler_info: any
}

export default function MisReservasPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const isStaff = user?.role && ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENCY_ADMIN', 'AGENT'].includes(user.role)

  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<string>('recent')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadBookings()
  }, [isAuthenticated, filter])

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('as_token')
      const params = new URLSearchParams()

      if (filter !== 'all') {
        params.append('status', filter)
      }
      
      if (!isStaff && user?.id) {
        params.append('userId', user.id.toString())
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
    const badges: Record<string, { label: string; bg: string; text: string; icon: any }> = {
      confirmed: { label: 'Confirmada', bg: 'bg-emerald-50', text: 'text-emerald-700 border-emerald-200', icon: CheckCircle },
      pending: { label: 'Pendiente', bg: 'bg-amber-50', text: 'text-amber-700 border-amber-200', icon: Clock },
      cancelled: { label: 'Cancelada', bg: 'bg-rose-50', text: 'text-rose-700 border-rose-200', icon: X },
      pending_confirmation: { label: 'Por confirmar', bg: 'bg-blue-50', text: 'text-blue-700 border-blue-200', icon: AlertCircle }
    }

    const badge = badges[status] || badges.pending
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
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
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-sm text-slate-500 font-medium">Cargando tus reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <PortalIntranetLayout>
      <div className="space-y-6">
        {/* Header de sección */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-serif">Tus Reservas</h1>
          <p className="text-xs text-slate-500 mt-1">Consulta y administra todas tus reservas en un solo lugar.</p>
        </div>
          {isStaff && (
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
              <Card className="p-4 border-gray-200/80 shadow-sm rounded-2xl bg-white space-y-1">
                <button 
                  onClick={() => router.push('/dashboard/agency')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100/80 transition-colors"
                >
                  <Building2 className="w-4.5 h-4.5 text-slate-500" />
                  Panel de Agencias
                </button>

                <button 
                  onClick={() => router.push('/dashboard/crm')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100/80 transition-colors"
                >
                  <Target className="w-4.5 h-4.5 text-slate-500" />
                  CRM
                </button>

                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100/80 transition-colors"
                >
                  <TrendingUp className="w-4.5 h-4.5 text-slate-500" />
                  Ventas
                </button>

                <button 
                  onClick={() => router.push('/admin/features')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white rounded-xl shadow-xs transition-colors"
                  style={{ backgroundColor: 'var(--brand-primary, #000000)' }}
                >
                  <Settings className="w-4.5 h-4.5 text-white" />
                  Ajustes / Configuración
                </button>
              </Card>

              {/* Box Ayuda */}
              <Card className="p-5 border-gray-200/80 shadow-sm rounded-2xl bg-white text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">¿Necesitas ayuda?</h4>
                  <p className="text-xs text-slate-500 mt-1">Nuestro equipo está disponible 24/7 para apoyarte.</p>
                </div>
                <Button 
                  onClick={() => router.push('/ayuda')}
                  className="w-full text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                >
                  Contactar
                </Button>
              </Card>
            </aside>
          )}

          {/* ━━━━ SECCIÓN PRINCIPAL: TUS RESERVAS (Mockup #4) ━━━━ */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Tus Reservas</h1>
              <p className="text-sm text-slate-500 mt-1">Consulta y administra todas tus reservas en un solo lugar.</p>
            </div>

            {/* BARRA DE TABS Y FILTROS */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-2.5 rounded-2xl border border-gray-200/80 shadow-sm">
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filter === 'all' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Todas
                </button>

                <button
                  onClick={() => setFilter('confirmed')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filter === 'confirmed' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Confirmadas
                </button>

                <button
                  onClick={() => setFilter('pending')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filter === 'pending' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Pendientes
                </button>

                <button
                  onClick={() => setFilter('cancelled')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filter === 'cancelled' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  Canceladas
                </button>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer">
                  <span>Más recientes</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <button className="p-1.5 border border-gray-200 rounded-xl text-slate-600 hover:bg-slate-50">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* LISTA DE RESERVAS */}
            {bookings.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-gray-300 rounded-2xl bg-white shadow-none">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No se encontraron reservas</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {filter === 'all'
                    ? 'Aún no tienes viajes ni reservas registradas en la plataforma.'
                    : `No tienes reservas con el filtro "${filter}".`
                  }
                </p>
                <Button 
                  onClick={() => router.push('/')}
                  className="mt-5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                >
                  Explorar destinos
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking, index) => {
                  const Icon = getTypeIcon(booking.booking_type)

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6 border-gray-200/80 shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          
                          {/* Columna Izquierda: Ícono + Datos principales */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                              <Icon className="w-7 h-7" />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-500">Código de reserva</span>
                              </div>
                              <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/reserva/${booking.id}`)}>
                                <h3 className="text-lg font-extrabold text-slate-900 hover:text-blue-600 transition-colors">
                                  AS-{booking.booking_reference}
                                </h3>
                                <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
                              </div>

                              <p className="text-sm font-semibold text-slate-700">
                                {booking.destination || booking.service_name || 'Cancún, México'}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {formatDate(booking.created_at)}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-slate-400" />
                                  2 personas
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Columna Derecha: Estado + Acciones */}
                          <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                              <span className="text-xs text-slate-400">
                                Reservada el {formatDate(booking.created_at)}
                              </span>
                              {getStatusBadge(booking.status)}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                              {booking.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/checkout/${booking.id}`)}
                                  className="h-8 text-xs font-semibold border-gray-300 hover:bg-slate-50"
                                >
                                  <CreditCard className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                                  Pagar
                                </Button>
                              )}

                              {booking.status === 'confirmed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/facturacion/${booking.id}`)}
                                  className="h-8 text-xs font-semibold border-gray-300 hover:bg-slate-50"
                                >
                                  <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                                  Facturar
                                </Button>
                              )}

                              {(booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'pending_confirmation') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push('/ayuda')}
                                  className="h-8 text-xs font-semibold border-gray-300 hover:bg-slate-50"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                                  Contactar proveedor
                                </Button>
                              )}
                            </div>
                          </div>

                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
                <p className="text-center text-xs text-slate-400 pt-4">Mostrando {bookings.length} de {bookings.length} reservas</p>
              </div>
            )}
          </div>
      </div>
    </PortalIntranetLayout>
  )
}
