"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import {
    TrendingUp, Users, DollarSign, Target, Zap,
    AlertTriangle, Clock, Flame, BarChart3,
    RefreshCw, Loader2, Crown, ArrowRight,
    CheckCircle, XCircle, Timer, UserPlus,
    Award, Activity, ChevronRight, ArrowUpRight
} from 'lucide-react'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface ExecutiveData {
    period: string
    overview: {
        total_contacts: number
        new_in_period: number
        hot_leads: number
        converted: number
        lost: number
        pipeline_value: number
        revenue_closed: number
        avg_score: number
        unassigned: number
    }
    pipeline_by_stage: { pipeline_stage: string; count: number; value: number }[]
    conversion_metrics: {
        total: number; converted: number; conversion_rate: number
        loss_rate: number; avg_days_to_close: number
    }
    top_agents: {
        agent_name: string; total: number; won: number
        revenue: number; conversion_rate: number
    }[]
    top_sources: {
        source: string; total: number; converted: number; conversion_rate: number
    }[]
    revenue_by_month: {
        month: string; month_label: string; new_contacts: number
        conversions: number; revenue: number
    }[]
    stage_distribution: { pipeline_stage: string; count: number }[]
    urgent_items: {
        overdue_tasks: number; active_hot_leads: number
        urgent_notifications: number; unassigned: number
    }
    velocity: { avg_days_to_close: number; median_days_to_close: number }
    activity_summary: {
        total_interactions: number; total_tasks_created: number
        tasks_completed: number; new_contacts: number
    }
}

const PERIOD_LABELS: Record<string, string> = {
    today: 'Hoy', week: 'Esta semana', month: 'Este mes',
    quarter: 'Este trimestre', year: 'Este año'
}

const STAGE_LABELS: Record<string, string> = {
    new: 'Nuevo', qualified: 'Calificado', interested: 'Interesado',
    quoted: 'Cotizado', negotiation: 'Negociación', reserved: 'Reservado',
    paid: 'Pagado', traveling: 'Viajando', post_trip: 'Post-viaje',
    won: 'Ganado', lost: 'Perdido'
}

const STAGE_COLORS: Record<string, string> = {
    new: '#3B82F6', qualified: '#8B5CF6', interested: '#EC4899',
    quoted: '#F59E0B', negotiation: '#EF4444', reserved: '#10B981',
    paid: '#059669', traveling: '#06B6D4', post_trip: '#6366F1',
    won: '#22C55E', lost: '#EF4444'
}

// ═══════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════

export default function ExecutiveDashboard() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [data, setData] = useState<ExecutiveData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('month')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/crm/executive?period=${period}`)
            const json = await res.json()
            if (json.success) setData(json.data)
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }, [period])

    useEffect(() => { fetchData() }, [fetchData])

    const fmt = (n: number | string | null | undefined): string => {
        const num = typeof n === 'string' ? parseFloat(n) : (n || 0)
        if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
        return `$${num.toLocaleString('es-MX')}`
    }

    const pct = (n: number | string | null | undefined): string => {
        const num = typeof n === 'string' ? parseFloat(n) : (n || 0)
        return `${num}%`
    }

    const num = (n: number | string | null | undefined): number => {
        return typeof n === 'string' ? parseInt(n) : (n || 0)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2 text-white">
                            <Crown className="w-5 h-5 text-amber-400" />
                            Dashboard Ejecutivo
                        </h1>
                        <p className="text-xs text-slate-400">
                            Vista gerencial del CRM • {PERIOD_LABELS[period]}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="h-7 px-2 text-xs rounded-lg border border-slate-600 bg-slate-800 text-white"
                            value={period}
                            onChange={e => setPeriod(e.target.value)}
                        >
                            {Object.entries(PERIOD_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white"
                            onClick={fetchData}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </PageHeader>

            {loading && !data ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                </div>
            ) : data ? (
                <main className="container mx-auto px-4 py-5 max-w-6xl space-y-5">

                    {/* ═══════════ ROW 1: HERO KPIs ═══════════ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <HeroCard
                            icon={<DollarSign className="w-5 h-5" />}
                            label="Revenue Cerrado"
                            value={fmt(data.overview.revenue_closed)}
                            color="from-emerald-500 to-green-600"
                        />
                        <HeroCard
                            icon={<TrendingUp className="w-5 h-5" />}
                            label="Pipeline Total"
                            value={fmt(data.overview.pipeline_value)}
                            color="from-blue-500 to-indigo-600"
                        />
                        <HeroCard
                            icon={<Target className="w-5 h-5" />}
                            label="Conversión"
                            value={pct(data.conversion_metrics.conversion_rate)}
                            color="from-violet-500 to-purple-600"
                        />
                        <HeroCard
                            icon={<Timer className="w-5 h-5" />}
                            label="Días prom. cierre"
                            value={`${num(data.velocity.avg_days_to_close)}d`}
                            color="from-amber-500 to-orange-600"
                        />
                    </div>

                    {/* ═══════════ ROW 2: QUICK STATS ═══════════ */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        <StatPill icon={<UserPlus className="w-3.5 h-3.5" />} label="Nuevos" value={num(data.overview.new_in_period)} />
                        <StatPill icon={<Flame className="w-3.5 h-3.5 text-orange-400" />} label="Hot leads" value={num(data.overview.hot_leads)} />
                        <StatPill icon={<CheckCircle className="w-3.5 h-3.5 text-green-400" />} label="Convertidos" value={num(data.overview.converted)} />
                        <StatPill icon={<XCircle className="w-3.5 h-3.5 text-red-400" />} label="Perdidos" value={num(data.overview.lost)} />
                        <StatPill icon={<Activity className="w-3.5 h-3.5 text-cyan-400" />} label="Interacciones" value={num(data.activity_summary.total_interactions)} />
                        <StatPill icon={<Users className="w-3.5 h-3.5 text-violet-400" />} label="Sin asignar" value={num(data.overview.unassigned)} />
                    </div>

                    {/* ═══════════ URGENT ALERTS ═══════════ */}
                    {(num(data.urgent_items.overdue_tasks) > 0 || num(data.urgent_items.urgent_notifications) > 0) && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <div className="flex-1 flex flex-wrap gap-3 text-xs text-red-300">
                                {num(data.urgent_items.overdue_tasks) > 0 && (
                                    <span>⏰ {data.urgent_items.overdue_tasks} tareas vencidas</span>
                                )}
                                {num(data.urgent_items.urgent_notifications) > 0 && (
                                    <span>🔔 {data.urgent_items.urgent_notifications} notificaciones urgentes</span>
                                )}
                                {num(data.urgent_items.unassigned) > 0 && (
                                    <span>👤 {data.urgent_items.unassigned} leads sin asignar</span>
                                )}
                            </div>
                            <Button
                                size="sm"
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs h-7 rounded-lg"
                                onClick={() => router.push('/dashboard/crm/notifications')}
                            >
                                Atender <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                    )}

                    {/* ═══════════ ROW 3: PIPELINE + REVENUE CHART ═══════════ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Pipeline por etapa */}
                        <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-400" />
                                Pipeline por Etapa
                            </h3>
                            <div className="space-y-2">
                                {data.pipeline_by_stage.map(stage => {
                                    const maxVal = Math.max(...data.pipeline_by_stage.map(s => parseFloat(String(s.value)) || 0), 1)
                                    const val = parseFloat(String(stage.value)) || 0
                                    const width = Math.max(2, (val / maxVal) * 100)
                                    return (
                                        <div key={stage.pipeline_stage} className="flex items-center gap-2">
                                            <div className="w-20 text-[10px] text-slate-400 text-right flex-shrink-0">
                                                {STAGE_LABELS[stage.pipeline_stage] || stage.pipeline_stage}
                                            </div>
                                            <div className="flex-1 bg-slate-700/50 rounded-full h-5 relative overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${width}%`,
                                                        backgroundColor: STAGE_COLORS[stage.pipeline_stage] || '#64748b',
                                                    }}
                                                />
                                                <span className="absolute right-2 top-0.5 text-[9px] text-white/70">
                                                    {num(stage.count)} • {fmt(stage.value)}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>

                        {/* Revenue por mes */}
                        <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                Revenue por Mes (6 meses)
                            </h3>
                            {data.revenue_by_month.length > 0 ? (
                                <div className="flex items-end gap-1 h-36">
                                    {data.revenue_by_month.map(m => {
                                        const maxRev = Math.max(...data.revenue_by_month.map(x => parseFloat(String(x.revenue)) || 0), 1)
                                        const rev = parseFloat(String(m.revenue)) || 0
                                        const height = Math.max(4, (rev / maxRev) * 100)
                                        return (
                                            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                                <div className="text-[8px] text-emerald-300">{fmt(m.revenue)}</div>
                                                <div className="w-full relative" style={{ height: `${height}%` }}>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md" />
                                                </div>
                                                <div className="text-[9px] text-slate-500">{m.month_label}</div>
                                                <div className="text-[8px] text-slate-600">{num(m.conversions)} conv</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-36 flex items-center justify-center text-slate-500 text-xs">
                                    Sin datos de revenue
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ═══════════ ROW 4: TOP AGENTS + TOP SOURCES ═══════════ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Top Agentes */}
                        <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-400" />
                                Top Agentes
                            </h3>
                            {data.top_agents.length > 0 ? (
                                <div className="space-y-2">
                                    {data.top_agents.map((agent, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' :
                                                    i === 1 ? 'bg-slate-400/20 text-slate-300' :
                                                        i === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                            'bg-slate-600/30 text-slate-400'
                                                }`}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-white font-medium truncate">{agent.agent_name}</div>
                                                <div className="text-[10px] text-slate-500">
                                                    {num(agent.total)} contactos • {num(agent.won)} ganados
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-xs font-bold text-emerald-400">{fmt(agent.revenue)}</div>
                                                <div className="text-[10px] text-slate-500">{pct(agent.conversion_rate)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-slate-500 text-xs text-center py-6">Sin datos de agentes</div>
                            )}
                        </Card>

                        {/* Top Fuentes */}
                        <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-cyan-400" />
                                Fuentes de Leads
                            </h3>
                            {data.top_sources.length > 0 ? (
                                <div className="space-y-2">
                                    {data.top_sources.map((src, i) => {
                                        const maxTotal = Math.max(...data.top_sources.map(s => num(s.total)), 1)
                                        const width = Math.max(5, (num(src.total) / maxTotal) * 100)
                                        return (
                                            <div key={i} className="space-y-0.5">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-slate-300 capitalize">{src.source}</span>
                                                    <span className="text-slate-500">
                                                        {num(src.total)} leads • {num(src.converted)} conv • {pct(src.conversion_rate)}
                                                    </span>
                                                </div>
                                                <div className="bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                                                        style={{ width: `${width}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-slate-500 text-xs text-center py-6">Sin datos de fuentes</div>
                            )}
                        </Card>
                    </div>

                    {/* ═══════════ ROW 5: VELOCITY + ACTIVITY ═══════════ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Velocidad */}
                        <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-400" />
                                Velocidad de Cierre
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                                    <div className="text-2xl font-bold text-orange-400">
                                        {num(data.velocity.avg_days_to_close)}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1">Promedio (días)</div>
                                </div>
                                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                                    <div className="text-2xl font-bold text-amber-400">
                                        {num(data.velocity.median_days_to_close)}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1">Mediana (días)</div>
                                </div>
                            </div>
                            <div className="mt-3 text-center">
                                <div className="text-[10px] text-slate-500">
                                    Conversión: {pct(data.conversion_metrics.conversion_rate)} •
                                    Pérdida: {pct(data.conversion_metrics.loss_rate)}
                                </div>
                            </div>
                        </Card>

                        {/* Actividad */}
                        <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                Actividad del Período
                            </h3>
                            <div className="space-y-2">
                                <ActivityRow label="Contactos nuevos" value={num(data.activity_summary.new_contacts)} icon="👤" />
                                <ActivityRow label="Interacciones" value={num(data.activity_summary.total_interactions)} icon="💬" />
                                <ActivityRow label="Tareas creadas" value={num(data.activity_summary.total_tasks_created)} icon="📋" />
                                <ActivityRow label="Tareas completadas" value={num(data.activity_summary.tasks_completed)} icon="✅" />
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                Acciones Rápidas
                            </h3>
                            <div className="space-y-2">
                                <QuickAction
                                    label="Ver todos los contactos"
                                    onClick={() => router.push('/dashboard/crm')}
                                />
                                <QuickAction
                                    label="Pipeline Kanban"
                                    onClick={() => router.push('/dashboard/crm/pipeline')}
                                />
                                <QuickAction
                                    label="Analytics detallado"
                                    onClick={() => router.push('/dashboard/crm/analytics')}
                                />
                                <QuickAction
                                    label="Exportar reportes CSV"
                                    onClick={() => window.open('/api/crm/export?type=contacts', '_blank')}
                                />
                                <QuickAction
                                    label="Ejecutar escalación"
                                    onClick={async () => {
                                        await fetch('/api/crm/escalation', { method: 'POST' })
                                        fetchData()
                                    }}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* ═══════════ ROW 6: STAGE DISTRIBUTION ═══════════ */}
                    <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur">
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-violet-400" />
                            Distribución del Pipeline
                        </h3>
                        <div className="flex items-center gap-1 h-10 rounded-xl overflow-hidden">
                            {data.stage_distribution.map(s => {
                                const totalCount = data.stage_distribution.reduce((sum, x) => sum + num(x.count), 0) || 1
                                const pctValue = (num(s.count) / totalCount) * 100
                                if (pctValue < 1) return null
                                return (
                                    <div
                                        key={s.pipeline_stage}
                                        className="h-full flex items-center justify-center text-white text-[8px] font-medium transition-all hover:opacity-80 cursor-default"
                                        style={{
                                            width: `${pctValue}%`,
                                            backgroundColor: STAGE_COLORS[s.pipeline_stage] || '#64748b',
                                            minWidth: pctValue > 3 ? 'auto' : 0,
                                        }}
                                        title={`${STAGE_LABELS[s.pipeline_stage] || s.pipeline_stage}: ${num(s.count)} (${pctValue.toFixed(1)}%)`}
                                    >
                                        {pctValue > 5 ? `${STAGE_LABELS[s.pipeline_stage] || s.pipeline_stage} ${num(s.count)}` : ''}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-3">
                            {data.stage_distribution.map(s => (
                                <div key={s.pipeline_stage} className="flex items-center gap-1.5 text-[10px]">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[s.pipeline_stage] || '#64748b' }} />
                                    <span className="text-slate-400">
                                        {STAGE_LABELS[s.pipeline_stage] || s.pipeline_stage}: {num(s.count)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                </main>
            ) : null}
        </div>
    )
}

// ═══════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════

function HeroCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    return (
        <div className={`p-4 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <div className="flex items-center gap-2 text-white/80 mb-1">
                {icon}
                <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
        </div>
    )
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2">
            {icon}
            <div>
                <div className="text-sm font-bold text-white">{value}</div>
                <div className="text-[9px] text-slate-500">{label}</div>
            </div>
        </div>
    )
}

function ActivityRow({ label, value, icon }: { label: string; value: number; icon: string }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-slate-700/30 last:border-0">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="text-sm">{icon}</span> {label}
            </span>
            <span className="text-sm font-bold text-white">{value}</span>
        </div>
    )
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 bg-slate-700/20 hover:bg-slate-700/40 rounded-lg transition-colors group"
            onClick={onClick}
        >
            <span>{label}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
        </button>
    )
}
