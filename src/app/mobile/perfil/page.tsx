"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, User, Calendar, Mail, Phone, Shield, Users, ChevronRight, Plus, Upload, X, Loader2, LogOut, Trash2, Globe, Pencil } from "lucide-react"
import NotificationBell from "@/components/mobile/NotificationBell"
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
      const res = await fetch(`/api/mobile/profile?user_id=${user?.id}&t=${Date.now()}`)
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

  const handleLanguageChange = (langCode: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement
    if (select) {
      select.value = langCode
      select.dispatchEvent(new Event('change'))
    }
    toast({ title: 'Idioma cambiado', description: 'Traduciendo la aplicación...' })
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

  const handleEditDocumentName = async (docId: string, currentName: string) => {
    const newName = prompt("Nuevo nombre del documento:", currentName)
    if (!newName || newName === currentName || !user?.id) return

    try {
      const res = await fetch('/api/mobile/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, old_name: currentName, new_name: newName })
      })
      const data = await res.json()
      
      if (data.success) {
        toast({ title: 'Actualizado', description: 'Nombre del documento actualizado' })
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, name: newName } : d))
      } else {
        toast({ title: 'Error', description: 'No se pudo actualizar el nombre', variant: 'destructive' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Error', description: 'Error al actualizar el nombre', variant: 'destructive' })
    }
  }

  const handleDeleteDocument = async (docName: string) => {
    if (!user?.id || !confirm(`¿Estás seguro de que deseas eliminar el documento ${docName}?`)) return
    
    try {
      const res = await fetch(`/api/mobile/documents?user_id=${user.id}&name=${encodeURIComponent(docName)}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      
      if (data.success || !docName) {
        toast({ title: 'Eliminado', description: 'Documento eliminado correctamente' })
        setDocuments(prev => prev.filter(d => d.name !== docName))
      } else {
        toast({ title: 'Error', description: 'No se pudo eliminar el documento', variant: 'destructive' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Error', description: 'Error al eliminar el documento', variant: 'destructive' })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeDocId && user?.id) {
      const file = e.target.files[0]
      
      const doc = documents.find(d => d.id === activeDocId)
      // Solo hacer return si NO es foto de perfil y el documento no existe
      if (activeDocId !== 'PROFILE_PIC' && !doc) return

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

          if (activeDocId === 'PROFILE_PIC') {
            // Update profile image
            const dbRes = await fetch('/api/mobile/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: user.id, image: fileUrl })
            })
            const dbData = await dbRes.json()
            if (dbData.success) {
              setProfileData((prev: any) => ({ ...prev, image: fileUrl }))
              toast({ title: "Éxito", description: "Foto de perfil actualizada" })
              // Forzar recarga de los datos si es necesario
              fetchProfile()
            } else {
              toast({ title: "Error", description: "Error al actualizar perfil", variant: 'destructive' })
            }
          } else {
            // Guardar como documento
            const dbRes = await fetch('/api/mobile/documents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user.id,
                name: doc?.name || 'Documento',
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
      <input type="file" accept="image/*,application/pdf" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

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

          <button onClick={() => router.push('/mobile/notificaciones')} className="text-white hover:text-gray-300 p-2 -mr-2">
            <NotificationBell className="w-6 h-6 text-white" />
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
          
          <div 
            onClick={() => handleUploadClick('PROFILE_PIC')}
            className="w-20 h-20 rounded-full border border-white flex items-center justify-center bg-transparent flex-shrink-0 cursor-pointer relative overflow-hidden group"
          >
            {uploadingId === 'PROFILE_PIC' ? (
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            ) : profileData?.image || (user as any)?.image ? (
              <img src={profileData?.image || (user as any)?.image} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white" strokeWidth={1} />
            )}
            {/* Overlay de cámara hover/activo */}
            {uploadingId !== 'PROFILE_PIC' && (
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Upload className="w-5 h-5 text-white" />
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area (Overlapping Cards) */}
      <div className="px-4 -mt-12 relative z-10 space-y-4">
        
        {/* Info List Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          
          {/* Idioma Selector */}
          <div className="flex items-center p-4">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Idioma</h3>
              <p className="text-xs text-gray-500">Traducción automática</p>
            </div>
            <select 
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-gray-100 border-none text-sm font-medium rounded-lg p-2 text-gray-700 outline-none focus:ring-2 focus:ring-black cursor-pointer"
              defaultValue="es"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="pt">Português</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
            </select>
          </div>

          {/* Item */}
          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer" onClick={handleEdit}>
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Nombre</h3>
              <p className="text-xs text-gray-500 notranslate">{profileData?.name || 'No registrado'}</p>
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
              <div key={doc.id} className="flex items-center p-4 gap-2">
                <div className="w-8 h-8 bg-black text-white rounded-md flex items-center justify-center flex-shrink-0 mr-2 font-bold text-xs">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight truncate">{doc.name}</h3>
                  <p className="text-xs text-gray-500 truncate">
                    {doc.fileName ? `Subido: ${doc.fileName.split('/').pop()?.split('-').slice(1).join('-') || doc.fileName.split('/').pop()}` : `Agrega o actualiza tu ${doc.name.toLowerCase()}.`}
                  </p>
                </div>
                
                {uploadingId === doc.id ? (
                  <div className="flex-shrink-0 px-2">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="flex gap-1 flex-shrink-0 items-center">
                    {doc.fileName && (
                      <button 
                        onClick={() => window.open(doc.fileName!, '_blank')} 
                        className="p-1.5 text-blue-500 hover:text-blue-700 text-xs font-bold"
                      >
                        Ver
                      </button>
                    )}
                    <button 
                      onClick={() => handleEditDocumentName(doc.id, doc.name)} 
                      className="p-1.5 text-gray-400 hover:text-black"
                      title="Editar nombre"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleUploadClick(doc.id)} 
                      className="p-1.5 text-gray-400 hover:text-black"
                      title="Subir archivo"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.name)}
                      className="p-1.5 text-red-500 hover:text-red-700"
                      title="Eliminar archivo"
                    >
                      <Trash2 className="w-4 h-4" />
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
