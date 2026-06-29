"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Save, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface EmergencyContact {
  name: string
  phone: string
  relation: string
}

export default function MobileProfileEditPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date_of_birth: '',
    wants_travel_insurance: false,
    emergency_contacts: [] as EmergencyContact[]
  })

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/mobile/profile?user_id=${user?.id}`)
      const data = await res.json()
      if (data.success) {
        const p = data.data
        let dob = ''
        if (p.date_of_birth) {
          // Format Date to YYYY-MM-DD for input type="date"
          const d = new Date(p.date_of_birth)
          dob = d.toISOString().split('T')[0]
        }
        
        setFormData({
          name: p.name || '',
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
        router.back()
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
      emergency_contacts: [...prev.emergency_contacts, { name: '', phone: '', relation: '' }]
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
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-900 hover:bg-gray-50 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Editar Perfil</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Form */}
      <div className="px-4 pt-6 space-y-6 max-w-lg mx-auto">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight ml-1">Datos Personales</h2>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  value={formData.date_of_birth} 
                  onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Teléfono</label>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
                  placeholder="Tu teléfono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight ml-1">Seguro de Viajero</h2>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Solicitar Seguro</h3>
                <p className="text-xs text-gray-500 mt-1">¿Deseas que un agente te asista para adquirirlo?</p>
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
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Contactos de Emergencia</h2>
              <button 
                type="button" 
                onClick={addEmergencyContact}
                className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700"
              >
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>

            <div className="space-y-3">
              {formData.emergency_contacts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No has agregado contactos de emergencia.</p>
              )}
              {formData.emergency_contacts.map((contact, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4 relative group">
                  <button 
                    type="button"
                    onClick={() => removeEmergencyContact(idx)}
                    className="absolute top-4 right-4 text-red-500 p-2 bg-red-50 rounded-full hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="pr-10">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nombre</label>
                    <input 
                      type="text" 
                      value={contact.name} 
                      onChange={e => updateEmergencyContact(idx, 'name', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
                      placeholder="Nombre del contacto"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Parentesco</label>
                      <input 
                        type="text" 
                        value={contact.relation} 
                        onChange={e => updateEmergencyContact(idx, 'relation', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
                        placeholder="Ej: Hermano"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Teléfono</label>
                      <input 
                        type="tel" 
                        value={contact.phone} 
                        onChange={e => updateEmergencyContact(idx, 'phone', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
                        placeholder="Teléfono"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 pb-12">
            <Button 
              type="submit" 
              disabled={saving}
              className="w-full h-14 bg-black hover:bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base transition-colors"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>

    </div>
  )
}
