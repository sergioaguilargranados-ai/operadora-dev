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
            {/* ===== ESTILOS PARA IMPRESIÓN ===== */}
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: white !important; }
                    .print-area { 
                        padding: 0 !important; 
                        margin: 0 !important;
                        box-shadow: none !important;
                    }
                }
                .print-only { display: none; }
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

                    {/* ===== CABECERA PDF (solo al imprimir) ===== */}
                    <div className="print-only mb-8 border-b-2 border-blue-600 pb-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-blue-800">AS Operadora de Viajes y Eventos</h1>
                                <p className="text-gray-600">AS Viajando · viajes@asoperadora.com · {WHATSAPP_NUMBER}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Cotización</p>
                                <p className="text-xl font-bold text-blue-700">{quote.folio}</p>
                                <p className="text-sm text-gray-500">{format(new Date(quote.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                            </div>
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

                    {/* ===== PIE DE PDF (solo impresión) ===== */}
                    <div className="print-only mt-8 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
                        <p>AS Operadora de Viajes y Eventos · AS Viajando</p>
                        <p>viajes@asoperadora.com · {WHATSAPP_NUMBER} · app.asoperadora.com</p>
                        <p className="mt-1">Folio: {quote.folio} · Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                        <p className="mt-1 text-gray-400">* Los precios son referenciales y pueden variar según disponibilidad y fechas definitivas.</p>
                    </div>
                </div>

                {/* Footer web */}
                <footer className="no-print bg-[#F7F7F7] py-10 mt-12">
                    <div className="container mx-auto px-4">
                        <div className="text-center text-sm text-gray-600">
                            <p>© 2026 AS Operadora de Viajes y Eventos. Todos los derechos reservados.</p>
                            <p className="text-xs mt-2 opacity-50">v2.332 | Build: 25 Feb 2026</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
