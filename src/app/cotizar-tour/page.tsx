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
    Clock
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const WHATSAPP_NUMBER = '+525621486939'

function CotizarTourContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
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

        if (tourId && tourName) {
            setTourData({
                id: tourId,
                name: decodeURIComponent(tourName),
                price: tourPrice ? parseFloat(tourPrice) : 0,
                region: tourRegion ? decodeURIComponent(tourRegion) : '',
                duration: tourDuration ? decodeURIComponent(tourDuration) : '',
                cities: tourCities ? decodeURIComponent(tourCities).split(',') : []
            })
        } else {
            // Si no hay datos del tour, redirigir a tours
            router.push('/tours')
        }
    }, [searchParams, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
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
            // Enviar cotización
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
                    contactName: `${formData.nombre} ${formData.apellido}`,
                    contactEmail: formData.correo,
                    contactPhone: formData.telefono,
                    numPersonas: parseInt(formData.numPersonas) || 1,
                    specialRequests: formData.comentarios,
                    notificationMethod: formData.notificationMethod
                })
            })

            const data = await response.json()

            if (data.success) {
                setSubmitted(true)
                toast({
                    title: 'Cotización enviada',
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
            `Precio: $${tourData?.price?.toLocaleString('es-MX')} USD. ` +
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
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <p className="text-sm text-blue-700">
                                <strong>Tour:</strong> {tourData.name}<br />
                                <strong>Región:</strong> {tourData.region}<br />
                                <strong>Duración:</strong> {tourData.duration}<br />
                                <strong>Personas:</strong> {formData.numPersonas}<br />
                                <strong>Precio base:</strong> ${tourData.price?.toLocaleString('es-MX')} USD por persona
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center">
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
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
                                <Logo className="py-2" />
                            </Link>
                        </div>
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
                                    {tourData.cities && tourData.cities.length > 0 && (
                                        <div>
                                            <div className="text-gray-600 mb-1">Ciudades</div>
                                            <div className="text-gray-900">{tourData.cities.join(', ')}</div>
                                        </div>
                                    )}

                                    {/* Precio base */}
                                    <div className="border-t pt-3 mt-3">
                                        <div className="text-gray-600 mb-1">Precio base</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            ${tourData.price?.toLocaleString('es-MX')} USD
                                        </div>
                                        <div className="text-xs text-gray-500">por persona</div>

                                        {/* Cálculo del total según número de personas */}
                                        {parseInt(formData.numPersonas) > 0 && (
                                            <div className="mt-4 pt-4 border-t border-blue-200 bg-blue-50/50 -mx-4 px-4 py-3 rounded-b-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm text-gray-600">Personas:</span>
                                                    <span className="font-semibold">{formData.numPersonas}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-semibold text-gray-900">Total estimado:</span>
                                                    <span className="text-xl font-bold text-blue-700">
                                                        ${((tourData.price || 0) * parseInt(formData.numPersonas)).toLocaleString('es-MX')} USD
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
                                    <button
                                        onClick={handleWhatsApp}
                                        className="flex items-center gap-2 text-green-600 hover:text-green-700"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        WhatsApp
                                    </button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#F7F7F7] py-10 mt-12">
                <div className="container mx-auto px-4">
                    <div className="text-center text-sm text-gray-600">
                        <p>© 2026 AS Operadora de Viajes y Eventos. Todos los derechos reservados.</p>
                        <p className="text-xs mt-2 opacity-50">v2.251 | Build: 31 Ene 2026</p>
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
