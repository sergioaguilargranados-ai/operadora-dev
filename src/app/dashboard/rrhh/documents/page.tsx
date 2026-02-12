"use client"

import { useState, useEffect, useCallback } from 'react'
import { FolderOpen, Search, Upload, Eye, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react'

export default function HRDocumentsPage() {
    const [documents, setDocuments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const fetchDocs = useCallback(async () => {
        try {
            const res = await fetch('/api/hr?action=employees&limit=100')
            const data = await res.json()
            // For now, show employees and their document status
            if (data.success) setDocuments(data.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchDocs() }, [fetchDocs])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/20 to-gray-50">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FolderOpen className="w-5 h-5 text-rose-600" />Expediente Digital</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Documentos de empleados y agentes</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Buscar empleado..." value={search} onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin" /></div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-20">
                        <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No hay empleados registrados para gestionar documentos</p>
                        <p className="text-xs text-gray-400 mt-1">Primero registre empleados en la sección de Personal</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white/90 rounded-xl border border-gray-100 p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">📋 Documentos Requeridos por Empleado</h3>
                            <p className="text-xs text-gray-500 mb-4">Cada empleado debe tener sus documentos fiscales y de identificación actualizados.</p>

                            <div className="grid gap-3">
                                {documents.filter((d: any) => !search || `${d.first_name} ${d.last_name}`.toLowerCase().includes(search.toLowerCase())).map((emp: any) => (
                                    <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-rose-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold">
                                                {(emp.first_name?.[0] || '') + (emp.last_name?.[0] || '')}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{emp.first_name} {emp.last_name}</div>
                                                <div className="text-[10px] text-gray-400">{emp.employee_type === 'agent' ? '🏷️ Agente' : '👔 Interno'} · {emp.employee_number}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {emp.rfc ? <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">RFC ✓</span> : <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">RFC ✗</span>}
                                            {emp.curp ? <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">CURP ✓</span> : <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">CURP ✗</span>}
                                            {emp.nss ? <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">NSS ✓</span> : <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">NSS ✗</span>}
                                            <button className="p-1.5 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-colors" title="Ver expediente">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
