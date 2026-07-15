"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { useRouter } from "next/navigation"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { 
  User, Briefcase, CreditCard, Users, ShoppingBag, 
  ChevronRight, Bell, Menu, Loader2, Headphones, Trophy, Plane
} from "lucide-react"

export default function MobileHomePage() {
  const { user } = useAuth()
  const { logoUrl, logoDarkUrl, logoMobileUrl } = useWhiteLabel()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [mobileContent, setMobileContent] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const name = user?.name?.split(' ')[0] || "Viajero"
  const customLogoUrl = logoMobileUrl || logoUrl || null
  const welcomePhrase = mobileContent?.welcome_phrase || "¿Listo para tu próxima experiencia?"

  const menuItems = [
    {
      icon: <User className="w-6 h-6" strokeWidth={1.5} />,
      title: "Perfil",
      desc: "Consulta el detalle de tu viaje, vuelos, hospedaje y actividades.",
      route: "/mobile/perfil",
    },
    {
      icon: <Briefcase className="w-6 h-6" strokeWidth={1.5} />,
      title: "Itinerario",
      desc: "Revisa tus itinerarios, vuelos y detalles de tu viaje.",
      route: "/mobile/itinerario",
    },
    {
      icon: <CreditCard className="w-6 h-6" strokeWidth={1.5} />,
      title: "Pagos",
      desc: "Revisa tus pagos, saldos y métodos de pago.",
      route: "/mobile/pagos",
    },
    {
      icon: <Users className="w-6 h-6" strokeWidth={1.5} />,
      title: "Crea tu grupo",
      desc: "Invita amigos, acumula beneficios y gana descuentos para tus próximos viajes.",
      route: "/mobile/viajes-grupales",
    },
    {
      icon: <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />,
      title: "Tienda",
      desc: "Descubre productos y servicios para tu viaje.",
      route: "/mobile/tienda",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5] pb-24 font-sans">
      
      {/* Banner Principal */}
      <div className="relative w-full flex-shrink-0" style={{ height: '280px' }}>
        {/* Imagen de fondo */}
        <img 
          src={mobileContent?.banner_url || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"} 
          alt="Home Banner" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/55 z-10" />
        
        {/* Top Header: hamburguesa | logo centrado | campana */}
        <div className="absolute top-0 w-full px-4 pt-12 z-20 flex justify-between items-start">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 -ml-1 text-white hover:text-gray-300 flex-shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Logo centrado */}
          <div className="flex-1 flex justify-center">
            <MobileLogo
              variant="light"
              size="md"
              logoUrl={customLogoUrl}
            />
          </div>

          <button 
            onClick={() => router.push('/mobile/notificaciones')} 
            className="p-2 -mr-1 text-white hover:text-gray-300 flex-shrink-0"
          >
            <Bell className="w-6 h-6" />
          </button>
        </div>

        {/* Hero Text */}
        <div className="absolute bottom-8 left-6 z-20">
          <h1 className="text-3xl font-light text-white mb-1 flex items-center gap-2">
            Hola, <span className="font-semibold notranslate">{name}</span>
            <Plane className="w-6 h-6 text-white" strokeWidth={1.5} />
          </h1>
          <p className="text-gray-200 text-sm">{welcomePhrase}</p>
        </div>
      </div>

      {/* Main Menu Container — rounded top, un solo panel blanco con separadores */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-30 overflow-hidden">

        {/* Items principales con separadores sutiles */}
        <div className="divide-y divide-gray-100">
          {menuItems.map((item, i) => (
            <div
              key={i}
              onClick={() => router.push(item.route)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-[15px]">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight pr-4">{item.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* AS Retos */}
        <div
          onClick={() => router.push('/mobile/rewards')}
          className="flex items-center gap-4 px-5 py-4 border-t border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-yellow-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-[15px]">AS Retos</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight pr-4">¡Vive los retos, ten una mejor experiencia en tu viaje y gana premios!</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>

        {/* ¿Necesitas ayuda? */}
        <div
          onClick={() => router.push('/mobile/ayuda')}
          className="flex items-center gap-4 px-5 py-4 border-t border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 border-2 border-gray-200 text-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
            <Headphones className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-[15px]">¿Necesitas ayuda?</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight pr-4">Nuestro equipo está listo para asesorarte en todo momento.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>

        {/* Espacio inferior */}
        <div className="h-6" />
      </div>
      
      {/* Side Menu Drawer */}
      {/* Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl`}
      >
        <div className="p-6 border-b border-gray-100 flex flex-col items-center pt-12 bg-gray-50">
          <MobileLogo variant="dark" size="sm" logoUrl={customLogoUrl} />
          <h2 className="mt-4 font-semibold text-gray-900">Hola, <span className="notranslate">{name}</span></h2>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div 
            onClick={() => router.push('/mobile/perfil')}
            className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <User className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Mi Perfil</span>
          </div>
          <div 
            onClick={() => router.push('/mobile/itinerario')}
            className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Briefcase className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Mis Viajes</span>
          </div>
          <div 
            onClick={() => router.push('/mobile/rewards')}
            className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-medium text-sm">AS Rewards</span>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
           <div 
            onClick={() => router.push('/mobile/ayuda')}
            className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer mb-2"
          >
            <Headphones className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Soporte</span>
          </div>
        </div>
      </div>
    </div>
  )
}
