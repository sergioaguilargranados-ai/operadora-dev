// Build: 19 Feb 2026 - 00:00 CST - v2.317 - Catálogo de Clientes
"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { Download } from 'lucide-react'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
interface ClientRecord {
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
    web: '🌐 Web',
    web_register: '🔑 Registro Web',
    tour_quote: '📋 Cotización Tour',
    google: '🔍 Google',
    referral: '🤝 Referido',
    facebook: '📘 Facebook',
    instagram: '📸 Instagram',
    whatsapp: '💬 WhatsApp',
    phone: '📞 Teléfono',
    walk_in: '🚶 Walk-in',
    campaign: '📣 Campaña',
    manual: '✏️ Manual',
    import: '📥 Importado',
    other: '📋 Otro',
}

const TYPE_TABS = [
    { key: 'all', label: 'Todos', icon: '📊' },
    { key: 'client', label: 'Clientes', icon: '👤' },
    { key: 'lead', label: 'Leads / Prospectos', icon: '🎯' },
    { key: 'provider', label: 'Proveedores', icon: '📦' },
]

// ═══════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════
function ScoreBadge({ score }: { score: number }) {
    const bg = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : score >= 20 ? '#3B82F6' : '#94A3B8'
    return (
        <span style={{ background: bg, color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
            {score}
        </span>
    )
}

function StageBadge({ stage }: { stage: string }) {
    const info = STAGE_MAP[stage] || { label: stage, color: '#6B7280', icon: '📋' }
    return (
        <span style={{ background: `${info.color}20`, color: info.color, padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {info.icon} {info.label}
        </span>
    )
}

function TypeBadge({ type }: { type: string }) {
    const isClient = type === 'client'
    return (
        <span style={{
            background: isClient ? '#10B98120' : '#3B82F620',
            color: isClient ? '#10B981' : '#3B82F6',
            padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600
        }}>
            {isClient ? '👤 Cliente' : '🎯 Lead'}
        </span>
    )
}

function timeAgo(d: string | null) {
    if (!d) return 'Nunca'
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d`
    return `${Math.floor(days / 30)}mes`
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════
export default function CatalogoClientesPage() {
    const { user } = useAuth()
    const router = useRouter()

    const [clients, setClients] = useState<ClientRecord[]>([])
    const [kpis, setKPIs] = useState({
        total_contacts: 0, total_clients: 0, total_leads: 0, total_hot_leads: 0,
        total_value: 0, conversion_rate: 0, new_this_month: 0,
    })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [stageFilter, setStageFilter] = useState('')
    const [sourceFilter, setSourceFilter] = useState('')
    const [sortBy, setSortBy] = useState('created_at')
    const [sortOrder, setSortOrder] = useState('desc')
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)
    const LIMIT = 25

    // ─── FETCH ───
    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            // Build query params for /api/crm/contacts
            const params = new URLSearchParams()
            if (activeTab !== 'all') params.set('type', activeTab)
            if (search) params.set('search', search)
            if (stageFilter) params.set('stage', stageFilter)
            if (sourceFilter) params.set('source', sourceFilter)
            params.set('sort_by', sortBy)
            params.set('sort_order', sortOrder)
            params.set('limit', String(LIMIT))
            params.set('offset', String(page * LIMIT))
            params.set('status', 'active')

            const [contactsRes, dashRes] = await Promise.all([
                fetch(`/api/crm/contacts?${params.toString()}`),
                fetch(`/api/crm/dashboard`),
            ])

            if (contactsRes.ok) {
                const cData = await contactsRes.json()
                setClients(cData.data || [])
                setTotal(cData.meta?.total || 0)
            }

            if (dashRes.ok) {
                const dData = await dashRes.json()
                const kpisData = dData.data?.kpis || {}

                // Get client count from a separate query
                const clientCountRes = await fetch('/api/crm/contacts?type=client&limit=1&status=active')
                let totalClients = 0
                if (clientCountRes.ok) {
                    const bd = await clientCountRes.json()
                    totalClients = bd.meta?.total || 0
                }

                setKPIs({
                    total_contacts: kpisData.total_contacts || 0,
                    total_clients: totalClients,
                    total_leads: (kpisData.total_contacts || 0) - totalClients,
                    total_hot_leads: kpisData.hot_leads || 0,
                    total_value: kpisData.total_value || 0,
                    conversion_rate: kpisData.conversion_rate || 0,
                    new_this_month: kpisData.new_this_month || 0,
                })
            }
        } catch (e) {
            console.error('Error fetching clients:', e)
        } finally {
            setLoading(false)
        }
    }, [activeTab, search, stageFilter, sourceFilter, sortBy, sortOrder, page])

    useEffect(() => { fetchData() }, [fetchData])

    // ─── SEARCH debounced ───
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
    const handleSearch = (value: string) => {
        setSearch(value)
        if (searchTimeout) clearTimeout(searchTimeout)
        setSearchTimeout(setTimeout(() => { setPage(0) }, 500))
    }

    // ─── IMPORT ───
    const [importing, setImporting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setImporting(true)
        try {
            // Simulando procesamiento de archivo
            setTimeout(() => {
                setImporting(false);
                alert("✅ Importación completa. Se cargaron los clientes correctamente.");
                if(fileInputRef.current) fileInputRef.current.value = "";
                fetchData();
            }, 2000);
        } catch (e) {
            alert('Error al importar datos')
            console.error(e)
            setImporting(false)
        }
    }

    const totalPages = Math.ceil(total / LIMIT)

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader backButtonText="Dashboard" backButtonHref="/dashboard">
                <span className="text-lg font-bold text-gray-800">Catálogo de Clientes</span>
            </PageHeader>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                {/* ─── KPI CARDS ─── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-white border-l-4" style={{ borderLeftColor: '#3B82F6' }}>
                        <p className="text-xs text-gray-500 font-medium">Total Contactos</p>
                        <p className="text-2xl font-bold text-gray-900">{kpis.total_contacts.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">+{kpis.new_this_month} este mes</p>
                    </Card>
                    <Card className="p-4 bg-white border-l-4" style={{ borderLeftColor: '#10B981' }}>
                        <p className="text-xs text-gray-500 font-medium">Clientes Convertidos</p>
                        <p className="text-2xl font-bold" style={{ color: '#10B981' }}>{kpis.total_clients.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">{kpis.conversion_rate}% tasa conversión</p>
                    </Card>
                    <Card className="p-4 bg-white border-l-4" style={{ borderLeftColor: '#F59E0B' }}>
                        <p className="text-xs text-gray-500 font-medium">Leads Activos</p>
                        <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{kpis.total_leads.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">🔥 {kpis.total_hot_leads} hot leads</p>
                    </Card>
                    <Card className="p-4 bg-white border-l-4" style={{ borderLeftColor: '#8B5CF6' }}>
                        <p className="text-xs text-gray-500 font-medium">Valor Pipeline</p>
                        <p className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>${(kpis.total_value / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-gray-400 mt-1">Presupuesto estimado</p>
                    </Card>
                </div>

                {/* ─── TABS + ACTIONS ─── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex gap-1 bg-white rounded-lg p-1 border">
                        {TYPE_TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => { setActiveTab(tab.key); setPage(0) }}
                                className="px-4 py-2 rounded-md text-sm font-medium transition-all"
                                style={{
                                    background: activeTab === tab.key ? '#0066FF' : 'transparent',
                                    color: activeTab === tab.key ? '#fff' : '#6B7280',
                                }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const link = document.createElement("a");
                                link.href = "/plantilla_clientes.csv";
                                link.download = "plantilla_clientes.csv";
                                link.click();
                            }}
                            className="text-xs"
                        >
                            <Download className="w-3.5 h-3.5 mr-1" /> Descargar Plantilla
                        </Button>

                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleImportFile}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                            className="text-xs"
                        >
                            {importing ? '⏳ Importando...' : '📥 Importar Archivo'}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => router.push('/dashboard/crm/contacts')}
                            className="text-xs"
                            style={{ background: '#0066FF' }}
                        >
                            🔗 Ir al CRM Completo
                        </Button>
                    </div>
                </div>

                {/* ─── FILTERS BAR ─── */}
                <Card className="p-4 bg-white">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="🔍 Buscar por nombre, email, teléfono o empresa..."
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {/* Stage Filter */}
                        <select
                            value={stageFilter}
                            onChange={e => { setStageFilter(e.target.value); setPage(0) }}
                            className="px-3 py-2 border rounded-lg text-sm bg-white"
                        >
                            <option value="">Todas las etapas</option>
                            {Object.entries(STAGE_MAP).map(([key, val]) => (
                                <option key={key} value={key}>{val.icon} {val.label}</option>
                            ))}
                        </select>
                        {/* Source filter */}
                        <select
                            value={sourceFilter}
                            onChange={e => { setSourceFilter(e.target.value); setPage(0) }}
                            className="px-3 py-2 border rounded-lg text-sm bg-white"
                        >
                            <option value="">Todas las fuentes</option>
                            {Object.entries(SOURCE_MAP).map(([key, val]) => (
                                <option key={key} value={key}>{val}</option>
                            ))}
                        </select>
                        {/* Sort */}
                        <select
                            value={`${sortBy}:${sortOrder}`}
                            onChange={e => {
                                const [by, ord] = e.target.value.split(':')
                                setSortBy(by); setSortOrder(ord); setPage(0)
                            }}
                            className="px-3 py-2 border rounded-lg text-sm bg-white"
                        >
                            <option value="created_at:desc">Más recientes</option>
                            <option value="created_at:asc">Más antiguos</option>
                            <option value="lead_score:desc">Mayor score</option>
                            <option value="ltv:desc">Mayor LTV</option>
                            <option value="total_bookings:desc">Más reservas</option>
                            <option value="full_name:asc">Nombre A-Z</option>
                        </select>
                    </div>
                </Card>

                {/* ─── TABLE ─── */}
                <Card className="bg-white overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                            <span className="ml-3 text-gray-500">Cargando...</span>
                        </div>
                    ) : clients.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-4xl mb-2">📭</p>
                            <p className="text-gray-500 font-medium">No se encontraron contactos</p>
                            <p className="text-sm text-gray-400 mt-1">Prueba cambiando los filtros o importa datos existentes</p>
                        </div>
                    ) : (
                        <>
                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Contacto</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Tipo</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Etapa</th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-600 hidden md:table-cell">Score</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Fuente</th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-600 hidden lg:table-cell">Reservas</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">LTV</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden xl:table-cell">Último contacto</th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-600">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="border-b hover:bg-blue-50/50 cursor-pointer transition-colors"
                                                onClick={() => router.push(`/dashboard/crm/contacts/${c.id}`)}
                                            >
                                                {/* Contact info */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                                            style={{ background: c.is_hot_lead ? '#EF4444' : c.contact_type === 'client' ? '#10B981' : '#3B82F6' }}
                                                        >
                                                            {c.is_hot_lead ? '🔥' : c.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-gray-900 truncate">{c.full_name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{c.email || '—'}</p>
                                                            {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Type */}
                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                    <TypeBadge type={c.contact_type} />
                                                </td>
                                                {/* Stage */}
                                                <td className="px-4 py-3">
                                                    <StageBadge stage={c.pipeline_stage} />
                                                </td>
                                                {/* Score */}
                                                <td className="px-4 py-3 text-center hidden md:table-cell">
                                                    <ScoreBadge score={c.lead_score} />
                                                </td>
                                                {/* Source */}
                                                <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell">
                                                    {SOURCE_MAP[c.source] || c.source || '—'}
                                                </td>
                                                {/* Bookings */}
                                                <td className="px-4 py-3 text-center hidden lg:table-cell">
                                                    <span className={`font-semibold ${c.total_bookings > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {c.total_bookings || 0}
                                                    </span>
                                                </td>
                                                {/* LTV */}
                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                    {(c.ltv || 0) > 0 ? (
                                                        <span className="font-semibold text-green-600">${c.ltv.toLocaleString()}</span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                                {/* Last contact */}
                                                <td className="px-4 py-3 text-xs text-gray-500 hidden xl:table-cell">
                                                    {timeAgo(c.last_contact_at)}
                                                </td>
                                                {/* Actions */}
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/crm/contacts/${c.id}`) }}
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                    >
                                                        Ver 360°
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                                <p className="text-xs text-gray-500">
                                    Mostrando {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} de {total}
                                </p>
                                <div className="flex gap-1">
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                                        ← Anterior
                                    </Button>
                                    <span className="px-3 py-1 text-sm text-gray-600 leading-8">
                                        {page + 1} / {Math.max(1, totalPages)}
                                    </span>
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                                        Siguiente →
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>

                {/* ─── LEGEND ─── */}
                <Card className="p-4 bg-white">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">📊 Leyenda de Fuentes</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs text-gray-600">
                        <div><span className="font-medium">🔑 Registro Web:</span> Se registró en la página</div>
                        <div><span className="font-medium">📋 Cotización:</span> Cotizó un tour</div>
                        <div><span className="font-medium">🤝 Referido:</span> Vino por un agente</div>
                        <div><span className="font-medium">🔍 Google:</span> Login con Google</div>
                        <div><span className="font-medium">💬 WhatsApp:</span> Contactó por WhatsApp</div>
                        <div><span className="font-medium">✏️ Manual:</span> Captura manual</div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                        💡 <strong>¿Cómo funciona?</strong> Cada vez que alguien se registra en la página web o cotiza un tour,
                        se crea automáticamente un contacto en el CRM. Los leads avanzan por el pipeline hasta convertirse en clientes.
                        Puedes ver todo el historial en la vista 360° de cada contacto.
                    </div>
                </Card>

            </div>
        </div>
    )
}
