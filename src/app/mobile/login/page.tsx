"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function MobileLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { logoUrl, companyName } = useWhiteLabel()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/mobile")
      } else {
        setError("Email o contraseña incorrectos")
      }
    } catch (err) {
      setError("Ocurrió un error. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Usar los del CMS Móvil si existen, si no, caer a la marca blanca
  const finalLogoUrl = mobileContent?.logo_url || logoUrl || "/logo.png"
  const loginBannerUrl = mobileContent?.sections_json?.login_banner_url || ""

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={loginBannerUrl ? { backgroundImage: `url(${loginBannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#ffffff' }}>
      
      {/* Dark overlay if there is a background image */}
      {loginBannerUrl && <div className="absolute inset-0 bg-black/40 z-0"></div>}

      {/* Content Container */}
      <div className={`flex-1 flex flex-col px-6 pt-12 pb-6 relative z-10 ${loginBannerUrl ? 'bg-white/90 backdrop-blur-md m-4 rounded-3xl shadow-xl' : ''}`}>
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={finalLogoUrl}
            alt={companyName || "AS Operadora"}
            className="h-20 object-contain mb-4"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/icons/icon-192x192.png";
            }}
          />
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-gray-700">
            Inicia sesión para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 flex-1">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                className="pl-11 h-12 rounded-xl border-gray-200 focus-visible:ring-black text-base placeholder:text-gray-400 shadow-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="pl-11 pr-11 h-12 rounded-xl border-gray-200 focus-visible:ring-black text-base placeholder:text-gray-400 shadow-sm"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Link href="/mobile/recuperar" className="text-sm text-gray-700 underline font-medium">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Terms */}
          <div className="mt-8 flex flex-col items-center gap-3 text-xs text-gray-500">
            {mobileContent?.sections_json?.docs?.terms_url ? (
              <a href={mobileContent.sections_json.docs.terms_url} target="_blank" rel="noreferrer" className="hover:text-gray-800 transition-colors">
                Términos y Condiciones
              </a>
            ) : (
              <Link href="#" className="hover:text-gray-800 transition-colors">Términos y Condiciones</Link>
            )}
            
            <div className="flex gap-4">
              {mobileContent?.sections_json?.docs?.privacy_url ? (
                <a href={mobileContent.sections_json.docs.privacy_url} target="_blank" rel="noreferrer" className="hover:text-gray-800 transition-colors">
                  Aviso de Privacidad
                </a>
              ) : (
                <Link href="#" className="hover:text-gray-800 transition-colors">Aviso de Privacidad</Link>
              )}
              
              {mobileContent?.sections_json?.docs?.loyalty_url ? (
                <a href={mobileContent.sections_json.docs.loyalty_url} target="_blank" rel="noreferrer" className="hover:text-gray-800 transition-colors">
                  Programa de Lealtad
                </a>
              ) : (
                <Link href="#" className="hover:text-gray-800 transition-colors">Programa de Lealtad</Link>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full h-14 bg-black hover:bg-gray-900 text-white font-medium text-base rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Iniciando...</span>
                </div>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </div>
        </form>

        {/* Documentos Oficiales */}
        {(mobileContent?.sections_json?.docs?.terms_url || mobileContent?.sections_json?.docs?.privacy_url || mobileContent?.sections_json?.docs?.loyalty_url) && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Documentos Oficiales</h4>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
              {mobileContent?.sections_json?.docs?.terms_url && (
                <a href={mobileContent?.sections_json?.docs?.terms_url} target="_blank" rel="noopener noreferrer" className="text-[#0066FF] hover:underline flex items-center gap-1">
                  Términos y Condiciones
                </a>
              )}
              {mobileContent?.sections_json?.docs?.privacy_url && (
                <a href={mobileContent?.sections_json?.docs?.privacy_url} target="_blank" rel="noopener noreferrer" className="text-[#0066FF] hover:underline flex items-center gap-1">
                  Aviso de Privacidad
                </a>
              )}
              {mobileContent?.sections_json?.docs?.loyalty_url && (
                <a href={mobileContent?.sections_json?.docs?.loyalty_url} target="_blank" rel="noopener noreferrer" className="text-[#0066FF] hover:underline flex items-center gap-1">
                  Programa de Lealtad
                </a>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Image (Santorini) */}
      <div className="h-[25vh] min-h-[200px] w-full relative -mt-4 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80" 
          alt="Santorini" 
          className="w-full h-full object-cover object-top"
        />
      </div>
    </div>
  )
}
