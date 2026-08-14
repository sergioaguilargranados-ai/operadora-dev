"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/PageHeader'
import { useToast } from '@/hooks/use-toast'
import {
    Users, UserPlus, Target, TrendingUp,
    Search, Plus, Filter, ChevronRight,
    Phone, Mail, MessageSquare, Calendar,
    Flame, AlertTriangle, ArrowRight, Clock,
    CheckCircle, XCircle, Loader2, BarChart3,
    Eye, Zap, ListTodo, RefreshCw, Bell, Upload, Download, FileText
} from 'lucide-react'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface DashboardKPIs {
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

interface PipelineStage {
    id: number
    stage_key: string
    stage_label: string
    stage_order: number
    color: string
    icon: string
    count: number
    total_value: number
}

interface HotLead {
    id: number
    full_name: string
    email: string
    phone: string
    lead_score: number
    pipeline_stage: string
    interested_destination: string
    source: string
    assigned_agent_name: string
    created_at: string
    last_contact_at: string
}

interface RecentActivity {
    id: number
    interaction_type: string
    subject: string
    created_at: string
    is_automated: boolean
    contact_name: string
    pipeline_stage: string
    lead_score: number
    performed_by_name: string
}

interface SourceDistribution {
    source: string
    count: number
    percentage: number
}

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

const STAGE_COLORS: Record<string, string> = {
    new: '#94A3B8',
    qualified: '#3B82F6',
    quoted: '#8B5CF6',
    negotiation: '#F59E0B',
    reserved: '#10B981',
    paid: '#059669',
    traveling: '#06B6D4',
    post_trip: '#8B5CF6',
    won: '#22C55E',
    lost: '#EF4444',
}

const INTERACTION_ICONS: Record<string, string> = {
    call_outbound: '📞',
    call_inbound: '📲',
    email_sent: '📧',
    email_received: '📩',
    whatsapp_sent: '💬',
    whatsapp_received: '💬',
    meeting: '🤝',
    note: '📝',
    system_auto: '⚙️',
    quote_sent: '💰',
    booking_created: '📅',
    payment_received: '💳',
}

// ═══════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════

function KPICard({ title, value, subtitle, icon: Icon, color, onClick }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ElementType
    color: string
    onClick?: () => void
}) {
    return (
        <Card
            className={`p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200/60 hover:shadow-lg hover:border-blue-200 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
                    {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
            </div>
        </Card>
    )
}

function PipelineBar({ stages }: { stages: PipelineStage[] }) {
    const total = stages.reduce((sum, s) => sum + (s.count || 0), 0)
    if (total === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay contactos en el pipeline.</p>
                <p className="text-xs mt-1">Crea tu primer contacto para empezar.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {stages.filter(s => !['won', 'lost'].includes(s.stage_key)).map(stage => {
                const percentage = total > 0 ? (stage.count / total) * 100 : 0
                return (
                    <div key={stage.stage_key} className="flex items-center gap-3">
                        <span className="text-lg w-8 text-center flex-shrink-0">{stage.icon}</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700 truncate">{stage.stage_label}</span>
                                <span className="text-sm font-bold" style={{ color: stage.color }}>{stage.count}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.max(percentage, 2)}%`,
                                        backgroundColor: stage.color,
                                    }}
                                />
                            </div>
                        </div>
                        {stage.total_value > 0 && (
                            <span className="text-xs text-slate-400 flex-shrink-0">
                                ${Number(stage.total_value).toLocaleString('es-MX')}
                            </span>
                        )}
                    </div>
                )
            })}
            <div className="flex gap-4 pt-2 border-t mt-2">
                {stages.filter(s => ['won', 'lost'].includes(s.stage_key)).map(stage => (
                    <div key={stage.stage_key} className="flex items-center gap-2">
                        <span className="text-sm">{stage.icon}</span>
                        <span className="text-sm font-medium" style={{ color: stage.color }}>
                            {stage.stage_label}: {stage.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function HotLeadCard({ lead, onClick }: { lead: HotLead; onClick: () => void }) {
    return (
        <div
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50/50 cursor-pointer transition-all border border-transparent hover:border-orange-200/50 group"
            onClick={onClick}
        >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {lead.lead_score}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">{lead.full_name}</p>
                    <Flame className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                </div>
                <p className="text-xs text-slate-500 truncate">
                    {lead.interested_destination || lead.source || 'Sin destino'}
                    {lead.assigned_agent_name && ` · ${lead.assigned_agent_name}`}
                </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 transition-colors flex-shrink-0" />
        </div>
    )
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
    const icon = INTERACTION_ICONS[activity.interaction_type] || '📋'
    const timeAgo = getTimeAgo(activity.created_at)

    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
            <span className="text-base mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">
                    <span className="font-medium">{activity.contact_name}</span>
                    {' · '}
                    <span className="text-slate-500">{activity.subject || activity.interaction_type}</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{timeAgo}</span>
                    {activity.performed_by_name && (
                        <span className="text-xs text-slate-400">por {activity.performed_by_name}</span>
                    )}
                    {activity.is_automated && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-blue-500">
                            <Zap className="w-3 h-3" /> Auto
                        </span>
                    )}
                </div>
            </div>
            {activity.lead_score > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activity.lead_score >= 70 ? 'bg-orange-100 text-orange-700' :
                    activity.lead_score >= 40 ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                    {activity.lead_score}
                </span>
            )}
        </div>
    )
}

function SourceChart({ sources }: { sources: SourceDistribution[] }) {
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#6366F1']

    if (sources.length === 0) {
        return (
            <div className="text-center py-6 text-slate-400">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin datos de fuentes aún</p>
            </div>
        )
    }

    return (
        <div className="space-y-2.5">
            {sources.map((source, idx) => (
                <div key={source.source} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                    <span className="text-sm text-slate-600 flex-1 truncate">{source.source}</span>
                    <span className="text-sm font-semibold text-slate-800">{source.count}</span>
                    <span className="text-xs text-slate-400 w-10 text-right">{source.percentage}%</span>
                </div>
            ))}
        </div>
    )
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

function getTimeAgo(dateStr: string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'hace un momento'
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`
    if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)}d`
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

function formatCurrency(value: number): string {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString('es-MX')}`
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════

export default function CRMDashboardPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Data
    const [kpis, setKPIs] = useState<DashboardKPIs | null>(null)
    const [stages, setStages] = useState<PipelineStage[]>([])
    const [hotLeads, setHotLeads] = useState<HotLead[]>([])
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
    const [sources, setSources] = useState<SourceDistribution[]>([])

    // New Contact Modal
    const [showNewContact, setShowNewContact] = useState(false)
    const [newContactForm, setNewContactForm] = useState({
        full_name: '', email: '', phone: '', source: 'web',
        interested_destination: '', notes: ''
    })
    const [saving, setSaving] = useState(false)

    const fetchDashboard = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true)
            else setLoading(true)

            const res = await fetch('/api/crm/dashboard')
            if (!res.ok) throw new Error('Error al cargar dashboard')

            const data = await res.json()
            if (data.success) {
                setKPIs(data.data.kpis)
                setStages(data.data.pipeline_stages || [])
                setHotLeads(data.data.hot_leads || [])
                setRecentActivity(data.data.recent_activity || [])
                setSources(data.data.sources || [])
            }
        } catch (error) {
            console.error('Error fetching CRM dashboard:', error)
            if (!isRefresh) {
                // Si es primera carga y falla, puede que las tablas no existan aún
                setKPIs({
                    total_contacts: 0, new_today: 0, new_this_week: 0, new_this_month: 0,
                    hot_leads: 0, total_value: 0, conversion_rate: 0,
                    avg_response_time_hours: 0, overdue_tasks: 0, unassigned_contacts: 0
                })
            }
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchDashboard()
    }, [isAuthenticated, fetchDashboard, router])

    const handleCreateContact = async () => {
        if (!newContactForm.full_name.trim()) {
            toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' })
            return
        }

        try {
            setSaving(true)
            const res = await fetch('/api/crm/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContactForm),
            })

            const data = await res.json()
            if (data.success) {
                toast({ title: '✅ Contacto creado', description: `${newContactForm.full_name} agregado al CRM` })
                setShowNewContact(false)
                setNewContactForm({ full_name: '', email: '', phone: '', source: 'web', interested_destination: '', notes: '' })
                fetchDashboard(true)
            } else {
                toast({ title: 'Error', description: data.error, variant: 'destructive' })
            }
        } catch {
            toast({ title: 'Error', description: 'No se pudo crear el contacto', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                    <p className="text-sm text-slate-500 mt-3">Cargando CRM...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            CRM
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Centro de Relación con Clientes
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchDashboard(true)}
                            disabled={refreshing}
                            className="text-slate-500"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full gap-1.5"
                            onClick={() => setShowNewContact(true)}
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Contacto
                        </Button>
                    </div>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <KPICard
                        title="Contactos"
                        value={kpis?.total_contacts || 0}
                        subtitle={`+${kpis?.new_this_week || 0} esta semana`}
                        icon={Users}
                        color="#3B82F6"
                        onClick={() => router.push('/dashboard/crm/contacts')}
                    />
                    <KPICard
                        title="Leads Calientes"
                        value={kpis?.hot_leads || 0}
                        subtitle="Score ≥ 70"
                        icon={Flame}
                        color="#F97316"
                    />
                    <KPICard
                        title="Valor Pipeline"
                        value={formatCurrency(kpis?.total_value || 0)}
                        subtitle="MXN estimado"
                        icon={TrendingUp}
                        color="#10B981"
                    />
                    <KPICard
                        title="Conversión"
                        value={`${kpis?.conversion_rate || 0}%`}
                        subtitle="Lead → Reserva"
                        icon={Target}
                        color="#8B5CF6"
                    />
                    <KPICard
                        title="Tareas Vencidas"
                        value={kpis?.overdue_tasks || 0}
                        subtitle={kpis?.unassigned_contacts ? `${kpis.unassigned_contacts} sin asignar` : ''}
                        icon={AlertTriangle}
                        color={Number(kpis?.overdue_tasks) > 0 ? '#EF4444' : '#6B7280'}
                    />
                </div>

                {/* Main Content - 3 columns on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Pipeline (left column) */}
                    <Card className="p-5 lg:col-span-2 border border-slate-200/60">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Pipeline de Ventas
                            </h2>
                            <Button variant="ghost" size="sm" className="text-blue-600 text-xs" onClick={() => router.push('/dashboard/crm/pipeline')}>
                                Ver Kanban <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                        <PipelineBar stages={stages} />
                    </Card>

                    {/* Hot Leads (right column) */}
                    <Card className="p-5 border border-orange-200/40 bg-gradient-to-br from-white to-orange-50/20">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-500" />
                                Leads Calientes
                            </h2>
                            <span className="text-xs text-orange-500 font-medium">
                                {hotLeads.length} activos
                            </span>
                        </div>
                        {hotLeads.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Flame className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No hay leads calientes aún</p>
                                <p className="text-xs mt-1">Leads con score ≥ 70 aparecerán aquí</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5 max-h-[320px] overflow-y-auto">
                                {hotLeads.map(lead => (
                                    <HotLeadCard
                                        key={lead.id}
                                        lead={lead}
                                        onClick={() => router.push(`/dashboard/crm/contacts/${lead.id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Bottom section - Activity + Sources */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Recent Activity */}
                    <Card className="p-5 lg:col-span-2 border border-slate-200/60">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-slate-500" />
                                Actividad Reciente
                            </h2>
                        </div>
                        {recentActivity.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Sin actividad reciente</p>
                                <p className="text-xs mt-1">Las interacciones aparecerán aquí</p>
                            </div>
                        ) : (
                            <div className="max-h-[350px] overflow-y-auto">
                                {recentActivity.map(activity => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Sources + Actions */}
                    <div className="space-y-6">
                        <Card className="p-5 border border-slate-200/60">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                Fuentes de Leads
                            </h2>
                            <SourceChart sources={sources} />
                        </Card>

                        <Card className="p-5 border border-blue-200/40 bg-gradient-to-br from-white to-blue-50/30">
                            <h2 className="text-sm font-bold text-slate-600 mb-3">Acciones Rápidas</h2>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg"
                                    onClick={() => router.push('/dashboard/crm/contacts')}
                                >
                                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                                    Ver todos los contactos
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg"
                                    onClick={() => router.push('/dashboard/crm/pipeline')}
                                >
                                    <Target className="w-4 h-4 mr-2 text-purple-600" />
                                    Pipeline Kanban
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg"
                                    onClick={() => router.push('/dashboard/crm/tasks')}
                                >
                                    <ListTodo className="w-4 h-4 mr-2 text-amber-600" />
                                    Mis Tareas
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg"
                                    onClick={() => router.push('/comunicacion')}
                                >
                                    <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                                    Centro de Comunicación
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg"
                                    onClick={() => router.push('/dashboard/crm/notifications')}
                                >
                                    <Bell className="w-4 h-4 mr-2 text-red-500" />
                                    Notificaciones
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg"
                                    onClick={() => router.push('/dashboard/crm/automation')}
                                >
                                    <Zap className="w-4 h-4 mr-2 text-amber-500" />
                                    Automatización
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg"
                                    onClick={() => router.push('/dashboard/crm/analytics')}
                                >
                                    <BarChart3 className="w-4 h-4 mr-2 text-indigo-500" />
                                    Analytics
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg"
                                    onClick={() => router.push('/dashboard/crm/import')}
                                >
                                    <Upload className="w-4 h-4 mr-2 text-green-500" />
                                    Importar CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg"
                                    onClick={() => {
                                        window.open('/api/crm/export?type=contacts', '_blank')
                                    }}
                                >
                                    <Download className="w-4 h-4 mr-2 text-purple-500" />
                                    Exportar Contactos
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg border-amber-200/50 bg-amber-50/30"
                                    onClick={() => router.push('/dashboard/crm/executive')}
                                >
                                    <span className="w-4 h-4 mr-2 text-amber-500">👑</span>
                                    Dashboard Ejecutivo
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg"
                                    onClick={() => router.push('/dashboard/crm/campaigns')}
                                >
                                    <Mail className="w-4 h-4 mr-2 text-pink-500" />
                                    Campañas Email
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg"
                                    onClick={() => window.open('/api/crm/reports?type=pipeline', '_blank')}
                                >
                                    <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                                    Reporte PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg border-blue-200/50 bg-blue-50/30"
                                    onClick={() => router.push('/dashboard/crm/calendar')}
                                >
                                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                    Calendario
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg border-purple-200/50 bg-purple-50/30"
                                    onClick={() => router.push('/dashboard/crm/predictive')}
                                >
                                    <Zap className="w-4 h-4 mr-2 text-purple-500" />
                                    Scoring Predictivo
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg border-green-200/50 bg-green-50/30"
                                    onClick={() => router.push('/dashboard/crm/whatsapp')}
                                >
                                    <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
                                    WhatsApp CRM
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg border-indigo-200/50 bg-indigo-50/30"
                                    onClick={() => router.push('/dashboard/crm/workflows')}
                                >
                                    <ListTodo className="w-4 h-4 mr-2 text-indigo-500" />
                                    Workflows
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm h-9 rounded-lg border-pink-200/50 bg-pink-50/30"
                                    onClick={() => router.push('/dashboard/crm/campaign-metrics')}
                                >
                                    <BarChart3 className="w-4 h-4 mr-2 text-pink-500" />
                                    Métricas Campañas
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* New Contact Modal */}
            {showNewContact && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg p-6 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-600" />
                                Nuevo Contacto
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => setShowNewContact(false)}>
                                <XCircle className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Nombre completo *</label>
                                <Input
                                    placeholder="Juan Pérez"
                                    value={newContactForm.full_name}
                                    onChange={e => setNewContactForm(prev => ({ ...prev, full_name: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="juan@email.com"
                                        value={newContactForm.email}
                                        onChange={e => setNewContactForm(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Teléfono</label>
                                    <Input
                                        placeholder="+52 722 123 4567"
                                        value={newContactForm.phone}
                                        onChange={e => setNewContactForm(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Fuente</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                                        value={newContactForm.source}
                                        onChange={e => setNewContactForm(prev => ({ ...prev, source: e.target.value }))}
                                    >
                                        <option value="web">Web</option>
                                        <option value="referral">Referido</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="phone">Teléfono</option>
                                        <option value="walk_in">Walk-in</option>
                                        <option value="campaign">Campaña</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Destino de interés</label>
                                    <Input
                                        placeholder="Cancún, Europa..."
                                        value={newContactForm.interested_destination}
                                        onChange={e => setNewContactForm(prev => ({ ...prev, interested_destination: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Notas</label>
                                <textarea
                                    className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                                    placeholder="Detalles adicionales..."
                                    value={newContactForm.notes}
                                    onChange={e => setNewContactForm(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-full"
                                onClick={() => setShowNewContact(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                                onClick={handleCreateContact}
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                Crear Contacto
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
