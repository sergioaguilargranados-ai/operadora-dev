"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Logo } from '@/components/Logo'
import { Utensils, Calendar, Users, CheckCircle2, MapPin, Clock, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function RestaurantBookingPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const [bookingData, setBookingData] = useState<any>(null)

    // Formulario
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialRequests: ''
    })

    useEffect(() => {
        // Cargar datos de la selección
        const stored = localStorage.getItem('selected_restaurant')
        if (stored) {
            setBookingData(JSON.parse(stored))
        } else {
            router.push('/')
        }
    }, [router])

    // Estado de errores
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        // Validar Nombre
        if (!formData.firstName.trim()) newErrors.firstName = "El nombre es obligatorio"
        else if (formData.firstName.length < 2) newErrors.firstName = "El nombre es muy corto"

        // Validar Apellido
        if (!formData.lastName.trim()) newErrors.lastName = "El apellido es obligatorio"

        // Validar Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email.trim()) newErrors.email = "El correo es obligatorio"
        else if (!emailRegex.test(formData.email)) newErrors.email = "Ingresa un correo válido"

        // Validar Teléfono (Min 10 dígitos)
        const phoneRegex = /^\d{10,}$/
        const cleanPhone = formData.phone.replace(/\D/g, '')
        if (!formData.phone.trim()) newErrors.phone = "El teléfono es obligatorio"
        else if (!phoneRegex.test(cleanPhone)) newErrors.phone = "Ingresa un número válido de 10 dígitos"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast({
                title: "Error en el formulario",
                description: "Por favor revisa los campos marcados en rojo.",
                variant: "destructive"
            })
            return
        }

        setLoading(true)

        // Simular envío a API / Guardado en DB
        await new Promise(resolve => setTimeout(resolve, 2000))

        setLoading(false)
        setSuccess(true)

        // Aquí se llamaría a la API real para guardar la reserva
        toast({
            title: "¡Solicitud Recibida!",
            description: "El equipo de AS Operadora confirmará tu mesa en breve.",
        })
    }

    if (!bookingData) return null

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">¡Solicitud Enviada!</h1>
                        <p className="text-gray-500 mt-2">
                            Hemos recibido tu solicitud de reserva para <strong>{bookingData.restaurant.name}</strong>.
                        </p>
                        <p className="text-sm text-gray-500 mt-4">
                            Un agente de AS Operadora se pondrá en contacto contigo (vía correo o teléfono) para confirmar la disponibilidad y los detalles finales.
                        </p>
                    </div>
                    <div className="pt-4">
                        <Button onClick={() => router.push('/')} className="w-full">
                            Volver al inicio
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b shadow-sm py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 gap-2"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Regresar
                        </Button>
                        <Logo />
                    </div>
                    <div className="text-sm font-medium text-gray-500 hidden md:block">Reserva de Restaurante</div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Columna Izquierda: Formulario */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Completa tu reserva</h1>
                            <p className="text-gray-600">Ingresa tus datos para que podamos gestionar tu mesa.</p>
                        </div>

                        <Card className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className={errors.firstName ? "text-red-500" : ""}>Nombre</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className={errors.firstName ? "border-red-500 ring-red-500" : ""}
                                        />
                                        {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className={errors.lastName ? "text-red-500" : ""}>Apellido</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className={errors.lastName ? "border-red-500 ring-red-500" : ""}
                                        />
                                        {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>Correo electrónico</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={errors.email ? "border-red-500 ring-red-500" : ""}
                                        />
                                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className={errors.phone ? "text-red-500" : ""}>Teléfono de contacto</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="10 dígitos"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className={errors.phone ? "border-red-500 ring-red-500" : ""}
                                        />
                                        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specialRequests">Solicitudes especiales (opcional)</Label>
                                    <Textarea
                                        id="specialRequests"
                                        placeholder="Alergias, ocasión especial (cumpleaños, aniversario), preferencia de mesa..."
                                        value={formData.specialRequests}
                                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={loading}>
                                        {loading ? "Procesando..." : "Confirmar Reserva"}
                                    </Button>
                                    <p className="text-xs text-center text-gray-500 mt-3">
                                        No se realizará ningún cargo ahora. El pago se realiza directamente en el restaurante.
                                    </p>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Columna Derecha: Resumen */}
                    <div>
                        <Card className="p-6 sticky top-24">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Utensils className="w-5 h-5 text-gray-500" />
                                Resumen de reserva
                            </h3>

                            {/* Info Restaurante */}
                            <div className="mb-6">
                                <div className="h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                                    {bookingData.restaurant.photos?.[0] ? (
                                        <img
                                            src={
                                                bookingData.restaurant.photos[0].photo_reference.startsWith('mock_')
                                                    ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'
                                                    : bookingData.restaurant.photos[0].photo_reference.includes('places/')
                                                        // Google Places API (New) Image URL
                                                        ? `https://places.googleapis.com/v1/${bookingData.restaurant.photos[0].photo_reference}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&maxWidthPx=400`
                                                        // Legacy API Image URL
                                                        : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${bookingData.restaurant.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
                                            }
                                            alt={bookingData.restaurant.name}
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
                                <h4 className="font-bold text-xl">{bookingData.restaurant.name}</h4>
                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{bookingData.restaurant.vicinity}</span>
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">Fecha</span>
                                    </div>
                                    <span className="font-medium text-sm">{bookingData.searchParams.date || "Por definir"}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">Hora</span>
                                    </div>
                                    {/* Como no pedimos hora en la busqueda inicial, asumimos que se coordinará o podríamos agregar un selector aqui */}
                                    <span className="font-medium text-sm text-blue-600">A coordinar</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm">Personas</span>
                                    </div>
                                    <span className="font-medium text-sm">{bookingData.searchParams.diners} comensales</span>
                                </div>
                            </div>

                            <div className="mt-6 bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
                                <strong>Nota importante:</strong> Tu reserva no está confirmada hasta que recibas la confirmación final por parte de nuestro equipo.
                            </div>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    )
}
