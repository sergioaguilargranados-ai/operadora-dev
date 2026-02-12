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
    Users, UserPlus, Search, Filter, ChevronRight, ChevronLeft,
    Flame, Mail, Phone, MessageSquare, MapPin, Calendar,
    ArrowUpDown, X, Download, Loader2, Eye, MoreHorizontal,
    Target, TrendingUp, Star, Clock
} from 'lucide-react'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface Contact {
    id: number
    full_name: string
    email: string
    phone: string
    whatsapp: string
    company: string
    contact_type: string
    pipeline_stage: string
    lead_score: number
    is_hot_lead: boolean
    source: string
    status: string
    interested_destination: string
    assigned_agent_name: string
    total_interactions: number
    total_quotes: number
    total_bookings: number
    ltv: number
    created_at: string
    last_contact_at: string
    next_followup_at: string
    tags: string[]
}

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

const STAGE_MAP: Record<string, { label: string; color: string; icon: string }> = {
    new: { label: 'Nuevo', color: '#94A3B8', icon: '🆕' },
    qualified: { label: 'Calificado', color: '#3B82F6', icon: '✅' },
    quoted: { label: 'Cotizado', color: '#8B5CF6', icon: '💰' },
    negotiation: { label: 'Negociación', color: '#F59E0B', icon: '🤝' },
    reserved: { label: 'Reservado', color: '#10B981', icon: '📅' },
    paid: { label: 'Pagado', color: '#059669', icon: '💳' },
    traveling: { label: 'Viajando', color: '#06B6D4', icon: '✈️' },
    post_trip: { label: 'Post-Viaje', color: '#8B5CF6', icon: '⭐' },
    won: { label: 'Ganado', color: '#22C55E', icon: '🏆' },
    lost: { label: 'Perdido', color: '#EF4444', icon: '❌' },
}

const SOURCE_MAP: Record<string, string> = {
    web: '🌐 Web', referral: '🤝 Referido', facebook: '📘 Facebook',
    instagram: '📸 Instagram', whatsapp: '💬 WhatsApp', phone: '📞 Teléfono',
    walk_in: '🚶 Walk-in', campaign: '📣 Campaña', other: '📋 Otro',
}

const TYPE_MAP: Record<string, { label: string; color: string }> = {
    lead: { label: 'Lead', color: '#3B82F6' },
    client: { label: 'Cliente', color: '#10B981' },
    agency: { label: 'Agencia', color: '#8B5CF6' },
    corporate: { label: 'Corporativo', color: '#F59E0B' },
}

// ═══════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════

function ScoreBadge({ score }: { score: number }) {
    const bg = score >= 70 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
        : score >= 40 ? 'bg-blue-100 text-blue-700'
            : 'bg-slate-100 text-slate-600'
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${bg}`}>
            {score >= 70 && <Flame className="w-3 h-3" />}
            {score}
        </span>
    )
}

function StageBadge({ stage }: { stage: string }) {
    const s = STAGE_MAP[stage] || { label: stage, color: '#6B7280', icon: '📋' }
    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${s.color}15`, color: s.color }}
        >
            <span className="text-xs">{s.icon}</span>
            {s.label}
        </span>
    )
}

function TypeBadge({ type }: { type: string }) {
    const t = TYPE_MAP[type] || { label: type, color: '#6B7280' }
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: `${t.color}15`, color: t.color }}
        >
            {t.label}
        </span>
    )
}

function ContactRow({ contact, onClick }: { contact: Contact; onClick: () => void }) {
    const timeAgo = (d: string) => {
        if (!d) return '—'
        const secs = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
        if (secs < 3600) return `${Math.floor(secs / 60)}m`
        if (secs < 86400) return `${Math.floor(secs / 3600)}h`
        if (secs < 604800) return `${Math.floor(secs / 86400)}d`
        return new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    }

    return (
        <div
            className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50/40 cursor-pointer transition-all border-b border-slate-100 last:border-0 group"
            onClick={onClick}
        >
            {/* Avatar / Score */}
            <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${contact.is_hot_lead ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                        contact.contact_type === 'client' ? 'bg-gradient-to-br from-emerald-400 to-green-600' :
                            'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}>
                    {contact.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                {contact.is_hot_lead && (
                    <Flame className="absolute -top-1 -right-1 w-4 h-4 text-orange-500 drop-shadow" />
                )}
            </div>

            {/* Name + Details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 truncate">{contact.full_name}</span>
                    <TypeBadge type={contact.contact_type} />
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    {contact.email && (
                        <span className="flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3" /> {contact.email}
                        </span>
                    )}
                    {contact.phone && (
                        <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {contact.phone}
                        </span>
                    )}
                    {contact.interested_destination && (
                        <span className="flex items-center gap-1 text-blue-500">
                            <MapPin className="w-3 h-3" /> {contact.interested_destination}
                        </span>
                    )}
                </div>
            </div>

            {/* Stage */}
            <div className="hidden md:block flex-shrink-0">
                <StageBadge stage={contact.pipeline_stage} />
            </div>

            {/* Score */}
            <div className="hidden sm:block flex-shrink-0">
                <ScoreBadge score={contact.lead_score} />
            </div>

            {/* Source */}
            <div className="hidden lg:block text-xs text-slate-500 flex-shrink-0 w-24 truncate">
                {SOURCE_MAP[contact.source] || contact.source || '—'}
            </div>

            {/* Agent */}
            <div className="hidden xl:block text-xs text-slate-500 flex-shrink-0 w-28 truncate">
                {contact.assigned_agent_name || 'Sin asignar'}
            </div>

            {/* Last contact */}
            <div className="hidden lg:flex items-center gap-1 text-xs text-slate-400 flex-shrink-0 w-16">
                <Clock className="w-3 h-3" />
                {timeAgo(contact.last_contact_at)}
            </div>

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
        </div>
    )
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════

export default function ContactsPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [contacts, setContacts] = useState<Contact[]>([])
    const [total, setTotal] = useState(0)

    // Filters
    const [search, setSearch] = useState('')
    const [stageFilter, setStageFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [sourceFilter, setSourceFilter] = useState('')
    const [hotOnly, setHotOnly] = useState(false)
    const [sortBy, setSortBy] = useState('created_at')
    const [sortOrder, setSortOrder] = useState('desc')
    const [page, setPage] = useState(0)
    const [showFilters, setShowFilters] = useState(false)

    // New contact
    const [showNew, setShowNew] = useState(false)
    const [newForm, setNewForm] = useState({
        full_name: '', email: '', phone: '', source: 'web',
        interested_destination: '', contact_type: 'lead', notes: ''
    })
    const [saving, setSaving] = useState(false)

    const LIMIT = 30

    const fetchContacts = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (stageFilter) params.set('stage', stageFilter)
            if (typeFilter) params.set('type', typeFilter)
            if (sourceFilter) params.set('source', sourceFilter)
            if (hotOnly) params.set('hot', 'true')
            params.set('sort_by', sortBy)
            params.set('sort_order', sortOrder)
            params.set('limit', String(LIMIT))
            params.set('offset', String(page * LIMIT))

            const res = await fetch(`/api/crm/contacts?${params}`)
            const data = await res.json()
            if (data.success) {
                setContacts(data.data)
                setTotal(data.meta.total)
            }
        } catch {
            toast({ title: 'Error', description: 'No se pudieron cargar los contactos', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }, [search, stageFilter, typeFilter, sourceFilter, hotOnly, sortBy, sortOrder, page, toast])

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        fetchContacts()
    }, [isAuthenticated, fetchContacts, router])

    // Debounced search
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
    const handleSearch = (value: string) => {
        setSearch(value)
        if (searchTimeout) clearTimeout(searchTimeout)
        setSearchTimeout(setTimeout(() => { setPage(0) }, 400))
    }

    const handleCreate = async () => {
        if (!newForm.full_name.trim()) {
            toast({ title: 'Error', description: 'Nombre requerido', variant: 'destructive' })
            return
        }
        try {
            setSaving(true)
            const res = await fetch('/api/crm/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newForm),
            })
            const data = await res.json()
            if (data.success) {
                toast({ title: '✅ Contacto creado', description: `${newForm.full_name} registrado con score ${data.data.lead_score}` })
                setShowNew(false)
                setNewForm({ full_name: '', email: '', phone: '', source: 'web', interested_destination: '', contact_type: 'lead', notes: '' })
                fetchContacts()
            } else {
                toast({ title: 'Error', description: data.error, variant: 'destructive' })
            }
        } catch {
            toast({ title: 'Error', description: 'Error al crear contacto', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    const clearFilters = () => {
        setStageFilter('')
        setTypeFilter('')
        setSourceFilter('')
        setHotOnly(false)
        setSearch('')
        setPage(0)
    }

    const hasFilters = stageFilter || typeFilter || sourceFilter || hotOnly || search
    const totalPages = Math.ceil(total / LIMIT)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Contactos CRM
                        </h1>
                        <p className="text-sm text-muted-foreground">{total} contacto{total !== 1 ? 's' : ''}</p>
                    </div>
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full gap-1.5"
                        onClick={() => setShowNew(true)}
                    >
                        <UserPlus className="w-4 h-4" /> Nuevo
                    </Button>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-7xl space-y-4">
                {/* Search & Filters Bar */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre, email, teléfono..."
                            className="pl-10 h-10 rounded-xl bg-white"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                        />
                    </div>

                    <Button
                        variant={showFilters ? 'default' : 'outline'}
                        size="sm"
                        className={`rounded-lg gap-1.5 ${showFilters ? 'bg-blue-600 text-white' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                        {hasFilters && <span className="w-2 h-2 rounded-full bg-orange-400" />}
                    </Button>

                    {hotOnly && (
                        <Button variant="outline" size="sm" className="rounded-lg text-orange-600 border-orange-200 bg-orange-50" onClick={() => setHotOnly(false)}>
                            <Flame className="w-3.5 h-3.5 mr-1" /> Solo calientes
                            <X className="w-3 h-3 ml-1" />
                        </Button>
                    )}

                    {hasFilters && (
                        <Button variant="ghost" size="sm" className="text-slate-500 text-xs" onClick={clearFilters}>
                            Limpiar filtros
                        </Button>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                        <select
                            className="h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white"
                            value={sortBy}
                            onChange={e => { setSortBy(e.target.value); setPage(0) }}
                        >
                            <option value="created_at">Fecha creación</option>
                            <option value="updated_at">Última actualización</option>
                            <option value="lead_score">Score</option>
                            <option value="full_name">Nombre</option>
                            <option value="last_contact_at">Último contacto</option>
                            <option value="ltv">Valor (LTV)</option>
                        </select>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="px-2"
                            onClick={() => { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); setPage(0) }}
                        >
                            <ArrowUpDown className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Expandable Filters */}
                {showFilters && (
                    <Card className="p-4 bg-white/80 backdrop-blur border border-slate-200/60 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Etapa Pipeline</label>
                                <select
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
                                    value={stageFilter}
                                    onChange={e => { setStageFilter(e.target.value); setPage(0) }}
                                >
                                    <option value="">Todas</option>
                                    {Object.entries(STAGE_MAP).map(([key, val]) => (
                                        <option key={key} value={key}>{val.icon} {val.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Tipo</label>
                                <select
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
                                    value={typeFilter}
                                    onChange={e => { setTypeFilter(e.target.value); setPage(0) }}
                                >
                                    <option value="">Todos</option>
                                    {Object.entries(TYPE_MAP).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Fuente</label>
                                <select
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
                                    value={sourceFilter}
                                    onChange={e => { setSourceFilter(e.target.value); setPage(0) }}
                                >
                                    <option value="">Todas</option>
                                    {Object.entries(SOURCE_MAP).map(([key, val]) => (
                                        <option key={key} value={key}>{val}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant={hotOnly ? 'default' : 'outline'}
                                    size="sm"
                                    className={`w-full rounded-lg gap-1.5 ${hotOnly ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
                                    onClick={() => { setHotOnly(!hotOnly); setPage(0) }}
                                >
                                    <Flame className="w-4 h-4" />
                                    Solo Calientes
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Contacts List */}
                <Card className="overflow-hidden border border-slate-200/60">
                    {/* Header */}
                    <div className="hidden md:flex items-center gap-4 px-4 py-2.5 bg-slate-50/80 border-b text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <div className="w-10" />
                        <div className="flex-1">Contacto</div>
                        <div className="w-28">Etapa</div>
                        <div className="w-14 hidden sm:block">Score</div>
                        <div className="w-24 hidden lg:block">Fuente</div>
                        <div className="w-28 hidden xl:block">Agente</div>
                        <div className="w-16 hidden lg:block">Último</div>
                        <div className="w-4" />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="text-center py-20">
                            <Users className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                            <p className="text-lg font-medium text-slate-500">
                                {hasFilters ? 'No hay contactos con estos filtros' : 'No hay contactos aún'}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                {hasFilters ? 'Intenta cambiar los filtros' : 'Crea tu primer contacto para empezar'}
                            </p>
                            {!hasFilters && (
                                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full" onClick={() => setShowNew(true)}>
                                    <UserPlus className="w-4 h-4 mr-2" /> Crear primer contacto
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div>
                            {contacts.map(contact => (
                                <ContactRow
                                    key={contact.id}
                                    contact={contact}
                                    onClick={() => router.push(`/dashboard/crm/contacts/${contact.id}`)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/50">
                            <span className="text-xs text-slate-500">
                                Mostrando {page * LIMIT + 1}-{Math.min((page + 1) * LIMIT, total)} de {total}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm px-3">{page + 1} / {totalPages}</span>
                                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </main>

            {/* New Contact Modal */}
            {showNew && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg p-6 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-600" /> Nuevo Contacto
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Nombre completo *</label>
                                <Input placeholder="Juan Pérez" value={newForm.full_name} onChange={e => setNewForm(p => ({ ...p, full_name: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                                    <Input type="email" placeholder="juan@email.com" value={newForm.email} onChange={e => setNewForm(p => ({ ...p, email: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Teléfono</label>
                                    <Input placeholder="+52 722 123 4567" value={newForm.phone} onChange={e => setNewForm(p => ({ ...p, phone: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Tipo</label>
                                    <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" value={newForm.contact_type} onChange={e => setNewForm(p => ({ ...p, contact_type: e.target.value }))}>
                                        <option value="lead">Lead</option>
                                        <option value="client">Cliente</option>
                                        <option value="agency">Agencia</option>
                                        <option value="corporate">Corporativo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Fuente</label>
                                    <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" value={newForm.source} onChange={e => setNewForm(p => ({ ...p, source: e.target.value }))}>
                                        {Object.entries(SOURCE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Destino</label>
                                    <Input placeholder="Cancún..." value={newForm.interested_destination} onChange={e => setNewForm(p => ({ ...p, interested_destination: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Notas</label>
                                <textarea className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" placeholder="Detalles..." value={newForm.notes} onChange={e => setNewForm(p => ({ ...p, notes: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1 rounded-full" onClick={() => setShowNew(false)}>Cancelar</Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full" onClick={handleCreate} disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                Crear
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
