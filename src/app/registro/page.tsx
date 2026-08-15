// Build: 15 Aug 2026 - v2.485
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle, Ticket, ArrowLeft } from "lucide-react"

function RegistroFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useAuth()
  const { companyName } = useWhiteLabel()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: searchParams.get('ref') || ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  useEffect(() => {
    const errParam = searchParams.get('error')
    if (errParam === 'config_missing' || errParam === 'google_not_configured') {
      setError("Configuración de Google no disponible. Contacta al administrador.")
    } else if (errParam === 'oauth_cancelled') {
      setError("Registro con Google cancelado.")
    } else if (errParam === 'token_exchange_failed' || errParam === 'user_info_failed') {
      setError("No se pudo completar el registro con Google. Intenta nuevamente.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones")
      return
    }

    setLoading(true)

    try {
      const success = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
        formData.referralCode
      )

      if (success) {
        router.push("/")
      } else {
        setError("Este correo electrónico ya está registrado")
      }
    } catch (err) {
      setError("Ocurrió un error. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = () => {
    setOauthLoading('google')
    setError("")

    try {
      const redirectUri = `${window.location.origin}/api/auth/google/callback`
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

      if (clientId) {
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`
        window.location.href = googleAuthUrl
        return
      }

      window.location.href = '/api/auth/google'
    } catch (err) {
      setError("Error al conectar con Google")
      setOauthLoading(null)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Logo className="py-2" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8 relative">
          <button 
            onClick={() => router.push('/')}
            className="mb-4 text-gray-500 hover:text-black flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Únete a {companyName || 'AS Rewards'}</h1>
            <p className="text-muted-foreground">
              Crea tu cuenta y comienza a disfrutar beneficios exclusivos
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Beneficios */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-sm mb-2 text-blue-900">
              Beneficios de {companyName || 'AS Rewards'}:
            </h3>
            <ul className="space-y-1.5 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Descuentos exclusivos en hoteles
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Acumulación de puntos por reservas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Ofertas anticipadas
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Juan Pérez"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Correo electrónico *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Teléfono (opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Código de invitación (opcional)
              </label>
              <div className="relative">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ej. AS-12-ABCD"
                  className="pl-10 uppercase"
                  value={formData.referralCode}
                  onChange={(e) => handleChange('referralCode', e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirmar contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Repite tu contraseña"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-1 accent-primary cursor-pointer"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                Acepto los{" "}
                <Link href="/legal/terminos" className="text-[#0066FF] hover:underline">
                  términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/legal/privacidad" className="text-[#0066FF] hover:underline">
                  política de privacidad
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-white font-semibold transition-colors duration-300"
              style={{ backgroundColor: 'var(--brand-primary, #0066FF)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-primary-hover, #0052CC)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-primary, #0066FF)'
              }}
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="text-[#0066FF] font-semibold hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              ¿Eres agencia, empresa o proveedor?{" "}
              <Link
                href="/registro-leads"
                className="text-[#0066FF] font-medium hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-center text-muted-foreground mb-4">
              O regístrate con
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleRegister}
              disabled={oauthLoading !== null || loading}
            >
              {oauthLoading === 'google' ? (
                <>
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>}>
      <RegistroFormContent />
    </Suspense>
  )
}
