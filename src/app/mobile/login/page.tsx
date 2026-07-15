"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function MobileLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { logoUrl, companyName, logoMobileUrl } = useWhiteLabel()
  // Logo personalizado de agencia: si existe, se muestra como imagen
  const customLogoUrl = logoMobileUrl || logoUrl || null
  
  // State for 2-step login
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  // UI States
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
  // Content / Tenant Config
  const [mobileContent, setMobileContent] = useState<any>(null)
  const [tenantConfig, setTenantConfig] = useState<any>(null)

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

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/mobile/tenant-lookup?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      
      if (data.success && data.data) {
        setTenantConfig(data.data)
        setStep(2)
      } else {
        setError("El correo no está registrado o no está activo.")
      }
    } catch (err) {
      setError("Ocurrió un error al buscar tu cuenta.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const needsTerms = tenantConfig && !tenantConfig.has_accepted_terms && mobileContent?.sections_json?.docs?.terms_url
    if (needsTerms && !acceptedTerms) {
      setError("Debes aceptar los Términos y Condiciones para continuar.")
      return
    }

    setError("")
    setLoading(true)

    try {
      const res = await login(email, password, acceptedTerms)
      if (res && res.success) {
        router.push("/mobile")
      } else {
        setError("Contraseña incorrecta")
      }
    } catch (err) {
      setError("Ocurrió un error. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Determine logos and branding colors based on step
  const finalLogoUrl = mobileContent?.logo_url || logoMobileUrl
    || (step === 2 && tenantConfig?.logo_url ? tenantConfig.logo_url : logoUrl) 
    || "/logo-black.svg"

  const finalCompanyName = step === 2 && tenantConfig?.company_name
    ? tenantConfig.company_name
    : (companyName || "AS Operadora")

  const primaryColor = step === 2 && tenantConfig?.primary_color
    ? tenantConfig.primary_color
    : "#000000"

  const loginBannerUrl = mobileContent?.sections_json?.login_banner_url || ""

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={loginBannerUrl ? { backgroundImage: `url(${loginBannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#ffffff' }}>
      
      {/* Dark overlay if there is a background image */}
      {loginBannerUrl && <div className="absolute inset-0 bg-black/40 z-0"></div>}

      {/* Content Container */}
      <div className={`flex-1 flex flex-col px-6 pt-12 pb-6 relative z-10 ${loginBannerUrl ? 'bg-white/90 backdrop-blur-md m-4 rounded-3xl shadow-xl' : ''}`}>
        
        {step === 2 && (
          <button 
            onClick={() => { setStep(1); setPassword(""); setError(""); }} 
            className="absolute top-6 left-6 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}

        {/* Logo */}
        <div className="flex flex-col items-center mt-6 mb-8 transition-all duration-500">
          <MobileLogo
            variant="dark"
            size="lg"
            logoUrl={customLogoUrl}
          />
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-gray-700">
            {step === 1 ? "Inicia sesión para continuar" : `Ingresando como ${email}`}
          </p>
        </div>

        <form onSubmit={step === 1 ? handleNextStep : handleLogin} className="space-y-5 flex-1">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            /* Step 1: Email */
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
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
          ) : (
            /* Step 2: Password */
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
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
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end pt-3">
                <Link href="/mobile/recuperar" className="text-sm text-gray-700 underline font-medium hover:text-black">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* TÉRMINOS Y CONDICIONES (Solo si es primera vez) */}
              {tenantConfig && !tenantConfig.has_accepted_terms && (
                <div className="mt-6 flex flex-col gap-3 animate-in fade-in duration-300">
                  {mobileContent?.sections_json?.docs?.terms_url && (
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="terms_mobile"
                        className="w-4 h-4 mt-1 accent-black rounded"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                      />
                      <label htmlFor="terms_mobile" className="text-sm text-gray-700">
                        Acepto los <a href={mobileContent.sections_json.docs.terms_url} target="_blank" rel="noopener noreferrer" className="text-[#0066FF] hover:underline font-medium">Términos y Condiciones</a>
                      </label>
                    </div>
                  )}
                  
                  {(mobileContent?.sections_json?.docs?.privacy_url || mobileContent?.sections_json?.docs?.loyalty_url) && (
                    <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      Al iniciar sesión, también aceptas nuestro:
                      <div className="flex flex-col gap-1 mt-1.5">
                        {mobileContent?.sections_json?.docs?.privacy_url && (
                          <a href={mobileContent.sections_json.docs.privacy_url} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black hover:underline flex items-center gap-1">• Aviso de Privacidad</a>
                        )}
                        {mobileContent?.sections_json?.docs?.loyalty_url && (
                          <a href={mobileContent.sections_json.docs.loyalty_url} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black hover:underline flex items-center gap-1">• Programa de Lealtad</a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Submit */}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full h-14 text-white font-medium text-base rounded-xl transition-colors"
              style={{ backgroundColor: primaryColor }}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Cargando...</span>
                </div>
              ) : (
                step === 1 ? "Siguiente" : "Iniciar sesión"
              )}
            </Button>
          </div>
        </form>

        {/* Documentos Oficiales (Movidos a la Fase 2) */}

      </div>

      {/* Bottom Image (Santorini) - aparece en ambos pasos */}
      <div className="h-[25vh] min-h-[200px] w-full relative -mt-4 z-0 animate-in fade-in duration-500">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80" 
          alt="Santorini" 
          className="w-full h-full object-cover object-top"
        />
        
        {/* DEBUG VERSION FOOTER */}
        <div className="absolute bottom-2 left-0 right-0 z-20 text-center">
          <p className="text-[10px] text-white/70 font-mono shadow-sm">v2.362 | Build: {new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'})} CST</p>
        </div>
      </div>
    </div>
  )
}
