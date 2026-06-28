"use client"

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Search, Loader2, Mail, Phone, MapPin, MessageSquare, RefreshCw, UploadCloud, FileText, Send, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface Client {
    client_id: number
    client_name: string
    client_email: string
    client_phone: string
    avatar_url: string
    address: string
    created_at: string
    agent_id: number
    agent_name: string
    referral_code: string
}

interface AgentOption {
    agent_id: number
    agent_name: string
}

export default function AgencyClientsCRM() {
    const [clients, setClients] = useState<Client[]>([])
    const [agents, setAgents] = useState<AgentOption[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modals state
    const [reassignClient, setReassignClient] = useState<Client | null>(null)
    const [selectedAgentId, setSelectedAgentId] = useState<number>(0)
    const [messageClient, setMessageClient] = useState<Client | null>(null)
    const [messageText, setMessageText] = useState('')
    const [sendingMsg, setSendingMsg] = useState(false)

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/agency/clients')
            const data = await res.json()
            if (data.success) {
                setClients(data.data.clients)
                setAgents(data.data.agents)
            }
        } catch (error) {
            console.error('Error fetching clients:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleReassign = async () => {
        if (!reassignClient || !selectedAgentId) return
        
        try {
            const res = await fetch('/api/agency/clients', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    client_id: reassignClient.client_id, 
                    new_agent_id: selectedAgentId 
                })
            })
            const data = await res.json()
            if (data.success) {
                alert('Cliente reasignado correctamente.')
                setReassignClient(null)
                fetchClients()
            }
        } catch (e) {
            alert('Error al reasignar')
        }
    }

    const handleSendMessage = async () => {
        if (!messageClient || !messageText.trim()) return
        
        try {
            setSendingMsg(true)
            const res = await fetch('/api/agency/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    client_id: messageClient.client_id, 
                    message: messageText 
                })
            })
            const data = await res.json()
            if (data.success) {
                alert('Mensaje enviado. El cliente lo verá en sus notificaciones.')
                setMessageClient(null)
                setMessageText('')
            }
        } catch (e) {
            alert('Error al enviar mensaje')
        } finally {
            setSendingMsg(false)
        }
    }

    const filteredClients = clients.filter(c => 
        c.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.agent_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PageHeader backButtonText="Dashboard" backButtonHref="/dashboard">
                <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <span className="text-lg font-bold text-gray-800">CRM de Clientes</span>
                </div>
            </PageHeader>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Buscar cliente o agente..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-72"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Cliente (Viajero)</th>
                                        <th className="px-6 py-4">Contacto</th>
                                        <th className="px-6 py-4">Atendido Por</th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredClients.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No hay clientes registrados.</td></tr>
                                    ) : (
                                        filteredClients.map(client => (
                                            <tr key={client.client_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {client.avatar_url ? (
                                                            <img src={client.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                                {client.client_name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{client.client_name}</p>
                                                            <p className="text-[10px] text-gray-500">Desde {format(new Date(client.created_at), 'dd/MMM/yyyy')}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1 text-xs text-gray-600">
                                                        <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-gray-400" /> {client.client_email}</div>
                                                        {client.client_phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-gray-400" /> {client.client_phone}</div>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-indigo-100">
                                                        <UserCheck className="w-3 h-3" />
                                                        {client.agent_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => alert('Abriendo Expediente Documental de Viajero (Vercel Blob)...')}>
                                                            <FileText className="w-3 h-3 mr-1" /> Expediente
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50" onClick={() => setMessageClient(client)}>
                                                            <MessageSquare className="w-3 h-3 mr-1" /> Mensaje
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-orange-600 hover:bg-orange-50" onClick={() => {
                                                            setReassignClient(client)
                                                            setSelectedAgentId(client.agent_id)
                                                        }}>
                                                            <RefreshCw className="w-3 h-3 mr-1" /> Reasignar
                                                        </Button>
                                                    </div>
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

            {/* Modal Reasignar Agente */}
            {reassignClient && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900">Transferir Cliente</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                Vas a transferir al cliente <strong>{reassignClient.client_name}</strong> a un nuevo agente. Las futuras compras generarán comisión para el nuevo agente seleccionado.
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Seleccionar Nuevo Agente</label>
                                <select 
                                    className="w-full border-gray-300 rounded-lg p-2.5 text-sm"
                                    value={selectedAgentId}
                                    onChange={e => setSelectedAgentId(Number(e.target.value))}
                                >
                                    {agents.map(a => (
                                        <option key={a.agent_id} value={a.agent_id}>{a.agent_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setReassignClient(null)}>Cancelar</Button>
                                <Button type="button" onClick={handleReassign} className="bg-orange-600 hover:bg-orange-700">Confirmar Transferencia</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal Enviar Mensaje */}
            {messageClient && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-blue-50 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-gray-900">Mensaje a {messageClient.client_name}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                Escribe un mensaje directo. Se mostrará en el centro de notificaciones (campanita) del portal de tu cliente.
                            </p>
                            <textarea 
                                className="w-full border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                                placeholder="Escribe aquí tu mensaje..."
                                value={messageText}
                                onChange={e => setMessageText(e.target.value)}
                            />
                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setMessageClient(null)}>Cancelar</Button>
                                <Button type="button" onClick={handleSendMessage} disabled={sendingMsg} className="bg-blue-600 hover:bg-blue-700">
                                    {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                    Enviar Mensaje
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
