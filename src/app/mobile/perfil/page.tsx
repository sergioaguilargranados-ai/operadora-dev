"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, User, Calendar, Mail, Phone, Shield, Users, ChevronRight, Plus, Upload, X, Loader2 } from "lucide-react"
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
  const { user } = useAuth()
  const { logoUrl } = useWhiteLabel()
  const { toast } = useToast()

  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: '1', name: 'INE', fileName: null }
  ])

  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeDocId, setActiveDocId] = useState<string | null>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeDocId) {
      const file = e.target.files[0]
      setUploadingId(activeDocId)
      
      // Simular subida de archivo
      setTimeout(() => {
        setDocuments(prev => prev.map(doc => 
          doc.id === activeDocId ? { ...doc, fileName: file.name } : doc
        ))
        setUploadingId(null)
        toast({ title: "Éxito", description: "Documento subido correctamente" })
      }, 1000)
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
          
          <img
            src={logoUrl || "/logo-white.png"} // Asumimos un logo blanco para contraste, si no, se vería raro
            alt="AS Operadora"
            className="h-10 object-contain invert" // Aplicamos invert de forma provisional para forzar logo blanco
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/logo.png"
            }}
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
          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Nombre</h3>
              <p className="text-xs text-gray-500">Actualiza tu nombre completo.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Fecha de Nacimiento</h3>
              <p className="text-xs text-gray-500">Actualiza tu fecha de nacimiento.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Correo</h3>
              <p className="text-xs text-gray-500">Actualiza tu correo electrónico.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Teléfono</h3>
              <p className="text-xs text-gray-500">Actualiza tu número de teléfono.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Seguro de Viajero</h3>
              <p className="text-xs text-gray-500">Consulta y gestiona tu seguro de viaje.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center p-4 active:bg-gray-50 cursor-pointer">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Contactos de Emergencia</h3>
              <p className="text-xs text-gray-500">Administra tus contactos de emergencia.</p>
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
                  <button 
                    onClick={() => handleUploadClick(doc.id)} 
                    className="p-2 text-gray-400 hover:text-black"
                  >
                    {doc.fileName ? <ChevronRight className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
