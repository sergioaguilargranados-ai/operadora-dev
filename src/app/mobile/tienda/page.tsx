"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, Heart, ShoppingCart, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Product {
  id: number
  name: string
  desc: string
  price: number
  category: string
  image: string
}

export default function MobileStorePage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<number[]>([])

  const categories = ["Todos", "Equipaje", "Accesorios", "Viaje", "Tecnología"]

  const products: Product[] = [
    {
      id: 1,
      name: "Maleta de cabina",
      desc: "Ligera, resistente y perfecta para cualquier destino.",
      price: 2199,
      category: "Equipaje",
      image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=500&fit=crop"
    },
    {
      id: 2,
      name: "Almohada de viaje",
      desc: "Ergonómica y cómoda para descansar mejor.",
      price: 599,
      category: "Accesorios",
      image: "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=500&fit=crop"
    },
    {
      id: 3,
      name: "Organizador de viaje",
      desc: "Mantén todo en su lugar durante tu viaje.",
      price: 499,
      category: "Viaje",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&fit=crop"
    },
    {
      id: 4,
      name: "Batería portátil",
      desc: "Carga tus dispositivos en cualquier lugar.",
      price: 799,
      category: "Tecnología",
      image: "https://images.unsplash.com/photo-1609592424109-dd7734f01ee7?w=500&fit=crop"
    }
  ]

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex flex-col min-h-full bg-gray-50 pb-8">
      {/* Header Banner */}
      <div className="bg-black text-white p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push("/mobile")} className="p-1 hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold">Tienda de Viaje</h2>
          <div className="relative">
            <ShoppingCart className="w-6 h-6 cursor-pointer" />
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
          </div>
        </div>
        <p className="text-xs text-gray-400">Descubre productos y servicios pensados para tu viaje.</p>
      </div>

      {/* Search & Filters */}
      <div className="p-4 flex gap-3 items-center">
        <div className="relative flex-1">
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="pl-10 h-11 bg-white border-gray-200"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
        </div>
        <button className="w-11 h-11 border border-gray-200 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100">
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="px-4 overflow-x-auto flex gap-2 pb-3 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
              activeCategory === cat 
                ? "bg-black text-white" 
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="relative h-36 bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => toggleFavorite(product.id)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-sm"
              >
                <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </button>
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{product.desc}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <span className="font-extrabold text-sm text-gray-900">
                  ${product.price.toLocaleString("es-MX")} <span className="text-[10px] text-gray-500 font-normal">MXN</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
