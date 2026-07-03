"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ChevronLeft, Bell, Share2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { useToast } from "@/hooks/use-toast"

export default function MobileGroupsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { logoUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  const { toast } = useToast()
  
  const [mobileContent, setMobileContent] = useState<any>(null)

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

  const handleNativeShare = async () => {
    const baseMessage = mobileContent?.sections_json?.invitation?.message || "¡Únete a mi próximo viaje! Descarga la app y regístrate."
    const shareUrl = window.location.origin
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a mi grupo de viaje',
          text: baseMessage,
          url: shareUrl
        })
        toast({ title: "¡Gracias por compartir!", description: "Has invitado a tus acompañantes con éxito." })
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Error sharing:", err)
        }
      }
    } else {
      // Fallback para navegadores de escritorio que no soportan Web Share API
      try {
        await navigator.clipboard.writeText(`${baseMessage}\n\n${shareUrl}`)
        toast({ title: "Enlace copiado", description: "El mensaje ha sido copiado al portapapeles." })
      } catch (err) {
        toast({ title: "Error", description: "No se pudo copiar el enlace.", variant: "destructive" })
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-24">
      
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-[#FDFDFD] z-30">
        <button onClick={() => router.back()} className="text-black hover:text-gray-600 p-2 -ml-2">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <MobileLogo
          variant="dark"
          size="md"
          logoUrl={customLogoUrl}
        />
        <button onClick={() => router.push('/mobile/notificaciones')} className="text-black hover:text-gray-600 p-2 -mr-2">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Promotional Banner from CMS */}
      {mobileContent?.sections_json?.invitation?.image_url && (
        <div className="px-4 mt-2 mb-2">
          <img 
            src={mobileContent.sections_json.invitation.image_url} 
            alt="Promoción Viaje" 
            className="w-full h-40 object-cover rounded-3xl shadow-sm border border-gray-100"
          />
        </div>
      )}

      {/* Title */}
      <div className="px-6 pt-4 pb-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Crea tu grupo</h1>
        <p className="text-sm text-gray-600 leading-relaxed pr-4">
          Invita a tus acompañantes y gestiona tu grupo de viaje de forma fácil y rápida.
        </p>
      </div>

      {/* Invite Action */}
      <div className="px-4 mt-4">
        <button 
          onClick={handleNativeShare}
          className="w-full bg-black text-white rounded-2xl p-5 flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-95 transition-transform"
        >
          <Share2 className="w-6 h-6" />
          <span className="font-serif font-bold text-lg">Crea tu grupo y gana</span>
        </button>
      </div>

    </div>
  )
}
