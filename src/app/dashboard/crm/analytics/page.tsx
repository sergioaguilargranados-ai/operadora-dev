"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { useToast } from '@/hooks/use-toast'
import {
    BarChart3, Loader2, RefreshCw, Users, TrendingUp, Target,
    Clock, ArrowDown, ArrowUp, Flame, CheckCircle, XCircle,
    Activity, Award, Zap, Calendar, DollarSign, ChevronRight,
    Percent
} from 'lucide-react'

// ═════════════════════════
// TYPES
// ═════════════════════════
interface KPIs {
    total_contacts: number
    new_today: number
    new_this_week: number
    new_this_month: number
    hot_leads: number
    total_value: number
    conversion_rate: number
    avg_response_time_hours: number
    overdue_tasks: number
    unassigned_contacts: number
}

interface FunnelStage {
    stage: string
    label: string
    count: number
    percentage: number
    drop_rate: number
    avg_days: number
    value: number
}

interface SourceItem {
    source: string
    count: number
    percentage: number
}

interface AgentRow {
    agent_id: number
    agent_name: string
    agent_email: string
    total_contacts: number
    hot_leads: number
    won: number
    lost: number
    conversion_rate: number
    avg_score: number
    total_tasks: number
    completed_tasks: number
    overdue_tasks: number
    total_interactions: number
    avg_response_hours: number
    total_pipeline_value: number
}

interface TrendDay {
    date: string
    count: number
}

interface TaskDay {
    date: string
    created: number
    completed: number
}

interface VelocityStage {
    stage: string
    avg_days: number
    median_days: number
    count: number
}

// ═════════════════════════
// HELPERS
// ═════════════════════════
const STAGE_COLORS: Record<string, string> = {
    new: '#3B82F6', qualified: '#8B5CF6', quoted: '#F59E0B',
    negotiation: '#EC4899', reserved: '#10B981', paid: '#059669',
    won: '#047857', traveling: '#0EA5E9', post_trip: '#6366F1', lost: '#EF4444',
}

const STAGE_LABELS: Record<string, string> = {
    new: 'Nuevo', qualified: 'Calificado', quoted: 'Cotizado',
    negotiation: 'Negociación', reserved: 'Reservado', paid: 'Pagado',
    won: 'Ganado', traveling: 'Viajando', post_trip: 'Post-viaje', lost: 'Perdido',
}

const fmtMoney = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
    return `$${v.toFixed(0)}`
}

const fmtNum = (n: number) => n.toLocaleString('es-MX')

// ═════════════════════════
// MAIN PAGE
// ═════════════════════════
export default function AnalyticsPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState(30)
    const [activeSection, setActiveSection] = useState<'overview' | 'funnel' | 'agents' | 'trends'>('overview')

    // Data
    const [kpis, setKpis] = useState<KPIs | null>(null)
    const [funnel, setFunnel] = useState<{ stages: FunnelStage[]; overall_rate: number }>({ stages: [], overall_rate: 0 })
    const [sources, setSources] = useState<SourceItem[]>([])
    const [agents, setAgents] = useState<AgentRow[]>([])
    const [trends, setTrends] = useState<{ leads_by_day: TrendDay[]; interactions_by_day: TrendDay[]; tasks_by_day: TaskDay[] }>({
        leads_by_day: [], interactions_by_day: [], tasks_by_day: [],
    })
    const [velocity, setVelocity] = useState<{ stages: VelocityStage[]; avg_total_days: number }>({ stages: [], avg_total_days: 0 })

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true)
            const [overviewRes, agentsRes, trendsRes, velocityRes] = await Promise.all([
                fetch('/api/crm/analytics?view=overview'),
                fetch('/api/crm/analytics?view=agents'),
                fetch(`/api/crm/analytics?view=trends&days=${period}`),
                fetch('/api/crm/analytics?view=velocity'),
            ])

            const [overviewJ, agentsJ, trendsJ, velocityJ] = await Promise.all([
                overviewRes.json(), agentsRes.json(), trendsRes.json(), velocityRes.json(),
            ])

            if (overviewJ.success) {
                setKpis(overviewJ.data.kpis)
                setSources(overviewJ.data.sources || [])
                setFunnel(overviewJ.data.funnel || { stages: [], overall_rate: 0 })
            }
            if (agentsJ.success) setAgents(agentsJ.data.agents || [])
            if (trendsJ.success) setTrends(trendsJ.data)
            if (velocityJ.success) setVelocity(velocityJ.data)
        } catch {
            toast({ title: 'Error cargando analytics', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }, [period, toast])

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        fetchAll()
    }, [isAuthenticated, fetchAll, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Cargando analytics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Analytics CRM
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Métricas, funnel, rendimiento y tendencias
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Período */}
                        <select
                            className="h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                            value={period}
                            onChange={e => setPeriod(parseInt(e.target.value))}
                        >
                            <option value={7}>7 días</option>
                            <option value={15}>15 días</option>
                            <option value={30}>30 días</option>
                            <option value={60}>60 días</option>
                            <option value={90}>90 días</option>
                        </select>
                        <Button variant="ghost" size="sm" onClick={fetchAll}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-6xl space-y-5">
                {/* Tabs */}
                <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200/60 gap-1">
                    {([
                        { key: 'overview' as const, label: 'Resumen', icon: BarChart3 },
                        { key: 'funnel' as const, label: 'Funnel', icon: Target },
                        { key: 'agents' as const, label: 'Agentes', icon: Users },
                        { key: 'trends' as const, label: 'Tendencias', icon: TrendingUp },
                    ]).map(tab => (
                        <button
                            key={tab.key}
                            className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-lg font-medium transition-all ${activeSection === tab.key
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            onClick={() => setActiveSection(tab.key)}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══════════════════════════ OVERVIEW ═══════════════════════════ */}
                {activeSection === 'overview' && kpis && (
                    <div className="space-y-5">
                        {/* KPIs principales */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { label: 'Total Contactos', value: fmtNum(kpis.total_contacts), icon: Users, color: '#3B82F6', sub: `+${kpis.new_this_week} esta semana` },
                                { label: 'Hot Leads', value: fmtNum(kpis.hot_leads), icon: Flame, color: '#EF4444', sub: 'Score > 70' },
                                { label: 'Tasa Conversión', value: `${kpis.conversion_rate}%`, icon: Target, color: '#10B981', sub: 'won+reserv+paid' },
                                { label: 'Valor Pipeline', value: fmtMoney(kpis.total_value), icon: DollarSign, color: '#F59E0B', sub: 'Budget estimado' },
                                { label: 'Tareas Vencidas', value: fmtNum(kpis.overdue_tasks), icon: Clock, color: kpis.overdue_tasks > 0 ? '#EF4444' : '#6B7280', sub: kpis.overdue_tasks > 0 ? '⚠️ Requieren atención' : 'Todo al día' },
                            ].map((k, i) => (
                                <Card key={i} className="p-4 border-0 bg-white shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: `${k.color}15` }}>
                                            <k.icon className="w-4.5 h-4.5" style={{ color: k.color }} />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-medium">{k.label}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">{k.sub}</div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Funnel rápido + Fuentes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Funnel mini */}
                            <Card className="p-5 border-0 bg-white shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <Target className="w-4 h-4 text-blue-500" /> Funnel de Conversión
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                        {funnel.overall_rate}% general
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {funnel.stages.map((s, i) => {
                                        const maxCount = Math.max(...funnel.stages.map(st => st.count), 1)
                                        const width = Math.max(8, (s.count / maxCount) * 100)
                                        return (
                                            <div key={i} className="group">
                                                <div className="flex items-center justify-between text-xs mb-0.5">
                                                    <span className="font-medium text-slate-700">{s.label}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500">{s.count}</span>
                                                        {s.drop_rate > 0 && i > 0 && (
                                                            <span className="text-[9px] text-red-400 flex items-center gap-0.5">
                                                                <ArrowDown className="w-2.5 h-2.5" /> {s.drop_rate}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                                        style={{
                                                            width: `${width}%`,
                                                            backgroundColor: STAGE_COLORS[s.stage] || '#94A3B8',
                                                        }}
                                                    >
                                                        <span className="text-[9px] text-white font-medium">
                                                            {s.percentage}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </Card>

                            {/* Fuentes */}
                            <Card className="p-5 border-0 bg-white shadow-sm">
                                <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                                    <Activity className="w-4 h-4 text-purple-500" /> Fuentes de Leads
                                </h3>
                                {sources.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm">Sin datos de fuentes</div>
                                ) : (
                                    <div className="space-y-3">
                                        {sources.slice(0, 8).map((s, i) => {
                                            const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#0EA5E9', '#EF4444', '#6366F1']
                                            const barColor = colors[i % colors.length]
                                            return (
                                                <div key={s.source}>
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="font-medium text-slate-700 capitalize">{s.source}</span>
                                                        <span className="text-slate-500">{s.count} ({s.percentage}%)</span>
                                                    </div>
                                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${s.percentage}%`, backgroundColor: barColor }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Velocidad del pipeline */}
                        <Card className="p-5 border-0 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" /> Velocidad del Pipeline
                                </h3>
                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                                    Promedio total: {velocity.avg_total_days} días
                                </span>
                            </div>
                            {velocity.stages.length === 0 ? (
                                <div className="text-center py-6 text-slate-400 text-sm">Sin datos de velocidad aún</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {velocity.stages.map((s) => (
                                        <div key={s.stage} className="text-center p-3 rounded-xl bg-slate-50">
                                            <div className="text-lg font-bold" style={{ color: STAGE_COLORS[s.stage] || '#6B7280' }}>
                                                {s.avg_days}d
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">
                                                {STAGE_LABELS[s.stage] || s.stage}
                                            </div>
                                            <div className="text-[9px] text-slate-400 mt-0.5">
                                                Mediana: {s.median_days}d · {s.count} leads
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {/* ═══════════════════════════ FUNNEL ═══════════════════════════ */}
                {activeSection === 'funnel' && (
                    <div className="space-y-5">
                        {/* Tasa global */}
                        <Card className="p-6 border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow flex items-center justify-center">
                                    <Percent className="w-7 h-7 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-green-700">{funnel.overall_rate}%</div>
                                    <div className="text-sm text-green-600 font-medium">Tasa de Conversión General</div>
                                    <div className="text-xs text-green-500">De lead nuevo → Ganado/Reservado/Pagado</div>
                                </div>
                            </div>
                        </Card>

                        {/* Etapas detalladas */}
                        <div className="space-y-3">
                            {funnel.stages.map((s, i) => {
                                const maxCount = Math.max(...funnel.stages.map(st => st.count), 1)
                                const width = Math.max(5, (s.count / maxCount) * 100)
                                return (
                                    <Card key={s.stage} className="p-0 overflow-hidden border-0 bg-white shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-stretch">
                                            {/* Barra lateral de color */}
                                            <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: STAGE_COLORS[s.stage] || '#94A3B8' }} />
                                            <div className="flex-1 p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                                            style={{ backgroundColor: STAGE_COLORS[s.stage] || '#94A3B8' }}>
                                                            {i + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-slate-800">{s.label}</h4>
                                                            <p className="text-[10px] text-slate-400">
                                                                Promedio {s.avg_days} días en esta etapa
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-slate-700">{s.count}</div>
                                                        <div className="text-[10px] text-slate-400">contactos</div>
                                                    </div>
                                                </div>

                                                {/* Barra de progreso */}
                                                <div className="h-6 bg-slate-100 rounded-full overflow-hidden mb-2">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700 flex items-center px-3"
                                                        style={{
                                                            width: `${width}%`,
                                                            backgroundColor: STAGE_COLORS[s.stage] || '#94A3B8',
                                                        }}
                                                    >
                                                        <span className="text-[10px] text-white font-bold">{s.percentage}%</span>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="flex items-center gap-4 text-[10px]">
                                                    <span className="flex items-center gap-1 text-slate-500">
                                                        <DollarSign className="w-3 h-3" /> Valor: {fmtMoney(s.value)}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-500">
                                                        <Clock className="w-3 h-3" /> {s.avg_days} días prom.
                                                    </span>
                                                    {s.drop_rate > 0 && i > 0 && (
                                                        <span className="flex items-center gap-1 text-red-400 font-medium">
                                                            <ArrowDown className="w-3 h-3" /> {s.drop_rate}% caída
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════ AGENTS ═══════════════════════════ */}
                {activeSection === 'agents' && (
                    <div className="space-y-4">
                        {agents.length === 0 ? (
                            <Card className="p-12 text-center border-0 bg-white shadow-sm">
                                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <h3 className="text-lg font-medium text-slate-500">Sin agentes registrados</h3>
                            </Card>
                        ) : (
                            <>
                                {/* Podio top 3 */}
                                {agents.length >= 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                                        {agents.slice(0, 3).map((ag, i) => {
                                            const medals = ['🥇', '🥈', '🥉']
                                            const bgColors = ['from-amber-50 to-yellow-50', 'from-slate-50 to-gray-50', 'from-orange-50 to-amber-50']
                                            return (
                                                <Card key={ag.agent_id}
                                                    className={`p-5 border-0 bg-gradient-to-br ${bgColors[i] || bgColors[2]} shadow-sm hover:shadow-md transition-all`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-2xl">{medals[i]}</span>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-bold text-slate-800">{ag.agent_name}</h4>
                                                            <p className="text-[10px] text-slate-400 truncate">{ag.agent_email}</p>
                                                            <div className="grid grid-cols-3 gap-2 mt-3">
                                                                <div className="text-center">
                                                                    <div className="text-lg font-bold text-green-600">{ag.won}</div>
                                                                    <div className="text-[9px] text-slate-400 uppercase">Ganados</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-lg font-bold text-blue-600">{ag.conversion_rate}%</div>
                                                                    <div className="text-[9px] text-slate-400 uppercase">Conversión</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-lg font-bold text-amber-600">{fmtMoney(ag.total_pipeline_value)}</div>
                                                                    <div className="text-[9px] text-slate-400 uppercase">Valor</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Tabla completa */}
                                <Card className="p-0 overflow-hidden border-0 bg-white shadow-sm">
                                    <div className="p-4 border-b bg-slate-50/50">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <Award className="w-4 h-4 text-purple-500" />
                                            Rendimiento por Agente
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b bg-slate-50/30">
                                                    <th className="text-left px-4 py-3 font-medium text-slate-500">Agente</th>
                                                    <th className="text-center px-2 py-3 font-medium text-slate-500">Contactos</th>
                                                    <th className="text-center px-2 py-3 font-medium text-slate-500">
                                                        <Flame className="w-3 h-3 inline text-red-400" /> Hot
                                                    </th>
                                                    <th className="text-center px-2 py-3 font-medium text-slate-500">
                                                        <CheckCircle className="w-3 h-3 inline text-green-500" /> Won
                                                    </th>
                                                    <th className="text-center px-2 py-3 font-medium text-slate-500">
                                                        <XCircle className="w-3 h-3 inline text-red-400" /> Lost
                                                    </th>
                                                    <th className="text-center px-2 py-3 font-medium text-slate-500">Conv %</th>
                                                    <th className="text-center px-2 py-3 font-medium text-slate-500">Score ∅</th>
                                                    <th className="text-center px-2 py-3 font-medium text-slate-500">Tareas</th>
                                                    <th className="text-center px-2 py-3 font-medium text-slate-500">
                                                        <Clock className="w-3 h-3 inline text-amber-500" /> Vencidas
                                                    </th>
                                                    <th className="text-center px-2 py-3 font-medium text-slate-500">Interacciones</th>
                                                    <th className="text-right px-4 py-3 font-medium text-slate-500">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {agents.map((ag, i) => (
                                                    <tr key={ag.agent_id} className={`border-b last:border-0 hover:bg-blue-50/30 transition-colors ${i < 3 ? 'bg-amber-50/20' : ''}`}>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-slate-800">{ag.agent_name}</div>
                                                            <div className="text-[10px] text-slate-400">{ag.agent_email}</div>
                                                        </td>
                                                        <td className="text-center px-2 py-3 font-medium">{ag.total_contacts}</td>
                                                        <td className="text-center px-2 py-3">
                                                            <span className={`font-medium ${ag.hot_leads > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                                {ag.hot_leads}
                                                            </span>
                                                        </td>
                                                        <td className="text-center px-2 py-3 font-bold text-green-600">{ag.won}</td>
                                                        <td className="text-center px-2 py-3 text-red-400">{ag.lost}</td>
                                                        <td className="text-center px-2 py-3">
                                                            <span className={`px-1.5 py-0.5 rounded-full font-medium ${ag.conversion_rate >= 30 ? 'bg-green-100 text-green-700' :
                                                                    ag.conversion_rate >= 15 ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {ag.conversion_rate}%
                                                            </span>
                                                        </td>
                                                        <td className="text-center px-2 py-3">{ag.avg_score}</td>
                                                        <td className="text-center px-2 py-3">
                                                            {ag.completed_tasks}/{ag.total_tasks}
                                                        </td>
                                                        <td className="text-center px-2 py-3">
                                                            <span className={`font-medium ${ag.overdue_tasks > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                                {ag.overdue_tasks}
                                                            </span>
                                                        </td>
                                                        <td className="text-center px-2 py-3">{ag.total_interactions}</td>
                                                        <td className="text-right px-4 py-3 font-medium text-slate-700">
                                                            {fmtMoney(ag.total_pipeline_value)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════ TRENDS ═══════════════════════════ */}
                {activeSection === 'trends' && (
                    <div className="space-y-5">
                        {/* Gráfica de leads por día - barras CSS */}
                        <Card className="p-5 border-0 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-500" /> Leads Nuevos por Día
                                </h3>
                                <span className="text-xs text-slate-400">Últimos {period} días</span>
                            </div>
                            {trends.leads_by_day.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">Sin datos en este período</div>
                            ) : (
                                <div className="flex items-end gap-1 h-40">
                                    {trends.leads_by_day.map(d => {
                                        const maxVal = Math.max(...trends.leads_by_day.map(x => x.count), 1)
                                        const h = Math.max(4, (d.count / maxVal) * 100)
                                        const dayLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                                        return (
                                            <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                                                <div className="absolute -top-6 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {dayLabel}: {d.count}
                                                </div>
                                                <div
                                                    className="w-full rounded-t-sm bg-blue-500 hover:bg-blue-600 transition-all cursor-default min-w-[3px]"
                                                    style={{ height: `${h}%` }}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                {trends.leads_by_day.length > 0 && (
                                    <>
                                        <span>{new Date(trends.leads_by_day[0].date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                                        <span>{new Date(trends.leads_by_day[trends.leads_by_day.length - 1].date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                                    </>
                                )}
                            </div>
                        </Card>

                        {/* Interacciones por día */}
                        <Card className="p-5 border-0 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-purple-500" /> Interacciones por Día
                                </h3>
                                <span className="text-xs text-slate-400">Últimos {period} días</span>
                            </div>
                            {trends.interactions_by_day.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">Sin interacciones en este período</div>
                            ) : (
                                <div className="flex items-end gap-1 h-32">
                                    {trends.interactions_by_day.map(d => {
                                        const maxVal = Math.max(...trends.interactions_by_day.map(x => x.count), 1)
                                        const h = Math.max(4, (d.count / maxVal) * 100)
                                        const dayLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                                        return (
                                            <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                                                <div className="absolute -top-6 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {dayLabel}: {d.count}
                                                </div>
                                                <div
                                                    className="w-full rounded-t-sm bg-purple-500 hover:bg-purple-600 transition-all cursor-default min-w-[3px]"
                                                    style={{ height: `${h}%` }}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </Card>

                        {/* Tareas creadas vs completadas */}
                        <Card className="p-5 border-0 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-amber-500" /> Tareas: Creadas vs Completadas
                                </h3>
                                <div className="flex items-center gap-3 text-[10px]">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Creadas</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Completadas</span>
                                </div>
                            </div>
                            {trends.tasks_by_day.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">Sin datos de tareas</div>
                            ) : (
                                <div className="space-y-1.5">
                                    {trends.tasks_by_day.filter(d => d.created > 0 || d.completed > 0).slice(-15).map(d => {
                                        const maxVal = Math.max(
                                            ...trends.tasks_by_day.map(x => Math.max(x.created, x.completed)), 1
                                        )
                                        const dayLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', weekday: 'short' })
                                        return (
                                            <div key={d.date} className="flex items-center gap-2 text-[10px]">
                                                <span className="w-16 text-slate-500 text-right flex-shrink-0">{dayLabel}</span>
                                                <div className="flex-1 flex gap-1 h-4">
                                                    <div
                                                        className="h-full rounded-sm bg-amber-400/80"
                                                        style={{ width: `${Math.max(2, (d.created / maxVal) * 100)}%` }}
                                                        title={`Creadas: ${d.created}`}
                                                    />
                                                    <div
                                                        className="h-full rounded-sm bg-green-500/80"
                                                        style={{ width: `${Math.max(2, (d.completed / maxVal) * 100)}%` }}
                                                        title={`Completadas: ${d.completed}`}
                                                    />
                                                </div>
                                                <span className="w-10 text-slate-400 flex-shrink-0">{d.created}/{d.completed}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </Card>

                        {/* Totales del período */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                {
                                    label: 'Total Leads',
                                    value: trends.leads_by_day.reduce((s, d) => s + d.count, 0),
                                    icon: Users, color: '#3B82F6'
                                },
                                {
                                    label: 'Total Interacciones',
                                    value: trends.interactions_by_day.reduce((s, d) => s + d.count, 0),
                                    icon: Activity, color: '#8B5CF6'
                                },
                                {
                                    label: 'Tareas Creadas',
                                    value: trends.tasks_by_day.reduce((s, d) => s + d.created, 0),
                                    icon: Calendar, color: '#F59E0B'
                                },
                                {
                                    label: 'Tareas Completadas',
                                    value: trends.tasks_by_day.reduce((s, d) => s + d.completed, 0),
                                    icon: CheckCircle, color: '#10B981'
                                },
                            ].map((s, i) => (
                                <Card key={i} className="p-3 text-center border-0 bg-white shadow-sm">
                                    <s.icon className="w-5 h-5 mx-auto mb-1" style={{ color: s.color }} />
                                    <div className="text-xl font-bold" style={{ color: s.color }}>{fmtNum(s.value)}</div>
                                    <div className="text-[10px] text-slate-500 uppercase">{s.label}</div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
