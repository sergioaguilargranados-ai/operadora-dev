'use client'

import { useState } from 'react'
import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'
import {
  TrendingUp, CheckCircle, Clock, CreditCard, Download, Filter
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

export default function AgencyVentasPage() {
  const [activeTab, setActiveTab] = useState<'resumen' | 'reportes'>('resumen')

  const salesData = [
    { date: '01/08', ventas: 125000 },
    { date: '02/08', ventas: 180000 },
    { date: '03/08', ventas: 150000 },
    { date: '04/08', ventas: 210000 },
    { date: '05/08', ventas: 175000 },
    { date: '06/08', ventas: 240000 },
    { date: '07/08', ventas: 174680 }
  ]

  const productData = [
    { name: 'Paquetes', value: 45, color: '#3B82F6' },
    { name: 'Hoteles', value: 25, color: '#10B981' },
    { name: 'Vuelos', value: 15, color: '#F59E0B' },
    { name: 'Traslados', value: 8, color: '#6366F1' },
    { name: 'Tours', value: 7, color: '#EC4899' }
  ]

  return (
    <PortalIntranetLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ventas & Rendimiento</h1>
            <p className="text-sm text-slate-500">Métricas y reportes de ventas de la agencia</p>
          </div>
          
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'resumen' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('reportes')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'reportes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reportes
            </button>
          </div>
        </div>

        {activeTab === 'resumen' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Ventas Totales</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">$1,254,680 <span className="text-xs font-normal text-slate-500">MXN</span></p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Reservas Confirmadas</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">56</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Pendientes</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">18</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 rounded-lg"><CreditCard className="w-5 h-5 text-indigo-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Ticket Promedio</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">$22,404 <span className="text-xs font-normal text-slate-500">MXN</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Line Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Tendencia de Ventas (Últimos 7 días)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value/1000}k`} />
                      <RechartsTooltip formatter={(value) => [`$${value} MXN`, 'Ventas']} />
                      <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Product Donut */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-1">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Ventas por Producto</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productData}
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {productData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <select className="border border-slate-300 rounded-md text-sm px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500">
                  <option>Agrupación: Diario</option>
                  <option>Semanal</option>
                  <option>Mensual</option>
                </select>
                <select className="border border-slate-300 rounded-md text-sm px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500">
                  <option>Todos los Agentes</option>
                  <option>Juan Pérez</option>
                  <option>Ana Gómez</option>
                </select>
                <select className="border border-slate-300 rounded-md text-sm px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500">
                  <option>Todas las Sucursales</option>
                  <option>Matriz Sur</option>
                </select>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center">
                <Download className="w-4 h-4" /> Exportar CSV
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">Período</th>
                    <th className="px-6 py-3 font-medium">Ventas (MXN)</th>
                    <th className="px-6 py-3 font-medium">Reservas</th>
                    <th className="px-6 py-3 font-medium">Ticket Prom.</th>
                    <th className="px-6 py-3 font-medium">Crecimiento</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-800 divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4">01/08/2026</td>
                    <td className="px-6 py-4 font-semibold">$125,000</td>
                    <td className="px-6 py-4">5</td>
                    <td className="px-6 py-4">$25,000</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">+12%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4">02/08/2026</td>
                    <td className="px-6 py-4 font-semibold">$180,000</td>
                    <td className="px-6 py-4">8</td>
                    <td className="px-6 py-4">$22,500</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">+8%</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-blue-50/30">
                    <td className="px-6 py-4 font-bold">TOTAL PERÍODO</td>
                    <td className="px-6 py-4 font-bold text-blue-700">$305,000</td>
                    <td className="px-6 py-4 font-bold">13</td>
                    <td className="px-6 py-4 font-bold">$23,461</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">+10%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PortalIntranetLayout>
  )
}
