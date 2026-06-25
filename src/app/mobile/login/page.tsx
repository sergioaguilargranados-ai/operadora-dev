"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react"

export default function MobileLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { logoUrl, companyName } = useWhiteLabel()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center mb-8">
        <img
          src={logoUrl || "/logo.png"}
          alt={companyName || "AS Operadora"}
          className="h-16 object-contain mb-4"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/logo.png" // Fallback logo
          }}
        />
        <h2 className="text-xl font-bold text-gray-900 text-center">
          Accede a tu Portal Móvil
        </h2>
        <p className="text-sm text-gray-500 text-center mt-1">
          Ingresa tus credenciales corporativas
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 shadow-md border-gray-150 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="empleado@empresa.com"
                  className="pl-10 h-11 focus-visible:ring-primary"
                  required
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-11 focus-visible:ring-primary"
                  required
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-4 text-white bg-[#0066FF] hover:bg-blue-700 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
