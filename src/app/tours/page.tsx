// Catálogo de Tours y Viajes Grupales
// Build: 28 Ene 2026 - v2.237 - Rediseño completo con navegación por categorías

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
    Heart
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
const ALL_REGIONS = [
    'Europa', 'Asia', 'Medio Oriente', 'Norte América', 'Centro América',
    'Sudamérica', 'Caribe', 'África', 'Oceanía', 'México'
]

const WHATSAPP_NUMBER = '+525621486939' // Número oficial AS Operadora

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

    useEffect(() => {
        fetchPackages()
        fetchSettings()
    }, [selectedCategory])

    // Filtrar por región cuando cambia
    useEffect(() => {
        if (selectedRegion) {
            const filtered = allPackages.filter(p => p.region === selectedRegion)
            setPackages(filtered)
        } else {
            setPackages(allPackages)
        }
    }, [selectedRegion, allPackages])

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
                // Extraer regiones únicas
                const uniqueRegions = [...new Set(pkgs.map((p: TourPackage) => p.region))].filter(Boolean) as string[]
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header traslúcido - mismo tamaño que la principal */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
                <div className="container mx-auto px-4 py-6">
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
                                <Logo className="h-10" />
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
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:from-blue-700 hover:to-indigo-700"
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
                                        ? 'bg-blue-600 text-white'
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
                            src={videoUrl}
                            className="w-full h-full object-cover"
                            allow="autoplay; muted; loop"
                            style={{ pointerEvents: 'none' }}
                        />
                    ) : (
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${videoUrl})` }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/85 to-indigo-700/85" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-white"
                    >
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            {CATEGORIES.find(c => c.code === selectedCategory)?.icon} {CATEGORIES.find(c => c.code === selectedCategory)?.name}
                        </h1>
                        <p className="text-lg md:text-xl opacity-90 mb-6 max-w-2xl mx-auto">
                            Descubre el mundo con nuestros paquetes todo incluido.
                            Europa, Asia, Medio Oriente y más destinos te esperan.
                        </p>

                        {/* Barra de búsqueda */}
                        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                            <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar destino, país o tour..."
                                        className="pl-12 h-12 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="h-12 px-6 bg-white text-blue-600 hover:bg-white/90"
                                >
                                    Buscar
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* Filtros por Región/Destino - Siempre mostrar todas las regiones */}
            <section className="py-4 border-b bg-white/50 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    {/* Regiones */}
                    <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-800">Filtrar por Destino</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setSelectedRegion(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedRegion
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todos ({allPackages.length})
                        </button>
                        {ALL_REGIONS.map((region) => {
                            const count = allPackages.filter(p => p.region === region).length;
                            return (
                                <button
                                    key={region}
                                    onClick={() => setSelectedRegion(region)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedRegion === region
                                        ? 'bg-blue-600 text-white shadow'
                                        : count > 0
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            : 'bg-gray-50 text-gray-400 cursor-default'
                                        }`}
                                    disabled={count === 0}
                                >
                                    {region} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Separador */}
                    <div className="border-t border-gray-200 my-4" />

                    {/* Categorías de eventos */}
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-semibold text-gray-800">Viajes para Eventos Especiales</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {EVENT_CATEGORIES.map((cat) => (
                            <button
                                key={cat.code}
                                onClick={() => {
                                    // Por ahora solo muestra una búsqueda con el término
                                    setSearch(cat.name);
                                    // Trigger búsqueda
                                }}
                                className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all"
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lista de paquetes */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4">
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
                                    </h2>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {packages.map((pkg, index) => (
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
                                                                    <span className="text-xs text-gray-500">Desde</span>
                                                                    <div className="flex items-baseline gap-1">
                                                                        <span className="text-2xl font-bold text-blue-600">
                                                                            ${formatPrice(pkg.pricing.totalPrice)}
                                                                        </span>
                                                                        <span className="text-sm text-gray-500">USD</span>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
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
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                            v2.241 | Build: 28 Ene 2026
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
