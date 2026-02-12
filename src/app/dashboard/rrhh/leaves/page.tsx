"use client"

import { useState, useEffect, useCallback } from 'react'
import { CalendarOff, Plus, CheckCircle2, XCircle, Clock, X } from 'lucide-react'

export default function LeavesPage() {
    const [leaves, setLeaves] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')
    const [showNewForm, setShowNewForm] = useState(false)
    const [form, setForm] = useState({ employee_id: '', leave_type: 'vacation', start_date: '', end_date: '', total_days: '', reason: '' })
    const [saving, setSaving] = useState(false)

    const fetchLeaves = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/hr?action=leaves${filter ? `&status=${filter}` : ''}`)
            const data = await res.json()
            if (data.success) setLeaves(data.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [filter])

    useEffect(() => { fetchLeaves() }, [fetchLeaves])
    useEffect(() => { if (new URLSearchParams(window.location.search).get('new') === 'true') setShowNewForm(true) }, [])

    const handleCreate = async () => {
        if (!form.employee_id || !form.start_date || !form.end_date) return
        setSaving(true)
        try {
            await fetch('/api/hr', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create_leave', ...form, employee_id: parseInt(form.employee_id), total_days: parseFloat(form.total_days) || 1 })
            })
            setShowNewForm(false); fetchLeaves()
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    const handleApprove = async (id: number, approved: boolean) => {
        try {
            await fetch('/api/hr', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: approved ? 'approve_leave' : 'reject_leave', id })
            })
            fetchLeaves()
        } catch (err) { console.error(err) }
    }

    const typeLabels: Record<string, string> = { vacation: '🏖️ Vacaciones', sick: '🤒 Enfermedad', personal: '👤 Personal', maternity: '🤱 Maternidad', paternity: '👶 Paternidad', bereavement: '🕊️ Duelo', training: '📚 Capacitación', unpaid: '💰 Sin goce', other: '📋 Otro' }
    const statusColors: Record<string, string> = { pending: 'bg-amber-50 text-amber-700', approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-700', cancelled: 'bg-gray-50 text-gray-500' }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div><h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><CalendarOff className="w-5 h-5 text-orange-600" />Solicitudes de Ausencia</h1></div>
                        <button onClick={() => setShowNewForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs font-medium rounded-lg shadow-sm">
                            <Plus className="w-3.5 h-3.5" />Nueva Solicitud</button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        {['pending', 'approved', 'rejected', ''].map(s => (
                            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filter === s ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                                {s === '' ? 'Todas' : s === 'pending' ? 'Pendientes' : s === 'approved' ? 'Aprobadas' : 'Rechazadas'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin" /></div>
                ) : leaves.length === 0 ? (
                    <div className="text-center py-20"><CalendarOff className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-500">Sin solicitudes</p></div>
                ) : (
                    <div className="grid gap-3">
                        {leaves.map((l: any) => (
                            <div key={l.id} className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-lg">{typeLabels[l.leave_type]?.[0] || '📋'}</div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-gray-900">{l.employee_name}</h3>
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[l.status] || ''}`}>{l.status}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                                                <span>{typeLabels[l.leave_type] || l.leave_type}</span>
                                                <span>📅 {l.start_date} → {l.end_date}</span>
                                                <span>⏱️ {l.total_days} días</span>
                                            </div>
                                            {l.reason && <p className="text-[11px] text-gray-400 mt-1 italic">{l.reason}</p>}
                                        </div>
                                    </div>
                                    {l.status === 'pending' && (
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => handleApprove(l.id, true)} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600" title="Aprobar"><CheckCircle2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleApprove(l.id, false)} className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600" title="Rechazar"><XCircle className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showNewForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-5 border-b"><h2 className="text-base font-bold">Nueva Solicitud de Ausencia</h2>
                            <button onClick={() => setShowNewForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="p-5 space-y-3">
                            <div><label className="text-[11px] font-medium text-gray-600 block mb-1">ID Empleado *</label>
                                <input type="number" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                            <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Tipo de Ausencia</label>
                                <select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                            <div className="grid grid-cols-3 gap-3">
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Desde *</label>
                                    <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Hasta *</label>
                                    <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Días</label>
                                    <input type="number" value={form.total_days} onChange={(e) => setForm({ ...form, total_days: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                            </div>
                            <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Motivo</label>
                                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
                        </div>
                        <div className="flex justify-end gap-2 p-5 border-t">
                            <button onClick={() => setShowNewForm(false)} className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleCreate} disabled={saving} className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 shadow-sm">{saving ? 'Guardando...' : 'Crear Solicitud'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
