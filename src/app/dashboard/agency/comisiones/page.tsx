'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  DollarSign, CheckCircle, Clock, Calendar, Download, Search, AlertCircle, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PermissionGate from '@/components/PermissionGate'

export default function AgencyComisionesPage() {
  const { user } = useAuth()
  const agencyId = (user as any)?.tenant_id || (user as any)?.agency_id || 1

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCommissions()
  }, [agencyId])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/agency/commissions?tenantId=${agencyId}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || 'Error al cargar comisiones')
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const kpis = data?.kpis || {
    monthCommissions: 0,
    paidCommissions: 0,
    pendingCommissions: 0,
    yearCommissions: 0
  }

  const commissions = data?.commissions || []

  return (
    <div className="space-y-6">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Comisiones</h1>
            <p className="text-sm text-slate-500">Gestión y desglose de comisiones generadas por agentes</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Exportar a Excel
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg"><DollarSign className="w-5 h-5 text-blue-600" /></div>
              <h3 className="text-sm font-medium text-slate-600">Comisiones del mes</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${kpis.monthCommissions.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">MXN</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Total generado</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
              <h3 className="text-sm font-medium text-slate-600">Comisiones pagadas</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${kpis.paidCommissions.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">MXN</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Este mes</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
              <h3 className="text-sm font-medium text-slate-600">Comisiones pendientes</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${kpis.pendingCommissions.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">MXN</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Por pagar</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg"><Calendar className="w-5 h-5 text-indigo-600" /></div>
              <h3 className="text-sm font-medium text-slate-600">Comisiones del año</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${kpis.yearCommissions.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">MXN</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Total generado</p>
          </div>
        </div>

        {/* Filters and Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3 items-center">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por reserva, cliente o agente..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rango de Fechas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">Este Mes</SelectItem>
                <SelectItem value="last_month">Mes Anterior</SelectItem>
                <SelectItem value="this_year">Este Año</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">Reserva</th>
                    <th className="px-6 py-3 font-medium">Cliente</th>
                    <th className="px-6 py-3 font-medium">Agente</th>
                    <th className="px-6 py-3 font-medium">Fecha Viaje</th>
                    <th className="px-6 py-3 font-medium">Venta Neta</th>
                    <th className="px-6 py-3 font-medium">Comisión</th>
                    <th className="px-6 py-3 font-medium">Estatus</th>
                    <th className="px-6 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-800 divide-y divide-slate-200">
                  {commissions.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-semibold text-blue-600">{c.folio}</div>
                        <div className="text-xs text-slate-500">{c.destination}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{c.client_name || 'Cliente'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {c.first_name ? c.first_name[0] : 'A'}
                          </div>
                          <div>
                            <div className="font-medium">{c.first_name} {c.last_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{c.travel_date || '-'}</td>
                      <td className="px-6 py-4 font-semibold">${Number(c.sale_amount).toLocaleString('es-MX')}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-emerald-600">${Number(c.commission_amount).toLocaleString('es-MX')}</div>
                        <div className="text-xs text-slate-400">{c.commission_rate}%</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={c.status === 'paid' ? 'default' : c.status === 'pending' ? 'secondary' : 'destructive'}>
                          {c.status === 'paid' ? 'Pagada' : c.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600">Ver Detalles</Button>
                      </td>
                    </tr>
                  ))}
                  {commissions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                        No hay comisiones registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
