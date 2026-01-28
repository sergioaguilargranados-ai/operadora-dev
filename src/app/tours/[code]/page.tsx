// Página de detalle de Tour
// Build: 28 Ene 2026 - v2.237 - Carrusel automático, footer completo

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
    HelpCircle
} from 'lucide-react'
import { Logo } from '@/components/Logo'

const WHATSAPP_NUMBER = '+525512345678' // Número de pruebas

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
    images: {
        main: string
        gallery: string[]
    }
    tags: string[]
    isFeatured: boolean
    isOffer: boolean
    tipsAmount?: string
    importantNotes?: string
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
            {/* Header traslúcido */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:inline text-sm font-medium">Volver</span>
                            </button>
                            <Link href="/" className="flex items-center">
                                <Logo className="h-10" />
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/ayuda')}
                                className="text-gray-600"
                            >
                                <HelpCircle className="w-5 h-5" />
                                <span className="hidden md:inline ml-2">Ayuda</span>
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleWhatsApp}
                                className="bg-green-500 text-white hover:bg-green-600"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">WhatsApp</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero con carrusel de imágenes */}
            <section className="relative h-[45vh] md:h-[55vh] overflow-hidden">
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
                            src={allImages[currentImageIndex] || '/placeholder.jpg'}
                            alt={tour.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Controles del carrusel */}
                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Indicadores */}
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                            {allImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImageIndex(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Badge OFERTA */}
                <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full flex items-center gap-2 shadow-lg">
                        <Tag className="w-4 h-4" /> OFERTA ESPECIAL
                    </span>
                </div>

                {/* Info superpuesta */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div className="container mx-auto">
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full mb-3">
                            {tour.region}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                            {tour.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-white/90">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{tour.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>{tour.cities.length} ciudades</span>
                            </div>
                            {tour.flight.included && (
                                <div className="flex items-center gap-2">
                                    <Plane className="w-5 h-5" />
                                    <span>Vuelo incluido desde {tour.flight.origin}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contenido principal */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Columna izquierda - Detalles */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Descripción */}
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                    Sobre este tour
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {tour.description}
                                </p>
                            </Card>

                            {/* Ciudades a visitar */}
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
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
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
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
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-500" />
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

                            {/* Tours opcionales */}
                            {tour.optionalTours && tour.optionalTours.length > 0 && (
                                <Card className="p-6">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        Tours opcionales
                                    </h2>
                                    <div className="space-y-4">
                                        {(showFullOptionalTours ? tour.optionalTours : tour.optionalTours.slice(0, 3)).map((opt, i) => (
                                            <div key={i} className="p-4 bg-gray-50 rounded-xl">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">{opt.name}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{opt.description}</p>
                                                    </div>
                                                    {opt.price && (
                                                        <span className="text-blue-600 font-bold whitespace-nowrap ml-4">
                                                            ${opt.price.amount} {opt.price.currency}
                                                        </span>
                                                    )}
                                                </div>
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
                        </div>

                        {/* Columna derecha - Precio y reserva */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                {/* Card de precio */}
                                <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                                    <div className="text-center mb-4">
                                        <span className="text-sm opacity-80">Precio total desde</span>
                                        <div className="flex items-center justify-center gap-2 my-2">
                                            <span className="text-4xl font-bold">
                                                ${formatPrice(tour.pricing.totalPrice)}
                                            </span>
                                            <span className="text-lg opacity-80">USD</span>
                                        </div>
                                        <span className="text-sm opacity-80">{tour.pricing.priceType}</span>
                                    </div>

                                    <div className="bg-white/10 rounded-lg p-4 mb-4 text-sm">
                                        <div className="flex justify-between mb-2">
                                            <span>Precio base:</span>
                                            <span>${formatPrice(tour.pricing.basePrice)} USD</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span>Impuestos:</span>
                                            <span>+ ${formatPrice(tour.pricing.taxes)} USD</span>
                                        </div>
                                        <div className="border-t border-white/20 pt-2 mt-2 flex justify-between font-bold">
                                            <span>Total:</span>
                                            <span>${formatPrice(tour.pricing.totalPrice)} USD</span>
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full bg-white text-blue-600 hover:bg-white/90 font-bold"
                                        onClick={handleWhatsApp}
                                    >
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Reservar por WhatsApp
                                    </Button>
                                </Card>

                                {/* Info del hotel */}
                                <Card className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Hotel className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <h4 className="font-semibold">Hospedaje</h4>
                                            <p className="text-sm text-gray-600">{tour.hotel.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Utensils className="w-8 h-8 text-green-600" />
                                        <div>
                                            <h4 className="font-semibold">Alimentos</h4>
                                            <p className="text-sm text-gray-600">{tour.hotel.mealPlan}</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Contacto alternativo */}
                                <Card className="p-4">
                                    <h4 className="font-semibold mb-3">¿Necesitas ayuda?</h4>
                                    <div className="space-y-2 text-sm">
                                        <a
                                            href={`tel:${WHATSAPP_NUMBER}`}
                                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                                        >
                                            <Phone className="w-4 h-4" />
                                            {WHATSAPP_NUMBER}
                                        </a>
                                        <a
                                            href="mailto:viajes@asoperadora.com"
                                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                                        >
                                            <Mail className="w-4 h-4" />
                                            viajes@asoperadora.com
                                        </a>
                                        <button
                                            onClick={handleWhatsApp}
                                            className="flex items-center gap-2 text-green-600 hover:text-green-700"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            WhatsApp
                                        </button>
                                    </div>
                                </Card>

                                {/* Link a cotización grupal */}
                                <Link href="/viajes-grupales">
                                    <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-10 h-10 text-purple-600" />
                                            <div>
                                                <h4 className="font-semibold text-purple-800">¿Viajan +10 personas?</h4>
                                                <p className="text-sm text-purple-600">Solicita cotización grupal →</p>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer completo */}
            <footer className="bg-gray-900 text-white py-10">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        {/* Logo */}
                        <div>
                            <Logo className="h-10 brightness-0 invert mb-4" />
                            <p className="text-gray-400 text-sm">
                                Tu agencia de viajes de confianza. Más de 10 años creando experiencias inolvidables.
                            </p>
                        </div>

                        {/* Contacto */}
                        <div>
                            <h4 className="font-bold mb-4">Contacto</h4>
                            <div className="space-y-2 text-sm text-gray-400">
                                <a href={`tel:${WHATSAPP_NUMBER}`} className="flex items-center gap-2 hover:text-white">
                                    <Phone className="w-4 h-4" />
                                    {WHATSAPP_NUMBER}
                                </a>
                                <a href="mailto:viajes@asoperadora.com" className="flex items-center gap-2 hover:text-white">
                                    <Mail className="w-4 h-4" />
                                    viajes@asoperadora.com
                                </a>
                                <button onClick={handleWhatsApp} className="flex items-center gap-2 hover:text-green-400">
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp
                                </button>
                            </div>
                        </div>

                        {/* Ayuda */}
                        <div>
                            <h4 className="font-bold mb-4">Ayuda</h4>
                            <div className="space-y-2 text-sm text-gray-400">
                                <Link href="/preguntas-frecuentes" className="block hover:text-white">Preguntas frecuentes</Link>
                                <Link href="/terminos" className="block hover:text-white">Términos y condiciones</Link>
                                <Link href="/privacidad" className="block hover:text-white">Política de privacidad</Link>
                                <Link href="/contacto" className="block hover:text-white">Contáctanos</Link>
                            </div>
                        </div>

                        {/* Tours */}
                        <div>
                            <h4 className="font-bold mb-4">Tours</h4>
                            <div className="space-y-2 text-sm text-gray-400">
                                <Link href="/tours?cat=ofertas" className="block hover:text-white">🔥 Ofertas Especiales</Link>
                                <Link href="/tours?cat=bloqueos" className="block hover:text-white">🎯 Bloqueos</Link>
                                <Link href="/tours?cat=semana-santa" className="block hover:text-white">🌴 Semana Santa</Link>
                                <Link href="/tours?cat=favoritos" className="block hover:text-white">⭐ Favoritos</Link>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-400">
                            © 2026 AS Operadora de Viajes y Eventos. Todos los derechos reservados.
                        </p>
                        <p className="text-sm text-gray-500">
                            v2.237 | Build: 28 Ene 2026
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
