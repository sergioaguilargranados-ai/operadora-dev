// Catálogo de Tours y Viajes Grupales
// Build: 27 Ene 2026 - v2.235 - Sistema Híbrido MegaTravel

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Search,
    MapPin,
    Calendar,
    Users,
    Plane,
    Star,
    ArrowRight,
    Filter,
    Globe,
    Clock,
    ChevronDown,
    Sparkles,
    Tag,
    X,
    Loader2
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

const REGIONS = [
    { code: 'all', name: 'Todos', icon: '🌍' },
    { code: 'Europa', name: 'Europa', icon: '🇪🇺' },
    { code: 'Medio Oriente', name: 'Medio Oriente', icon: '🕌' },
    { code: 'Asia', name: 'Asia', icon: '🌏' },
    { code: 'Norte América', name: 'Norteamérica', icon: '🇺🇸' },
    { code: 'Sudamérica', name: 'Sudamérica', icon: '🌎' },
    { code: 'Caribe', name: 'Caribe', icon: '🏝️' },
    { code: 'Cruceros', name: 'Cruceros', icon: '🚢' },
]

export default function ToursPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [packages, setPackages] = useState<TourPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'all')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        fetchPackages()
    }, [selectedRegion])

    const fetchPackages = async () => {
        setLoading(true)
        try {
            let url = '/api/groups?'
            if (selectedRegion && selectedRegion !== 'all') {
                url += `region=${encodeURIComponent(selectedRegion)}&`
            }
            if (search) {
                url += `search=${encodeURIComponent(search)}&`
            }

            const response = await fetch(url)
            const data = await response.json()

            if (data.success) {
                setPackages(data.data.packages || [])
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header traslúcido */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <Logo className="h-8" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                Inicio
                            </Link>
                            <Link href="/tours" className="text-sm font-medium text-blue-600">
                                Tours
                            </Link>
                            <Link href="/viajes-grupales" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                Cotización Grupal
                            </Link>
                        </nav>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/viajes-grupales')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:from-blue-700 hover:to-indigo-700"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Cotizar Grupo
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499856871958-5b9337606a3e?w=1600')] bg-cover bg-center opacity-30" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-white"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Tours y Viajes Grupales
                        </h1>
                        <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                            Descubre el mundo con nuestros paquetes todo incluido.
                            Europa, Asia, Medio Oriente y más destinos te esperan.
                        </p>

                        {/* Barra de búsqueda */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
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

            {/* Filtros por región */}
            <section className="py-6 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {REGIONS.map((region) => (
                            <button
                                key={region.code}
                                onClick={() => setSelectedRegion(region.code)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedRegion === region.code
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span>{region.icon}</span>
                                <span className="font-medium">{region.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lista de paquetes */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-600">Cargando tours...</span>
                        </div>
                    ) : packages.length === 0 ? (
                        <div className="text-center py-20">
                            <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No encontramos tours</h3>
                            <p className="text-gray-500">Intenta con otro destino o región</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {packages.length} {packages.length === 1 ? 'Tour disponible' : 'Tours disponibles'}
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {packages.map((pkg, index) => (
                                    <motion.div
                                        key={pkg.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link href={`/tours/${pkg.id}`}>
                                            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                                                {/* Imagen */}
                                                <div className="relative h-52 overflow-hidden">
                                                    <Image
                                                        src={pkg.images.main || '/placeholder.jpg'}
                                                        alt={pkg.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                                    {/* Badges */}
                                                    <div className="absolute top-3 left-3 flex gap-2">
                                                        {pkg.isFeatured && (
                                                            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                                <Star className="w-3 h-3" /> Destacado
                                                            </span>
                                                        )}
                                                        {pkg.isOffer && (
                                                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                                <Tag className="w-3 h-3" /> Oferta
                                                            </span>
                                                        )}
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
                                                            <span>Vuelo incluido</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Contenido */}
                                                <div className="p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                                                {pkg.region}
                                                            </span>
                                                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                                {pkg.name}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    {/* Ciudades */}
                                                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                                        <span className="line-clamp-1">
                                                            {pkg.cities.slice(0, 3).join(', ')}
                                                            {pkg.cities.length > 3 && ` +${pkg.cities.length - 3}`}
                                                        </span>
                                                    </div>

                                                    {/* Incluye */}
                                                    <div className="flex flex-wrap gap-1 mb-4">
                                                        {pkg.includes.slice(0, 2).map((item, i) => (
                                                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                                {item.length > 20 ? item.substring(0, 20) + '...' : item}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Precio */}
                                                    <div className="border-t pt-3">
                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                <span className="text-xs text-gray-500">Desde</span>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-2xl font-bold text-blue-600">
                                                                        ${formatPrice(pkg.pricing.totalPrice)}
                                                                    </span>
                                                                    <span className="text-sm text-gray-500">USD</span>
                                                                </div>
                                                                <span className="text-xs text-gray-400">{pkg.pricing.priceType}</span>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                            >
                                                                Ver más
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
                        </>
                    )}
                </div>
            </section>

            {/* CTA Cotización grupal */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        ¿Viajan más de 10 personas?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        Obtén una cotización personalizada con descuentos especiales para grupos.
                        Nuestro equipo te ayudará a planear el viaje perfecto.
                    </p>
                    <Button
                        size="lg"
                        onClick={() => router.push('/viajes-grupales')}
                        className="bg-white text-blue-600 hover:bg-white/90 font-semibold px-8"
                    >
                        <Users className="w-5 h-5 mr-2" />
                        Solicitar Cotización Grupal
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Logo className="h-6 brightness-0 invert" />
                            <span className="text-gray-400">|</span>
                            <span className="text-sm text-gray-400">Tours y Viajes Grupales</span>
                        </div>
                        <div className="text-sm text-gray-400">
                            © 2026 AS Operadora. Todos los derechos reservados. v2.235
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
