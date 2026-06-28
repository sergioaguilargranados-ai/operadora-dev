"use client"

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Loader2, User, Building2, UserCircle2, Mail, Phone, Calendar, UploadCloud, FileText, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface AgentData {
    id: number
    user_id?: number
    first_name: string
    last_name: string
    email: string
    phone: string
    photo_url: string
    agent_commission_rate: number
    agent_license_number: string
    is_active: boolean
    created_at: string
    documents: any[]
}

export default function AgentsAdminPage() {
    const [loading, setLoading] = useState(true)
    const [agents, setAgents] = useState<AgentData[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    
    // UI State for Editing
    const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchAgents()
    }, [])

    const fetchAgents = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/hr/agents')
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

    const handleSaveAgent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedAgent) return
        
        try {
            setSaving(true)
            const res = await fetch('/api/hr/agents', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedAgent)
            })
            if (res.ok) {
                setIsEditModalOpen(false)
                fetchAgents()
            } else {
                alert('Error al guardar')
            }
        } catch (error) {
            alert('Error de red')
        } finally {
            setSaving(false)
        }
    }

    const handleDocumentUpload = async (docType: string) => {
        if (!selectedAgent) return
        try {
            setSaving(true)
            const mockUrl = `https://blob.vercel-storage.com/agent-docs/${docType}-${Date.now()}.pdf`
            
            const res = await fetch('/api/admin/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entity_type: 'agent',
                    entity_id: selectedAgent.id,
                    document_name: `Documento ${docType.toUpperCase()}`,
                    document_type: docType,
                    document_url: mockUrl,
                    status: 'active'
                })
            })
            
            if (res.ok) {
                alert(`Simulación: Documento ${docType} subido exitosamente.`)
                fetchAgents()
                setIsEditModalOpen(false) // Cerrar modal para forzar refresco
            }
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    const filteredAgents = agents.filter(a => 
        (a.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (a.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PageHeader backButtonText="Dashboard" backButtonHref="/dashboard">
                <span className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <UserCircle2 className="w-6 h-6 text-indigo-600" />
                    Catálogo de Agentes
                </span>
            </PageHeader>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                
                {/* Header Actions & Filters */}
                <Card className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shadow-sm border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Buscar agente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-64"
                            />
                        </div>
                    </div>
                </Card>

                {/* Agents List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Agente</th>
                                        <th className="px-6 py-4">Contacto</th>
                                        <th className="px-6 py-4">Licencia</th>
                                        <th className="px-6 py-4">Comisión (%)</th>
                                        <th className="px-6 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAgents.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No se encontraron agentes.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAgents.map(agent => (
                                            <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {agent.photo_url ? (
                                                            <img src={agent.photo_url} alt={agent.first_name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                                {(agent.first_name || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{agent.first_name} {agent.last_name}</p>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                <Calendar className="w-3 h-3" /> Registrado {format(new Date(agent.created_at), 'dd/MM/yyyy')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Mail className="w-3 h-3 text-gray-400" />
                                                            {agent.email || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            {agent.phone || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                                                        {agent.agent_license_number || 'Sin Licencia'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    {agent.agent_commission_rate ? `${agent.agent_commission_rate}%` : '0%'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedAgent(agent); setIsEditModalOpen(true) }}>
                                                        Editar Perfil
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Edición */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Editar Perfil de Agente</DialogTitle>
                    </DialogHeader>
                    {selectedAgent && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 border-b pb-2">Datos Personales</h3>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                                    <input type="text" value={selectedAgent.first_name || ''} onChange={e => setSelectedAgent({...selectedAgent, first_name: e.target.value})} className="w-full border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Apellidos</label>
                                    <input type="text" value={selectedAgent.last_name || ''} onChange={e => setSelectedAgent({...selectedAgent, last_name: e.target.value})} className="w-full border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                    <input type="email" value={selectedAgent.email || ''} onChange={e => setSelectedAgent({...selectedAgent, email: e.target.value})} className="w-full border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                                    <input type="text" value={selectedAgent.phone || ''} onChange={e => setSelectedAgent({...selectedAgent, phone: e.target.value})} className="w-full border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Licencia de Agente</label>
                                    <input type="text" value={selectedAgent.agent_license_number || ''} onChange={e => setSelectedAgent({...selectedAgent, agent_license_number: e.target.value})} className="w-full border-gray-300 rounded-lg text-sm bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Comisión Base (%)</label>
                                    <input type="number" value={selectedAgent.agent_commission_rate || ''} onChange={e => setSelectedAgent({...selectedAgent, agent_commission_rate: parseFloat(e.target.value)})} className="w-full border-gray-300 rounded-lg text-sm font-semibold text-indigo-600" />
                                </div>
                                
                                <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveAgent} disabled={saving}>
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Guardar Cambios
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 border-b pb-2">Documentos (Vercel Blob)</h3>
                                
                                <div className="space-y-3">
                                    {[
                                        { id: 'identificacion', name: 'Identificación Oficial' },
                                        { id: 'contrato', name: 'Contrato Firmado' },
                                        { id: 'comprobante', name: 'Comprobante Domicilio' }
                                    ].map(docType => {
                                        const uploadedDoc = selectedAgent.documents?.find(d => d.document_type === docType.id)
                                        const isUploaded = !!uploadedDoc
                                        
                                        return (
                                            <div key={docType.id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    {isUploaded ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4 text-gray-400" />}
                                                    <span className="text-sm font-medium text-gray-800">{docType.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    {isUploaded ? (
                                                        <a href={uploadedDoc.document_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">Ver Documento</a>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">Pendiente</span>
                                                    )}
                                                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleDocumentUpload(docType.id)} disabled={saving}>
                                                        {isUploaded ? 'Actualizar' : 'Subir'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                
                                <div className="mt-4 p-3 border-2 border-dashed border-gray-200 rounded-lg text-center bg-gray-50">
                                    <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs font-medium text-gray-700">Foto de Perfil</p>
                                    <Button variant="outline" size="sm" className="mt-2 text-xs h-7" onClick={() => {
                                        const mockUrl = `https://blob.vercel-storage.com/photo-${Date.now()}.png`
                                        setSelectedAgent({...selectedAgent, photo_url: mockUrl})
                                        alert('Simulando subida de foto. Se asignó URL, no olvides guardar.')
                                    }}>
                                        Seleccionar Foto
                                    </Button>
                                    {selectedAgent.photo_url && <p className="text-xs text-green-600 mt-2">¡Foto lista para guardar!</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    )
}
