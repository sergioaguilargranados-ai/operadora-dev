"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { useRouter } from "next/navigation"
import { 
  User, Briefcase, CreditCard, Users, ShoppingBag, 
  HelpCircle, ChevronRight, Bell, Menu, Loader2, Headphones, Footprints 
} from "lucide-react"

export default function MobileHomePage() {
  const { user } = useAuth()
  const { logoUrl } = useWhiteLabel()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false) // Fake loading just to not break existing flow

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
      </div>
    )
  }

  const name = user?.name?.split(' ')[0] || "Admin AS"

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      
      {/* Hero Header */}
      <div className="relative h-[280px] w-full">
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-transparent z-10" />
        
        {/* Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80" 
          alt="Airplane wing over clouds" 
          className="w-full h-full object-cover"
        />
        
        {/* Top Navbar */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-6 z-20 flex justify-between items-center text-white">
          <button className="p-2 -ml-2 text-white hover:text-gray-300">
            <Menu className="w-6 h-6" />
          </button>
          <img 
            src={logoUrl || "/logo-white.png"} 
            alt="AS Operadora" 
            className="h-8 invert" 
            onError={(e) => (e.currentTarget.src = '/logo.png')} 
          />
          <button className="p-2 -mr-2 text-white hover:text-gray-300">
            <Bell className="w-6 h-6" />
          </button>
        </div>

        {/* Hero Text */}
        <div className="absolute bottom-16 left-6 right-6 z-20 text-white">
          <h1 className="text-3xl font-serif font-bold mb-2 drop-shadow-md">
            Hola, {name} ✈️
          </h1>
          <p className="text-sm text-gray-200 max-w-[200px] leading-relaxed drop-shadow-md">
            ¿Listo para tu próxima experiencia?
          </p>
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
