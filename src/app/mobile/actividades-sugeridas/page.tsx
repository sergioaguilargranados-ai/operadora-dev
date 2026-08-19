"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Search, Star, Clock, MapPin, Sun, Heart } from "lucide-react"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"

export default function MobileSuggestedActivitiesPage() {
  const router = useRouter()
  const { logoUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  const [search, setSearch] = useState("")

  const suggestedActivities = [
    {
      id: "1",
      title: "Tour por el Palacio Real",
      rating: 4.9,
      reviews: 128,
      duration: "2 h 30 min",
      price: "Desde $38 USD",
      location: "A 12 minutos de tu hotel",
      image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "2",
      title: "Clase de Paella Tradicional",
      rating: 4.9,
      reviews: 96,
      duration: "3 horas",
      price: "Incluye degustación",
      location: "Centro histórico",
      image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "3",
      title: "Museo del Prado sin filas",
      rating: 4.8,
      reviews: 210,
      duration: "Entrada incluida",
      price: "Flexible",
      location: "Paseo del Prado",
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80",
    },
  ]

  const filteredActivities = suggestedActivities.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <MobileLogo variant="dark" size="md" logoUrl={customLogoUrl} />
        <div className="w-6" /> {/* Spacer */}
      </div>

      <div className="px-5 pt-6 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">
            ¿No sabes qué actividad hacer?
          </h1>
          <p className="text-xs text-gray-500">
            Recomendaciones personalizadas basadas en tu destino, el clima de hoy y experiencias exclusivas.
          </p>
        </div>

        {/* Actividades sugeridas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Actividades recomendadas</h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destino activo</span>
          </div>
          <div className="space-y-4">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="bg-white border border-gray-100 rounded-2xl p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex gap-3 items-center"
              >
                <img
                  src={act.image}
                  alt={act.title}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate mb-1">{act.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-medium mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{act.rating}</span>
                    <span className="text-gray-400 font-normal">({act.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{act.duration}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-gray-700 mb-1">
                    {act.price}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{act.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/mobile/mapa?q=${encodeURIComponent(`${act.title} ${act.location}`)}`)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-800 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors flex-shrink-0 self-end"
                >
                  Ver mapa
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Banner Ideal para hoy */}
        <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sun className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Ideal para hoy</span>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Parque del Retiro</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
              Con el clima actual es un excelente momento para recorrer el parque en bicicleta o pasear en bote.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] text-gray-600 font-medium">
                <span>⛅ 28°</span>
                <span>🚶 15 min</span>
                <span className="text-green-700 font-bold">Gratis</span>
              </div>
              <button
                onClick={() => router.push(`/mobile/mapa?q=${encodeURIComponent('Parque del Retiro Madrid')}`)}
                className="px-3 py-1 border border-gray-300 text-gray-800 rounded-xl text-xs font-medium bg-white hover:bg-gray-50 transition-colors"
              >
                Cómo llegar
              </button>
            </div>
          </div>
        </div>

        {/* Favoritos */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900">Favoritos</h2>
            <button onClick={() => router.push('/mobile/wishlist')} className="text-xs text-gray-500 hover:text-black">
              Ver todos &gt;
            </button>
          </div>
          <div
            onClick={() => router.push('/mobile/wishlist')}
            className="bg-white border border-gray-100 rounded-2xl p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs text-gray-500"
          >
            <Heart className="w-4 h-4 text-gray-400" />
            <span>Guarda actividades para decidir después</span>
          </div>
        </div>
      </div>
    </div>
  )
}
