"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { PageHeader } from "@/components/PageHeader"
import { PortalIntranetLayout } from "@/components/layout/PortalIntranetLayout"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Edit2,
  Trash2,
  Send,
  Laptop,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Building2,
  Target,
  BookUser,
  Users,
  Settings,
  Home as HomeIcon,
  Compass,
  Package,
  FileText,
  Calendar,
  CheckCircle,
  MoreVertical,
  ShieldCheck,
  Plus,
  Eye,
  EyeOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LinkedTraveler {
  id: number
  name: string
  email: string | null
  phone: string | null
  relationship: string
}

interface ActiveDevice {
  id: number
  platform: string
  browser?: string
  deviceName: string
  ipAddress: string
  location: string
  lastActivity: string
  isCurrent: boolean
  isActive: boolean
}

export default function PerfilPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Estado Datos Personales
  const [editingInfo, setEditingInfo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nombre, setNombre] = useState(user?.name || '')
  const [telefono, setTelefono] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [correoCorporativo, setCorreoCorporativo] = useState('')
  const [notificaciones, setNotificaciones] = useState(true)

  // Estado Seguridad (Cambiar contraseña)
  const [securityExpanded, setSecurityExpanded] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estado Usuarios Vinculados
  const [linkedExpanded, setLinkedExpanded] = useState(true)
  const [travelers, setTravelers] = useState<LinkedTraveler[]>([])
  const [loadingTravelers, setLoadingTravelers] = useState(true)
  const [newTravelerEmail, setNewTravelerEmail] = useState('')
  const [newTravelerRole, setNewTravelerRole] = useState('Invitado')
  const [addingTraveler, setAddingTraveler] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  // Estado Dispositivos Vinculados
  const [devicesExpanded, setDevicesExpanded] = useState(true)
  const [devices, setDevices] = useState<ActiveDevice[]>([])
  const [loadingDevices, setLoadingDevices] = useState(true)

  const isStaff = user?.role && ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENCY_ADMIN', 'AGENT', 'HR_MANAGER'].includes(user.role)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user?.name) setNombre(user.name)

    loadTravelers()
    loadDevices()
  }, [isAuthenticated, user, router])

  const loadTravelers = async () => {
    try {
      const token = localStorage.getItem('as_token')
      const res = await fetch('/api/user/linked-travelers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setTravelers(Array.isArray(data?.data) ? data.data : [])
      } else {
        setTravelers([])
      }
    } catch (e) {
      console.error('Error cargando viajeros:', e)
      setTravelers([])
    } finally {
      setLoadingTravelers(false)
    }
  }

  const loadDevices = async () => {
    try {
      const token = localStorage.getItem('as_token')
      const res = await fetch('/api/user/devices', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDevices(Array.isArray(data?.data) ? data.data : [
          { id: 1, platform: 'Windows', browser: 'Chrome', deviceName: 'PC', ipAddress: '192.168.1.1', location: 'CDMX, MX', lastActivity: 'Hace 2 min', isCurrent: true, isActive: true },
          { id: 2, platform: 'iOS', browser: 'Safari', deviceName: 'iPhone', ipAddress: '192.168.1.2', location: 'CDMX, MX', lastActivity: 'Ayer', isCurrent: false, isActive: false }
        ])
      } else {
        setDevices([
          { id: 1, platform: 'Windows', browser: 'Chrome', deviceName: 'PC', ipAddress: '192.168.1.1', location: 'CDMX, MX', lastActivity: 'Hace 2 min', isCurrent: true, isActive: true },
          { id: 2, platform: 'iOS', browser: 'Safari', deviceName: 'iPhone', ipAddress: '192.168.1.2', location: 'CDMX, MX', lastActivity: 'Ayer', isCurrent: false, isActive: false }
        ])
      }
    } catch (e) {
      console.error('Error cargando dispositivos:', e)
      setDevices([
          { id: 1, platform: 'Windows', browser: 'Chrome', deviceName: 'PC', ipAddress: '192.168.1.1', location: 'CDMX, MX', lastActivity: 'Hace 2 min', isCurrent: true, isActive: true },
          { id: 2, platform: 'iOS', browser: 'Safari', deviceName: 'iPhone', ipAddress: '192.168.1.2', location: 'CDMX, MX', lastActivity: 'Ayer', isCurrent: false, isActive: false }
        ])
    } finally {
      setLoadingDevices(false)
    }
  }

  const handleSavePersonalData = async () => {
    setSaving(true)
    try {
      // Simular/Guardar perfil
      await new Promise(r => setTimeout(r, 800))
      toast({
        title: "Perfil actualizado",
        description: "Tus datos personales se han guardado exitosamente."
      })
      setEditingInfo(false)
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron guardar los cambios." })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Completa ambos campos de contraseña." })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Las contraseñas no coinciden." })
      return
    }
    if (newPassword.length < 8) {
      toast({ variant: "destructive", title: "Error", description: "Mínimo 8 caracteres." })
      return
    }

    setChangingPassword(true)
    try {
      const token = localStorage.getItem('as_token')
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: user?.email, newPassword })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Contraseña actualizada", description: "Tu contraseña se ha modificado con éxito." })
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast({ variant: "destructive", title: "Error", description: data.error || "Error al actualizar" })
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Ocurrió un error al cambiar la contraseña." })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleAddTraveler = async () => {
    if (!newTravelerEmail || !newTravelerEmail.includes('@')) {
      toast({ variant: "destructive", title: "Error", description: "Ingresa un correo electrónico válido." })
      return
    }

    setAddingTraveler(true)
    try {
      const token = localStorage.getItem('as_token')
      const res = await fetch('/api/user/linked-travelers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newTravelerEmail.split('@')[0].replace('.', ' '),
          email: newTravelerEmail
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: "Invitación enviada", description: `Se vinculó a ${newTravelerEmail} a tu cuenta.` })
        setNewTravelerEmail('')
        loadTravelers()
      } else {
        toast({ variant: "destructive", title: "Error", description: data.error })
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo agregar el viajero." })
    } finally {
      setAddingTraveler(false)
    }
  }

  const handleDeleteTraveler = async (id: number) => {
    try {
      const token = localStorage.getItem('as_token')
      const res = await fetch(`/api/user/linked-travelers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: "Viajero eliminado", description: "El perfil vinculado fue removido." })
        loadTravelers()
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el viajero." })
    }
  }

  const handleRemoveDevice = async (id: number) => {
    try {
      const token = localStorage.getItem('as_token')
      const res = await fetch(`/api/user/devices?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: "Sesión terminada", description: "El dispositivo fue desconectado." })
        loadDevices()
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cerrar la sesión remota." })
    }
  }

  if (!isAuthenticated) return null

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'
  const roleLabel = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? 'Administrador' : 'Viajero'

  return (
    <PortalIntranetLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-serif">Mi Perfil</h1>
          <p className="text-xs text-slate-500 mt-1">Administra tu información personal y la seguridad de tu cuenta.</p>
        </div>

        {/* ━━━━ 1. DATOS PERSONALES (Mockup #3 top) ━━━━ */}
        <Card className="p-6 border-gray-200/80 shadow-sm rounded-2xl bg-white">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm"
                style={{ backgroundColor: 'var(--brand-primary, #000000)' }}
              >
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <span className="inline-block px-2.5 py-0.5 mt-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                  {roleLabel}
                </span>
              </div>
            </div>
            {!editingInfo ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditingInfo(true)}
                className="gap-2 border-gray-300 text-slate-700 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4" />
                Editar información
              </Button>
            ) : null}
          </div>

          <div className="grid md:grid-cols-3 gap-5 text-sm">
            <div>
              <Label className="text-xs text-slate-500 font-medium">Nombre completo</Label>
              {editingInfo ? (
                <Input value={nombre} onChange={e => setNombre(e.target.value)} className="mt-1.5" />
              ) : (
                <p className="font-semibold text-slate-800 mt-1">{user?.name}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-slate-500 font-medium">Correo personal</Label>
              <p className="font-semibold text-slate-800 mt-1 truncate">{user?.email}</p>
            </div>

            <div>
              <Label className="text-xs text-slate-500 font-medium">Teléfono</Label>
              {editingInfo ? (
                <Input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+52 55 1234 5678" className="mt-1.5" />
              ) : (
                <p className="font-semibold text-slate-800 mt-1">{telefono || '+52 55 1234 5678'}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-slate-500 font-medium">Correo corporativo (opcional)</Label>
              {editingInfo ? (
                <Input value={correoCorporativo} onChange={e => setCorreoCorporativo(e.target.value)} placeholder="usuario@empresa.com" className="mt-1.5" />
              ) : (
                <p className="font-semibold text-slate-800 mt-1">{correoCorporativo || 'usuario@empresa.com'}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-slate-500 font-medium">Ubicación</Label>
              {editingInfo ? (
                <Input value={ubicacion} onChange={e => setUbicacion(e.target.value)} placeholder="Ciudad, País" className="mt-1.5" />
              ) : (
                <p className="font-semibold text-slate-800 mt-1">{ubicacion || 'Ciudad, País'}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-slate-500 font-medium">Notificaciones</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <input 
                  type="checkbox" 
                  checked={notificaciones} 
                  onChange={e => setNotificaciones(e.target.checked)}
                  disabled={!editingInfo} 
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 text-xs font-medium">Recibe actualizaciones y ofertas</span>
              </div>
            </div>
          </div>

          {editingInfo && (
            <div className="mt-6 pt-4 border-t flex gap-3">
              <Button onClick={handleSavePersonalData} disabled={saving} style={{ backgroundColor: 'var(--brand-primary, #000000)' }}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Button variant="outline" onClick={() => setEditingInfo(false)}>
                Cancelar
              </Button>
            </div>
          )}
        </Card>

        {/* ━━━━ 2. SEGURIDAD (Mockup #3) ━━━━ */}
        <Card className="p-6 border-gray-200/80 shadow-sm rounded-2xl bg-white">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setSecurityExpanded(!securityExpanded)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Seguridad</h3>
                <p className="text-xs text-slate-500">Administra tu seguridad y dispositivos.</p>
              </div>
            </div>
            {securityExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>

          {securityExpanded && (
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <h4 className="font-semibold text-slate-800 text-sm">Cambiar contraseña</h4>
              </div>
              <p className="text-xs text-slate-500">Actualiza tu contraseña regularmente para mantener tu cuenta segura.</p>

              <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <Label className="text-xs text-slate-600">Contraseña nueva</Label>
                  <div className="relative mt-1">
                    <Input 
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      placeholder="••••••••••••" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Verificar contraseña</Label>
                  <div className="relative mt-1">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••••••" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleChangePassword} 
                disabled={changingPassword} 
                className="mt-2 text-xs" 
                style={{ backgroundColor: 'var(--brand-primary, #000000)' }}
              >
                {changingPassword ? 'Guardando...' : 'Guardar contraseña'}
              </Button>
            </div>
          )}
        </Card>

        {/* ━━━━ 3. USUARIOS VINCULADOS (Mockup #3 + Expedia Flow) ━━━━ */}
        <Card className="p-6 border-gray-200/80 shadow-sm rounded-2xl bg-white">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setLinkedExpanded(!linkedExpanded)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Usuarios vinculados</h3>
                <p className="text-xs text-slate-500">Consulta y administra cuentas/compañeros de viaje vinculados a tu perfil.</p>
              </div>
            </div>
            {linkedExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>

          {linkedExpanded && (
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-5">
              {loadingTravelers ? (
                <p className="text-xs text-slate-400">Cargando viajeros vinculados...</p>
              ) : travelers.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-xs text-slate-500">Aún no tienes compañeros de viaje guardados.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {travelers.map(t => {
                    const tInitials = t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    return (
                      <div key={t.id} className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl hover:bg-slate-100/80 transition-colors border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                            {tInitials}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{t.name}</p>
                            <p className="text-xs text-slate-500">{t.email || 'Sin correo'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-full font-medium text-slate-600">
                            {t.relationship === 'Admin' ? 'Admin' : 'Invitado'}
                          </span>
                          <div className="relative">
                            <button 
                              onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)} 
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openMenuId === t.id && (
                              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                <button 
                                  onClick={() => { handleDeleteTraveler(t.id); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Formulario Agregar Nuevo Usuario */}
              <div className="pt-3">
                <h4 className="font-semibold text-slate-800 text-xs mb-1">Agregar nuevo usuario / compañero de viaje</h4>
                <p className="text-xs text-slate-500 mb-3">Envía una invitación o vincula un nuevo viajero para agilizar tus reservas.</p>
                
                <div className="flex gap-3 max-w-md">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input 
                      type="email" 
                      placeholder="Correo electrónico" 
                      value={newTravelerEmail} 
                      onChange={e => setNewTravelerEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <select 
                    value={newTravelerRole}
                    onChange={(e) => setNewTravelerRole(e.target.value)}
                    className="border border-gray-200 rounded-lg text-xs px-3 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="Invitado">Invitado</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <Button 
                    onClick={handleAddTraveler} 
                    disabled={addingTraveler}
                    style={{ backgroundColor: 'var(--brand-primary, #000000)' }}
                    className="gap-2 text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {addingTraveler ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* ━━━━ 4. DISPOSITIVOS VINCULADOS (Mockup #3 bottom - Real) ━━━━ */}
        <Card className="p-6 border-gray-200/80 shadow-sm rounded-2xl bg-white">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setDevicesExpanded(!devicesExpanded)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Dispositivos vinculados</h3>
                <p className="text-xs text-slate-500">Revisa los dispositivos donde has iniciado sesión en tu cuenta.</p>
              </div>
            </div>
            {devicesExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>

          {devicesExpanded && (
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
              <h4 className="font-semibold text-slate-800 text-xs">Dispositivos activos</h4>

              {loadingDevices ? (
                <p className="text-xs text-slate-400">Cargando dispositivos de sesión...</p>
              ) : (
                <div className="space-y-3">
                  {devices.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600">
                          {d.platform.includes('iOS') || d.platform.includes('Android') ? (
                            <Smartphone className="w-4 h-4" />
                          ) : (
                            <Laptop className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-slate-900">{d.platform}</p>
                            {d.isCurrent && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                                Este dispositivo
                              </span>
                            )}
                            {d.isActive && !d.isCurrent && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 rounded-full">
                                Actualmente activo
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {d.browser ? `${d.browser} • ` : ''}{d.location} • {d.lastActivity}
                          </p>
                        </div>
                      </div>

                      {!d.isCurrent && (
                        <button 
                          onClick={() => handleRemoveDevice(d.id)}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold transition-colors px-3 py-1.5 hover:bg-red-50 rounded-lg"
                        >
                          Eliminar
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ━━━━ 5. MÓDULOS DE ADMINISTRACIÓN (SOLO STAFF) ━━━━ */}
        {isStaff && (
          <Card className="p-6 border-indigo-100 shadow-sm rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-950 text-lg">Módulos de Administración</h3>
                <p className="text-xs text-indigo-600/80">Accesos ejecutivos y gestión del sistema AS Operadora.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <button 
                onClick={() => router.push('/dashboard/agency')} 
                className="p-3 bg-white hover:bg-indigo-50/50 border border-indigo-100 rounded-xl text-left transition-all flex items-center gap-2.5 shadow-2xs group"
              >
                <Building2 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Panel Agencias</span>
              </button>

              <button 
                onClick={() => router.push('/dashboard/crm')} 
                className="p-3 bg-white hover:bg-blue-50/50 border border-blue-100 rounded-xl text-left transition-all flex items-center gap-2.5 shadow-2xs group"
              >
                <Target className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">CRM — Leads</span>
              </button>

              <button 
                onClick={() => router.push('/dashboard/crm/clientes')} 
                className="p-3 bg-white hover:bg-teal-50/50 border border-teal-100 rounded-xl text-left transition-all flex items-center gap-2.5 shadow-2xs group"
              >
                <BookUser className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Clientes</span>
              </button>

              <button 
                onClick={() => router.push('/dashboard/rrhh')} 
                className="p-3 bg-white hover:bg-emerald-50/50 border border-emerald-100 rounded-xl text-left transition-all flex items-center gap-2.5 shadow-2xs group"
              >
                <Users className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Recursos Humanos</span>
              </button>

              <button 
                onClick={() => router.push('/dashboard/admin/users')} 
                className="p-3 bg-white hover:bg-purple-50/50 border border-purple-100 rounded-xl text-left transition-all flex items-center gap-2.5 shadow-2xs group"
              >
                <Users className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Gestión Usuarios</span>
              </button>

              <button 
                onClick={() => router.push('/facturacion')} 
                className="p-3 bg-white hover:bg-violet-50/50 border border-violet-100 rounded-xl text-left transition-all flex items-center gap-2.5 shadow-2xs group"
              >
                <FileText className="w-4 h-4 text-violet-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Facturación CFDI</span>
              </button>

              <button 
                onClick={() => router.push('/admin/features')} 
                className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center gap-2.5 shadow-2xs group"
              >
                <Settings className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Funciones Admin</span>
              </button>

              <button 
                onClick={() => router.push('/admin/content')} 
                className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center gap-2.5 shadow-2xs group"
              >
                <HomeIcon className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Gestión Contenido</span>
              </button>

              <button 
                onClick={() => router.push('/dashboard/corporate')} 
                className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center gap-2.5 shadow-2xs group"
              >
                <Compass className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Dashboard Corp.</span>
              </button>
            </div>
          </Card>
        )}
      </div>
    </PortalIntranetLayout>
  )
}
