// Build: 21 Jul 2026 - 13:55 CST - v2.426
"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ChevronLeft, Share2, Link as LinkIcon, Gift, Briefcase, Footprints, Sun, Compass, Trophy } from "lucide-react"
import NotificationBell from "@/components/mobile/NotificationBell"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export default function MobileGroupsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { logoUrl, logoMobileUrl, companyName } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  const { toast } = useToast()
  
  const [mobileContent, setMobileContent] = useState<any>(null)
  const [referralData, setReferralData] = useState<any>(null)
  const [loadingReferrals, setLoadingReferrals] = useState(true)
  const [copied, setCopied] = useState(false)

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

    const loadReferralData = async () => {
      if (!user?.id) return
      try {
        setLoadingReferrals(true)
        const res = await fetch(`/api/mobile/referrals?user_id=${user.id}`)
        const data = await res.json()
        if (data.success && data.data) {
          setReferralData(data.data.user)
        }
      } catch (error) {
        console.error('Error fetching referrals:', error)
      } finally {
        setLoadingReferrals(false)
      }
    }

    fetchMobileContent()
    loadReferralData()
  }, [user])

  const handleShare = (type: 'whatsapp' | 'facebook' | 'instagram' | 'copy') => {
    const invitationCode = referralData?.referral_code || ''
    const baseMessage = `¡Te invito a viajar con ${companyName || 'AS Operadora'}! Usa mi código de invitación ${invitationCode} al registrarte y obtén beneficios.`
    const registrationUrl = `${window.location.origin}/registro?ref=${invitationCode}`
    
    if (type === 'whatsapp') {
      const text = `${baseMessage} Regístrate aquí: ${registrationUrl}`
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    } else if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(registrationUrl)}`, '_blank')
    } else if (type === 'instagram') {
      navigator.clipboard.writeText(`${baseMessage}`)
      toast({ title: 'Texto copiado', description: '¡Pégalo en tu historia o perfil de Instagram!' })
    } else if (type === 'copy') {
      navigator.clipboard.writeText(registrationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'Enlace copiado', description: 'Enlace de invitación copiado al portapapeles.' })
    }
  }

  const handleNativeShare = async () => {
    const invitationCode = referralData?.referral_code || ''
    const baseMessage = `¡Te invito a viajar con ${companyName || 'AS Operadora'}! Usa mi código de invitación ${invitationCode} al registrarte y obtén beneficios.`
    const shareUrl = `${window.location.origin}/registro?ref=${invitationCode}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a mi grupo de viaje',
          text: baseMessage,
          url: shareUrl
        })
        toast({ title: "¡Gracias por compartir!", description: "Has compartido tu invitación con éxito." })
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Error sharing:", err)
        }
      }
    } else {
      handleShare('copy')
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
          <NotificationBell className="w-6 h-6" />
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
      <div className="px-6 pt-4 pb-6">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Crea tu grupo</h1>
        <p className="text-sm text-gray-600 leading-relaxed pr-4">
          Invita a tus acompañantes y gestiona tu grupo de viaje de forma fácil y rápida.
        </p>
      </div>

      {/* Invite Flow Container (Matching AS Rewards styles) */}
      <div className="px-6 space-y-6">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h3 className="font-serif font-bold text-lg text-gray-900 mb-4 text-center">Invita más viajeros</h3>
          
          <div className="border border-gray-200 rounded-xl p-3.5 mb-4 text-center bg-gray-50/50">
            <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">Tu código de invitación</p>
            <p className="font-mono font-bold text-xl tracking-wider text-black">
              {loadingReferrals ? 'CARGANDO...' : (referralData?.referral_code || 'SIN CÓDIGO')}
            </p>
          </div>
          
          <Button 
            onClick={handleNativeShare}
            className="w-full bg-black text-white hover:bg-gray-800 rounded-xl font-bold h-12 shadow-sm mb-6 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Compartir invitación
          </Button>

          {/* Social Network Circles */}
          <div className="flex justify-around items-center px-2">
            <SocialButton color="bg-green-500" name="WhatsApp" icon={<WhatsAppIcon />} onClick={() => handleShare('whatsapp')} />
            <SocialButton color="bg-blue-600" name="Facebook" icon={<FacebookIcon />} onClick={() => handleShare('facebook')} />
            <SocialButton color="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" name="Instagram" icon={<InstagramIcon />} onClick={() => handleShare('instagram')} />
            <SocialButton color="bg-gray-500" name="Copiar enlace" icon={<LinkIcon className="w-5 h-5 text-white" />} onClick={() => handleShare('copy')} />
          </div>
        </div>

        {/* Benefits List */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h3 className="text-base font-serif font-bold text-gray-900 mb-4 text-center">Beneficios que puedes obtener</h3>
          <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-center">
            <MiniBenefit icon={<Gift className="w-5 h-5 text-green-600" />} color="bg-green-50" text="Descuentos en viajes" />
            <MiniBenefit icon={<Briefcase className="w-5 h-5 text-blue-600" />} color="bg-blue-50" text="Tours gratuitos" />
            <MiniBenefit icon={<Footprints className="w-5 h-5 text-purple-600" />} color="bg-purple-50" text="Créditos de reserva" />
            <MiniBenefit icon={<Sun className="w-5 h-5 text-yellow-600" />} color="bg-yellow-50" text="Upgrade de hotel" />
            <MiniBenefit icon={<Compass className="w-5 h-5 text-indigo-600" />} color="bg-indigo-50" text="Viajes gratuitos" />
            <MiniBenefit icon={<Trophy className="w-5 h-5 text-orange-600" />} color="bg-orange-50" text="Acceso exclusivo" />
          </div>
        </div>
      </div>

    </div>
  )
}

function SocialButton({ color, name, icon, onClick }: { color: string, name: string, icon: React.ReactNode, onClick?: () => void }) {
  return (
    <button type="button" className="flex flex-col items-center gap-1.5 cursor-pointer outline-none bg-transparent border-none p-0 m-0" onClick={onClick}>
      <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center shadow-sm hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <span className="text-[9px] font-bold text-gray-500">{name}</span>
    </button>
  )
}

function MiniBenefit({ icon, color, text }: { icon: React.ReactNode, color: string, text: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center mb-1.5`}>
        {icon}
      </div>
      <p className="text-[9px] font-bold text-gray-600 max-w-[75px] leading-tight text-center">{text}</p>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  )
}
