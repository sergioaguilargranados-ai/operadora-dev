"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, ShoppingCart, Search, SlidersHorizontal, ShoppingBag, Heart, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { useCart } from "@/contexts/CartContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"

export default function MobileStorePage() {
  const router = useRouter()
  const { logoUrl, logoDarkUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoDarkUrl || logoMobileUrl || logoUrl || null
  const { addToCart, cartCount } = useCart()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const categories = ["Todos", "Equipaje", "Accesorios", "Viaje", "Tecnología"]

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/store-products?tenant_id=1")
      const data = await res.json()
      if (data.success) {
        setProducts(data.data.filter((p: any) => p.status === 'active'))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      
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

          <div className="flex gap-4">
            <button onClick={() => router.push('/mobile/notificaciones')} className="text-white hover:text-gray-300">
              <Bell className="w-6 h-6" />
            </button>
            <button onClick={() => router.push('/mobile/tienda/carrito')} className="text-white hover:text-gray-300 relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Title & Icon */}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h1 className="text-4xl font-serif mb-2">Tienda</h1>
            <p className="text-sm text-gray-300 leading-tight">
              Descubre productos y servicios pensados para tu viaje.
            </p>
          </div>
          
          <div className="w-20 h-20 rounded-full border border-white flex items-center justify-center bg-transparent flex-shrink-0">
            <ShoppingBag className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Main Content Area (Overlapping Card) */}
      <div className="bg-white rounded-t-3xl -mt-12 relative z-10 px-4 pt-6 min-h-screen">
        
        {/* Search & Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Buscar productos..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 rounded-full bg-gray-50 border-transparent focus-visible:ring-black text-base placeholder:text-gray-400"
            />
          </div>
          <button className="h-12 px-4 rounded-full bg-gray-50 flex items-center gap-2 text-sm font-bold text-gray-900 border border-gray-100 flex-shrink-0 active:scale-95 transition-transform">
            <SlidersHorizontal className="w-4 h-4" /> Filtros
          </button>
        </div>

        {/* Categories (Horizontal Scroll) */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-black text-white' : 'bg-gray-50 text-gray-600 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Title */}
        <h2 className="text-xl font-serif font-bold text-gray-900 mt-2 mb-4">
          Catálogo de productos
        </h2>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-black mb-2" />
            <p className="text-sm text-gray-500">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No hay productos disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col active:scale-95 transition-transform"
              >
                <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                  )}
                  <button className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2 flex-1">{product.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      {product.offer_price ? (
                        <>
                          <span className="font-bold text-black text-sm">${product.offer_price}</span>
                          <span className="text-[10px] text-gray-400 line-through block -mt-1">${product.price}</span>
                        </>
                      ) : (
                        <span className="font-bold text-black text-sm">${product.price}</span>
                      )}
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
