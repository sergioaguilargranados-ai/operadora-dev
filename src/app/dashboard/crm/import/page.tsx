"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { useToast } from '@/hooks/use-toast'
import {
    Upload, FileSpreadsheet, Loader2, CheckCircle, XCircle,
    AlertTriangle, ArrowRight, Download, Users, RefreshCw,
    Trash2, Eye, ChevronDown
} from 'lucide-react'

// ═════════════════════════
// TYPES
// ═════════════════════════

interface ParsedData {
    headers: string[]
    rows: Record<string, string>[]
    totalLines: number
}

interface ColumnMapping {
    full_name: string
    email: string
    phone: string
    whatsapp: string
    contact_type: string
    source: string
    pipeline_stage: string
    interested_destination: string
    num_travelers: string
    budget_min: string
    budget_max: string
    travel_type: string
    notes: string
    tags: string
}

interface ImportResult {
    total_rows: number
    imported: number
    skipped: number
    errors: { row: number; error: string }[]
}

// ═════════════════════════
// CRM FIELDS
// ═════════════════════════

const CRM_FIELDS: { key: keyof ColumnMapping; label: string; required: boolean }[] = [
    { key: 'full_name', label: 'Nombre completo *', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Teléfono', required: false },
    { key: 'whatsapp', label: 'WhatsApp', required: false },
    { key: 'contact_type', label: 'Tipo contacto', required: false },
    { key: 'source', label: 'Fuente', required: false },
    { key: 'pipeline_stage', label: 'Etapa pipeline', required: false },
    { key: 'interested_destination', label: 'Destino interesado', required: false },
    { key: 'num_travelers', label: 'Num. viajeros', required: false },
    { key: 'budget_min', label: 'Presupuesto mín.', required: false },
    { key: 'budget_max', label: 'Presupuesto máx.', required: false },
    { key: 'travel_type', label: 'Tipo de viaje', required: false },
    { key: 'notes', label: 'Notas', required: false },
    { key: 'tags', label: 'Tags', required: false },
]

// ═════════════════════════
// MAIN PAGE
// ═════════════════════════

export default function ImportPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'result'>('upload')
    const [loading, setLoading] = useState(false)
    const [fileName, setFileName] = useState('')
    const [parsedData, setParsedData] = useState<ParsedData | null>(null)
    const [mapping, setMapping] = useState<ColumnMapping>({
        full_name: '', email: '', phone: '', whatsapp: '',
        contact_type: '', source: '', pipeline_stage: '',
        interested_destination: '', num_travelers: '',
        budget_min: '', budget_max: '', travel_type: '',
        notes: '', tags: '',
    })
    const [options, setOptions] = useState({
        skip_duplicates: true,
        default_source: 'csv_import',
        default_stage: 'new',
        default_contact_type: 'lead',
    })
    const [result, setResult] = useState<ImportResult | null>(null)

    // ── Parsear CSV ──
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)
        setLoading(true)

        const reader = new FileReader()
        reader.onload = (evt) => {
            try {
                const text = evt.target?.result as string
                const lines = text.split(/\r?\n/).filter(l => l.trim())

                if (lines.length < 2) {
                    toast({ title: 'El archivo debe tener al menos 2 líneas (encabezados + datos)', variant: 'destructive' })
                    setLoading(false)
                    return
                }

                const headers = parseCSVLine(lines[0])
                const rows: Record<string, string>[] = []

                for (let i = 1; i < lines.length; i++) {
                    const values = parseCSVLine(lines[i])
                    if (values.length === 0 || values.every(v => !v.trim())) continue

                    const row: Record<string, string> = {}
                    headers.forEach((h, j) => {
                        row[h] = values[j] || ''
                    })
                    rows.push(row)
                }

                setParsedData({ headers, rows, totalLines: rows.length })

                // Auto-mapear columnas por similitud
                const autoMapping = { ...mapping }
                const headerLower = headers.map(h => h.toLowerCase().trim())

                const autoMatches: [keyof ColumnMapping, string[]][] = [
                    ['full_name', ['nombre', 'name', 'full_name', 'nombre completo', 'contacto']],
                    ['email', ['email', 'correo', 'e-mail', 'mail']],
                    ['phone', ['telefono', 'teléfono', 'phone', 'tel', 'celular']],
                    ['whatsapp', ['whatsapp', 'wsp', 'wa']],
                    ['source', ['fuente', 'source', 'origen']],
                    ['interested_destination', ['destino', 'destination', 'lugar']],
                    ['num_travelers', ['viajeros', 'travelers', 'pax', 'personas']],
                    ['budget_min', ['presupuesto min', 'budget min', 'budget_min']],
                    ['budget_max', ['presupuesto max', 'budget max', 'budget_max', 'presupuesto']],
                    ['travel_type', ['tipo viaje', 'travel type', 'tipo_viaje']],
                    ['notes', ['notas', 'notes', 'comentarios', 'observaciones']],
                    ['tags', ['tags', 'etiquetas']],
                ]

                for (const [field, matches] of autoMatches) {
                    const idx = headerLower.findIndex(h => matches.some(m => h.includes(m)))
                    if (idx >= 0) {
                        autoMapping[field] = headers[idx]
                    }
                }

                setMapping(autoMapping)
                setStep('mapping')
                toast({ title: `✅ ${rows.length} filas encontradas en "${file.name}"` })
            } catch {
                toast({ title: 'Error al parsear el archivo CSV', variant: 'destructive' })
            } finally {
                setLoading(false)
            }
        }

        reader.readAsText(file, 'UTF-8')
    }

    // ── Importar ──
    const handleImport = async () => {
        if (!parsedData || !mapping.full_name) {
            toast({ title: 'Selecciona al menos la columna de nombre', variant: 'destructive' })
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/crm/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows: parsedData.rows, mapping, options }),
            })
            const data = await res.json()
            if (data.success) {
                setResult(data.data)
                setStep('result')
                toast({ title: `✅ ${data.data.imported} contactos importados` })
            } else {
                toast({ title: data.error || 'Error en importación', variant: 'destructive' })
            }
        } catch {
            toast({ title: 'Error de conexión', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const resetAll = () => {
        setStep('upload')
        setParsedData(null)
        setResult(null)
        setFileName('')
        setMapping({
            full_name: '', email: '', phone: '', whatsapp: '',
            contact_type: '', source: '', pipeline_stage: '',
            interested_destination: '', num_travelers: '',
            budget_min: '', budget_max: '', travel_type: '',
            notes: '', tags: '',
        })
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <Upload className="w-5 h-5 text-green-600" />
                            Importar Contactos
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Importa contactos desde archivos CSV/Excel
                        </p>
                    </div>
                    {step !== 'upload' && (
                        <Button variant="ghost" size="sm" onClick={resetAll}>
                            <RefreshCw className="w-4 h-4 mr-1" /> Reiniciar
                        </Button>
                    )}
                </div>
            </PageHeader>

            <main className="container mx-auto px-4 py-5 max-w-4xl">
                {/* Stepper */}
                <div className="flex items-center justify-center gap-0 mb-6">
                    {[
                        { key: 'upload', label: 'Subir archivo', num: 1 },
                        { key: 'mapping', label: 'Mapear columnas', num: 2 },
                        { key: 'preview', label: 'Vista previa', num: 3 },
                        { key: 'result', label: 'Resultado', num: 4 },
                    ].map((s, i) => {
                        const steps = ['upload', 'mapping', 'preview', 'result']
                        const currentIdx = steps.indexOf(step)
                        const isActive = step === s.key
                        const isDone = currentIdx > i

                        return (
                            <div key={s.key} className="flex items-center">
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isActive ? 'bg-blue-600 text-white' :
                                        isDone ? 'bg-green-100 text-green-700' :
                                            'bg-slate-100 text-slate-400'
                                    }`}>
                                    {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px]">{s.num}</span>}
                                    <span className="hidden sm:inline">{s.label}</span>
                                </div>
                                {i < 3 && <ChevronDown className="w-4 h-4 text-slate-300 rotate-[-90deg] mx-1" />}
                            </div>
                        )
                    })}
                </div>

                {/* ═══════════ STEP 1: UPLOAD ═══════════ */}
                {step === 'upload' && (
                    <Card className="p-8 border-0 bg-white shadow-sm">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                                <FileSpreadsheet className="w-9 h-9 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Sube tu archivo CSV</h2>
                            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                                El archivo debe tener una fila de encabezados en la primera línea.
                                Formatos aceptados: .csv, .txt (separado por comas).
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.txt"
                                className="hidden"
                                onChange={handleFileUpload}
                            />

                            <Button
                                size="lg"
                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                                ) : (
                                    <><Upload className="w-4 h-4 mr-2" /> Seleccionar archivo</>
                                )}
                            </Button>

                            <div className="mt-8 p-4 bg-slate-50 rounded-xl text-left">
                                <h4 className="text-xs font-semibold text-slate-600 mb-2">💡 Formato recomendado</h4>
                                <div className="overflow-x-auto">
                                    <table className="text-[10px] text-slate-500 w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left pr-3 py-1">Nombre</th>
                                                <th className="text-left pr-3 py-1">Email</th>
                                                <th className="text-left pr-3 py-1">Teléfono</th>
                                                <th className="text-left pr-3 py-1">Destino</th>
                                                <th className="text-left pr-3 py-1">Viajeros</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="pr-3 py-1">María García</td>
                                                <td className="pr-3 py-1">maria@email.com</td>
                                                <td className="pr-3 py-1">+52 55 1234 5678</td>
                                                <td className="pr-3 py-1">Cancún</td>
                                                <td className="pr-3 py-1">4</td>
                                            </tr>
                                            <tr>
                                                <td className="pr-3 py-1">Juan López</td>
                                                <td className="pr-3 py-1">juan@email.com</td>
                                                <td className="pr-3 py-1">+52 33 9876 5432</td>
                                                <td className="pr-3 py-1">Los Cabos</td>
                                                <td className="pr-3 py-1">2</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Descargar plantilla */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 rounded-lg text-xs"
                                onClick={() => {
                                    const bom = '\uFEFF'
                                    const csv = bom + 'Nombre Completo,Email,Teléfono,WhatsApp,Destino Interesado,Fecha Viaje,Num Viajeros,Presupuesto,Tipo Viaje,Notas\nMaría García,maria@email.com,+525512345678,+525512345678,Cancún,2026-03-15,4,50000,family,Interesada en all-inclusive'
                                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
                                    const url = URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url; a.download = 'plantilla-contactos-crm.csv'
                                    a.click(); URL.revokeObjectURL(url)
                                }}
                            >
                                <Download className="w-3 h-3 mr-1" /> Descargar plantilla
                            </Button>
                        </div>
                    </Card>
                )}

                {/* ═══════════ STEP 2: MAPPING ═══════════ */}
                {step === 'mapping' && parsedData && (
                    <div className="space-y-4">
                        <Card className="p-5 border-0 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 text-green-500" />
                                    Archivo: {fileName} — {parsedData.totalLines} filas, {parsedData.headers.length} columnas
                                </h3>
                            </div>

                            <p className="text-xs text-slate-500 mb-4">
                                Asigna cada campo del CRM a la columna correspondiente de tu archivo. Solo &quot;Nombre completo&quot; es obligatorio.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {CRM_FIELDS.map(field => (
                                    <div key={field.key} className="flex items-center gap-2">
                                        <label className={`text-xs w-36 flex-shrink-0 ${field.required ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                            {field.label}
                                        </label>
                                        <select
                                            className="flex-1 h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                                            value={mapping[field.key]}
                                            onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        >
                                            <option value="">— No mapear —</option>
                                            {parsedData.headers.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Opciones */}
                        <Card className="p-5 border-0 bg-white shadow-sm">
                            <h3 className="text-sm font-semibold mb-3">⚙️ Opciones de importación</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex items-center gap-2 text-xs text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={options.skip_duplicates}
                                        onChange={e => setOptions(prev => ({ ...prev, skip_duplicates: e.target.checked }))}
                                        className="rounded"
                                    />
                                    Omitir duplicados (por email/teléfono)
                                </label>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-slate-600 w-24">Fuente default:</label>
                                    <select
                                        className="h-7 px-2 border rounded-lg text-xs flex-1"
                                        value={options.default_source}
                                        onChange={e => setOptions(prev => ({ ...prev, default_source: e.target.value }))}
                                    >
                                        <option value="csv_import">Importación CSV</option>
                                        <option value="web">Web</option>
                                        <option value="referral">Referido</option>
                                        <option value="social">Redes sociales</option>
                                        <option value="event">Evento</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-slate-600 w-24">Etapa default:</label>
                                    <select
                                        className="h-7 px-2 border rounded-lg text-xs flex-1"
                                        value={options.default_stage}
                                        onChange={e => setOptions(prev => ({ ...prev, default_stage: e.target.value }))}
                                    >
                                        <option value="new">Nuevo</option>
                                        <option value="qualified">Calificado</option>
                                        <option value="interested">Interesado</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-slate-600 w-24">Tipo default:</label>
                                    <select
                                        className="h-7 px-2 border rounded-lg text-xs flex-1"
                                        value={options.default_contact_type}
                                        onChange={e => setOptions(prev => ({ ...prev, default_contact_type: e.target.value }))}
                                    >
                                        <option value="lead">Lead</option>
                                        <option value="prospect">Prospecto</option>
                                        <option value="client">Cliente</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        <div className="flex items-center justify-between">
                            <Button variant="outline" onClick={() => setStep('upload')}>
                                Volver
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                    if (!mapping.full_name) {
                                        toast({ title: 'Selecciona la columna de Nombre completo', variant: 'destructive' })
                                        return
                                    }
                                    setStep('preview')
                                }}
                            >
                                Vista previa <Eye className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* ═══════════ STEP 3: PREVIEW ═══════════ */}
                {step === 'preview' && parsedData && (
                    <div className="space-y-4">
                        <Card className="p-5 border-0 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-blue-500" />
                                    Vista previa — primeras {Math.min(10, parsedData.rows.length)} de {parsedData.totalLines} filas
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b bg-slate-50/50">
                                            <th className="text-left px-2 py-2 font-medium text-slate-500">#</th>
                                            {CRM_FIELDS.filter(f => mapping[f.key]).map(f => (
                                                <th key={f.key} className="text-left px-2 py-2 font-medium text-slate-500">{f.label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.rows.slice(0, 10).map((row, i) => (
                                            <tr key={i} className="border-b last:border-0 hover:bg-blue-50/30">
                                                <td className="px-2 py-1.5 text-slate-400">{i + 1}</td>
                                                {CRM_FIELDS.filter(f => mapping[f.key]).map(f => (
                                                    <td key={f.key} className="px-2 py-1.5 text-slate-700 max-w-[150px] truncate">
                                                        {row[mapping[f.key]] || <span className="text-slate-300">—</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Resumen de mapeo */}
                        <Card className="p-4 border-0 bg-blue-50/50 shadow-sm">
                            <h4 className="text-xs font-semibold text-blue-700 mb-2">Resumen de importación</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div><span className="text-slate-500">Filas:</span> <strong>{parsedData.totalLines}</strong></div>
                                <div><span className="text-slate-500">Columnas mapeadas:</span> <strong>{CRM_FIELDS.filter(f => mapping[f.key]).length}</strong></div>
                                <div><span className="text-slate-500">Skip duplicados:</span> <strong>{options.skip_duplicates ? 'Sí' : 'No'}</strong></div>
                                <div><span className="text-slate-500">Fuente:</span> <strong>{options.default_source}</strong></div>
                            </div>
                        </Card>

                        <div className="flex items-center justify-between">
                            <Button variant="outline" onClick={() => setStep('mapping')}>
                                Volver al mapeo
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleImport}
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importando...</>
                                ) : (
                                    <><Users className="w-4 h-4 mr-2" /> Importar {parsedData.totalLines} contactos</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ═══════════ STEP 4: RESULT ═══════════ */}
                {step === 'result' && result && (
                    <div className="space-y-4">
                        <Card className="p-8 border-0 bg-white shadow-sm text-center">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${result.imported > 0 ? 'bg-green-50' : 'bg-amber-50'
                                }`}>
                                {result.imported > 0 ? (
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                ) : (
                                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {result.imported > 0 ? '¡Importación completada!' : 'Importación con advertencias'}
                            </h2>
                        </Card>

                        <div className="grid grid-cols-3 gap-3">
                            <Card className="p-4 text-center border-0 shadow-sm bg-green-50">
                                <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-600" />
                                <div className="text-2xl font-bold text-green-700">{result.imported}</div>
                                <div className="text-[10px] text-green-600 uppercase font-medium">Importados</div>
                            </Card>
                            <Card className="p-4 text-center border-0 shadow-sm bg-amber-50">
                                <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-amber-600" />
                                <div className="text-2xl font-bold text-amber-700">{result.skipped}</div>
                                <div className="text-[10px] text-amber-600 uppercase font-medium">Omitidos</div>
                            </Card>
                            <Card className="p-4 text-center border-0 shadow-sm bg-red-50">
                                <XCircle className="w-6 h-6 mx-auto mb-1 text-red-600" />
                                <div className="text-2xl font-bold text-red-700">{result.errors.length}</div>
                                <div className="text-[10px] text-red-600 uppercase font-medium">Errores</div>
                            </Card>
                        </div>

                        {result.errors.length > 0 && (
                            <Card className="p-4 border-0 bg-white shadow-sm">
                                <h4 className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                                    <XCircle className="w-3.5 h-3.5" /> Errores encontrados
                                </h4>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {result.errors.map((err, i) => (
                                        <div key={i} className="text-[10px] text-red-500 flex gap-2">
                                            <span className="text-red-400 flex-shrink-0">Fila {err.row}:</span>
                                            <span>{err.error}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        <div className="flex items-center justify-between">
                            <Button variant="outline" onClick={resetAll}>
                                <RefreshCw className="w-4 h-4 mr-1" /> Importar otro archivo
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => router.push('/dashboard/crm')}
                            >
                                Ir al CRM <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

/**
 * Parsear una línea CSV respetando comillas
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += ch
        }
    }
    result.push(current.trim())
    return result
}
