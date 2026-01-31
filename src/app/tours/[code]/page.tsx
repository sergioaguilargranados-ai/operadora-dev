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
    Map as MapIcon
} from 'lucide-react'
import { Logo } from '@/components/Logo'

const WHATSAPP_NUMBER = '+525621486939' // Número oficial AS Operadora

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
            <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <Logo className="h-10 w-auto" />
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/#destinos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Destinos
                            </Link>
                            <Link href="/tours" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Tours
                            </Link>
                            <Link href="/#servicios" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Servicios
                            </Link>
                            <Link href="/#contacto" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Contacto
                            </Link>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleWhatsApp}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                WhatsApp
                            </Button>
                        </div>
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
                            <div className="relative h-96 bg-gray-100">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImageIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0"
                                    >
                                        <Image
                                            src={allImages[currentImageIndex]}
                                            alt={tour.name}
                                            fill
                                            className="object-cover"
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

                        {/* NUEVO: Mapa del Tour */}
                        {tour.mapImage && (
                            <Card className="p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <MapIcon className="w-6 h-6 text-blue-600" />
                                    Mapa del Tour
                                </h2>
                                <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden">
                                    <Image
                                        src={tour.mapImage}
                                        alt="Mapa del tour"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </Card>
                        )}

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

                    {/* Columna derecha - Precio y reserva */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Card de precio */}
                            <Card className="p-6 border-2 border-blue-500">
                                <div className="text-center mb-6">
                                    {tour.isOffer && tour.pricing.originalPrice > tour.pricing.totalPrice && (
                                        <div className="mb-2">
                                            <span className="text-gray-500 line-through text-lg">
                                                ${formatPrice(tour.pricing.originalPrice)} USD
                                            </span>
                                            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                                AHORRA ${formatPrice(tour.pricing.savings)} USD
                                            </span>
                                        </div>
                                    )}
                                    <div className="text-4xl font-bold text-blue-600 mb-1">
                                        ${formatPrice(tour.pricing.totalPrice)}
                                        <span className="text-lg text-gray-600 ml-2">USD</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{tour.pricing.priceType}</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Precio base:</span>
                                        <span className="font-semibold">${formatPrice(tour.pricing.basePrice)} USD</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Impuestos:</span>
                                        <span className="font-semibold">${formatPrice(tour.pricing.taxes)} USD</span>
                                    </div>
                                    {tour.tipsAmount && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Propinas:</span>
                                            <span className="font-semibold">{tour.tipsAmount}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-3 flex justify-between font-bold">
                                        <span>Total:</span>
                                        <span className="text-blue-600">${formatPrice(tour.pricing.totalPrice)} USD</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleWhatsApp}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Reservar por WhatsApp
                                </Button>

                                <p className="text-xs text-gray-500 text-center mt-3">
                                    Respuesta inmediata • Asesoría personalizada
                                </p>
                            </Card>

                            {/* Información de contacto */}
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">¿Necesitas ayuda?</h3>
                                <div className="space-y-3">
                                    <a
                                        href={`tel:${WHATSAPP_NUMBER}`}
                                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                                    >
                                        <Phone className="w-5 h-5" />
                                        <span className="text-sm">{WHATSAPP_NUMBER}</span>
                                    </a>
                                    <a
                                        href="mailto:info@as-ope-viajes.company"
                                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                                    >
                                        <Mail className="w-5 h-5" />
                                        <span className="text-sm">info@as-ope-viajes.company</span>
                                    </a>
                                </div>
                            </Card>

                            {/* Tags */}
                            {tour.tags && tour.tags.length > 0 && (
                                <Card className="p-6">
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tour.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <Logo className="h-10 w-auto mb-4 brightness-0 invert" />
                            <p className="text-gray-400 text-sm">
                                Tu agencia de viajes de confianza
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Enlaces</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/" className="hover:text-white">Inicio</Link></li>
                                <li><Link href="/tours" className="hover:text-white">Tours</Link></li>
                                <li><Link href="/#servicios" className="hover:text-white">Servicios</Link></li>
                                <li><Link href="/#contacto" className="hover:text-white">Contacto</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Contacto</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>{WHATSAPP_NUMBER}</li>
                                <li>info@as-ope-viajes.company</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Síguenos</h4>
                            <div className="flex gap-4">
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                        <p>© 2026 AS Operadora. Todos los derechos reservados.</p>
                        <p className="text-xs mt-1 opacity-50">v2.256 | Build: 31 Ene 2026</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
