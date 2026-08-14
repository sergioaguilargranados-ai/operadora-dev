"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, Building2, User, Phone, Mail, FileText, ExternalLink } from "lucide-react"

type AgencyRequest = {
    user_id: number
    user_name: string
    user_email: string
    user_phone: string
    tenant_id: number
    company_name: string
    legal_name: string
    slogan: string
    custom_domain: string
    logo_url: string
    created_at: string
}

export default function AgencyRequestsPage() {
    const [requests, setRequests] = useState<AgencyRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<number | null>(null)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/agency-requests')
            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setRequests(data.data)
                }
            }
        } catch (error) {
            console.error('Error fetching requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (user_id: number, tenant_id: number, action: 'approve' | 'reject') => {
        if (!confirm(`¿Estás seguro de ${action === 'approve' ? 'APROBAR' : 'RECHAZAR'} esta solicitud?`)) return
        
        setProcessingId(user_id)
        try {
            const res = await fetch('/api/admin/agency-requests/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, tenant_id, action })
            })
            if (res.ok) {
                alert(`Solicitud ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente.`)
                fetchRequests()
            } else {
                alert('Ocurrió un error al procesar la solicitud.')
            }
        } catch (error) {
            alert('Error de red.')
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Solicitudes de Marca Blanca</h1>
            
            {requests.length === 0 ? (
                <Card className="p-12 text-center text-gray-500">
                    No hay solicitudes pendientes de revisión.
                </Card>
            ) : (
                <div className="space-y-6">
                    {requests.map((req) => (
                        <Card key={req.user_id} className="p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
                            
                            <div className="w-full md:w-1/4 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                                {req.logo_url ? (
                                    <img src={req.logo_url} alt="Logo" className="max-h-24 object-contain mb-3" />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                                        <Building2 className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                <h3 className="font-bold text-center text-lg">{req.company_name}</h3>
                                <span className="text-xs text-gray-500 text-center">{req.custom_domain || 'Sin dominio custom'}</span>
                            </div>

                            <div className="w-full md:w-2/4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><User className="w-4 h-4"/> Solicitante</p>
                                    <p className="font-medium">{req.user_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-4 h-4"/> Correo</p>
                                    <p className="font-medium">{req.user_email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-4 h-4"/> Teléfono</p>
                                    <p className="font-medium">{req.user_phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><FileText className="w-4 h-4"/> Razón Social</p>
                                    <p className="font-medium">{req.legal_name || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="w-full md:w-1/4 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-100">
                                <Button 
                                    className="w-full bg-green-600 hover:bg-green-700 text-white" 
                                    onClick={() => handleAction(req.user_id, req.tenant_id, 'approve')}
                                    disabled={processingId === req.user_id}
                                >
                                    {processingId === req.user_id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    Aprobar Agencia
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => handleAction(req.user_id, req.tenant_id, 'reject')}
                                    disabled={processingId === req.user_id}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Rechazar
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full text-indigo-600 mt-2">
                                    <ExternalLink className="w-4 h-4 mr-2" /> Ver Documentos (Simulación)
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
