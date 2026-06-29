"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, ArrowLeft, MapPin, Compass, Landmark, Coffee, BadgeHelp, Navigation } from "lucide-react"
import { useRouter } from "next/navigation"

interface Place {
  id: number
  name: string
  category: string
  lat: number
  lng: number
  desc: string
  icon: any
}

export default function MobileMapPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Monumentos")
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locError, setLocError] = useState<string | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error)
          setLocError("No pudimos obtener tu ubicación real.")
          // Fallback a CDMX si falla
          setUserLocation({ lat: 19.4326, lng: -99.1332 })
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      setLocError("Geolocalización no soportada por el navegador.")
      // Fallback a CDMX
      setUserLocation({ lat: 19.4326, lng: -99.1332 })
    }
  }, [])

  const categories = [
    { name: "Monumentos", icon: Landmark },
    { name: "Restaurantes", icon: Coffee },
    { name: "Museos", icon: Compass },
    { name: "Baños públicos", icon: BadgeHelp }
  ]

  const places: Place[] = [
    {
      id: 1,
      name: "Palacio de Bellas Artes",
      category: "Monumentos",
      lat: 19.4344,
      lng: -99.1412,
      desc: "Centro cultural más importante de México y monumento icónico de la CDMX.",
      icon: Landmark
    },
    {
      id: 2,
      name: "Catedral Metropolitana",
      category: "Monumentos",
      lat: 19.4326,
      lng: -99.1332,
      desc: "Monumento arquitectónico principal en el Zócalo de la Ciudad de México.",
      icon: Landmark
    },
    {
      id: 3,
      name: "Restaurante Gran Central",
      category: "Restaurantes",
      lat: 19.4356,
      lng: -99.1376,
      desc: "Comida gourmet e internacional con un ambiente tradicional y elegante.",
      icon: Coffee
    },
    {
      id: 4,
      name: "Museo Franz Mayer",
      category: "Museos",
      lat: 19.4372,
      lng: -99.1428,
      desc: "Colecciones de arte decorativo, diseño y fotografía temporal.",
      icon: Compass
    }
  ]

  const filteredPlaces = places.filter(p => {
    const matchesCategory = p.category === selectedCategory
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">
      {/* Search Bar Floating Container */}
      <div className="absolute top-4 left-4 right-4 z-20 flex gap-2 items-center">
        <button 
          onClick={() => router.push("/mobile")} 
          className="w-11 h-11 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-full flex items-center justify-center shadow-lg border"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="relative flex-1">
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar lugares, museos, hoteles..."
            className="pl-10 h-11 bg-white border-none rounded-full shadow-lg text-sm"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
        </div>
        <button className="w-11 h-11 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-full flex items-center justify-center shadow-lg border">
          <SlidersHorizontal className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Horizontal Category Chips */}
      <div className="absolute top-18 left-0 right-0 z-20 px-4 overflow-x-auto flex gap-2 pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name)
                setSelectedPlace(null)
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-md border-0 ${
                selectedCategory === cat.name 
                  ? "bg-black text-white" 
                  : "bg-white text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Interactive Map Canvas Wrapper (Static Premium Map representation) */}
      <div className="flex-1 w-full bg-slate-200 relative overflow-hidden">
        {/* Real Interactive OpenStreetMap or dynamic layout representation */}
        {userLocation ? (
          <iframe
            src={`https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&hl=es&z=15&output=embed`}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen={false}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 absolute inset-0 bg-slate-200">
            <Compass className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm font-bold">Obteniendo tu ubicación GPS...</span>
          </div>
        )}


        {/* Visual Map Pin Icons overlapping (Representing places list for quick touch) */}
        {filteredPlaces.map((place) => (
          <button
            key={place.id}
            onClick={() => setSelectedPlace(place)}
            className="absolute z-10 w-8 h-8 bg-black hover:bg-blue-600 active:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-all border border-white"
            style={{
              top: `${40 + place.id * 8}%`,
              left: `${30 + place.id * 12}%`
            }}
          >
            <MapPin className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Dynamic Detail Bottom Drawer */}
      <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl shadow-2xl border-t z-30 p-5">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {selectedPlace ? (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-primary tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                  {selectedPlace.category}
                </span>
                <h3 className="font-extrabold text-lg text-gray-900 mt-1">{selectedPlace.name}</h3>
              </div>
              <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Navigation className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{selectedPlace.desc}</p>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setSelectedPlace(null)}
                className="w-full py-2.5 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Explora el mapa</h3>
            <p className="text-xs text-gray-400 mt-1">Selecciona un marcador en el mapa o busca puntos de interés en la barra superior.</p>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              {filteredPlaces.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedPlace(p)}
                  className="p-3 border rounded-xl hover:bg-gray-50 active:bg-gray-100 cursor-pointer flex gap-3 items-center"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-gray-900 truncate">{p.name}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{p.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
