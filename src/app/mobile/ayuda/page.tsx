"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Search, MapPin, Signpost, Calendar, Briefcase, HelpCircle, Headphones, ChevronRight, PhoneCall, Loader2, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export default function MobileHelpPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  
  const [helpPhone, setHelpPhone] = useState("+521234567890")
  const [isContacting, setIsContacting] = useState(false)
  const [contactMessage, setContactMessage] = useState("")

  useEffect(() => {
    fetch('/api/mobile/content')
      .then(r => r.json())
      .then(data => {
        if(data.success && data.data?.help_phone) setHelpPhone(data.data.help_phone)
      })
      .catch(() => {})
  }, [])

  const handleContactCallCenter = () => {
    setIsContacting(true)
    setContactMessage("En breve le contactan para brindarle ayuda.")
    
    const name = user?.first_name || user?.name || 'Cliente'
    const phone = user?.phone || ''
    const msg = encodeURIComponent(`Hola, soy ${name}${phone ? ` (Tel: ${phone})` : ''}. Solicito ayuda del Call Center.`)
    
    setTimeout(() => {
      setIsContacting(false)
      window.open(`https://wa.me/${helpPhone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank')
    }, 2500)
  }

  const handleLostItinerary = async () => {
    if (!user) {
      router.push('/mobile/itinerario')
      return
    }
    try {
      const res = await fetch(`/api/mobile/itinerary/today?userId=${user.id}`)
      const data = await res.json()
      if (data.success && data.tour_id) {
        router.push(`/mobile/itinerario/${data.tour_id}/dia/${data.dayIndex}`)
      } else {
        router.push('/mobile/itinerario')
      }
    } catch (e) {
      router.push('/mobile/itinerario')
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-6 border-b border-gray-100 flex flex-col items-center sticky top-0 z-20">
        <div className="w-full flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="text-gray-900 hover:text-gray-600">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <img src="/logo.png" alt="AS Operadora" className="h-10 object-contain" />
          <div className="w-7 h-7" /> {/* Spacer */}
        </div>

        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">¿Necesitas ayuda?</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">Selecciona el tema que mejor describe tu situación.</p>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Buscar ayuda..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-xl border-gray-200 focus-visible:ring-black text-base placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        <h2 className="text-lg font-serif font-bold text-gray-900">Preguntas frecuentes</h2>

        {/* FAQ List */}
        <div className="space-y-4">
          
          <div 
            onClick={() => router.push('/mobile/mapa')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">Estoy perdido</h3>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Abre el mapa para ubicarte en tiempo real y ver tu ubicación.</p>
            </div>
            <div className="w-20 h-16 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 relative">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="Mapa" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#0066FF] rounded-full border-2 border-white shadow-sm" />
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Signpost className="w-6 h-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">¿No sé qué actividades hacer?</h3>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Descubre actividades, atracciones y recomendaciones cerca de ti.</p>
            </div>
            <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="Actividades" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

          <div 
            onClick={handleLostItinerary}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">Perdí mi tour o traslado</h3>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Consulta tu itinerario completo, puntos de reunión y próximos horarios.</p>
            </div>
            <div className="w-20 h-16 rounded-xl bg-gray-50 border border-gray-200 p-2 flex flex-col justify-center flex-shrink-0">
              <p className="text-[7px] text-gray-400 font-bold uppercase mb-1">Próxima actividad</p>
              <div className="flex items-center gap-1 mb-0.5">
                <MapPin className="w-2 h-2 text-gray-600" />
                <span className="text-[8px] font-bold">Tour a Oia</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-2 h-2 text-gray-600" />
                <span className="text-[7px] text-gray-500">08:30 AM</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

          <div 
            onClick={() => router.push('/mobile/ayuda/equipaje')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">Problemas con mi equipaje</h3>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Reporta, rastrea o consulta el estatus de tu equipaje.</p>
            </div>
            <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="Equipaje" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">Otra duda</h3>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Encuentra respuestas a otras preguntas frecuentes.</p>
            </div>
            <div className="w-20 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-white font-bold text-sm">?</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

        </div>

        {/* Contact Bottom Card */}
        <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 mt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">¿Necesitas más ayuda?</h3>
              <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                Nuestro equipo de atención al cliente está listo para ayudarte con vuelos, hoteles y más.
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-white">
              <Headphones className="w-6 h-6 text-gray-900" />
            </div>
          </div>

          {contactMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-800 font-medium">{contactMessage}</p>
            </div>
          )}

          <Button 
            onClick={handleContactCallCenter}
            disabled={isContacting}
            className="w-full bg-black hover:bg-gray-900 text-white font-medium h-12 rounded-xl text-base flex items-center justify-center gap-2"
          >
            {isContacting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Conectando...</>
            ) : (
              <><PhoneCall className="w-5 h-5" /> Contactar a Call Center</>
            )}
          </Button>
          
          <div className="text-center mt-3">
            <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" /> Horario de atención: 24/7
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
