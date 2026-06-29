"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ChevronLeft, Bell, MessageCircle, Facebook, Instagram, User, ChevronRight, Share2, Send, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function MobileGroupsPage() {
  const router = useRouter()

  const options = [
    {
      id: "whatsapp",
      title: "Invitar mediante WhatsApp",
      desc: "Comparte tu viaje con tus contactos a través de WhatsApp.",
      icon: MessageCircle,
      color: "bg-[#25D366]"
    },
    {
      id: "facebook",
      title: "Invitar mediante Facebook",
      desc: "Comparte tu viaje con tus amigos a través de Facebook.",
      icon: Facebook,
      color: "bg-[#1877F2]"
    },
    {
      id: "instagram",
      title: "Invitar mediante Instagram",
      desc: "Comparte tu viaje con tus amigos a través de Instagram.",
      icon: Instagram,
      color: "bg-[#E4405F]"
    },
    {
      id: "contacts",
      title: "Invitar mediante contactos",
      desc: "Selecciona contactos de tu agenda para invitarlos al grupo.",
      icon: User,
      color: "bg-[#000000]"
    }
  ]

  const { user } = useAuth()
  const { logoUrl } = useWhiteLabel()
  const { toast } = useToast()
  
  const [mobileContent, setMobileContent] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    target_name: '',
    target_contact: '',
    personal_message: ''
  })

  useEffect(() => {
    const fetchMobileContent = async () => {
      try {
        const res = await fetch("/api/mobile/content?tenant_id=1")
        const data = await res.json()
        if (data.success && data.data) {
          setMobileContent(data.data)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchMobileContent()
  }, [])

  const handleShareClick = (option: any) => {
    setSelectedChannel(option)
    setFormData({ target_name: '', target_contact: '', personal_message: '' })
    setIsDialogOpen(true)
  }

  const handleSendInvitation = async () => {
    if (!formData.target_contact) {
      toast({ title: "Faltan datos", description: "El contacto es obligatorio", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/mobile/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || 1, // Simulamos usuario
          channel: selectedChannel.id,
          target_name: formData.target_name,
          target_contact: formData.target_contact,
          personal_message: formData.personal_message,
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Invitación Enviada", description: "La invitación se ha registrado y enviado." })
        setIsDialogOpen(false)
        
        // Aquí se construiría la URL real para compartir
        const baseMessage = mobileContent?.sections_json?.invitation_text || "¡Únete a mi próximo viaje! Descarga la app y regístrate."
        const fullMessage = formData.personal_message ? `${formData.personal_message}\n\n${baseMessage}` : baseMessage
        
        // Simular apertura de app nativa
        setTimeout(() => {
          alert(`Abriendo ${selectedChannel.title}...\nMensaje: ${fullMessage}`)
        }, 500)
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "No se pudo registrar la invitación", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-24">
      
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-[#FDFDFD] z-30">
        <button onClick={() => router.back()} className="text-black hover:text-gray-600 p-2 -ml-2">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <img
          src={logoUrl || "/logo.png"}
          alt="AS Operadora"
          className="h-10 object-contain"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icons/icon-192x192.png'; }}
        />
        <button onClick={() => router.push('/mobile/notificaciones')} className="text-black hover:text-gray-600 p-2 -mr-2">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 pt-4 pb-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Crea tu grupo</h1>
        <p className="text-sm text-gray-600 leading-relaxed pr-4">
          Invita a tus acompañantes y gestiona tu grupo de viaje de forma fácil y rápida.
        </p>
      </div>

      {/* Invite Options */}
      <div className="px-4 space-y-4">
        {options.map((option) => (
          <div 
            key={option.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer active:scale-95 transition-transform hover:bg-gray-50"
            onClick={() => handleShareClick(option)}
          >
            <div className={`w-16 h-16 ${option.color} text-white rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <option.icon className="w-7 h-7" strokeWidth={1.5} />
            </div>
            
            <div className="flex-1 min-w-0 py-1">
              <h3 className="font-bold text-gray-900 text-sm mb-1">{option.title}</h3>
              <p className="text-xs text-gray-500 leading-tight pr-2">
                {option.desc}
              </p>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[90%] max-w-[400px] rounded-3xl p-6 border-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Share2 className="w-5 h-5" /> 
              Invitar por {selectedChannel?.title?.replace('Invitar mediante ', '')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Nombre (Opcional)</label>
              <Input 
                placeholder="Ej. Juan Pérez" 
                value={formData.target_name}
                onChange={e => setFormData({...formData, target_name: e.target.value})}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Contacto (Teléfono/Usuario) *</label>
              <Input 
                placeholder="Ej. 5512345678" 
                value={formData.target_contact}
                onChange={e => setFormData({...formData, target_contact: e.target.value})}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Mensaje Personal (Opcional)</label>
              <Textarea 
                placeholder="Escribe un mensaje para acompañar la invitación..." 
                value={formData.personal_message}
                onChange={e => setFormData({...formData, personal_message: e.target.value})}
                className="bg-gray-50 border-gray-200 resize-none h-24"
              />
            </div>
          </div>
          <Button 
            onClick={handleSendInvitation}
            disabled={loading || !formData.target_contact}
            className="w-full h-12 bg-[#0066FF] text-white rounded-xl font-bold text-base hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Enviar Invitación <Send className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </DialogContent>
      </Dialog>

    </div>
  )
}
