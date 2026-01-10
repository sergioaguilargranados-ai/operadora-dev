"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { ArrowLeft, Plane, Hotel, Calendar, Users, MapPin, Star, Loader2, SlidersHorizontal, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { FlightDatePriceStrip } from '@/components/FlightDatePriceStrip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PolicyBadge, PolicyAlert } from '@/components/PolicyBadge'
import { HotelFilters, HotelFiltersState } from '@/components/HotelFilters'
import { getHotelImage, getHotelImageByName } from '@/lib/hotel-images'

interface SearchResult {
  id: string
  provider: string
  type: string
  price: number
  currency: string
  details: any
  originalPrice?: number
  originalCurrency?: string
  exchangeRate?: number
  // Policy validation fields
  withinPolicy?: boolean
  requiresApproval?: boolean
  policyValidation?: {
    isValid: boolean
    requiresApproval: boolean
    violations: string[]
    warnings: string[]
  }
}

interface SearchResponse {
  success: boolean
  data: SearchResult[]
  total: number
  providers?: {
    searched: string[]
    successful: string[]
    failed: string[]
  }
}

function ResultadosContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [results, setResults] = useState<SearchResult[]>([])
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchType, setSearchType] = useState<'flight' | 'hotel'>('hotel')
  const [showFilters, setShowFilters] = useState(false)

  // Filtros legacy (para vuelos)
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>('price_asc')
  const [selectedStars, setSelectedStars] = useState<number[]>([])
  const [maxPrice, setMaxPrice] = useState<number>(100000)

  // Filtros avanzados de hoteles (legacy)
  const [searchHotelName, setSearchHotelName] = useState<string>('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [freeCancellation, setFreeCancellation] = useState<boolean>(false)
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [breakfastIncluded, setBreakfastIncluded] = useState<boolean>(false)

  // Nuevo estado de filtros de hoteles estilo Expedia
  const [hotelFilters, setHotelFilters] = useState<HotelFiltersState>({
    searchName: '',
    priceRange: [0, 100000],
    maxPrice: 100000,
    breakfastIncluded: false,
    freeCancellation: false,
    payLater: false,
    payAtProperty: false,
    beachfront: false,
    allInclusive: false,
    minRating: 0,
    selectedStars: [],
    propertyTypes: [],
    amenities: [],
    paymentOptions: [],
    zones: [],
    hotelChains: [],
    accessibility: [],
    views: [],
    maxDistance: 0,
    sortBy: 'recommended',
  })

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 10

  // Modal de detalles de vuelo
  const [selectedFlight, setSelectedFlight] = useState<SearchResult | null>(null)
  const [showFlightDetails, setShowFlightDetails] = useState<boolean>(false)

  // Flight search params
  const [flightParams, setFlightParams] = useState({
    origin: 'MEX',
    destination: '',
    destinationCity: '',
    departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    adults: 1,
    children: 0
  })
  const [baseFlightPrice, setBaseFlightPrice] = useState<number>(2500)

  useEffect(() => {
    const type = (searchParams.get('type') as 'flight' | 'hotel') || 'hotel'
    setSearchType(type)

    // Load flight params from URL or localStorage
    const destination = searchParams.get('destination')
    if (type === 'flight' && destination) {
      setFlightParams(prev => ({
        ...prev,
        destinationCity: destination,
        destination: destination.substring(0, 3).toUpperCase()
      }))
    }

    // Intentar leer de localStorage primero
    if (typeof window !== 'undefined') {
      const savedResults = localStorage.getItem('searchResults')

      if (savedResults) {
        try {
          const response: SearchResponse = JSON.parse(savedResults)
          const data = response.data || []
          setResults(data)

          // Calcular precio máximo
          const prices = data.map(r => r.price)
          const max = prices.length > 0 ? Math.max(...prices) : 100000
          const calculatedMax = Math.ceil(max / 100) * 100
          setMaxPrice(calculatedMax)
          setPriceRange([0, calculatedMax])

          // Actualizar filtros de hotel con precio máximo
          setHotelFilters(prev => ({
            ...prev,
            maxPrice: calculatedMax,
            priceRange: [0, calculatedMax]
          }))

          // Limpiar localStorage después de leer
          localStorage.removeItem('searchResults')
        } catch (error) {
          console.error('Error parsing results from localStorage:', error)
        }
      } else {
        // Fallback: intentar leer de URL (para compatibilidad)
        const dataParam = searchParams.get('data')
        if (dataParam) {
          try {
            const decoded = decodeURIComponent(dataParam)
            const response: SearchResponse = JSON.parse(decoded)
            const data = response.data || []
            setResults(data)

            // Calcular precio máximo
            const prices = data.map(r => r.price)
            const max = prices.length > 0 ? Math.max(...prices) : 100000
            const calculatedMax = Math.ceil(max / 100) * 100
            setMaxPrice(calculatedMax)
            setPriceRange([0, calculatedMax])

            // Actualizar filtros de hotel con precio máximo
            setHotelFilters(prev => ({
              ...prev,
              maxPrice: calculatedMax,
              priceRange: [0, calculatedMax]
            }))
          } catch (error) {
            console.error('Error parsing results from URL:', error)
          }
        }
      }
    }

    setLoading(false)
  }, [searchParams])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...results]

    if (searchType === 'hotel') {
      // Usar nuevos filtros de hotel estilo Expedia

      // Filtro por precio
      filtered = filtered.filter(r =>
        r.price >= hotelFilters.priceRange[0] && r.price <= hotelFilters.priceRange[1]
      )

      // Filtro por nombre
      if (hotelFilters.searchName.trim() !== '') {
        const lowerName = hotelFilters.searchName.toLowerCase()
        filtered = filtered.filter(r =>
          (r.details?.name || '').toLowerCase().includes(lowerName) ||
          (r.details?.chain || '').toLowerCase().includes(lowerName)
        )
      }

      // Filtro por rating
      if (hotelFilters.minRating > 0) {
        filtered = filtered.filter(r => (r.details?.rating || 0) >= hotelFilters.minRating)
      }

      // Filtro por estrellas
      if (hotelFilters.selectedStars.length > 0) {
        filtered = filtered.filter(r => hotelFilters.selectedStars.includes(r.details?.starRating || 0))
      }

      // Filtro por desayuno incluido
      if (hotelFilters.breakfastIncluded) {
        filtered = filtered.filter(r => r.details?.breakfastIncluded === true)
      }

      // Filtro por cancelación gratuita
      if (hotelFilters.freeCancellation) {
        filtered = filtered.filter(r => r.details?.freeCancellation === true)
      }

      // Filtro por pago después
      if (hotelFilters.payLater) {
        filtered = filtered.filter(r => r.details?.payLater === true)
      }

      // Filtro por pago en hotel
      if (hotelFilters.payAtProperty) {
        filtered = filtered.filter(r => r.details?.payAtProperty === true)
      }

      // Filtro por playa/frente al mar
      if (hotelFilters.beachfront) {
        filtered = filtered.filter(r => r.details?.beachfront === true)
      }

      // Filtro por todo incluido
      if (hotelFilters.allInclusive) {
        filtered = filtered.filter(r => r.details?.allInclusive === true)
      }

      // Filtro por tipo de propiedad
      if (hotelFilters.propertyTypes.length > 0) {
        filtered = filtered.filter(r =>
          hotelFilters.propertyTypes.includes(r.details?.propertyType?.toLowerCase() || 'hotel')
        )
      }

      // Filtro por amenities
      if (hotelFilters.amenities.length > 0) {
        filtered = filtered.filter(r => {
          const amenities: string[] = (r.details?.amenities || []).map((a: string) => a.toLowerCase())
          return hotelFilters.amenities.some(a =>
            amenities.some(am => am.includes(a) || a.includes(am))
          )
        })
      }

      // Filtro por zona
      if (hotelFilters.zones.length > 0) {
        filtered = filtered.filter(r => {
          const zone = (r.details?.zone || r.details?.area || '').toLowerCase()
          return hotelFilters.zones.some(z => zone.includes(z.replace('-', ' ')))
        })
      }

      // Filtro por cadena hotelera
      if (hotelFilters.hotelChains.length > 0) {
        filtered = filtered.filter(r => {
          const chain = (r.details?.chain || r.details?.brand || '').toLowerCase()
          return hotelFilters.hotelChains.some(c => chain.includes(c))
        })
      }

      // Filtro por vistas
      if (hotelFilters.views.length > 0) {
        filtered = filtered.filter(r => {
          const views: string[] = r.details?.views || []
          return hotelFilters.views.some(v => views.some((rv: string) => rv.toLowerCase().includes(v.replace('-', ' '))))
        })
      }

      // Filtro por accesibilidad
      if (hotelFilters.accessibility.length > 0) {
        filtered = filtered.filter(r => {
          const accessibility: string[] = r.details?.accessibility || []
          return hotelFilters.accessibility.some(a => accessibility.includes(a))
        })
      }

      // Filtro por distancia del centro
      if (hotelFilters.maxDistance > 0) {
        filtered = filtered.filter(r => {
          const distance = r.details?.distanceFromCenter || r.details?.distance || 0
          return distance <= hotelFilters.maxDistance
        })
      }

      // Ordenar hoteles
      const currentSort = hotelFilters.sortBy
      if (currentSort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price)
      } else if (currentSort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price)
      } else if (currentSort === 'rating') {
        filtered.sort((a, b) => (b.details?.rating || 0) - (a.details?.rating || 0))
      } else if (currentSort === 'stars_desc') {
        filtered.sort((a, b) => (b.details?.starRating || 0) - (a.details?.starRating || 0))
      }
      // 'recommended' mantiene el orden original

    } else {
      // Filtros legacy para vuelos

      // Filtro por precio
      filtered = filtered.filter(r => r.price >= priceRange[0] && r.price <= priceRange[1])

      // 🔥 ORDENAR POR CUMPLIMIENTO DE POLÍTICA PRIMERO
      filtered.sort((a, b) => {
        if (a.withinPolicy && !b.withinPolicy) return -1
        if (!a.withinPolicy && b.withinPolicy) return 1
        return 0
      })

      // Ordenar (respetando el ordenamiento de política)
      if (sortBy === 'price_asc') {
        filtered.sort((a, b) => {
          if (a.withinPolicy !== b.withinPolicy) {
            return a.withinPolicy ? -1 : 1
          }
          return a.price - b.price
        })
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => {
          if (a.withinPolicy !== b.withinPolicy) {
            return a.withinPolicy ? -1 : 1
          }
          return b.price - a.price
        })
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => {
          if (a.withinPolicy !== b.withinPolicy) {
            return a.withinPolicy ? -1 : 1
          }
          return (b.details?.rating || 0) - (a.details?.rating || 0)
        })
      }
    }

    setFilteredResults(filtered)
    // Resetear a página 1 cuando cambian los filtros
    setCurrentPage(1)
  }, [results, priceRange, minRating, sortBy, selectedStars, searchType, searchHotelName, selectedAmenities, freeCancellation, propertyTypes, breakfastIncluded, hotelFilters])

  // Calcular resultados paginados
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedResults = filteredResults.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    // Scroll al inicio de los resultados
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFlightClick = (flight: SearchResult) => {
    setSelectedFlight(flight)
    setShowFlightDetails(true)
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-MX', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Logo />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              // Guardar parámetros de búsqueda actual para mantener filtros
              const currentParams = {
                type: searchParams.get('type'),
                origin: searchParams.get('origin'),
                destination: searchParams.get('destination'),
                departure: searchParams.get('departure'),
                return: searchParams.get('return'),
                passengers: searchParams.get('passengers'),
                city: searchParams.get('city'),
                checkin: searchParams.get('checkin'),
                checkout: searchParams.get('checkout'),
                guests: searchParams.get('guests'),
                rooms: searchParams.get('rooms')
              }
              localStorage.setItem('lastSearchParams', JSON.stringify(currentParams))
              router.push('/')
            }}
          >
            Nueva búsqueda
          </Button>
        </div>
      </header>

      {/* Results */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Flight Search Bar - Only for flights */}
        {searchType === 'flight' && (
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{flightParams.origin}</span>
                <span className="text-gray-400 mx-1">→</span>
                <span className="text-sm font-medium">{flightParams.destinationCity || flightParams.destination}</span>
              </div>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  {new Date(flightParams.departureDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                  {flightParams.returnDate && ` - ${new Date(flightParams.returnDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}`}
                </span>
              </div>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{flightParams.adults + flightParams.children} pasajero{flightParams.adults + flightParams.children > 1 ? 's' : ''}</span>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                onClick={() => router.push('/')}
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        )}

        {/* Date Price Strip - Only for flights */}
        {searchType === 'flight' && (
          <FlightDatePriceStrip
            selectedDate={flightParams.departureDate}
            onDateSelect={(date) => {
              setFlightParams(prev => ({ ...prev, departureDate: date }))
              // Aquí se podría hacer una nueva búsqueda con la fecha seleccionada
            }}
            basePrice={baseFlightPrice}
            currency="MXN"
          />
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {searchType === 'flight' ? 'Vuelos encontrados' : 'Hoteles encontrados'}
            </h1>
            <p className="text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredResults.length)} de {filteredResults.length} resultados
              {searchType === 'flight' && results.length > 0 && ` (máximo 15 vuelos)`}
            </p>
          </div>
          <Button
            variant="outline"
            className="md:hidden gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </Button>
        </div>

        {/* Layout con filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar de Filtros */}
          <aside className={`md:col-span-1 ${showFilters ? 'block' : 'hidden md:block'}`}>
            {searchType === 'hotel' ? (
              /* Nuevos filtros estilo Expedia para hoteles */
              <HotelFilters
                filters={hotelFilters}
                onFiltersChange={setHotelFilters}
                totalResults={results.length}
                filteredCount={filteredResults.length}
              />
            ) : (
              /* Filtros legacy para vuelos */
              <Card className="p-4 sticky top-24 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Filtros</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPriceRange([0, maxPrice])
                      setSortBy('price_asc')
                    }}
                    className="text-xs text-primary"
                  >
                    Limpiar
                  </Button>
                </div>

                {/* Ordenar por */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                      <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
                      <SelectItem value="rating">Mejor valorados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Precio */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Precio
                  </label>
                  <div className="px-1">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={maxPrice}
                      step={100}
                      className="mb-2"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>${priceRange[0].toLocaleString()}</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </aside>

          {/* Lista de Resultados */}
          <div className="md:col-span-3">
            {filteredResults.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  No se encontraron resultados para tu búsqueda
                </p>
                <Link href="/">
                  <Button>Realizar nueva búsqueda</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {searchType === 'flight' ? (
                  // Flight Results
                  paginatedResults.map((result) => (
                    <Card key={result.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          {/* Outbound Flight */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Plane className="w-5 h-5 text-primary" />
                              <span className="font-semibold">Ida</span>
                              <span className="text-sm text-muted-foreground">
                                • {result.details?.airline}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-bold">
                                  {result.details?.outbound?.departureTime
                                    ? new Date(result.details.outbound.departureTime).toLocaleTimeString('es-MX', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : '--:--'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {result.details?.outbound?.origin}
                                </p>
                              </div>
                              <div className="text-center px-4">
                                <p className="text-sm text-muted-foreground">
                                  {result.details?.outbound?.duration || 'N/A'}
                                </p>
                                <div className="w-24 h-px bg-gray-300 my-2"></div>
                                <p className="text-xs text-muted-foreground">
                                  {result.details?.outbound?.stops === 0
                                    ? 'Directo'
                                    : `${result.details?.outbound?.stops} escala(s)`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">
                                  {result.details?.outbound?.arrivalTime
                                    ? new Date(result.details.outbound.arrivalTime).toLocaleTimeString('es-MX', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : '--:--'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {result.details?.outbound?.destination}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Return Flight (if exists) */}
                          {result.details?.inbound && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center gap-2 mb-3">
                                <Plane className="w-5 h-5 text-primary rotate-180" />
                                <span className="font-semibold">Regreso</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-2xl font-bold">
                                    {result.details.inbound.departureTime
                                      ? new Date(result.details.inbound.departureTime).toLocaleTimeString('es-MX', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      : '--:--'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {result.details.inbound.origin}
                                  </p>
                                </div>
                                <div className="text-center px-4">
                                  <p className="text-sm text-muted-foreground">
                                    {result.details.inbound.duration || 'N/A'}
                                  </p>
                                  <div className="w-24 h-px bg-gray-300 my-2"></div>
                                  <p className="text-xs text-muted-foreground">
                                    {result.details.inbound.stops === 0
                                      ? 'Directo'
                                      : `${result.details.inbound.stops} escala(s)`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold">
                                    {result.details.inbound.arrivalTime
                                      ? new Date(result.details.inbound.arrivalTime).toLocaleTimeString('es-MX', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      : '--:--'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {result.details.inbound.destination}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-between items-end">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">
                              desde
                            </p>
                            <p className="text-3xl font-bold text-primary">
                              {formatPrice(result.price, result.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              vía {result.provider}
                            </p>

                            {/* Policy Badge */}
                            {result.policyValidation && (
                              <div className="mt-3">
                                <PolicyBadge
                                  withinPolicy={result.withinPolicy || false}
                                  requiresApproval={result.requiresApproval || false}
                                  violations={result.policyValidation?.violations}
                                  warnings={result.policyValidation?.warnings}
                                  showDetails={false}
                                />
                              </div>
                            )}
                          </div>
                          <Button
                            className="w-full md:w-auto mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              // Guardar vuelo en localStorage
                              localStorage.setItem('selected_service', JSON.stringify({
                                type: 'flight',
                                service: result,
                                searchParams: {
                                  origin: result.details?.outbound?.origin,
                                  destination: result.details?.outbound?.destination,
                                  adults: 1,
                                  departureDate: result.details?.outbound?.departureTime
                                }
                              }))
                              router.push('/confirmar-reserva?type=flight')
                            }}
                          >
                            Seleccionar vuelo
                          </Button>
                        </div>
                      </div>

                      {/* Policy Alert - Expandible details */}
                      {result.policyValidation &&
                       (result.policyValidation.violations?.length > 0 ||
                        result.policyValidation.warnings?.length > 0) && (
                        <div className="mt-4 pt-4 border-t">
                          <PolicyAlert
                            violations={result.policyValidation.violations || []}
                            warnings={result.policyValidation.warnings || []}
                          />
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  // Hotel Results
                  paginatedResults.map((result, index) => (
                    <Card key={result.id} className="p-6 hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Hotel Image */}
                        <div className="w-full md:w-56 h-48 rounded-lg overflow-hidden flex-shrink-0 relative group">
                          <img
                            src={result.details?.imageUrl || result.details?.image || getHotelImageByName(result.details?.name || '', index)}
                            alt={result.details?.name || 'Hotel'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = getHotelImage(result.details?.propertyType, result.details?.city, index)
                            }}
                          />
                          {/* Badges sobre la imagen */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {result.details?.allInclusive && (
                              <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded font-medium">
                                Todo incluido
                              </span>
                            )}
                            {result.details?.freeCancellation && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
                                Cancelacion gratis
                              </span>
                            )}
                          </div>
                          {/* Distancia si existe */}
                          {result.details?.distanceFromCenter && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {result.details.distanceFromCenter} km del centro
                            </div>
                          )}
                        </div>

                        {/* Hotel Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">
                                {result.details?.name || 'Hotel'}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                {result.details?.starRating && (
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: result.details.starRating }).map((_, i) => (
                                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                )}
                                <MapPin className="w-4 h-4" />
                                <span>{result.details?.city || result.details?.address}</span>
                              </div>
                              {result.details?.rating && (
                                <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded">
                                  <span className="font-semibold text-primary">
                                    {result.details.rating}
                                  </span>
                                  <span className="text-sm">
                                    ({result.details.reviewCount || 0} reseñas)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {result.details?.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {result.details.description}
                            </p>
                          )}

                          {result.details?.facilities && result.details.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {result.details.facilities.slice(0, 4).map((facility: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                                >
                                  {facility}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex flex-col justify-between items-end">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">
                              desde
                            </p>
                            <p className="text-3xl font-bold text-primary">
                              {formatPrice(result.price, result.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              por noche
                            </p>
                            <p className="text-xs text-muted-foreground">
                              vía {result.provider}
                            </p>

                            {/* Policy Badge */}
                            {result.policyValidation && (
                              <div className="mt-3">
                                <PolicyBadge
                                  withinPolicy={result.withinPolicy || false}
                                  requiresApproval={result.requiresApproval || false}
                                  violations={result.policyValidation?.violations}
                                  warnings={result.policyValidation?.warnings}
                                  showDetails={false}
                                />
                              </div>
                            )}
                          </div>
                          <Button
                            className="w-full md:w-auto mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              // Guardar hotel en localStorage
                              localStorage.setItem('selected_service', JSON.stringify({
                                type: 'hotel',
                                service: result,
                                searchParams: {
                                  city: result.details?.city,
                                  checkin: searchParams.get('checkin') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                  guests: 2,
                                  rooms: 1
                                }
                              }))
                              router.push('/confirmar-reserva?type=hotel')
                            }}
                          >
                            Seleccionar hotel
                          </Button>
                        </div>
                      </div>

                      {/* Policy Alert - Expandible details */}
                      {result.policyValidation &&
                       (result.policyValidation.violations?.length > 0 ||
                        result.policyValidation.warnings?.length > 0) && (
                        <div className="mt-4 pt-4 border-t">
                          <PolicyAlert
                            violations={result.policyValidation.violations || []}
                            warnings={result.policyValidation.warnings || []}
                          />
                        </div>
                      )}
                    </Card>
                  ))
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          onClick={() => handlePageChange(page)}
                          className="w-10 h-10"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="gap-2"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Detalles de Vuelo */}
      <Dialog open={showFlightDetails} onOpenChange={setShowFlightDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Vuelo</DialogTitle>
            <DialogDescription>
              Información completa del vuelo seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedFlight && (
            <div className="space-y-6">
              {/* Header con precio */}
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Precio total</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(selectedFlight.price, selectedFlight.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Proveedor</p>
                  <p className="font-semibold">{selectedFlight.provider}</p>
                </div>
              </div>

              {/* Vuelo de Ida */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Vuelo de Ida</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Salida</p>
                      <p className="text-2xl font-bold">
                        {selectedFlight.details?.outbound?.departureTime
                          ? new Date(selectedFlight.details.outbound.departureTime).toLocaleTimeString('es-MX', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '--:--'}
                      </p>
                      <p className="text-sm font-medium">{selectedFlight.details?.outbound?.origin}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedFlight.details?.outbound?.departureTime
                          ? new Date(selectedFlight.details.outbound.departureTime).toLocaleDateString('es-MX', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : ''}
                      </p>
                    </div>

                    <div className="flex-1 text-center px-4">
                      <p className="text-sm text-muted-foreground mb-2">{selectedFlight.details?.outbound?.duration || 'N/A'}</p>
                      <div className="relative">
                        <div className="w-full h-px bg-gray-300"></div>
                        <Plane className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedFlight.details?.outbound?.stops === 0
                          ? 'Vuelo directo'
                          : `${selectedFlight.details?.outbound?.stops} escala(s)`}
                      </p>
                    </div>

                    <div className="flex-1 text-right">
                      <p className="text-sm text-muted-foreground mb-1">Llegada</p>
                      <p className="text-2xl font-bold">
                        {selectedFlight.details?.outbound?.arrivalTime
                          ? new Date(selectedFlight.details.outbound.arrivalTime).toLocaleTimeString('es-MX', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '--:--'}
                      </p>
                      <p className="text-sm font-medium">{selectedFlight.details?.outbound?.destination}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedFlight.details?.outbound?.arrivalTime
                          ? new Date(selectedFlight.details.outbound.arrivalTime).toLocaleDateString('es-MX', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Aerolínea</p>
                      <p className="font-semibold">{selectedFlight.details?.airline || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Clase</p>
                      <p className="font-semibold">{selectedFlight.details?.cabinClass || 'Económica'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vuelo de Regreso (si existe) */}
              {selectedFlight.details?.inbound && (
                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Plane className="w-5 h-5 text-primary rotate-180" />
                    <h3 className="text-lg font-semibold">Vuelo de Regreso</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Salida</p>
                        <p className="text-2xl font-bold">
                          {selectedFlight.details.inbound.departureTime
                            ? new Date(selectedFlight.details.inbound.departureTime).toLocaleTimeString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '--:--'}
                        </p>
                        <p className="text-sm font-medium">{selectedFlight.details.inbound.origin}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedFlight.details.inbound.departureTime
                            ? new Date(selectedFlight.details.inbound.departureTime).toLocaleDateString('es-MX', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : ''}
                        </p>
                      </div>

                      <div className="flex-1 text-center px-4">
                        <p className="text-sm text-muted-foreground mb-2">{selectedFlight.details.inbound.duration || 'N/A'}</p>
                        <div className="relative">
                          <div className="w-full h-px bg-gray-300"></div>
                          <Plane className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-primary rotate-180" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {selectedFlight.details.inbound.stops === 0
                            ? 'Vuelo directo'
                            : `${selectedFlight.details.inbound.stops} escala(s)`}
                        </p>
                      </div>

                      <div className="flex-1 text-right">
                        <p className="text-sm text-muted-foreground mb-1">Llegada</p>
                        <p className="text-2xl font-bold">
                          {selectedFlight.details.inbound.arrivalTime
                            ? new Date(selectedFlight.details.inbound.arrivalTime).toLocaleTimeString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '--:--'}
                        </p>
                        <p className="text-sm font-medium">{selectedFlight.details.inbound.destination}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedFlight.details.inbound.arrivalTime
                            ? new Date(selectedFlight.details.inbound.arrivalTime).toLocaleDateString('es-MX', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              {selectedFlight.details?.fareDetails && (
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Detalles de la Tarifa</h3>
                  <div className="space-y-2 text-sm">
                    {selectedFlight.details.fareDetails.map((detail: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-muted-foreground">{detail.label}</span>
                        <span className="font-medium">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón de reservar */}
              <div className="flex gap-3">
                <Button className="flex-1" size="lg">
                  Reservar ahora
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowFlightDetails(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ResultadosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ResultadosContent />
    </Suspense>
  )
}
