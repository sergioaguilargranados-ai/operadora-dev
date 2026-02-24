// Página de detalle de Tour - VERSIÓN COMPLETA
// Build: 31 Ene 2026 - v2.256 - UI completa con todos los campos MegaTravel

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ArrowLeft,
    MapPin,
    Users,
    Plane,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    Phone,
    Mail,
    MessageCircle,
    Hotel,
    Utensils,
    Globe,
    Loader2,
    Tag,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    Send,
    Calendar,
    DollarSign,
    FileText,
    ExternalLink,
    AlertCircle,
    Building2,
    Map as MapIcon,
    X,
    Bell
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { UserMenu } from '@/components/UserMenu'
import { TourMap } from '@/components/TourMap'


const WHATSAPP_NUMBER = '+527208156804' // Número oficial AS Operadora
const GOOGLE_MAPS_API_KEY = 'AIzaSyDc8NB8nvcbY2OTv6Dcvzm7AwAbV7tPgF0' // Google Maps API Key

interface TourDetail {
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
        priceVariants?: Record<string, number>
        breakdown: {
            netPrice: number
            taxes: number
            tips: string
            total: number
        }
    }
    flight: {
        included: boolean
        airline?: string
        origin: string
        class?: string
    }
    hotel: {
        category: string
        mealPlan: string
        details?: any[]
    }
    includes: string[]
    notIncludes: string[]
    itinerary?: any[]
    optionalTours: any[]
    departures?: Array<{
        departure_date: string
        return_date?: string
        price_usd?: number
        taxes_usd?: number
        supplement_usd?: number
        total_usd?: number
        origin_city?: string
        availability: string
        status: string
        notes?: string
    }>

    // NUEVOS CAMPOS
    detailedHotels?: Array<{
        city: string
        hotel_names: string[]
        category: string
        country: string
        stars?: number
    }>
    supplements?: Array<{
        dates: string[]
        price_usd: number
        description?: string
    }>
    visaRequirements?: Array<{
        country: string
        days_before_departure: number
        processing_time: string
        cost: string
        application_url?: string
        notes?: string
    }>
    importantNotes?: string[]
    mapImage?: string

    images: {
        main: string
        gallery: string[]
    }
    tags: string[]
    isFeatured: boolean
    isOffer: boolean
    tipsAmount?: string
    externalUrl: string
}

export default function TourDetailPage({ params }: { params: Promise<{ code: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [tour, setTour] = useState<TourDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showFullIncludes, setShowFullIncludes] = useState(false)
    const [showFullOptionalTours, setShowFullOptionalTours] = useState(false)
    const [showFullNotes, setShowFullNotes] = useState(false)
    const [showFullItinerary, setShowFullItinerary] = useState(false)
    const [numPersonas, setNumPersonas] = useState(1) // Selector de personas
    const [mapImageFailed, setMapImageFailed] = useState(false)
    const [selectedDeparture, setSelectedDeparture] = useState<{
        departure_date: string; return_date?: string; price_usd?: number;
        taxes_usd?: number; supplement_usd?: number; total_usd?: number;
        origin_city?: string; availability: string; status: string; notes?: string;
    } | null>(null)
    const [departureMonthFilter, setDepartureMonthFilter] = useState<string>('all')

    useEffect(() => {
        fetchTourDetail()
    }, [resolvedParams.code])

    // Carrusel automático
    useEffect(() => {
        if (!tour) return
        const allImages = [tour.images.main, ...(tour.images.gallery || [])].filter(Boolean)
        if (allImages.length <= 1) return

        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % allImages.length)
        }, 5000) // Cambiar cada 5 segundos

        return () => clearInterval(interval)
    }, [tour])

    const fetchTourDetail = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/groups/${resolvedParams.code}`)
            const data = await response.json()

            if (data.success) {
                setTour(data.data)
            } else {
                router.push('/tours')
            }
        } catch (error) {
            console.error('Error fetching tour:', error)
            router.push('/tours')
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price: number) => {
        if (!price || isNaN(price)) return '0'
        return new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const handleWhatsApp = () => {
        const message = encodeURIComponent(
            `Hola, me interesa el tour "${tour?.name}" (${tour?.id}). ` +
            `Precio: $${formatPrice(tour?.pricing.totalPrice || 0)} USD. ` +
            `¿Me pueden dar más información?`
        )
        window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}?text=${message}`, '_blank')
    }

    const nextImage = () => {
        if (!tour) return
        const allImages = [tour.images.main, ...(tour.images.gallery || [])].filter(Boolean)
        setCurrentImageIndex(prev => (prev + 1) % allImages.length)
    }

    const prevImage = () => {
        if (!tour) return
        const allImages = [tour.images.main, ...(tour.images.gallery || [])].filter(Boolean)
        setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando detalles del tour...</p>
                </div>
            </div>
        )
    }

    if (!tour) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <div className="text-center">
                    <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Tour no encontrado</h2>
                    <p className="text-gray-500 mb-6">El tour que buscas no está disponible.</p>
                    <Button onClick={() => router.push('/tours')}>
                        Ver todos los tours
                    </Button>
                </div>
            </div>
        )
    }

    const allImages = [tour.images.main, ...(tour.images.gallery || [])].filter(Boolean)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header - exactamente igual a la principal */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 md:gap-8">
                        <Link href="/">
                            <Logo className="py-2" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 md:gap-6 text-sm">
                        <button
                            onClick={() => window.location.href = '/mis-reservas'}
                            className="hover:text-primary font-medium"
                        >
                            Tus Reservas
                        </button>
                        <UserMenu />
                    </div>
                </div>
            </header>

            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Link href="/" className="hover:text-blue-600">Inicio</Link>
                    <span>/</span>
                    <Link href="/tours" className="hover:text-blue-600">Tours</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{tour.name}</span>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="container mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna izquierda - Detalles */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Galería de imágenes */}
                        <Card className="overflow-hidden">
                            <div className="relative bg-gray-900" style={{ minHeight: '360px', maxHeight: '500px' }}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImageIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="relative w-full"
                                        style={{ minHeight: '360px', maxHeight: '500px' }}
                                    >
                                        {/* Fondo difuminado para efecto premium */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
                                            style={{ backgroundImage: `url(${allImages[currentImageIndex]})` }}
                                        />
                                        {/* Imagen principal - completa sin recortar */}
                                        <Image
                                            src={allImages[currentImageIndex]}
                                            alt={tour.name}
                                            fill
                                            className="object-contain relative z-[1]"
                                            priority
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Controles del carrusel */}
                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                                        >
                                            <ChevronLeft className="w-6 h-6 text-gray-800" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                                        >
                                            <ChevronRight className="w-6 h-6 text-gray-800" />
                                        </button>

                                        {/* Indicadores */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {allImages.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentImageIndex(i)}
                                                    className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex
                                                        ? 'bg-white w-8'
                                                        : 'bg-white/50 hover:bg-white/75'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {tour.isFeatured && (
                                        <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                                            ⭐ DESTACADO
                                        </span>
                                    )}
                                    {tour.isOffer && (
                                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                            🔥 OFERTA
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Título y descripción */}
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">{tour.name}</h1>
                            <p className="text-lg text-gray-700 leading-relaxed">{tour.description}</p>
                        </div>

                        {/* Información rápida */}
                        <Card className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Duración</p>
                                    <p className="font-bold text-gray-900">{tour.days} días / {tour.nights} noches</p>
                                </div>
                                <div className="text-center">
                                    <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Destino</p>
                                    <p className="font-bold text-gray-900">{tour.mainCountry}</p>
                                </div>
                                <div className="text-center">
                                    <Plane className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Vuelo</p>
                                    <p className="font-bold text-gray-900">
                                        {tour.flight.included ? 'Incluido' : 'No incluido'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <Hotel className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Hotel</p>
                                    <p className="font-bold text-gray-900">{tour.hotel.category}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Mapa del Tour - prioriza imagen de MegaTravel, fallback Google Maps interactivo */}
                        {(tour.mapImage || (tour.cities && tour.cities.length > 0)) && (
                            <Card className="p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <MapIcon className="w-6 h-6 text-blue-600" />
                                    Mapa del Tour
                                </h2>
                                {tour.mapImage && !mapImageFailed ? (
                                    <div className="w-full rounded-xl overflow-hidden bg-gray-100" style={{ minHeight: '300px' }}>
                                        <img
                                            src={tour.mapImage}
                                            alt={`Mapa de ${tour.name}`}
                                            className="w-full h-auto object-contain"
                                            onError={() => {
                                                // Si la imagen falla, activar fallback a Google Maps
                                                console.log('⚠️ Imagen de mapa falló, usando Google Maps como fallback');
                                                setMapImageFailed(true);
                                            }}
                                        />
                                    </div>
                                ) : tour.cities && tour.cities.length > 0 ? (
                                    <TourMap
                                        cities={tour.cities}
                                        countries={tour.countries || []}
                                        mainCountry={tour.mainCountry || tour.countries?.[0] || 'World'}
                                        tourName={tour.name}
                                    />
                                ) : null}
                            </Card>
                        )}


                        {/* NUEVO: Itinerario del Tour */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                    Itinerario
                                </h2>
                                {tour.itinerary && tour.itinerary.length > 3 && (
                                    <Button
                                        variant="link"
                                        className="text-blue-600 hover:text-blue-700"
                                        onClick={() => setShowFullItinerary(true)}
                                    >
                                        Ver itinerario completo
                                    </Button>
                                )}
                            </div>

                            {/* Itinerario resumido - primeros 3 días */}
                            <div className="space-y-4">
                                {tour.itinerary && tour.itinerary.length > 0 ? (
                                    <>
                                        {tour.itinerary.slice(0, 3).map((day: any, index: number) => (
                                            <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
                                                <h3 className="font-bold text-lg text-gray-900">{day.title}</h3>
                                                <p className="text-gray-600 mt-1">{day.description}</p>
                                            </div>
                                        ))}
                                        {tour.itinerary.length > 3 && (
                                            <div className="text-center pt-4">
                                                <p className="text-gray-500 text-sm">
                                                    ... y {tour.itinerary.length - 3} días más
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    className="mt-2"
                                                    onClick={() => setShowFullItinerary(true)}
                                                >
                                                    Ver itinerario completo
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>Itinerario no disponible</p>
                                    </div>
                                )}
                            </div>
                        </Card>



                        {/* NUEVO: Hoteles Detallados */}
                        {tour.detailedHotels && tour.detailedHotels.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <Building2 className="w-6 h-6 text-blue-600" />
                                    Hoteles Previstos o Similares
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">HOTEL</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">CIUDAD</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">TIPO</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">PAÍS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tour.detailedHotels.map((hotel, i) => (
                                                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-gray-800">
                                                        {hotel.hotel_names.join(' / ')}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-800">{hotel.city}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                            {hotel.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-800">{hotel.country}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {/* NUEVO: Tarifas y Suplementos */}
                        {(tour.pricing.priceVariants || tour.supplements) && (
                            <Card className="p-6">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <DollarSign className="w-6 h-6 text-blue-600" />
                                    Tarifas 2026
                                </h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Tarifas base */}
                                    {tour.pricing.priceVariants && (
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-3">Tarifas por Tipo de Habitación</h3>
                                            <div className="space-y-2">
                                                {Object.entries(tour.pricing.priceVariants).map(([type, price]) => (
                                                    <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                        <span className="text-gray-700 capitalize">{type}</span>
                                                        <span className="font-bold text-blue-600">${formatPrice(price)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700 font-medium">Impuestos Aéreos 2026</span>
                                                    <span className="font-bold text-blue-600">${formatPrice(tour.pricing.taxes)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Suplementos */}
                                    {tour.supplements && tour.supplements.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-3">Suplementos 2026</h3>
                                            <div className="space-y-2">
                                                {tour.supplements.map((sup, i) => (
                                                    <div key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <div className="flex justify-between items-start gap-3">
                                                            <span className="text-sm text-gray-700">{sup.description}</span>
                                                            <span className="font-bold text-yellow-700 whitespace-nowrap">
                                                                ${formatPrice(sup.price_usd)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Ciudades que visitarás */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-blue-600" />
                                Ciudades que visitarás
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {tour.cities.map((city, i) => (
                                    <span
                                        key={i}
                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                                    >
                                        {city}
                                    </span>
                                ))}
                            </div>
                        </Card>

                        {/* El viaje incluye */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                El viaje incluye
                            </h2>
                            <ul className="space-y-3">
                                {(showFullIncludes ? tour.includes : tour.includes.slice(0, 5)).map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            {tour.includes.length > 5 && (
                                <button
                                    onClick={() => setShowFullIncludes(!showFullIncludes)}
                                    className="mt-4 text-blue-600 font-medium flex items-center gap-1 hover:underline"
                                >
                                    {showFullIncludes ? (
                                        <>Ver menos <ChevronUp className="w-4 h-4" /></>
                                    ) : (
                                        <>Ver todo ({tour.includes.length}) <ChevronDown className="w-4 h-4" /></>
                                    )}
                                </button>
                            )}
                        </Card>

                        {/* No incluye */}
                        {tour.notIncludes && tour.notIncludes.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <XCircle className="w-6 h-6 text-red-500" />
                                    No incluye
                                </h2>
                                <ul className="space-y-3">
                                    {tour.notIncludes.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {/* NUEVO: Requisitos de Visa */}
                        {tour.visaRequirements && tour.visaRequirements.length > 0 && (
                            <Card className="p-6 border-2 border-orange-200 bg-orange-50/50">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-orange-600" />
                                    Requisitos de Visa
                                </h2>
                                <div className="space-y-6">
                                    {tour.visaRequirements.map((visa, i) => (
                                        <div key={i} className="bg-white p-5 rounded-xl border border-orange-200">
                                            <h3 className="font-bold text-lg text-gray-900 mb-3">{visa.country}:</h3>
                                            <div className="space-y-2 text-gray-700">
                                                <p>
                                                    <span className="font-semibold">Tiempo antes de la salida para tramitar la visa:</span>{' '}
                                                    {visa.days_before_departure} días.
                                                </p>
                                                <p>
                                                    <span className="font-semibold">Duración del trámite:</span>{' '}
                                                    {visa.processing_time}
                                                </p>
                                                <p>
                                                    <span className="font-semibold">Costo por pasajero:</span>{' '}
                                                    {visa.cost}
                                                </p>
                                                {visa.application_url && (
                                                    <p className="flex items-center gap-2">
                                                        <span className="font-semibold">Se genera vía internet en el siguiente link:</span>
                                                        <a
                                                            href={visa.application_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                                        >
                                                            clic aquí <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </p>
                                                )}
                                                {visa.notes && (
                                                    <p className="mt-3 text-sm italic bg-orange-50 p-3 rounded-lg border border-orange-100">
                                                        <span className="font-semibold">Nota:</span> {visa.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Tours opcionales - MEJORADO */}
                        {tour.optionalTours && tour.optionalTours.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <Star className="w-6 h-6 text-yellow-500" />
                                    Tours Opcionales
                                </h2>
                                <div className="space-y-4">
                                    {(showFullOptionalTours ? tour.optionalTours : tour.optionalTours.slice(0, 3)).map((opt, i) => (
                                        <div key={i} className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    {opt.code && (
                                                        <span className="inline-block px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full mb-2">
                                                            {opt.code}
                                                        </span>
                                                    )}
                                                    <h4 className="font-bold text-lg text-gray-900">{opt.name}</h4>
                                                </div>
                                                {opt.price && (
                                                    <span className="text-2xl font-bold text-yellow-700 whitespace-nowrap ml-4">
                                                        USD ${opt.price.amount || opt.price}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-700 mb-3">{opt.description}</p>

                                            {opt.valid_dates && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <Calendar className="w-4 h-4 inline mr-1" />
                                                    Válido del {opt.valid_dates.from} al {opt.valid_dates.to}
                                                </p>
                                            )}

                                            {opt.activities && opt.activities.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-sm font-semibold text-gray-700 mb-2">Incluye:</p>
                                                    <ul className="space-y-1">
                                                        {opt.activities.map((activity: string, j: number) => (
                                                            <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                                {activity}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {opt.conditions && (
                                                <p className="mt-3 text-xs text-gray-600 italic bg-white/50 p-2 rounded">
                                                    {opt.conditions}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {tour.optionalTours.length > 3 && (
                                    <button
                                        onClick={() => setShowFullOptionalTours(!showFullOptionalTours)}
                                        className="mt-4 text-blue-600 font-medium flex items-center gap-1 hover:underline"
                                    >
                                        {showFullOptionalTours ? (
                                            <>Ver menos <ChevronUp className="w-4 h-4" /></>
                                        ) : (
                                            <>Ver todos ({tour.optionalTours.length}) <ChevronDown className="w-4 h-4" /></>
                                        )}
                                    </button>
                                )}
                            </Card>
                        )}

                        {/* NUEVO: Notas Importantes */}
                        {tour.importantNotes && tour.importantNotes.length > 0 && (
                            <Card className="p-6 border-2 border-red-200 bg-red-50/50">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                    Notas Importantes
                                </h2>
                                <ul className="space-y-3">
                                    {(showFullNotes ? tour.importantNotes : tour.importantNotes.slice(0, 3)).map((note, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-800">
                                            <span className="text-red-500 font-bold flex-shrink-0">•</span>
                                            <span>{note}</span>
                                        </li>
                                    ))}
                                </ul>
                                {tour.importantNotes.length > 3 && (
                                    <button
                                        onClick={() => setShowFullNotes(!showFullNotes)}
                                        className="mt-4 text-red-600 font-medium flex items-center gap-1 hover:underline"
                                    >
                                        {showFullNotes ? (
                                            <>Ver menos <ChevronUp className="w-4 h-4" /></>
                                        ) : (
                                            <>Ver todas ({tour.importantNotes.length}) <ChevronDown className="w-4 h-4" /></>
                                        )}
                                    </button>
                                )}
                            </Card>
                        )}
                    </div>



                    {/* Columna derecha - Sidebar de precios */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Card de precio */}
                            <Card className="p-6 border-2 border-blue-200">
                                {/* Precio principal */}
                                <div className="text-center mb-6">
                                    {selectedDeparture && (selectedDeparture.price_usd || selectedDeparture.total_usd) ? (
                                        <>
                                            <div className="text-4xl font-bold text-blue-600 mb-2">
                                                ${formatPrice(selectedDeparture.total_usd || selectedDeparture.price_usd || 0)}
                                                <span className="text-lg text-gray-600 ml-2">USD</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Por persona en habitación Doble</p>
                                            <p className="text-xs text-green-600 mt-1">
                                                📅 Salida: {new Date(selectedDeparture.departure_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </>
                                    ) : tour.pricing.basePrice > 0 ? (
                                        <>
                                            <div className="text-4xl font-bold text-blue-600 mb-2">
                                                ${formatPrice(tour.pricing.basePrice)}
                                                <span className="text-lg text-gray-600 ml-2">USD</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Por persona en habitación Doble</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                                Consultar precio
                                            </div>
                                            <p className="text-sm text-gray-600">Contacta para disponibilidad y tarifas</p>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-3 mb-6 pb-6 border-b">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Precio base:</span>
                                        <span className="font-semibold">
                                            ${formatPrice(selectedDeparture?.price_usd || tour.pricing.basePrice)} USD
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Impuestos:</span>
                                        <span className="font-semibold">
                                            ${formatPrice(selectedDeparture?.taxes_usd || tour.pricing.taxes || 0)} USD
                                        </span>
                                    </div>
                                    {selectedDeparture?.supplement_usd && selectedDeparture.supplement_usd > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Suplemento:</span>
                                            <span className="font-semibold text-orange-600">
                                                ${formatPrice(selectedDeparture.supplement_usd)} USD
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Selector de número de personas */}
                                <div className="mb-6 pb-6 border-b">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de personas:</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setNumPersonas(Math.max(1, numPersonas - 1))}
                                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-lg transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="text-2xl font-bold text-blue-600 w-12 text-center">{numPersonas}</span>
                                        <button
                                            onClick={() => setNumPersonas(numPersonas + 1)}
                                            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold text-lg transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center mb-6 pb-6 border-b">
                                    <span className="text-lg font-bold text-gray-900">Total ({numPersonas} {numPersonas === 1 ? 'persona' : 'personas'}):</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {(() => {
                                            const unitPrice = selectedDeparture?.total_usd || selectedDeparture?.price_usd || tour.pricing.totalPrice || (tour.pricing.basePrice + (tour.pricing.taxes || 0))
                                            return unitPrice > 0 ? `$${formatPrice(unitPrice * numPersonas)} USD` : 'Consultar'
                                        })()}
                                    </span>
                                </div>

                                {/* Botón Cotizar Tour */}
                                <Button
                                    size="lg"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                                    onClick={() => {
                                        const queryParams: Record<string, string> = {
                                            tourId: tour.id,
                                            tourName: tour.name,
                                            price: (selectedDeparture?.price_usd || tour.pricing.basePrice).toString(),
                                            region: tour.region,
                                            duration: `${tour.days} días / ${tour.nights} noches`,
                                            cities: tour.cities.join(', '),
                                            personas: numPersonas.toString()
                                        }
                                        if (selectedDeparture) {
                                            queryParams.fechaSalida = selectedDeparture.departure_date
                                            if (selectedDeparture.total_usd) queryParams.totalPorPersona = selectedDeparture.total_usd.toString()
                                            if (selectedDeparture.taxes_usd) queryParams.impuestos = selectedDeparture.taxes_usd.toString()
                                            if (selectedDeparture.supplement_usd) queryParams.suplemento = selectedDeparture.supplement_usd.toString()
                                            if (selectedDeparture.origin_city) queryParams.ciudadSalida = selectedDeparture.origin_city
                                        }
                                        const params = new URLSearchParams(queryParams)
                                        window.location.href = `/cotizar-tour?${params.toString()}`
                                    }}
                                >
                                    <Send className="w-5 h-5 mr-2" />
                                    Cotizar Tour
                                </Button>

                                <p className="text-xs text-center text-gray-500 mt-4">
                                    Respuesta inmediata • Asesoría personalizada
                                </p>
                            </Card>

                            {/* Card de Fechas de Salida */}
                            {tour.departures && tour.departures.length > 0 && (() => {
                                // Agrupar fechas por mes
                                const sortedDeps = [...tour.departures]
                                    .filter(d => new Date(d.departure_date + 'T12:00:00') >= new Date())
                                    .sort((a, b) => a.departure_date.localeCompare(b.departure_date))

                                const months = [...new Set(sortedDeps.map(d => {
                                    const date = new Date(d.departure_date + 'T12:00:00')
                                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                                }))]

                                const filteredDeps = departureMonthFilter === 'all'
                                    ? sortedDeps
                                    : sortedDeps.filter(d => d.departure_date.startsWith(departureMonthFilter))

                                return (
                                    <Card className="p-6 border-2 border-green-200">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-green-600" />
                                            Selecciona tu fecha de salida
                                        </h3>

                                        {/* Filtro por mes */}
                                        {months.length > 1 && (
                                            <div className="flex gap-2 mb-4 flex-wrap">
                                                <button
                                                    onClick={() => setDepartureMonthFilter('all')}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${departureMonthFilter === 'all'
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    Todas
                                                </button>
                                                {months.map(month => {
                                                    const [y, m] = month.split('-')
                                                    const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('es-MX', { month: 'short' })
                                                    return (
                                                        <button
                                                            key={month}
                                                            onClick={() => setDepartureMonthFilter(month)}
                                                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize ${departureMonthFilter === month
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            {monthName} {y}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* Lista de fechas */}
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                            {filteredDeps.map((dep, i) => {
                                                const date = new Date(dep.departure_date + 'T12:00:00')
                                                const dateStr = date.toLocaleDateString('es-MX', {
                                                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                                })
                                                const isSelected = selectedDeparture?.departure_date === dep.departure_date
                                                const isLimited = dep.availability === 'limited'
                                                const isSoldOut = dep.availability === 'sold_out'

                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => !isSoldOut && setSelectedDeparture(dep)}
                                                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${isSoldOut
                                                            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'border-green-500 bg-green-50 shadow-md'
                                                                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-900 capitalize text-sm">
                                                                    📅 {dateStr}
                                                                </p>
                                                                {dep.origin_city && (
                                                                    <p className="text-xs text-gray-500 mt-0.5">{dep.origin_city}</p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                {dep.total_usd || dep.price_usd ? (
                                                                    <p className="font-bold text-green-700 text-lg">
                                                                        ${formatPrice(dep.total_usd || dep.price_usd || 0)}
                                                                        <span className="text-xs font-normal text-gray-500 ml-1">USD</span>
                                                                    </p>
                                                                ) : null}
                                                                {isLimited && (
                                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                                                                        ⚠ Limitada
                                                                    </span>
                                                                )}
                                                                {isSoldOut && (
                                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                                                        Agotada
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="mt-2 pt-2 border-t border-green-200">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        const queryParams: Record<string, string> = {
                                                                            tourId: tour.id,
                                                                            tourName: tour.name,
                                                                            price: (dep.price_usd || tour.pricing.basePrice).toString(),
                                                                            region: tour.region,
                                                                            duration: `${tour.days} días / ${tour.nights} noches`,
                                                                            cities: tour.cities.join(', '),
                                                                            personas: numPersonas.toString(),
                                                                            fechaSalida: dep.departure_date
                                                                        }
                                                                        if (dep.total_usd) queryParams.totalPorPersona = dep.total_usd.toString()
                                                                        if (dep.taxes_usd) queryParams.impuestos = dep.taxes_usd.toString()
                                                                        if (dep.supplement_usd) queryParams.suplemento = dep.supplement_usd.toString()
                                                                        if (dep.origin_city) queryParams.ciudadSalida = dep.origin_city
                                                                        const params = new URLSearchParams(queryParams)
                                                                        window.location.href = `/cotizar-tour?${params.toString()}`
                                                                    }}
                                                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                                                                >
                                                                    Cotizar ahora →
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {filteredDeps.length === 0 && (
                                            <p className="text-sm text-gray-500 text-center py-4">No hay fechas disponibles para este mes</p>
                                        )}
                                    </Card>
                                )
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - igual a la página principal */}
            <footer className="bg-[#F7F7F7] mt-16 py-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="font-semibold mb-4">Empresa</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/empresa/acerca-de" className="hover:text-foreground">Acerca de</Link></li>
                                <li><Link href="/empresa/empleos" className="hover:text-foreground">Empleos</Link></li>
                                <li><Link href="/empresa/prensa" className="hover:text-foreground">Prensa</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Ayuda</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/ayuda" className="hover:text-foreground">Centro de ayuda</Link></li>
                                <li><Link href="/contacto" className="hover:text-foreground">Contáctanos</Link></li>
                                <li><Link href="/legal/privacidad" className="hover:text-foreground">Privacidad</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Términos</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/legal/terminos" className="hover:text-foreground">Términos de uso</Link></li>
                                <li><Link href="/legal/cookies" className="hover:text-foreground">Política de cookies</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Síguenos</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Facebook</a></li>
                                <li><a href="#" className="hover:text-foreground">Twitter</a></li>
                                <li><a href="#" className="hover:text-foreground">Instagram</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t pt-8 text-sm text-muted-foreground text-center">
                        <p>© 2024 AS Operadora de Viajes y Eventos. Todos los derechos reservados.</p>
                        <p className="text-xs mt-1">AS Viajando</p>
                        <p className="text-xs mt-2 opacity-50">v2.297 | Build: 04 Feb 2026</p>
                    </div>
                </div>
            </footer>

            {/* Modal de Itinerario Completo */}
            {showFullItinerary && tour.itinerary && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowFullItinerary(false)}>
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Header del modal */}
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-blue-600" />
                                Itinerario Completo
                            </h2>
                            <button
                                onClick={() => setShowFullItinerary(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        {/* Contenido scrolleable */}
                        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                            <div className="space-y-4">
                                {tour.itinerary.map((day: any, index: number) => (
                                    <div key={index} className="border-l-4 border-blue-600 pl-4 py-3 hover:bg-blue-50/50 transition-colors rounded-r">
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{day.title}</h3>
                                        <p className="text-gray-700 leading-relaxed">{day.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer del modal */}
                        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
                            <Button onClick={() => setShowFullItinerary(false)}>
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
