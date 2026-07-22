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
