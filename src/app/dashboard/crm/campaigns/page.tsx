"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import {
    Mail, Send, Eye, Users, Loader2, ChevronRight,
    CheckCircle, XCircle, RefreshCw, Zap, ArrowLeft,
    FileText, Download, Flame, Clock
} from 'lucide-react'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface EmailTemplate {
    id: string
    name: string
    subject: string
    category: string
    variables: string[]
}

interface Contact {
    id: number
    full_name: string
    email: string
    interested_destination?: string
    pipeline_stage: string
    lead_score: number
}

interface CampaignResult {
    template_id: string
    total_contacts: number
    sent: number
    failed: number
    errors: { contact_id: number; error: string }[]
}

const CATEGORY_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    welcome: { label: 'Bienvenida', color: 'bg-blue-100 text-blue-700', icon: '👋' },
    followup: { label: 'Seguimiento', color: 'bg-green-100 text-green-700', icon: '📋' },
    offer: { label: 'Oferta', color: 'bg-red-100 text-red-700', icon: '🔥' },
    reengagement: { label: 'Re-engagement', color: 'bg-purple-100 text-purple-700', icon: '💜' },
    post_trip: { label: 'Post-viaje', color: 'bg-amber-100 text-amber-700', icon: '⭐' },
    nurturing: { label: 'Nurturing', color: 'bg-cyan-100 text-cyan-700', icon: '🌴' },
}

// ═══════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════

export default function CampaignsPage() {
    const router = useRouter()
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
    const [previewHtml, setPreviewHtml] = useState('')
    const [contacts, setContacts] = useState<Contact[]>([])
    const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set())
    const [step, setStep] = useState<'templates' | 'contacts' | 'preview' | 'result'>('templates')
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [result, setResult] = useState<CampaignResult | null>(null)
    const [candidateType, setCandidateType] = useState<'all' | 'reengagement' | 'posttrip'>('all')

    // Cargar templates
    useEffect(() => {
        fetch('/api/crm/campaigns?action=templates')
            .then(r => r.json())
            .then(j => j.success && setTemplates(j.data))
            .catch(console.error)
    }, [])

    // Cargar contactos
    const loadContacts = useCallback(async (type: string) => {
        setLoading(true)
        try {
            let url = ''
            if (type === 'reengagement') {
                url = '/api/crm/campaigns?action=reengagement_candidates&limit=100'
            } else if (type === 'posttrip') {
                url = '/api/crm/campaigns?action=posttrip_candidates&limit=100'
            } else {
                url = '/api/crm/contacts?limit=100&has_email=true'
            }
            const res = await fetch(url)
            const json = await res.json()
            if (json.success) {
                const list = json.data?.contacts || json.data || []
                setContacts(list.filter((c: Contact) => c.email))
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [])

    // Cargar preview
    const loadPreview = useCallback(async () => {
        if (!selectedTemplate) return
        try {
            const res = await fetch(`/api/crm/campaigns?action=preview&template_id=${selectedTemplate.id}`)
            const json = await res.json()
            if (json.success) setPreviewHtml(json.data.html)
        } catch (err) { console.error(err) }
    }, [selectedTemplate])

    // Seleccionar template
    const selectTemplate = (t: EmailTemplate) => {
        setSelectedTemplate(t)
        setStep('contacts')
        loadContacts(candidateType)
    }

    // Toggle contacto
    const toggleContact = (id: number) => {
        setSelectedContacts(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    // Seleccionar/deseleccionar todos
    const toggleAll = () => {
        if (selectedContacts.size === contacts.length) {
            setSelectedContacts(new Set())
        } else {
            setSelectedContacts(new Set(contacts.map(c => c.id)))
        }
    }

    // Ir a preview
    const goToPreview = () => {
        loadPreview()
        setStep('preview')
    }

    // Enviar campaña
    const sendCampaign = async () => {
        if (!selectedTemplate || selectedContacts.size === 0) return
        setSending(true)
        try {
            const res = await fetch('/api/crm/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_id: selectedTemplate.id,
                    contact_ids: Array.from(selectedContacts),
                }),
            })
            const json = await res.json()
            if (json.success) {
                setResult(json.data)
                setStep('result')
            }
        } catch (err) { console.error(err) }
        finally { setSending(false) }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Campañas de Email
                        </h1>
                        <p className="text-xs text-gray-500">Envía campañas masivas con templates profesionales</p>
                    </div>
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-5xl">

                {/* Steps indicator */}
                <div className="flex items-center gap-2 mb-5">
                    {['templates', 'contacts', 'preview', 'result'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-blue-600 text-white' :
                                    ['templates', 'contacts', 'preview', 'result'].indexOf(step) > i
                                        ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {['templates', 'contacts', 'preview', 'result'].indexOf(step) > i ? '✓' : i + 1}
                            </div>
                            <span className={`text-xs ${step === s ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                                {['Template', 'Contactos', 'Preview', 'Resultado'][i]}
                            </span>
                            {i < 3 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                        </div>
                    ))}
                </div>

                {/* ═══════════ STEP 1: TEMPLATES ═══════════ */}
                {step === 'templates' && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-gray-700 mb-2">Selecciona un template</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {templates.map(t => {
                                const cat = CATEGORY_LABELS[t.category] || { label: t.category, color: 'bg-gray-100 text-gray-700', icon: '📧' }
                                return (
                                    <Card
                                        key={t.id}
                                        className="p-4 hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all group"
                                        onClick={() => selectTemplate(t)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cat.color}`}>
                                                {cat.icon} {cat.label}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                        <h3 className="font-semibold text-sm text-gray-800">{t.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{t.subject}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {t.variables.map(v => (
                                                <span key={v} className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-500">
                                                    {`{{${v}}}`}
                                                </span>
                                            ))}
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ═══════════ STEP 2: CONTACTS ═══════════ */}
                {step === 'contacts' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setStep('templates')}>
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                                <h2 className="text-sm font-semibold text-gray-700">
                                    Seleccionar contactos — {selectedTemplate?.name}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    className="h-7 px-2 text-xs rounded-lg border"
                                    value={candidateType}
                                    onChange={e => {
                                        setCandidateType(e.target.value as 'all' | 'reengagement' | 'posttrip')
                                        loadContacts(e.target.value)
                                    }}
                                >
                                    <option value="all">Todos con email</option>
                                    <option value="reengagement">Sin contacto 14d+</option>
                                    <option value="posttrip">Post-viaje</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded"
                                            checked={selectedContacts.size === contacts.length && contacts.length > 0}
                                            onChange={toggleAll}
                                        />
                                        <span className="text-xs text-gray-600">
                                            Seleccionar todos ({contacts.length})
                                        </span>
                                    </label>
                                    <span className="text-xs font-semibold text-blue-600">
                                        {selectedContacts.size} seleccionados
                                    </span>
                                </div>

                                <div className="max-h-[400px] overflow-y-auto space-y-1">
                                    {contacts.map(c => (
                                        <div
                                            key={c.id}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedContacts.has(c.id) ? 'bg-blue-50 border border-blue-200' : 'bg-white border hover:bg-gray-50'
                                                }`}
                                            onClick={() => toggleContact(c.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                className="rounded"
                                                checked={selectedContacts.has(c.id)}
                                                readOnly
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium text-gray-800 truncate">
                                                    {c.full_name}
                                                </div>
                                                <div className="text-[10px] text-gray-500 truncate">
                                                    {c.email} • {c.pipeline_stage} • Score: {c.lead_score}
                                                </div>
                                            </div>
                                            {c.interested_destination && (
                                                <span className="text-[10px] text-gray-400 flex-shrink-0">
                                                    🌎 {c.interested_destination}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {contacts.length === 0 && (
                                    <div className="text-center py-10 text-gray-400 text-sm">
                                        No se encontraron contactos con email
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-3">
                                    <Button variant="outline" onClick={() => setStep('templates')}>Atrás</Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                        disabled={selectedContacts.size === 0}
                                        onClick={goToPreview}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Preview ({selectedContacts.size})
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ═══════════ STEP 3: PREVIEW ═══════════ */}
                {step === 'preview' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setStep('contacts')}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <h2 className="text-sm font-semibold text-gray-700">
                                Preview — {selectedTemplate?.name}
                            </h2>
                        </div>

                        <Card className="p-1 border-2 border-dashed border-gray-200">
                            <div className="bg-gray-100 px-3 py-1.5 rounded-t-lg flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                </div>
                                <span className="text-[10px] text-gray-400">Preview del email</span>
                            </div>
                            <div
                                className="bg-white p-4"
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        </Card>

                        <Card className="p-4 bg-amber-50 border-amber-200">
                            <div className="flex items-center gap-2 text-amber-700 text-xs">
                                <Mail className="w-4 h-4" />
                                <span>
                                    Se enviará a <strong>{selectedContacts.size}</strong> contactos.
                                    Las variables como {`{{nombre}}`}, {`{{destino}}`} se personalizarán automáticamente.
                                </span>
                            </div>
                        </Card>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setStep('contacts')}>Atrás</Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                disabled={sending}
                                onClick={sendCampaign}
                            >
                                {sending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                ) : (
                                    <Send className="w-4 h-4 mr-1" />
                                )}
                                Enviar campaña
                            </Button>
                        </div>
                    </div>
                )}

                {/* ═══════════ STEP 4: RESULT ═══════════ */}
                {step === 'result' && result && (
                    <div className="space-y-4">
                        <Card className="p-6 text-center">
                            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${result.failed === 0 ? 'bg-green-100' : 'bg-amber-100'
                                }`}>
                                {result.failed === 0 ? (
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                ) : (
                                    <Mail className="w-8 h-8 text-amber-500" />
                                )}
                            </div>
                            <h2 className="text-lg font-bold mt-3">
                                Campaña {result.failed === 0 ? 'enviada exitosamente' : 'completada'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Template: {selectedTemplate?.name}
                            </p>
                        </Card>

                        <div className="grid grid-cols-3 gap-3">
                            <Card className="p-4 text-center bg-blue-50 border-blue-200">
                                <div className="text-2xl font-bold text-blue-600">{result.total_contacts}</div>
                                <div className="text-xs text-blue-500">Total</div>
                            </Card>
                            <Card className="p-4 text-center bg-green-50 border-green-200">
                                <div className="text-2xl font-bold text-green-600">{result.sent}</div>
                                <div className="text-xs text-green-500">Enviados</div>
                            </Card>
                            <Card className="p-4 text-center bg-red-50 border-red-200">
                                <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                                <div className="text-xs text-red-500">Fallidos</div>
                            </Card>
                        </div>

                        {result.errors.length > 0 && (
                            <Card className="p-4">
                                <h3 className="text-sm font-semibold text-red-600 mb-2">Errores:</h3>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {result.errors.map((e, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-red-500">
                                            <XCircle className="w-3 h-3 flex-shrink-0" />
                                            <span>Contacto #{e.contact_id}: {e.error}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        <div className="flex justify-center gap-2 pt-2">
                            <Button variant="outline" onClick={() => {
                                setStep('templates')
                                setSelectedTemplate(null)
                                setSelectedContacts(new Set())
                                setResult(null)
                            }}>
                                <RefreshCw className="w-4 h-4 mr-1" /> Nueva campaña
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/dashboard/crm')}>
                                Volver al CRM
                            </Button>
                        </div>
                    </div>
                )}

                {/* ═══════════ REPORTES PDF ═══════════ */}
                {step === 'templates' && (
                    <Card className="p-4 mt-6 border-dashed border-2 border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            Reportes PDF
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                className="justify-start text-xs h-9"
                                onClick={() => window.open('/api/crm/reports?type=pipeline&period=month', '_blank')}
                            >
                                <Download className="w-3.5 h-3.5 mr-2 text-green-500" />
                                Pipeline (mes actual)
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start text-xs h-9"
                                onClick={() => window.open('/api/crm/reports?type=agent_performance', '_blank')}
                            >
                                <Download className="w-3.5 h-3.5 mr-2 text-amber-500" />
                                Rendimiento agentes
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start text-xs h-9"
                                onClick={() => window.open('/api/crm/reports?type=pipeline&period=quarter', '_blank')}
                            >
                                <Download className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                Pipeline (trimestre)
                            </Button>
                        </div>
                    </Card>
                )}
            </main>
        </div>
    )
}
