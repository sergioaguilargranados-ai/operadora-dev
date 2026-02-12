"use client"

import { useState, useEffect, useCallback } from 'react'
import {
    Briefcase, Search, Plus, Eye, Edit,
    TrendingUp, DollarSign, Target,
    MapPin, Award, Mail, Phone, X,
    Star, ChevronRight
} from 'lucide-react'

interface Agent {
    id: number
    employee_number: string
    first_name: string
    last_name: string
    full_name: string
    email: string
    phone: string
    mobile: string
    employee_type: string
    employment_status: string
    agency_name: string | null
    agent_referral_code: string | null
    agent_commission_rate: number | null
    agent_commission_split: number | null
    agent_certification: string | null
    agent_territory: string | null
    agent_monthly_target: number | null
    agent_ytd_sales: number | null
    photo_url: string | null
    created_at: string
}

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [total, setTotal] = useState(0)
    const [showNewForm, setShowNewForm] = useState(false)

    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', phone: '', mobile: '',
        employee_type: 'agent',
        agent_referral_code: '', agent_commission_rate: '',
        agent_commission_split: '', agent_certification: '',
        agent_territory: '', agent_monthly_target: '',
        tax_regime: '', rfc: '', curp: ''
    })
    const [saving, setSaving] = useState(false)

    const fetchAgents = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                action: 'employees',
                employee_type: 'agent',
                limit: '50',
                offset: '0'
            })
            if (search) params.set('search', search)

            const res = await fetch(`/api/hr?${params}`)
            const data = await res.json()
            if (data.success) {
                setAgents(data.data || [])
                setTotal(data.meta?.total || 0)
            }
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }, [search])

    useEffect(() => { fetchAgents() }, [fetchAgents])
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('new') === 'true') setShowNewForm(true)
    }, [])

    const handleCreateAgent = async () => {
        if (!form.first_name || !form.last_name) return
        setSaving(true)
        try {
            const res = await fetch('/api/hr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_employee',
                    ...form,
                    agent_commission_rate: form.agent_commission_rate ? parseFloat(form.agent_commission_rate) : null,
                    agent_commission_split: form.agent_commission_split ? parseFloat(form.agent_commission_split) : null,
                    agent_monthly_target: form.agent_monthly_target ? parseFloat(form.agent_monthly_target) : null
                })
            })
            const data = await res.json()
            if (data.success) {
                setShowNewForm(false)
                setForm({
                    first_name: '', last_name: '', email: '', phone: '', mobile: '',
                    employee_type: 'agent',
                    agent_referral_code: '', agent_commission_rate: '',
                    agent_commission_split: '', agent_certification: '',
                    agent_territory: '', agent_monthly_target: '',
                    tax_regime: '', rfc: '', curp: ''
                })
                fetchAgents()
            }
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setSaving(false)
        }
    }

    const formatCurrency = (amount: number | null) => {
        if (!amount) return '$0'
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount)
    }

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-purple-600" />
                                Agentes de Ventas
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">{total} agentes registrados</p>
                        </div>
                        <button onClick={() => setShowNewForm(true)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm">
                            <Plus className="w-3.5 h-3.5" />
                            Nuevo Agente
                        </button>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Buscar agente..."
                                value={search} onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                ) : agents.length === 0 ? (
                    <div className="text-center py-20">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No hay agentes registrados</p>
                        <button onClick={() => setShowNewForm(true)} className="mt-3 text-xs text-purple-600 hover:text-purple-700 font-medium">
                            + Registrar primer agente
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {agents.map((agent) => (
                            <div key={agent.id} className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-200 group">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                                        {agent.photo_url
                                            ? <img src={agent.photo_url} alt="" className="w-full h-full rounded-xl object-cover" />
                                            : getInitials(agent.full_name || `${agent.first_name} ${agent.last_name}`)
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                {agent.full_name || `${agent.first_name} ${agent.last_name}`}
                                            </h3>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1 hover:bg-purple-50 rounded-lg text-gray-400 hover:text-purple-600" title="Ver"><Eye className="w-3.5 h-3.5" /></button>
                                                <button className="p-1 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600" title="Editar"><Edit className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>

                                        {agent.agency_name && (
                                            <span className="text-[10px] text-purple-600 font-medium">{agent.agency_name}</span>
                                        )}

                                        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                                            {agent.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{agent.email}</span>}
                                            {agent.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{agent.phone}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Agent specific data */}
                                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-50">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-purple-600">{agent.agent_commission_rate || 0}%</div>
                                        <div className="text-[10px] text-gray-400">Comisión</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-emerald-600">{formatCurrency(agent.agent_ytd_sales)}</div>
                                        <div className="text-[10px] text-gray-400">Ventas YTD</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-amber-600">{formatCurrency(agent.agent_monthly_target)}</div>
                                        <div className="text-[10px] text-gray-400">Meta Mensual</div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex items-center gap-2 mt-3">
                                    {agent.agent_referral_code && (
                                        <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                                            🔗 {agent.agent_referral_code}
                                        </span>
                                    )}
                                    {agent.agent_territory && (
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                            <MapPin className="w-2.5 h-2.5" /> {agent.agent_territory}
                                        </span>
                                    )}
                                    {agent.agent_certification && (
                                        <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                            <Award className="w-2.5 h-2.5" /> {agent.agent_certification}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Nuevo Agente */}
            {showNewForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-purple-600" />
                                Nuevo Agente de Ventas
                            </h2>
                            <button onClick={() => setShowNewForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Datos Personales</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Nombre *</label>
                                        <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" placeholder="Nombre(s)" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Apellidos *</label>
                                        <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" placeholder="Apellidos" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Email</label>
                                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Teléfono</label>
                                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Datos de Agente</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Código de Referido</label>
                                        <input type="text" value={form.agent_referral_code} onChange={(e) => setForm({ ...form, agent_referral_code: e.target.value.toUpperCase() })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 uppercase" placeholder="AGENTE-001" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">% Comisión</label>
                                        <input type="number" value={form.agent_commission_rate} onChange={(e) => setForm({ ...form, agent_commission_rate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                            placeholder="10" min="0" max="100" step="0.5" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Territorio / Zona</label>
                                        <input type="text" value={form.agent_territory} onChange={(e) => setForm({ ...form, agent_territory: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="Ej: CDMX, Toluca..." />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Meta Mensual (MXN)</label>
                                        <input type="number" value={form.agent_monthly_target} onChange={(e) => setForm({ ...form, agent_monthly_target: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="50000" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Certificaciones</label>
                                        <input type="text" value={form.agent_certification} onChange={(e) => setForm({ ...form, agent_certification: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="Ej: SECTUR, IATA..." />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">% Split con Agencia</label>
                                        <input type="number" value={form.agent_commission_split} onChange={(e) => setForm({ ...form, agent_commission_split: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                            placeholder="50" min="0" max="100" step="1" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Datos Fiscales</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">Régimen Fiscal</label>
                                        <select value={form.tax_regime} onChange={(e) => setForm({ ...form, tax_regime: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                                            <option value="">Seleccionar...</option>
                                            <option value="612">612 - Personas Físicas</option>
                                            <option value="621">621 - Incorporación Fiscal</option>
                                            <option value="626">626 - RESICO</option>
                                            <option value="601">601 - General Ley PM</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">RFC</label>
                                        <input type="text" value={form.rfc} onChange={(e) => setForm({ ...form, rfc: e.target.value.toUpperCase() })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase" maxLength={13} />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-600 mb-1 block">CURP</label>
                                        <input type="text" value={form.curp} onChange={(e) => setForm({ ...form, curp: e.target.value.toUpperCase() })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase" maxLength={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100">
                            <button onClick={() => setShowNewForm(false)}
                                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleCreateAgent}
                                disabled={saving || !form.first_name || !form.last_name}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 shadow-sm">
                                {saving ? 'Guardando...' : 'Crear Agente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
