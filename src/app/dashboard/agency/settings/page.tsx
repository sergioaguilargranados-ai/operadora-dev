"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, Building2, Phone, Mail, UploadCloud, PaintBucket, Loader2, Save, FileText, CheckCircle2, AlertCircle, Trash2, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface AgencySettings {
  id: number
  company_name: string
  legal_name: string
  address: string
  legal_representative: string
  b2b_agent_number: string
  support_email: string
  support_phone: string
  support_whatsapp: string
  logo_url: string
  mobile_logo_url: string
  logo_dark_url: string
  primary_color: string
  secondary_color: string
  accent_color: string
  slogan: string
  custom_domain: string
  documents: any[]
  
  // Apariencia
  favicon_url?: string
  font_family?: string
  bg_color?: string
  custom_email?: string
  use_custom_email?: boolean

  // AS AI
  ai_model?: string
  ai_prompt?: string
  ai_language?: string
  ai_timezone?: string
}

const MORAL_DOCS = [
  { id: 'acta', name: 'Acta Constitutiva', desc: 'Copia completa certificada con sello del RPP' },
  { id: 'poder', name: 'Poder Notarial del Representante', desc: 'Poder para actos de administración o dominio' },
  { id: 'csf', name: 'Constancia de Situación Fiscal (RFC)', desc: 'Emitida por el SAT con antigüedad menor a 3 meses' },
  { id: 'ine', name: 'Identificación Oficial del Representante Legal', desc: 'INE vigente o Pasaporte mexicano' },
  { id: 'domicilio', name: 'Comprobante de Domicilio Fiscal', desc: 'Luz, agua o teléfono no mayor a 3 meses' },
]

const FISICA_DOCS = [
  { id: 'ine', name: 'Identificación Oficial (INE / Pasaporte)', desc: 'Vigente por ambos lados' },
  { id: 'csf', name: 'Constancia de Situación Fiscal (RFC)', desc: 'Emitida por el SAT no mayor a 3 meses' },
  { id: 'domicilio', name: 'Comprobante de Domicilio', desc: 'CFE, agua o telefonía fija no mayor a 3 meses' },
]

export default function AgencySettingsPage() {
  const { user } = useAuth()
  const agencyId = (user as any)?.tenant_id || (user as any)?.agency_id || 1
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<AgencySettings>>({})
  const [activeTab, setActiveTab] = useState('general') // general, contact, branding, documents
  const [personType, setPersonType] = useState<'moral' | 'fisica'>('moral')

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null)
  const logoDarkInputRef = useRef<HTMLInputElement>(null)
  const mobileLogoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [agencyId])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/agency/settings?tenant_id=${agencyId}`)
      const data = await res.json()
      if (data.success && data.data) {
        setFormData(data.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/agency/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: formData.id || agencyId
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Configuración guardada', description: 'Los cambios se han actualizado correctamente en el sistema.' })
      } else {
        toast({ title: 'Error al guardar', description: data.error || 'Ocurrió un error', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error de red al guardar configuración', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof AgencySettings, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Subida real a Vercel Blob / uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof AgencySettings) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingField(field)
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      uploadForm.append('folder', 'branding')

      const res = await fetch('/api/upload/blob', {
        method: 'POST',
        body: uploadForm
      })

      const data = await res.json()
      if (data.success && data.url) {
        handleInputChange(field, data.url)
        toast({ title: 'Archivo subido', description: `${file.name} guardado correctamente.` })
      } else {
        toast({ title: 'Error al subir', description: data.error || 'No se pudo subir la imagen', variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Error de conexión', variant: 'destructive' })
    } finally {
      setUploadingField(null)
      if (e.target) e.target.value = ''
    }
  }

  // Subida real de Documentos Legales
  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedDocType) return

    try {
      setUploadingField(selectedDocType)
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      uploadForm.append('folder', 'legal_docs')

      const uploadRes = await fetch('/api/upload/blob', {
        method: 'POST',
        body: uploadForm
      })
      const uploadData = await uploadRes.json()

      if (!uploadData.success || !uploadData.url) {
        throw new Error(uploadData.error || 'Error al subir archivo a Blob')
      }

      // Registrar en entity_documents
      const docRes = await fetch('/api/agency/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId: formData.id || agencyId,
          documentType: selectedDocType,
          documentName: file.name,
          documentUrl: uploadData.url,
          status: 'uploaded'
        })
      })

      const docData = await docRes.json()
      if (docData.success) {
        toast({ title: 'Documento registrado', description: `${file.name} guardado en el expediente legal.` })
        fetchSettings()
      } else {
        throw new Error(docData.error || 'Error al vincular documento')
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Error al subir documento', variant: 'destructive' })
    } finally {
      setUploadingField(null)
      setSelectedDocType(null)
      if (e.target) e.target.value = ''
    }
  }

  const triggerDocUpload = (docType: string) => {
    setSelectedDocType(docType)
    docInputRef.current?.click()
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Cargando configuración de agencia...</p>
      </div>
    )
  }

  const currentDocsList = personType === 'moral' ? MORAL_DOCS : FISICA_DOCS

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hidden file inputs */}
      <input type="file" ref={logoInputRef} onChange={e => handleFileUpload(e, 'logo_url')} accept="image/*" className="hidden" />
      <input type="file" ref={logoDarkInputRef} onChange={e => handleFileUpload(e, 'logo_dark_url')} accept="image/*" className="hidden" />
      <input type="file" ref={mobileLogoInputRef} onChange={e => handleFileUpload(e, 'mobile_logo_url')} accept="image/*" className="hidden" />
      <input type="file" ref={faviconInputRef} onChange={e => handleFileUpload(e, 'favicon_url')} accept="image/*" className="hidden" />
      <input type="file" ref={docInputRef} onChange={handleDocFileChange} accept=".pdf,image/*" className="hidden" />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Configuración de la Agencia</h1>
              <p className="text-xs text-slate-500">Ajustes generales, marca blanca, expediente legal y contacto</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Menú */}
          <div className="col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === 'general' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              <Building2 className="w-4 h-4" /> Datos Generales
            </button>
            <button 
              onClick={() => setActiveTab('contact')}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === 'contact' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              <Phone className="w-4 h-4" /> Contacto Público
            </button>
            <button 
              onClick={() => setActiveTab('branding')}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === 'branding' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              <PaintBucket className="w-4 h-4" /> Apariencia
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === 'documents' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              <FileText className="w-4 h-4" /> Expediente Legal
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === 'ai' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              <Loader2 className="w-4 h-4" /> AS AI
            </button>
            <button 
              onClick={() => setActiveTab('subscription')}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === 'subscription' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              <CheckCircle2 className="w-4 h-4" /> Suscripción
            </button>
            <button 
              onClick={() => setActiveTab('payments')}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === 'payments' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              <Save className="w-4 h-4" /> Pagos
            </button>
          </div>

          {/* Contenido Principal */}
          <Card className="col-span-1 md:col-span-3 p-6 bg-white shadow-sm border-slate-200 min-h-[520px] flex flex-col justify-between">
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Información Corporativa</h2>
                  <p className="text-xs text-slate-500">Datos fiscales y constitutivos registrados ante AS Operadora.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Comercial</label>
                    <input type="text" value={formData.company_name || ''} onChange={e => handleInputChange('company_name', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Razón Social</label>
                    <input type="text" value={formData.legal_name || ''} onChange={e => handleInputChange('legal_name', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Agente B2B</label>
                    <input type="text" value={formData.b2b_agent_number || ''} onChange={e => handleInputChange('b2b_agent_number', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Representante Legal</label>
                    <input type="text" value={formData.legal_representative || ''} onChange={e => handleInputChange('legal_representative', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Domicilio Fiscal Completo</label>
                    <textarea value={formData.address || ''} onChange={e => handleInputChange('address', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" rows={3}></textarea>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Datos Públicos de Atención al Cliente</h2>
                  <p className="text-xs text-slate-500">Esta información se mostrará en el footer y confirmaciones de tus clientes.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Eslogan de la Agencia</label>
                    <input type="text" value={formData.slogan || ''} onChange={e => handleInputChange('slogan', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" placeholder="Ej. El viaje de tus sueños comienza aquí" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico de Atención</label>
                    <input type="email" value={formData.support_email || ''} onChange={e => handleInputChange('support_email', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Fijo / Oficina</label>
                    <input type="text" value={formData.support_phone || ''} onChange={e => handleInputChange('support_phone', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp de Atención Rápida</label>
                    <input type="text" value={formData.support_whatsapp || ''} onChange={e => handleInputChange('support_whatsapp', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" placeholder="+52 55 1234 5678" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dominio Personalizado (CNAME)</label>
                    <input type="text" value={formData.custom_domain || ''} onChange={e => handleInputChange('custom_domain', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" placeholder="viajes.miagencia.com" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'branding' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Identidad Visual & Marca Blanca</h2>
                  <p className="text-xs text-slate-500">Sube tus logotipos oficiales para personalizar el portal web y app móvil.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Logo Claro */}
                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-white shadow-sm">
                    <p className="text-xs font-bold text-slate-700 mb-2">Logo Web (Fondo Claro)</p>
                    <div className="h-20 w-full flex items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo Claro" className="max-h-16 max-w-full object-contain" />
                      ) : (
                        <UploadCloud className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={uploadingField === 'logo_url'}
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full text-xs"
                    >
                      {uploadingField === 'logo_url' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                      {formData.logo_url ? 'Cambiar Logo' : 'Subir Archivo'}
                    </Button>
                  </div>

                  {/* Logo Oscuro */}
                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-white shadow-sm">
                    <p className="text-xs font-bold text-slate-700 mb-2">Logo Modo Oscuro / Header</p>
                    <div className="h-20 w-full flex items-center justify-center p-2 bg-slate-900 rounded-lg border border-slate-800 mb-3">
                      {formData.logo_dark_url ? (
                        <img src={formData.logo_dark_url} alt="Logo Oscuro" className="max-h-16 max-w-full object-contain" />
                      ) : (
                        <UploadCloud className="w-8 h-8 text-slate-600" />
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={uploadingField === 'logo_dark_url'}
                      onClick={() => logoDarkInputRef.current?.click()}
                      className="w-full text-xs"
                    >
                      {uploadingField === 'logo_dark_url' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                      {formData.logo_dark_url ? 'Cambiar Logo' : 'Subir Archivo'}
                    </Button>
                  </div>

                  {/* Icono Móvil */}
                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-white shadow-sm">
                    <p className="text-xs font-bold text-slate-700 mb-2">Icono App Móvil (1:1)</p>
                    <div className="h-20 w-full flex items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                      {formData.mobile_logo_url ? (
                        <img src={formData.mobile_logo_url} alt="Logo Móvil" className="max-h-16 max-w-full object-contain" />
                      ) : (
                        <UploadCloud className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={uploadingField === 'mobile_logo_url'}
                      onClick={() => mobileLogoInputRef.current?.click()}
                      className="w-full text-xs"
                    >
                      {uploadingField === 'mobile_logo_url' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                      {formData.mobile_logo_url ? 'Cambiar Icono' : 'Subir Archivo'}
                    </Button>
                  </div>

                  {/* Favicon */}
                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-white shadow-sm">
                    <p className="text-xs font-bold text-slate-700 mb-2">Favicon (32x32)</p>
                    <div className="h-20 w-full flex items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                      {formData.favicon_url ? (
                        <img src={formData.favicon_url} alt="Favicon" className="max-h-12 max-w-full object-contain" />
                      ) : (
                        <UploadCloud className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={uploadingField === 'favicon_url'}
                      onClick={() => faviconInputRef.current?.click()}
                      className="w-full text-xs"
                    >
                      {uploadingField === 'favicon_url' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                      {formData.favicon_url ? 'Cambiar Favicon' : 'Subir Archivo'}
                    </Button>
                  </div>
                </div>

                {/* Colores de Marca */}
                <div className="pt-2">
                  <h3 className="font-semibold text-sm text-slate-800 mb-3">Colores Principales</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Primario</p>
                        <p className="text-[11px] text-slate-400">Botones</p>
                      </div>
                      <input type="color" value={formData.primary_color || '#2563eb'} onChange={e => handleInputChange('primary_color', e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Secundario</p>
                        <p className="text-[11px] text-slate-400">Headers</p>
                      </div>
                      <input type="color" value={formData.secondary_color || '#1e293b'} onChange={e => handleInputChange('secondary_color', e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Acento</p>
                        <p className="text-[11px] text-slate-400">Insignias</p>
                      </div>
                      <input type="color" value={formData.accent_color || '#f59e0b'} onChange={e => handleInputChange('accent_color', e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Fondo</p>
                        <p className="text-[11px] text-slate-400">Background</p>
                      </div>
                      <input type="color" value={formData.bg_color || '#f8fafc'} onChange={e => handleInputChange('bg_color', e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Tipografía */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Tipografía Principal</label>
                    <select 
                      value={formData.font_family || 'Inter'} 
                      onChange={e => handleInputChange('font_family', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                      style={{ fontFamily: formData.font_family || 'Inter' }}
                    >
                      <option value="Inter">Inter (Predeterminada)</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Lato">Lato</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1" style={{ fontFamily: formData.font_family || 'Inter' }}>La tipografía actual se ve así.</p>
                  </div>

                  {/* Correo Personalizado */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Correo Electrónico del Sistema</label>
                    <input 
                      type="email" 
                      value={formData.custom_email || ''} 
                      onChange={e => handleInputChange('custom_email', e.target.value)} 
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm mb-2" 
                      placeholder="reservas@miagencia.com" 
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={formData.use_custom_email || false} 
                        onChange={e => handleInputChange('use_custom_email', (e.target.checked as any))} 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                      Usar como remitente predeterminado
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Expediente Documental Legal</h2>
                    <p className="text-xs text-slate-500">Documentos requeridos para verificación y operación comercial de la agencia.</p>
                  </div>
                  <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
                    <button
                      onClick={() => setPersonType('moral')}
                      className={`px-3 py-1.5 rounded-md transition-all ${personType === 'moral' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600'}`}
                    >
                      Persona Moral
                    </button>
                    <button
                      onClick={() => setPersonType('fisica')}
                      className={`px-3 py-1.5 rounded-md transition-all ${personType === 'fisica' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600'}`}
                    >
                      Persona Física
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {currentDocsList.map(docType => {
                    const uploadedDoc = formData.documents?.find((d: any) => d.document_type === docType.id)
                    const isUploaded = !!uploadedDoc

                    return (
                      <div key={docType.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                            {isUploaded ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{docType.name}</p>
                            <p className="text-xs text-slate-500">{docType.desc}</p>
                            {isUploaded && (
                              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                                Subido el {new Date(uploadedDoc.created_at).toLocaleDateString('es-MX')} ({uploadedDoc.document_name})
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isUploaded && (
                            <a
                              href={uploadedDoc.document_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mr-2"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Ver
                            </a>
                          )}
                          <Button
                            variant={isUploaded ? "outline" : "default"}
                            size="sm"
                            disabled={uploadingField === docType.id}
                            onClick={() => triggerDocUpload(docType.id)}
                            className={!isUploaded ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                          >
                            {uploadingField === docType.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <UploadCloud className="w-3.5 h-3.5 mr-1" />}
                            {isUploaded ? 'Reemplazar' : 'Subir Archivo'}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AS AI - Inteligencia Artificial</h2>
                  <p className="text-xs text-slate-500">Configura el comportamiento del agente de IA para tu agencia.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Instrucciones para AS AI (System Prompt)</label>
                    <textarea 
                      value={formData.ai_prompt || ''} 
                      onChange={e => handleInputChange('ai_prompt', e.target.value)} 
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-32" 
                      placeholder="Ej. Eres un experto agente de viajes de la agencia X..."
                      maxLength={2000}
                    ></textarea>
                    <p className="text-right text-xs text-slate-500 mt-1">{(formData.ai_prompt || '').length}/2000</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Modelo de IA</label>
                      <select 
                        value={formData.ai_model || 'gpt-4o'} 
                        onChange={e => handleInputChange('ai_model', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                      >
                        <option value="gpt-4o">GPT-4o (Recomendado)</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5">GPT-3.5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Idioma Principal</label>
                      <select 
                        value={formData.ai_language || 'es'} 
                        onChange={e => handleInputChange('ai_language', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                      >
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
                        <option value="pt">Portugués</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Zona Horaria</label>
                      <select 
                        value={formData.ai_timezone || 'America/Mexico_City'} 
                        onChange={e => handleInputChange('ai_timezone', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                      >
                        <option value="America/Mexico_City">GMT-06:00 Ciudad de México</option>
                        <option value="America/Bogota">GMT-05:00 Bogotá</option>
                        <option value="America/Argentina/Buenos_Aires">GMT-03:00 Buenos Aires</option>
                        <option value="Europe/Madrid">GMT+01:00 Madrid</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'subscription' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Suscripción y Plan</h2>
                  <p className="text-xs text-slate-500">Gestiona tu plan y revisa el consumo de tu licencia actual.</p>
                </div>
                
                <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Plan Free <span className="text-sm font-normal text-slate-400 ml-2">(Anual)</span></h3>
                    <p className="text-sm text-slate-300 mt-1">2 licencias en uso de 5 permitidas.</p>
                  </div>
                  <Button variant="outline" className="text-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white">Actualizar Plan</Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Licencias</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">2 <span className="text-sm text-slate-400">/ 5</span></p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Viajes</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">45 <span className="text-sm text-slate-400">/ 100</span></p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Biblioteca</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">12 <span className="text-sm text-slate-400">/ 50</span></p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Visitas / mes</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">850 <span className="text-sm text-slate-400">/ 10k</span></p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '8.5%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex justify-center items-center gap-3 mb-6">
                    <span className="text-sm font-medium text-slate-600">Mensual</span>
                    <button className="w-12 h-6 bg-blue-600 rounded-full relative flex items-center px-1">
                      <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
                    </button>
                    <span className="text-sm font-medium text-slate-900">Anual</span>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 ml-2">Ahorra 20%</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Free */}
                    <div className="border border-slate-200 p-4 rounded-xl flex flex-col">
                      <h4 className="font-bold text-slate-900">Free</h4>
                      <p className="text-2xl font-bold mt-2">$0</p>
                      <ul className="text-xs text-slate-600 mt-4 space-y-2 flex-grow">
                        <li className="flex gap-2 items-start"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> 5 Licencias</li>
                        <li className="flex gap-2 items-start"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> CRM Básico</li>
                      </ul>
                      <Button className="w-full mt-4" variant="outline" disabled>Plan Actual</Button>
                    </div>
                    {/* Basico */}
                    <div className="border border-slate-200 p-4 rounded-xl flex flex-col">
                      <h4 className="font-bold text-slate-900">Básico</h4>
                      <p className="text-2xl font-bold mt-2">$1,199<span className="text-xs font-normal text-slate-500">/año</span></p>
                      <ul className="text-xs text-slate-600 mt-4 space-y-2 flex-grow">
                        <li className="flex gap-2 items-start"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> 10 Licencias</li>
                        <li className="flex gap-2 items-start"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> App Móvil</li>
                      </ul>
                      <Button className="w-full mt-4" variant="outline">Seleccionar</Button>
                    </div>
                    {/* Profesional */}
                    <div className="border border-blue-200 bg-blue-50/30 p-4 rounded-xl flex flex-col relative">
                      <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                        <Badge className="bg-blue-600 text-white border-0">Más popular</Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-2">Profesional</h4>
                      <p className="text-2xl font-bold mt-2">$2,399<span className="text-xs font-normal text-slate-500">/año</span></p>
                      <ul className="text-xs text-slate-600 mt-4 space-y-2 flex-grow">
                        <li className="flex gap-2 items-start"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> 25 Licencias</li>
                        <li className="flex gap-2 items-start"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> Marca Blanca Web</li>
                      </ul>
                      <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">Seleccionar</Button>
                    </div>
                    {/* Avanzado */}
                    <div className="border border-slate-200 p-4 rounded-xl flex flex-col">
                      <h4 className="font-bold text-slate-900">Avanzado</h4>
                      <p className="text-2xl font-bold mt-2">$4,799<span className="text-xs font-normal text-slate-500">/año</span></p>
                      <ul className="text-xs text-slate-600 mt-4 space-y-2 flex-grow">
                        <li className="flex gap-2 items-start"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> Ilimitadas</li>
                        <li className="flex gap-2 items-start"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> Marca Blanca Completa</li>
                        <li className="flex gap-2 items-start"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> API Access</li>
                      </ul>
                      <Button className="w-full mt-4" variant="outline">Seleccionar</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Configuración de Pagos</h2>
                  <p className="text-xs text-slate-500">Gestiona tus métodos de cobro e historial de pagos de reservas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stripe */}
                  <div className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">Tarjeta (Stripe) <Badge className="bg-purple-100 text-purple-700 border-0">NUEVO</Badge></h3>
                        <p className="text-xs text-slate-500 mt-1">Estatus: <span className="font-semibold text-slate-400">No conectado</span></p>
                      </div>
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400">S</div>
                    </div>
                    <Button variant="outline" className="w-full mt-2">Conectar Stripe</Button>
                  </div>

                  {/* Pago externo */}
                  <div className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Pago Externo</h3>
                        <button className="w-10 h-5 bg-blue-600 rounded-full relative">
                          <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 right-1"></div>
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Permitir registro de transferencias y efectivo manualmente.</p>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-slate-600">Volumen sin comisión</span>
                        <span className="text-slate-900">$12,400 / $50,000</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjeta Corporativa (Mock Form) */}
                <div className="mt-6 border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 mb-4">Agregar Tarjeta Corporativa</h3>
                  <div className="flex items-center gap-6 mb-4 text-sm">
                    <label className="flex items-center gap-2"><input type="radio" name="card_type" defaultChecked /> Crédito</label>
                    <label className="flex items-center gap-2"><input type="radio" name="card_type" /> Contado</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Titular de la Tarjeta</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Tarjeta</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" placeholder="0000 0000 0000 0000" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo</label>
                      <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm">
                        <option>Visa</option>
                        <option>Mastercard</option>
                        <option>Amex</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Expiración</label>
                        <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                        <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Código Postal</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
                    </div>
                    <div className="sm:col-span-2 flex items-start gap-2 mt-2">
                      <input type="checkbox" className="mt-1" defaultChecked />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Usar dirección fiscal de la agencia</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Encriptación nivel bancario SSL de 256 bits.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Historial de Pagos (Mock Table) */}
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h3 className="font-bold text-slate-900 mb-4">Historial de Pagos de Reservas</h3>
                  
                  {/* Filters mock */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <select className="border border-slate-300 rounded-md p-1.5 text-xs text-slate-700"><option>Todos los periodos</option></select>
                    <select className="border border-slate-300 rounded-md p-1.5 text-xs text-slate-700"><option>Tipo de servicio</option></select>
                    <select className="border border-slate-300 rounded-md p-1.5 text-xs text-slate-700"><option>Cualquier estado</option></select>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                          <th className="px-4 py-3">Fecha</th>
                          <th className="px-4 py-3">Reserva</th>
                          <th className="px-4 py-3">Cliente</th>
                          <th className="px-4 py-3">Método</th>
                          <th className="px-4 py-3 text-right">Monto</th>
                          <th className="px-4 py-3 text-center">Estado</th>
                          <th className="px-4 py-3 text-center">Comprobante</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="px-4 py-3">21/08/2026</td>
                          <td className="px-4 py-3 font-medium text-slate-900">RES-1029<br/><span className="text-xs font-normal text-slate-500">Cancún</span></td>
                          <td className="px-4 py-3">Juan Pérez</td>
                          <td className="px-4 py-3">Visa ****4242</td>
                          <td className="px-4 py-3 text-right font-medium">$12,500.00 MXN</td>
                          <td className="px-4 py-3 text-center"><Badge className="bg-emerald-100 text-emerald-700 border-0">Pagado</Badge></td>
                          <td className="px-4 py-3 text-center"><button className="text-blue-600 hover:underline">PDF</button></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">18/08/2026</td>
                          <td className="px-4 py-3 font-medium text-slate-900">RES-1028<br/><span className="text-xs font-normal text-slate-500">Madrid</span></td>
                          <td className="px-4 py-3">María García</td>
                          <td className="px-4 py-3">Transf. SPEI</td>
                          <td className="px-4 py-3 text-right font-medium">$45,000.00 MXN</td>
                          <td className="px-4 py-3 text-center"><Badge className="bg-emerald-100 text-emerald-700 border-0">Pagado</Badge></td>
                          <td className="px-4 py-3 text-center"><button className="text-blue-600 hover:underline">PDF</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <div className="flex items-center gap-1 text-xs">
                      <button className="px-2 py-1 border border-slate-300 rounded text-slate-500" disabled>&lt;</button>
                      <button className="px-2 py-1 bg-blue-600 text-white rounded">1</button>
                      <button className="px-2 py-1 border border-slate-300 rounded text-slate-500">&gt;</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Footer Actions */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Guardar Configuración
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
