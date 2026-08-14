"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'
import {
  FileText,
  CheckCircle,
  Clock,
  Search,
  ChevronDown,
  Calendar,
  MessageCircle,
  Hotel,
  Plane,
  Package,
  Eye,
  Plus
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface InvoiceRow {
  id: number
  booking_id: number
  booking_reference: string
  destination: string
  nombre_receptor: string
  total: number
  status: string
  fecha_emision: string
  created_at: string
}

export default function FacturacionListPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'issued'>('pending')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadInvoices()
  }, [isAuthenticated, filter])

  const loadInvoices = async () => {
    try {
      const token = localStorage.getItem('as_token')
      const res = await fetch(`/api/billing/invoices?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.data || [])
      }
    } catch (e) {
      console.error('Error cargando facturas:', e)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Cargando facturas...</p>
        </div>
      </div>
    )
  }

  return (
    <PortalIntranetLayout>
      <div className="space-y-6">

        {/* BREADCRUMB */}
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Inicio</span>
          <span>&gt;</span>
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/mis-reservas')}>Tus Reservas</span>
          <span>&gt;</span>
          <span className="font-semibold text-slate-700">Facturación</span>
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 font-serif">Facturación SAT CFDI 4.0</h1>
          <p className="text-xs text-slate-500 mt-1">Consulta las reservas que están pendientes de facturación o descarga tus CFDI emitidos.</p>
        </div>

        {/* ━━━━ 3 KPI CARDS SUPERIORES (Mockup #11) ━━━━ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Pendientes de facturación</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">4</p>
            </div>
          </Card>

          <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Facturadas</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">12</p>
            </div>
          </Card>

          <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Última actualización</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">Hoy <span className="text-xs font-normal text-slate-500">10:30 AM</span></p>
            </div>
          </Card>
        </div>

        {/* LAYOUT CON TABLA Y SIDEBAR DERECHO (Mockup #11) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* TABLA PRINCIPAL (3 COLS) */}
          <div className="lg:col-span-3 space-y-4">

            {/* BARRA DE BÚSQUEDA Y TABS */}
            <Card className="p-3 border-gray-200/80 shadow-2xs rounded-2xl bg-white flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por código de reserva o cliente"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
                <div className="flex items-center gap-2 mr-2 px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-xl">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-600">Fechas</span>
                </div>
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Todas
                </button>
                <button 
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === 'pending' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Pendientes
                </button>
                <button 
                  onClick={() => setFilter('issued')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === 'issued' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Facturadas
                </button>
              </div>
            </Card>

            {/* TABLA DE RESERVAS / FACTURAS */}
            <Card className="border-gray-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Reserva</th>
                      <th className="py-3 px-4">Servicio</th>
                      <th className="py-3 px-4">Fecha reserva</th>
                      <th className="py-3 px-4">Importe</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
                    {/* Mock data si viene vacío para previsualización idéntica al mockup #11 */}
                    {[
                      { id: 101, ref: 'AS-7X9M2K', type: 'Hotel', client: 'Nombre del cliente', date: '15 may 2025', travel: '00 may - 00 may 2025', price: 12450, status: 'pending' },
                      { id: 102, ref: 'AS-4B1P8L', type: 'Vuelo', client: 'Nombre del cliente', date: '14 may 2025', travel: '20 may - 20 may 2025', price: 8640, status: 'pending' },
                      { id: 103, ref: 'AS-2D6KNC', type: 'Traslado', client: 'Nombre del cliente', date: '13 may 2025', travel: '18 may 2025', price: 1250, status: 'pending' },
                      { id: 104, ref: 'AS-9G3Q7V', type: 'Paquete vacacional', client: 'Nombre del cliente', date: '12 may 2025', travel: '25 may - 01 jun 2025', price: 26800, status: 'pending' }
                    ].map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                            {row.type === 'Hotel' ? <Hotel className="w-4 h-4" /> : row.type === 'Vuelo' ? <Plane className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-extrabold">{row.ref}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{row.type}</p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{row.client}</p>
                          <p className="text-[10px] text-slate-400">cliente@ejemplo.com</p>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500">
                          <p className="font-semibold text-slate-700">{row.date}</p>
                          <p className="text-[10px] text-slate-400">{row.travel}</p>
                        </td>

                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          {formatCurrency(row.price)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pendiente de facturación
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Button 
                            size="sm"
                            onClick={() => router.push(`/facturacion/${row.id}`)}
                            className="h-7 px-3 text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:bg-slate-900 hover:text-white transition-all rounded-lg"
                          >
                            Facturar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-slate-50 border-t text-xs text-slate-400 text-center">
                Las facturas se generan en moneda MXN. Si requieres una factura con datos fiscales, seleccionala y continúa.
              </div>
            </Card>

          </div>

          {/* SIDEBAR DERECHO — SOPORTE (Mockup #11) */}
          <div className="space-y-4">
            <Card className="p-5 border-gray-200/80 shadow-sm rounded-2xl bg-white space-y-3 text-xs text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">¿Necesitas ayuda con tu factura?</h4>
                <p className="text-slate-500 mt-1">Nuestro equipo está listo para ayudarte con cualquier duda relacionada con tu facturación.</p>
              </div>

              <Button 
                onClick={() => router.push('/ayuda')}
                className="w-full text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2"
              >
                Contactar soporte
              </Button>

              <div className="pt-2 border-t text-[11px] text-slate-400 text-left">
                <p className="font-semibold text-slate-600">Horario de atención</p>
                <p>Lunes a viernes de 9:00 a 18:00 h</p>
                <p>(Horario central de México)</p>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </PortalIntranetLayout>
  )
}
