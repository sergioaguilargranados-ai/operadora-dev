"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Plane,
  Hotel,
  Calendar,
  DollarSign,
  User,
  Building2,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { motion } from 'framer-motion'

interface Approval {
  id: number
  booking_id: number
  requested_by: number
  approved_by: number | null
  status: string
  reason: string | null
  created_at: string
  employee_name: string
  employee_email: string
  total_price: number
  destination: string
  start_date: string
  end_date: string
  service_type: string
  booking_details: any
}

export default function ApprovalsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  // Modal states
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchApprovals()
  }, [isAuthenticated, activeTab])

  const fetchApprovals = async () => {
    try {
      setLoading(true)

      // TODO: Obtener tenantId del usuario autenticado
      const tenantId = 1 // Temporal

      const endpoint = activeTab === 'pending'
        ? `/api/approvals/pending?tenantId=${tenantId}`
        : `/api/approvals/history?tenantId=${tenantId}&status=${activeTab}`

      const res = await fetch(endpoint)
      const data = await res.json()

      if (data.success) {
        setApprovals(data.data)
      }
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (approval: Approval) => {
    setSelectedApproval(approval)
    setActionType('approve')
  }

  const handleReject = async (approval: Approval) => {
    setSelectedApproval(approval)
    setActionType('reject')
    setRejectReason('')
  }

  const confirmAction = async () => {
    if (!selectedApproval || !actionType) return

    if (actionType === 'reject' && !rejectReason.trim()) {
      alert('Debes proporcionar una razón para rechazar')
      return
    }

    try {
      setProcessing(true)

      const endpoint = `/api/approvals/${selectedApproval.id}/${actionType}`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: user?.id,
          reason: actionType === 'reject' ? rejectReason : 'Aprobado'
        })
      })

      const data = await res.json()

      if (data.success) {
        // Cerrar modal
        setSelectedApproval(null)
        setActionType(null)
        setRejectReason('')

        // Refrescar lista
        fetchApprovals()
      } else {
        alert(data.error || 'Error al procesar solicitud')
      }
    } catch (error) {
      console.error('Error processing approval:', error)
      alert('Error al procesar solicitud')
    } finally {
      setProcessing(false)
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-5 h-5" />
      case 'hotel':
        return <Hotel className="w-5 h-5" />
      default:
        return <Calendar className="w-5 h-5" />
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Botón Volver */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Aprobaciones de Viajes</h1>
          <p className="text-muted-foreground">
            Gestiona las solicitudes de viaje de tu equipo
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pendientes
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Aprobadas
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="w-4 h-4" />
              Rechazadas
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : approvals.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      No hay solicitudes {activeTab === 'pending' ? 'pendientes' : activeTab === 'approved' ? 'aprobadas' : 'rechazadas'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Las solicitudes aparecerán aquí cuando estén disponibles
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvals.map((approval, index) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              {getServiceIcon(approval.service_type)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg mb-1">
                                {approval.employee_name}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {approval.employee_email}
                              </p>
                            </div>
                          </div>

                          {activeTab === 'pending' && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Pendiente
                            </Badge>
                          )}
                          {activeTab === 'approved' && (
                            <Badge className="bg-green-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Aprobada
                            </Badge>
                          )}
                          {activeTab === 'rejected' && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Rechazada
                            </Badge>
                          )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{approval.destination}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(approval.start_date)} - {formatDate(approval.end_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold text-primary">
                              {formatCurrency(approval.total_price)}
                            </span>
                          </div>
                        </div>

                        {/* Policy Warning (si aplica) */}
                        {approval.booking_details?.exceedsPolicy && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-yellow-900">Excede política de viaje</p>
                              <p className="text-yellow-700 mt-1">
                                {approval.booking_details.policyViolations?.join(', ')}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Reject Reason (si aplica) */}
                        {approval.reason && activeTab === 'rejected' && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-900 mb-1">Razón del rechazo:</p>
                            <p className="text-sm text-red-700">{approval.reason}</p>
                          </div>
                        )}

                        {/* Actions */}
                        {activeTab === 'pending' && (
                          <div className="flex gap-3 pt-4 border-t">
                            <Button
                              onClick={() => handleApprove(approval)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Aprobar
                            </Button>
                            <Button
                              onClick={() => handleReject(approval)}
                              variant="destructive"
                              className="flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialog */}
        <Dialog
          open={selectedApproval !== null && actionType !== null}
          onOpenChange={() => {
            setSelectedApproval(null)
            setActionType(null)
            setRejectReason('')
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve'
                  ? '¿Estás seguro de aprobar esta solicitud de viaje?'
                  : 'Proporciona una razón para rechazar esta solicitud'
                }
              </DialogDescription>
            </DialogHeader>

            {selectedApproval && (
              <div className="py-4">
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">{selectedApproval.employee_name}</p>
                  <p className="text-sm text-muted-foreground mb-1">
                    {selectedApproval.destination}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatDate(selectedApproval.start_date)} - {formatDate(selectedApproval.end_date)}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(selectedApproval.total_price)}
                  </p>
                </div>

                {actionType === 'reject' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Razón del rechazo *
                    </label>
                    <Textarea
                      value={rejectReason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                      placeholder="Explica por qué se rechaza esta solicitud..."
                      rows={4}
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedApproval(null)
                  setActionType(null)
                  setRejectReason('')
                }}
                disabled={processing}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmAction}
                disabled={processing || (actionType === 'reject' && !rejectReason.trim())}
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={actionType === 'reject' ? 'destructive' : 'default'}
              >
                {processing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                ) : (
                  actionType === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
