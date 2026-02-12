"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import {
    MessageSquare, Send, Loader2, ChevronRight,
    Users, Search, CheckCircle, XCircle, Eye, RefreshCw
} from 'lucide-react'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface WATemplate {
    id: string
    name: string
    category: string
    variables: string[]
}

interface Contact {
    id: number
    full_name: string
    phone: string
    whatsapp: string
    pipeline_stage: string
}

interface SendResultItem {
    success: boolean
    contact_id: number
    error?: string
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
    welcome: { label: '👋 Bienvenida', color: 'bg-green-100 text-green-700' },
    followup: { label: '📞 Seguimiento', color: 'bg-blue-100 text-blue-700' },
    quote: { label: '📋 Cotización', color: 'bg-purple-100 text-purple-700' },
    reminder: { label: '⏰ Recordatorio', color: 'bg-amber-100 text-amber-700' },
    confirmation: { label: '✅ Confirmación', color: 'bg-teal-100 text-teal-700' },
    posttrip: { label: '⭐ Post-viaje', color: 'bg-pink-100 text-pink-700' },
}

// ═══════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════

export default function WhatsAppPage() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
    const [templates, setTemplates] = useState<WATemplate[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<WATemplate | null>(null)
    const [contacts, setContacts] = useState<Contact[]>([])
    const [selectedContacts, setSelectedContacts] = useState<number[]>([])
    const [preview, setPreview] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<{ sent: number; failed: number; results: SendResultItem[] } | null>(null)

    useEffect(() => {
        loadTemplates()
    }, [])

    const loadTemplates = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/crm/whatsapp?action=templates')
            const json = await res.json()
            if (json.success) setTemplates(json.data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const loadContacts = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/crm/contacts?has_phone=true&limit=200')
            const json = await res.json()
            if (json.success) setContacts(json.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const loadPreview = async () => {
        if (!selectedTemplate) return
        try {
            const res = await fetch(`/api/crm/whatsapp?action=preview&template_id=${selectedTemplate.id}&nombre=Cliente&destino=Cancún&precio=$25,000 MXN&agente=Ana&fecha=15 de marzo&folio=ASO-2026-001`)
            const json = await res.json()
            if (json.success) setPreview(json.data.preview)
        } catch (err) { console.error(err) }
    }

    const handleSelectTemplate = (t: WATemplate) => {
        setSelectedTemplate(t)
        setStep(2)
        loadContacts()
    }

    const handleGoToPreview = async () => {
        setStep(3)
        await loadPreview()
    }

    const handleSend = async () => {
        if (!selectedTemplate || selectedContacts.length === 0) return
        setSending(true)
        try {
            const res = await fetch('/api/crm/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_id: selectedTemplate.id,
                    contact_ids: selectedContacts,
                }),
            })
            const json = await res.json()
            if (json.success) {
                setResults(json.data)
                setStep(4)
            }
        } catch (err) { console.error(err) }
        finally { setSending(false) }
    }

    const toggleContact = (id: number) => {
        setSelectedContacts(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    const filteredContacts = contacts.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || '').includes(searchTerm) ||
        (c.whatsapp || '').includes(searchTerm)
    )

    // Steps indicator
    const STEPS = ['Plantilla', 'Contactos', 'Preview', 'Resultado']

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50/50 to-emerald-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                            WhatsApp CRM
                        </h1>
                        <p className="text-xs text-gray-500">Envía mensajes con plantillas profesionales</p>
                    </div>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-4xl">
                {/* Steps */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                                ${i + 1 <= step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}
                            `}>{i + 1}</div>
                            <span className={`text-xs ${i + 1 <= step ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{s}</span>
                            {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                        </div>
                    ))}
                </div>

                {/* ═══════ PASO 1: PLANTILLAS ═══════ */}
                {step === 1 && (
                    <div>
                        <h2 className="text-sm font-semibold text-gray-600 mb-3">Selecciona una plantilla</h2>
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-green-500 mx-auto" />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {templates.map(t => {
                                    const cat = CATEGORY_LABELS[t.category] || { label: t.category, color: 'bg-gray-100 text-gray-600' }
                                    return (
                                        <Card
                                            key={t.id}
                                            className="p-4 cursor-pointer hover:shadow-md hover:border-green-300 transition-all"
                                            onClick={() => handleSelectTemplate(t)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-800">{t.name}</h3>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${cat.color} mt-1 inline-block`}>
                                                        {cat.label}
                                                    </span>
                                                </div>
                                                <MessageSquare className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {t.variables.map(v => (
                                                    <span key={v} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                                        {`{{${v}}}`}
                                                    </span>
                                                ))}
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ PASO 2: CONTACTOS ═══════ */}
                {step === 2 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-gray-600">
                                Selecciona contactos ({selectedContacts.length} seleccionados)
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setStep(1)}>← Atrás</Button>
                                <Button size="sm" className="text-xs h-7 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleGoToPreview} disabled={selectedContacts.length === 0}>
                                    Siguiente →
                                </Button>
                            </div>
                        </div>

                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                                placeholder="Buscar por nombre o teléfono..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 mb-3">
                            <Button variant="outline" size="sm" className="text-xs h-7"
                                onClick={() => setSelectedContacts(filteredContacts.map(c => c.id))}>
                                Seleccionar todos
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs h-7"
                                onClick={() => setSelectedContacts([])}>
                                Limpiar
                            </Button>
                        </div>

                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-green-500 mx-auto" />
                        ) : (
                            <Card className="divide-y max-h-[400px] overflow-y-auto">
                                {filteredContacts.map(c => (
                                    <div
                                        key={c.id}
                                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                                            ${selectedContacts.includes(c.id) ? 'bg-green-50' : 'hover:bg-gray-50'}
                                        `}
                                        onClick={() => toggleContact(c.id)}
                                    >
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center
                                            ${selectedContacts.includes(c.id) ? 'bg-green-500 border-green-500' : 'border-gray-300'}
                                        `}>
                                            {selectedContacts.includes(c.id) && (
                                                <CheckCircle className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-gray-800 truncate">{c.full_name}</div>
                                            <div className="text-[10px] text-gray-400">{c.whatsapp || c.phone}</div>
                                        </div>
                                        <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                            {c.pipeline_stage}
                                        </span>
                                    </div>
                                ))}
                            </Card>
                        )}
                    </div>
                )}

                {/* ═══════ PASO 3: PREVIEW ═══════ */}
                {step === 3 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-gray-600">Vista previa del mensaje</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setStep(2)}>← Atrás</Button>
                                <Button size="sm" className="text-xs h-7 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleSend} disabled={sending}>
                                    {sending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                                    Enviar a {selectedContacts.length} contactos
                                </Button>
                            </div>
                        </div>

                        {/* Simulación WhatsApp */}
                        <div className="max-w-md mx-auto">
                            <div className="bg-[#075e54] text-white px-4 py-3 rounded-t-xl flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">AS Operadora</div>
                                    <div className="text-[10px] text-green-200">en línea</div>
                                </div>
                            </div>
                            <div className="bg-[#ECE5DD] p-4 min-h-[300px]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'a\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M0 20h40M20 0v40\' fill=\'none\' stroke=\'%23d4cfc6\' stroke-width=\'.3\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'200\' height=\'200\' fill=\'%23ECE5DD\'/%3E%3Crect width=\'200\' height=\'200\' fill=\'url(%23a)\'/%3E%3C/svg%3E")' }}>
                                <div className="max-w-[85%] bg-white rounded-lg p-3 shadow-sm relative ml-auto">
                                    <div className="text-[11px] text-gray-800 whitespace-pre-line leading-relaxed">
                                        {preview || 'Cargando vista previa...'}
                                    </div>
                                    <div className="text-right mt-1">
                                        <span className="text-[9px] text-gray-400">
                                            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} ✓✓
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#f0f0f0] px-4 py-2 rounded-b-xl flex items-center gap-2">
                                <div className="flex-1 bg-white rounded-full px-4 py-1.5 text-xs text-gray-400">
                                    Escribe un mensaje...
                                </div>
                                <div className="w-8 h-8 bg-[#075e54] rounded-full flex items-center justify-center">
                                    <Send className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-3 text-[10px] text-gray-400">
                            Las variables se personalizarán automáticamente para cada contacto
                        </div>
                    </div>
                )}

                {/* ═══════ PASO 4: RESULTADO ═══════ */}
                {step === 4 && results && (
                    <div className="max-w-md mx-auto">
                        <Card className="p-6 text-center">
                            <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center ${results.failed === 0 ? 'bg-green-100' : 'bg-amber-100'
                                }`}>
                                {results.failed === 0
                                    ? <CheckCircle className="w-7 h-7 text-green-500" />
                                    : <MessageSquare className="w-7 h-7 text-amber-500" />
                                }
                            </div>
                            <h2 className="text-lg font-bold text-gray-800 mb-1">
                                {results.failed === 0 ? '¡Mensajes enviados!' : 'Envío parcial'}
                            </h2>
                            <div className="flex justify-center gap-6 mt-3">
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{results.sent}</div>
                                    <div className="text-xs text-gray-400">Enviados</div>
                                </div>
                                {results.failed > 0 && (
                                    <div>
                                        <div className="text-2xl font-bold text-red-500">{results.failed}</div>
                                        <div className="text-xs text-gray-400">Fallidos</div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <div className="flex gap-2 mt-4">
                            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                                onClick={() => { setStep(1); setSelectedContacts([]); setResults(null) }}>
                                <RefreshCw className="w-3 h-3 mr-1" /> Nuevo envío
                            </Button>
                            <Button variant="outline" className="flex-1 text-xs"
                                onClick={() => router.push('/dashboard/crm')}>
                                Volver al CRM
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
