"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import {
    Search, Upload, Filter, FileText, Eye, CheckCircle,
    XCircle, AlertTriangle, Clock, ChevronDown,
    Calendar, Shield, Download, MoreVertical, Plus,
    User, Phone, Mail, MapPin, Loader2
} from 'lucide-react'

interface ClientDocument {
    id: string
    document_type: string
    file_name: string
    file_size: number
    file_type: string
    url: string
    description?: string
    document_number?: string
    issuing_country?: string
    expiry_date?: string
    status: string
    category: string
    verified: boolean
    verified_at?: string
    created_at: string
    agency_client_id?: number
    client_name?: string
    client_email?: string
    client_phone?: string
    expiry_status?: string
}

interface ClientDocStats {
    total: number
    pending: number
    approved: number
    rejected: number
    expired: number
    expiring_soon: number
}

const DOC_TYPE_LABELS: Record<string, string> = {
    passport: 'Pasaporte',
    visa: 'Visa',
    id: 'Identificación',
    ine: 'INE',
    curp: 'CURP',
    rfc: 'Constancia RFC',
    driver_license: 'Licencia de Conducir',
    comprobante_domicilio: 'Comprobante Domicilio',
    acta_nacimiento: 'Acta de Nacimiento',
    cedula_profesional: 'Cédula Profesional',
    carta_poder: 'Carta Poder',
    contrato: 'Contrato',
    factura: 'Factura',
    licencia_conducir: 'Licencia de Conducir',
    tarjeta_circulacion: 'Tarjeta de Circulación',
    poliza_seguro: 'Póliza de Seguro',
    certificado_medico: 'Certificado Médico',
    foto_personal: 'Foto Personal',
    comprobante_ingresos: 'Comprobante de Ingresos',
    other: 'Otro'
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
    approved: { label: 'Aprobado', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
    rejected: { label: 'Rechazado', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle },
    expired: { label: 'Vencido', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', icon: AlertTriangle },
}

const CATEGORY_LABELS: Record<string, string> = {
    identification: 'Identificación',
    legal: 'Legal',
    financial: 'Financiero',
    medical: 'Médico',
    travel: 'Viaje',
    other: 'Otro'
}

export default function ClientDocumentsPage() {
    const router = useRouter()
    const [documents, setDocuments] = useState<ClientDocument[]>([])
    const [stats, setStats] = useState<ClientDocStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterCategory, setFilterCategory] = useState('all')
    const [selectedDoc, setSelectedDoc] = useState<ClientDocument | null>(null)

    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({ action: 'list' })
            if (filterStatus !== 'all') params.set('status', filterStatus)
            if (filterCategory !== 'all') params.set('category', filterCategory)

            const res = await fetch(`/api/client-documents?${params}`)
            const data = await res.json()
            if (data.success) {
                setDocuments(data.data || [])
            }

            // Fetch stats
            const statsRes = await fetch('/api/client-documents?action=stats')
            const statsData = await statsRes.json()
            if (statsData.success) setStats(statsData.data)

        } catch (err) {
            console.error('Error fetching documents:', err)
        } finally {
            setLoading(false)
        }
    }, [filterStatus, filterCategory])

    useEffect(() => {
        fetchDocuments()
    }, [fetchDocuments])

    const handleVerify = async (docId: string, action: 'approve' | 'reject') => {
        try {
            const res = await fetch('/api/client-documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: action === 'approve' ? 'verify' : 'reject',
                    document_id: docId,
                    rejection_reason: action === 'reject' ? 'Documento no válido o ilegible' : undefined
                })
            })
            const data = await res.json()
            if (data.success) {
                fetchDocuments()
                setSelectedDoc(null)
            }
        } catch (err) {
            console.error('Error:', err)
        }
    }

    const filteredDocs = documents.filter(d => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            return (
                d.file_name?.toLowerCase().includes(term) ||
                d.client_name?.toLowerCase().includes(term) ||
                d.document_number?.toLowerCase().includes(term) ||
                d.document_type?.toLowerCase().includes(term)
            )
        }
        return true
    })

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / 1048576).toFixed(1)} MB`
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'short', day: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
            <PageHeader showBackButton={true} backButtonHref="/dashboard/crm">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Documentos de Clientes</h1>
                    <p className="text-xs text-gray-500">Gestión y verificación de expedientes</p>
                </div>
            </PageHeader>

            <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Total', value: stats?.total || 0, color: 'bg-blue-500', textColor: 'text-blue-700' },
                        { label: 'Pendientes', value: stats?.pending || 0, color: 'bg-amber-500', textColor: 'text-amber-700' },
                        { label: 'Aprobados', value: stats?.approved || 0, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
                        { label: 'Rechazados', value: stats?.rejected || 0, color: 'bg-red-500', textColor: 'text-red-700' },
                        { label: 'Vencidos', value: stats?.expired || 0, color: 'bg-gray-500', textColor: 'text-gray-700' },
                        { label: 'Por Vencer', value: stats?.expiring_soon || 0, color: 'bg-orange-500', textColor: 'text-orange-700' },
                    ].map(kpi => (
                        <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                            <div className={`text-2xl font-bold ${kpi.textColor}`}>{kpi.value}</div>
                            <div className="text-[11px] text-gray-500 mt-1">{kpi.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters Row */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, cliente, número de documento..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendientes</option>
                            <option value="approved">Aprobados</option>
                            <option value="rejected">Rechazados</option>
                            <option value="expired">Vencidos</option>
                        </select>
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Todas las categorías</option>
                            <option value="identification">Identificación</option>
                            <option value="legal">Legal</option>
                            <option value="financial">Financiero</option>
                            <option value="medical">Médico</option>
                            <option value="travel">Viaje</option>
                            <option value="other">Otro</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            Subir Documento
                        </button>
                    </div>
                </div>

                {/* Documents List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-700">Sin documentos</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Aún no hay documentos de clientes registrados'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Documento</th>
                                        <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Cliente</th>
                                        <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Tipo</th>
                                        <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Categoría</th>
                                        <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Vencimiento</th>
                                        <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Estado</th>
                                        <th className="text-center text-xs font-semibold text-gray-600 px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredDocs.map(doc => {
                                        const statusCfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending
                                        const StatusIcon = statusCfg.icon
                                        return (
                                            <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                            <FileText className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{doc.file_name}</p>
                                                            <p className="text-[11px] text-gray-400">
                                                                {formatFileSize(doc.file_size)} · {formatDate(doc.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {doc.client_name ? (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">{doc.client_name}</p>
                                                            {doc.client_email && (
                                                                <p className="text-[11px] text-gray-400">{doc.client_email}</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                                                        {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-gray-600">
                                                        {CATEGORY_LABELS[doc.category] || doc.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {doc.expiry_date ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className={`text-xs font-medium ${doc.expiry_status === 'expired' ? 'text-red-600' :
                                                                    doc.expiry_status === 'expiring_soon' ? 'text-amber-600' :
                                                                        'text-gray-600'
                                                                }`}>
                                                                {formatDate(doc.expiry_date)}
                                                            </span>
                                                            {doc.expiry_status === 'expired' && (
                                                                <span className="text-[10px] text-red-500 font-bold">VENCIDO</span>
                                                            )}
                                                            {doc.expiry_status === 'expiring_soon' && (
                                                                <span className="text-[10px] text-amber-500 font-bold">PRONTO</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusCfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {doc.url && (
                                                            <a
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                                                                title="Ver documento"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        {doc.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleVerify(doc.id, 'approve')}
                                                                    className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors"
                                                                    title="Aprobar"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleVerify(doc.id, 'reject')}
                                                                    className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                                                                    title="Rechazar"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
