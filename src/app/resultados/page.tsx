"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { ArrowLeft, Plane, Hotel, Calendar, Users, MapPin, Star, Loader2, SlidersHorizontal } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

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

  // Filtros
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>('price_asc')
  const [selectedStars, setSelectedStars] = useState<number[]>([])
  const [maxPrice, setMaxPrice] = useState<number>(100000)

  useEffect(() => {
    const type = searchParams.get('type') as 'flight' | 'hotel' || 'hotel'
    setSearchType(type)

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
          setMaxPrice(Math.ceil(max / 100) * 100)
          setPriceRange([0, Math.ceil(max / 100) * 100])

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
            setMaxPrice(Math.ceil(max / 100) * 100)
            setPriceRange([0, Math.ceil(max / 100) * 100])
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

    // Filtro por precio
    filtered = filtered.filter(r => r.price >= priceRange[0] && r.price <= priceRange[1])

    // Filtro por rating (hoteles)
    if (searchType === 'hotel' && minRating > 0) {
      filtered = filtered.filter(r => (r.details?.rating || 0) >= minRating)
    }

    // Filtro por estrellas (hoteles)
    if (searchType === 'hotel' && selectedStars.length > 0) {
      filtered = filtered.filter(r => selectedStars.includes(r.details?.starRating || 0))
    }

    // Ordenar
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.details?.rating || 0) - (a.details?.rating || 0))
    }

    setFilteredResults(filtered)
  }, [results, priceRange, minRating, sortBy, selectedStars, searchType])

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
      <header className="bg-white border-b sticky top-0 z-10">
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
          <Link href="/">
            <Button variant="outline">Nueva búsqueda</Button>
          </Link>
        </div>
      </header>

      {/* Results */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {searchType === 'flight' ? 'Vuelos encontrados' : 'Hoteles encontrados'}
            </h1>
            <p className="text-muted-foreground">
              {filteredResults.length} de {results.length} resultados
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
            <Card className="p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filtros</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPriceRange([0, maxPrice])
                    setMinRating(0)
                    setSelectedStars([])
                    setSortBy('price_asc')
                  }}
                  className="text-xs text-primary"
                >
                  Limpiar
                </Button>
              </div>

              {/* Ordenar por */}
              <div className="mb-6">
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
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  Precio por noche
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

              {/* Rating mínimo (solo hoteles) */}
              {searchType === 'hotel' && (
                <>
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">
                      Valoración mínima
                    </label>
                    <div className="space-y-2">
                      {[4.5, 4.0, 3.5, 3.0, 0].map((rating) => (
                        <label
                          key={rating}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="rating"
                            checked={minRating === rating}
                            onChange={() => setMinRating(rating)}
                            className="accent-primary"
                          />
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">
                              {rating === 0 ? 'Cualquiera' : `${rating}+`}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Categoría del hotel (estrellas) */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">
                      Categoría del hotel
                    </label>
                    <div className="space-y-2">
                      {[5, 4, 3].map((stars) => (
                        <label
                          key={stars}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStars.includes(stars)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStars([...selectedStars, stars])
                              } else {
                                setSelectedStars(selectedStars.filter(s => s !== stars))
                              }
                            }}
                            className="accent-primary"
                          />
                          <div className="flex items-center gap-1">
                            {Array.from({ length: stars }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
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
                  filteredResults.map((result) => (
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
                      </div>
                      <Link href={`/detalles/flight/${result.id}`}>
                        <Button className="w-full md:w-auto mt-4">
                          Ver detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              // Hotel Results
              filteredResults.map((result) => (
                <Card key={result.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Hotel Image */}
                    <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Hotel className="w-12 h-12 text-gray-400" />
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
                      </div>
                      <Link href={`/detalles/hotel/${result.id}`}>
                        <Button className="w-full md:w-auto mt-4">
                          Ver detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
              </div>
            )}
          </div>
        </div>
      </main>
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
