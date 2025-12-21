"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  MessageCircle, Send, Search, Filter, Archive, AlertCircle,
  Clock, CheckCircle2, Circle, Paperclip, MoreVertical, X, Plus
} from "lucide-react"

export default function ComunicacionPage() {
  const { toast } = useToast()

  // Estado
  const [threads, setThreads] = useState<any[]>([])
  const [selectedThread, setSelectedThread] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Usuario actual (TODO: obtener de auth)
  const currentUserId = 1
  const userType = 'client' as 'client' | 'agent'
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
      const params = new URLSearchParams({
        userId: currentUserId.toString(),
        userType,
        tenantId: tenantId.toString()
      })

      if (filter !== 'all') {
        params.append('status', filter)
      }

      const res = await fetch(`/api/communication/threads?${params}`)
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
      }
    } catch (error) {
      console.error('Error loading messages:', error)
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

  const formatDate = (date: string) => {
    const d = new Date(date)
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
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            Centro de Comunicación
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todas tus conversaciones en un solo lugar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Lista de hilos */}
          <Card className="lg:col-span-1 p-4 flex flex-col overflow-hidden">
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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

                      if (isSystem) {
                        return (
                          <div key={message.id} className="flex justify-center">
                            <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-muted-foreground max-w-md text-center">
                              {message.body}
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Presiona Enter para enviar, Shift+Enter para nueva línea
                  </p>
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
    </div>
  )
}
