"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Lock, Loader2 } from "lucide-react"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function MobileChangePasswordPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { logoUrl, logoDarkUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoDarkUrl || logoMobileUrl || logoUrl || null
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({ title: "Error", description: "Todos los campos son obligatorios", variant: "destructive" })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" })
      return
    }

    if (formData.newPassword.length < 8) {
      toast({ title: "Error", description: "La nueva contraseña debe tener al menos 8 caracteres", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await res.json()

      if (data.success) {
        toast({ title: "¡Actualizada!", description: "Tu contraseña ha sido cambiada correctamente" })
        router.push("/mobile/perfil")
      } else {
        toast({ title: "Error", description: data.error || "No se pudo cambiar la contraseña", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Hubo un problema al procesar tu solicitud", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Dark Header Section */}
      <div className="bg-black text-white px-4 pt-12 pb-24 relative rounded-b-3xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="text-white hover:text-gray-300">
            <ChevronLeft className="w-7 h-7" />
          </button>
          
          <MobileLogo
            variant="light"
            size="md"
            logoUrl={customLogoUrl}
          />

          <div className="w-7"></div> {/* Spacer for centering */}
        </div>

        {/* Title */}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h1 className="text-4xl font-serif mb-2">Contraseña</h1>
            <p className="text-sm text-gray-300 leading-tight">
              Cambia tu contraseña para mantener tu cuenta segura.
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
            <Lock className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Contraseña Actual</Label>
              <Input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña actual"
                className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Nueva Contraseña</Label>
              <Input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Confirmar Nueva Contraseña</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Vuelve a ingresar la nueva contraseña"
                className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl font-bold bg-black text-white hover:bg-gray-800 active:scale-[0.98] transition-all text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Actualizar contraseña"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
