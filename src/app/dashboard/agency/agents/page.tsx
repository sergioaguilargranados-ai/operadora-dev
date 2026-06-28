"use client"

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Search, Loader2, Mail, Phone, MapPin, Percent, Copy, UploadCloud, CheckCircle2, UserPlus, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

interface Agent {
    user_id: number
    agent_id: number
    name: string
    email: string
    phone: string
    avatar_url: string
    address: string
    referral_code: string
    agent_commission_split: number
    agent_status: string
    created_at: string
}

export default function AgencyAgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal state
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

    useEffect(() => {
        fetchAgents()
    }, [])

    const fetchAgents = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/agency/agents')
            const data = await res.json()
            if (data.success) {
                setAgents(data.data)
            }
        } catch (error) {
            console.error('Error fetching agents:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(`https://agencia.app.asoperadora.com/?ref=${code}`)
        alert(`¡Enlace copiado!\n\nLink: https://agencia.app.asoperadora.com/?ref=${code}`)
    }

    const handleSaveAgent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingAgent) return

        try {
            const res = await fetch('/api/agency/agents', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingAgent)
            })
            const data = await res.json()
            if (data.success) {
                setEditingAgent(null)
                fetchAgents() // recargar
            } else {
                alert('Error al guardar')
            }
        } catch (err) {
            alert('Error de red')
        }
    }

    const filteredAgents = agents.filter(a => 
        a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PageHeader backButtonText="Dashboard" backButtonHref="/dashboard">
                <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <span className="text-lg font-bold text-gray-800">Catálogo de Agentes</span>
                </div>
            </PageHeader>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Buscar agente..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-64"
                        />
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Agente
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAgents.map(agent => (
                            <motion.div key={agent.agent_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200 bg-white group">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                {agent.avatar_url ? (
                                                    <img src={agent.avatar_url} alt={agent.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                                                        {agent.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-bold text-gray-900 leading-tight">{agent.name}</h3>
                                                    <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider ${agent.agent_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {agent.agent_status === 'active' ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {agent.email}</div>
                                            {agent.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {agent.phone}</div>}
                                            {agent.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> <span className="truncate">{agent.address}</span></div>}
                                        </div>

                                        <div className="flex items-center justify-between bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                                            <div>
                                                <p className="text-xs text-indigo-900/60 font-medium">Comisión B2B</p>
                                                <p className="font-bold text-indigo-700 flex items-center gap-1">
                                                    {agent.agent_commission_split}%
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-indigo-900/60 font-medium">Código Referido</p>
                                                <button onClick={() => handleCopyCode(agent.referral_code)} className="font-mono text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                    {agent.referral_code} <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 p-3 bg-gray-50 flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1 bg-white text-gray-700 text-xs" onClick={() => setEditingAgent(agent)}>
                                            Editar Perfil
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1 bg-white text-gray-700 text-xs" onClick={() => alert('Abriendo expediente Vercel Blob')}>
                                            <FileText className="w-3 h-3 mr-1" /> Expediente
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Editar Agente */}
            {editingAgent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900">Editar Perfil de Agente</h3>
                        </div>
                        <form onSubmit={handleSaveAgent} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center gap-3 mb-6">
                                {editingAgent.avatar_url ? (
                                    <img src={editingAgent.avatar_url} className="w-20 h-20 rounded-full object-cover border" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                        <UserPlus className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                <Button type="button" variant="outline" size="sm" onClick={() => setEditingAgent({...editingAgent, avatar_url: `https://blob.vercel-storage.com/avatar-${Date.now()}.png`})}>
                                    <UploadCloud className="w-4 h-4 mr-2" /> Subir Foto (Vercel Blob)
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input type="text" value={editingAgent.phone || ''} onChange={e => setEditingAgent({...editingAgent, phone: e.target.value})} className="w-full border-gray-300 rounded-md text-sm p-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Comisión (%)</label>
                                    <input type="number" step="0.1" value={editingAgent.agent_commission_split || 0} onChange={e => setEditingAgent({...editingAgent, agent_commission_split: parseFloat(e.target.value)})} className="w-full border-gray-300 rounded-md text-sm p-2" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Domicilio Completo</label>
                                    <textarea value={editingAgent.address || ''} onChange={e => setEditingAgent({...editingAgent, address: e.target.value})} className="w-full border-gray-300 rounded-md text-sm p-2" rows={2} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Estatus</label>
                                    <select value={editingAgent.agent_status} onChange={e => setEditingAgent({...editingAgent, agent_status: e.target.value})} className="w-full border-gray-300 rounded-md text-sm p-2">
                                        <option value="active">Activo</option>
                                        <option value="inactive">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t mt-4">
                                <Button type="button" variant="outline" onClick={() => setEditingAgent(null)}>Cancelar</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Guardar Cambios</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
