"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/Logo'
import { ArrowLeft, MapPin, Calendar, Users, Search, Loader2, Star, Clock, Utensils } from 'lucide-react'
import { RestaurantFilters, RestaurantFiltersState } from '@/components/restaurants/RestaurantFilters'
import { RestaurantMap } from '@/components/restaurants/RestaurantMap'

// Tipo para resultados de restaurantes
interface Restaurant {
    place_id: string
    name: string
    photos?: { photo_reference: string }[]
    rating?: number
    user_ratings_total?: number
    price_level?: number
    vicinity: string
    geometry: {
        location: {
            lat: number
            lng: number
        }
    }
    opening_hours?: {
        open_now: boolean
    }
    types?: string[]
    cuisine?: string[] // Campo enriquecido (nuestro mock lo tiene)
}

function RestaurantResultsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [results, setResults] = useState<Restaurant[]>([])
    const [filteredResults, setFilteredResults] = useState<Restaurant[]>([])

    // Estados de búsqueda
    const [city, setCity] = useState(searchParams.get('destination') || '')
    const [date, setDate] = useState(searchParams.get('date') || '')
    const [diners, setDiners] = useState(parseInt(searchParams.get('diners') || '2'))

    // Estado de filtros
    const [filters, setFilters] = useState<RestaurantFiltersState>({
        cuisine: [],
        priceLevel: [],
        minRating: 0,
        openNow: false
    })

    // Cargar resultados
    useEffect(() => {
        const fetchRestaurants = async () => {
            setLoading(true)
            try {
                const query = city || 'restaurantes'
                const res = await fetch(`/api/restaurants/search?query=${encodeURIComponent(query)}`)
                const data = await res.json()

                if (data.results) {
                    setResults(data.results)
                    setFilteredResults(data.results)
                }
            } catch (error) {
                console.error("Error fetching restaurants:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchRestaurants()
    }, [city])

    // Aplicar filtros
    useEffect(() => {
        let filtered = [...results]

        // Filtro por cocina (si el API devuelve cuisines o si lo inferimos de tipos/nombre)
        if (filters.cuisine.length > 0) {
            filtered = filtered.filter(r => {
                // En un caso real, Google Places no devuelve "cuisine" directamente en TextSearch sin procesar.
                // Nuestro mock SÍ lo tiene. Para producción, se requeriría lógica extra o búsqueda específica.
                // Aquí asumimos que "cuisine" existe en el objeto o buscamos en "types" o nombre.
                const rCuisine = r.cuisine || []
                const rName = r.name.toLowerCase()
                const rTypes = r.types || []

                return filters.cuisine.some(c =>
                    rCuisine.includes(c) ||
                    rName.includes(c.toLowerCase()) ||
                    rTypes.includes(c.toLowerCase())
                )
            })
        }

        // Filtro por precio
        if (filters.priceLevel.length > 0) {
            filtered = filtered.filter(r => r.price_level && filters.priceLevel.includes(r.price_level))
        }

        // Filtro por rating
        if (filters.minRating > 0) {
            filtered = filtered.filter(r => (r.rating || 0) >= filters.minRating)
        }

        // Filtro Open Now
        if (filters.openNow) {
            filtered = filtered.filter(r => r.opening_hours?.open_now)
        }

        setFilteredResults(filtered)
    }, [filters, results])

    const formatPriceLevel = (level?: number) => {
        if (!level) return '$$'
        return '$'.repeat(level)
    }

    const handleBooking = (restaurant: Restaurant) => {
        // Guardar selección
        localStorage.setItem('selected_restaurant', JSON.stringify({
            restaurant,
            searchParams: { city, date, diners }
        }))
        router.push('/confirmar-reserva/restaurante')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Logo />
                    </div>

                    {/* Buscador Resumen */}
                    <div className="hidden md:flex items-center gap-2 bg-gray-100 p-1.5 rounded-full border">
                        <div className="px-3 flex items-center gap-2 border-r border-gray-300">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{city || "Ubicación"}</span>
                        </div>
                        <div className="px-3 flex items-center gap-2 border-r border-gray-300">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{date || "Fecha"}</span>
                        </div>
                        <div className="px-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{diners} personas</span>
                        </div>
                        <Button size="sm" className="rounded-full h-8 w-8 p-0 ml-1">
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="w-10"></div> {/* Espaciador para centrar */}
                </div>
            </header>

            {/* Contenido Principal */}
            <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                    {/* Filtros Sidebar (3 columnas) */}
                    <aside className="lg:col-span-3">
                        <RestaurantFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            totalResults={results.length}
                            filteredCount={filteredResults.length}
                        />
                    </aside>

                    {/* Resultados (5 columnas) */}
                    <main className="lg:col-span-5 space-y-4">
                        <h1 className="text-xl font-bold mb-4">
                            {filteredResults.length} restaurantes encontrados en {city}
                        </h1>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            filteredResults.map((restaurant) => (
                                <Card key={restaurant.place_id} className="overflow-hidden hover:shadow-lg transition-all group">
                                    <div className="flex">
                                        {/* Foto */}
                                        <div className="w-32 h-32 md:w-40 md:h-auto relative bg-gray-200 flex-shrink-0">
                                            {restaurant.photos?.[0] ? (
                                                <img
                                                    src={
                                                        restaurant.photos[0].photo_reference.startsWith('mock_') || !process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
                                                            ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'
                                                            : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${restaurant.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
                                                    }
                                                    alt={restaurant.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Utensils className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Detalles */}
                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors">
                                                        {restaurant.name}
                                                    </h3>
                                                    {restaurant.rating && (
                                                        <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded text-green-700 text-xs font-bold border border-green-200">
                                                            <span>{restaurant.rating}</span>
                                                            <Star className="w-3 h-3 fill-green-700" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                    <span className="text-gray-900 font-medium">{formatPriceLevel(restaurant.price_level)}</span>
                                                    <span>•</span>
                                                    <span>{restaurant.cuisine?.[0] || restaurant.types?.[0] || "Restaurante"}</span>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[150px]">{restaurant.vicinity}</span>
                                                </div>

                                                {/* Tags (opcional) */}
                                                {restaurant.cuisine && restaurant.cuisine.slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="inline-block mt-2 mr-1 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    {restaurant.opening_hours?.open_now ? (
                                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Abierto ahora
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-500 font-medium text-xs">Cerrado</span>
                                                    )}
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-gray-500">{restaurant.user_ratings_total} reseñas</span>
                                                </div>
                                                <Button size="sm" onClick={() => handleBooking(restaurant)}>Reservar</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </main>

                    {/* Mapa (4 columnas) */}
                    <aside className="hidden lg:block lg:col-span-4 sticky top-24 h-[calc(100vh-120px)]">
                        <RestaurantMap
                            restaurants={filteredResults}
                            onMarkerClick={(r) => {
                                // Opcional: Scroll to card or highlight
                                console.log("Marker clicked:", r.name)
                            }}
                        />
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default function RestaurantResultsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <RestaurantResultsContent />
        </Suspense>
    )
}
