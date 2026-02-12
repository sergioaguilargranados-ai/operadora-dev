"use client"

import { useState, useEffect, useCallback } from 'react'
import { FileText, Search, Plus, Eye, Calendar, DollarSign, AlertTriangle, X, CheckCircle2 } from 'lucide-react'

export default function ContractsPage() {
    const [contracts, setContracts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showNewForm, setShowNewForm] = useState(false)
    const [form, setForm] = useState({
        employee_id: '', contract_type: 'indefinite', start_date: new Date().toISOString().split('T')[0],
        end_date: '', salary: '', commission_percentage: '', vacation_days: '12', notes: ''
    })
    const [saving, setSaving] = useState(false)

    const fetchContracts = useCallback(async () => {
        try {
            const res = await fetch('/api/hr?action=contracts')
            const data = await res.json()
            if (data.success) setContracts(data.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchContracts() }, [fetchContracts])
    useEffect(() => { if (new URLSearchParams(window.location.search).get('new') === 'true') setShowNewForm(true) }, [])

    const handleCreate = async () => {
        if (!form.employee_id || !form.contract_type || !form.start_date) return
        setSaving(true)
        try {
            await fetch('/api/hr', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_contract', ...form,
                    employee_id: parseInt(form.employee_id), salary: form.salary ? parseFloat(form.salary) : null,
                    commission_percentage: form.commission_percentage ? parseFloat(form.commission_percentage) : null,
                    vacation_days: parseInt(form.vacation_days), end_date: form.end_date || null
                })
            })
            setShowNewForm(false); fetchContracts()
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    const typeLabels: Record<string, string> = {
        indefinite: 'Indefinido', fixed_term: 'Plazo Fijo', probation: 'Prueba',
        commission: 'Comisión', freelance: 'Honorarios', internship: 'Prácticas'
    }
    const typeColors: Record<string, string> = {
        indefinite: 'bg-emerald-50 text-emerald-700', fixed_term: 'bg-blue-50 text-blue-700',
        probation: 'bg-amber-50 text-amber-700', commission: 'bg-purple-50 text-purple-700',
        freelance: 'bg-cyan-50 text-cyan-700', internship: 'bg-pink-50 text-pink-700'
    }
    const statusColors: Record<string, string> = {
        active: 'bg-emerald-50 text-emerald-700', draft: 'bg-gray-50 text-gray-600',
        expired: 'bg-red-50 text-red-700', terminated: 'bg-red-50 text-red-700',
        renewed: 'bg-blue-50 text-blue-700', cancelled: 'bg-gray-50 text-gray-500'
    }

    const formatCurrency = (n: number | null) => n ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n) : '—'

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/20 to-gray-50">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div><h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" />Contratos</h1>
                        <p className="text-xs text-gray-500 mt-0.5">{contracts.length} contratos</p></div>
                    <button onClick={() => setShowNewForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm">
                        <Plus className="w-3.5 h-3.5" />Nuevo Contrato</button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
                ) : contracts.length === 0 ? (
                    <div className="text-center py-20"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-500">No hay contratos registrados</p></div>
                ) : (
                    <div className="grid gap-3">
                        {contracts.map((c: any) => (
                            <div key={c.id} className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-gray-900">{c.employee_name || `Empleado #${c.employee_id}`}</h3>
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColors[c.contract_type] || 'bg-gray-50 text-gray-500'}`}>{typeLabels[c.contract_type] || c.contract_type}</span>
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[c.status] || 'bg-gray-50'}`}>{c.status}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{c.start_date} → {c.end_date || '∞'}</span>
                                                {c.salary && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatCurrency(c.salary)}/{c.salary_period}</span>}
                                                {c.commission_percentage && <span className="text-purple-600">📊 {c.commission_percentage}% comisión</span>}
                                                <span>🏖️ {c.vacation_days} días vacaciones</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {c.end_date && new Date(c.end_date) < new Date(Date.now() + 30 * 86400000) && c.status === 'active' && (
                                            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Por vencer</span>
                                        )}
                                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100"><Eye className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showNewForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b"><h2 className="text-base font-bold text-gray-900">Nuevo Contrato</h2>
                            <button onClick={() => setShowNewForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="p-5 space-y-3">
                            <div><label className="text-[11px] font-medium text-gray-600 block mb-1">ID Empleado *</label>
                                <input type="number" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Tipo *</label>
                                    <select value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                                        <option value="indefinite">Indefinido</option><option value="fixed_term">Plazo Fijo</option><option value="probation">Prueba</option>
                                        <option value="commission">Comisión</option><option value="freelance">Honorarios</option><option value="internship">Prácticas</option></select></div>
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Inicio *</label>
                                    <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Fin (vacío = indefinido)</label>
                                    <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Salario (MXN)</label>
                                    <input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">% Comisión</label>
                                    <input type="number" value={form.commission_percentage} onChange={(e) => setForm({ ...form, commission_percentage: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Días de Vacaciones</label>
                                    <input type="number" value={form.vacation_days} onChange={(e) => setForm({ ...form, vacation_days: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                            </div>
                            <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Notas</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} /></div>
                        </div>
                        <div className="flex justify-end gap-2 p-5 border-t">
                            <button onClick={() => setShowNewForm(false)} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleCreate} disabled={saving || !form.employee_id || !form.start_date}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 shadow-sm">{saving ? 'Guardando...' : 'Crear Contrato'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
