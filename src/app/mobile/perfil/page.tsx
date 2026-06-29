"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, User, Calendar, Mail, Phone, Shield, Users, ChevronRight, Plus, Upload, X, Loader2, LogOut } from "lucide-react"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { useToast } from "@/hooks/use-toast"

interface DocumentItem {
  id: string
  name: string
  fileName: string | null
}

export default function MobileProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { logoUrl, logoDarkUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoDarkUrl || logoMobileUrl || logoUrl || null
  const { toast } = useToast()

  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeDocId, setActiveDocId] = useState<string | null>(null)

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
        setProfileData(data.data)
        const dbDocs = data.data.documents?.map((d: any) => ({
          id: d.id,
          name: d.name,
          fileName: d.url
        })) || []
        setDocuments(dbDocs.length > 0 ? dbDocs : [{ id: '1', name: 'INE', fileName: null }])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    try {
      const res = await fetch('/api/mobile/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user?.id, ...updates })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Actualizado', description: 'Datos actualizados correctamente' })
        fetchProfile()
      } else {
        toast({ title: 'Error', description: 'Error al actualizar', variant: 'destructive' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Error', description: 'Error al actualizar', variant: 'destructive' })
    }
  }

  const handleEdit = () => {
    router.push('/mobile/perfil/editar')
  }

  const handleAddDocument = () => {
    const docName = prompt("Escribe el nombre del documento (Ej. Visa, Pasaporte):")
    if (docName) {
      setDocuments(prev => [...prev, { id: Date.now().toString(), name: docName, fileName: null }])
    }
  }

  const handleUploadClick = (docId: string) => {
    setActiveDocId(docId)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeDocId && user?.id) {
      const file = e.target.files[0]
      const doc = documents.find(d => d.id === activeDocId)
      if (!doc) return

      setUploadingId(activeDocId)
      
      try {
        // 1. Subir a Vercel Blob
        const formData = new FormData()
        formData.append('file', file)
        
        const uploadRes = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData
        })
        const uploadData = await uploadRes.json()
        
        if (uploadData.success) {
          const fileUrl = uploadData.url

          // 2. Guardar en Base de Datos
          const dbRes = await fetch('/api/mobile/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              name: doc.name,
              file_url: fileUrl
            })
          })
          const dbData = await dbRes.json()

          if (dbData.success) {
            setDocuments(prev => prev.map(d => 
              d.id === activeDocId ? { ...d, fileName: fileUrl } : d
            ))
            toast({ title: "Éxito", description: "Documento subido correctamente" })
          } else {
            toast({ title: "Error", description: "Error al guardar el documento", variant: 'destructive' })
          }
        } else {
          toast({ title: "Error", description: "Error al subir el archivo", variant: 'destructive' })
        }
      } catch (err) {
        console.error(err)
        toast({ title: "Error", description: "Error de conexión", variant: 'destructive' })
      } finally {
        setUploadingId(null)
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

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

          <button className="text-white hover:text-gray-300">
            <Bell className="w-6 h-6" />
          </button>
        </div>

        {/* Title & Avatar */}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h1 className="text-4xl font-serif mb-2">Perfil</h1>
            <p className="text-sm text-gray-300 leading-tight">
              Consulta y gestiona tu información personal y de viaje.
            </p>
          </div>
          
          <div className="w-20 h-20 rounded-full border border-white flex items-center justify-center bg-transparent flex-shrink-0">
            {user?.image ? (
              <img src={user.image} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white" strokeWidth={1} />
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area (Overlapping Cards) */}
      <div className="px-4 -mt-12 relative z-10 space-y-4">
        
        {/* Info List Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          
          {/* Item */}
          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer" onClick={handleEdit}>
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Nombre</h3>
              <p className="text-xs text-gray-500">{profileData?.name || 'No registrado'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer" onClick={handleEdit}>
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Fecha de Nacimiento</h3>
              <p className="text-xs text-gray-500">{profileData?.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : 'No registrado'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer" onClick={handleEdit}>
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Correo</h3>
              <p className="text-xs text-gray-500">{profileData?.email || 'No registrado'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer" onClick={handleEdit}>
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Teléfono</h3>
              <p className="text-xs text-gray-500">{profileData?.phone || 'No registrado'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer" onClick={handleEdit}>
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Seguro de Viajero</h3>
              <p className="text-xs text-gray-500">{profileData?.wants_travel_insurance ? '✅ Solicitado' : 'No solicitado'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer" onClick={handleEdit}>
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Contactos de Emergencia</h3>
              <p className="text-xs text-gray-500">
                {profileData?.emergency_contacts && profileData.emergency_contacts.length > 0 
                  ? `${profileData.emergency_contacts.length} contacto(s) registrado(s)` 
                  : 'No registrado'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

        </div>

        {/* Documentation Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 pb-3 flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight mb-1">Documentación</h3>
              <p className="text-xs text-gray-500">Consulta y mantiene actualizados tus documentos.</p>
            </div>
            <button 
              onClick={handleAddDocument}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black hover:bg-gray-200 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {documents.map((doc, index) => (
              <div key={doc.id} className="flex items-center p-4">
                <div className="w-8 h-8 bg-black text-white rounded-md flex items-center justify-center flex-shrink-0 mr-4 font-bold text-xs">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{doc.name}</h3>
                  <p className="text-xs text-gray-500">
                    {doc.fileName ? `Subido: ${doc.fileName}` : `Agrega o actualiza tu ${doc.name.toLowerCase()}.`}
                  </p>
                </div>
                
                {uploadingId === doc.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <div className="flex gap-2">
                    {doc.fileName && (
                      <button 
                        onClick={() => window.open(doc.fileName!, '_blank')} 
                        className="p-2 text-blue-500 hover:text-blue-700"
                      >
                        Ver
                      </button>
                    )}
                    <button 
                      onClick={() => handleUploadClick(doc.id)} 
                      className="p-2 text-gray-400 hover:text-black"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pb-8">
          <Button 
            onClick={() => {
              logout()
              router.push("/mobile/login")
            }}
            variant="outline"
            className="w-full h-14 bg-white border border-gray-200 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </Button>
        </div>

      </div>
    </div>
  )
}
