"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, MapPin, Loader2, Heart, Plus, Info, Image as ImageIcon, FileText, Camera, Upload, X } from "lucide-react"
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

  // Modal states for adding an item
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newType, setNewType] = useState<'place' | 'food' | 'souvenir'>('place')
  const [newDest, setNewDest] = useState('')
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newImg, setNewImg] = useState('')
  const [uploadingImg, setUploadingImg] = useState(false)
  const [savingItem, setSavingItem] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setIsAddModalOpen(true)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadingImg(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData
        })
        const data = await res.json()
        if (data.success) {
          setNewImg(data.url)
          toast({ title: 'Imagen subida', description: 'La foto se ha cargado correctamente.' })
        } else {
          toast({ title: 'Error', description: 'No se pudo subir la imagen.', variant: 'destructive' })
        }
      } catch (err) {
        console.error(err)
        toast({ title: 'Error', description: 'Error al conectar para subir la imagen.', variant: 'destructive' })
      } finally {
        setUploadingImg(false)
      }
    }
  }

  const handleSaveWishlistItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newDest.trim()) {
      toast({ title: 'Campos requeridos', description: 'Por favor completa el Nombre y el Destino.', variant: 'destructive' })
      return
    }
    
    setSavingItem(true)
    try {
      const fallbackImgs = {
        food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
        place: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80",
        souvenir: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80"
      }
      
      const payload = {
        user_id: user?.id,
        item_name: newName,
        item_desc: newDesc,
        item_img: newImg || fallbackImgs[newType],
        city: newDest,
        category: newType
      }
      
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Guardado', description: 'Artículo agregado a tu wishlist.' })
        setIsAddModalOpen(false)
        // Reset form
        setNewType('place')
        setNewDest('')
        setNewName('')
        setNewDesc('')
        setNewImg('')
        // Refresh list
        fetchWishlist()
      } else {
        toast({ title: 'Error', description: data.error || 'No se pudo guardar el artículo.', variant: 'destructive' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Error', description: 'Error al conectar con la base de datos.', variant: 'destructive' })
    } finally {
      setSavingItem(false)
    }
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

      {/* Modal Agregar a tu Wishlist */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 relative animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col font-sans">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 flex-shrink-0" />
            
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 absolute top-6 right-6"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">Agregar a tu wishlist</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Guarda ese lugar, comida o souvenir que no quieres olvidar.
            </p>

            <form onSubmit={handleSaveWishlistItem} className="space-y-4">
              {/* Tipo */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Tipo
                </span>
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  {(['place', 'food', 'souvenir'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewType(type)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        newType === type ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {type === 'place' ? 'Lugar' : type === 'food' ? 'Comida' : 'Souvenir'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destino */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Destino
                </label>
                <input
                  type="text"
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  placeholder="Ej. París, Francia"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>

              {/* Nombre */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Nombre
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Torre Eiffel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Descripción (opcional)
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Agrega detalles que quieras recordar..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
                />
              </div>

              {/* Agregar foto */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Agregar foto (opcional)
                </span>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:border-black transition-colors flex flex-col items-center justify-center bg-gray-50 relative min-h-[90px]"
                >
                  {uploadingImg ? (
                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                  ) : newImg ? (
                    <div className="w-full flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <img src={newImg} alt="Preview" className="h-10 w-10 object-cover rounded-lg border" />
                        <span className="text-[10px] text-green-600 font-bold">¡Imagen cargada!</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setNewImg(''); }}
                        className="text-red-500 p-1 hover:bg-red-50 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-700">Toca para seleccionar una foto</span>
                      <span className="text-[9px] text-gray-400">JPG, PNG - Máx. 5MB</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Acciones */}
              <div className="pt-4 space-y-2">
                <button
                  type="submit"
                  disabled={savingItem || uploadingImg}
                  className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {savingItem && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar en wishlist
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full text-center py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
