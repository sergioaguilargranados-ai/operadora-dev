"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Car, MapPin, Calendar, Clock, Users, Filter, ChevronDown,
  ArrowLeft, Star, Check, Fuel, Settings, Briefcase, Shield,
  Heart, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/Logo"

interface CarResult {
  id: string
  brand: string
  model: string
  category: string // Económico, Compacto, SUV, etc.
  image: string
  seats: number
  doors: number
  transmission: 'automatic' | 'manual'
  fuelType: string
  luggage: number // maletas grandes
  smallLuggage: number // maletas pequeñas
  ac: boolean
  provider: string
  providerLogo: string
  pricePerDay: number
  totalPrice: number
  currency: string
  features: string[]
  unlimited: boolean // kilometraje ilimitado
  insurance: string
}

// Mock data de autos
const mockCars: CarResult[] = [
  {
    id: "1",
    brand: "Nissan",
    model: "Versa",
    category: "Económico",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400",
    seats: 5,
    doors: 4,
    transmission: "automatic",
    fuelType: "Gasolina",
    luggage: 2,
    smallLuggage: 1,
    ac: true,
    provider: "Hertz",
    providerLogo: "https://www.hertz.com/favicon.ico",
    pricePerDay: 450,
    totalPrice: 2250,
    currency: "MXN",
    features: ["GPS", "Seguro básico"],
    unlimited: true,
    insurance: "Básico"
  },
  {
    id: "2",
    brand: "Toyota",
    model: "Corolla",
    category: "Compacto",
    image: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400",
    seats: 5,
    doors: 4,
    transmission: "automatic",
    fuelType: "Gasolina",
    luggage: 3,
    smallLuggage: 2,
    ac: true,
    provider: "Avis",
    providerLogo: "https://www.avis.com/favicon.ico",
    pricePerDay: 650,
    totalPrice: 3250,
    currency: "MXN",
    features: ["GPS", "Seguro completo", "Asistencia 24h"],
    unlimited: true,
    insurance: "Completo"
  },
  {
    id: "3",
    brand: "Chevrolet",
    model: "Equinox",
    category: "SUV",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400",
    seats: 5,
    doors: 4,
    transmission: "automatic",
    fuelType: "Gasolina",
    luggage: 4,
    smallLuggage: 2,
    ac: true,
    provider: "Enterprise",
    providerLogo: "https://www.enterprise.com/favicon.ico",
    pricePerDay: 950,
    totalPrice: 4750,
    currency: "MXN",
    features: ["GPS", "Seguro premium", "WiFi", "Asistencia 24h"],
    unlimited: true,
    insurance: "Premium"
  },
  {
    id: "4",
    brand: "Volkswagen",
    model: "Jetta",
    category: "Intermedio",
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400",
    seats: 5,
    doors: 4,
    transmission: "automatic",
    fuelType: "Gasolina",
    luggage: 3,
    smallLuggage: 2,
    ac: true,
    provider: "Budget",
    providerLogo: "https://www.budget.com/favicon.ico",
    pricePerDay: 580,
    totalPrice: 2900,
    currency: "MXN",
    features: ["Bluetooth", "Seguro básico"],
    unlimited: false,
    insurance: "Básico"
  },
  {
    id: "5",
    brand: "Ford",
    model: "Explorer",
    category: "SUV Premium",
    image: "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400",
    seats: 7,
    doors: 4,
    transmission: "automatic",
    fuelType: "Gasolina",
    luggage: 5,
    smallLuggage: 3,
    ac: true,
    provider: "National",
    providerLogo: "https://www.nationalcar.com/favicon.ico",
    pricePerDay: 1450,
    totalPrice: 7250,
    currency: "MXN",
    features: ["GPS", "Seguro premium", "WiFi", "Asientos piel", "Asistencia 24h"],
    unlimited: true,
    insurance: "Premium"
  },
  {
    id: "6",
    brand: "Kia",
    model: "Rio",
    category: "Económico",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
    seats: 5,
    doors: 4,
    transmission: "manual",
    fuelType: "Gasolina",
    luggage: 2,
    smallLuggage: 1,
    ac: true,
    provider: "Alamo",
    providerLogo: "https://www.alamo.com/favicon.ico",
    pricePerDay: 380,
    totalPrice: 1900,
    currency: "MXN",
    features: ["Bluetooth"],
    unlimited: true,
    insurance: "Básico"
  }
]

function AutosResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [cars, setCars] = useState<CarResult[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Filtros
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [transmissionFilter, setTransmissionFilter] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [showFilters, setShowFilters] = useState(false)

  // Parámetros de búsqueda
  const pickup = searchParams.get("pickup") || ""
  const dropoff = searchParams.get("dropoff") || ""
  const pickupDate = searchParams.get("pickupDate") || ""
  const dropoffDate = searchParams.get("dropoffDate") || ""
  const pickupTime = searchParams.get("pickupTime") || "10:30"
  const dropoffTime = searchParams.get("dropoffTime") || "10:30"

  // Calcular días de renta
  const days = pickupDate && dropoffDate
    ? Math.ceil((new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24))
    : 5

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true)
      try {
        // Por ahora usar mock data
        // TODO: Conectar con API de Amadeus para autos
        await new Promise(resolve => setTimeout(resolve, 800))

        // Ajustar precios según días
        const adjustedCars = mockCars.map(car => ({
          ...car,
          totalPrice: car.pricePerDay * days
        }))

        setCars(adjustedCars)
      } catch (error) {
        console.error('Error fetching cars:', error)
        setCars(mockCars)
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [days])

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

  const handleSelectCar = (car: CarResult) => {
    // Guardar selección en localStorage y redirigir a confirmar reserva
    const bookingData = {
      type: 'car',
      car: car,
      pickup: pickup,
      dropoff: dropoff,
      pickupDate: pickupDate,
      dropoffDate: dropoffDate,
      pickupTime: pickupTime,
      dropoffTime: dropoffTime,
      days: days,
      totalPrice: car.totalPrice,
      currency: car.currency
    }
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
    router.push('/confirmar-reserva?type=car')
  }

  const filteredCars = cars.filter(car => {
    if (categoryFilter !== "all" && car.category !== categoryFilter) return false
    if (transmissionFilter !== "all" && car.transmission !== transmissionFilter) return false
    if (car.pricePerDay < priceRange[0] || car.pricePerDay > priceRange[1]) return false
    return true
  })

  const categories = [...new Set(cars.map(c => c.category))]

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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de filtros */}
          <aside className="lg:w-72 flex-shrink-0">
            {/* Barra de búsqueda editable */}
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                Modificar búsqueda
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Lugar de entrega</label>
                  <Input
                    value={pickup}
                    placeholder="Aeropuerto, ciudad..."
                    className="h-10"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Lugar de devolución</label>
                  <Input
                    value={dropoff}
                    placeholder="Mismo lugar"
                    className="h-10"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Fecha entrega</label>
                    <Input
                      type="date"
                      value={pickupDate}
                      className="h-10 text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Fecha devolución</label>
                    <Input
                      type="date"
                      value={dropoffDate}
                      className="h-10 text-sm"
                      readOnly
                    />
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Buscar de nuevo
                </Button>
              </div>
            </Card>

            {/* Filtros */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </h3>

              <div className="space-y-4">
                {/* Categoría */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoría</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Transmisión */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Transmisión</label>
                  <select
                    value={transmissionFilter}
                    onChange={(e) => setTransmissionFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option value="all">Todas</option>
                    <option value="automatic">Automática</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                {/* Precio por día */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Precio por día (MXN)</label>
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
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 2000])}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Características */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Características</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                      Kilometraje ilimitado
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                      Aire acondicionado
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                      Seguro incluido
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Lista de autos */}
          <div className="flex-1">
            {/* Resumen de búsqueda */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Autos disponibles en {pickup.split('(')[0].trim() || 'tu destino'}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredCars.length} vehículos disponibles • {days} días de renta
              </p>
              {pickupDate && dropoffDate && (
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(pickupDate).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })} {pickupTime} →
                  {' '}{new Date(dropoffDate).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })} {dropoffTime}
                </p>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse flex">
                    <div className="w-64 h-48 bg-gray-200" />
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
                {filteredCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        {/* Imagen */}
                        <div className="relative w-full md:w-64 h-48 flex-shrink-0">
                          <img
                            src={car.image}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold">
                            {car.category}
                          </span>
                          <button
                            onClick={() => toggleFavorite(car.id)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white"
                          >
                            <Heart
                              className={`w-5 h-5 ${favorites.has(car.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                            />
                          </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-4 flex flex-col">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-xl">{car.brand} {car.model}</h3>
                              <p className="text-gray-600 text-sm">o similar</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <img
                                src={car.providerLogo}
                                alt={car.provider}
                                className="w-8 h-8 object-contain"
                                onError={(e) => { e.currentTarget.src = '/placeholder-logo.png' }}
                              />
                              <span className="text-sm font-medium">{car.provider}</span>
                            </div>
                          </div>

                          {/* Características */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {car.seats} pasajeros
                            </span>
                            <span className="flex items-center gap-1">
                              <Settings className="w-4 h-4" />
                              {car.transmission === 'automatic' ? 'Automático' : 'Manual'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {car.luggage} maletas
                            </span>
                            <span className="flex items-center gap-1">
                              <Fuel className="w-4 h-4" />
                              {car.fuelType}
                            </span>
                            {car.ac && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Check className="w-4 h-4" />
                                A/C
                              </span>
                            )}
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {car.unlimited && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                Km ilimitados
                              </span>
                            )}
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Seguro {car.insurance}
                            </span>
                            {car.features.slice(0, 2).map((feat, i) => (
                              <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {feat}
                              </span>
                            ))}
                          </div>

                          {/* Precio y botón */}
                          <div className="mt-auto flex items-end justify-between pt-3 border-t">
                            <div>
                              <p className="text-sm text-gray-500">
                                ${car.pricePerDay.toLocaleString()} {car.currency}/día
                              </p>
                              <p className="text-2xl font-bold text-blue-600">
                                ${car.totalPrice.toLocaleString()} <span className="text-sm font-normal text-gray-500">{car.currency} total</span>
                              </p>
                              <p className="text-xs text-gray-500">por {days} días</p>
                            </div>
                            <Button
                              onClick={() => handleSelectCar(car)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Seleccionar
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Sin resultados */}
            {!loading && filteredCars.length === 0 && (
              <div className="text-center py-12">
                <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No encontramos autos</h3>
                <p className="text-gray-600 mb-4">
                  Intenta ajustar los filtros o buscar en otra ubicación
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

export default function AutosResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    }>
      <AutosResultsContent />
    </Suspense>
  )
}
