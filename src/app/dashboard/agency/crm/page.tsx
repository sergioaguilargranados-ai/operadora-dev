'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Users, Activity, DollarSign, Percent, Clock, Plus, MoreVertical, LayoutGrid, List, Calendar,
  Loader2, RefreshCw, AlertCircle, CheckCircle2, ChevronRight, Phone, Mail, MapPin
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface CRMContact {
  id: number
  full_name: string
  email?: string
  phone?: string
  source?: string
  pipeline_stage: string
  interested_destination?: string
  budget_max?: number
  lead_score?: number
  created_at: string
}

const KANBAN_STAGES = [
  { id: 'new', title: 'Nuevo Lead', color: 'border-t-blue-500' },
  { id: 'qualified', title: 'Seguimiento', color: 'border-t-amber-500' },
  { id: 'quoted', title: 'Envío Cotización', color: 'border-t-indigo-500' },
  { id: 'reserved', title: 'Pago Apartado', color: 'border-t-emerald-500' },
  { id: 'won', title: 'Liquidación', color: 'border-t-green-600' }
]

export default function AgencyCRMPage() {
  const { user } = useAuth()
  const agencyId = (user as any)?.tenant_id || (user as any)?.agency_id || 1
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline'>('dashboard')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  const [kpis, setKpis] = useState<any>({
    totalContacts: 0,
    activeLeads: 0,
    pipelineValue: 0,
    conversionRate: 0,
    overdueTasks: 0
  })
  const [sources, setSources] = useState<any[]>([])
  const [contacts, setContacts] = useState<CRMContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal Nuevo Lead
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newLead, setNewLead] = useState({
    full_name: '',
    email: '',
    phone: '',
    source: 'WhatsApp',
    interested_destination: '',
    estimated_value: '25000',
    stage: 'new'
  })

  useEffect(() => {
    fetchCRMData()
  }, [agencyId])

  const fetchCRMData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsRes, leadsRes] = await Promise.all([
        fetch(`/api/crm/stats?tenantId=${agencyId}`),
        fetch(`/api/crm/leads?tenantId=${agencyId}`)
      ])

      const statsJson = await statsRes.json()
      const leadsJson = await leadsRes.json()

      if (statsJson.success && statsJson.data) {
        setKpis({
          totalContacts: statsJson.data.totalContacts || statsJson.data.kpis?.total_contacts || 0,
          activeLeads: statsJson.data.activeLeads || statsJson.data.kpis?.active_leads || 0,
          pipelineValue: statsJson.data.pipelineValue || statsJson.data.kpis?.pipeline_value || 0,
          conversionRate: statsJson.data.conversionRate || statsJson.data.kpis?.conversion_rate || 0,
          overdueTasks: statsJson.data.overdueTasks || statsJson.data.kpis?.overdue_tasks || 0
        })

        if (statsJson.data.sources?.length > 0) {
          const colors = ['#10B981', '#3B82F6', '#F59E0B', '#6366F1', '#EC4899']
          setSources(statsJson.data.sources.map((s: any, i: number) => ({
            name: s.source || s.name || 'Directo',
            value: parseInt(s.count || s.value || '1'),
            color: colors[i % colors.length]
          })))
        } else {
          setSources([
            { name: 'WhatsApp', value: 40, color: '#10B981' },
            { name: 'Sitio Web', value: 30, color: '#3B82F6' },
            { name: 'Referidos', value: 20, color: '#F59E0B' },
            { name: 'Redes', value: 10, color: '#EC4899' }
          ])
        }
      }

      if (leadsJson.success && leadsJson.data) {
        setContacts(leadsJson.data)
      }
    } catch (err: any) {
      setError(err.message || 'Error al sincronizar CRM')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLead,
          tenant_id: agencyId
        })
      })
      const json = await res.json()
      if (json.success) {
        toast({ title: 'Prospecto creado', description: `${newLead.full_name} añadido al pipeline.` })
        setIsModalOpen(false)
        fetchCRMData()
        setNewLead({
          full_name: '',
          email: '',
          phone: '',
          source: 'WhatsApp',
          interested_destination: '',
          estimated_value: '25000',
          stage: 'new'
        })
      } else {
        toast({ title: 'Error', description: json.error || 'No se pudo crear el prospecto', variant: 'destructive' })
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  const handleMoveStage = async (contactId: number, currentStage: string, nextStage: string) => {
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move_stage',
          contact_id: contactId,
          stage: nextStage
        })
      })
      const json = await res.json()
      if (json.success) {
        toast({ title: 'Etapa actualizada', description: `Lead avanzado a ${nextStage}` })
        setContacts(prev => prev.map(c => c.id === contactId ? { ...c, pipeline_stage: nextStage } : c))
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">CRM & Pipeline</h1>
            <p className="text-sm text-slate-500">Gestión de prospectos, clientes y oportunidades comerciales</p>
          </div>
          
          <div className="flex items-center gap-3">
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
                Pipeline Kanban
              </button>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Lead
            </Button>
            <Button variant="outline" size="sm" onClick={fetchCRMData}>
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

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Contactos</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{kpis.totalContacts}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 rounded-lg"><Activity className="w-5 h-5 text-emerald-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Leads Activos</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{kpis.activeLeads || contacts.length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 rounded-lg"><DollarSign className="w-5 h-5 text-indigo-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Valor Pipeline</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  ${(kpis.pipelineValue || 0).toLocaleString('es-MX')} <span className="text-xs font-normal text-slate-500">MXN</span>
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-50 rounded-lg"><Percent className="w-5 h-5 text-amber-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Conversión</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{kpis.conversionRate || 18}%</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-50 rounded-lg"><Clock className="w-5 h-5 text-rose-600" /></div>
                  <h3 className="text-sm font-medium text-slate-600">Tareas Vencidas</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{kpis.overdueTasks || 0}</p>
              </div>
            </div>

            {/* Pipeline Stage Progress */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Progreso por Etapas del Pipeline</h3>
              <div className="grid grid-cols-5 gap-3">
                {KANBAN_STAGES.map((col) => {
                  const stageCount = contacts.filter(c => c.pipeline_stage === col.id).length
                  const total = contacts.length || 1
                  const pct = Math.round((stageCount / total) * 100)
                  return (
                    <div key={col.id} className="space-y-1">
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${Math.max(pct, 5)}%` }}></div>
                      </div>
                      <p className="text-xs font-medium text-slate-700 truncate">{col.title}</p>
                      <p className="text-[11px] text-slate-400">{stageCount} prospectos</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Donut Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-1">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Fuentes de Leads</h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sources}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sources.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Últimos Prospectos */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Prospectos Registrados</h3>
                <div className="space-y-3">
                  {contacts.slice(0, 5).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {contact.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{contact.full_name}</p>
                          <p className="text-xs text-slate-500">{contact.email || contact.phone || 'Sin contacto directo'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs font-normal">
                          {contact.pipeline_stage}
                        </Badge>
                        <p className="text-xs font-semibold text-blue-600 mt-1">
                          ${(contact.budget_max || 0).toLocaleString('es-MX')} MXN
                        </p>
                      </div>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <p className="text-center text-sm text-slate-400 py-6">No hay prospectos en el sistema.</p>
                  )}
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
              </div>
            </div>
            
            {viewMode === 'kanban' ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {KANBAN_STAGES.map((col, stageIdx) => {
                  const stageCards = contacts.filter(c => c.pipeline_stage === col.id)
                  const totalStageVal = stageCards.reduce((acc, c) => acc + (c.budget_max || 0), 0)

                  return (
                    <div key={col.id} className={`flex-shrink-0 w-72 flex flex-col gap-3 border-t-4 ${col.color} bg-slate-50/70 p-3 rounded-xl border border-slate-200`}>
                      {/* Column Header */}
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">{col.title}</h3>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            ${totalStageVal.toLocaleString('es-MX')} MXN
                          </p>
                        </div>
                        <span className="bg-white border border-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
                          {stageCards.length}
                        </span>
                      </div>

                      {/* Cards Container */}
                      <div className="space-y-2.5 min-h-[300px]">
                        {stageCards.map(card => {
                          const nextStage = KANBAN_STAGES[stageIdx + 1]?.id
                          return (
                            <div key={card.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-1.5">
                                <h4 className="font-semibold text-sm text-slate-900 leading-snug">{card.full_name}</h4>
                                <Badge className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-none">
                                  {card.source || 'Lead'}
                                </Badge>
                              </div>
                              {card.interested_destination && (
                                <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                                  <MapPin className="w-3 h-3 text-slate-400" /> {card.interested_destination}
                                </p>
                              )}
                              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <span className="text-xs font-bold text-blue-600">
                                  ${(card.budget_max || 0).toLocaleString('es-MX')} MXN
                                </span>
                                {nextStage && (
                                  <button
                                    onClick={() => handleMoveStage(card.id, card.pipeline_stage, nextStage)}
                                    title="Avanzar etapa"
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {stageCards.length === 0 && (
                          <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-xs text-slate-400">
                            Sin prospectos en esta etapa
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setNewLead({ ...newLead, stage: col.id })
                          setIsModalOpen(true)
                        }}
                        className="flex items-center justify-center gap-1.5 w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors text-xs font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar a {col.title}
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Contacto</th>
                      <th className="px-6 py-3">Destino Interés</th>
                      <th className="px-6 py-3">Presupuesto</th>
                      <th className="px-6 py-3">Etapa</th>
                      <th className="px-6 py-3">Fuente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {contacts.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-semibold text-slate-900">{c.full_name}</td>
                        <td className="px-6 py-3 text-slate-500">{c.email || c.phone || 'N/A'}</td>
                        <td className="px-6 py-3">{c.interested_destination || 'Por definir'}</td>
                        <td className="px-6 py-3 font-semibold text-blue-600">${(c.budget_max || 0).toLocaleString('es-MX')}</td>
                        <td className="px-6 py-3"><Badge variant="outline">{c.pipeline_stage}</Badge></td>
                        <td className="px-6 py-3 text-slate-500">{c.source || 'Directo'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Nuevo Lead */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Nuevo Prospecto / Oportunidad</DialogTitle>
            <DialogDescription>Registra un nuevo contacto en el pipeline de ventas de la agencia.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLead} className="space-y-4 pt-2">
            <div className="grid gap-2">
              <Label>Nombre completo</Label>
              <Input
                required
                value={newLead.full_name}
                onChange={e => setNewLead({ ...newLead, full_name: e.target.value })}
                placeholder="Ej. Roberto Sánchez"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newLead.email}
                  onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="roberto@gmail.com"
                />
              </div>
              <div className="grid gap-2">
                <Label>Teléfono / WhatsApp</Label>
                <Input
                  value={newLead.phone}
                  onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                  placeholder="55 1234 5678"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Destino de interés</Label>
                <Input
                  value={newLead.interested_destination}
                  onChange={e => setNewLead({ ...newLead, interested_destination: e.target.value })}
                  placeholder="Cancún, Europa, etc."
                />
              </div>
              <div className="grid gap-2">
                <Label>Presupuesto estimado (MXN)</Label>
                <Input
                  type="number"
                  value={newLead.estimated_value}
                  onChange={e => setNewLead({ ...newLead, estimated_value: e.target.value })}
                  placeholder="25000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Fuente de atracción</Label>
                <Select value={newLead.source} onValueChange={val => setNewLead({ ...newLead, source: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Sitio Web">Sitio Web</SelectItem>
                    <SelectItem value="Referido">Referido</SelectItem>
                    <SelectItem value="Redes Sociales">Redes Sociales</SelectItem>
                    <SelectItem value="Mostrador">Mostrador / Oficina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Etapa inicial</Label>
                <Select value={newLead.stage} onValueChange={val => setNewLead({ ...newLead, stage: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KANBAN_STAGES.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white">
                {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar Prospecto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
