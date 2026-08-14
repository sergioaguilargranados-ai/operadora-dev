"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/Logo"
import { Building, Mail, Lock, User, Phone, AlertCircle, Loader2, ArrowRight } from "lucide-react"

function RegistroAgenciaForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agencyName: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

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
      const res = await fetch("/api/auth/register-agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Redirigir al login para que entre y el middleware lo mande al onboarding
        router.push("/login?registered_agency=1")
      } else {
        setError(data.error || "Ocurrió un error al registrar la agencia")
      }
    } catch (err) {
      setError("Ocurrió un error de red. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo className="py-2" />
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Ya tengo cuenta
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg p-8 shadow-lg rounded-2xl border-0 ring-1 ring-gray-200">
          <div className="text-center mb-8">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Registra tu Agencia</h1>
            <p className="text-gray-500">
              Crea tu cuenta de Marca Blanca y comienza a vender con tu propia identidad.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Nombre Comercial de la Agencia"
                  value={formData.agencyName}
                  onChange={e => handleChange("agencyName", e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Tu Nombre"
                    value={formData.name}
                    onChange={e => handleChange("name", e.target.value)}
                    className="pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="Teléfono"
                    value={formData.phone}
                    onChange={e => handleChange("phone", e.target.value)}
                    className="pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Correo Electrónico (Usuario)"
                  value={formData.email}
                  onChange={e => handleChange("email", e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={e => handleChange("password", e.target.value)}
                    className="pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Confirmar Contraseña"
                    value={formData.confirmPassword}
                    onChange={e => handleChange("confirmPassword", e.target.value)}
                    className="pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer group">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
              </div>
              <div className="text-sm">
                <span className="text-gray-600">
                  Acepto los <Link href="/legal/terminos" className="text-indigo-600 hover:underline font-medium" target="_blank">términos y condiciones</Link> y la <Link href="/legal/privacidad" className="text-indigo-600 hover:underline font-medium" target="_blank">política de privacidad</Link> de AS Operadora para agencias B2B.
                </span>
              </div>
            </label>

            <Button
              type="submit"
              className="w-full py-6 text-lg rounded-xl flex items-center justify-center gap-2 group"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Comenzar Configuración
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default function RegistroAgenciasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
      <RegistroAgenciaForm />
    </Suspense>
  )
}
