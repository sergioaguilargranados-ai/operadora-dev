"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import {
    GitBranch, Play, Pause, Plus, Loader2, ChevronRight,
    Zap, Mail, MessageSquare, Clock, Filter, CheckCircle,
    AlertTriangle, Tag, UserPlus, Bell, ArrowRight, Copy,
    Eye, Settings
} from 'lucide-react'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface WorkflowStep {
    id: string
    type: string
    config: Record<string, unknown>
    label: string
    next_step?: string
    on_true?: string
    on_false?: string
    position: { x: number; y: number }
}

interface Workflow {
    id?: number
    name: string
    description: string
    trigger_type: string
    trigger_config: Record<string, unknown>
    steps: WorkflowStep[]
    is_active: boolean
    execution_count?: number
    last_executed_at?: string
}

const TRIGGER_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    contact_created: { label: 'Contacto creado', icon: '👤', color: 'text-green-600 bg-green-100' },
    stage_change: { label: 'Cambio de etapa', icon: '📊', color: 'text-blue-600 bg-blue-100' },
    score_threshold: { label: 'Score umbral', icon: '🎯', color: 'text-purple-600 bg-purple-100' },
    time_inactive: { label: 'Tiempo inactivo', icon: '⏰', color: 'text-amber-600 bg-amber-100' },
    tag_added: { label: 'Tag agregado', icon: '🏷️', color: 'text-cyan-600 bg-cyan-100' },
    manual: { label: 'Manual', icon: '👆', color: 'text-gray-600 bg-gray-100' },
}

const STEP_ICONS: Record<string, React.ReactNode> = {
    send_email: <Mail className="w-3.5 h-3.5 text-pink-500" />,
    send_whatsapp: <MessageSquare className="w-3.5 h-3.5 text-green-500" />,
    wait: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    condition: <Filter className="w-3.5 h-3.5 text-blue-500" />,
    update_contact: <Settings className="w-3.5 h-3.5 text-gray-500" />,
    create_task: <CheckCircle className="w-3.5 h-3.5 text-teal-500" />,
    move_stage: <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />,
    add_tag: <Tag className="w-3.5 h-3.5 text-cyan-500" />,
    notify_agent: <Bell className="w-3.5 h-3.5 text-red-500" />,
}

// ═══════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════

export default function WorkflowsPage() {
    const router = useRouter()
    const [templates, setTemplates] = useState<Workflow[]>([])
    const [savedWorkflows, setSavedWorkflows] = useState<Workflow[]>([])
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [tab, setTab] = useState<'templates' | 'saved'>('templates')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [templatesRes, savedRes] = await Promise.all([
                fetch('/api/crm/workflows?action=templates'),
                fetch('/api/crm/workflows?action=saved'),
            ])
            const templatesJson = await templatesRes.json()
            const savedJson = await savedRes.json()
            if (templatesJson.success) setTemplates(templatesJson.data)
            if (savedJson.success) setSavedWorkflows(savedJson.data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const handleInstallTemplate = async (template: Workflow) => {
        setSaving(true)
        try {
            const res = await fetch('/api/crm/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save', workflow: template }),
            })
            const json = await res.json()
            if (json.success) {
                await loadData()
                setTab('saved')
            }
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    const handleToggle = async (id: number, isActive: boolean) => {
        try {
            await fetch('/api/crm/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle', workflow_id: id, is_active: !isActive }),
            })
            await loadData()
        } catch (err) { console.error(err) }
    }

    const currentList = tab === 'templates' ? templates : savedWorkflows

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-indigo-600" />
                            Workflows CRM
                        </h1>
                        <p className="text-xs text-gray-500">Automatizaciones personalizables</p>
                    </div>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-6xl">

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <Card className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                        <div className="text-2xl font-bold">{savedWorkflows.length}</div>
                        <div className="text-xs text-indigo-100">Workflows instalados</div>
                    </Card>
                    <Card className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="text-2xl font-bold">{savedWorkflows.filter(w => w.is_active).length}</div>
                        <div className="text-xs text-green-100">Activos</div>
                    </Card>
                    <Card className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div className="text-2xl font-bold">
                            {savedWorkflows.reduce((s, w) => s + (w.execution_count || 0), 0)}
                        </div>
                        <div className="text-xs text-purple-100">Ejecuciones</div>
                    </Card>
                    <Card className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                        <div className="text-2xl font-bold">{templates.length}</div>
                        <div className="text-xs text-amber-100">Templates disponibles</div>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <Button
                        variant={tab === 'templates' ? 'default' : 'outline'}
                        size="sm"
                        className={tab === 'templates' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                        onClick={() => setTab('templates')}
                    >
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        Templates ({templates.length})
                    </Button>
                    <Button
                        variant={tab === 'saved' ? 'default' : 'outline'}
                        size="sm"
                        className={tab === 'saved' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                        onClick={() => setTab('saved')}
                    >
                        <GitBranch className="w-3.5 h-3.5 mr-1" />
                        Mis Workflows ({savedWorkflows.length})
                    </Button>
                </div>

                <div className="flex gap-5 flex-col lg:flex-row">
                    {/* Lista */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {currentList.map((wf, i) => {
                                    const trigger = TRIGGER_LABELS[wf.trigger_type] || { label: wf.trigger_type, icon: '⚡', color: 'text-gray-600 bg-gray-100' }
                                    const isSelected = selectedWorkflow === wf

                                    return (
                                        <Card
                                            key={wf.id || i}
                                            className={`p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-indigo-400 shadow-lg' : ''
                                                }`}
                                            onClick={() => setSelectedWorkflow(wf)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <GitBranch className="w-4 h-4 text-indigo-500" />
                                                        <h3 className="text-sm font-semibold text-gray-800">{wf.name}</h3>
                                                        {wf.id && (
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${wf.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                                                }`}>
                                                                {wf.is_active ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{wf.description}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${trigger.color}`}>
                                                            {trigger.icon} {trigger.label}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {wf.steps.length} pasos
                                                        </span>
                                                        {wf.execution_count != null && (
                                                            <span className="text-[10px] text-gray-400">
                                                                {wf.execution_count} ejecuciones
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {tab === 'templates' ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs h-7"
                                                            onClick={(e) => { e.stopPropagation(); handleInstallTemplate(wf) }}
                                                            disabled={saving}
                                                        >
                                                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Copy className="w-3 h-3 mr-1" />}
                                                            Instalar
                                                        </Button>
                                                    ) : wf.id && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className={`text-xs h-7 ${wf.is_active ? 'text-green-600' : 'text-gray-300'}`}
                                                            onClick={(e) => { e.stopPropagation(); handleToggle(wf.id!, wf.is_active) }}
                                                        >
                                                            {wf.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}

                                {currentList.length === 0 && (
                                    <Card className="p-8 text-center">
                                        <GitBranch className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-400">
                                            {tab === 'saved' ? 'No hay workflows instalados. Instala uno desde Templates.' : 'No hay templates disponibles.'}
                                        </p>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Panel de detalle */}
                    <div className="w-full lg:w-80 space-y-4">
                        {selectedWorkflow ? (
                            <>
                                {/* Header */}
                                <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                                    <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-1.5">
                                        <GitBranch className="w-4 h-4" />
                                        {selectedWorkflow.name}
                                    </h3>
                                    <p className="text-[11px] text-gray-600 mt-1">{selectedWorkflow.description}</p>
                                </Card>

                                {/* Flujo visual */}
                                <Card className="p-4">
                                    <h4 className="text-xs font-semibold text-gray-600 mb-3">📋 Flujo de pasos</h4>
                                    <div className="space-y-0">
                                        {selectedWorkflow.steps.map((step, i) => (
                                            <div key={step.id}>
                                                <div className="flex items-center gap-2 py-2">
                                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        {STEP_ICONS[step.type] || <Zap className="w-3 h-3 text-gray-400" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[11px] font-medium text-gray-700 truncate">{step.label}</div>
                                                        <div className="text-[9px] text-gray-400">{step.type.replace('_', ' ')}</div>
                                                    </div>
                                                    {step.type === 'condition' && (
                                                        <div className="flex items-center gap-0.5 text-[9px]">
                                                            <span className="text-green-500">✓</span>
                                                            <span className="text-gray-300">/</span>
                                                            <span className="text-red-500">✗</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {i < selectedWorkflow.steps.length - 1 && (
                                                    <div className="ml-3 h-3 border-l-2 border-dashed border-gray-200" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* Trigger */}
                                <Card className="p-4">
                                    <h4 className="text-xs font-semibold text-gray-600 mb-2">⚡ Trigger</h4>
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-700 font-medium">
                                            {TRIGGER_LABELS[selectedWorkflow.trigger_type]?.icon}{' '}
                                            {TRIGGER_LABELS[selectedWorkflow.trigger_type]?.label || selectedWorkflow.trigger_type}
                                        </div>
                                        {Object.keys(selectedWorkflow.trigger_config).length > 0 && (
                                            <div className="text-[10px] text-gray-500 mt-1">
                                                {JSON.stringify(selectedWorkflow.trigger_config)}
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Acciones */}
                                {tab === 'templates' && (
                                    <Button
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                                        onClick={() => handleInstallTemplate(selectedWorkflow)}
                                        disabled={saving}
                                    >
                                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                        Instalar workflow
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Card className="p-8 text-center">
                                <Eye className="w-10 h-10 text-indigo-300/50 mx-auto mb-3" />
                                <p className="text-sm text-gray-400">Selecciona un workflow para ver sus pasos</p>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
