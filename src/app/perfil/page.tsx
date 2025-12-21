"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PerfilPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [nombre, setNombre] = useState(user?.name || '')
  const [telefono, setTelefono] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [correoCorporativo, setCorreoCorporativo] = useState('')
  const [monedaPreferida, setMonedaPreferida] = useState('MXN')

  // Change password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Implementar API de actualización de perfil
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Cambios guardados",
        description: "Tu perfil ha sido actualizado exitosamente"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los cambios"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Todos los campos son obligatorios"
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden"
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres"
      })
      return
    }

    setChangingPassword(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente"
        })
        setShowPasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "No se pudo cambiar la contraseña"
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al cambiar la contraseña"
      })
    } finally {
      setChangingPassword(false)
    }
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

        <div className="grid gap-6">
          {/* Información Personal */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.role}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre completo</Label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Correo Personal</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="correo-corporativo">Correo Corporativo</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="correo-corporativo"
                    type="email"
                    placeholder="usuario@empresa.com"
                    value={correoCorporativo}
                    onChange={(e) => setCorreoCorporativo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ubicacion">Ubicación</Label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="ubicacion"
                    placeholder="Ciudad, País"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="moneda">Moneda Preferida</Label>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <Select value={monedaPreferida} onValueChange={setMonedaPreferida}>
                    <SelectTrigger id="moneda">
                      <SelectValue placeholder="Selecciona moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                      <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - Libra Esterlina</SelectItem>
                      <SelectItem value="CAD">CAD - Dólar Canadiense</SelectItem>
                      <SelectItem value="JPY">JPY - Yen Japonés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </Card>

          {/* Preferencias */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Preferencias de viaje</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Moneda preferida:</span>
                <span className="font-semibold">{monedaPreferida}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Idioma:</span>
                <span className="font-semibold">Español</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Notificaciones por email:</span>
                <span className="font-semibold">Activadas</span>
              </div>
            </div>
          </Card>

          {/* Seguridad */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Seguridad</h3>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Cambiar contraseña
            </Button>
          </Card>
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña actual y tu nueva contraseña
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="current-password">Contraseña actual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 8 caracteres
              </p>
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordModal(false)
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
              }}
              disabled={changingPassword}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
