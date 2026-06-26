"use client"

import { useState } from "react"
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

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Content Container */}
      <div className="flex-1 flex flex-col px-6 pt-12 pb-6 relative z-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logoUrl || "/logo.png"}
            alt={companyName || "AS Operadora"}
            className="h-20 object-contain mb-4"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/logo.png" // Fallback logo
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
          <div className="flex items-start gap-3 mt-8">
            <ShieldCheck className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-600 leading-tight">
              Al continuar, declaras que leíste y aceptas nuestros <a href="#" className="underline font-medium">términos y condiciones</a>, <a href="#" className="underline font-medium">aviso de privacidad</a> y los <a href="#" className="underline font-medium">términos del programa de lealtad</a>.
            </p>
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
