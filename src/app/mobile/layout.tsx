"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { useRouter, usePathname } from "next/navigation"
import { Loader2, Home, Compass, User, LogOut } from "lucide-react"
import Link from "next/link"

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
      const res = await fetch(`/api/mobile/content?tenant_id=${tenantId}`)
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

  if (loading || (fetchingContent && !isLoginPage)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative border-x border-gray-200 overflow-hidden pb-16">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Bottom Tab Bar (Visible only when authenticated and not in login) */}
        {isAuthenticated && !isLoginPage && (
          <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center px-4 z-40">
            <Link href="/mobile" className={`flex flex-col items-center gap-1 ${pathname === "/mobile" ? "text-primary font-semibold" : "text-gray-400"}`}>
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Inicio</span>
            </Link>
            <Link href="/mobile/tienda" className={`flex flex-col items-center gap-1 ${pathname.startsWith("/mobile/tienda") ? "text-primary font-semibold" : "text-gray-400"}`}>
              <Compass className="w-5 h-5" />
              <span className="text-[10px]">Tienda</span>
            </Link>
            <Link href="/mobile/mapa" className={`flex flex-col items-center gap-1 ${pathname.startsWith("/mobile/mapa") ? "text-primary font-semibold" : "text-gray-400"}`}>
              <User className="w-5 h-5" />
              <span className="text-[10px]">Mapa</span>
            </Link>
            <button onClick={() => { logout(); router.push("/mobile/login"); }} className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-[10px]">Salir</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  )
}
