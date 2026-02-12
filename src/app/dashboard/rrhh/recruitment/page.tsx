"use client"

import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Plus, X, ChevronRight, ArrowRight } from 'lucide-react'

const STAGES = [
    { key: 'applied', label: 'Postulado', color: 'bg-gray-100 text-gray-700', icon: '📩' },
    { key: 'screening', label: 'Revisión', color: 'bg-blue-50 text-blue-700', icon: '🔍' },
    { key: 'interview', label: 'Entrevista', color: 'bg-purple-50 text-purple-700', icon: '🎤' },
    { key: 'technical_test', label: 'Prueba Técnica', color: 'bg-amber-50 text-amber-700', icon: '📝' },
    { key: 'offer', label: 'Oferta', color: 'bg-emerald-50 text-emerald-700', icon: '📄' },
    { key: 'hired', label: 'Contratado', color: 'bg-green-100 text-green-800', icon: '✅' },
    { key: 'rejected', label: 'Rechazado', color: 'bg-red-50 text-red-700', icon: '❌' },
]

export default function RecruitmentPage() {
    const [candidates, setCandidates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showNewForm, setShowNewForm] = useState(false)
    const [form, setForm] = useState({ candidate_name: '', candidate_email: '', candidate_phone: '', candidate_type: 'internal', position_title: '', source: '', notes: '' })
    const [saving, setSaving] = useState(false)

    const fetchCandidates = useCallback(async () => {
        try {
            const res = await fetch('/api/hr?action=recruitment')
            const data = await res.json()
            if (data.success) setCandidates(data.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchCandidates() }, [fetchCandidates])
    useEffect(() => { if (new URLSearchParams(window.location.search).get('new') === 'true') setShowNewForm(true) }, [])

    const handleCreate = async () => {
        if (!form.candidate_name) return
        setSaving(true)
        try {
            await fetch('/api/hr', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create_candidate', ...form })
            })
            setShowNewForm(false); fetchCandidates()
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    const handleStageChange = async (id: number, newStage: string) => {
        try {
            await fetch('/api/hr', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_candidate_stage', id, stage: newStage })
            })
            fetchCandidates()
        } catch (err) { console.error(err) }
    }

    // Group by stage for Kanban view
    const grouped = STAGES.reduce((acc, stage) => {
        acc[stage.key] = candidates.filter(c => c.stage === stage.key)
        return acc
    }, {} as Record<string, any[]>)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/20 to-gray-50">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><UserPlus className="w-5 h-5 text-teal-600" />Pipeline de Reclutamiento</h1>
                        <p className="text-xs text-gray-500 mt-0.5">{candidates.length} candidatos</p>
                    </div>
                    <button onClick={() => setShowNewForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-xs font-medium rounded-lg shadow-sm">
                        <Plus className="w-3.5 h-3.5" />Nuevo Candidato</button>
                </div>
            </div>

            <div className="px-6 py-6 overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>
                ) : (
                    <div className="flex gap-4 min-w-max">
                        {STAGES.filter(s => s.key !== 'rejected').map((stage) => (
                            <div key={stage.key} className="w-64 flex-shrink-0">
                                <div className={`px-3 py-2 rounded-t-xl ${stage.color} flex items-center justify-between`}>
                                    <span className="text-xs font-semibold">{stage.icon} {stage.label}</span>
                                    <span className="text-[10px] font-bold bg-white/50 px-1.5 py-0.5 rounded-full">{grouped[stage.key]?.length || 0}</span>
                                </div>
                                <div className="bg-gray-50 rounded-b-xl p-2 space-y-2 min-h-[200px]">
                                    {(grouped[stage.key] || []).map((c: any) => (
                                        <div key={c.id} className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="text-sm font-medium text-gray-900">{c.candidate_name}</div>
                                            {c.position_title && <div className="text-[10px] text-gray-500 mt-0.5">{c.position_title}</div>}
                                            {c.candidate_email && <div className="text-[10px] text-gray-400 mt-1">📧 {c.candidate_email}</div>}
                                            <div className="flex items-center gap-1 mt-2">
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.candidate_type === 'agent' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {c.candidate_type === 'agent' ? 'Agente' : 'Interno'}
                                                </span>
                                                {c.source && <span className="text-[9px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-full">{c.source}</span>}
                                            </div>
                                            {/* Stage advancement */}
                                            {stage.key !== 'hired' && (
                                                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50">
                                                    {STAGES.filter(s => STAGES.findIndex(st => st.key === s.key) > STAGES.findIndex(st => st.key === stage.key) && s.key !== 'rejected').slice(0, 2).map(ns => (
                                                        <button key={ns.key} onClick={() => handleStageChange(c.id, ns.key)}
                                                            className="text-[9px] text-gray-400 hover:text-teal-600 hover:bg-teal-50 px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5">
                                                            <ArrowRight className="w-2.5 h-2.5" />{ns.label}
                                                        </button>
                                                    ))}
                                                    <button onClick={() => handleStageChange(c.id, 'rejected')}
                                                        className="text-[9px] text-gray-400 hover:text-red-600 hover:bg-red-50 px-1.5 py-0.5 rounded transition-colors ml-auto">❌</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(grouped[stage.key] || []).length === 0 && (
                                        <div className="text-center py-8 text-[10px] text-gray-400">Sin candidatos</div>
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
                        <div className="flex items-center justify-between p-5 border-b"><h2 className="text-base font-bold">Nuevo Candidato</h2>
                            <button onClick={() => setShowNewForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="p-5 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2"><label className="text-[11px] font-medium text-gray-600 block mb-1">Nombre *</label>
                                    <input type="text" value={form.candidate_name} onChange={(e) => setForm({ ...form, candidate_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Email</label>
                                    <input type="email" value={form.candidate_email} onChange={(e) => setForm({ ...form, candidate_email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Teléfono</label>
                                    <input type="tel" value={form.candidate_phone} onChange={(e) => setForm({ ...form, candidate_phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Tipo</label>
                                    <select value={form.candidate_type} onChange={(e) => setForm({ ...form, candidate_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                        <option value="internal">Empleado Interno</option><option value="agent">Agente de Ventas</option><option value="freelance">Freelance</option></select></div>
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Puesto</label>
                                    <input type="text" value={form.position_title} onChange={(e) => setForm({ ...form, position_title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                                <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Fuente</label>
                                    <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                        <option value="">Seleccionar...</option><option value="referral">Referido</option><option value="job_portal">Portal de Empleo</option>
                                        <option value="social_media">Redes Sociales</option><option value="internal">Interno</option><option value="other">Otro</option></select></div>
                            </div>
                            <div><label className="text-[11px] font-medium text-gray-600 block mb-1">Notas</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
                        </div>
                        <div className="flex justify-end gap-2 p-5 border-t">
                            <button onClick={() => setShowNewForm(false)} className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleCreate} disabled={saving || !form.candidate_name}
                                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 shadow-sm">{saving ? 'Guardando...' : 'Crear Candidato'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
