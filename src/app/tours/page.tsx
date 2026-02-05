// Catálogo de Tours y Viajes Grupales
// Build: 01 Feb 2026 - v2.294 - Fix filtro regiones dinámicas desde DB

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
    Search,
    MapPin,
    Users,
    Plane,
    Star,
    ArrowRight,
    ArrowLeft,
    Globe,
    Clock,
    Tag,
    Loader2,
    Phone,
    Mail,
    MessageCircle,
    HelpCircle,
    Sparkles,
    Calendar,
    Heart,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Menu
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
    destination_region?: string  // Región del destino (Europa, Asia, etc.)
    isFeatured: boolean
    isOffer: boolean
}

// Categorías de navegación
const CATEGORIES = [
    { code: 'todos', name: 'Todos los Tours', icon: '🌍', filter: 'all' },
    { code: 'ofertas', name: 'OFERTAS Especiales', icon: '🔥', filter: 'offer' },
    { code: 'bloqueos', name: 'Bloqueos, aparta tu lugar', icon: '🎯', filter: 'featured' },
    { code: 'semana-santa', name: 'Ofertas de Semana Santa', icon: '🌴', filter: 'semana-santa' },
    { code: 'favoritos', name: 'Favoritos, los imperdibles', icon: '⭐', filter: 'featured' },
]

// Categorías especiales (eventos)
const EVENT_CATEGORIES = [
    { code: 'bodas', name: 'Bodas', icon: '💒' },
    { code: 'quinceaneras', name: 'Quinceañeras', icon: '👗' },
    { code: 'graduaciones', name: 'Graduaciones', icon: '🎓' },
    { code: 'corporativo', name: 'Viajes Corporativos', icon: '🏢' },
    { code: 'grupos', name: 'Grupos Especiales', icon: '👥' },
]

// Lista fija de regiones/destinos (siempre mostrar todas)
// Meses para filtro de fechas
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const WHATSAPP_NUMBER = '+527208156804' // Número oficial AS Operadora

function ToursContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [packages, setPackages] = useState<TourPackage[]>([])
    const [allPackages, setAllPackages] = useState<TourPackage[]>([])
    const [regions, setRegions] = useState<string[]>([])
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState(searchParams?.get('search') || '')
    const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('cat') || 'ofertas')
    const [videoUrl, setVideoUrl] = useState('https://images.unsplash.com/photo-1499856871958-5b9337606a3e?w=1600')

    // Nuevos filtros avanzados
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
    const [selectedCity, setSelectedCity] = useState<string | null>(null)
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]) // USD
    const [durationRange, setDurationRange] = useState<[number, number]>([1, 30])
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    // UI State
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [expandedFilters, setExpandedFilters] = useState({
        search: true,
        country: true,
        price: true,
        duration: true,
        dates: false,
        tags: false
    })

    // Paginación
    const [currentPage, setCurrentPage] = useState(1)
    const TOURS_PER_PAGE = 20

    useEffect(() => {
        fetchPackages()
        fetchSettings()
    }, [selectedCategory])

    // Aplicar todos los filtros cuando cambia cualquiera
    useEffect(() => {
        applyAllFilters()
    }, [selectedRegion, selectedCountry, selectedCity, priceRange, durationRange, selectedMonth, selectedTags, allPackages, search])

    // Función unificada de filtrado
    const applyAllFilters = () => {
        try {
            let filtered = [...allPackages]

            // Filtro por palabra clave
            if (search.trim()) {
                const searchLower = search.toLowerCase()
                filtered = filtered.filter(p =>
                    p.name?.toLowerCase().includes(searchLower) ||
                    p.description?.toLowerCase().includes(searchLower) ||
                    p.countries?.some(c => c?.toLowerCase().includes(searchLower)) ||
                    p.cities?.some(c => c?.toLowerCase().includes(searchLower))
                )
            }

            // Filtro por región
            if (selectedRegion) {
                filtered = filtered.filter(p => p.destination_region === selectedRegion)
            }

            // Filtro por país
            if (selectedCountry) {
                filtered = filtered.filter(p => p.countries?.includes(selectedCountry))
            }

            // Filtro por ciudad
            if (selectedCity) {
                filtered = filtered.filter(p => p.cities?.includes(selectedCity))
            }

            // Filtro por precio (USD)
            filtered = filtered.filter(p => {
                if (!p.pricing?.totalPrice) return true // Incluir si no tiene precio
                const priceUSD = p.pricing.currency === 'USD'
                    ? p.pricing.totalPrice
                    : p.pricing.totalPrice / 18 // Conversión aproximada MXN a USD
                return priceUSD >= priceRange[0] && priceUSD <= priceRange[1]
            })

            // Filtro por duración
            filtered = filtered.filter(p =>
                p.days >= durationRange[0] && p.days <= durationRange[1]
            )

            // Filtro por mes de salida (si hay departure_dates)
            if (selectedMonth) {
                // Por ahora, este filtro está preparado para cuando tengamos departure_dates
                // filtered = filtered.filter(p => ...)
            }

            // Filtro por tags
            if (selectedTags.length > 0) {
                filtered = filtered.filter(p =>
                    selectedTags.some(tag =>
                        p.tags?.some(t => t?.toLowerCase().includes(tag.toLowerCase()))
                    )
                )
            }

            setPackages(filtered)
            setCurrentPage(1)
        } catch (error) {
            console.error('Error aplicando filtros:', error)
            // En caso de error, mostrar todos los paquetes
            setPackages(allPackages)
            setCurrentPage(1)
        }
    }

    const clearAllFilters = () => {
        setSearch('')
        setSelectedRegion(null)
        setSelectedCountry(null)
        setSelectedCity(null)
        setPriceRange([0, 10000])
        setDurationRange([1, 30])
        setSelectedMonth(null)
        setSelectedTags([])
    }

    const toggleFilter = (filterName: keyof typeof expandedFilters) => {
        setExpandedFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }))
    }

    // Calcular tours paginados
    const indexOfLastTour = currentPage * TOURS_PER_PAGE
    const indexOfFirstTour = indexOfLastTour - TOURS_PER_PAGE
    const currentTours = packages.slice(indexOfFirstTour, indexOfLastTour)
    const totalPages = Math.ceil(packages.length / TOURS_PER_PAGE)

    // Funciones de paginación
    const goToPage = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1)
        }
    }

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1)
        }
    }

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings?key=TOURS_PROMO_VIDEO_URL')
            const data = await res.json()
            if (data.success && data.value) {
                setVideoUrl(data.value)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        }
    }

    const fetchPackages = async () => {
        setLoading(true)
        try {
            let url = '/api/groups?'

            // Filtrar según categoría
            const cat = CATEGORIES.find(c => c.code === selectedCategory)
            if (cat?.filter === 'offer') {
                url += 'offer=true&'
            } else if (cat?.filter === 'featured') {
                url += 'featured=true&'
            }

            if (search) {
                url += `search=${encodeURIComponent(search)}&`
            }

            const response = await fetch(url)
            const data = await response.json()

            if (data.success) {
                const pkgs = data.data.packages || []
                setAllPackages(pkgs)
                setPackages(pkgs)
                // Extraer regiones únicas - CORREGIDO: usar destination_region
                const uniqueRegions = [...new Set(pkgs.map((p: TourPackage) => p.destination_region))].filter(Boolean) as string[]
                setRegions(uniqueRegions)
                setSelectedRegion(null) // Reset filtro de región
            }
        } catch (error) {
            console.error('Error fetching packages:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchPackages()
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const handleWhatsApp = () => {
        const message = encodeURIComponent(
            `Hola, estoy interesado en los tours y viajes grupales. ¿Me pueden dar más información?`
        )
        window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}?text=${message}`, '_blank')
    }

    // Obtener listas únicas para filtros
    const allCountries = Array.from(new Set(allPackages.flatMap(p => p.countries))).sort()
    const allCities = selectedCountry
        ? Array.from(new Set(allPackages.filter(p => p.countries.includes(selectedCountry)).flatMap(p => p.cities))).sort()
        : Array.from(new Set(allPackages.flatMap(p => p.cities))).sort()
    const allTags = Array.from(new Set(allPackages.flatMap(p => p.tags || []))).sort()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header - exactamente igual a la principal */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo y botón regresar */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:inline text-sm font-medium">Regresar</span>
                            </button>
                            <Link href="/" className="flex items-center">
                                <Logo className="py-2" />
                            </Link>
                        </div>

                        {/* Navegación por categorías */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.code}
                                    onClick={() => setSelectedCategory(cat.code)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.code
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="mr-1">{cat.icon}</span>
                                    {cat.name}
                                </button>
                            ))}
                        </nav>

                        {/* Ayuda y contacto */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/ayuda')}
                                className="text-gray-600 hover:text-blue-600"
                            >
                                <HelpCircle className="w-5 h-5" />
                                <span className="hidden md:inline ml-2">Ayuda</span>
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => router.push('/viajes-grupales')}
                                className="bg-[#0066FF] hover:bg-[#0052CC] text-white border-0 rounded-full"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Cotizar Grupo</span>
                            </Button>
                        </div>
                    </div>

                    {/* Navegación móvil */}
                    <div className="lg:hidden mt-3 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.code}
                                    onClick={() => setSelectedCategory(cat.code)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat.code
                                        ? 'bg-[#0066FF] text-white'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {cat.icon} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section con video/imagen de fondo */}
            <section className="relative py-12 md:py-16 overflow-hidden">
                {/* Fondo - video o imagen parametrizable */}
                <div className="absolute inset-0">
                    {videoUrl.includes('youtube') || videoUrl.includes('vimeo') ? (
                        <iframe
                            src={(() => {
                                // Convertir URL de watch a embed si es necesario
                                let embedUrl = videoUrl.replace('watch?v=', 'embed/');
                                // Extraer video ID para playlist (necesario para loop)
                                const videoIdMatch = embedUrl.match(/(?:embed\/|v=)([a-zA-Z0-9_-]+)/);
                                const videoId = videoIdMatch ? videoIdMatch[1] : '';
                                // Agregar parámetros de autoplay, mute y loop
                                const separator = embedUrl.includes('?') ? '&' : '?';
                                return `${embedUrl}${separator}autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`;
                            })()}
                            className="absolute w-full h-full object-cover scale-150"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            frameBorder="0"
                            allowFullScreen
                            style={{ pointerEvents: 'none' }}
                        />
                    ) : (
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${videoUrl})` }}
                        />
                    )}
                    {/* Overlay blanco para mejor legibilidad del texto negro */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/25 to-white/50" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        {/* Fondo blanco translúcido para mejor legibilidad */}
                        <div className="inline-block backdrop-blur-sm bg-white/70 rounded-2xl px-8 py-6 mb-6">
                            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 drop-shadow-sm">
                                {CATEGORIES.find(c => c.code === selectedCategory)?.icon} {CATEGORIES.find(c => c.code === selectedCategory)?.name}
                            </h1>
                            <p className="text-lg md:text-xl text-gray-800 drop-shadow-sm max-w-2xl mx-auto">
                                Descubre el mundo con nuestros paquetes todo incluido.
                                Europa, Asia, Medio Oriente y más destinos te esperan.
                            </p>
                        </div>

                        {/* Barra de búsqueda */}
                        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                            <div className="flex gap-2 backdrop-blur-xl bg-white/90 rounded-xl p-2 shadow-2xl border border-white/30">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar destino, país o tour..."
                                        className="pl-12 h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="h-12 px-6 bg-[#0066FF] text-white hover:bg-[#0052CC] rounded-full"
                                >
                                    Buscar
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* Botón móvil de filtros */}
            <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#0066FF] text-white rounded-full p-4 shadow-2xl hover:bg-[#0052CC] transition-colors"
            >
                <Filter className="w-6 h-6" />
            </button>

            {/* Layout con Sidebar */}
            <section className="py-6">
                <div className="container mx-auto px-4">
                    <div className="flex gap-6">
                        {/* Sidebar - Filtros */}
                        <aside className={`
                            w-80 flex-shrink-0
                            ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'}
                            lg:block lg:static lg:p-0
                        `}>
                            {/* Header móvil */}
                            <div className="lg:hidden flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Filtros</h2>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="lg:sticky lg:top-24 space-y-4">
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
                                                placeholder="Buscar tour, destino..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
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
                                                onChange={(e) => {
                                                    setSelectedCountry(e.target.value || null)
                                                    setSelectedCity(null)
                                                }}
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

                                    {/* Filtro por Tarifa (USD) */}
                                    <div className="border-t pt-4">
                                        <button
                                            onClick={() => toggleFilter('price')}
                                            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
                                        >
                                            <span className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                Tarifa (USD)
                                            </span>
                                            {expandedFilters.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        {expandedFilters.price && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span>${priceRange[0].toLocaleString()}</span>
                                                    <span>-</span>
                                                    <span>${priceRange[1].toLocaleString()}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10000"
                                                    step="100"
                                                    value={priceRange[1]}
                                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                                    className="w-full accent-green-600"
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

                                    {/* Filtro por Región */}
                                    <div className="border-t pt-4">
                                        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-blue-600" />
                                            Región / Destino
                                        </label>
                                        <div className="space-y-1 max-h-48 overflow-y-auto">
                                            <button
                                                onClick={() => setSelectedRegion(null)}
                                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${!selectedRegion
                                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                Todos ({allPackages.length})
                                            </button>
                                            {regions.sort().map(region => {
                                                const count = allPackages.filter(p => p.destination_region === region).length
                                                return (
                                                    <button
                                                        key={region}
                                                        onClick={() => setSelectedRegion(region)}
                                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedRegion === region
                                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                                            : 'hover:bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        {region} ({count})
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Filtro por Tags/Eventos */}
                                    <div className="border-t pt-4">
                                        <button
                                            onClick={() => toggleFilter('tags')}
                                            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-indigo-600" />
                                                Eventos Especiales
                                            </span>
                                            {expandedFilters.tags ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        {expandedFilters.tags && (
                                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                                {EVENT_CATEGORIES.map(cat => {
                                                    const count = allPackages.filter(p =>
                                                        p.tags && p.tags.some(tag =>
                                                            tag.toLowerCase().includes(cat.code.toLowerCase())
                                                        )
                                                    ).length
                                                    const isSelected = selectedTags.includes(cat.code)

                                                    return (
                                                        <button
                                                            key={cat.code}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setSelectedTags(selectedTags.filter(t => t !== cat.code))
                                                                } else {
                                                                    setSelectedTags([...selectedTags, cat.code])
                                                                }
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${isSelected
                                                                ? 'bg-indigo-100 text-indigo-700 font-medium'
                                                                : 'hover:bg-gray-100 text-gray-700'
                                                                }`}
                                                        >
                                                            {cat.icon} {cat.name} ({count})
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <main className="flex-1 min-w-0">
                            {/* Lista de paquetes */}
                            <div>
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center justify-center py-20"
                                        >
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                            <span className="ml-3 text-gray-600">Cargando tours...</span>
                                        </motion.div>
                                    ) : packages.length === 0 ? (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-20"
                                        >
                                            <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No encontramos tours</h3>
                                            <p className="text-gray-500">Intenta con otra categoría o búsqueda</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="results"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-2xl font-bold text-gray-800">
                                                    {packages.length} {packages.length === 1 ? 'Tour disponible' : 'Tours disponibles'}
                                                    {totalPages > 1 && (
                                                        <span className="text-base font-normal text-gray-500 ml-2">
                                                            (Página {currentPage} de {totalPages})
                                                        </span>
                                                    )}
                                                </h2>
                                            </div>

                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {currentTours.map((pkg, index) => (
                                                    <motion.div
                                                        key={pkg.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        whileHover={{ y: -5 }}
                                                    >
                                                        <Link href={`/tours/${pkg.id}`}>
                                                            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full rounded-2xl border-0 shadow-md">
                                                                {/* Imagen */}
                                                                <div className="relative h-48 overflow-hidden">
                                                                    <Image
                                                                        src={pkg.images.main || '/placeholder.jpg'}
                                                                        alt={pkg.name}
                                                                        fill
                                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                                                    {/* Badge OFERTA - siempre visible */}
                                                                    <div className="absolute top-3 left-3">
                                                                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                                                                            <Tag className="w-3 h-3" /> OFERTA
                                                                        </span>
                                                                    </div>

                                                                    {/* Duración */}
                                                                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-sm">
                                                                        <Clock className="w-4 h-4" />
                                                                        <span>{pkg.duration}</span>
                                                                    </div>

                                                                    {/* Vuelo incluido */}
                                                                    {pkg.flight.included && (
                                                                        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-xs bg-blue-600/80 px-2 py-1 rounded-full">
                                                                            <Plane className="w-3 h-3" />
                                                                            <span>Vuelo</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Contenido */}
                                                                <div className="p-4">
                                                                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                                                        {pkg.region}
                                                                    </span>
                                                                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mt-1">
                                                                        {pkg.name}
                                                                    </h3>

                                                                    {/* Ciudades */}
                                                                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                                                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                                                        <span className="line-clamp-1">
                                                                            {pkg.cities.slice(0, 2).join(', ')}
                                                                            {pkg.cities.length > 2 && ` +${pkg.cities.length - 2}`}
                                                                        </span>
                                                                    </div>

                                                                    {/* Precio */}
                                                                    <div className="border-t pt-3 mt-3">
                                                                        <div className="flex items-end justify-between">
                                                                            <div>
                                                                                {pkg.pricing?.totalPrice ? (
                                                                                    <>
                                                                                        <span className="text-xs text-gray-500">Desde</span>
                                                                                        <div className="flex items-baseline gap-1">
                                                                                            <span className="text-2xl font-bold text-blue-600">
                                                                                                ${formatPrice(pkg.pricing.totalPrice)}
                                                                                            </span>
                                                                                            <span className="text-sm text-gray-500">USD</span>
                                                                                        </div>
                                                                                    </>
                                                                                ) : (
                                                                                    <div className="text-lg font-semibold text-gray-600">
                                                                                        Consultar precio
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-full"
                                                                            >
                                                                                Ver
                                                                                <ArrowRight className="w-4 h-4 ml-1" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Controles de Paginación */}
                                            {totalPages > 1 && (
                                                <div className="mt-8 flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={goToPreviousPage}
                                                        disabled={currentPage === 1}
                                                        className="gap-2"
                                                    >
                                                        <ArrowLeft className="w-4 h-4" />
                                                        Anterior
                                                    </Button>

                                                    <div className="flex gap-1">
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                            // Mostrar solo páginas cercanas (máx 7 botones)
                                                            if (
                                                                page === 1 ||
                                                                page === totalPages ||
                                                                (page >= currentPage - 2 && page <= currentPage + 2)
                                                            ) {
                                                                return (
                                                                    <Button
                                                                        key={page}
                                                                        variant={currentPage === page ? "default" : "outline"}
                                                                        onClick={() => goToPage(page)}
                                                                        className={`w-10 h-10 p-0 ${currentPage === page ? 'bg-[#0066FF] text-white' : ''}`}
                                                                    >
                                                                        {page}
                                                                    </Button>
                                                                )
                                                            } else if (
                                                                page === currentPage - 3 ||
                                                                page === currentPage + 3
                                                            ) {
                                                                return <span key={page} className="px-2">...</span>
                                                            }
                                                            return null
                                                        })}
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        onClick={goToNextPage}
                                                        disabled={currentPage === totalPages}
                                                        className="gap-2"
                                                    >
                                                        Siguiente
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </main>
                    </div>
                </div>
            </section>

            {/* Footer gris claro - mismo estilo que la principal */}
            <footer className="bg-[#F7F7F7] py-10">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        {/* Logo y descripción */}
                        <div>
                            <Logo className="h-12 mb-6" />
                            <p className="text-gray-600 text-sm">
                                Tu agencia de viajes de confianza. Más de 10 años creando experiencias inolvidables.
                            </p>
                        </div>

                        {/* Contacto */}
                        <div>
                            <h4 className="font-semibold mb-4 text-gray-800">Contacto</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                <a href={`tel:${WHATSAPP_NUMBER}`} className="flex items-center gap-2 hover:text-blue-600">
                                    <Phone className="w-4 h-4" />
                                    {WHATSAPP_NUMBER}
                                </a>
                                <a href="mailto:viajes@asoperadora.com" className="flex items-center gap-2 hover:text-blue-600">
                                    <Mail className="w-4 h-4" />
                                    viajes@asoperadora.com
                                </a>
                                <button onClick={handleWhatsApp} className="flex items-center gap-2 hover:text-green-600">
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp
                                </button>
                            </div>
                        </div>

                        {/* Ayuda */}
                        <div>
                            <h4 className="font-semibold mb-4 text-gray-800">Ayuda</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                <Link href="/preguntas-frecuentes" className="block hover:text-blue-600">Preguntas frecuentes</Link>
                                <Link href="/terminos" className="block hover:text-blue-600">Términos y condiciones</Link>
                                <Link href="/privacidad" className="block hover:text-blue-600">Política de privacidad</Link>
                            </div>
                        </div>

                        {/* Categorías */}
                        <div>
                            <h4 className="font-semibold mb-4 text-gray-800">Categorías</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.code}
                                        onClick={() => setSelectedCategory(cat.code)}
                                        className="block hover:text-blue-600"
                                    >
                                        {cat.icon} {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-300 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600">
                            © 2026 AS Operadora de Viajes y Eventos. Todos los derechos reservados.
                        </p>
                        <p className="text-sm text-gray-500">
                            v2.268 | Build: 01 Feb 2026
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

// Loading fallback
function ToursLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Cargando tours...</p>
            </div>
        </div>
    )
}

// Componente principal envuelto en Suspense
export default function ToursPage() {
    return (
        <Suspense fallback={<ToursLoading />}>
            <ToursContent />
        </Suspense>
    )
}
