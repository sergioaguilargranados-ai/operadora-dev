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
    // Estados de búsqueda (inicializar con varios posibles nombres de param)
    const [city, setCity] = useState(searchParams.get('city') || searchParams.get('destination') || '')
    const [date, setDate] = useState(searchParams.get('date') || '')
    const [diners, setDiners] = useState(parseInt(searchParams.get('diners') || '2'))

    // Estados temporales para los inputs del header (para no disparar búsqueda en cada tecla)
    const [tempCity, setTempCity] = useState(city)
    const [tempDate, setTempDate] = useState(date)
    const [tempDiners, setTempDiners] = useState(diners)

    // Sincronizar temp states cuando cambian los reales (por navegación externa)
    useEffect(() => {
        setTempCity(city)
        setTempDate(date)
        setTempDiners(diners)
    }, [city, date, diners])

    const handleHeaderSearch = () => {
        setCity(tempCity)
        setDate(tempDate)
        setDiners(tempDiners)

        // Actualizar URL
        const params = new URLSearchParams(searchParams.toString())
        if (tempCity) params.set('destination', tempCity)
        if (tempCity) params.set('city', tempCity) // Set both to be safe
        if (tempDate) params.set('date', tempDate)
        params.set('diners', tempDiners.toString())
        router.push(`/resultados/restaurantes?${params.toString()}`)
    }

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
                // Prioritize 'city' param if available, otherwise 'destination'
                const locationParam = searchParams.get('city') || searchParams.get('destination') || ''
                if (locationParam && locationParam !== city) {
                    setCity(locationParam)
                }

                // Construct a more specific query to avoid global results
                // If we have a city, search for "restaurantes en [city]"
                // If the user typed a specific query in the home page (e.g. "Sushi"), we should ideally capture that too.
                // But for now, let's assume 'city' contains the location.
                const query = city ? `restaurantes en ${city}` : 'restaurantes'
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
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b shadow-sm">
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

                    {/* Buscador Interactivo en Header */}
                    <div className="hidden md:flex items-center gap-2 bg-gray-100 p-1 rounded-full border border-gray-200 transition-all hover:border-gray-300 hover:shadow-sm">
                        <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <input
                                className="bg-transparent border-none text-sm font-medium text-gray-700 outline-none w-32 placeholder:text-gray-400"
                                placeholder="Ciudad o zona"
                                value={tempCity}
                                onChange={(e) => setTempCity(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleHeaderSearch()}
                            />
                        </div>
                        <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <input
                                type="date"
                                className="bg-transparent border-none text-sm text-gray-700 outline-none w-auto max-w-[130px]"
                                value={tempDate}
                                onChange={(e) => setTempDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 px-3">
                            <Users className="w-4 h-4 text-gray-500" />
                            <select
                                className="bg-transparent border-none text-sm text-gray-700 outline-none cursor-pointer"
                                value={tempDiners}
                                onChange={(e) => setTempDiners(parseInt(e.target.value))}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20].map(n => (
                                    <option key={n} value={n}>{n} personas</option>
                                ))}
                            </select>
                        </div>
                        <Button
                            size="sm"
                            className="rounded-full h-8 w-8 p-0 ml-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            onClick={handleHeaderSearch}
                        >
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
                                                        restaurant.photos[0].photo_reference.startsWith('mock_')
                                                            ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'
                                                            : restaurant.photos[0].photo_reference.includes('places/')
                                                                // Google Places API (New) Image URL
                                                                ? `https://places.googleapis.com/v1/${restaurant.photos[0].photo_reference}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&maxWidthPx=400`
                                                                // Legacy API Image URL
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
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
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
                            apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''}
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
