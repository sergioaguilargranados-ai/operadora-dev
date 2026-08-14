'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Plus,
  Search,
  Download,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function OperacionPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [isAuthenticated, router])

  if (loading) return null

  return (
    <PortalIntranetLayout>
      <div className="space-y-6">
        
        {/* Header de la vista de Operación */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-serif">Catálogo de Clientes y CRM</h1>
            <p className="text-xs text-slate-500 mt-1">Gestión operativa unificada de prospectos, clientes, reservaciones y seguimiento.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => router.push('/dashboard/crm')}
              className="bg-slate-900 text-white font-bold text-xs rounded-xl px-4 py-2 gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Nuevo Cliente / Contacto
            </Button>
          </div>
        </div>

        {/* KPI CARDS (Imagen 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white border-l-4 border-l-blue-600">
            <p className="text-xs font-semibold text-slate-400">Total Contactos</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">13</span>
              <span className="text-xs text-emerald-600 font-bold">+5 este mes</span>
            </div>
          </Card>

          <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white border-l-4 border-l-emerald-500">
            <p className="text-xs font-semibold text-slate-400">Clientes Convertidos</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">0</span>
              <span className="text-xs text-slate-400 font-bold">0% tasa conversión</span>
            </div>
          </Card>

          <Card className="p-4 border-gray-200/80 shadow-2xs rounded-2xl bg-white border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold text-slate-400">Leads Activos</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">13</span>
              <span className="text-xs text-amber-600 font-bold">🔥 0 hot leads</span>
            </div>
          </Card>
        </div>

        {/* TABS DE FILTRO Y BÚSQUEDA (Imagen 2) */}
        <Card className="p-3 border-gray-200/80 shadow-2xs rounded-2xl bg-white flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-2xs flex items-center gap-2">
              <span>🏙️ Todos</span>
            </button>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2">
              <span>👤 Clientes</span>
            </button>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2">
              <span>🎯 Leads / Prospectos</span>
            </button>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2">
              <span>📦 Proveedores</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, email, teléfono..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <Button variant="outline" className="text-xs font-semibold gap-1.5 border-gray-300 rounded-xl">
              <Download className="w-3.5 h-3.5" />
              Descargar Plantilla
            </Button>
          </div>
        </Card>

        {/* TABLA DE CLIENTES Y CONTACTOS (Imagen 2) */}
        <Card className="border-gray-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Etapa</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Fuente</th>
                  <th className="py-3 px-4">Reservas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
                {[
                  { name: 'Cliente prueba test', email: 'c@c.com', phone: '7221143854', type: 'Lead', stage: 'Nuevo', score: 30, source: 'Cotización Tour', bookings: 0 },
                  { name: 'prueba de cliente referido prueba', email: 'referido@prueba.com', phone: '7221143854', type: 'Lead', stage: 'Nuevo', score: 30, source: 'Cotización Tour', bookings: 0 },
                  { name: 'Referido prueba', email: 'referido@prueba.com', phone: '7221143854', type: 'Lead', stage: 'Nuevo', score: 0, source: 'Registro Web', bookings: 0 },
                  { name: 'Uriel Aguilar', email: 'urielaguilarv72@gmail.com', phone: '7221120319', type: 'Lead', stage: 'Nuevo', score: 0, source: 'Registro Web', bookings: 0 }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{row.name}</p>
                          <p className="text-[10px] text-slate-400">{row.email} • {row.phone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        🎯 {row.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {row.stage}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-black text-[10px] flex items-center justify-center">
                        {row.score}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {row.source}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {row.bookings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </PortalIntranetLayout>
  )
}
