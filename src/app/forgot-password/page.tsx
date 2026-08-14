"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email || !email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage("Te hemos enviado un correo con el enlace para restablecer tu contraseña. Por favor revisa tu bandeja de entrada y carpeta de spam.")
      } else {
        setError(data.error || "Ocurrió un error al procesar tu solicitud. Intenta nuevamente.")
      }
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente más tarde.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <Card className="p-8 w-full max-w-md shadow-lg border-gray-100">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-gray-600 hover:text-gray-900 p-0 hover:bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />Volver
        </Button>

        <h1 className="text-2xl font-bold mb-2 text-gray-900">Recuperar Contraseña</h1>
        <p className="text-sm text-gray-600 mb-6">
          Ingresa tu correo electrónico registrado para enviarte un enlace de restablecimiento.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 text-green-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>

            <Button
              className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium py-3 rounded-lg"
              onClick={() => router.push("/login")}
            >
              Volver al inicio de sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-base transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando enlace...
                </span>
              ) : (
                "Enviar enlace de recuperación"
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
