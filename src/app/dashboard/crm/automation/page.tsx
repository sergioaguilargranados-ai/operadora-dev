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
    Zap, Plus, Loader2, RefreshCw, Power, PowerOff, Trash2,
    Play, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
    Settings, ListChecks, Bell, Tag, TrendingUp, ArrowRight,
    Edit2, Save, X, AlertTriangle, Activity
} from 'lucide-react'

// ═════════════════════════
// TYPES
// ═════════════════════════
interface AutomationRule {
    id: number
    name: string
    description: string | null
    trigger_event: string
    trigger_conditions: Record<string, unknown>
    action_type: string
    action_config: Record<string, unknown>
    is_active: boolean
    priority: number
    execution_count: number
    last_executed_at: string | null
    created_at: string
    updated_at: string
}

interface AutomationLogEntry {
    id: number
    rule_id: number
    rule_name: string
    contact_id: number
    contact_name: string
    trigger_event: string
    action_result: Record<string, unknown>
    status: string
    error_message: string | null
    executed_at: string
}

// ═════════════════════════
// CONSTANTS
// ═════════════════════════
const TRIGGER_EVENTS = [
    { value: 'contact_created', label: '🆕 Contacto creado', desc: 'Cuando se crea un nuevo contacto' },
    { value: 'stage_changed', label: '📊 Cambio de etapa', desc: 'Cuando un contacto cambia de pipeline' },
    { value: 'score_threshold', label: '🔥 Score alto', desc: 'Cuando el score supera cierto umbral' },
    { value: 'task_overdue', label: '⏰ Tarea vencida', desc: 'Cuando una tarea está fuera de plazo' },
    { value: 'no_activity', label: '⚠️ Sin actividad', desc: 'Cuando un contacto no tiene actividad reciente' },
    { value: 'interaction_logged', label: '💬 Interacción registrada', desc: 'Cuando se registra una interacción' },
    { value: 'quote_sent', label: '💰 Cotización enviada', desc: 'Cuando se envía una cotización' },
    { value: 'booking_created', label: '📅 Reserva creada', desc: 'Cuando se crea una reservación' },
]

const ACTION_TYPES = [
    { value: 'create_task', label: '📋 Crear tarea', icon: ListChecks, color: '#F59E0B' },
    { value: 'send_notification', label: '🔔 Enviar notificación', icon: Bell, color: '#3B82F6' },
    { value: 'update_score', label: '📈 Actualizar score', icon: TrendingUp, color: '#10B981' },
    { value: 'move_stage', label: '➡️ Mover etapa', icon: ArrowRight, color: '#8B5CF6' },
    { value: 'add_tag', label: '🏷️ Agregar tag', icon: Tag, color: '#EC4899' },
]

// ═════════════════════════
// MAIN PAGE
// ═════════════════════════
export default function AutomationPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [rules, setRules] = useState<AutomationRule[]>([])
    const [logs, setLogs] = useState<AutomationLogEntry[]>([])
    const [activeTab, setActiveTab] = useState<'rules' | 'log'>('rules')
    const [expandedLog, setExpandedLog] = useState<number | null>(null)

    // New/edit rule form
    const [showForm, setShowForm] = useState(false)
    const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
    const [form, setForm] = useState({
        name: '', description: '', trigger_event: 'contact_created',
        action_type: 'create_task', action_config: '{}', priority: 50,
    })
    const [saving, setSaving] = useState(false)

    const fetchRules = useCallback(async () => {
        try {
            setLoading(true)
            const [rulesRes, logsRes] = await Promise.all([
                fetch('/api/crm/automation?view=rules'),
                fetch('/api/crm/automation?view=log&limit=50'),
            ])
            const rulesJson = await rulesRes.json()
            const logsJson = await logsRes.json()
            if (rulesJson.success) setRules(rulesJson.data || [])
            if (logsJson.success) setLogs(logsJson.data || [])
        } catch {
            toast({ title: 'Error', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        fetchRules()
    }, [isAuthenticated, fetchRules, router])

    const handleToggle = async (ruleId: number, isActive: boolean) => {
        const res = await fetch('/api/crm/automation', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rule_id: ruleId, is_active: !isActive }),
        })
        const json = await res.json()
        if (json.success) {
            setRules(prev => prev.map(r => r.id === ruleId ? { ...r, is_active: !isActive } : r))
            toast({ title: !isActive ? '⚡ Regla activada' : '🔌 Regla desactivada' })
        }
    }

    const handleDelete = async (ruleId: number) => {
        if (!confirm('¿Eliminar esta regla de automatización?')) return
        const res = await fetch(`/api/crm/automation?rule_id=${ruleId}`, { method: 'DELETE' })
        const json = await res.json()
        if (json.success) {
            setRules(prev => prev.filter(r => r.id !== ruleId))
            toast({ title: '🗑️ Regla eliminada' })
        }
    }

    const handleEdit = (rule: AutomationRule) => {
        setEditingRule(rule)
        setForm({
            name: rule.name,
            description: rule.description || '',
            trigger_event: rule.trigger_event,
            action_type: rule.action_type,
            action_config: JSON.stringify(
                typeof rule.action_config === 'string' ? JSON.parse(rule.action_config) : rule.action_config,
                null, 2
            ),
            priority: rule.priority,
        })
        setShowForm(true)
    }

    const handleSave = async () => {
        if (!form.name.trim()) { toast({ title: 'Error', description: 'Nombre requerido', variant: 'destructive' }); return }
        let parsedConfig: Record<string, unknown>
        try { parsedConfig = JSON.parse(form.action_config) } catch {
            toast({ title: 'Error', description: 'action_config no es JSON válido', variant: 'destructive' }); return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/crm/automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingRule?.id,
                    name: form.name,
                    description: form.description,
                    trigger_event: form.trigger_event,
                    action_type: form.action_type,
                    action_config: parsedConfig,
                    priority: form.priority,
                }),
            })
            const json = await res.json()
            if (json.success) {
                toast({ title: editingRule ? '✅ Regla actualizada' : '✅ Regla creada' })
                setShowForm(false)
                setEditingRule(null)
                resetForm()
                fetchRules()
            }
        } catch {
            toast({ title: 'Error', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    const resetForm = () => {
        setForm({
            name: '', description: '', trigger_event: 'contact_created',
            action_type: 'create_task', action_config: '{}', priority: 50,
        })
        setEditingRule(null)
    }

    const fmtTime = (d: string | null) => d
        ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        : '—'

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        )
    }

    const activeRules = rules.filter(r => r.is_active).length
    const totalExecutions = rules.reduce((s, r) => s + (r.execution_count || 0), 0)
    const successRate = logs.length > 0
        ? Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100)
        : 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Automatización
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {activeRules} reglas activas · {totalExecutions} ejecuciones
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full gap-1.5"
                            onClick={() => { resetForm(); setShowForm(true) }}
                        >
                            <Plus className="w-4 h-4" /> Nueva Regla
                        </Button>
                        <Button variant="ghost" size="sm" onClick={fetchRules}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-5xl space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Reglas Activas', value: activeRules, color: '#10B981', icon: Power },
                        { label: 'Inactivas', value: rules.length - activeRules, color: '#6B7280', icon: PowerOff },
                        { label: 'Ejecuciones', value: totalExecutions, color: '#3B82F6', icon: Play },
                        { label: 'Éxito', value: `${successRate}%`, color: '#8B5CF6', icon: CheckCircle },
                    ].map((s, i) => (
                        <Card key={i} className="p-3 text-center border-0 bg-white shadow-sm">
                            <s.icon className="w-5 h-5 mx-auto mb-1" style={{ color: s.color }} />
                            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-[10px] text-slate-500 uppercase">{s.label}</div>
                        </Card>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200/60 gap-1">
                    {([
                        { key: 'rules' as const, label: `Reglas (${rules.length})`, icon: Settings },
                        { key: 'log' as const, label: `Log (${logs.length})`, icon: Activity },
                    ]).map(tab => (
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

                {/* Rules Tab */}
                {activeTab === 'rules' && (
                    <div className="space-y-3">
                        {rules.length === 0 ? (
                            <Card className="p-12 text-center border border-slate-200/60">
                                <Zap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <h3 className="text-lg font-medium text-slate-500">Sin reglas de automatización</h3>
                                <p className="text-sm text-slate-400 mt-1">Crea tu primera regla para automatizar procesos</p>
                                <Button
                                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full gap-1.5"
                                    onClick={() => { resetForm(); setShowForm(true) }}
                                >
                                    <Plus className="w-4 h-4" /> Crear Regla
                                </Button>
                            </Card>
                        ) : (
                            rules.map(rule => {
                                const trigger = TRIGGER_EVENTS.find(t => t.value === rule.trigger_event)
                                const action = ACTION_TYPES.find(a => a.value === rule.action_type)
                                const AIcon = action?.icon || Settings

                                return (
                                    <Card
                                        key={rule.id}
                                        className={`p-0 overflow-hidden border transition-all hover:shadow-md ${rule.is_active ? 'border-green-200/60 bg-gradient-to-r from-white to-green-50/20' : 'border-slate-200/60 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 p-4">
                                            {/* Status indicator */}
                                            <button
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${rule.is_active ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'bg-slate-200 text-slate-400'
                                                    }`}
                                                onClick={() => handleToggle(rule.id, rule.is_active)}
                                                title={rule.is_active ? 'Desactivar' : 'Activar'}
                                            >
                                                {rule.is_active ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                                            </button>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="text-sm font-semibold text-slate-800 truncate">{rule.name}</h3>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500">
                                                        P{rule.priority}
                                                    </span>
                                                </div>
                                                {rule.description && (
                                                    <p className="text-xs text-slate-500 line-clamp-1 mb-1">{rule.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                                                        {trigger?.label || rule.trigger_event}
                                                    </span>
                                                    <ArrowRight className="w-3 h-3" />
                                                    <span className="px-1.5 py-0.5 rounded font-medium flex items-center gap-1"
                                                        style={{ backgroundColor: `${action?.color || '#6B7280'}15`, color: action?.color || '#6B7280' }}>
                                                        <AIcon className="w-3 h-3" />
                                                        {action?.label || rule.action_type}
                                                    </span>
                                                    <span>·</span>
                                                    <span>{rule.execution_count || 0} ejecutada{(rule.execution_count || 0) !== 1 ? 's' : ''}</span>
                                                    {rule.last_executed_at && (
                                                        <span>· Última: {fmtTime(rule.last_executed_at)}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                                                    onClick={() => handleEdit(rule)} title="Editar">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                                                    onClick={() => handleDelete(rule.id)} title="Eliminar">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                )}

                {/* Log Tab */}
                {activeTab === 'log' && (
                    <Card className="p-0 overflow-hidden border border-slate-200/60">
                        {logs.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>Sin ejecuciones registradas</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {logs.map(log => {
                                    const isError = log.status === 'error'
                                    const isExpanded = expandedLog === log.id

                                    return (
                                        <div key={log.id}>
                                            <button
                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors text-left ${isError ? 'bg-red-50/50' : ''
                                                    }`}
                                                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                                            >
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isError ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'
                                                    }`}>
                                                    {isError ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-slate-700 truncate">
                                                            {log.rule_name || `Regla #${log.rule_id}`}
                                                        </span>
                                                        <span className="text-xs text-slate-400">→</span>
                                                        <span className="text-xs text-slate-500 truncate">
                                                            {log.contact_name || `Contacto #${log.contact_id}`}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                                        <span>{log.trigger_event}</span>
                                                        <span>·</span>
                                                        <span>{fmtTime(log.executed_at)}</span>
                                                        {isError && <span className="text-red-500 font-medium">ERROR</span>}
                                                    </div>
                                                </div>
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                                            </button>
                                            {isExpanded && (
                                                <div className="px-4 pb-3 pt-1 bg-slate-50">
                                                    {isError && log.error_message && (
                                                        <div className="bg-red-100 rounded-lg p-2 mb-2 text-xs text-red-700">
                                                            <strong>Error:</strong> {log.error_message}
                                                        </div>
                                                    )}
                                                    <div className="bg-white rounded-lg p-2 text-xs font-mono text-slate-600 overflow-x-auto">
                                                        <pre>{JSON.stringify(
                                                            typeof log.action_result === 'string' ? JSON.parse(log.action_result) : log.action_result,
                                                            null, 2
                                                        )}</pre>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </Card>
                )}
            </main>

            {/* Create/Edit Rule Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-xl p-6 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                {editingRule ? 'Editar Regla' : 'Nueva Regla de Automatización'}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); resetForm() }}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Nombre *</label>
                                <Input
                                    placeholder="Ej: Auto-tarea para leads nuevos"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Descripción</label>
                                <Input
                                    placeholder="Descripción de lo que hace esta regla..."
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>

                            {/* Trigger Event */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Evento Disparador *</label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                                    value={form.trigger_event}
                                    onChange={e => setForm(p => ({ ...p, trigger_event: e.target.value }))}
                                >
                                    {TRIGGER_EVENTS.map(t => (
                                        <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Type */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Acción *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ACTION_TYPES.map(a => (
                                        <button
                                            key={a.value}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border ${form.action_type === a.value
                                                ? 'ring-2 ring-offset-1 text-white shadow-md'
                                                : 'bg-white text-slate-600 hover:bg-slate-50'
                                                }`}
                                            style={form.action_type === a.value ? { backgroundColor: a.color, borderColor: a.color, outlineColor: a.color } : undefined}
                                            onClick={() => setForm(p => ({ ...p, action_type: a.value }))}
                                        >
                                            <a.icon className="w-4 h-4" /> {a.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Config - contextual help */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Configuración de Acción (JSON)</label>
                                <textarea
                                    className="w-full h-28 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono resize-none"
                                    value={form.action_config}
                                    onChange={e => setForm(p => ({ ...p, action_config: e.target.value }))}
                                    placeholder='{"title":"Seguimiento","due_hours":24}'
                                />
                                <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
                                    {form.action_type === 'create_task' && (
                                        <p>Campos: title, task_type, due_hours, priority, description</p>
                                    )}
                                    {form.action_type === 'send_notification' && (
                                        <p>Campos: title, message, priority, notification_type</p>
                                    )}
                                    {form.action_type === 'update_score' && (
                                        <p>Campos: signal (nombre), value (puntos +/-)</p>
                                    )}
                                    {form.action_type === 'move_stage' && (
                                        <p>Campos: new_stage (new, qualified, quoted, negotiation, reserved, paid, etc.)</p>
                                    )}
                                    {form.action_type === 'add_tag' && (
                                        <p>Campos: tag (texto del tag a agregar)</p>
                                    )}
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                    Prioridad de ejecución: {form.priority}
                                </label>
                                <input
                                    type="range" min="1" max="100"
                                    className="w-full"
                                    value={form.priority}
                                    onChange={e => setForm(p => ({ ...p, priority: parseInt(e.target.value) }))}
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>Alta (se ejecuta primero)</span>
                                    <span>Baja</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-full"
                                onClick={() => { setShowForm(false); resetForm() }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                {editingRule ? 'Actualizar' : 'Crear Regla'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
