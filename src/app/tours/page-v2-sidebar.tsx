// Catálogo de Tours y Viajes Grupales - Diseño con Sidebar
// Build: 01 Feb 2026 - v2.290 - Filtros laterales estilo MegaTravel

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Search, MapPin, Users, Plane, Star, ArrowRight, ArrowLeft,
    Globe, Clock, Tag, Loader2, Phone, Mail, MessageCircle,
    HelpCircle, Sparkles, Calendar, Heart, ChevronDown, ChevronUp,
    Filter, X, DollarSign, Grid, List
} from 'lucide-react'
import { Logo } from '@/components/Logo'

interface TourPackage {
    id: string
    slug: string
    name: string
    description: string
    region: string
    category: string
    subcategory?: string
    cities: string[]
    countries: string[]
    mainCountry: string
    days: number
    nights: number
    duration: string
    pricing: {
        basePrice: number
        taxes: number
        totalPrice: number
        originalPrice: number
        savings: number
        currency: string
        priceType: string
    }
    flight: {
        included: boolean
        airline?: string
        origin: string
    }
    hotel: {
        category: string
        mealPlan: string
    }
    includes: string[]
    optionalTours: any[]
    images: {
        main: string
        gallery: string[]
    }
    tags: string[]
    destination_region?: string
    isFeatured: boolean
    isOffer: boolean
    departure_dates?: string[]  // Fechas de salida disponibles
}

const WHATSAPP_NUMBER = '+527208156804' // Número oficial AS Operadora

// Meses para filtro de fechas
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function ToursContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [packages, setPackages] = useState<TourPackage[]>([])
    const [allPackages, setAllPackages] = useState<TourPackage[]>([])
    const [filteredPackages, setFilteredPackages] = useState<TourPackage[]>([])
    const [loading, setLoading] = useState(true)

    // Filtros
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
    const [selectedCity, setSelectedCity] = useState<string | null>(null)
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
    const [durationRange, setDurationRange] = useState<[number, number]>([1, 30])
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    // UI State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [expandedFilters, setExpandedFilters] = useState({
        search: true,
        country: true,
        price: true,
        duration: true,
        dates: false,
        region: false,
        tags: false
    })

    // Paginación
    const [currentPage, setCurrentPage] = useState(1)
    const TOURS_PER_PAGE = 20

    useEffect(() => {
        fetchPackages()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [searchTerm, selectedCountry, selectedCity, priceRange, durationRange, selectedMonth, selectedRegion, selectedTags, allPackages])

    const fetchPackages = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/tours/packages')
            const data = await response.json()
            setAllPackages(data.packages || [])
            setFilteredPackages(data.packages || [])
        } catch (error) {
            console.error('Error fetching packages:', error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...allPackages]

        // Búsqueda por palabra clave
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.countries.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
                p.cities.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        // Filtro por país
        if (selectedCountry) {
            filtered = filtered.filter(p => p.countries.includes(selectedCountry))
        }

        // Filtro por ciudad
        if (selectedCity) {
            filtered = filtered.filter(p => p.cities.includes(selectedCity))
        }

        // Filtro por precio
        filtered = filtered.filter(p =>
            p.pricing.totalPrice >= priceRange[0] &&
            p.pricing.totalPrice <= priceRange[1]
        )

        // Filtro por duración
        filtered = filtered.filter(p =>
            p.days >= durationRange[0] &&
            p.days <= durationRange[1]
        )

        // Filtro por mes de salida
        if (selectedMonth) {
            filtered = filtered.filter(p =>
                p.departure_dates?.some(date => {
                    const month = new Date(date).getMonth()
                    return MONTHS[month] === selectedMonth
                })
            )
        }

        // Filtro por región
        if (selectedRegion) {
            filtered = filtered.filter(p => p.destination_region === selectedRegion)
        }

        // Filtro por tags
        if (selectedTags.length > 0) {
            filtered = filtered.filter(p =>
                selectedTags.some(tag =>
                    p.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))
                )
            )
        }

        setFilteredPackages(filtered)
        setCurrentPage(1)
    }

    const toggleFilter = (filterName: keyof typeof expandedFilters) => {
        setExpandedFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }))
    }

    const clearAllFilters = () => {
        setSearchTerm('')
        setSelectedCountry(null)
        setSelectedCity(null)
        setPriceRange([0, 100000])
        setDurationRange([1, 30])
        setSelectedMonth(null)
        setSelectedRegion(null)
        setSelectedTags([])
    }

    // Obtener listas únicas
    const allCountries = Array.from(new Set(allPackages.flatMap(p => p.countries))).sort()
    const allCities = Array.from(new Set(allPackages.flatMap(p => p.cities))).sort()
    const allRegions = Array.from(new Set(allPackages.map(p => p.destination_region).filter(Boolean))).sort()
    const allTags = Array.from(new Set(allPackages.flatMap(p => p.tags || []))).sort()

    // Paginación
    const indexOfLastTour = currentPage * TOURS_PER_PAGE
    const indexOfFirstTour = indexOfLastTour - TOURS_PER_PAGE
    const currentTours = filteredPackages.slice(indexOfFirstTour, indexOfLastTour)
    const totalPages = Math.ceil(filteredPackages.length / TOURS_PER_PAGE)

    const goToPage = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <Logo className="h-10" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm">
                                <Phone className="w-4 h-4 mr-2" />
                                Contacto
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Sidebar - Filtros */}
                    <aside className="w-80 flex-shrink-0">
                        <div className="sticky top-24 space-y-4">
                            {/* Header de filtros */}
                            <Card className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-lg flex items-center gap-2">
                                        <Filter className="w-5 h-5 text-blue-600" />
                                        Filtrar por
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAllFilters}
                                        className="text-sm text-gray-600 hover:text-red-600"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Limpiar
                                    </Button>
                                </div>

                                {/* Búsqueda por palabra clave */}
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Palabra Clave
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="ej. Marriott, Hilton..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Filtro por País */}
                                <div className="border-t pt-4">
                                    <button
                                        onClick={() => toggleFilter('country')}
                                        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-blue-600" />
                                            Seleccionar País
                                        </span>
                                        {expandedFilters.country ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    {expandedFilters.country && (
                                        <select
                                            value={selectedCountry || ''}
                                            onChange={(e) => setSelectedCountry(e.target.value || null)}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        >
                                            <option value="">Todos los países</option>
                                            {allCountries.map(country => (
                                                <option key={country} value={country}>{country}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Filtro por Ciudad */}
                                {selectedCountry && (
                                    <div className="border-t pt-4">
                                        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                            Seleccionar Ciudad
                                        </label>
                                        <select
                                            value={selectedCity || ''}
                                            onChange={(e) => setSelectedCity(e.target.value || null)}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        >
                                            <option value="">Todas las ciudades</option>
                                            {allCities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Filtro por Tarifa */}
                                <div className="border-t pt-4">
                                    <button
                                        onClick={() => toggleFilter('price')}
                                        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
                                    >
                                        <span className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            Tarifa
                                        </span>
                                        {expandedFilters.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    {expandedFilters.price && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span>MXN {priceRange[0].toLocaleString()}</span>
                                                <span>-</span>
                                                <span>MXN {priceRange[1].toLocaleString()}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100000"
                                                step="1000"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                                className="w-full accent-blue-600"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Filtro por Duración */}
                                <div className="border-t pt-4">
                                    <button
                                        onClick={() => toggleFilter('duration')}
                                        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-purple-600" />
                                            Duración
                                        </span>
                                        {expandedFilters.duration ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    {expandedFilters.duration && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span>{durationRange[0]} días</span>
                                                <span>-</span>
                                                <span>{durationRange[1]} días</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="30"
                                                value={durationRange[1]}
                                                onChange={(e) => setDurationRange([durationRange[0], parseInt(e.target.value)])}
                                                className="w-full accent-purple-600"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Filtro por Fecha de Salida */}
                                <div className="border-t pt-4">
                                    <button
                                        onClick={() => toggleFilter('dates')}
                                        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-orange-600" />
                                            Fecha ida
                                        </span>
                                        {expandedFilters.dates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    {expandedFilters.dates && (
                                        <div className="space-y-1 max-h-48 overflow-y-auto">
                                            {MONTHS.map(month => (
                                                <button
                                                    key={month}
                                                    onClick={() => setSelectedMonth(selectedMonth === month ? null : month)}
                                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedMonth === month
                                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                                        : 'hover:bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    Salidas en {month}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1">
                        {/* Results Header */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Tours y Viajes Grupales
                                    </h1>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Mostrando {indexOfFirstTour + 1}-{Math.min(indexOfLastTour, filteredPackages.length)} de {filteredPackages.length} resultados
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Tours Grid/List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : currentTours.length === 0 ? (
                            <Card className="p-12 text-center">
                                <p className="text-gray-600 mb-4">No se encontraron resultados para tu búsqueda</p>
                                <Button onClick={clearAllFilters}>
                                    Limpiar filtros
                                </Button>
                            </Card>
                        ) : (
                            <>
                                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                                    {currentTours.map((pkg) => (
                                        <TourCard key={pkg.id} tour={pkg} viewMode={viewMode} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex items-center justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const page = i + 1
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => goToPage(page)}
                                                >
                                                    {page}
                                                </Button>
                                            )
                                        })}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}

function TourCard({ tour, viewMode }: { tour: TourPackage; viewMode: 'grid' | 'list' }) {
    if (viewMode === 'list') {
        return (
            <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                    <div className="w-48 h-32 flex-shrink-0 relative rounded-lg overflow-hidden">
                        <Image
                            src={tour.images.main || '/placeholder-tour.jpg'}
                            alt={tour.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{tour.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{tour.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {tour.days} días
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {tour.mainCountry}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                            ${tour.pricing.totalPrice.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">{tour.pricing.currency}</p>
                        <Link href={`/tours/${tour.slug}`}>
                            <Button className="mt-2" size="sm">
                                Ver detalles
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-shadow group">
            <div className="relative h-48">
                <Image
                    src={tour.images.main || '/placeholder-tour.jpg'}
                    alt={tour.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {tour.isOffer && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        OFERTA
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{tour.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tour.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {tour.days} días
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {tour.mainCountry}
                    </span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">
                            ${tour.pricing.totalPrice.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">{tour.pricing.currency}</p>
                    </div>
                    <Link href={`/tours/${tour.slug}`}>
                        <Button size="sm">
                            Ver más
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    )
}

export default function ToursPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <ToursContent />
        </Suspense>
    )
}
