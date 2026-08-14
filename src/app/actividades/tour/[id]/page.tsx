"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Globe, ExternalLink, Clock, ArrowLeft, Star, CalendarDays, Check, Users, ShieldCheck, X } from "lucide-react"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/contexts/AuthContext"

export default function TourDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { user } = useAuth()
    const id = params.id as string

    const [tour, setTour] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Booking state
    const [selectedDate, setSelectedDate] = useState<string>("")
    const [passengers, setPassengers] = useState<Record<string, number>>({})
    const [bookingStage, setBookingStage] = useState<'selection' | 'checkout' | 'success'>('selection')
    
    // Checkout form state
    const [formData, setFormData] = useState({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        phone: ''
    })

    useEffect(() => {
        const fetchTourDetails = async () => {
            try {
                const res = await fetch(`/api/civitatis/activities/${id}`)
                const data = await res.json()
                if (data.success) {
                    setTour(data.data)
                    // Initialize passengers with 0
                    if (data.data.pricing_categories) {
                        const initialPass: Record<string, number> = {}
                        data.data.pricing_categories.forEach((cat: any) => {
                            initialPass[cat.id] = cat.id === 'adult' ? 1 : 0
                        })
                        setPassengers(initialPass)
                    }
                    if (data.data.available_dates && data.data.available_dates.length > 0) {
                        setSelectedDate(data.data.available_dates[0])
                    }
                }
            } catch (error) {
                console.error('Error fetching tour:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTourDetails()
    }, [id, user])

    const calculateTotal = () => {
        if (!tour) return 0
        let total = 0
        tour.pricing_categories.forEach((cat: any) => {
            total += (passengers[cat.id] || 0) * cat.price
        })
        return total
    }

    const handlePassengerChange = (catId: string, delta: number) => {
        setPassengers(prev => {
            const current = prev[catId] || 0
            const newVal = Math.max(0, current + delta)
            return { ...prev, [catId]: newVal }
        })
    }

    const getTotalPassengers = () => {
        return Object.values(passengers).reduce((a, b) => a + b, 0)
    }

    const handleCheckout = async () => {
        try {
            const total = calculateTotal()
            await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'activity',
                    service_name: tour.title,
                    total_price: total,
                    currency: tour.currency || 'MXN',
                    status: 'confirmed',
                    payment_status: 'paid',
                    details: {
                        destination: tour.destination,
                        pasajeros: getTotalPassengers(),
                        fecha: selectedDate,
                        contacto: {
                            nombre: `${formData.firstName} ${formData.lastName}`.trim(),
                            email: formData.email,
                            telefono: formData.phone
                        }
                    }
                })
            })
        } catch (e) {
            console.error('Error saving activity booking:', e)
        }
        setBookingStage('success')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!tour) return <div className="text-center py-20">Tour no encontrado</div>

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/actividades/${tour.destination.toLowerCase()}`)}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm font-medium">Volver a {tour.destination}</span>
                        </button>
                    </div>
                    <Link href="/">
                        <Logo className="py-2 scale-75 md:scale-100 origin-right" />
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {bookingStage === 'success' ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl mx-auto mt-12 bg-white p-10 rounded-3xl shadow-xl text-center border border-green-100"
                    >
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Reserva Confirmada!</h2>
                        <p className="text-gray-600 text-lg mb-8">
                            Hemos procesado el pago y tu reserva para <strong>{tour.title}</strong> está lista. Se ha enviado un voucher a {formData.email}.
                        </p>
                        
                        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Detalles de tu viaje</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 block">Destino</span> <span className="font-medium">{tour.destination}</span></div>
                                <div><span className="text-gray-500 block">Fecha</span> <span className="font-medium">{selectedDate}</span></div>
                                <div><span className="text-gray-500 block">Pasajeros</span> <span className="font-medium">{getTotalPassengers()} personas</span></div>
                                <div><span className="text-gray-500 block">Total Pagado</span> <span className="font-bold text-pink-600">{calculateTotal()} {tour.currency}</span></div>
                            </div>
                        </div>

                        <Button onClick={() => router.push('/actividades')} className="w-full h-14 text-lg">
                            Explorar más tours
                        </Button>
                    </motion.div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Contenido Principal */}
                        <div className="lg:w-2/3 space-y-8">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <MapPin className="w-4 h-4" /> {tour.destination}
                                    <span className="mx-2">•</span>
                                    <Star className="w-4 h-4 text-yellow-500" /> {tour.rating} ({tour.reviews} opiniones)
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                    {tour.title}
                                </h1>

                                {/* Galería */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl overflow-hidden">
                                    <img src={tour.gallery[0]} alt={tour.title} className="w-full h-[400px] object-cover" />
                                    <div className="hidden md:grid grid-rows-2 gap-4">
                                        <img src={tour.gallery[1] || tour.image} alt={tour.title} className="w-full h-[192px] object-cover" />
                                        <img src={tour.gallery[2] || tour.image} alt={tour.title} className="w-full h-[192px] object-cover" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-2xl font-bold mb-4">Sobre esta actividad</h2>
                                <p className="text-gray-600 leading-relaxed mb-6">{tour.description}</p>
                                
                                <div className="flex flex-wrap gap-6 mb-8 py-4 border-y border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-6 h-6 text-pink-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Duración</p>
                                            <p className="font-semibold">{tour.duration}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-6 h-6 text-pink-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Cancelación</p>
                                            <p className="font-semibold text-green-600">Gratuita</p>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-3">Itinerario</h3>
                                <p className="text-gray-600 leading-relaxed mb-8">{tour.itinerary}</p>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" /> Incluye
                                        </h3>
                                        <ul className="space-y-2">
                                            {tour.includes.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-gray-600">
                                                    <span className="text-green-500 mt-1">•</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <X className="w-5 h-5 text-red-500" /> No incluye
                                        </h3>
                                        <ul className="space-y-2">
                                            {tour.not_includes.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-gray-600">
                                                    <span className="text-red-500 mt-1">•</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Motor de Reserva */}
                        <div className="lg:w-1/3">
                            <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                {bookingStage === 'selection' && (
                                    <>
                                        <div className="p-6 bg-gray-900 text-white">
                                            <p className="text-gray-400 text-sm mb-1">Precio desde</p>
                                            <div className="flex items-end gap-2">
                                                <span className="text-3xl font-bold">{tour.price}</span>
                                                <span className="text-lg mb-1">{tour.currency}</span>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            <div>
                                                <h3 className="font-bold mb-3 flex items-center gap-2">
                                                    <CalendarDays className="w-5 h-5 text-pink-600" /> Selecciona la fecha
                                                </h3>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {tour.available_dates.map((date: string) => (
                                                        <button 
                                                            key={date}
                                                            onClick={() => setSelectedDate(date)}
                                                            className={`p-2 text-sm rounded-lg border text-center transition-all ${
                                                                selectedDate === date 
                                                                    ? 'bg-pink-50 border-pink-600 text-pink-700 font-bold' 
                                                                    : 'hover:border-pink-300 text-gray-600'
                                                            }`}
                                                        >
                                                            {new Date(date).getDate()} / {new Date(date).getMonth() + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100">
                                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-pink-600" /> Pasajeros
                                                </h3>
                                                {tour.pricing_categories.map((cat: any) => (
                                                    <div key={cat.id} className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <p className="font-medium text-gray-800">{cat.name}</p>
                                                            <p className="text-sm text-gray-500">{cat.price} {tour.currency}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button 
                                                                onClick={() => handlePassengerChange(cat.id, -1)}
                                                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                                                                disabled={passengers[cat.id] === 0}
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-4 text-center font-bold">{passengers[cat.id]}</span>
                                                            <button 
                                                                onClick={() => handlePassengerChange(cat.id, 1)}
                                                                className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-4 border-t border-gray-100">
                                                <div className="flex justify-between items-center mb-6">
                                                    <span className="font-bold text-gray-800">Total a pagar</span>
                                                    <span className="text-2xl font-bold text-pink-600">{calculateTotal()} {tour.currency}</span>
                                                </div>
                                                <Button 
                                                    className="w-full h-14 text-lg bg-pink-600 hover:bg-pink-700 text-white"
                                                    disabled={getTotalPassengers() === 0 || !selectedDate}
                                                    onClick={() => setBookingStage('checkout')}
                                                >
                                                    Reservar ahora
                                                </Button>
                                                <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
                                                    <ShieldCheck className="w-4 h-4" /> Pago 100% seguro y garantizado
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {bookingStage === 'checkout' && (
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-6 border-b pb-4">
                                            <button onClick={() => setBookingStage('selection')} className="text-gray-400 hover:text-gray-600">
                                                <ArrowLeft className="w-5 h-5" />
                                            </button>
                                            <h3 className="font-bold text-lg">Confirmar Reserva</h3>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-xl mb-6">
                                            <p className="text-sm text-blue-800 font-medium">{tour.title}</p>
                                            <p className="text-xs text-blue-600 mt-1">{selectedDate} • {getTotalPassengers()} personas</p>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">Datos del titular</h4>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
                                                <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Apellidos</label>
                                                <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Email (Recibirá los vouchers)</label>
                                                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Teléfono</label>
                                                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                            </div>
                                        </div>

                                        <Button 
                                            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white"
                                            onClick={handleCheckout}
                                            disabled={!formData.firstName || !formData.email}
                                        >
                                            Pagar {calculateTotal()} {tour.currency}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
