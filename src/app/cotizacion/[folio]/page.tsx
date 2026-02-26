'use client'
// Build: 25 Feb 2026 - 15:31 CST - v2.332 - Botón MegaTravel staff, panel staff enriquecido, PDF cotización

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Mail,
    Phone,
    MessageCircle,
    MapPin,
    Users,
    DollarSign,
    Loader2,
    AlertCircle,
    Calendar,
    Plane,
    Edit,
    Save,
    Shield,
    FileText,
    ExternalLink,
    Download,
    Printer,
    Plus,
    Trash2,
    Package
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const WHATSAPP_NUMBER = '+527208156804'

const STATUS_CONFIG: Record<string, any> = {
    pending: {
        label: 'Solicitud Recibida',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Clock,
        description: 'Hemos recibido tu solicitud y la estamos revisando'
    },
    solicitud: {
        label: 'Solicitud',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Clock,
        description: 'Tu solicitud está pendiente de revisión'
    },
    en_proceso: {
        label: 'En Proceso',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: MessageCircle,
        description: 'Nuestro equipo está preparando tu cotización'
    },
    contacted: {
        label: 'Contactado',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: MessageCircle,
        description: 'Nuestro equipo se ha puesto en contacto contigo'
    },
    quoted: {
        label: 'Cotización Enviada',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: Mail,
        description: 'Te hemos enviado una cotización personalizada'
    },
    confirmed: {
        label: 'Confirmado',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
        description: '¡Tu viaje está confirmado!'
    },
    cancelled: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: AlertCircle,
        description: 'Esta cotización ha sido cancelada'
    }
}

const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']

// Construir URL de MegaTravel desde tour_id (ej: AS-60966, MT-60966, o 60966)
function getMegaTravelUrl(tourId: string): string {
    // Extraer solo la parte numérica del código
    const code = tourId.replace(/^(AS-|MT-)/, '')
    // URL directa al circuito (más confiable que la búsqueda)
    return `https://www.megatravel.com.mx/tools/circuito.php?viaje=${code}`
}

export default function CotizacionTrackingPage({ params }: { params: Promise<{ folio: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const { toast } = useToast()
    const { user, isAuthenticated } = useAuth()
    const printRef = useRef<HTMLDivElement>(null)
    const [quote, setQuote] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editData, setEditData] = useState<any>({})
    // Items incluidos (staff)
    const [includedItems, setIncludedItems] = useState<string[]>([])
    const [newItem, setNewItem] = useState('')

    const isStaff = isAuthenticated && user?.role && STAFF_ROLES.includes(user.role)
    const canClientEdit = quote?.status === 'pending' || quote?.status === 'solicitud'

    useEffect(() => {
        fetchQuote()
    }, [resolvedParams.folio])

    const fetchQuote = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/tours/quote/${resolvedParams.folio}`)
            const data = await response.json()

            if (data.success) {
                setQuote(data.data)
                setEditData({
                    num_personas: data.data.num_personas,
                    special_requests: data.data.special_requests || '',
                    contact_phone: data.data.contact_phone || '',
                    notes: data.data.notes || '',
                    status: data.data.status || 'pending',
                    // Campos staff de precio
                    price_per_person: data.data.price_per_person || 0,
                    taxes: data.data.taxes || 0,
                    supplement: data.data.supplement || 0,
                    total_per_person: data.data.total_per_person || 0,
                    included_items: data.data.included_items || ''
                })
                // Parsear items incluidos
                if (data.data.included_items) {
                    setIncludedItems(
                        data.data.included_items.split('\n').filter((i: string) => i.trim())
                    )
                }
            } else {
                setError(true)
            }
        } catch (error) {
            console.error('Error fetching quote:', error)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveChanges = async () => {
        setSaving(true)
        try {
            // Calcular precios si staff los modificó
            const baseP = parseFloat(editData.price_per_person) || parseFloat(quote.price_per_person) || 0
            const taxesP = parseFloat(editData.taxes) || 0
            const suppP = parseFloat(editData.supplement) || 0
            const totalPP = baseP + taxesP + suppP
            const totalPrice = totalPP * (parseInt(editData.num_personas) || 1)
            const itemsStr = includedItems.join('\n')

            const response = await fetch(`/api/tours/quote/${resolvedParams.folio}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editData,
                    total_per_person: totalPP,
                    total_price: totalPrice,
                    included_items: itemsStr,
                    updatedBy: isStaff ? user?.name : 'cliente'
                })
            })
            const data = await response.json()

            if (data.success) {
                toast({ title: '✅ Cambios guardados', description: 'Cotización actualizada exitosamente' })
                setEditing(false)
                fetchQuote()
            } else {
                throw new Error(data.error || 'Error al guardar')
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'No se pudieron guardar los cambios', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    const handleWhatsApp = () => {
        const message = encodeURIComponent(
            `Hola, tengo una consulta sobre mi cotización ${resolvedParams.folio} para el tour "${quote?.tour_name}"`
        )
        window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}?text=${message}`, '_blank')
    }

    const handlePrint = () => {
        window.print()
    }

    const formatPrice = (price: number | string) => {
        const num = typeof price === 'string' ? parseFloat(price) : price
        if (!num || isNaN(num)) return '0'
        return new Intl.NumberFormat('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num)
    }

    const addItem = () => {
        if (newItem.trim()) {
            setIncludedItems([...includedItems, newItem.trim()])
            setNewItem('')
        }
    }

    const removeItem = (idx: number) => {
        setIncludedItems(includedItems.filter((_, i) => i !== idx))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando cotización...</p>
                </div>
            </div>
        )
    }

    if (error || !quote) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
                    <div className="container mx-auto px-4 py-4">
                        <Link href="/" className="flex items-center"><Logo className="py-2" /></Link>
                    </div>
                </header>
                <div className="container mx-auto px-4 py-16 max-w-2xl">
                    <Card className="p-8 text-center">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h1 className="text-2xl font-bold mb-2">Cotización no encontrada</h1>
                        <p className="text-gray-600 mb-6">No pudimos encontrar la cotización con folio <strong>{resolvedParams.folio}</strong>.</p>
                        <Button onClick={() => router.push('/tours')} className="bg-blue-600 hover:bg-blue-700 text-white">Ver tours disponibles</Button>
                    </Card>
                </div>
            </div>
        )
    }

    const statusConfig = STATUS_CONFIG[quote.status as string] || STATUS_CONFIG.pending
    const StatusIcon = statusConfig.icon
    const megaTravelUrl = getMegaTravelUrl(quote.tour_id || '')
    const totalPP = (parseFloat(quote.price_per_person) || 0) + (parseFloat(quote.taxes) || 0) + (parseFloat(quote.supplement) || 0)
    const displayTotalPP = parseFloat(quote.total_per_person) > 0 ? parseFloat(quote.total_per_person) : totalPP
    const parsedItems = quote.included_items
        ? quote.included_items.split('\n').filter((i: string) => i.trim())
        : []

    return (
        <>
            {/* ===== ESTILOS PARA IMPRESIÓN - DISEÑO INSTITUCIONAL ===== */}
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .print-flex { display: flex !important; }
                    body { 
                        background: white !important; 
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        font-size: 11pt;
                        color: #1a1a1a;
                    }
                    * { box-shadow: none !important; }
                    .container { max-width: 100% !important; padding: 0 !important; }
                    .min-h-screen { min-height: auto !important; background: white !important; }
                    .bg-gradient-to-br { background: white !important; }
                    /* Forzar colores en la tabla de precios */
                    .pdf-price-header { background-color: #0066FF !important; color: white !important; }
                    .pdf-price-row-alt { background-color: #f0f7ff !important; }
                    .pdf-accent-bar { background-color: #0066FF !important; }
                    .pdf-accent-bar-gold { background-color: #b8860b !important; }
                    .pdf-footer-bar { background-color: #1e3a5f !important; color: white !important; }
                    /* Grid para impresión */
                    .lg\\:grid-cols-3 { display: block !important; }
                    .lg\\:col-span-2, .lg\\:col-span-1 { width: 100% !important; }
                    .sticky { position: relative !important; top: auto !important; }
                    /* Cards sin bordes redondeados excesivos */
                    .rounded-lg, .rounded-xl { border-radius: 4px !important; }
                    .rounded-full { border-radius: 4px !important; }
                    /* Evitar cortes */
                    .pdf-no-break { page-break-inside: avoid; }
                    @page { margin: 15mm 15mm 20mm 15mm; size: A4; }
                }
                .print-only { display: none; }
                .print-flex { display: none; }
            `}</style>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

                {/* ===== HEADER ===== */}
                <header className="no-print sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => router.push('/tours')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                    <span className="hidden sm:inline text-sm font-medium">Ver tours</span>
                                </button>
                                <Link href="/" className="flex items-center"><Logo className="py-2" /></Link>
                            </div>
                            <div className="flex items-center gap-3">
                                {isStaff && (
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center gap-1">
                                        <Shield className="w-3 h-3" />Staff
                                    </span>
                                )}
                                {/* Botón PDF - visible para todos */}
                                <Button size="sm" variant="outline" onClick={handlePrint} className="flex items-center gap-1">
                                    <Printer className="w-4 h-4" />
                                    <span className="hidden sm:inline">PDF</span>
                                </Button>
                                <Button size="sm" onClick={handleWhatsApp} className="bg-green-500 text-white hover:bg-green-600">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">WhatsApp</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-8 max-w-4xl" ref={printRef}>

                    {/* ===== CABECERA PDF INSTITUCIONAL (solo al imprimir) ===== */}
                    <div className="print-only mb-6">
                        {/* Barra azul superior */}
                        <div className="pdf-accent-bar h-2 w-full mb-6" style={{ backgroundColor: '#0066FF' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {/* Lado izquierdo - Logo y empresa */}
                            <div>
                                <div style={{ fontFamily: 'Georgia, serif', fontSize: '36pt', fontWeight: 'bold', lineHeight: '1', color: '#000' }}>
                                    AS
                                </div>
                                <div style={{ fontFamily: 'Georgia, serif', fontSize: '8pt', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase', color: '#000', marginTop: '2px' }}>
                                    AS OPERADORA DE VIAJES Y EVENTOS
                                </div>
                                <div style={{ fontFamily: 'Georgia, serif', fontSize: '8pt', color: '#555', marginTop: '1px' }}>
                                    AS Viajando
                                </div>
                            </div>

                            {/* Lado derecho - Datos del documento */}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10pt', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                                    Cotización de Tour
                                </div>
                                <div className="pdf-accent-bar" style={{ backgroundColor: '#0066FF', color: 'white', padding: '6px 16px', marginTop: '6px', fontSize: '13pt', fontWeight: 'bold', display: 'inline-block' }}>
                                    {quote.folio}
                                </div>
                                <div style={{ fontSize: '9pt', color: '#888', marginTop: '6px' }}>
                                    {format(new Date(quote.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                                </div>
                            </div>
                        </div>

                        {/* Línea separadora dorada */}
                        <div className="pdf-accent-bar-gold" style={{ backgroundColor: '#b8860b', height: '1px', width: '100%', marginTop: '16px' }}></div>

                        {/* Datos de contacto empresa en línea */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '8pt', color: '#666', marginTop: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                            <span>📧 viajes@asoperadora.com</span>
                            <span>📱 {WHATSAPP_NUMBER}</span>
                            <span>🌐 app.asoperadora.com</span>
                        </div>
                    </div>

                    {/* ===== ESTADO ===== */}
                    <Card className="p-6 mb-6">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <div>
                                <h1 className="text-2xl font-bold mb-1">Cotización {quote.folio}</h1>
                                <p className="text-gray-600">
                                    Solicitada el {format(new Date(quote.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className={`px-4 py-2 rounded-full border-2 ${statusConfig.color} flex items-center gap-2`}>
                                    <StatusIcon className="w-5 h-5" />
                                    <span className="font-semibold">{statusConfig.label}</span>
                                </div>
                                {(isStaff || canClientEdit) && !editing && (
                                    <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="flex items-center gap-1 no-print">
                                        <Edit className="w-4 h-4" />Editar
                                    </Button>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-700">{statusConfig.description}</p>
                    </Card>

                    {/* ===== PANEL STAFF ===== */}
                    {editing && isStaff && (
                        <Card className="p-6 mb-6 border-2 border-purple-300 bg-purple-50/50 no-print">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-800">
                                <Shield className="w-5 h-5" />Edición Operativa
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Estado */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Estado</label>
                                    <select className="w-full h-10 px-3 border rounded-md" value={editData.status}
                                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                                        <option value="pending">Solicitud Recibida</option>
                                        <option value="solicitud">Solicitud</option>
                                        <option value="en_proceso">En Proceso</option>
                                        <option value="contacted">Contactado</option>
                                        <option value="quoted">Cotización Enviada</option>
                                        <option value="confirmed">Confirmado</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                </div>
                                {/* Personas */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Número de personas</label>
                                    <Input type="number" min="1" value={editData.num_personas}
                                        onChange={(e) => setEditData({ ...editData, num_personas: parseInt(e.target.value) || 1 })} />
                                </div>
                                {/* Precio base */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Precio base p/persona (USD)</label>
                                    <Input type="number" min="0" step="0.01" value={editData.price_per_person}
                                        onChange={(e) => setEditData({ ...editData, price_per_person: parseFloat(e.target.value) || 0 })} />
                                </div>
                                {/* Impuestos */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Impuestos p/persona (USD)</label>
                                    <Input type="number" min="0" step="0.01" value={editData.taxes}
                                        onChange={(e) => setEditData({ ...editData, taxes: parseFloat(e.target.value) || 0 })} />
                                </div>
                                {/* Suplemento */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Suplemento p/persona (USD)</label>
                                    <Input type="number" min="0" step="0.01" value={editData.supplement}
                                        onChange={(e) => setEditData({ ...editData, supplement: parseFloat(e.target.value) || 0 })} />
                                </div>
                                {/* Total calculado */}
                                <div className="flex items-end">
                                    <div className="w-full p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-xs text-blue-600 mb-1">Total por persona (calculado)</p>
                                        <p className="text-xl font-bold text-blue-800">
                                            ${formatPrice((parseFloat(editData.price_per_person) || 0) + (parseFloat(editData.taxes) || 0) + (parseFloat(editData.supplement) || 0))} USD
                                        </p>
                                        <p className="text-xs text-blue-500">
                                            Total: ${formatPrice(((parseFloat(editData.price_per_person) || 0) + (parseFloat(editData.taxes) || 0) + (parseFloat(editData.supplement) || 0)) * (parseInt(editData.num_personas) || 1))} USD
                                        </p>
                                    </div>
                                </div>
                                {/* Notas internas */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Notas internas (solo staff)</label>
                                    <textarea className="w-full p-3 border rounded-lg bg-white min-h-[80px]"
                                        value={editData.notes}
                                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                        placeholder="Notas internas sobre esta cotización..." />
                                </div>
                                {/* Items incluidos */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                                        <Package className="w-4 h-4" />Servicios / Incluye
                                    </label>
                                    <div className="space-y-2">
                                        {includedItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                <span className="flex-1 text-sm">{item}</span>
                                                <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <Input value={newItem} onChange={(e) => setNewItem(e.target.value)}
                                                placeholder="Ej: Vuelo redondo, Hotel 4 estrellas..."
                                                onKeyDown={(e) => e.key === 'Enter' && addItem()} />
                                            <Button type="button" onClick={addItem} variant="outline" size="sm">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button onClick={handleSaveChanges} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                                <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                            </div>
                        </Card>
                    )}

                    {/* ===== PANEL CLIENTE ===== */}
                    {editing && !isStaff && canClientEdit && (
                        <Card className="p-6 mb-6 border-2 border-blue-300 bg-blue-50/50 no-print">
                            <h2 className="text-xl font-bold mb-4 text-blue-800">Editar Solicitud</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Número de personas</label>
                                    <Input type="number" min="1" value={editData.num_personas}
                                        onChange={(e) => setEditData({ ...editData, num_personas: parseInt(e.target.value) || 1 })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Teléfono de contacto</label>
                                    <Input value={editData.contact_phone}
                                        onChange={(e) => setEditData({ ...editData, contact_phone: e.target.value })}
                                        placeholder="Tu teléfono" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Comentarios especiales</label>
                                    <textarea className="w-full p-3 border rounded-lg bg-white min-h-[80px]"
                                        value={editData.special_requests}
                                        onChange={(e) => setEditData({ ...editData, special_requests: e.target.value })}
                                        placeholder="Tus comentarios..." />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button onClick={handleSaveChanges} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                                <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                            </div>
                        </Card>
                    )}

                    {/* ===== CONTENIDO PRINCIPAL ===== */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Columna detalle */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Detalles del tour */}
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Detalles del Tour</h2>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Tour</div>
                                        <div className="font-semibold text-lg">{quote.tour_name}</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <span>{quote.tour_region}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span>{quote.tour_duration}</span>
                                    </div>
                                    {/* Fecha de salida */}
                                    {quote.departure_date && (
                                        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                                            <Calendar className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="text-xs text-green-600">Fecha de salida</p>
                                                <p className="font-bold">
                                                    {(() => {
                                                        const dateStr = String(quote.departure_date).substring(0, 10)
                                                        return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('es-MX', {
                                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                                        })
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {quote.origin_city && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Plane className="w-4 h-4 text-blue-600" />
                                            <span>Salida desde: <strong>{quote.origin_city}</strong></span>
                                        </div>
                                    )}
                                    {quote.tour_cities && (
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Ciudades</div>
                                            <div className="text-gray-900">{quote.tour_cities}</div>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Items incluidos (si existen) */}
                            {parsedItems.length > 0 && (
                                <Card className="p-6">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-blue-600" />El tour incluye
                                    </h2>
                                    <ul className="space-y-2">
                                        {parsedItems.map((item: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}

                            {/* Contacto */}
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Información de Contacto</h2>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Nombre</div>
                                        <div className="font-semibold">{quote.contact_name}</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        <a href={`mailto:${quote.contact_email}`} className="hover:text-blue-600">{quote.contact_email}</a>
                                    </div>
                                    {quote.contact_phone && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone className="w-4 h-4 text-blue-600" />
                                            <a href={`tel:${quote.contact_phone}`} className="hover:text-blue-600">{quote.contact_phone}</a>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {quote.special_requests && (
                                <Card className="p-6">
                                    <h2 className="text-xl font-bold mb-4">Comentarios</h2>
                                    <p className="text-gray-700">{quote.special_requests}</p>
                                </Card>
                            )}

                            {/* Notas del equipo */}
                            {(isStaff || quote.notes) && quote.notes && (
                                <Card className="p-6 bg-blue-50 border-blue-200">
                                    <h2 className="text-xl font-bold mb-4 text-blue-900">
                                        {isStaff ? 'Notas Internas' : 'Notas del Equipo'}
                                    </h2>
                                    <p className="text-blue-800">{quote.notes}</p>
                                </Card>
                            )}

                            {/* Panel operativo staff */}
                            {isStaff && (
                                <Card className="p-4 bg-purple-50 border-purple-200 no-print">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div className="flex items-center gap-2 text-purple-700">
                                            <Shield className="w-5 h-5" />
                                            <span className="font-semibold">Panel Operativo</span>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {/* ★ BOTÓN MEGATRAVEL — solo staff */}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                                onClick={() => window.open(megaTravelUrl, '_blank')}
                                            >
                                                <ExternalLink className="w-4 h-4 mr-1" />
                                                Ver en MegaTravel
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-purple-300 text-purple-700 hover:bg-purple-100"
                                                onClick={() => router.push('/dashboard/quotes')}
                                            >
                                                <FileText className="w-4 h-4 mr-1" />
                                                Gestión Cotizaciones
                                            </Button>
                                        </div>
                                    </div>
                                    {/* ID del tour para referencia */}
                                    <p className="text-xs text-purple-500 mt-2">Tour ID: {quote.tour_id} · Folio DB: #{quote.id}</p>
                                </Card>
                            )}
                        </div>

                        {/* Columna resumen precio */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                                    <h3 className="font-bold text-lg mb-4">Resumen de Precio</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>{quote.num_personas} {quote.num_personas === 1 ? 'persona' : 'personas'}</span>
                                        </div>
                                        <div className="border-t border-white/20 pt-3 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-white/80">Precio base:</span>
                                                <span className="font-semibold">${formatPrice(quote.price_per_person)} USD</span>
                                            </div>
                                            {parseFloat(quote.taxes) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-white/80">Impuestos:</span>
                                                    <span className="font-semibold">${formatPrice(quote.taxes)} USD</span>
                                                </div>
                                            )}
                                            {parseFloat(quote.supplement) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-white/80">Suplemento:</span>
                                                    <span className="font-semibold">${formatPrice(quote.supplement)} USD</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-t border-white/20 pt-3">
                                            <div className="text-white/80 mb-1">Total por persona</div>
                                            <div className="text-2xl font-bold">${formatPrice(displayTotalPP)} USD</div>
                                        </div>
                                        <div className="border-t border-white/20 pt-3">
                                            <div className="text-white/80 mb-1">Total estimado</div>
                                            <div className="text-3xl font-bold">${formatPrice(quote.total_price)} USD</div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4">
                                    <h4 className="font-semibold mb-3">¿Necesitas ayuda?</h4>
                                    <div className="space-y-2 text-sm">
                                        <a href={`tel:${WHATSAPP_NUMBER}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                            <Phone className="w-4 h-4" />{WHATSAPP_NUMBER}
                                        </a>
                                        <a href="mailto:viajes@asoperadora.com" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                            <Mail className="w-4 h-4" />viajes@asoperadora.com
                                        </a>
                                        <button onClick={handleWhatsApp} className="flex items-center gap-2 text-green-600 hover:text-green-700">
                                            <MessageCircle className="w-4 h-4" />WhatsApp
                                        </button>
                                    </div>
                                </Card>

                                <Card className="p-4 bg-green-50 border-green-200">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-green-800">
                                            Te contactaremos en menos de 24 horas con tu cotización personalizada
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* ===== SECCIÓN PDF COMPLETA (solo impresión) ===== */}
                    <div className="print-only mt-6">
                        {/* Tabla de precios formal */}
                        <div className="pdf-no-break" style={{ marginBottom: '20px' }}>
                            <div className="pdf-accent-bar" style={{ backgroundColor: '#0066FF', color: 'white', padding: '8px 16px', fontSize: '11pt', fontWeight: 'bold' }}>
                                💰 Desglose de Precios
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Concepto</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Precio USD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px 12px' }}>Precio base por persona</td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>${formatPrice(quote.price_per_person)}</td>
                                    </tr>
                                    {parseFloat(quote.taxes) > 0 && (
                                        <tr className="pdf-price-row-alt" style={{ borderBottom: '1px solid #eee', backgroundColor: '#f0f7ff' }}>
                                            <td style={{ padding: '8px 12px' }}>Impuestos aéreos por persona</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>${formatPrice(quote.taxes)}</td>
                                        </tr>
                                    )}
                                    {parseFloat(quote.supplement) > 0 && (
                                        <tr style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '8px 12px' }}>Suplemento por persona</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>${formatPrice(quote.supplement)}</td>
                                        </tr>
                                    )}
                                    <tr style={{ borderTop: '2px solid #0066FF', backgroundColor: '#f0f7ff' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: 'bold', fontSize: '11pt' }}>Total por persona</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '13pt', color: '#0066FF' }}>${formatPrice(displayTotalPP)} USD</td>
                                    </tr>
                                    <tr style={{ backgroundColor: '#0066FF', color: 'white' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: 'bold', fontSize: '11pt' }}>
                                            Total estimado ({quote.num_personas} {quote.num_personas === 1 ? 'persona' : 'personas'})
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '14pt' }}>${formatPrice(quote.total_price)} USD</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Datos del cliente */}
                        <div className="pdf-no-break" style={{ marginBottom: '20px', border: '1px solid #dee2e6', padding: '16px' }}>
                            <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#333', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                                👤 Datos del Cliente
                            </div>
                            <div style={{ display: 'flex', gap: '40px', fontSize: '9pt' }}>
                                <div>
                                    <div style={{ color: '#888', fontSize: '8pt' }}>Nombre</div>
                                    <div style={{ fontWeight: 600 }}>{quote.contact_name}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#888', fontSize: '8pt' }}>Email</div>
                                    <div>{quote.contact_email}</div>
                                </div>
                                {quote.contact_phone && (
                                    <div>
                                        <div style={{ color: '#888', fontSize: '8pt' }}>Teléfono</div>
                                        <div>{quote.contact_phone}</div>
                                    </div>
                                )}
                                <div>
                                    <div style={{ color: '#888', fontSize: '8pt' }}>Personas</div>
                                    <div style={{ fontWeight: 600 }}>{quote.num_personas}</div>
                                </div>
                            </div>
                        </div>

                        {/* Servicios incluidos (si hay) */}
                        {parsedItems.length > 0 && (
                            <div className="pdf-no-break" style={{ marginBottom: '20px', border: '1px solid #dee2e6', padding: '16px' }}>
                                <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#333', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                                    ✅ Servicios Incluidos
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px', fontSize: '9pt' }}>
                                    {parsedItems.map((item: string, idx: number) => (
                                        <div key={idx} style={{ padding: '3px 0', borderBottom: '1px dotted #eee' }}>• {item}</div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comentarios especiales */}
                        {quote.special_requests && (
                            <div className="pdf-no-break" style={{ marginBottom: '20px', border: '1px solid #dee2e6', padding: '16px', backgroundColor: '#fffdf5' }}>
                                <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#333', marginBottom: '6px' }}>
                                    💬 Comentarios del Cliente
                                </div>
                                <div style={{ fontSize: '9pt', color: '#555', fontStyle: 'italic' }}>{quote.special_requests}</div>
                            </div>
                        )}

                        {/* Términos y condiciones */}
                        <div className="pdf-no-break" style={{ marginTop: '24px', padding: '12px 16px', border: '1px solid #e0e0e0', fontSize: '7pt', color: '#888', lineHeight: '1.5' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '8pt', color: '#666', marginBottom: '4px' }}>TÉRMINOS Y CONDICIONES</div>
                            <div>
                                1. Los precios son referenciales y están sujetos a disponibilidad y tipo de cambio al momento de la reservación.
                                2. La cotización tiene una vigencia de 7 días naturales a partir de la fecha de emisión.
                                3. Precios por persona en base a habitación doble, salvo indicación contraria.
                                4. Los impuestos aéreos pueden variar sin previo aviso según la aerolínea.
                                5. No incluye servicios no especificados en esta cotización.
                                6. Aplican políticas de cancelación y penalizaciones del proveedor.
                            </div>
                        </div>

                        {/* Pie de página institucional */}
                        <div style={{ marginTop: '20px' }}>
                            <div className="pdf-accent-bar-gold" style={{ backgroundColor: '#b8860b', height: '1px', width: '100%' }}></div>
                            <div className="pdf-footer-bar" style={{ backgroundColor: '#1e3a5f', color: 'white', padding: '12px 16px', marginTop: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8pt' }}>
                                <div>
                                    <span style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '10pt' }}>AS</span>
                                    <span style={{ marginLeft: '8px' }}>Operadora de Viajes y Eventos · AS Viajando</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div>Folio: {quote.folio}</div>
                                    <div style={{ opacity: 0.7 }}>Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })} hrs</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer web */}
                <footer className="no-print bg-[#F7F7F7] py-10 mt-12">
                    <div className="container mx-auto px-4">
                        <div className="text-center text-sm text-gray-600">
                            <p>© 2026 AS Operadora de Viajes y Eventos. Todos los derechos reservados.</p>
                            <p className="text-xs mt-2 opacity-50">v2.332</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
