"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <PageHeader showBackButton={true} backButtonHref="/" />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Preferencias de Notificaciones</h1>

        <Card className="p-6">
          <p className="text-muted-foreground">Configura tus preferencias de notificación...</p>
        </Card>
      </div>

      {/* Modal de registro si no está autenticado */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regístrate para recibir notificaciones</DialogTitle>
            <DialogDescription>
              Completa tus datos para activar notificaciones
            </DialogDescription>
          </DialogHeader>
          {/* Formulario básico */}
        </DialogContent>
      </Dialog>
    </div>
  )
}
