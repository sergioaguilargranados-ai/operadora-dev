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
    ListChecks, Plus, Clock, CheckCircle2, Loader2,
    Calendar, AlertTriangle, User, ChevronRight,
    Filter, Search, RefreshCw, X, Target, XCircle,
    Flame, Phone, Mail, MessageSquare
} from 'lucide-react'

// ═════════════════════════
// TYPES
// ═════════════════════════
interface Task {
    id: number
    contact_id: number
    contact_name?: string
    contact_score?: number
    contact_is_hot?: boolean
    title: string
    description: string
    task_type: string
    priority: string
    status: string
    due_date: string
    completed_at: string
    completion_notes: string
    assigned_to: number
    created_at: string
}

// ═════════════════════════
// CONSTANTS
// ═════════════════════════
const PRIORITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
    urgent: { label: 'Urgente', color: '#EF4444', bg: 'bg-red-50 text-red-700 border-red-200' },
    high: { label: 'Alta', color: '#F97316', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
    medium: { label: 'Media', color: '#F59E0B', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    low: { label: 'Baja', color: '#6B7280', bg: 'bg-slate-50 text-slate-600 border-slate-200' },
}

const TYPE_ICONS: Record<string, string> = {
    followup: '🔄', call: '📞', email: '📧', meeting: '🤝',
    whatsapp: '💬', payment: '💳', review: '⭐', other: '📋',
}

const STATUS_FILTERS = [
    { value: '', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas' },
]

// ═════════════════════════
// TASK CARD
// ═════════════════════════
function TaskCard({
    task, onComplete, onCancel, onView
}: {
    task: Task
    onComplete: (id: number) => void
    onCancel: (id: number) => void
    onView: (contactId: number) => void
}) {
    const isOverdue = task.due_date && task.status === 'pending' && new Date(task.due_date) < new Date()
    const isCompleted = task.status === 'completed'
    const isCancelled = task.status === 'cancelled'
    const prio = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium

    const dueLabel = () => {
        if (!task.due_date) return ''
        const diff = Math.floor((new Date(task.due_date).getTime() - Date.now()) / 86400000)
        if (isOverdue) return `Vencida hace ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? 's' : ''}`
        if (diff === 0) return 'Vence hoy'
        if (diff === 1) return 'Vence mañana'
        return `En ${diff} días`
    }

    return (
        <Card className={`p-4 transition-all hover:shadow-md border ${isOverdue ? 'border-red-200 bg-red-50/30' :
                isCompleted ? 'border-green-200 bg-green-50/20 opacity-70' :
                    isCancelled ? 'border-slate-200 bg-slate-50 opacity-50' :
                        'border-slate-200/60'
            }`}>
            <div className="flex items-start gap-3">
                {/* Complete checkbox */}
                {!isCompleted && !isCancelled && (
                    <button
                        className="mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 hover:bg-green-500 hover:border-green-500 transition-all group"
                        style={{ borderColor: prio.color }}
                        onClick={() => onComplete(task.id)}
                        title="Completar"
                    >
                        <span className="hidden group-hover:block text-white text-xs leading-5 text-center">✓</span>
                    </button>
                )}
                {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                {isCancelled && (
                    <XCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{TYPE_ICONS[task.task_type] || '📋'}</span>
                        <span className={`text-sm font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                        </span>
                    </div>

                    {task.description && (
                        <p className={`text-xs mb-2 line-clamp-2 ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                            {task.description}
                        </p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Priority badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${prio.bg}`}>
                            {prio.label}
                        </span>

                        {/* Due date */}
                        {task.due_date && (
                            <span className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-slate-500'
                                }`}>
                                {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                                {dueLabel()}
                            </span>
                        )}

                        {/* Contact */}
                        {task.contact_name && (
                            <button
                                className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 transition-colors"
                                onClick={(e) => { e.stopPropagation(); task.contact_id && onView(task.contact_id) }}
                            >
                                <User className="w-3 h-3" /> {task.contact_name}
                                {task.contact_is_hot && <Flame className="w-3 h-3 text-orange-500" />}
                            </button>
                        )}

                        {/* Completed at */}
                        {isCompleted && task.completed_at && (
                            <span className="text-[10px] text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {new Date(task.completed_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                            </span>
                        )}
                    </div>

                    {/* Completion notes */}
                    {isCompleted && task.completion_notes && (
                        <p className="text-xs text-green-600 mt-2 bg-green-50 rounded p-2">{task.completion_notes}</p>
                    )}
                </div>

                {/* Cancel button */}
                {!isCompleted && !isCancelled && (
                    <button
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        onClick={() => onCancel(task.id)}
                        title="Cancelar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </Card>
    )
}

// ═════════════════════════
// MAIN PAGE
// ═════════════════════════
export default function TasksPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [tasks, setTasks] = useState<Task[]>([])
    const [overdue, setOverdue] = useState(0)

    // Filters
    const [statusFilter, setStatusFilter] = useState('pending')
    const [priorityFilter, setPriorityFilter] = useState('')
    const [search, setSearch] = useState('')

    // New task form
    const [showNew, setShowNew] = useState(false)
    const [newForm, setNewForm] = useState({
        task_type: 'followup', title: '', description: '',
        due_date: '', priority: 'medium', contact_id: ''
    })
    const [saving, setSaving] = useState(false)

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (statusFilter) params.set('status', statusFilter)
            if (priorityFilter) params.set('priority', priorityFilter)
            const res = await fetch(`/api/crm/tasks?${params}`)
            const json = await res.json()
            if (json.success) {
                let items = json.data || []
                if (search) {
                    const q = search.toLowerCase()
                    items = items.filter((t: Task) =>
                        t.title?.toLowerCase().includes(q) ||
                        t.contact_name?.toLowerCase().includes(q) ||
                        t.description?.toLowerCase().includes(q)
                    )
                }
                setTasks(items)
                setOverdue(json.meta?.overdue || 0)
            }
        } catch {
            toast({ title: 'Error', description: 'No se pudieron cargar las tareas', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }, [statusFilter, priorityFilter, search, toast])

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        fetchTasks()
    }, [isAuthenticated, fetchTasks, router])

    const handleComplete = async (taskId: number) => {
        try {
            await fetch(`/api/crm/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete' }),
            })
            toast({ title: '✅ Tarea completada' })
            fetchTasks()
        } catch {
            toast({ title: 'Error', variant: 'destructive' })
        }
    }

    const handleCancel = async (taskId: number) => {
        try {
            await fetch(`/api/crm/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel' }),
            })
            toast({ title: 'Tarea cancelada' })
            fetchTasks()
        } catch {
            toast({ title: 'Error', variant: 'destructive' })
        }
    }

    const handleCreate = async () => {
        if (!newForm.title.trim() || !newForm.due_date) {
            toast({ title: 'Error', description: 'Título y fecha son requeridos', variant: 'destructive' })
            return
        }
        try {
            setSaving(true)
            const body: Record<string, unknown> = { ...newForm }
            if (newForm.contact_id) body.contact_id = parseInt(newForm.contact_id)
            const res = await fetch('/api/crm/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const json = await res.json()
            if (json.success) {
                toast({ title: '✅ Tarea creada' })
                setShowNew(false)
                setNewForm({ task_type: 'followup', title: '', description: '', due_date: '', priority: 'medium', contact_id: '' })
                fetchTasks()
            }
        } catch {
            toast({ title: 'Error', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    // Group tasks
    const overdueTasks = tasks.filter(t => t.status === 'pending' && t.due_date && new Date(t.due_date) < new Date())
    const todayTasks = tasks.filter(t => {
        if (t.status !== 'pending') return false
        if (!t.due_date) return false
        const d = new Date(t.due_date)
        const today = new Date()
        return d.toDateString() === today.toDateString()
    })
    const upcomingTasks = tasks.filter(t => {
        if (t.status !== 'pending') return false
        if (!t.due_date) return true
        const d = new Date(t.due_date)
        const today = new Date()
        return d > today && d.toDateString() !== today.toDateString()
    })
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const cancelledTasks = tasks.filter(t => t.status === 'cancelled')

    const groupedView = statusFilter === 'pending' || statusFilter === ''

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <ListChecks className="w-5 h-5 text-blue-600" />
                            Mis Tareas
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}
                            {overdue > 0 && <span className="text-red-500 ml-2">· {overdue} vencida{overdue !== 1 ? 's' : ''}</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full gap-1.5"
                            onClick={() => setShowNew(true)}
                        >
                            <Plus className="w-4 h-4" /> Nueva Tarea
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full" onClick={fetchTasks}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-4xl space-y-5">
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Vencidas', value: overdueTasks.length, color: '#EF4444', icon: AlertTriangle },
                        { label: 'Hoy', value: todayTasks.length, color: '#F59E0B', icon: Calendar },
                        { label: 'Próximas', value: upcomingTasks.length, color: '#3B82F6', icon: Clock },
                        { label: 'Completadas', value: completedTasks.length, color: '#10B981', icon: CheckCircle2 },
                    ].map((s, i) => (
                        <Card key={i} className="p-3 text-center border-0 shadow-sm cursor-pointer hover:shadow-md transition-all"
                            onClick={() => setStatusFilter(i < 3 ? 'pending' : 'completed')}>
                            <s.icon className="w-5 h-5 mx-auto mb-1" style={{ color: s.color }} />
                            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-[10px] text-slate-500 uppercase">{s.label}</div>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar tarea..."
                            className="pl-10 h-9 rounded-lg bg-white"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 gap-0.5">
                        {STATUS_FILTERS.map(sf => (
                            <button
                                key={sf.value}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === sf.value ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                onClick={() => setStatusFilter(sf.value)}
                            >
                                {sf.label}
                            </button>
                        ))}
                    </div>

                    <select
                        className="h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white"
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value)}
                    >
                        <option value="">Todas las prioridades</option>
                        {Object.entries(PRIORITY_MAP).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </div>

                {/* Task Groups */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : tasks.length === 0 ? (
                    <Card className="text-center py-16 border-0 shadow-sm">
                        <ListChecks className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <p className="text-lg font-medium text-slate-500">Sin tareas {statusFilter && `(${STATUS_FILTERS.find(s => s.value === statusFilter)?.label})`}</p>
                        <p className="text-sm text-slate-400 mt-1">¡Excelente trabajo! No hay tareas pendientes.</p>
                    </Card>
                ) : groupedView ? (
                    <div className="space-y-6">
                        {/* Overdue Group */}
                        {overdueTasks.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Vencidas ({overdueTasks.length})
                                </h2>
                                <div className="space-y-2">
                                    {overdueTasks.map(task => (
                                        <TaskCard key={task.id} task={task} onComplete={handleComplete} onCancel={handleCancel} onView={(id) => router.push(`/dashboard/crm/contacts/${id}`)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Today Group */}
                        {todayTasks.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Hoy ({todayTasks.length})
                                </h2>
                                <div className="space-y-2">
                                    {todayTasks.map(task => (
                                        <TaskCard key={task.id} task={task} onComplete={handleComplete} onCancel={handleCancel} onView={(id) => router.push(`/dashboard/crm/contacts/${id}`)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Group */}
                        {upcomingTasks.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Próximas ({upcomingTasks.length})
                                </h2>
                                <div className="space-y-2">
                                    {upcomingTasks.map(task => (
                                        <TaskCard key={task.id} task={task} onComplete={handleComplete} onCancel={handleCancel} onView={(id) => router.push(`/dashboard/crm/contacts/${id}`)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tasks.map(task => (
                            <TaskCard key={task.id} task={task} onComplete={handleComplete} onCancel={handleCancel} onView={(id) => router.push(`/dashboard/crm/contacts/${id}`)} />
                        ))}
                    </div>
                )}
            </main>

            {/* New Task Modal */}
            {showNew && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg p-6 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" /> Nueva Tarea
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Título *</label>
                                <Input placeholder="Llamar a cliente para seguimiento..." value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Tipo</label>
                                    <select className="w-full h-10 px-3 rounded-lg border text-sm" value={newForm.task_type} onChange={e => setNewForm(p => ({ ...p, task_type: e.target.value }))}>
                                        <option value="followup">🔄 Seguimiento</option>
                                        <option value="call">📞 Llamada</option>
                                        <option value="email">📧 Email</option>
                                        <option value="meeting">🤝 Reunión</option>
                                        <option value="whatsapp">💬 WhatsApp</option>
                                        <option value="other">📋 Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Prioridad</label>
                                    <select className="w-full h-10 px-3 rounded-lg border text-sm" value={newForm.priority} onChange={e => setNewForm(p => ({ ...p, priority: e.target.value }))}>
                                        <option value="low">🟢 Baja</option>
                                        <option value="medium">🟡 Media</option>
                                        <option value="high">🟠 Alta</option>
                                        <option value="urgent">🔴 Urgente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Vencimiento *</label>
                                    <Input type="date" value={newForm.due_date} onChange={e => setNewForm(p => ({ ...p, due_date: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Contacto ID <span className="text-slate-400">(opcional)</span></label>
                                <Input type="number" placeholder="Ej: 15" value={newForm.contact_id} onChange={e => setNewForm(p => ({ ...p, contact_id: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Descripción</label>
                                <textarea className="w-full h-20 px-3 py-2 rounded-lg border text-sm resize-none" placeholder="Detalles..." value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1 rounded-full" onClick={() => setShowNew(false)}>Cancelar</Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full" onClick={handleCreate} disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                Crear Tarea
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
