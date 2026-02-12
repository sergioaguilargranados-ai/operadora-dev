"use client"

import { useState, useEffect, useCallback } from 'react'
import { Shield, Filter, Clock, User, FileText } from 'lucide-react'

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionFilter, setActionFilter] = useState('')

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ action: 'audit', limit: '100' })
            if (actionFilter) params.set('audit_action', actionFilter)
            const res = await fetch(`/api/hr?${params}`)
            const data = await res.json()
            if (data.success) setLogs(data.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [actionFilter])

    useEffect(() => { fetchLogs() }, [fetchLogs])

    const actionIcons: Record<string, string> = {
        created: '🟢', updated: '🔵', status_changed: '🟡', promoted: '⬆️',
        transferred: '🔄', terminated: '🔴', salary_changed: '💰', document_uploaded: '📎', leave_approved: '✅'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/30 to-gray-50">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Shield className="w-5 h-5 text-gray-600" />Log de Auditoría RRHH</h1>
                    <div className="flex items-center gap-2 mt-3">
                        {['', 'created', 'updated', 'status_changed', 'terminated', 'salary_changed'].map(a => (
                            <button key={a} onClick={() => setActionFilter(a)}
                                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${actionFilter === a ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>
                                {a === '' ? 'Todos' : a.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin" /></div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20"><Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-500">Sin registros de auditoría</p></div>
                ) : (
                    <div className="space-y-1">
                        {logs.map((log: any) => (
                            <div key={log.id} className="bg-white/90 rounded-lg border border-gray-100 px-4 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                                <span className="text-base">{actionIcons[log.action] || '📋'}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-gray-900">{log.description || `${log.action} en ${log.entity_type}`}</div>
                                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400">
                                        {log.employee_name && <span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5" />{log.employee_name}</span>}
                                        {log.performed_by_name && <span>por: {log.performed_by_name}</span>}
                                        <span className="flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" />{log.entity_type} #{log.entity_id}</span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {new Date(log.created_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
