"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Save, Loader2, Plus, Trash2, User, Users, Shield, Phone, Mail, Calendar, HeartPulse, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface EmergencyContact {
  name: string
  phone: string
  relation: string
}

function MobileProfileEditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get('section') || searchParams.get('tab') || 'datos'
  
  const { user } = useAuth()
  const { toast } = useToast()

  const [activeSection, setActiveSection] = useState<'datos' | 'contactos' | 'seguro' | 'todos'>(
    (sectionParam as any) || 'datos'
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    wants_travel_insurance: false,
    emergency_contacts: [] as EmergencyContact[]
  })

  useEffect(() => {
    if (sectionParam && ['datos', 'contactos', 'seguro', 'todos'].includes(sectionParam)) {
      setActiveSection(sectionParam as any)
    }
  }, [sectionParam])

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/mobile/profile?user_id=${user?.id}&t=${Date.now()}`)
      const data = await res.json()
      if (data.success) {
        const p = data.data
        let dob = ''
        if (p.date_of_birth) {
          const d = new Date(p.date_of_birth)
          dob = d.toISOString().split('T')[0]
        }
        
        setFormData({
          name: p.name || '',
          email: p.email || user?.email || '',
          phone: p.phone || '',
          date_of_birth: dob,
          wants_travel_insurance: p.wants_travel_insurance || false,
          emergency_contacts: p.emergency_contacts || []
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await fetch('/api/mobile/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: user?.id, 
          ...formData 
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Perfil actualizado', description: 'Tus datos han sido guardados correctamente' })
        router.push('/mobile/perfil')
        router.refresh()
      } else {
        toast({ title: 'Error', description: 'Error al actualizar', variant: 'destructive' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Error', description: 'Error al actualizar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergency_contacts: [
        ...prev.emergency_contacts, 
        { name: '', phone: '', relation: 'Familiar directo' }
      ]
    }))
  }

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setFormData(prev => {
      const updated = [...prev.emergency_contacts]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, emergency_contacts: updated }
    })
  }

  const removeEmergencyContact = (index: number) => {
    setFormData(prev => {
      const updated = [...prev.emergency_contacts]
      updated.splice(index, 1)
      return { ...prev, emergency_contacts: updated }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      
      {/* Header Fijo */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button 
          onClick={() => router.push('/mobile/perfil')} 
          className="p-2 -ml-2 text-gray-900 hover:bg-gray-50 rounded-full active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Editar Perfil</h1>
        <div className="w-10"></div>
      </div>

      {/* Selector de Sección Superior (Pestañas Rápidas) */}
      <div className="px-4 pt-4 max-w-lg mx-auto">
        <div className="flex bg-gray-200/80 p-1 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveSection('datos')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'datos'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Datos
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('contactos')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'contactos'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Contactos
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('seguro')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'seguro'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Seguro
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('todos')}
            className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
              activeSection === 'todos'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Formulario Principal */}
      <div className="px-4 pt-5 space-y-6 max-w-lg mx-auto">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* SECCIÓN 1: DATOS PERSONALES */}
          {(activeSection === 'datos' || activeSection === 'todos') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-1">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Datos Personales</h2>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Nombre Completo *
                  </label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Correo Electrónico *
                  </label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input 
                    type="date" 
                    value={formData.date_of_birth} 
                    onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Teléfono
                  </label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                    placeholder="+52 55 1234 5678"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: CONTACTOS DE EMERGENCIA */}
          {(activeSection === 'contactos' || activeSection === 'todos') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                    <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Contactos de Emergencia</h2>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={addEmergencyContact}
                  className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-gray-800 shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Contacto
                </button>
              </div>

              <p className="text-xs text-gray-500 ml-1 leading-relaxed">
                Personas a contactar en caso de cualquier urgencia médica o eventualidad durante tus viajes.
              </p>

              <div className="space-y-3">
                {formData.emergency_contacts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center space-y-3">
                    <Users className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-500 font-medium">Aún no has registrado contactos de emergencia.</p>
                    <Button
                      type="button"
                      onClick={addEmergencyContact}
                      size="sm"
                      className="bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Registrar Primer Contacto
                    </Button>
                  </div>
                ) : (
                  formData.emergency_contacts.map((contact, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4 relative">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                        <span className="text-xs font-bold text-gray-900">
                          Contacto #{idx + 1}
                        </span>
                        <button 
                          type="button"
                          onClick={() => removeEmergencyContact(idx)}
                          className="text-red-500 p-1.5 bg-red-50 rounded-lg hover:bg-red-100 active:scale-95 transition-all"
                          title="Eliminar contacto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                          Nombre Completo *
                        </label>
                        <input 
                          type="text" 
                          value={contact.name} 
                          onChange={e => updateEmergencyContact(idx, 'name', e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                          placeholder="Nombre del familiar o persona de confianza"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Parentesco / Relación
                          </label>
                          <select
                            value={contact.relation}
                            onChange={e => updateEmergencyContact(idx, 'relation', e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-xl px-3 py-2.5 text-xs md:text-sm font-medium outline-none focus:ring-2 focus:ring-black cursor-pointer"
                          >
                            <option value="Familiar directo">Familiar directo (Padre/Madre/Hijo)</option>
                            <option value="Cónyuge">Cónyuge / Pareja</option>
                            <option value="Hermano(a)">Hermano(a)</option>
                            <option value="Amigo(a)">Amigo(a)</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Teléfono con WhatsApp *
                          </label>
                          <input 
                            type="tel" 
                            value={contact.phone} 
                            onChange={e => updateEmergencyContact(idx, 'phone', e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                            placeholder="+52 55 1234 5678"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: SEGURO DE VIAJERO */}
          {(activeSection === 'seguro' || activeSection === 'todos') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-1">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Seguro de Viajero</h2>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Interés en Seguro Internacional</h3>
                    <p className="text-xs text-gray-500 mt-0.5">¿Deseas asistencia para cotizar tu seguro médico?</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.wants_travel_insurance}
                      onChange={e => setFormData({ ...formData, wants_travel_insurance: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Cotiza y emite tu póliza al instante:</span>
                  <Button
                    type="button"
                    onClick={() => window.open('/seguros', '_blank')}
                    size="sm"
                    className="bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold px-4"
                  >
                    Ir al Cotizador
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Botón Guardar Cambios */}
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={saving}
              className="w-full h-14 bg-black hover:bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base shadow-md active:scale-[0.99] transition-all"
            >
              {saving ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-1" /> Guardando datos...</>
              ) : (
                <><Save className="w-5 h-5 mr-1" /> Guardar Cambios</>
              )}
            </Button>
          </div>
        </form>
      </div>

    </div>
  )
}

export default function MobileProfileEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <MobileProfileEditContent />
    </Suspense>
  )
}
