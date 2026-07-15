"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { CartProvider } from "@/contexts/CartContext"
import { useRouter, usePathname } from "next/navigation"
import { Loader2, Home, Briefcase, Heart, MapPin, Gift, LogOut } from "lucide-react"
import Link from "next/link"
import { OfflineBanner } from "@/components/ui/OfflineBanner"

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const { logoUrl, companyName, primaryColor } = useWhiteLabel()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileContent, setMobileContent] = useState<any>(null)
  const [fetchingContent, setFetchingContent] = useState(true)

  const isLoginPage = pathname === "/mobile/login"

  // Proteger rutas (excepto login)
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !isLoginPage) {
        router.push("/mobile/login")
      } else if (isAuthenticated && isLoginPage) {
        router.push("/mobile")
      }
    }
  }, [isAuthenticated, loading, isLoginPage])

  // Cargar contenido específico de móvil por Tenant
  useEffect(() => {
    if (user?.tenant_id) {
      fetchMobileContent(user.tenant_id)
    } else {
      fetchMobileContent(1) // Default tenant
    }
  }, [user])

  const fetchMobileContent = async (tenantId: number) => {
    try {
      const timestamp = new Date().getTime()
      const res = await fetch(`/api/mobile/content?tenant_id=${tenantId}&t=${timestamp}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        setMobileContent(data.data)
      }
    } catch (error) {
      console.error("Error loading mobile PWA content:", error)
    } finally {
      setFetchingContent(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
      </div>
    )
  }

  // If we are on login, we don't care about fetchingContent blocking the view.
  if (fetchingContent && !isLoginPage && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <CartProvider>
        <OfflineBanner />
        {/* Mobile Frame Container */}
        <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative border-x border-gray-200 overflow-hidden pb-16">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto pb-16 flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            {/* Versión al final del contenido (scrollable) */}
            {isAuthenticated && !isLoginPage && (
              <div className="w-full text-center py-4 opacity-70">
                <span className="text-[8px] text-gray-400">v2.405 | 15 Jul 2026 00:43 CST | AS Operadora viajes y eventos</span>
              </div>
            )}
          </main>

          {/* Bottom Tab Bar (Visible only when authenticated and not in login) */}
          {isAuthenticated && !isLoginPage && (
            <nav className="fixed bottom-0 max-w-md mx-auto w-full bg-white/80 backdrop-blur-lg border-t border-gray-200 z-50 flex flex-col justify-between pt-2 pb-2">
              <div className="flex justify-around items-center px-4 w-full">
                <Link href="/mobile" className={`flex flex-col items-center gap-1 ${pathname === "/mobile" ? "text-yellow-500 font-semibold" : "text-gray-400"}`}>
                  <Home className="w-5 h-5" />
                  <span className="text-[10px]">Inicio</span>
                </Link>
                <Link href="/mobile/itinerario" className={`flex flex-col items-center gap-1 ${pathname.startsWith("/mobile/itinerario") ? "text-yellow-500 font-semibold" : "text-gray-400"}`}>
                  <Briefcase className="w-5 h-5" />
                  <span className="text-[10px]">Mis viajes</span>
                </Link>
                <Link href="/mobile/wishlist" className={`flex flex-col items-center gap-1 ${pathname.startsWith("/mobile/wishlist") ? "text-yellow-500 font-semibold" : "text-gray-400"}`}>
                  <Heart className="w-5 h-5" />
                  <span className="text-[10px]">Wishlist</span>
                </Link>
                <Link href="/mobile/mapa" className={`flex flex-col items-center gap-1 ${pathname.startsWith("/mobile/mapa") ? "text-yellow-500 font-semibold" : "text-gray-400"}`}>
                  <MapPin className="w-5 h-5" />
                  <span className="text-[10px]">Mapa</span>
                </Link>
                <Link href="/mobile/rewards" className={`flex flex-col items-center gap-1 ${pathname.startsWith("/mobile/rewards") ? "text-yellow-500 font-semibold" : "text-gray-400"}`}>
                  <Gift className="w-5 h-5" />
                  <span className="text-[10px]">AS Rewards</span>
                </Link>
              </div>
            </nav>
          )}
        </div>
      </CartProvider>
    </div>
  )
}
