// Build: 21 Jul 2026 - 13:55 CST - v2.426
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { useRouter } from "next/navigation"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { NotificationBell } from "@/components/NotificationBell"
import { 
  User, Briefcase, CreditCard, Users, ShoppingBag, 
  ChevronRight, Bell, Menu, Loader2, Headphones, Trophy, Plane,
  Heart, MapPin, Gift, Calendar, HelpCircle, Globe, Lock, FileText, ShieldCheck, Star, Settings, LogOut, X
} from "lucide-react"

export default function MobileHomePage() {
  const { user, logout } = useAuth()
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

  // Precarga silenciosa de reservas, itinerarios y perfil para soporte offline
  useEffect(() => {
    if (!user?.id) return
    const prefetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const res = await fetch(`/api/bookings?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          const bookings = data.data || []
          bookings.forEach(async (b: any) => {
            try {
              const details = typeof b.special_requests === 'string' ? JSON.parse(b.special_requests) : (b.special_requests || {})
              const tripId = details.tour_id || b.id.toString()
              if (tripId) {
                // Peticiones silenciosas para detonar el cacheado en el Service Worker
                fetch(`/api/itineraries/${tripId}`)
                fetch(`/api/groups/${tripId}`)
              }
            } catch (e) {}
          })
        }
        // Precargar también perfil del usuario y documentos
        fetch(`/api/mobile/profile?user_id=${user.id}&t=${Date.now()}`)
      } catch (err) {
        console.warn("Silent prefetching failed:", err)
      }
    }
    prefetchData()
  }, [user])

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
      route: "/mobile/itinerario/active",
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

          <NotificationBell isWhite={true} />
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
          className="fixed inset-0 bg-black/55 z-40 transition-opacity duration-300"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-[340px] bg-white z-50 transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl overflow-hidden`}
      >
        {/* Encabezado Negro */}
        <div className="bg-black text-white px-5 pt-12 pb-6 relative flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <MobileLogo variant="light" size="sm" logoUrl={customLogoUrl} />
            <button onClick={() => setMenuOpen(false)} className="text-white hover:text-gray-300 p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-gray-900 flex-shrink-0">
              {user?.image ? (
                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <User className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-base truncate notranslate">{user?.name || "Nombre"}</h3>
              <p className="text-xs text-gray-400 truncate">{user?.email || "correo"}</p>
            </div>
          </div>
        </div>

        {/* Lista de Opciones */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-5">
          {[
            {
              title: "VIAJES",
              items: [
                { label: "Mis viajes", icon: <Briefcase className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/itinerario" },
                { label: "Wishlist", icon: <Heart className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/wishlist" },
                { label: "Mapa", icon: <MapPin className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/mapa" },
                { label: "AS Rewards", icon: <Gift className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/rewards" },
                { label: "Pagos", icon: <CreditCard className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/pagos" },
                { label: "Itinerario", icon: <Calendar className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/itinerario/active" },
                { label: "Tienda", icon: <ShoppingBag className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/tienda" },
                { label: "Creo tu grupo", icon: <Users className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/viajes-grupales" },
                { label: "¿Necesitas ayuda?", icon: <HelpCircle className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/ayuda" },
              ]
            },
            {
              title: "CUENTA",
              items: [
                { label: "Idioma", icon: <Globe className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/perfil" },
                { label: "Cambiar contraseña", icon: <Lock className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/perfil/password" },
              ]
            },
            {
              title: "INFORMACIÓN LEGAL",
              items: [
                { label: "Términos y condiciones", icon: <FileText className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, href: mobileContent?.sections_json?.docs?.terms_url || "/legal/terminos" },
                { label: "Aviso de privacidad", icon: <ShieldCheck className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, href: mobileContent?.sections_json?.docs?.privacy_url || "/legal/privacidad" },
                { label: "Programa de lealtad", icon: <Star className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, href: mobileContent?.sections_json?.docs?.loyalty_url || "/legal/lealtad" },
              ]
            },
            {
              title: "CONFIGURACIÓN",
              items: [
                { label: "Configuración", icon: <Settings className="w-5 h-5 text-gray-800" strokeWidth={1.5} />, route: "/mobile/perfil" },
              ]
            }
          ].map((category, catIdx) => (
            <div key={catIdx} className="space-y-1">
              <div className="flex items-center gap-2 px-3 mb-2">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{category.title}</span>
                <div className="flex-1 border-t border-gray-100 mt-0.5" />
              </div>
              
              {category.items.map((item, itemIdx) => {
                const content = (
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-900 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="text-xs font-semibold text-gray-800">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                );

                if (item.href) {
                  return (
                    <a 
                      key={itemIdx} 
                      href={item.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block decoration-none"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div 
                    key={itemIdx}
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(item.route);
                    }}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button 
            onClick={() => {
              logout();
              router.push("/mobile/login");
            }}
            className="w-full bg-black text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
