"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"

export default function ModeracionPage() {
  const { toast } = useToast()
  const [pendingMessages, setPendingMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const moderatorId = 1 // TODO: obtener de auth
  const tenantId = 1

  useEffect(() => {
    loadPendingMessages()
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadPendingMessages, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadPendingMessages = async () => {
    try {
      // TODO: Crear endpoint específico para mensajes pendientes
      const res = await fetch(`/api/communication/messages?moderation_status=pending`)
      const data = await res.json()

      if (data.success) {
        setPendingMessages(data.data || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const moderateMessage = async (messageId: number, approved: boolean) => {
    setLoading(true)

    try {
      const res = await fetch('/api/communication/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          action: 'moderate',
          moderator_id: moderatorId,
          approved,
          tenant_id: tenantId
        })
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: approved ? 'Mensaje aprobado' : 'Mensaje rechazado',
          description: 'La acción se completó correctamente'
        })

        loadPendingMessages()
      } else {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          Moderación de Mensajes
        </h1>
        <p className="text-muted-foreground mt-1">
          Revisa y aprueba mensajes antes de ser enviados
        </p>
      </div>

      <div className="grid gap-4">
        {pendingMessages.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-bold mb-2">¡Todo listo!</h3>
            <p className="text-muted-foreground">
              No hay mensajes pendientes de moderación
            </p>
          </Card>
        ) : (
          pendingMessages.map((message) => (
            <Card key={message.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Pendiente
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div className="font-semibold">
                    De: {message.sender_name}
                  </div>
                  {message.sender_email && (
                    <div className="text-sm text-muted-foreground">
                      {message.sender_email}
                    </div>
                  )}
                </div>
              </div>

              {message.subject && (
                <div className="mb-3">
                  <span className="font-semibold">Asunto: </span>
                  {message.subject}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-4 whitespace-pre-wrap">
                {message.body}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => moderateMessage(message.id, true)}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aprobar y Enviar
                </Button>
                <Button
                  onClick={() => moderateMessage(message.id, false)}
                  disabled={loading}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
