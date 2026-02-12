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
    BarChart3, Search, Loader2, RefreshCw, Flame, User,
    MapPin, DollarSign, Clock, Phone, Mail, ChevronRight,
    TrendingUp, ArrowDown, X, Filter, GripVertical
} from 'lucide-react'

// ═════════════════════════
// TYPES
// ═════════════════════════
interface PipelineContact {
    id: number
    full_name: string
    email: string
    phone: string
    company: string
    lead_score: number
    is_hot_lead: boolean
    interested_destination: string
    budget_max: number
    budget_currency: string
    days_in_stage: number
    last_contact_at: string
    assigned_agent_name: string
    contact_type: string
    source: string
}

interface PipelineStage {
    id: number
    stage_key: string
    stage_label: string
    stage_order: number
    color: string
    icon: string
    is_win_stage: boolean
    is_loss_stage: boolean
    count: number
    total_value: number
    contacts: PipelineContact[]
}

// ═════════════════════════
// CONTACT CARD
// ═════════════════════════
function ContactCard({
    contact, stageColor, onMove, onView, movingId
}: {
    contact: PipelineContact
    stageColor: string
    onMove: (contactId: number, newStage: string) => void
    onView: (contactId: number) => void
    movingId: number | null
}) {
    const isMoving = movingId === contact.id

    const timeAgo = (d: string) => {
        if (!d) return '—'
        const secs = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
        if (secs < 3600) return `${Math.floor(secs / 60)}m`
        if (secs < 86400) return `${Math.floor(secs / 3600)}h`
        return `${Math.floor(secs / 86400)}d`
    }

    return (
        <div
            className={`bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200/50 transition-all cursor-pointer group ${isMoving ? 'opacity-50 scale-95' : ''}`}
            onClick={() => onView(contact.id)}
        >
            {/* Header: Name + Score */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${contact.is_hot_lead ? 'bg-gradient-to-br from-orange-400 to-red-500'
                            : contact.contact_type === 'client' ? 'bg-gradient-to-br from-emerald-400 to-green-600'
                                : 'bg-gradient-to-br from-blue-400 to-blue-600'
                        }`}>
                        {contact.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate leading-tight">{contact.full_name}</div>
                        {contact.company && <div className="text-[10px] text-slate-400 truncate">{contact.company}</div>}
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {contact.is_hot_lead && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${contact.lead_score >= 70 ? 'bg-red-100 text-red-600'
                            : contact.lead_score >= 40 ? 'bg-blue-100 text-blue-600'
                                : 'bg-slate-100 text-slate-500'
                        }`}>{contact.lead_score}</span>
                </div>
            </div>

            {/* Destination / Budget */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
                {contact.interested_destination && (
                    <span className="flex items-center gap-0.5 text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md">
                        <MapPin className="w-2.5 h-2.5" /> {contact.interested_destination}
                    </span>
                )}
                {contact.budget_max > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        <DollarSign className="w-2.5 h-2.5" /> ${contact.budget_max?.toLocaleString()} {contact.budget_currency}
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                    {contact.assigned_agent_name && (
                        <span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5" />{contact.assigned_agent_name}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{timeAgo(contact.last_contact_at)}</span>
                    {contact.days_in_stage > 3 && (
                        <span className="text-amber-500 font-medium">{contact.days_in_stage}d</span>
                    )}
                </div>
            </div>
        </div>
    )
}

// ═════════════════════════
// KANBAN COLUMN
// ═════════════════════════
function KanbanColumn({
    stage, onMove, onView, movingId
}: {
    stage: PipelineStage
    onMove: (contactId: number, newStage: string) => void
    onView: (contactId: number) => void
    movingId: number | null
}) {
    const [expanded, setExpanded] = useState(true)
    const isWinLoss = stage.is_win_stage || stage.is_loss_stage

    return (
        <div className="w-[280px] flex-shrink-0 flex flex-col max-h-[calc(100vh-220px)]">
            {/* Column Header */}
            <div
                className="flex items-center justify-between px-3 py-2.5 rounded-t-xl"
                style={{ backgroundColor: `${stage.color}12` }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm">{stage.icon}</span>
                    <span className="text-sm font-bold" style={{ color: stage.color }}>{stage.stage_label}</span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/80" style={{ color: stage.color }}>
                        {stage.contacts?.length || 0}
                    </span>
                </div>
                {stage.total_value > 0 && (
                    <span className="text-[10px] font-medium text-slate-500">
                        ${(stage.total_value / 1000).toFixed(0)}k
                    </span>
                )}
            </div>

            {/* Column Body */}
            <div className={`flex-1 overflow-y-auto space-y-2 p-2 bg-slate-50/80 rounded-b-xl border border-t-0 border-slate-200/60 ${isWinLoss ? 'bg-opacity-40' : ''
                }`}>
                {(stage.contacts || []).length === 0 ? (
                    <div className="text-center py-8 text-slate-300 text-xs">
                        Sin contactos
                    </div>
                ) : (
                    stage.contacts.map(contact => (
                        <ContactCard
                            key={contact.id}
                            contact={contact}
                            stageColor={stage.color}
                            onMove={onMove}
                            onView={onView}
                            movingId={movingId}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

// ═════════════════════════
// MAIN PAGE
// ═════════════════════════
export default function PipelinePage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [stages, setStages] = useState<PipelineStage[]>([])
    const [search, setSearch] = useState('')
    const [movingId, setMovingId] = useState<number | null>(null)
    const [showMetrics, setShowMetrics] = useState(false)

    // Funnel summary
    const totalContacts = stages.reduce((sum, s) => sum + (s.contacts?.length || 0), 0)
    const totalValue = stages.reduce((sum, s) => sum + (s.total_value || 0), 0)
    const wonContacts = stages.filter(s => s.is_win_stage).reduce((sum, s) => sum + (s.contacts?.length || 0), 0)
    const conversionRate = totalContacts > 0 ? ((wonContacts / totalContacts) * 100).toFixed(1) : '0'

    const fetchPipeline = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({ view: 'kanban' })
            if (search) params.set('search', search)
            const res = await fetch(`/api/crm/pipeline?${params}`)
            const json = await res.json()
            if (json.success) setStages(json.data.stages || [])
        } catch {
            toast({ title: 'Error', description: 'No se pudo cargar el pipeline', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }, [search, toast])

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        fetchPipeline()
    }, [isAuthenticated, fetchPipeline, router])

    const handleMoveContact = async (contactId: number, newStage: string) => {
        try {
            setMovingId(contactId)
            const res = await fetch('/api/crm/pipeline/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact_id: contactId, new_stage: newStage }),
            })
            if ((await res.json()).success) {
                toast({ title: '✅ Contacto movido' })
                fetchPipeline()
            }
        } catch {
            toast({ title: 'Error', variant: 'destructive' })
        } finally {
            setMovingId(null)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Pipeline de Ventas
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {totalContacts} contactos · ${(totalValue / 1000).toFixed(0)}k en pipeline · {conversionRate}% conversión
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-full gap-1.5" onClick={() => setShowMetrics(!showMetrics)}>
                            <TrendingUp className="w-4 h-4" /> Métricas
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full" onClick={fetchPipeline}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </PageHeader>

            <main className="px-4 py-5 max-w-full">
                {/* Metrics Bar */}
                {showMetrics && (
                    <div className="mb-5 animate-in slide-in-from-top-3 duration-200">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
                            {stages.filter(s => !s.is_loss_stage).map(stage => {
                                const pct = totalContacts > 0 ? Math.round(((stage.contacts?.length || 0) / totalContacts) * 100) : 0
                                return (
                                    <Card key={stage.stage_key} className="p-3 text-center border-0 shadow-sm">
                                        <div className="text-lg">{stage.icon}</div>
                                        <div className="text-lg font-bold" style={{ color: stage.color }}>{stage.contacts?.length || 0}</div>
                                        <div className="text-[10px] text-slate-500">{stage.stage_label}</div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: stage.color }} />
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1">{pct}%</div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="max-w-md mx-auto mb-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar contacto en pipeline..."
                            className="pl-10 h-10 rounded-xl bg-white"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Kanban Board */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-4">
                        <div className="flex gap-3 min-w-max px-1">
                            {stages.map(stage => (
                                <KanbanColumn
                                    key={stage.stage_key}
                                    stage={stage}
                                    onMove={handleMoveContact}
                                    onView={(id) => router.push(`/dashboard/crm/contacts/${id}`)}
                                    movingId={movingId}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Funnel Arrow Visualization (compact) */}
                {!loading && showMetrics && stages.length > 0 && (
                    <div className="mt-6 max-w-5xl mx-auto">
                        <Card className="p-4 border border-slate-200/60">
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <ArrowDown className="w-4 h-4 text-blue-500" /> Embudo de Conversión
                            </h3>
                            <div className="space-y-2">
                                {stages.filter(s => !s.is_loss_stage).map(stage => {
                                    const pct = totalContacts > 0 ? ((stage.contacts?.length || 0) / totalContacts) * 100 : 0
                                    return (
                                        <div key={stage.stage_key} className="flex items-center gap-3">
                                            <span className="text-xs w-24 text-right text-slate-500 truncate">{stage.icon} {stage.stage_label}</span>
                                            <div className="flex-1 h-7 bg-slate-100 rounded-full relative overflow-hidden">
                                                <div
                                                    className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                                                    style={{
                                                        width: `${Math.max(pct, 5)}%`,
                                                        backgroundColor: stage.color,
                                                    }}
                                                >
                                                    <span className="text-[10px] font-bold text-white">{stage.contacts?.length || 0}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400 w-12">{pct.toFixed(0)}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
