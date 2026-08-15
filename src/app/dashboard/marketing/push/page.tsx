'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Send, Smartphone, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function PushMarketingPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [url, setUrl] = useState('/')
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !message) {
      toast({ title: 'Error', description: 'Título y mensaje son requeridos', variant: 'destructive' })
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, url })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar notificaciones')
      }

      toast({ 
        title: 'Notificaciones enviadas', 
        description: `Se enviaron ${data.sent} notificaciones exitosamente. Fallaron: ${data.failed}.` 
      })
      
      setTitle('')
      setMessage('')
      
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Marketing Push</h1>
          <p className="text-sm text-muted-foreground">Envía notificaciones push a todos los dispositivos registrados (PWA)</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6">
          <form onSubmit={handleSend} className="space-y-4">
            <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg text-blue-800">
              <Smartphone className="w-6 h-6" />
              <p className="text-sm">Estas notificaciones llegarán directamente a los teléfonos y computadoras de los clientes que hayan instalado la PWA.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Título de la Notificación</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Ej. ¡Oferta de Verano 2026!"
                maxLength={50}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mensaje corto</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border rounded-md h-24"
                placeholder="Ej. Cancún 4 días y 3 noches desde $5,999 MXN"
                maxLength={150}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Enlace de destino (Opcional)</label>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Ej. /tours/cancun-2026"
              />
            </div>

            <Button type="submit" disabled={isSending} className="w-full gap-2 mt-4 bg-[#0066FF] hover:bg-[#0044CC] text-white">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSending ? 'Enviando...' : 'Enviar Notificación Masiva'}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}
