"use client"

import { useState, useEffect, useCallback } from 'react'
import { Building2, Plus, Users, X } from 'lucide-react'

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showNew, setShowNew] = useState(false)
    const [form, setForm] = useState({ name: '', description: '' })
    const [saving, setSaving] = useState(false)

    const fetchDepartments = useCallback(async () => {
        try {
            const res = await fetch('/api/hr?action=departments')
            const data = await res.json()
            if (data.success) setDepartments(data.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchDepartments() }, [fetchDepartments])

    const handleCreate = async () => {
        if (!form.name) return
        setSaving(true)
        try {
            await fetch('/api/hr', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create_department', ...form })
            })
            setShowNew(false); setForm({ name: '', description: '' }); fetchDepartments()
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50/20 to-gray-50">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div><h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-cyan-600" />Departamentos</h1></div>
                    <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-xs font-medium rounded-lg shadow-sm">
                        <Plus className="w-3.5 h-3.5" />Nuevo Departamento</button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" /></div>
                ) : departments.length === 0 ? (
                    <div className="text-center py-20"><Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-500">Sin departamentos</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {departments.map((d: any) => (
                            <div key={d.id} className="bg-white/90 rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Users className="w-3 h-3" />{d.employee_count || 0}
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 mt-3">{d.name}</h3>
                                {d.description && <p className="text-[11px] text-gray-500 mt-1">{d.description}</p>}
                                {d.manager_name && <div className="text-[10px] text-gray-400 mt-2">👤 Responsable: {d.manager_name}</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showNew && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b"><h2 className="text-base font-bold">Nuevo Departamento</h2>
                            <button onClick={() => setShowNew(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="p-5 space-y-3">
                            <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Nombre *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: Ventas, Operaciones, Admin..." /></div>
                            <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Descripción</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
                        </div>
                        <div className="flex justify-end gap-2 p-5 border-t">
                            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleCreate} disabled={saving || !form.name}
                                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 shadow-sm">{saving ? 'Guardando...' : 'Crear'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
