'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  TrendingUp, CheckCircle, Clock, CreditCard, Download, Filter, Loader2, RefreshCw, AlertCircle, Users, Box, FileText, Search
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AgencyVentasPage() {
  const { user } = useAuth()
  const agencyId = (user as any)?.tenant_id || (user as any)?.agency_id || 1

  const [activeTab, setActiveTab] = useState<'resumen' | 'reservas' | 'productos' | 'agentes' | 'reportes'>('resumen')
  const [daysRange, setDaysRange] = useState<number>(7)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Reportes state
  const [reportType, setReportType] = useState('sales_by_period')
  const [groupBy, setGroupBy] = useState('day')

  useEffect(() => {
    fetchSalesData()
  }, [agencyId, daysRange])

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/agency/sales?tenantId=${agencyId}&days=${daysRange}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || 'Error al cargar datos de ventas')
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const kpis = data?.kpis || {
    totalSales: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    averageTicket: 0
  }

  const salesTrend = data?.salesTrend?.length > 0
    ? data.salesTrend
    : [{ date: 'Sin datos', ventas: 0, count: 0 }]

  const productData = data?.productBreakdown?.length > 0
    ? data.productBreakdown
    : [{ name: 'Vuelos', value: 40, color: '#3b82f6', total: 4000, count: 4 }, { name: 'Hoteles', value: 30, color: '#10b981', total: 3000, count: 3 }]

  const recentSales = data?.recentSales || []

  // Mock data for new tabs (to be replaced with actual backend when needed)
  const agentsRanking = [
    { id: 1, name: 'Ana Silva', avatar: 'AS', sales: 150000, bookings: 12, avgTicket: 12500, commission: 15000, rating: 4.8 },
    { id: 2, name: 'Carlos Ruiz', avatar: 'CR', sales: 120000, bookings: 10, avgTicket: 12000, commission: 12000, rating: 4.5 },
  ]

  const handleExportCSV = () => {
    if (!recentSales.length) return
    const headers = 'ID,Referencia,Cliente,Email,Tipo,Destino,Monto,Estado,Fecha\n'
    const rows = recentSales.map((s: any) =>
      `"${s.id}","${s.reference}","${s.clientName}","${s.clientEmail}","${s.type}","${s.destination}","${s.amount}","${s.status}","${s.createdAt}"`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `ventas-agencia-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadReport = () => {
    // Generate Report CSV
    const blob = new Blob(['Report Data'], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte-${reportType}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ventas & Rendimiento</h1>
            <p className="text-sm text-slate-500">Métricas y reportes de ventas en tiempo real de la agencia</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveTab('resumen')}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                  activeTab === 'resumen' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('reservas')}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                  activeTab === 'reservas' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reservas
              </button>
              <button
                onClick={() => setActiveTab('productos')}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                  activeTab === 'productos' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Productos
              </button>
              <button
                onClick={() => setActiveTab('agentes')}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                  activeTab === 'agentes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Agentes
              </button>
              <button
                onClick={() => setActiveTab('reportes')}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                  activeTab === 'reportes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reportes
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={fetchSalesData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'resumen' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Ventas Totales</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  ${kpis.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">MXN</span>
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Reservas Confirmadas</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{kpis.confirmedBookings}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Pendientes</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{kpis.pendingBookings}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 rounded-lg"><CreditCard className="w-5 h-5 text-indigo-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Ticket Promedio</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  ${kpis.averageTicket.toLocaleString('es-MX', { minimumFractionDigits: 0 })} <span className="text-xs font-normal text-slate-500">MXN</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Line Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-800">Tendencia de Ventas</h3>
                  <div className="flex gap-1.5 text-xs">
                    <button
                      onClick={() => setDaysRange(7)}
                      className={`px-2.5 py-1 rounded ${daysRange === 7 ? 'bg-blue-600 text-white font-medium' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      7 días
                    </button>
                    <button
                      onClick={() => setDaysRange(30)}
                      className={`px-2.5 py-1 rounded ${daysRange === 30 ? 'bg-blue-600 text-white font-medium' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      30 días
                    </button>
                  </div>
                </div>
                <div className="h-[280px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value/1000}k`} />
                        <RechartsTooltip formatter={(value: any) => [`$${Number(value).toLocaleString('es-MX')} MXN`, 'Ventas']} />
                        <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Product Donut */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Ventas por Producto</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productData}
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {productData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: any) => [`${val}%`, 'Porcentaje']} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">Reservas</h3>
                  <p className="text-xs text-slate-500">Listado de reservas filtrable</p>
                </div>
                <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" /> Exportar CSV
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input placeholder="Buscar folio, cliente..." className="pl-8" />
                </div>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo de Servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="flight">Vuelo</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="package">Paquete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">Folio PNR</th>
                    <th className="px-6 py-3 font-medium">Fecha</th>
                    <th className="px-6 py-3 font-medium">Cliente</th>
                    <th className="px-6 py-3 font-medium">Producto/Servicio</th>
                    <th className="px-6 py-3 font-medium">Agente</th>
                    <th className="px-6 py-3 font-medium">Total MXN</th>
                    <th className="px-6 py-3 font-medium">Estatus</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-800 divide-y divide-slate-200">
                  {recentSales.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-600">{s.reference}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-MX') : ''}
                      </td>
                      <td className="px-6 py-4 font-medium">{s.clientName}</td>
                      <td className="px-6 py-4">{s.type}</td>
                      <td className="px-6 py-4 text-slate-600">Agente {s.agentId || 1}</td>
                      <td className="px-6 py-4 font-semibold">${s.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <Badge variant={s.status === 'confirmed' ? 'default' : 'secondary'}>{s.status}</Badge>
                      </td>
                    </tr>
                  ))}
                  {recentSales.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                        No hay registros de reservas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'productos' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Desglose de ventas por tipo de producto/servicio</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-4 py-3 font-medium">Producto</th>
                        <th className="px-4 py-3 font-medium">Cantidad</th>
                        <th className="px-4 py-3 font-medium">Ingresos (MXN)</th>
                        <th className="px-4 py-3 font-medium">% Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-800 divide-y divide-slate-200">
                      {productData.map((p: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-4 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                            <span className="font-medium">{p.name}</span>
                          </td>
                          <td className="px-4 py-4">{p.count}</td>
                          <td className="px-4 py-4 font-semibold">${p.total?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-4">{p.value}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={productData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                      <RechartsTooltip />
                      <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agentes' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">Ranking de Agentes</h3>
                <p className="text-xs text-slate-500">Rendimiento por agente de ventas</p>
              </div>
              <Select defaultValue="month">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="year">Este Año</SelectItem>
                  <SelectItem value="all">Histórico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">Agente</th>
                    <th className="px-6 py-3 font-medium">Ventas (MXN)</th>
                    <th className="px-6 py-3 font-medium">Reservas</th>
                    <th className="px-6 py-3 font-medium">Ticket Prom.</th>
                    <th className="px-6 py-3 font-medium">Comisión</th>
                    <th className="px-6 py-3 font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-800 divide-y divide-slate-200">
                  {agentsRanking.map((agent, idx) => (
                    <tr key={agent.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {agent.avatar}
                        </div>
                        <span className="font-medium">{agent.name}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">${agent.sales.toLocaleString('es-MX')}</td>
                      <td className="px-6 py-4">{agent.bookings}</td>
                      <td className="px-6 py-4">${agent.avgTicket.toLocaleString('es-MX')}</td>
                      <td className="px-6 py-4">${agent.commission.toLocaleString('es-MX')}</td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        ⭐ {agent.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-900">Filtros de Reporte</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo de Reporte</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales_by_period">Ventas por Período</SelectItem>
                        <SelectItem value="commissions">Comisiones</SelectItem>
                        <SelectItem value="products">Productos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Agrupación</label>
                    <Select value={groupBy} onValueChange={setGroupBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Agrupar por..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Día</SelectItem>
                        <SelectItem value="week">Semana</SelectItem>
                        <SelectItem value="month">Mes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleDownloadReport} className="w-full flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Generar Reporte
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Directorio de Reportes</h3>
                    <p className="text-xs text-slate-500">Reportes pregenerados recientes</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg hover:border-blue-100 hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">Reporte de Ventas - Agosto {2026 - i}</p>
                          <p className="text-xs text-slate-500">Generado el 15 Ago, 10:00 AM</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600" onClick={handleDownloadReport}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
