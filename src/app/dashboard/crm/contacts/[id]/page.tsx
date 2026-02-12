"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/PageHeader'
import { useToast } from '@/hooks/use-toast'
import {
    User, Mail, Phone, MessageSquare, MapPin, Calendar, Clock,
    Flame, Star, TrendingUp, Edit2, Save, X, Plus,
    ChevronDown, ChevronRight, ArrowRight, Tag, Building2,
    RefreshCw, Loader2, FileText, Target, ListChecks,
    Globe, Send, PhoneCall, MessageCircle, Briefcase
} from 'lucide-react'

// ═════════════════════════
// TYPES
// ═════════════════════════
interface ContactFull {
    id: number
    full_name: string
    email: string
    phone: string
    whatsapp: string
    company: string
    position: string
    contact_type: string
    pipeline_stage: string
    lead_score: number
    is_hot_lead: boolean
    score_signals: Record<string, number>
    source: string
    source_detail: string
    status: string
    interested_destination: string
    travel_dates_start: string
    travel_dates_end: string
    num_travelers: number
    budget_min: number
    budget_max: number
    budget_currency: string
    travel_type: string
    special_requirements: string
    assigned_agent_name: string
    assigned_agent_email: string
    total_interactions: number
    total_quotes: number
    total_bookings: number
    ltv: number
    tags: string[]
    notes: string
    first_contact_at: string
    last_contact_at: string
    next_followup_at: string
    stage_changed_at: string
    days_in_stage: number
    created_at: string
}

interface TimelineItem {
    type: string; id: number; title: string; description: string; icon: string; color: string; created_at: string
}

interface PendingTask {
    id: number; title: string; task_type: string; due_date: string; priority: string; status: string
}

interface Contact360 {
    contact: ContactFull
    timeline: TimelineItem[]
    pending_tasks: PendingTask[]
    stats: { total_interactions: number; total_tasks: number; completed_tasks: number; overdue_tasks: number; total_quotes: number; total_bookings: number }
}

// ═════════════════════════
// CONSTANTS
// ═════════════════════════
const STAGES = [
    { key: 'new', label: 'Nuevo', color: '#94A3B8', icon: '🆕' },
    { key: 'qualified', label: 'Calificado', color: '#3B82F6', icon: '✅' },
    { key: 'quoted', label: 'Cotizado', color: '#8B5CF6', icon: '💰' },
    { key: 'negotiation', label: 'Negociación', color: '#F59E0B', icon: '🤝' },
    { key: 'reserved', label: 'Reservado', color: '#10B981', icon: '📅' },
    { key: 'paid', label: 'Pagado', color: '#059669', icon: '💳' },
    { key: 'traveling', label: 'Viajando', color: '#06B6D4', icon: '✈️' },
    { key: 'post_trip', label: 'Post-Viaje', color: '#8B5CF6', icon: '⭐' },
    { key: 'won', label: 'Ganado', color: '#22C55E', icon: '🏆' },
    { key: 'lost', label: 'Perdido', color: '#EF4444', icon: '❌' },
]

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
    urgent: { label: 'Urgente', color: '#EF4444' },
    high: { label: 'Alta', color: '#F97316' },
    medium: { label: 'Media', color: '#F59E0B' },
    low: { label: 'Baja', color: '#6B7280' },
}

const INTERACTION_TYPES = [
    { value: 'call_outbound', label: '📞 Llamada saliente' },
    { value: 'call_inbound', label: '📲 Llamada entrante' },
    { value: 'email_sent', label: '📧 Email enviado' },
    { value: 'email_received', label: '📩 Email recibido' },
    { value: 'whatsapp_sent', label: '💬 WhatsApp enviado' },
    { value: 'whatsapp_received', label: '💬 WhatsApp recibido' },
    { value: 'meeting', label: '🤝 Reunión' },
    { value: 'note', label: '📝 Nota' },
    { value: 'quote_sent', label: '💰 Cotización enviada' },
]

// ═════════════════════════
// SCORE RING
// ═════════════════════════
function ScoreRing({ score }: { score: number }) {
    const radius = 38
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (Math.min(score, 100) / 100) * circumference
    const color = score >= 70 ? '#EF4444' : score >= 40 ? '#3B82F6' : '#94A3B8'

    return (
        <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="6" />
                <circle cx="48" cy="48" r={radius} fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color }}>{score}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Score</span>
            </div>
        </div>
    )
}

// ═════════════════════════
// PIPELINE STEPS
// ═════════════════════════
function PipelineSteps({ currentStage, onMove }: { currentStage: string; onMove: (s: string) => void }) {
    const currentIdx = STAGES.findIndex(s => s.key === currentStage)

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {STAGES.map((stage, i) => {
                const isActive = stage.key === currentStage
                const isPast = i < currentIdx
                return (
                    <button
                        key={stage.key}
                        onClick={() => !isActive && onMove(stage.key)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive
                            ? 'ring-2 ring-offset-1 shadow-md text-white'
                            : isPast
                                ? 'opacity-60 hover:opacity-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        style={isActive ? { backgroundColor: stage.color, outlineColor: stage.color } : isPast ? { backgroundColor: `${stage.color}20`, color: stage.color } : undefined}
                    >
                        <span>{stage.icon}</span>
                        <span className="hidden sm:inline">{stage.label}</span>
                    </button>
                )
            })}
        </div>
    )
}

// ═════════════════════════
// MAIN PAGE
// ═════════════════════════
export default function ContactDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { isAuthenticated } = useAuth()
    const { toast } = useToast()
    const contactId = Number(params.id)

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<Contact360 | null>(null)
    const [activeTab, setActiveTab] = useState<'timeline' | 'tasks' | 'info'>('timeline')
    const [movingStage, setMovingStage] = useState(false)

    // Interaction form
    const [showInteraction, setShowInteraction] = useState(false)
    const [intForm, setIntForm] = useState({ interaction_type: 'note', subject: '', body: '', outcome: 'neutral' })
    const [savingInt, setSavingInt] = useState(false)

    // Task form
    const [showTask, setShowTask] = useState(false)
    const [taskForm, setTaskForm] = useState({ task_type: 'followup', title: '', due_date: '', priority: 'medium' })
    const [savingTask, setSavingTask] = useState(false)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/crm/contacts/${contactId}?full=true`)
            const json = await res.json()
            if (json.success) setData(json.data)
            else toast({ title: 'Error', description: json.error, variant: 'destructive' })
        } catch {
            toast({ title: 'Error', description: 'No se pudo cargar el contacto', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }, [contactId, toast])

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        fetchData()
    }, [isAuthenticated, fetchData, router])

    const handleMoveStage = async (newStage: string) => {
        try {
            setMovingStage(true)
            const res = await fetch('/api/crm/pipeline/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact_id: contactId, new_stage: newStage }),
            })
            const json = await res.json()
            if (json.success) {
                toast({ title: '✅ Etapa actualizada', description: `Movido a "${STAGES.find(s => s.key === newStage)?.label}"` })
                fetchData()
            }
        } catch {
            toast({ title: 'Error', variant: 'destructive' })
        } finally {
            setMovingStage(false)
        }
    }

    const handleAddInteraction = async () => {
        if (!intForm.subject.trim()) return
        try {
            setSavingInt(true)
            const res = await fetch(`/api/crm/contacts/${contactId}/interactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(intForm),
            })
            const json = await res.json()
            if (json.success) {
                toast({ title: '✅ Interacción registrada' })
                setShowInteraction(false)
                setIntForm({ interaction_type: 'note', subject: '', body: '', outcome: 'neutral' })
                fetchData()
            }
        } catch {
            toast({ title: 'Error', variant: 'destructive' })
        } finally {
            setSavingInt(false)
        }
    }

    const handleAddTask = async () => {
        if (!taskForm.title.trim() || !taskForm.due_date) return
        try {
            setSavingTask(true)
            const res = await fetch('/api/crm/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...taskForm, contact_id: contactId }),
            })
            const json = await res.json()
            if (json.success) {
                toast({ title: '✅ Tarea creada' })
                setShowTask(false)
                setTaskForm({ task_type: 'followup', title: '', due_date: '', priority: 'medium' })
                fetchData()
            }
        } catch {
            toast({ title: 'Error', variant: 'destructive' })
        } finally {
            setSavingTask(false)
        }
    }

    const handleCompleteTask = async (taskId: number) => {
        try {
            await fetch(`/api/crm/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete' }),
            })
            toast({ title: '✅ Tarea completada' })
            fetchData()
        } catch { }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        )
    }

    if (!data) return null
    const { contact, timeline, pending_tasks, stats } = data
    const fmt = (d: string) => d ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
    const fmtTime = (d: string) => d ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm/contacts">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white ${contact.is_hot_lead ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                            }`}>
                            {contact.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold flex items-center gap-2">
                                {contact.full_name}
                                {contact.is_hot_lead && <Flame className="w-4 h-4 text-orange-500" />}
                            </h1>
                            <p className="text-xs text-muted-foreground">{contact.company || contact.contact_type} · {contact.source}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full gap-1.5" onClick={fetchData}>
                        <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                    </Button>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-7xl">
                {/* Pipeline Steps */}
                <Card className="p-4 mb-5 border border-slate-200/60">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pipeline de Ventas</span>
                        <span className="text-xs text-slate-400">{contact.days_in_stage || 0} días en etapa actual</span>
                    </div>
                    <PipelineSteps currentStage={contact.pipeline_stage} onMove={handleMoveStage} />
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* LEFT: Main Content */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-5 gap-3">
                            {[
                                { label: 'Interacciones', value: stats?.total_interactions || 0, icon: MessageCircle, color: '#3B82F6' },
                                { label: 'Cotizaciones', value: stats?.total_quotes || 0, icon: FileText, color: '#8B5CF6' },
                                { label: 'Reservas', value: stats?.total_bookings || 0, icon: Calendar, color: '#10B981' },
                                { label: 'Tareas', value: `${stats?.completed_tasks || 0}/${stats?.total_tasks || 0}`, icon: ListChecks, color: '#F59E0B' },
                                { label: 'Vencidas', value: stats?.overdue_tasks || 0, icon: Clock, color: stats?.overdue_tasks ? '#EF4444' : '#94A3B8' },
                            ].map((stat, i) => (
                                <Card key={i} className="p-3 text-center border-0 bg-white shadow-sm">
                                    <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: stat.color }} />
                                    <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
                                    <div className="text-[10px] text-slate-500 uppercase">{stat.label}</div>
                                </Card>
                            ))}
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200/60 gap-1">
                            {[
                                { key: 'timeline' as const, label: 'Timeline', icon: Clock },
                                { key: 'tasks' as const, label: `Tareas (${pending_tasks?.length || 0})`, icon: ListChecks },
                                { key: 'info' as const, label: 'Información', icon: FileText },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-lg font-medium transition-all ${activeTab === tab.key ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    <tab.icon className="w-4 h-4" /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Timeline Tab */}
                        {activeTab === 'timeline' && (
                            <Card className="p-0 overflow-hidden border border-slate-200/60">
                                {/* Add interaction bar */}
                                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b">
                                    <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-xs" onClick={() => setShowInteraction(!showInteraction)}>
                                        <Plus className="w-3.5 h-3.5" /> Interacción
                                    </Button>
                                    <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-xs" onClick={() => setShowTask(!showTask)}>
                                        <ListChecks className="w-3.5 h-3.5" /> Tarea
                                    </Button>
                                </div>

                                {/* Inline interaction form */}
                                {showInteraction && (
                                    <div className="p-4 bg-blue-50/50 border-b space-y-3 animate-in slide-in-from-top-2">
                                        <div className="grid grid-cols-2 gap-3">
                                            <select className="h-9 px-3 rounded-lg border text-sm" value={intForm.interaction_type} onChange={e => setIntForm(p => ({ ...p, interaction_type: e.target.value }))}>
                                                {INTERACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                            <select className="h-9 px-3 rounded-lg border text-sm" value={intForm.outcome} onChange={e => setIntForm(p => ({ ...p, outcome: e.target.value }))}>
                                                <option value="neutral">⚪ Neutral</option>
                                                <option value="positive">🟢 Positivo</option>
                                                <option value="negative">🔴 Negativo</option>
                                            </select>
                                        </div>
                                        <Input placeholder="Asunto..." value={intForm.subject} onChange={e => setIntForm(p => ({ ...p, subject: e.target.value }))} />
                                        <textarea className="w-full h-20 px-3 py-2 rounded-lg border text-sm resize-none" placeholder="Detalles..." value={intForm.body} onChange={e => setIntForm(p => ({ ...p, body: e.target.value }))} />
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => setShowInteraction(false)}>Cancelar</Button>
                                            <Button size="sm" className="bg-blue-600 text-white rounded-full" onClick={handleAddInteraction} disabled={savingInt}>
                                                {savingInt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />} Registrar
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Inline task form */}
                                {showTask && (
                                    <div className="p-4 bg-amber-50/50 border-b space-y-3 animate-in slide-in-from-top-2">
                                        <div className="grid grid-cols-3 gap-3">
                                            <select className="h-9 px-3 rounded-lg border text-sm" value={taskForm.task_type} onChange={e => setTaskForm(p => ({ ...p, task_type: e.target.value }))}>
                                                <option value="followup">🔄 Seguimiento</option>
                                                <option value="call">📞 Llamada</option>
                                                <option value="email">📧 Email</option>
                                                <option value="meeting">🤝 Reunión</option>
                                                <option value="whatsapp">💬 WhatsApp</option>
                                                <option value="other">📋 Otro</option>
                                            </select>
                                            <select className="h-9 px-3 rounded-lg border text-sm" value={taskForm.priority} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}>
                                                <option value="low">🟢 Baja</option>
                                                <option value="medium">🟡 Media</option>
                                                <option value="high">🟠 Alta</option>
                                                <option value="urgent">🔴 Urgente</option>
                                            </select>
                                            <Input type="date" value={taskForm.due_date} onChange={e => setTaskForm(p => ({ ...p, due_date: e.target.value }))} />
                                        </div>
                                        <Input placeholder="Título de la tarea..." value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} />
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => setShowTask(false)}>Cancelar</Button>
                                            <Button size="sm" className="bg-amber-600 text-white rounded-full" onClick={handleAddTask} disabled={savingTask}>
                                                {savingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} Crear Tarea
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Timeline list */}
                                <div className="divide-y">
                                    {(timeline || []).length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                            <p>Sin actividad registrada</p>
                                        </div>
                                    ) : (
                                        timeline.map((item, i) => (
                                            <div key={`${item.type}-${item.id}`} className="flex gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <span className="text-lg">{item.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-slate-800">{item.title}</span>
                                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 flex-shrink-0 mt-1 whitespace-nowrap">
                                                    {fmtTime(item.created_at)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Tasks Tab */}
                        {activeTab === 'tasks' && (
                            <Card className="p-0 overflow-hidden border border-slate-200/60">
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b">
                                    <span className="text-sm font-medium text-slate-700">Tareas Pendientes</span>
                                    <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-xs" onClick={() => setShowTask(true)}>
                                        <Plus className="w-3.5 h-3.5" /> Nueva Tarea
                                    </Button>
                                </div>

                                {showTask && (
                                    <div className="p-4 bg-amber-50/50 border-b space-y-3 animate-in slide-in-from-top-2">
                                        <div className="grid grid-cols-3 gap-3">
                                            <select className="h-9 px-3 rounded-lg border text-sm" value={taskForm.task_type} onChange={e => setTaskForm(p => ({ ...p, task_type: e.target.value }))}>
                                                <option value="followup">🔄 Seguimiento</option><option value="call">📞 Llamada</option><option value="email">📧 Email</option>
                                                <option value="meeting">🤝 Reunión</option><option value="whatsapp">💬 WhatsApp</option>
                                            </select>
                                            <select className="h-9 px-3 rounded-lg border text-sm" value={taskForm.priority} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}>
                                                <option value="low">🟢 Baja</option><option value="medium">🟡 Media</option><option value="high">🟠 Alta</option><option value="urgent">🔴 Urgente</option>
                                            </select>
                                            <Input type="date" value={taskForm.due_date} onChange={e => setTaskForm(p => ({ ...p, due_date: e.target.value }))} />
                                        </div>
                                        <Input placeholder="Título..." value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} />
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => setShowTask(false)}>Cancelar</Button>
                                            <Button size="sm" className="bg-amber-600 text-white rounded-full" onClick={handleAddTask} disabled={savingTask}>Crear</Button>
                                        </div>
                                    </div>
                                )}

                                <div className="divide-y">
                                    {(pending_tasks || []).length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            <ListChecks className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                            <p>Sin tareas pendientes 🎉</p>
                                        </div>
                                    ) : (
                                        pending_tasks.map(task => {
                                            const isOverdue = task.due_date && new Date(task.due_date) < new Date()
                                            const prio = PRIORITY_MAP[task.priority] || { label: task.priority, color: '#6B7280' }
                                            return (
                                                <div key={task.id} className={`flex items-center gap-3 px-4 py-3 ${isOverdue ? 'bg-red-50/50' : ''} hover:bg-slate-50/50`}>
                                                    <button
                                                        className="w-5 h-5 rounded-full border-2 flex-shrink-0 hover:bg-green-500 hover:border-green-500 transition-all group"
                                                        style={{ borderColor: prio.color }}
                                                        onClick={() => handleCompleteTask(task.id)}
                                                        title="Completar"
                                                    >
                                                        <span className="hidden group-hover:block text-white text-xs leading-5 text-center transition-all">✓</span>
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-slate-800">{task.title}</div>
                                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                                            <span style={{ color: prio.color }}>{prio.label}</span>
                                                            <span>·</span>
                                                            <span className={isOverdue ? 'text-red-500 font-medium' : ''}>{fmt(task.due_date)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Info Tab */}
                        {activeTab === 'info' && (
                            <Card className="p-5 border border-slate-200/60 space-y-6">
                                {/* Travel Interest */}
                                {(contact.interested_destination || contact.travel_dates_start || contact.budget_min) && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                            <Target className="w-4 h-4 text-blue-500" /> Interés de Viaje
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {contact.interested_destination && (
                                                <div className="bg-blue-50 rounded-xl p-3">
                                                    <div className="text-xs text-blue-500 mb-0.5">Destino</div>
                                                    <div className="text-sm font-semibold text-blue-700">{contact.interested_destination}</div>
                                                </div>
                                            )}
                                            {(contact.travel_dates_start || contact.travel_dates_end) && (
                                                <div className="bg-purple-50 rounded-xl p-3">
                                                    <div className="text-xs text-purple-500 mb-0.5">Fechas</div>
                                                    <div className="text-sm font-semibold text-purple-700">
                                                        {fmt(contact.travel_dates_start)} → {fmt(contact.travel_dates_end)}
                                                    </div>
                                                </div>
                                            )}
                                            {contact.num_travelers && (
                                                <div className="bg-emerald-50 rounded-xl p-3">
                                                    <div className="text-xs text-emerald-500 mb-0.5">Viajeros</div>
                                                    <div className="text-sm font-semibold text-emerald-700">{contact.num_travelers} personas</div>
                                                </div>
                                            )}
                                            {(contact.budget_min || contact.budget_max) && (
                                                <div className="bg-amber-50 rounded-xl p-3">
                                                    <div className="text-xs text-amber-500 mb-0.5">Presupuesto</div>
                                                    <div className="text-sm font-semibold text-amber-700">
                                                        ${(contact.budget_min || 0).toLocaleString()} - ${(contact.budget_max || 0).toLocaleString()} {contact.budget_currency}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Score Signals */}
                                {contact.score_signals && Object.keys(contact.score_signals).length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-blue-500" /> Señales de Score
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(typeof contact.score_signals === 'string' ? JSON.parse(contact.score_signals) : contact.score_signals).map(([signal, value]) => (
                                                <span key={signal} className={`px-2.5 py-1 rounded-full text-xs font-medium ${(value as number) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {signal.replace(/_/g, ' ')} ({value as number > 0 ? '+' : ''}{String(value)})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Contact Details */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-500" /> Datos de Contacto
                                    </h3>
                                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                        {[
                                            { label: 'Email', value: contact.email, icon: Mail },
                                            { label: 'Teléfono', value: contact.phone, icon: Phone },
                                            { label: 'WhatsApp', value: contact.whatsapp, icon: MessageSquare },
                                            { label: 'Empresa', value: contact.company, icon: Building2 },
                                            { label: 'Puesto', value: contact.position, icon: Briefcase },
                                            { label: 'Fuente', value: contact.source, icon: Globe },
                                        ].filter(f => f.value).map(field => (
                                            <div key={field.label} className="flex items-center gap-2">
                                                <field.icon className="w-4 h-4 text-slate-400" />
                                                <div>
                                                    <dt className="text-xs text-slate-500">{field.label}</dt>
                                                    <dd className="font-medium">{field.value}</dd>
                                                </div>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                {/* Notes */}
                                {contact.notes && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" /> Notas
                                        </h3>
                                        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 whitespace-pre-wrap">{contact.notes}</p>
                                    </div>
                                )}

                                {/* Meta */}
                                <div className="text-xs text-slate-400 pt-4 border-t space-y-1">
                                    <p>Creado: {fmtTime(contact.created_at)}</p>
                                    <p>Primer contacto: {fmtTime(contact.first_contact_at)}</p>
                                    <p>Último contacto: {fmtTime(contact.last_contact_at)}</p>
                                    <p>Próximo follow-up: {fmtTime(contact.next_followup_at)}</p>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT: Sidebar */}
                    <div className="space-y-5">
                        {/* Score */}
                        <Card className="p-5 flex flex-col items-center border border-slate-200/60">
                            <ScoreRing score={contact.lead_score} />
                            <div className="mt-3 text-center">
                                <div className="text-sm font-bold text-slate-700">Lead Score</div>
                                <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${contact.is_hot_lead ? 'bg-red-100 text-red-600' : contact.lead_score >= 40 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {contact.is_hot_lead ? '🔥 Lead Caliente' : contact.lead_score >= 40 ? '📊 Lead Tibio' : '❄️ Lead Frío'}
                                </div>
                            </div>
                        </Card>

                        {/* Quick Info */}
                        <Card className="p-4 border border-slate-200/60 space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resumen</h3>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Agente</span>
                                    <span className="font-medium text-slate-700">{contact.assigned_agent_name || 'Sin asignar'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">LTV</span>
                                    <span className="font-medium text-emerald-600">${(contact.ltv || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Tipo</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${contact.contact_type === 'client' ? 'bg-emerald-100 text-emerald-700' :
                                        contact.contact_type === 'lead' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>{contact.contact_type}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Días en etapa</span>
                                    <span className="font-medium">{contact.days_in_stage || 0}d</span>
                                </div>
                            </div>
                        </Card>

                        {/* Tags */}
                        {contact.tags && contact.tags.length > 0 && (
                            <Card className="p-4 border border-slate-200/60">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {contact.tags.map(tag => (
                                        <span key={tag} className="px-2.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card className="p-4 border border-slate-200/60">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Acciones</h3>
                            <div className="space-y-2">
                                {contact.phone && (
                                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                                        <PhoneCall className="w-4 h-4" /> Llamar
                                    </a>
                                )}
                                {contact.whatsapp && (
                                    <a href={`https://wa.me/${contact.whatsapp?.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-600 transition-colors">
                                        <MessageSquare className="w-4 h-4" /> WhatsApp
                                    </a>
                                )}
                                {contact.email && (
                                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                                        <Mail className="w-4 h-4" /> Enviar email
                                    </a>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
