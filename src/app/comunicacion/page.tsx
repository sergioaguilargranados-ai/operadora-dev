"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/PageHeader"
import {
  MessageCircle, Send, Search, Filter, Archive, AlertCircle,
  Clock, CheckCircle2, Circle, Paperclip, MoreVertical, X, Plus,
  Mail, XCircle, AlertTriangle, Wifi
} from "lucide-react"

export default function ComunicacionPage() {
  const { toast } = useToast()

  // Estado
  const [threads, setThreads] = useState<any[]>([])
  const [selectedThread, setSelectedThread] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<Record<number, any[]>>({})
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAlert, setIsAlert] = useState(false)
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false)
  const [newThreadEmail, setNewThreadEmail] = useState('')
  const [newThreadSubject, setNewThreadSubject] = useState('')
  const [newThreadMessage, setNewThreadMessage] = useState('')
  const [newThreadIsAlert, setNewThreadIsAlert] = useState(false)
  const [isCreatingThread, setIsCreatingThread] = useState(false)

  // Centro de Comunicación — vista del equipo interno (agente)
  const currentUserId = 1
  const userType = 'agent' as 'client' | 'agent'
  const tenantId = 1

  useEffect(() => {
    loadThreads()
  }, [filter])

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id)
      // Marcar como leído
      markThreadAsRead(selectedThread.id)

      // Polling para actualizaciones en tiempo real (cada 5 segundos)
      const interval = setInterval(() => {
        loadMessages(selectedThread.id)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [selectedThread])

  const loadThreads = async () => {
    try {
      // Admin: obtener TODOS los threads sin restricción de usuario
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)

      const res = await fetch(`/api/communication/threads/all?${params}`)
      const data = await res.json()

      if (data.success) {
        setThreads(data.data)
      }
    } catch (error) {
      console.error('Error loading threads:', error)
    }
  }

  const loadMessages = async (threadId: number) => {
    try {
      const res = await fetch(`/api/communication/messages?thread_id=${threadId}`)
      const data = await res.json()

      if (data.success) {
        setMessages(data.data)
        // Cargar deliveries para mensajes outbound del sistema
        loadDeliveries(data.data)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  // Cargar estado de entrega desde message_deliveries
  const loadDeliveries = async (msgs: any[]) => {
    const outboundIds = msgs
      .filter(m => m.sender_type === 'system' || m.sender_type === 'agent')
      .map(m => m.id)
    if (outboundIds.length === 0) return
    try {
      const res = await fetch(`/api/communication/messages/deliveries?ids=${outboundIds.join(',')}`)
      const data = await res.json()
      if (data.success) {
        // Agrupar deliveries por message_id
        const map: Record<number, any[]> = {}
        for (const d of data.data) {
          if (!map[d.message_id]) map[d.message_id] = []
          map[d.message_id].push(d)
        }
        setDeliveries(map)
      }
    } catch {
      // Silencioso — no afecta UI principal
    }
  }

  const markThreadAsRead = async (threadId: number) => {
    try {
      await fetch('/api/communication/threads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: threadId,
          action: 'mark_read',
          value: {
            user_id: currentUserId,
            user_type: userType
          }
        })
      })
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return

    setLoading(true)

    try {
      const res = await fetch('/api/communication/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: selectedThread.id,
          sender_id: currentUserId,
          sender_type: userType,
          sender_name: 'Usuario', // TODO: nombre real
          body: newMessage,
          message_type: isAlert ? 'alert' : 'text',
          tenant_id: tenantId
        })
      })

      const data = await res.json()

      if (data.success) {
        setNewMessage('')
        loadMessages(selectedThread.id)
        loadThreads() // Actualizar lista

        toast({
          title: 'Mensaje enviado',
          description: data.message
        })
      } else {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNewThread = async () => {
    if (!newThreadEmail.trim() || !newThreadSubject.trim() || !newThreadMessage.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa el correo, asunto y mensaje',
        variant: 'destructive'
      })
      return
    }

    setIsCreatingThread(true)

    try {
      const res = await fetch('/api/communication/new-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newThreadEmail,
          subject: newThreadSubject,
          message: newThreadMessage,
          isAlert: newThreadIsAlert
        })
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Mensaje enviado',
          description: 'Se ha creado la nueva conversación'
        })
        
        setIsNewMessageModalOpen(false)
        setNewThreadEmail('')
        setNewThreadSubject('')
        setNewThreadMessage('')
        setNewThreadIsAlert(false)
        
        loadThreads()
        
        // Select the newly created thread
        const newThreadId = data.data.thread_id
        // Load threads again to find it and select it, or just rely on next fetch
        // Para simplificar, recargamos la lista
      } else {
        throw new Error(data.error || 'Error al enviar mensaje')
      }
    } catch (error: any) {
      console.error('Error creating thread:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la conversación',
        variant: 'destructive'
      })
    } finally {
      setIsCreatingThread(false)
    }
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = diff / (1000 * 60 * 60)

    if (hours < 24) {
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    } else if (hours < 48) {
      return 'Ayer'
    } else {
      return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      active: 'default',
      pending_client: 'secondary',
      pending_agent: 'secondary',
      closed: 'outline',
      escalated: 'destructive'
    }

    const labels: any = {
      active: 'Activo',
      pending_client: 'Esperando cliente',
      pending_agent: 'Esperando agente',
      closed: 'Cerrado',
      escalated: 'Escalado'
    }

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return null
    }
  }

  const filteredThreads = threads.filter(thread =>
    thread.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader showBackButton={true} backButtonHref="/">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Centro de Comunicación
          </h1>
        </div>
      </PageHeader>

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Gestiona todas tus conversaciones en un solo lugar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Lista de hilos */}
          <Card className="lg:col-span-1 p-4 flex flex-col overflow-hidden">
            <div className="mb-4 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Dialog open={isNewMessageModalOpen} onOpenChange={setIsNewMessageModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="outline" className="shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Nuevo Mensaje</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Correo del destinatario</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="cliente@ejemplo.com"
                          value={newThreadEmail}
                          onChange={(e) => setNewThreadEmail(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="subject">Asunto</Label>
                        <Input
                          id="subject"
                          placeholder="Asunto del mensaje"
                          value={newThreadSubject}
                          onChange={(e) => setNewThreadSubject(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="message">Mensaje</Label>
                        <Textarea
                          id="message"
                          placeholder="Escribe el mensaje aquí..."
                          value={newThreadMessage}
                          onChange={(e) => setNewThreadMessage(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="new-alert"
                          checked={newThreadIsAlert}
                          onCheckedChange={setNewThreadIsAlert}
                        />
                        <Label htmlFor="new-alert" className="flex items-center gap-1 text-red-600 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          Marcar como alerta importante
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsNewMessageModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateNewThread} disabled={isCreatingThread}>
                        {isCreatingThread ? 'Enviando...' : 'Enviar mensaje'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
                  <TabsTrigger value="active" className="flex-1">Activos</TabsTrigger>
                  <TabsTrigger value="closed" className="flex-1">Cerrados</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredThreads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay conversaciones</p>
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedThread?.id === thread.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(thread.priority)}
                        <span className="font-semibold text-sm">{thread.subject}</span>
                      </div>
                      {thread.last_message_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(thread.last_message_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(thread.status)}
                      {userType === 'client' && thread.unread_count_client > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {thread.unread_count_client} nuevo{thread.unread_count_client > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {userType === 'agent' && thread.unread_count_agent > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {thread.unread_count_agent} nuevo{thread.unread_count_agent > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {thread.reference_type && (
                      <div className="text-xs text-muted-foreground">
                        {thread.reference_type} #{thread.reference_id}
                      </div>
                    )}

                    {thread.tags && thread.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {thread.tags.slice(0, 2).map((tag: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Conversación */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            {selectedThread ? (
              <>
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-lg">{selectedThread.subject}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(selectedThread.status)}
                        {selectedThread.reference_type && (
                          <span className="text-sm text-muted-foreground">
                            {selectedThread.reference_type} #{selectedThread.reference_id}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No hay mensajes aún</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.sender_id === currentUserId
                      const isSystem = message.sender_type === 'system'
                      const isOutbound = isSystem || message.sender_type === 'agent'
                      const msgDeliveries = deliveries[message.id] || []

                      // Indicador de estado de entrega
                      const DeliveryBadge = () => {
                        if (!isOutbound || msgDeliveries.length === 0) return null
                        const hasFailed = msgDeliveries.some(d => d.status === 'failed' || d.status === 'bounced' || d.status === 'rejected')
                        const hasSent = msgDeliveries.some(d => d.status === 'sent' || d.status === 'delivered')
                        const channels = [...new Set(msgDeliveries.map(d => d.channel))].join(', ')

                        if (hasFailed) {
                          const failedD = msgDeliveries.find(d => d.status === 'failed' || d.status === 'bounced' || d.status === 'rejected')
                          return (
                            <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                              <XCircle className="w-3 h-3 flex-shrink-0" />
                              <span><strong>No entregado</strong> · {channels} · {failedD?.error_message || failedD?.status || 'Error desconocido'}</span>
                            </div>
                          )
                        }
                        if (hasSent) {
                          const sentD = msgDeliveries.find(d => d.status === 'sent' || d.status === 'delivered')
                          return (
                            <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-green-50 border border-green-200 rounded-md text-xs text-green-700">
                              <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                              <span>Enviado · {channels}{sentD?.sent_at ? ` · ${formatDate(sentD.sent_at)}` : ''}</span>
                            </div>
                          )
                        }
                        return (
                          <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>Pendiente · {channels}</span>
                          </div>
                        )
                      }

                      if (isSystem) {
                        return (
                          <div key={message.id} className="flex justify-center">
                            <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-muted-foreground max-w-md text-center">
                              {message.body}
                              <DeliveryBadge />
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-lg ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100'} rounded-lg p-4`}>
                            {!isOwn && (
                              <div className="font-semibold text-sm mb-1">
                                {message.sender_name}
                              </div>
                            )}
                            <div className="whitespace-pre-wrap">{message.body}</div>
                            <div className={`text-xs mt-2 ${isOwn ? 'text-blue-100' : 'text-muted-foreground'}`}>
                              {formatDate(message.created_at)}
                              {message.status === 'sent' && isOwn && (
                                <CheckCircle2 className="w-3 h-3 inline ml-1" />
                              )}
                            </div>
                            <DeliveryBadge />

                            {message.requires_moderation && message.moderation_status === 'pending' && (
                              <Badge variant="secondary" className="mt-2">
                                Pendiente de moderación
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Input de mensaje */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || loading}
                      className="self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      Presiona Enter para enviar, Shift+Enter para nueva línea
                    </p>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={isAlert}
                        onCheckedChange={setIsAlert}
                        id="alert-mode"
                      />
                      <label htmlFor="alert-mode" className="text-sm cursor-pointer text-gray-700 font-medium">
                        Enviar como Alerta Importante (App)
                      </label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Selecciona una conversación</p>
                  <p className="text-sm mt-1">O inicia una nueva desde el botón</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Footer con versión */}
      <div className="text-center py-3 text-xs text-muted-foreground border-t">
        AS Operadora · Centro de Comunicación · v2.343 · 2026-05-07 13:00 CST
      </div>
    </div>
  )
}
