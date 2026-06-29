"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { useRouter } from "next/navigation"
import { 
  User, Briefcase, CreditCard, Users, ShoppingBag, 
  HelpCircle, ChevronRight, Bell, Menu, Loader2, Headphones, Footprints, Plane
} from "lucide-react"

export default function MobileHomePage() {
  const { user } = useAuth()
  const { logoUrl } = useWhiteLabel()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [mobileContent, setMobileContent] = useState<any>(null)

  useEffect(() => {
    const fetchMobileContent = async () => {
      try {
        const timestamp = new Date().getTime()
        const res = await fetch(`/api/mobile/content?tenant_id=1&t=${timestamp}`, { cache: 'no-store' })
        const data = await res.json()
        if (data.success && data.data) {
          setMobileContent(data.data)
        }
      } catch (err) {
        console.error("Error fetching mobile content", err)
      }
    }
    fetchMobileContent()
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
      </div>
    )
  }

  const name = user?.name?.split(' ')[0] || "Admin AS"
  // Preferimos logoDarkUrl para el banner oscuro, luego el móvil, luego el principal invertido
  const finalLogoUrl = logoDarkUrl || mobileContent?.logo_url || logoUrl || "/logo-white.png"
  const welcomePhrase = mobileContent?.welcome_phrase || "¿Listo para tu próxima experiencia?"

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      
      {/* Banner Principal Fijo en Top */}
      <div className="relative h-72 w-full flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-transparent z-10" />
        <img 
          src={mobileContent?.banner_url || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"} 
          alt="Home Banner" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Top Header */}
        <div className="absolute top-0 w-full px-4 pt-12 pb-4 z-20 flex justify-between items-center">
          <img 
            src={finalLogoUrl} 
            alt="Logo" 
            className={`h-8 object-contain ${!logoDarkUrl ? 'invert' : ''}`} 
            onError={(e) => { 
              const target = e.currentTarget;
              if (!target.src.includes('/icons/icon-192x192.png')) {
                target.src = '/icons/icon-192x192.png'; 
              } else {
                target.style.display = 'none';
              }
            }}
          />
          <button onClick={() => router.push('/mobile/notificaciones')} className="p-2 -mr-2 text-white hover:text-gray-300">
            <Bell className="w-6 h-6" />
          </button>
        </div>

        {/* Hero Text */}
        <div className="absolute bottom-6 left-6 z-20">
          <h1 className="text-3xl font-light text-white mb-1">
            Hola, <span className="font-semibold">{name}</span>
          </h1>
          <p className="text-gray-200 text-sm">{welcomePhrase}</p>
        </div>
      </div>

      {/* Main Menu Cards Container */}
      <div className="bg-white rounded-t-3xl -mt-8 relative z-30 shadow-sm border-t border-gray-100 overflow-hidden px-4 pt-6 pb-8 space-y-3">
        
        {/* Perfil */}
        <div 
          onClick={() => router.push('/mobile/perfil')}
          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer shadow-sm"
        >
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base font-serif">Perfil</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight pr-4">Consulta el detalle de tu viaje, vuelos, hospedaje y actividades.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-black flex-shrink-0" />
        </div>

        {/* Itinerario */}
        <div 
          onClick={() => router.push('/mobile/itinerario')}
          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer shadow-sm"
        >
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base font-serif">Itinerario</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight pr-4">Revisa tus itinerarios, vuelos y detalles de tu viaje.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-black flex-shrink-0" />
        </div>

        {/* Pagos */}
        <div 
          onClick={() => router.push('/mobile/pagos')}
          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer shadow-sm"
        >
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base font-serif">Pagos</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight pr-4">Revisa tus pagos, saldos y métodos de pago.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-black flex-shrink-0" />
        </div>

        {/* Crea tu grupo */}
        <div 
          onClick={() => router.push('/mobile/viajes-grupales')}
          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer shadow-sm"
        >
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base font-serif">Crea tu grupo</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight pr-4">Invita amigos, acumula beneficios y gana descuentos para tus próximos viajes.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-black flex-shrink-0" />
        </div>

        {/* Tienda */}
        <div 
          onClick={() => router.push('/mobile/tienda')}
          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer shadow-sm"
        >
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base font-serif">Tienda</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight pr-4">Descubre productos y servicios para tu viaje.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-black flex-shrink-0" />
        </div>

        {/* Reto 10,000 pasos */}
        <div 
          onClick={() => router.push('/mobile/rewards')}
          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer shadow-sm mt-2"
        >
          <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="22" className="stroke-gray-100" strokeWidth="4" fill="transparent" />
              <circle cx="24" cy="24" r="22" className="stroke-green-500" strokeWidth="4" fill="transparent" strokeDasharray="138" strokeDashoffset="124.2" strokeLinecap="round" />
            </svg>
            <Footprints className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base font-serif">Reto 10,000 pasos</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight pr-4">¡Sigue acumulando pasos y alcanza tu meta diaria!</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-green-600 text-sm">1,000 / 10,000</p>
            <p className="text-[10px] text-gray-900 font-bold mt-0.5">10% completado</p>
          </div>
        </div>

        {/* ¿Necesitas ayuda? */}
        <div 
          onClick={() => router.push('/mobile/ayuda')}
          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer shadow-sm mt-2"
        >
          <div className="w-12 h-12 border border-gray-200 text-black rounded-full flex items-center justify-center flex-shrink-0">
            <Headphones className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base font-serif">¿Necesitas ayuda?</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight pr-4">Nuestro equipo está listo para asesorarte en todo momento.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-black flex-shrink-0" />
        </div>

      </div>
    </div>
  )
}
