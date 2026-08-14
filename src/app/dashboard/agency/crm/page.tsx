'use client'

import { useState } from 'react'
import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'
import {
  Users, Activity, DollarSign, Percent, Clock, Plus, MoreVertical, LayoutGrid, List, Calendar
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function AgencyCRMPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline'>('dashboard')
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban')

  const leadSources = [
    { name: 'WhatsApp', value: 33, color: '#10B981' },
    { name: 'Sitio Web', value: 24, color: '#3B82F6' },
    { name: 'Referidos', value: 17, color: '#F59E0B' },
    { name: 'Email', value: 14, color: '#6366F1' },
    { name: 'Redes', value: 12, color: '#EC4899' }
  ]

  const pipelineColumns = [
    { id: 'new', title: 'Nuevo Lead', total: '$186,500', count: 18 },
    { id: 'followup', title: 'Seguimiento', total: '$265,800', count: 16 },
    { id: 'quote', title: 'Envío Cotización', total: '$394,250', count: 12 },
    { id: 'payment', title: 'Pago Apartado', total: '$267,800', count: 9 },
    { id: 'liquidate', title: 'Liquidación', total: '$134,150', count: 7 },
  ]

  return (
    <PortalIntranetLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">CRM & Pipeline</h1>
            <p className="text-sm text-slate-500">Gestión de prospectos y oportunidades de venta</p>
          </div>
          
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'pipeline' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pipeline
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Contactos</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">125</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 rounded-lg"><Activity className="w-5 h-5 text-emerald-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Leads Activos</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">42</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 rounded-lg"><DollarSign className="w-5 h-5 text-indigo-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Valor Pipeline</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">$1,248,500 <span className="text-xs font-normal text-slate-500">MXN</span></p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-50 rounded-lg"><Percent className="w-5 h-5 text-amber-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Conversión</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">18%</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-50 rounded-lg"><Clock className="w-5 h-5 text-rose-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Tareas Vencidas</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">6</p>
              </div>
            </div>

            {/* Pipeline Stage Progress */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Progreso del Pipeline</h3>
              <div className="flex items-center justify-between gap-2">
                {pipelineColumns.map((col, idx) => (
                  <div key={idx} className="flex-1">
                    <div className="h-3 bg-blue-100 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(col.count / 18) * 100}%` }}></div>
                    </div>
                    <p className="text-xs font-medium text-slate-700">{col.title}</p>
                    <p className="text-xs text-slate-500">{col.count} leads</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Donut Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-1">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Fuentes de Leads</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSources}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {leadSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tareas */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-1">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Tareas Pendientes</h3>
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                      <input type="checkbox" className="mt-1 rounded text-blue-600 focus:ring-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Llamada de seguimiento</p>
                        <p className="text-xs text-slate-500">Cliente {i} • Hoy, 16:00</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actividad */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-1">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Actividad Reciente</h3>
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 text-xs font-bold">JD</div>
                      <div>
                        <p className="text-sm text-slate-800">Juan movió a <strong>María Gómez</strong> a Cotización</p>
                        <p className="text-xs text-slate-500">Hace 2 horas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                <button onClick={() => setViewMode('kanban')} className={`p-1.5 rounded-md ${viewMode === 'kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}>
                  <List className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded-md ${viewMode === 'calendar' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}>
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4">
              {pipelineColumns.map((col, idx) => (
                <div key={idx} className="flex-shrink-0 w-80 flex flex-col gap-3">
                  {/* Column Header */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-slate-800">{col.title}</h3>
                      <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">{col.count}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{col.total}</p>
                  </div>

                  {/* Cards Placeholder */}
                  <div className="space-y-3">
                    {[1, 2].map(card => (
                      <div key={card} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-grab">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm text-slate-900">Cliente {card}</h4>
                          <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                        <p className="text-xs text-slate-600 mb-1">Viaje a Cancún • 5 días</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs font-bold text-blue-600">$45,000 MXN</span>
                          <span className="text-[10px] text-slate-400">Hace 2 d</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-medium">
                    <Plus className="w-4 h-4" /> Nueva oportunidad
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PortalIntranetLayout>
  )
}
