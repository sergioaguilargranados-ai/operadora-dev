"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Send,
  Check,
  X,
  Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

interface NotificationPreferences {
  email: boolean
  sms: boolean
  whatsapp: boolean
  enabled: boolean
  emailAddress?: string
  phoneNumber?: string
  whatsappNumber?: string
}

export default function NotificacionesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [isRegistered, setIsRegistered] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Formulario de registro
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Preferencias de notificaciones
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    whatsapp: false,
    enabled: true,
    emailAddress: user?.email || '',
    phoneNumber: '',
    whatsappNumber: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      setShowRegisterModal(true)
      return
    }

    // Usuario autenticado - cargar preferencias
    loadPreferences()
  }, [isAuthenticated])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      // TODO: Cargar desde API
      // const res = await fetch(`/api/notifications/preferences?userId=${user?.id}`)
      // const data = await res.json()

      // Por ahora usar valores por defecto
      setPreferences(prev => ({
        ...prev,
        emailAddress: user?.email || '',
        enabled: true
      }))
      setIsRegistered(true)
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.phone) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor completa todos los campos"
      })
      return
    }

    try {
      setSaving(true)

      // TODO: Enviar a API
      // const res = await fetch('/api/notifications/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(registerForm)
      // })

      // Simular registro exitoso
      await new Promise(resolve => setTimeout(resolve, 1000))

      setPreferences({
        ...preferences,
        emailAddress: registerForm.email,
        phoneNumber: registerForm.phone,
        whatsappNumber: registerForm.phone
      })
      setIsRegistered(true)
      setShowRegisterModal(false)

      toast({
        title: "Registro exitoso",
        description: "¡Bienvenido al sistema de notificaciones!"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo completar el registro"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    try {
      setSaving(true)

      // TODO: Guardar en API
      // const res = await fetch('/api/notifications/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId: user?.id, preferences })
      // })

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 500))

      toast({
        title: "Preferencias guardadas",
        description: "Tus preferencias de notificación han sido actualizadas"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar las preferencias"
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleNotifications = async (enabled: boolean) => {
    setPreferences({ ...preferences, enabled })

    toast({
      title: enabled ? "Notificaciones activadas" : "Notificaciones desactivadas",
      description: enabled
        ? "Recibirás notificaciones según tus preferencias"
        : "No recibirás ninguna notificación"
    })

    // Auto-guardar
    setTimeout(handleSavePreferences, 500)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Notificaciones</h1>
          <p className="text-muted-foreground">
            Configura cómo quieres recibir actualizaciones y alertas
          </p>
        </div>

        {/* Estado de notificaciones */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {preferences.enabled ? (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <BellOff className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  Notificaciones {preferences.enabled ? 'Activadas' : 'Desactivadas'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {preferences.enabled
                    ? 'Recibirás notificaciones según tus preferencias'
                    : 'No estás recibiendo notificaciones'}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={toggleNotifications}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </Card>

        {/* Canales de notificación */}
        {isRegistered && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Canales de Notificación</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Selecciona cómo quieres recibir las notificaciones
            </p>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  id="email"
                  checked={preferences.email}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, email: checked as boolean })
                  }
                  disabled={!preferences.enabled}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <Label htmlFor="email" className="font-medium cursor-pointer">
                      Email
                    </Label>
                    {preferences.email && (
                      <Check className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Recibirás notificaciones por correo electrónico
                  </p>
                  <Input
                    type="email"
                    value={preferences.emailAddress}
                    onChange={(e) =>
                      setPreferences({ ...preferences, emailAddress: e.target.value })
                    }
                    placeholder="tu@email.com"
                    disabled={!preferences.email || !preferences.enabled}
                    className="max-w-md"
                  />
                </div>
              </div>

              {/* SMS */}
              <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  id="sms"
                  checked={preferences.sms}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, sms: checked as boolean })
                  }
                  disabled={!preferences.enabled}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <Label htmlFor="sms" className="font-medium cursor-pointer">
                      SMS
                    </Label>
                    {preferences.sms && (
                      <Check className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Recibirás mensajes de texto a tu teléfono
                  </p>
                  <Input
                    type="tel"
                    value={preferences.phoneNumber}
                    onChange={(e) =>
                      setPreferences({ ...preferences, phoneNumber: e.target.value })
                    }
                    placeholder="+52 55 1234 5678"
                    disabled={!preferences.sms || !preferences.enabled}
                    className="max-w-md"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  id="whatsapp"
                  checked={preferences.whatsapp}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, whatsapp: checked as boolean })
                  }
                  disabled={!preferences.enabled}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Send className="w-5 h-5 text-green-600" />
                    <Label htmlFor="whatsapp" className="font-medium cursor-pointer">
                      WhatsApp
                    </Label>
                    {preferences.whatsapp && (
                      <Check className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Recibirás notificaciones por WhatsApp
                  </p>
                  <Input
                    type="tel"
                    value={preferences.whatsappNumber}
                    onChange={(e) =>
                      setPreferences({ ...preferences, whatsappNumber: e.target.value })
                    }
                    placeholder="+52 55 1234 5678"
                    disabled={!preferences.whatsapp || !preferences.enabled}
                    className="max-w-md"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleSavePreferences}
                disabled={saving || !preferences.enabled}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Preferencias'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Información */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Tipos de Notificaciones</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Confirmaciones de reserva y pagos</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Actualizaciones de itinerario</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Ofertas especiales y promociones</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Recordatorios de viaje</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Alertas de cambios o cancelaciones</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Modal de Registro */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registro para Notificaciones</DialogTitle>
            <DialogDescription>
              Para recibir notificaciones, primero necesitamos tu información de contacto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reg-name">Nombre completo</Label>
              <Input
                id="reg-name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder="juan@example.com"
              />
            </div>

            <div>
              <Label htmlFor="reg-phone">Teléfono</Label>
              <Input
                id="reg-phone"
                type="tel"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                placeholder="+52 55 1234 5678"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegister}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrarme'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

