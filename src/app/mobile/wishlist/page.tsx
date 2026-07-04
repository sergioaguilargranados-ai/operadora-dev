"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, Trash2, Eye, MapPin, Loader2, Heart } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"

export default function WishlistPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { logoUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetchWishlist()
  }, [user?.id])

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`/api/wishlist?userId=${user?.id}`)
      const data = await res.json()
      if (data.success) {
        setItems(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async (id: number) => {
    setItems(items.filter(item => item.id !== id))
    try {
      await fetch('/api/wishlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'dismissed' })
      })
      toast({ title: "Removido", description: "El artículo ha sido removido de tu lista." })
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "No se pudo remover el artículo", variant: "destructive" })
      fetchWishlist() // revert
    }
  }

  const handleDelete = async (id: number) => {
    setItems(items.filter(item => item.id !== id))
    try {
      await fetch(`/api/wishlist?id=${id}`, { method: 'DELETE' })
      toast({ title: "Eliminado", description: "El artículo ha sido eliminado." })
    } catch (err) {
      console.error(err)
      fetchWishlist()
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-24">
      
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-[#FDFDFD] z-30">
        <button onClick={() => router.back()} className="text-black hover:text-gray-600 p-2 -ml-2">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <MobileLogo
          variant="dark"
          size="md"
          logoUrl={customLogoUrl}
        />
        <button onClick={() => router.push('/mobile/notificaciones')} className="text-black hover:text-gray-600 p-2 -mr-2">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 pt-4 pb-6">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Wishlist</h1>
        <p className="text-sm text-gray-500">
          Tus recomendaciones de compras y souvenirs guardados.
        </p>
      </div>

      {/* Items List */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white/70 backdrop-blur-lg rounded-3xl shadow-sm border border-gray-100">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aún no tienes artículos guardados.</p>
            <p className="text-xs text-gray-400 mt-2 px-6">Mientras revisas tu itinerario, toca el corazón en los souvenirs que quieras recordar.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-[#f6f5f3] rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                  <img src={item.item_img} alt={item.item_name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-1 text-gray-400 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{item.city}</span>
                  </div>
                  <h3 className="font-serif font-bold text-gray-900 text-lg leading-tight mb-1 truncate">{item.item_name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.item_desc}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2 pt-3 border-t border-gray-50">
                <button 
                  onClick={() => handleDismiss(item.id)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Olvidar
                </button>
                <button 
                  onClick={() => router.push(`/mobile/itinerario/${item.itinerary_id}/dia/${item.day_index}`)}
                  className="flex-1 bg-black text-white hover:bg-gray-800 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalle
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
