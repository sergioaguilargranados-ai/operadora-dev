"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Building, UploadCloud, CheckCircle2, ChevronRight, ChevronLeft, Building2, PaintBucket, FileText } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

type AgencySettings = {
    id?: number
    company_name?: string
    legal_name?: string
    b2b_agent_number?: string
    legal_representative?: string
    address?: string
    slogan?: string
    support_email?: string
    support_phone?: string
    support_whatsapp?: string
    custom_domain?: string
    logo_url?: string
    logo_dark_url?: string
    logo_mobile_url?: string
    primary_color?: string
    secondary_color?: string
    accent_color?: string
}

export default function OnboardingPage() {
    const router = useRouter()
    const { user, refreshUser } = useAuth()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<AgencySettings>({})
    const [statusMessage, setStatusMessage] = useState("")

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/agency/settings')
            if (res.ok) {
                const data = await res.json()
                if (data.success && data.data) {
                    setFormData(data.data)
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const saveStepAndContinue = async (isFinal = false) => {
        setSaving(true)
        try {
            await fetch('/api/agency/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (isFinal) {
                // Enviar a revisión
                const submitRes = await fetch('/api/agency/submit-review', { method: 'POST' })
                if (submitRes.ok) {
                    await refreshUser()
                    setStep(4) // Success step
                } else {
                    alert("Ocurrió un error al enviar la solicitud")
                }
            } else {
                setStep(step + 1)
                window.scrollTo(0, 0)
            }
        } catch (error) {
            alert('Error de red al guardar')
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field: keyof AgencySettings, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Simulador de subida a Vercel Blob
    const handleFileUpload = (field: keyof AgencySettings) => {
        const mockUrl = `https://blob.vercel-storage.com/${field}-${Date.now()}.png`
        handleInputChange(field, mockUrl)
        alert(`Simulación: Archivo subido a Vercel Blob.\nURL: ${mockUrl}`)
    }

    const handleDocumentUpload = async (docType: string) => {
        setSaving(true)
        try {
            const mockUrl = `https://blob.vercel-storage.com/docs/${docType}-${Date.now()}.pdf`
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
                alert(`Simulación: Documento ${docType} subido exitosamente.`)
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

    if (user?.role === 'UNDER_REVIEW_AGENCY' || step === 4) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-lg w-full p-8 text-center border-0 shadow-lg rounded-2xl">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitud en Revisión</h1>
                    <p className="text-gray-600 mb-6">
                        ¡Gracias por completar tu perfil! Nuestro equipo está revisando tus documentos y la configuración de tu Marca Blanca. Te notificaremos por correo electrónico en cuanto tu cuenta esté activa.
                    </p>
                    <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                        Volver al inicio
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Configura tu Marca Blanca</h1>
                    <p className="text-gray-600">Completa estos pasos para activar tu portal de agencia.</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full z-0 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                    
                    <div className="relative z-10 flex justify-between">
                        {[
                            { num: 1, icon: PaintBucket, label: "Identidad" },
                            { num: 2, icon: Building2, label: "Empresa" },
                            { num: 3, icon: FileText, label: "Documentos" }
                        ].map((s) => (
                            <div key={s.num} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 border-gray-50 ${step >= s.num ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-indigo-600' : 'text-gray-500'}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="p-8 shadow-md border-0 rounded-2xl bg-white">
                    {/* STEP 1: Identidad Visual */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Identidad Visual</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-700">Logotipo Principal (Web)</h3>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                        {formData.logo_url ? (
                                            <div className="mb-3 relative group">
                                                <img src={formData.logo_url} alt="Logo Web" className="max-h-20 object-contain" />
                                                <Button size="sm" variant="secondary" className="mt-2" onClick={() => handleFileUpload('logo_url')}>Cambiar</Button>
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                <Button size="sm" variant="outline" onClick={() => handleFileUpload('logo_url')}>Subir Logo</Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-700">Logo App Móvil (Cuadrado)</h3>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                        {formData.logo_mobile_url ? (
                                            <div className="mb-3 relative group">
                                                <img src={formData.logo_mobile_url} alt="Logo Móvil" className="max-h-20 object-contain" />
                                                <Button size="sm" variant="secondary" className="mt-2" onClick={() => handleFileUpload('logo_mobile_url')}>Cambiar</Button>
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                <Button size="sm" variant="outline" onClick={() => handleFileUpload('logo_mobile_url')}>Subir Ícono</Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold text-gray-700">Colores de Marca</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Primario</label>
                                        <div className="flex gap-2">
                                            <input type="color" value={formData.primary_color || '#4f46e5'} onChange={e => handleInputChange('primary_color', e.target.value)} className="h-10 w-12 rounded cursor-pointer border border-gray-300" />
                                            <Input type="text" value={formData.primary_color || '#4f46e5'} onChange={e => handleInputChange('primary_color', e.target.value)} className="flex-1" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Secundario</label>
                                        <div className="flex gap-2">
                                            <input type="color" value={formData.secondary_color || '#4338ca'} onChange={e => handleInputChange('secondary_color', e.target.value)} className="h-10 w-12 rounded cursor-pointer border border-gray-300" />
                                            <Input type="text" value={formData.secondary_color || '#4338ca'} onChange={e => handleInputChange('secondary_color', e.target.value)} className="flex-1" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Acento</label>
                                        <div className="flex gap-2">
                                            <input type="color" value={formData.accent_color || '#f59e0b'} onChange={e => handleInputChange('accent_color', e.target.value)} className="h-10 w-12 rounded cursor-pointer border border-gray-300" />
                                            <Input type="text" value={formData.accent_color || '#f59e0b'} onChange={e => handleInputChange('accent_color', e.target.value)} className="flex-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Empresa y Contacto */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Perfil de la Agencia</h2>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                                    <Input value={formData.company_name || ''} onChange={e => handleInputChange('company_name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                                    <Input value={formData.legal_name || ''} onChange={e => handleInputChange('legal_name', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Eslogan</label>
                                    <Input value={formData.slogan || ''} onChange={e => handleInputChange('slogan', e.target.value)} placeholder="El viaje de tus sueños..." />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Oficial</label>
                                    <Input value={formData.address || ''} onChange={e => handleInputChange('address', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo de Soporte</label>
                                    <Input type="email" value={formData.support_email || ''} onChange={e => handleInputChange('support_email', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Público</label>
                                    <Input value={formData.support_phone || ''} onChange={e => handleInputChange('support_phone', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                    <Input value={formData.support_whatsapp || ''} onChange={e => handleInputChange('support_whatsapp', e.target.value)} placeholder="+52 1..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dominio (Opcional)</label>
                                    <Input value={formData.custom_domain || ''} onChange={e => handleInputChange('custom_domain', e.target.value)} placeholder="agencia.com" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Documentación */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Expediente Documental</h2>
                            <p className="text-gray-600 text-sm mb-4">Sube la documentación legal requerida para validar tu cuenta como agencia B2B.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-4 border-dashed border-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-indigo-500" />
                                        <div>
                                            <p className="font-medium text-gray-900">Constancia Fiscal</p>
                                            <p className="text-xs text-gray-500">PDF o Imagen</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleDocumentUpload('constancia_fiscal')}>Subir</Button>
                                </Card>
                                
                                <Card className="p-4 border-dashed border-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-indigo-500" />
                                        <div>
                                            <p className="font-medium text-gray-900">Identificación Oficial</p>
                                            <p className="text-xs text-gray-500">INE o Pasaporte</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleDocumentUpload('ine')}>Subir</Button>
                                </Card>

                                <Card className="p-4 border-dashed border-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-indigo-500" />
                                        <div>
                                            <p className="font-medium text-gray-900">Comprobante de Domicilio</p>
                                            <p className="text-xs text-gray-500">Menor a 3 meses</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleDocumentUpload('comprobante_domicilio')}>Subir</Button>
                                </Card>
                                
                                <Card className="p-4 border-dashed border-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-indigo-500" />
                                        <div>
                                            <p className="font-medium text-gray-900">RNT (Opcional)</p>
                                            <p className="text-xs text-gray-500">Registro Nacional de Turismo</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleDocumentUpload('rnt')}>Subir</Button>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-10 flex items-center justify-between pt-6 border-t">
                        {step > 1 ? (
                            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={saving}>
                                <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
                            </Button>
                        ) : (
                            <div></div>
                        )}
                        
                        {step < 3 ? (
                            <Button onClick={() => saveStepAndContinue(false)} disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Siguiente <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={() => saveStepAndContinue(true)} disabled={saving} className="bg-green-600 hover:bg-green-700">
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Enviar a Revisión <CheckCircle2 className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
