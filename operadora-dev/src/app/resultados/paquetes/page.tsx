"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  MapPin, Plane, Hotel, Star, Heart, Filter,
  ArrowLeft, Calendar, Users, ChevronDown, Check,
  Package, Clock, Shield, Car, Bus, Search, ArrowRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/Logo"

interface PackageOffer {
  id: string
  destination: string
  city: string
  country: string
  duration: number // noches
  includes: ('flight' | 'hotel' | 'transfer' | 'activities' | 'insurance')[]
  hotel: {
    name: string
    stars: number
    rating: number
    reviews: number
    image: string
    mealPlan: string
  }
  flight: {
    airline: string
    airlineLogo: string
    departureTime: string
    arrivalTime: string
    stops: number
  }
  price: number
  originalPrice: number
  currency: string
  savings: number
  image: string
  featured?: boolean
  allInclusive?: boolean
}

// Datos de ejemplo de paquetes
const mockPackages: PackageOffer[] = [
  {
    id: "1",
    destination: "Cancún",
    city: "Cancún",
    country: "México",
    duration: 5,
    includes: ['flight', 'hotel', 'transfer'],
    hotel: {
      name: "Grand Fiesta Americana Coral Beach",
      stars: 5,
      rating: 4.8,
      reviews: 2345,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      mealPlan: "Todo Incluido"
    },
    flight: {
      airline: "Aeroméxico",
      airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/AM.png",
      departureTime: "08:30",
      arrivalTime: "11:15",
      stops: 0
    },
    price: 24500,
    originalPrice: 32000,
    currency: "MXN",
    savings: 7500,
    image: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800",
    featured: true,
    allInclusive: true
  },
  {
    id: "2",
    destination: "Los Cabos",
    city: "Los Cabos",
    country: "México",
    duration: 4,
    includes: ['flight', 'hotel', 'transfer', 'activities'],
    hotel: {
      name: "Marquis Los Cabos Resort & Spa",
      stars: 5,
      rating: 4.9,
      reviews: 1876,
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      mealPlan: "Desayuno incluido"
    },
    flight: {
      airline: "Volaris",
      airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/Y4.png",
      departureTime: "06:45",
      arrivalTime: "09:30",
      stops: 0
    },
    price: 28900,
    originalPrice: 35500,
    currency: "MXN",
    savings: 6600,
    image: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800",
    featured: true
  },
  {
    id: "3",
    destination: "Playa del Carmen",
    city: "Playa del Carmen",
    country: "México",
    duration: 6,
    includes: ['flight', 'hotel', 'transfer'],
    hotel: {
      name: "Xcaret México",
      stars: 5,
      rating: 4.9,
      reviews: 3421,
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      mealPlan: "Todo Incluido + Parques"
    },
    flight: {
      airline: "VivaAerobus",
      airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/VB.png",
      departureTime: "07:00",
      arrivalTime: "09:45",
      stops: 0
    },
    price: 42500,
    originalPrice: 55000,
    currency: "MXN",
    savings: 12500,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    allInclusive: true
  },
  {
    id: "4",
    destination: "Puerto Vallarta",
    city: "Puerto Vallarta",
    country: "México",
    duration: 5,
    includes: ['flight', 'hotel'],
    hotel: {
      name: "Secrets Vallarta Bay Resort",
      stars: 4,
      rating: 4.6,
      reviews: 1234,
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      mealPlan: "Solo hospedaje"
    },
    flight: {
      airline: "Aeroméxico",
      airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/AM.png",
      departureTime: "10:30",
      arrivalTime: "12:15",
      stops: 0
    },
    price: 18500,
    originalPrice: 22000,
    currency: "MXN",
    savings: 3500,
    image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800"
  },
  {
    id: "5",
    destination: "Miami",
    city: "Miami",
    country: "Estados Unidos",
    duration: 7,
    includes: ['flight', 'hotel', 'insurance'],
    hotel: {
      name: "Fontainebleau Miami Beach",
      stars: 5,
      rating: 4.7,
      reviews: 5678,
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      mealPlan: "Desayuno incluido"
    },
    flight: {
      airline: "American Airlines",
      airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/AA.png",
      departureTime: "08:00",
      arrivalTime: "14:30",
      stops: 0
    },
    price: 45000,
    originalPrice: 58000,
    currency: "MXN",
    savings: 13000,
    image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800",
    featured: true
  },
  {
    id: "6",
    destination: "Punta Cana",
    city: "Punta Cana",
    country: "República Dominicana",
    duration: 5,
    includes: ['flight', 'hotel', 'transfer', 'insurance'],
    hotel: {
      name: "Hard Rock Hotel Punta Cana",
      stars: 5,
      rating: 4.8,
      reviews: 4321,
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      mealPlan: "Todo Incluido"
    },
    flight: {
      airline: "Copa Airlines",
      airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/CM.png",
      departureTime: "06:00",
      arrivalTime: "16:30",
      stops: 1
    },
    price: 38500,
    originalPrice: 48000,
    currency: "MXN",
    savings: 9500,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    allInclusive: true
  }
]

function PackagesResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [packages, setPackages] = useState<PackageOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Filtros
  const [priceRange, setPriceRange] = useState<string>("all")
  const [durationFilter, setDurationFilter] = useState<string>("all")
  const [starsFilter, setStarsFilter] = useState<number>(0)
  const [showFilters, setShowFilters] = useState(false)

  const origin = searchParams.get("origin") || ""
  const destination = searchParams.get("destination") || ""
  const checkIn = searchParams.get("checkIn") || ""
  const checkOut = searchParams.get("checkOut") || ""
  const guests = searchParams.get("guests") || "2"

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (origin) params.set('origin', origin)
        if (destination) params.set('destination', destination)
        if (checkIn) params.set('checkIn', checkIn)
        if (checkOut) params.set('checkOut', checkOut)
        if (guests) params.set('guests', guests)

        const response = await fetch(`/api/packages/search?${params.toString()}`)
        const data = await response.json()

        if (data.success && data.data.length > 0) {
          // Transformar datos de API al formato del componente
          const transformed = data.data.map((p: Record<string, unknown>) => ({
            id: p.id?.toString() || Math.random().toString(),
            destination: (p.destination as string) || '',
            city: (p.city as string) || '',
            country: (p.country as string) || 'México',
            duration: (p.duration as number) || 5,
            includes: (p.includes as string[]) || ['flight', 'hotel'],
            hotel: p.hotel || { name: 'Hotel', stars: 4, rating: 4.5, reviews: 100, image: '', mealPlan: 'Desayuno' },
            flight: p.flight || { airline: 'Aerolínea', airlineLogo: '', departureTime: '08:00', arrivalTime: '11:00', stops: 0 },
            price: (p.price as number) || 0,
            originalPrice: (p.originalPrice as number) || 0,
            currency: (p.currency as string) || 'MXN',
            savings: (p.savings as number) || 0,
            image: (p.image as string) || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            featured: p.featured || false,
            allInclusive: p.allInclusive || false
          }))
          setPackages(transformed)
        } else {
          // Fallback a datos mock
          setPackages(mockPackages)
        }
      } catch (error) {
        console.error('Error fetching packages:', error)
        setPackages(mockPackages)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [origin, destination, checkIn, checkOut, guests])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      return newFavorites
    })
  }

  const handleReserve = (pkg: PackageOffer) => {
    const bookingData = {
      type: 'package',
      package: pkg,
      origin: origin,
      destination: pkg.destination,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests,
      totalPrice: pkg.price,
      currency: pkg.currency
    }
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
    router.push('/confirmar-reserva?type=package')
  }

  const filteredPackages = packages.filter(p => {
    // Filtro de precio
    if (priceRange === "under20k" && p.price >= 20000) return false
    if (priceRange === "20k-35k" && (p.price < 20000 || p.price > 35000)) return false
    if (priceRange === "over35k" && p.price < 35000) return false

    // Filtro de duración
    if (durationFilter === "short" && p.duration > 4) return false
    if (durationFilter === "medium" && (p.duration < 5 || p.duration > 6)) return false
    if (durationFilter === "long" && p.duration < 7) return false

    // Filtro de estrellas
    if (starsFilter > 0 && p.hotel.stars < starsFilter) return false

    return true
  })

  const getIncludeIcon = (item: string) => {
    switch (item) {
      case 'flight': return <Plane className="w-4 h-4" />
      case 'hotel': return <Hotel className="w-4 h-4" />
      case 'transfer': return <Bus className="w-4 h-4" />
      case 'activities': return <MapPin className="w-4 h-4" />
      case 'insurance': return <Shield className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Logo />
            </div>

            {/* Resumen de búsqueda */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              {origin && (
                <>
                  <span className="text-sm text-gray-600">{origin}</span>
                  <span className="text-gray-400">→</span>
                </>
              )}
              <span className="font-medium">{destination || "Cualquier destino"}</span>
              <span className="text-gray-400">|</span>
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {checkIn && checkOut ? `${checkIn} - ${checkOut}` : "Cualquier fecha"}
              </span>
              <span className="text-gray-400">|</span>
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{guests} viajeros</span>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rango de precio</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="all">Todos los precios</option>
                    <option value="under20k">Menos de $20,000</option>
                    <option value="20k-35k">$20,000 - $35,000</option>
                    <option value="over35k">Más de $35,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duración</label>
                  <select
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="all">Cualquier duración</option>
                    <option value="short">Corto (1-4 noches)</option>
                    <option value="medium">Medio (5-6 noches)</option>
                    <option value="long">Largo (7+ noches)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría hotel</label>
                  <select
                    value={starsFilter}
                    onChange={(e) => setStarsFilter(parseInt(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="0">Cualquiera</option>
                    <option value="4">4+ estrellas</option>
                    <option value="5">5 estrellas</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de filtros (desktop) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold mb-4">Filtrar por:</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Incluye</h4>
                  <div className="space-y-2">
                    {['Vuelo', 'Hotel', 'Transfer', 'Actividades', 'Seguro'].map((item) => (
                      <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Plan de comidas</h4>
                  <div className="space-y-2">
                    {['Todo Incluido', 'Desayuno incluido', 'Solo hospedaje'].map((plan) => (
                      <label key={plan} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                        {plan}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Lista de paquetes */}
          <div className="flex-1">
            {/* Título y contador */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Paquetes a {destination || "destinos populares"}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredPackages.length} paquetes disponibles • Vuelo + Hotel desde CDMX
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse flex">
                    <div className="w-72 h-56 bg-gray-200" />
                    <div className="flex-1 p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        {/* Imagen */}
                        <div className="relative w-full md:w-72 h-56 flex-shrink-0">
                          <img
                            src={pkg.image}
                            alt={pkg.destination}
                            className="w-full h-full object-cover"
                          />
                          {/* Badge de noches */}
                          <span className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-full text-sm font-semibold">
                            {pkg.duration} noches
                          </span>
                          {/* Badge todo incluido */}
                          {pkg.allInclusive && (
                            <span className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Todo Incluido
                            </span>
                          )}
                          {/* Favorito */}
                          <button
                            onClick={() => toggleFavorite(pkg.id)}
                            className="absolute bottom-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white"
                          >
                            <Heart
                              className={`w-5 h-5 ${favorites.has(pkg.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                            />
                          </button>
                        </div>

                        {/* Información */}
                        <div className="flex-1 p-4 flex flex-col">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-lg">{pkg.destination}</h3>
                              <p className="text-gray-600 text-sm">{pkg.country}</p>
                            </div>
                            {pkg.featured && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                Recomendado
                              </span>
                            )}
                          </div>

                          {/* Hotel */}
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={pkg.hotel.image}
                              alt={pkg.hotel.name}
                              className="w-16 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium text-sm">{pkg.hotel.name}</p>
                              <div className="flex items-center gap-1">
                                {[...Array(pkg.hotel.stars)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="text-sm text-gray-600 ml-1">
                                  {pkg.hotel.rating} ({pkg.hotel.reviews})
                                </span>
                              </div>
                              <p className="text-xs text-green-600 font-medium">{pkg.hotel.mealPlan}</p>
                            </div>
                          </div>

                          {/* Vuelo */}
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <img
                              src={pkg.flight.airlineLogo}
                              alt={pkg.flight.airline}
                              className="w-5 h-5"
                            />
                            <span>{pkg.flight.airline}</span>
                            <span className="text-gray-400">|</span>
                            <span>{pkg.flight.departureTime} - {pkg.flight.arrivalTime}</span>
                            <span className={pkg.flight.stops === 0 ? "text-green-600" : "text-orange-600"}>
                              {pkg.flight.stops === 0 ? "Directo" : `${pkg.flight.stops} escala${pkg.flight.stops > 1 ? 's' : ''}`}
                            </span>
                          </div>

                          {/* Incluye */}
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs text-gray-500">Incluye:</span>
                            {pkg.includes.map((item) => (
                              <span key={item} className="flex items-center gap-1 text-xs text-gray-600" title={item}>
                                {getIncludeIcon(item)}
                              </span>
                            ))}
                          </div>

                          {/* Precio */}
                          <div className="mt-auto flex items-end justify-between pt-3 border-t">
                            <div>
                              <p className="text-xs text-gray-500 line-through">
                                ${pkg.originalPrice.toLocaleString()} {pkg.currency}
                              </p>
                              <p className="text-xs text-green-600 font-medium">
                                Ahorras ${pkg.savings.toLocaleString()} {pkg.currency}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                ${pkg.price.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">{pkg.currency} por persona</p>
                              <Button
                                onClick={() => router.push(`/paquete/${pkg.id}`)}
                                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Ver Paquete
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Sin resultados */}
            {!loading && filteredPackages.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No encontramos paquetes</h3>
                <p className="text-gray-600 mb-4">
                  Intenta ajustar los filtros o buscar otro destino
                </p>
                <Button onClick={() => router.push("/")}>
                  Volver al inicio
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PackagesResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    }>
      <PackagesResultsContent />
    </Suspense>
  )
}
