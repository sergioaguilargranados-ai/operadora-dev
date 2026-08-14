"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

function ResetPasswordFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verifying, setVerifying] = useState(true)
  const [validToken, setValidToken] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setVerifying(false)
      setValidToken(false)
      setError("Token de recuperación no encontrado. Por favor solicita un nuevo enlace.")
      return
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
        const data = await res.json()

        if (data.success && data.valid) {
          setValidToken(true)
          setUserEmail(data.email || "")
        } else if (data.expired) {
          setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.")
        } else if (data.used) {
          setError("Este enlace de recuperación ya ha sido utilizado.")
        } else {
          setError("Token de recuperación inválido.")
        }
      } catch (err) {
        setError("Error al verificar el token de recuperación.")
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || "No se pudo restablecer la contraseña.")
      }
    } catch (err) {
      setError("Error al procesar la solicitud.")
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 w-full max-w-md text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0066FF] mb-4" />
          <p className="text-gray-600">Verificando enlace de recuperación...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <Card className="p-8 w-full max-w-md shadow-lg border-gray-100">
        <Button variant="ghost" onClick={() => router.push("/login")} className="mb-4 text-gray-600 hover:text-gray-900 p-0 hover:bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />Volver al inicio de sesión
        </Button>

        <h1 className="text-2xl font-bold mb-2 text-gray-900">Restablecer Contraseña</h1>
        {userEmail && <p className="text-sm text-gray-600 mb-6">Para la cuenta: <strong>{userEmail}</strong></p>}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              {!validToken && (
                <Link href="/forgot-password" className="text-[#0066FF] font-semibold hover:underline block mt-2">
                  Solicitar un nuevo enlace
                </Link>
              )}
            </div>
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 text-green-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.</span>
            </div>

            <Button
              className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium py-3 rounded-lg"
              onClick={() => router.push("/login")}
            >
              Iniciar sesión
            </Button>
          </div>
        ) : (
          validToken && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Nueva contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Confirmar nueva contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite la contraseña"
                    className="pl-10 h-12"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold text-base transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando nueva contraseña...
                  </span>
                ) : (
                  "Guardar nueva contraseña"
                )}
              </Button>
            </form>
          )
        )}
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>}>
      <ResetPasswordFormContent />
    </Suspense>
  )
}
