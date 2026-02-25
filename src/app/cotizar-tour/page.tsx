'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
    ArrowLeft,
    MapPin,
    Mail,
    Send,
    CheckCircle,
    Calendar,
    Users,
    DollarSign,
    Phone,
    MessageCircle,
    Plane,
    Hotel,
    Clock,
    HelpCircle,
    Bell
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { UserMenu } from '@/components/UserMenu'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const WHATSAPP_NUMBER = '+527208156804'

function CotizarTourContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [submittedFolio, setSubmittedFolio] = useState('')
    const [tourData, setTourData] = useState<any>(null)

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        numPersonas: '1',
        comentarios: '',
        notificationMethod: 'both' // 'whatsapp', 'email', 'both'
    })

    useEffect(() => {
        // Obtener datos del tour desde URL params
        const tourId = searchParams?.get('tourId')
        const tourName = searchParams?.get('tourName')
        const tourPrice = searchParams?.get('price')
        const tourRegion = searchParams?.get('region')
        const tourDuration = searchParams?.get('duration')
        const tourCities = searchParams?.get('cities')
        const tourPersonas = searchParams?.get('personas')

        // Nuevos parámetros de fecha e impuestos
        const fechaSalida = searchParams?.get('fechaSalida')
        const totalPorPersona = searchParams?.get('totalPorPersona')
        const impuestos = searchParams?.get('impuestos')
        const suplemento = searchParams?.get('suplemento')
        const ciudadSalida = searchParams?.get('ciudadSalida')

        if (tourId && tourName) {
            const basePrice = tourPrice ? parseFloat(tourPrice) : 0
            const taxesVal = impuestos ? parseFloat(impuestos) : 0
            const supplementVal = suplemento ? parseFloat(suplemento) : 0
            const totalPP = totalPorPersona ? parseFloat(totalPorPersona) : (basePrice + taxesVal + supplementVal)

            setTourData({
                id: tourId,
                name: decodeURIComponent(tourName),
                price: basePrice,
                region: tourRegion ? decodeURIComponent(tourRegion) : '',
                duration: tourDuration ? decodeURIComponent(tourDuration) : '',
                cities: tourCities ? decodeURIComponent(tourCities).split(',').map((c: string) => c.trim()) : [],
                // Nuevos datos
                departureDate: fechaSalida ? fechaSalida.substring(0, 10) : null,
                taxes: taxesVal,
                supplement: supplementVal,
                totalPerPerson: totalPP,
                originCity: ciudadSalida ? decodeURIComponent(ciudadSalida) : null
            })
            // Actualizar número de personas si viene desde la página anterior
            if (tourPersonas) {
                setFormData(prev => ({ ...prev, numPersonas: tourPersonas }))
            }
        } else {
            // Si no hay datos del tour, redirigir a tours
            router.push('/tours')
        }
    }, [searchParams, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const formatPrice = (price: number) => {
        if (!price || isNaN(price)) return '0'
        return new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Validaciones
        if (!formData.nombre || !formData.correo) {
            toast({
                title: 'Campos requeridos',
                description: 'Por favor completa tu nombre y correo electrónico',
                variant: 'destructive'
            })
            setLoading(false)
            return
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.correo)) {
            toast({
                title: 'Email inválido',
                description: 'Por favor ingresa un correo electrónico válido',
                variant: 'destructive'
            })
            setLoading(false)
            return
        }

        try {
            // Enviar cotización con todos los datos incluyendo impuestos
            const response = await fetch('/api/tours/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId: tourData.id,
                    tourName: tourData.name,
                    tourPrice: tourData.price,
                    tourRegion: tourData.region,
                    tourDuration: tourData.duration,
                    tourCities: tourData.cities,
                    contactName: `${formData.nombre} ${formData.apellido}`.trim(),
                    contactEmail: formData.correo,
                    contactPhone: formData.telefono,
                    numPersonas: parseInt(formData.numPersonas) || 1,
                    specialRequests: formData.comentarios,
                    notificationMethod: formData.notificationMethod,
                    // Nuevos campos
                    departureDate: tourData.departureDate,
                    taxes: tourData.taxes,
                    supplement: tourData.supplement,
                    totalPerPerson: tourData.totalPerPerson,
                    originCity: tourData.originCity
                })
            })

            const data = await response.json()

            if (data.success) {
                setSubmittedFolio(data.data?.folio || '')
                setSubmitted(true)
                toast({
                    title: '✅ Cotización enviada',
                    description: data.message || 'Te contactaremos pronto con tu cotización personalizada'
                })
            } else {
                throw new Error(data.error || 'Error al procesar')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo enviar la cotización. Intenta de nuevo.',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleWhatsApp = () => {
        const message = encodeURIComponent(
            `Hola, me interesa el tour "${tourData?.name}". ` +
            `Precio: $${formatPrice(tourData?.totalPerPerson || tourData?.price)} USD por persona. ` +
            `¿Me pueden dar más información?`
        )
        window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}?text=${message}`, '_blank')
    }

    if (!tourData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                {/* Header */}
                <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center">
                                <Logo className="py-2" />
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-16 max-w-2xl">
                    <Card className="p-8 text-center">
                        <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
                        <h1 className="text-3xl font-bold mb-4">¡Cotización Enviada!</h1>
                        <p className="text-gray-600 mb-6">
                            Hemos recibido tu solicitud de cotización para <strong>{tourData.name}</strong>.
                            Te contactaremos pronto por {formData.notificationMethod === 'whatsapp' ? 'WhatsApp' : formData.notificationMethod === 'email' ? 'correo electrónico' : 'WhatsApp y correo electrónico'}.
                        </p>

                        {submittedFolio && (
                            <div className="bg-blue-100 border-2 border-blue-300 p-4 rounded-xl mb-6">
                                <p className="text-sm text-blue-600 mb-1">Tu número de folio:</p>
                                <p className="text-2xl font-bold text-blue-800 font-mono">{submittedFolio}</p>
                            </div>
                        )}

                        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                            <p className="text-sm text-blue-700">
                                <strong>Tour:</strong> {tourData.name}<br />
                                <strong>Región:</strong> {tourData.region}<br />
                                <strong>Duración:</strong> {tourData.duration}<br />
                                {tourData.departureDate && (
                                    <><strong>Fecha de salida:</strong> {new Date(tourData.departureDate + 'T12:00:00Z').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}<br /></>
                                )}
                                {tourData.originCity && (
                                    <><strong>Ciudad de salida:</strong> {tourData.originCity}<br /></>
                                )}
                                <strong>Personas:</strong> {formData.numPersonas}<br />
                                <strong>Precio por persona:</strong> ${formatPrice(tourData.totalPerPerson)} USD<br />
                                {tourData.taxes > 0 && (
                                    <><span className="text-xs text-blue-500">(Incluye impuestos: ${formatPrice(tourData.taxes)} USD)</span><br /></>
                                )}
                                <strong>Total estimado:</strong> ${formatPrice(tourData.totalPerPerson * parseInt(formData.numPersonas))} USD
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center flex-wrap">
                            {submittedFolio && (
                                <Button
                                    onClick={() => router.push(`/cotizacion/${submittedFolio}`)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Ver mi cotización
                                </Button>
                            )}
                            <Button onClick={() => router.push('/tours')} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Ver más tours
                            </Button>
                            <Button onClick={() => router.push('/')} variant="outline">
                                Volver al inicio
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    // Calcular el total con impuestos - SIEMPRE sumar directamente
    const totalPerPerson = (tourData.price || 0) + (tourData.taxes || 0) + (tourData.supplement || 0)
    const numPersonas = parseInt(formData.numPersonas) || 1
    const totalEstimado = totalPerPerson * numPersonas

    // Debug en consola para verificar valores
    console.log('🔢 DEBUG cotizar-tour:', {
        price: tourData.price,
        taxes: tourData.taxes,
        supplement: tourData.supplement,
        totalPerPerson,
        totalEstimado,
        tourDataTotalPerPerson: tourData.totalPerPerson
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 md:gap-8">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm font-medium">Volver</span>
                        </button>
                        <Link href="/">
                            <Logo className="py-2" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 md:gap-6 text-sm">
                        <button
                            onClick={() => router.push('/mis-reservas')}
                            className="hover:text-primary font-medium"
                        >
                            Tus Reservas
                        </button>
                        <UserMenu />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Columna izquierda - Formulario */}
                    <div className="lg:col-span-2">
                        <Card className="p-6 md:p-8">
                            <h1 className="text-2xl font-bold mb-2">Cotizar Tour</h1>
                            <p className="text-gray-600 mb-6">
                                Completa tus datos y te enviaremos una cotización personalizada
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Datos personales */}
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        Datos de contacto
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Nombre *</label>
                                            <Input
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                placeholder="Tu nombre"
                                                className="h-12"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Apellido</label>
                                            <Input
                                                name="apellido"
                                                value={formData.apellido}
                                                onChange={handleChange}
                                                placeholder="Tu apellido"
                                                className="h-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Correo electrónico *</label>
                                            <Input
                                                type="email"
                                                name="correo"
                                                value={formData.correo}
                                                onChange={handleChange}
                                                placeholder="tu@email.com"
                                                className="h-12"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Teléfono (WhatsApp)</label>
                                            <Input
                                                type="tel"
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handleChange}
                                                placeholder="10 dígitos"
                                                className="h-12"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                {/* Detalles del viaje */}
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        Detalles del viaje
                                    </h3>

                                    {/* Fecha de salida seleccionada */}
                                    {tourData.departureDate && (
                                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <p className="text-sm text-green-600 font-medium">Fecha de salida seleccionada</p>
                                                    <p className="text-lg font-bold text-green-800">
                                                        {new Date(tourData.departureDate + 'T12:00:00Z').toLocaleDateString('es-MX', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                    {tourData.originCity && (
                                                        <p className="text-sm text-green-600 mt-1">
                                                            <Plane className="w-4 h-4 inline mr-1" />
                                                            Salida desde: {tourData.originCity}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Número de personas</label>
                                        <Input
                                            type="number"
                                            name="numPersonas"
                                            value={formData.numPersonas}
                                            onChange={handleChange}
                                            placeholder="1"
                                            min="1"
                                            className="h-12"
                                            required
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium mb-2">Comentarios o solicitudes especiales</label>
                                        <textarea
                                            name="comentarios"
                                            value={formData.comentarios}
                                            onChange={handleChange}
                                            placeholder="Cuéntanos más sobre tu viaje, fechas preferidas, etc..."
                                            className="w-full p-3 border rounded-lg bg-white min-h-[100px]"
                                        />
                                    </div>
                                </div>

                                <hr />

                                {/* Método de notificación */}
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                        <MessageCircle className="w-5 h-5 text-blue-600" />
                                        ¿Cómo prefieres recibir tu cotización?
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="notificationMethod"
                                                value="both"
                                                checked={formData.notificationMethod === 'both'}
                                                onChange={handleChange}
                                                className="w-4 h-4"
                                            />
                                            <div>
                                                <div className="font-medium">WhatsApp y Correo</div>
                                                <div className="text-sm text-gray-500">Recibe tu cotización por ambos medios (recomendado)</div>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="notificationMethod"
                                                value="whatsapp"
                                                checked={formData.notificationMethod === 'whatsapp'}
                                                onChange={handleChange}
                                                className="w-4 h-4"
                                            />
                                            <div>
                                                <div className="font-medium">Solo WhatsApp</div>
                                                <div className="text-sm text-gray-500">Respuesta más rápida</div>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="notificationMethod"
                                                value="email"
                                                checked={formData.notificationMethod === 'email'}
                                                onChange={handleChange}
                                                className="w-4 h-4"
                                            />
                                            <div>
                                                <div className="font-medium">Solo Correo Electrónico</div>
                                                <div className="text-sm text-gray-500">Cotización detallada por email</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-lg"
                                >
                                    {loading ? (
                                        'Enviando...'
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Solicitar Cotización
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-gray-500 text-center">
                                    Al enviar este formulario aceptas que te contactemos para darte seguimiento a tu cotización.
                                </p>
                            </form>
                        </Card>
                    </div>

                    {/* Columna derecha - Resumen del tour */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                                <h3 className="font-bold text-lg mb-4">Resumen del Tour</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <div className="text-gray-600 mb-1">Tour seleccionado</div>
                                        <div className="font-semibold text-gray-900">{tourData.name}</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <span>{tourData.region}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span>{tourData.duration}</span>
                                    </div>

                                    {/* Fecha de salida en resumen */}
                                    {tourData.departureDate && (
                                        <div className="flex items-center gap-2 text-green-700">
                                            <Calendar className="w-4 h-4 text-green-600" />
                                            <span className="font-medium">
                                                {new Date(tourData.departureDate + 'T12:00:00Z').toLocaleDateString('es-MX', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}

                                    {/* Ciudad de salida */}
                                    {tourData.originCity && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Plane className="w-4 h-4 text-blue-600" />
                                            <span>Desde: {tourData.originCity}</span>
                                        </div>
                                    )}

                                    {tourData.cities && tourData.cities.length > 0 && (
                                        <div>
                                            <div className="text-gray-600 mb-1">Ciudades</div>
                                            <div className="text-gray-900">{tourData.cities.join(', ')}</div>
                                        </div>
                                    )}

                                    {/* Desglose de precios */}
                                    <div className="border-t pt-3 mt-3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Precio base:</span>
                                            <span className="font-semibold">${formatPrice(tourData.price)} USD</span>
                                        </div>
                                        {tourData.taxes > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Impuestos:</span>
                                                <span className="font-semibold">${formatPrice(tourData.taxes)} USD</span>
                                            </div>
                                        )}
                                        {tourData.supplement > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Suplemento:</span>
                                                <span className="font-semibold text-orange-600">${formatPrice(tourData.supplement)} USD</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm border-t pt-2">
                                            <span className="font-medium text-gray-800">Total por persona:</span>
                                            <span className="text-xl font-bold text-blue-600">
                                                ${formatPrice(totalPerPerson)} USD
                                            </span>
                                        </div>

                                        {/* Cálculo del total según número de personas */}
                                        {numPersonas > 0 && (
                                            <div className="mt-4 pt-4 border-t border-blue-200 bg-blue-50/50 -mx-4 px-4 py-3 rounded-b-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm text-gray-600">Personas:</span>
                                                    <span className="font-semibold">{formData.numPersonas}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-semibold text-gray-900">Total estimado:</span>
                                                    <span className="text-xl font-bold text-blue-700">
                                                        ${formatPrice(totalEstimado)} USD
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 italic">
                                                    * Cotización final puede variar según fechas y disponibilidad
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 bg-green-50 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-green-800">
                                        <strong>Respuesta rápida:</strong> Te contactaremos en menos de 24 horas con tu cotización personalizada
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
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
                        <p>© 2026 AS Operadora de Viajes y Eventos. Todos los derechos reservados.</p>
                        <p className="text-xs mt-1">AS Viajando</p>
                        <p className="text-xs mt-2 opacity-50">v2.330 | Build: 25 Feb 2026</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default function CotizarTourPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        }>
            <CotizarTourContent />
        </Suspense>
    )
}
