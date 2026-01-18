"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  MapPin, Home, Star, Heart, Filter, ChevronDown,
  Wifi, Car, UtensilsCrossed, Waves, ArrowLeft,
  Users, BedDouble, Bath, Calendar, DollarSign, Search, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/Logo"

interface Property {
  id: string
  name: string
  type: 'casa' | 'departamento' | 'villa' | 'cabana'
  location: string
  city: string
  country: string
  price: number
  currency: string
  rating: number
  reviews: number
  guests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  images: string[]
  host: {
    name: string
    superhost: boolean
  }
  featured?: boolean
}

// Datos de ejemplo para casas y departamentos
const mockProperties: Property[] = [
  {
    id: "1",
    name: "Casa con vista al mar en Cancún",
    type: "casa",
    location: "Zona Hotelera",
    city: "Cancún",
    country: "México",
    price: 3500,
    currency: "MXN",
    rating: 4.9,
    reviews: 127,
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ["wifi", "piscina", "estacionamiento", "cocina", "aire acondicionado"],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
    ],
    host: { name: "María", superhost: true },
    featured: true
  },
  {
    id: "2",
    name: "Departamento moderno en Polanco",
    type: "departamento",
    location: "Polanco",
    city: "Ciudad de México",
    country: "México",
    price: 2200,
    currency: "MXN",
    rating: 4.8,
    reviews: 89,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["wifi", "gimnasio", "estacionamiento", "cocina"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ],
    host: { name: "Carlos", superhost: false }
  },
  {
    id: "3",
    name: "Villa de lujo en Los Cabos",
    type: "villa",
    location: "Palmilla",
    city: "Los Cabos",
    country: "México",
    price: 8500,
    currency: "MXN",
    rating: 5.0,
    reviews: 45,
    guests: 12,
    bedrooms: 6,
    bathrooms: 5,
    amenities: ["wifi", "piscina", "jacuzzi", "estacionamiento", "cocina", "vista al mar"],
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
    ],
    host: { name: "Roberto", superhost: true },
    featured: true
  },
  {
    id: "4",
    name: "Cabaña en el bosque - Valle de Bravo",
    type: "cabana",
    location: "Avándaro",
    city: "Valle de Bravo",
    country: "México",
    price: 1800,
    currency: "MXN",
    rating: 4.7,
    reviews: 62,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["wifi", "chimenea", "estacionamiento", "cocina", "jardín"],
    images: [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800"
    ],
    host: { name: "Laura", superhost: true }
  },
  {
    id: "5",
    name: "Penthouse con terraza en Playa del Carmen",
    type: "departamento",
    location: "Quinta Avenida",
    city: "Playa del Carmen",
    country: "México",
    price: 4200,
    currency: "MXN",
    rating: 4.9,
    reviews: 156,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["wifi", "piscina", "terraza", "cocina", "vista al mar"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ],
    host: { name: "Ana", superhost: true },
    featured: true
  },
  {
    id: "6",
    name: "Casa colonial en San Miguel de Allende",
    type: "casa",
    location: "Centro Histórico",
    city: "San Miguel de Allende",
    country: "México",
    price: 2800,
    currency: "MXN",
    rating: 4.8,
    reviews: 94,
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ["wifi", "patio", "estacionamiento", "cocina"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
    ],
    host: { name: "Fernando", superhost: false }
  }
]

function ASHomeResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Filtros
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [propertyType, setPropertyType] = useState<string>("all")
  const [minRating, setMinRating] = useState<number>(0)
  const [bedroomsFilter, setBedroomsFilter] = useState<string>("all")
  const [amenitiesFilter, setAmenitiesFilter] = useState<string[]>([])

  // Campos de búsqueda editables
  const [searchDestination, setSearchDestination] = useState(searchParams.get("destination") || "")
  const [searchCheckIn, setSearchCheckIn] = useState(searchParams.get("checkIn") || "")
  const [searchCheckOut, setSearchCheckOut] = useState(searchParams.get("checkOut") || "")
  const [searchGuests, setSearchGuests] = useState(searchParams.get("guests") || "2")

  const destination = searchParams.get("destination") || ""
  const checkIn = searchParams.get("checkIn") || ""
  const checkOut = searchParams.get("checkOut") || ""
  const guests = searchParams.get("guests") || "2"

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (destination) params.set('city', destination)
        if (guests) params.set('guests', guests)

        const response = await fetch(`/api/ashome/properties?${params.toString()}`)
        const data = await response.json()

        if (data.success && data.data.length > 0) {
          const transformed = data.data.map((p: Record<string, unknown>) => ({
            id: p.id?.toString() || Math.random().toString(),
            name: p.title || p.name || 'Propiedad',
            type: p.property_type || 'casa',
            location: p.address || '',
            city: p.city || '',
            country: p.country || 'México',
            price: p.price_per_night || 0,
            currency: 'MXN',
            rating: p.rating || 4.5,
            reviews: p.reviews_count || 0,
            guests: p.guests_max || 4,
            bedrooms: p.bedrooms || 1,
            bathrooms: p.bathrooms || 1,
            amenities: Array.isArray(p.amenities) ? p.amenities : JSON.parse(p.amenities as string || '[]'),
            images: Array.isArray(p.photos) ? p.photos : [p.photos || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
            host: { name: p.host_name || 'Anfitrión', superhost: p.is_superhost || false },
            featured: p.is_featured || false
          }))
          setProperties(transformed)
        } else {
          setProperties(mockProperties)
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
        setProperties(mockProperties)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [destination, guests])

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

  const handleSearch = () => {
    const params = new URLSearchParams({
      destination: searchDestination,
      checkIn: searchCheckIn,
      checkOut: searchCheckOut,
      guests: searchGuests
    })
    router.push(`/resultados/ashome?${params.toString()}`)
  }

  const handleReserve = (property: Property) => {
    const bookingData = {
      type: 'ashome',
      property: property,
      destination: property.city,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests,
      totalPrice: property.price,
      currency: property.currency
    }
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
    router.push('/confirmar-reserva?type=ashome')
  }

  const filteredProperties = properties.filter(p => {
    if (propertyType !== "all" && p.type !== propertyType) return false
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false
    if (p.rating < minRating) return false
    if (bedroomsFilter !== "all" && p.bedrooms < parseInt(bedroomsFilter)) return false
    if (amenitiesFilter.length > 0) {
      const hasAllAmenities = amenitiesFilter.every(a => p.amenities.includes(a))
      if (!hasAllAmenities) return false
    }
    return true
  })

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi": return <Wifi className="w-4 h-4" />
      case "piscina": return <Waves className="w-4 h-4" />
      case "estacionamiento": return <Car className="w-4 h-4" />
      case "cocina": return <UtensilsCrossed className="w-4 h-4" />
      default: return null
    }
  }

  const toggleAmenity = (amenity: string) => {
    setAmenitiesFilter(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Barra de búsqueda editable */}
        <Card className="p-4 mb-6 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Destino</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  placeholder="País, estado, ciudad..."
                  className="pl-10 h-10"
                  list="ashome-destinations-list"
                />
                <datalist id="ashome-destinations-list">
                  <option value="Cancún, Quintana Roo, México" />
                  <option value="Playa del Carmen, Quintana Roo, México" />
                  <option value="Tulum, Quintana Roo, México" />
                  <option value="Los Cabos, Baja California Sur, México" />
                  <option value="Puerto Vallarta, Jalisco, México" />
                  <option value="Ciudad de México, CDMX, México" />
                  <option value="San Miguel de Allende, Guanajuato, México" />
                  <option value="Valle de Bravo, Estado de México, México" />
                  <option value="Oaxaca, Oaxaca, México" />
                  <option value="Mérida, Yucatán, México" />
                  <option value="Miami, Florida, Estados Unidos" />
                  <option value="Nueva York, New York, Estados Unidos" />
                  <option value="Madrid, España" />
                  <option value="Barcelona, España" />
                  <option value="París, Francia" />
                </datalist>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Check-in</label>
              <Input
                type="date"
                value={searchCheckIn}
                onChange={(e) => setSearchCheckIn(e.target.value)}
                className="h-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Check-out</label>
              <Input
                type="date"
                value={searchCheckOut}
                onChange={(e) => setSearchCheckOut(e.target.value)}
                className="h-10"
                min={searchCheckIn || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Huéspedes</label>
              <select
                value={searchGuests}
                onChange={(e) => setSearchGuests(e.target.value)}
                className="w-full h-10 px-3 border rounded-lg bg-white text-sm"
              >
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'huésped' : 'huéspedes'}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleSearch}
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </Card>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de filtros a la izquierda */}
          <aside className="lg:w-72 flex-shrink-0">
            <Card className="p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </h3>

              <div className="space-y-5">
                {/* Tipo de propiedad */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de propiedad</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="villa">Villa</option>
                    <option value="cabana">Cabaña</option>
                  </select>
                </div>

                {/* Rango de precio */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Precio por noche (MXN)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="h-10"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Habitaciones */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Habitaciones mínimas</label>
                  <select
                    value={bedroomsFilter}
                    onChange={(e) => setBedroomsFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option value="all">Cualquiera</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Calificación mínima */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Calificación mínima</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option value="0">Cualquiera</option>
                    <option value="4">4+ estrellas</option>
                    <option value="4.5">4.5+ estrellas</option>
                    <option value="4.8">4.8+ estrellas</option>
                  </select>
                </div>

                {/* Amenidades */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Amenidades</label>
                  <div className="space-y-2">
                    {['wifi', 'piscina', 'estacionamiento', 'cocina'].map(amenity => (
                      <label key={amenity} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesFilter.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="capitalize">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Solo Superanfitriones */}
                <div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                    <span>Solo Superanfitriones</span>
                  </label>
                </div>
              </div>
            </Card>
          </aside>

          {/* Lista de propiedades */}
          <div className="flex-1">
            {/* Título y contador */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {destination ? `Casas en ${destination}` : "Todas las propiedades"}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProperties.length} propiedades disponibles
                {checkIn && checkOut && ` • ${checkIn} - ${checkOut}`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                      {/* Imagen principal */}
                      <div className="relative h-64">
                        <img
                          src={property.images[0]}
                          alt={property.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {property.host.superhost && (
                          <span className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-semibold">
                            Superanfitrión
                          </span>
                        )}
                        {property.featured && (
                          <span className="absolute top-3 right-12 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Destacado
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(property.id)
                          }}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                        >
                          <Heart
                            className={`w-5 h-5 ${favorites.has(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                          />
                        </button>
                      </div>

                      {/* Información */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 capitalize">{property.type}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{property.rating}</span>
                            <span className="text-gray-500">({property.reviews})</span>
                          </div>
                        </div>

                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                          {property.name}
                        </h3>

                        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {property.location}, {property.city}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {property.guests}
                          </span>
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-4 h-4" />
                            {property.bedrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {property.bathrooms}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {property.amenities.slice(0, 4).map(amenity => (
                            <span
                              key={amenity}
                              className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full"
                            >
                              {getAmenityIcon(amenity)}
                              <span className="capitalize">{amenity}</span>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-end justify-between pt-3 border-t">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">
                              ${property.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">{property.currency}</span>
                            </p>
                            <p className="text-xs text-gray-500">por noche</p>
                          </div>
                          <Button
                            onClick={() => handleReserve(property)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Reservar
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Sin resultados */}
            {!loading && filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No encontramos propiedades</h3>
                <p className="text-gray-600 mb-4">
                  Intenta ajustar los filtros o buscar en otra ubicación
                </p>
                <Button onClick={() => router.push('/')}>
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

export default function ASHomeResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    }>
      <ASHomeResultsContent />
    </Suspense>
  )
}
