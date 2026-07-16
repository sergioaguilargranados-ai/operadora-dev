"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, MapPin, Loader2, Heart, Plus, Info } from "lucide-react"
import NotificationBell from "@/components/mobile/NotificationBell"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { FoodDetailModal } from "@/components/mobile/FoodDetailModal"
import { PlaceDetailModal } from "@/components/mobile/PlaceDetailModal"

export default function WishlistPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { logoUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'place' | 'food' | 'souvenir'>('all')
  const [selectedFood, setSelectedFood] = useState<any>(null)
  const [selectedPlace, setSelectedPlace] = useState<any>(null)

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

  const handleDelete = async (id: number) => {
    const prevItems = [...items]
    setItems(items.filter(item => item.id !== id))
    try {
      await fetch(`/api/wishlist?id=${id}`, { method: 'DELETE' })
      toast({ title: "Removido", description: "El artículo ha sido eliminado." })
    } catch (err) {
      console.error(err)
      setItems(prevItems)
      toast({ title: "Error", description: "No se pudo remover el artículo", variant: "destructive" })
    }
  }

  const handleAddClick = () => {
    toast({
      title: "Guardar artículos",
      description: "Guarda artículos tocando el corazón en tu itinerario.",
      duration: 4000
    })
  }

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(i => {
        // Fallback for older items without category (they are souvenirs)
        const cat = i.category || 'souvenir'
        return cat === filter
      })

  // Group by city
  const groupedItems = filteredItems.reduce((acc, item) => {
    const city = item.city || 'Otros'
    if (!acc[city]) acc[city] = []
    acc[city].push(item)
    return acc
  }, {} as Record<string, any[]>)

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
          <NotificationBell className="w-6 h-6" />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 pt-6 pb-8 text-center relative">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Mi Wishlist</h1>
        <p className="text-xs text-gray-500 max-w-[250px] mx-auto leading-relaxed">
          Guarda tus artículos favoritos y encuéntralos aquí cuando los necesites.
        </p>
        
        {/* Floating Add Button */}
        <button 
          onClick={handleAddClick}
          className="absolute right-6 top-6 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
            <Plus className="w-5 h-5 text-gray-900" />
          </div>
          <span className="text-[9px] font-bold text-gray-500">Agregar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 mb-6">
        <div className="flex justify-center gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('place')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filter === 'place' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Lugares
          </button>
          <button 
            onClick={() => setFilter('food')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filter === 'food' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Comida
          </button>
          <button 
            onClick={() => setFilter('souvenir')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filter === 'souvenir' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Souvenirs
          </button>
        </div>
      </div>

      {/* Sort row */}
      <div className="px-6 flex justify-between items-center mb-6">
        <span className="text-xs text-gray-400">{filteredItems.length} artículos guardados</span>
        <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
          Ordenar por: Más recientes
        </span>
      </div>

      {/* Items List */}
      <div className="px-6 space-y-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-black animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">Aún no hay elementos aquí.</p>
          </div>
        ) : (
          Object.keys(groupedItems).map((city) => (
            <div key={city} className="space-y-4">
              <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-900" />
                  <h2 className="font-serif font-bold text-lg text-gray-900">{city}</h2>
                </div>
                <span className="text-[10px] text-gray-400 mb-1">{groupedItems[city].length} artículos</span>
              </div>
              
              <div className="space-y-6 pt-2">
                {groupedItems[city].map((item) => (
                  <div 
                    key={item.id} 
                    className="flex gap-4 items-center group cursor-pointer" 
                    onClick={() => {
                      const category = item.category || 'souvenir'
                      if (category === 'food') {
                        setSelectedFood({ name: item.item_name, desc: item.item_desc, img: item.item_img, category: 'Comida', location: item.city })
                      } else {
                        // Place and souvenir fallback to PlaceDetailModal
                        setSelectedPlace({ name: item.item_name, desc: item.item_desc, img: item.item_img, location: item.city, category: category === 'place' ? 'Lugar' : 'Souvenir' })
                      }
                    }}
                  >
                    <div className="w-20 h-20 bg-[#f6f5f3] rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-50">
                      <img src={item.item_img} alt={item.item_name} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    
                    <div className="flex-1 py-1 min-w-0">
                      <h3 className="font-serif font-bold text-gray-900 text-[15px] leading-tight mb-1 truncate">{item.item_name}</h3>
                      <div className="flex items-center gap-1 text-gray-400 mb-1.5">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{item.city}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed pr-2">{item.item_desc}</p>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="p-3 text-gray-900 flex-shrink-0 active:scale-90 transition-transform"
                    >
                      <Heart className="w-6 h-6 fill-black text-black" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Tip */}
      {!loading && (
        <div className="px-6 mt-12 mb-8">
          <div className="bg-[#F0F5FF] rounded-2xl p-4 flex gap-3 items-start border border-[#E0EAFF]">
            <Info className="w-5 h-5 text-[#0066FF] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[#0044AA] mb-0.5">Tip: ¿Ves algo que te gusta?</h4>
              <p className="text-xs text-[#0055CC] leading-relaxed">
                Guárdalo en tu wishlist para tenerlo siempre a la mano tocando el corazón en cualquier parte de tu itinerario.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <FoodDetailModal 
        isOpen={!!selectedFood} 
        onClose={() => setSelectedFood(null)} 
        food={selectedFood} 
      />
      
      <PlaceDetailModal 
        isOpen={!!selectedPlace}
        onClose={() => setSelectedPlace(null)}
        place={selectedPlace}
      />

    </div>
  )
}
