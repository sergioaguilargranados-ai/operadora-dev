"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, ShoppingCart, Search, SlidersHorizontal, ShoppingBag, Heart } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function MobileStorePage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todos")

  const categories = ["Todos", "Equipaje", "Accesorios", "Viaje", "Tecnología"]

  const products = [
    {
      id: 1,
      name: "Maleta de cabina",
      desc: "Ligera, resistente y perfecta para cualquier destino.",
      price: "$2,199 MXN",
      img: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 2,
      name: "Almohada de viaje",
      desc: "Ergonómica y cómoda para descansar mejor.",
      price: "$599 MXN",
      img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 3,
      name: "Organizador de viaje",
      desc: "Mantén todo en su lugar durante tu viaje.",
      price: "$499 MXN",
      img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 4,
      name: "Batería portátil",
      desc: "Carga tus dispositivos en cualquier lugar.",
      price: "$799 MXN",
      img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=300&q=80"
    }
  ]

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      
      {/* Dark Header Section */}
      <div className="bg-black text-white px-4 pt-12 pb-24 relative rounded-b-3xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="text-white hover:text-gray-300">
            <ChevronLeft className="w-7 h-7" />
          </button>
          
          <img
            src="/logo-white.png"
            alt="AS Operadora"
            className="h-10 object-contain invert"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/logo.png"
            }}
          />

          <div className="flex gap-4">
            <button className="text-white hover:text-gray-300">
              <Bell className="w-6 h-6" />
            </button>
            <button className="text-white hover:text-gray-300">
              <ShoppingCart className="w-6 h-6" />
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

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col cursor-pointer active:scale-95 transition-transform">
              
              {/* Image & Heart */}
              <div className="relative bg-[#f6f5f3] p-4 h-40 flex items-center justify-center">
                <img src={product.img} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Details */}
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{product.name}</h3>
                <p className="text-[10px] text-gray-500 leading-tight flex-1 mb-2">
                  {product.desc}
                </p>
                <p className="font-bold text-gray-900 text-sm">{product.price}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
