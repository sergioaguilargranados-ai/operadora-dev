"use client"

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Building2, Phone, Mail, UploadCloud, PaintBucket, Loader2, Save, FileText, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

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
}

export default function AgencySettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<Partial<AgencySettings>>({})
    const [activeTab, setActiveTab] = useState('general') // general, contact, branding, documents

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/agency/settings')
            const data = await res.json()
            if (data.success) {
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
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                alert('Configuración guardada exitosamente')
            } else {
                alert('Error al guardar: ' + data.error)
            }
        } catch (error) {
            alert('Error de red')
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field: keyof AgencySettings, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Simulador de subida a Vercel Blob para logos
    const handleFileUpload = (field: keyof AgencySettings) => {
        const mockUrl = `https://blob.vercel-storage.com/${field}-${Date.now()}.png`
        handleInputChange(field, mockUrl)
        alert(`Simulación: Archivo subido a Vercel Blob.\nURL: ${mockUrl}`)
    }

    // Simulador de subida a Vercel Blob para Documentos
    const handleDocumentUpload = async (docType: string) => {
        setSaving(true)
        try {
            // Simulamos la subida a Vercel Blob
            const mockUrl = `https://blob.vercel-storage.com/docs/${docType}-${Date.now()}.pdf`
            
            // Insertamos en entity_documents simulando API call
            const res = await fetch('/api/admin/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entity_type: 'agency',
                    entity_id: formData.id || 1,
                    document_name: `Documento ${docType.toUpperCase()}`,
                    document_type: docType,
                    document_url: mockUrl,
                    status: 'active'
                })
            })
            
            if (res.ok) {
                alert(`Simulación: Documento ${docType} subido a Vercel Blob y registrado exitosamente.`)
                fetchSettings() // Refrescar los documentos
            }
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PageHeader backButtonText="Dashboard" backButtonHref="/dashboard">
                <div className="flex items-center gap-2">
                    <Settings className="w-6 h-6 text-indigo-600" />
                    <span className="text-lg font-bold text-gray-800">Configuración de la Agencia</span>
                </div>
            </PageHeader>

            <div className="max-w-6xl mx-auto px-4 py-6">
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar Menú */}
                    <div className="col-span-1 space-y-2">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                        >
                            <Building2 className="w-5 h-5" /> Datos Generales
                        </button>
                        <button 
                            onClick={() => setActiveTab('contact')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'contact' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                        >
                            <Phone className="w-5 h-5" /> Contacto Público
                        </button>
                        <button 
                            onClick={() => setActiveTab('branding')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'branding' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                        >
                            <PaintBucket className="w-5 h-5" /> Marca Blanca y Logos
                        </button>
                        <button 
                            onClick={() => setActiveTab('documents')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'documents' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                        >
                            <FileText className="w-5 h-5" /> Expediente Documental
                        </button>
                    </div>

                    {/* Contenido Principal */}
                    <Card className="col-span-1 md:col-span-3 p-6 bg-white shadow-sm border-gray-200 min-h-[500px] flex flex-col">
                        
                        {activeTab === 'general' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-5">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Información Corporativa</h2>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                                        <input type="text" value={formData.company_name || ''} onChange={e => handleInputChange('company_name', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                                        <input type="text" value={formData.legal_name || ''} onChange={e => handleInputChange('legal_name', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Agente B2B</label>
                                        <input type="text" value={formData.b2b_agent_number || ''} onChange={e => handleInputChange('b2b_agent_number', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm bg-gray-50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Representante Legal</label>
                                        <input type="text" value={formData.legal_representative || ''} onChange={e => handleInputChange('legal_representative', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección / Domicilio Fiscal</label>
                                        <textarea value={formData.address || ''} onChange={e => handleInputChange('address', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm" rows={3}></textarea>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'contact' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-5">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Datos mostrados en el Portal</h2>
                                <p className="text-sm text-gray-500 mb-4">Esta información será visible para tus clientes finales en tu portal de Marca Blanca.</p>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Eslogan</label>
                                        <input type="text" value={formData.slogan || ''} onChange={e => handleInputChange('slogan', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm" placeholder="Ej. El viaje de tus sueños" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico de Soporte</label>
                                        <input type="email" value={formData.support_email || ''} onChange={e => handleInputChange('support_email', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Principal</label>
                                        <input type="text" value={formData.support_phone || ''} onChange={e => handleInputChange('support_phone', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp de Atención</label>
                                        <input type="text" value={formData.support_whatsapp || ''} onChange={e => handleInputChange('support_whatsapp', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm" placeholder="+52 1..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Dominio Personalizado</label>
                                        <input type="text" value={formData.custom_domain || ''} onChange={e => handleInputChange('custom_domain', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm bg-gray-50" placeholder="agencia.app.asoperadora.com" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'branding' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Identidad Visual</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Upload Logos */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-700">Logotipos (Vercel Blob)</h3>
                                        
                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                            {formData.logo_url ? (
                                                <div className="mb-3 relative group">
                                                    <img src={formData.logo_url} alt="Logo Web" className="max-h-20 object-contain" />
                                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-lg">
                                                        <Button size="sm" variant="secondary" onClick={() => handleFileUpload('logo_url')}>Cambiar</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                    <p className="text-sm font-medium text-gray-700">Logo Versión Web (Claro)</p>
                                                    <Button size="sm" variant="outline" className="mt-2" onClick={() => handleFileUpload('logo_url')}>Seleccionar Archivo</Button>
                                                </>
                                            )}
                                        </div>

                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-900">
                                            {formData.logo_dark_url ? (
                                                <div className="mb-3 relative group">
                                                    <img src={formData.logo_dark_url} alt="Logo Oscuro" className="max-h-20 object-contain" />
                                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-lg">
                                                        <Button size="sm" variant="secondary" onClick={() => handleFileUpload('logo_dark_url')}>Cambiar</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-8 h-8 text-gray-300 mb-2" />
                                                    <p className="text-sm font-medium text-gray-200">Logo Tienda (Oscuro)</p>
                                                    <Button size="sm" variant="outline" className="mt-2 border-gray-600 text-gray-300" onClick={() => handleFileUpload('logo_dark_url')}>Seleccionar Archivo</Button>
                                                </>
                                            )}
                                        </div>

                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50">
                                            {formData.mobile_logo_url ? (
                                                <div className="mb-3 relative group">
                                                    <img src={formData.mobile_logo_url} alt="Logo Móvil" className="max-h-16 object-contain" />
                                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-lg">
                                                        <Button size="sm" variant="secondary" onClick={() => handleFileUpload('mobile_logo_url')}>Cambiar</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                    <p className="text-sm font-medium text-gray-700">Logo App Móvil</p>
                                                    <Button size="sm" variant="outline" className="mt-2" onClick={() => handleFileUpload('mobile_logo_url')}>Seleccionar Archivo</Button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Select Colors */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-700">Colores de Marca</h3>
                                        
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Color Primario</p>
                                                <p className="text-xs text-gray-500">Botones principales y headers</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-gray-400 uppercase">{formData.primary_color}</span>
                                                <input type="color" value={formData.primary_color || '#000000'} onChange={e => handleInputChange('primary_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Color Secundario</p>
                                                <p className="text-xs text-gray-500">Fondos y menús secundarios</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-gray-400 uppercase">{formData.secondary_color}</span>
                                                <input type="color" value={formData.secondary_color || '#000000'} onChange={e => handleInputChange('secondary_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Color de Acento</p>
                                                <p className="text-xs text-gray-500">Iconos y notificaciones</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-gray-400 uppercase">{formData.accent_color}</span>
                                                <input type="color" value={formData.accent_color || '#000000'} onChange={e => handleInputChange('accent_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'documents' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-5">
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Expediente Documental Legal</h2>
                                <p className="text-sm text-gray-500 mb-4">Sube los documentos requeridos por AS Operadora para validar tu Agencia. Los archivos se guardan de forma segura (Vercel Blob).</p>
                                
                                <div className="space-y-3">
                                    {[
                                        { id: 'acta', name: 'Acta Constitutiva' },
                                        { id: 'csf', name: 'Constancia de Situación Fiscal' },
                                        { id: 'ine', name: 'Identificación Oficial Rep. Legal' },
                                        { id: 'domicilio', name: 'Comprobante de Domicilio' },
                                    ].map(docType => {
                                        const uploadedDoc = formData.documents?.find(d => d.document_type === docType.id)
                                        const isUploaded = !!uploadedDoc
                                        
                                        return (
                                            <div key={docType.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUploaded ? 'bg-green-100' : 'bg-gray-200'}`}>
                                                        {isUploaded ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4 text-gray-500" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{docType.name}</p>
                                                        <p className="text-xs text-gray-500">{isUploaded ? `Subido el ${new Date(uploadedDoc.created_at).toLocaleDateString()}` : 'Pendiente de subir'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isUploaded && (
                                                        <a href={uploadedDoc.document_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline mr-2">
                                                            Ver archivo
                                                        </a>
                                                    )}
                                                    <Button variant={isUploaded ? "outline" : "default"} size="sm" onClick={() => handleDocumentUpload(docType.id)} disabled={saving}>
                                                        {isUploaded ? 'Actualizar Archivo' : 'Subir Archivo'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Footer Actions */}
                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
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
