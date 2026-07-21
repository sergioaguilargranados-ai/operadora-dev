// Página pública: Solicitud de registro como agencia
// /agencia/registro - Formulario de onboarding
// Build: 21 Jul 2026 - v2.426

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AgencyOnboardingPage() {
    const [formData, setFormData] = useState({
        company_name: '',
        legal_name: '',
        tax_id: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        city: '',
        state: '',
        country: 'México',
        description: '',
        expected_monthly_bookings: '',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitResult(null)

        try {
            const res = await fetch('/api/agency-onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const data = await res.json()

            if (data.success) {
                setSubmitResult({
                    success: true,
                    message: data.data?.message || '¡Solicitud enviada exitosamente!'
                })
                setFormData({
                    company_name: '', legal_name: '', tax_id: '', contact_name: '',
                    contact_email: '', contact_phone: '', website: '', city: '',
                    state: '', country: 'México', description: '', expected_monthly_bookings: '',
                })
            } else {
                setSubmitResult({ success: false, message: data.error || 'Error al enviar solicitud' })
            }
        } catch (err) {
            setSubmitResult({ success: false, message: 'Error de conexión. Intenta de nuevo.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[var(--brand-primary,#0066FF)] rounded-full flex items-center justify-center text-white font-bold text-sm">
                            AS
                        </div>
                        <span className="font-semibold text-lg">AS Operadora</span>
                    </Link>
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        ← Volver al inicio
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="py-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="container mx-auto px-4 max-w-3xl"
                >
                    <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                        Programa de Agencias
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Haz crecer tu agencia con nosotros
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Únete a nuestro programa White-Label y ofrece servicios de viaje bajo tu propia marca.
                        Accede a tarifas preferenciales, tecnología de punta y soporte dedicado.
                    </p>
                </motion.div>
            </section>

            {/* Beneficios */}
            <section className="pb-12">
                <div className="container mx-auto px-4 max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: '🎨', title: 'Tu marca, tu identidad', desc: 'Logo, colores y dominio personalizados para tu agencia' },
                        { icon: '💰', title: 'Comisiones atractivas', desc: 'Define tu propio margen de ganancia en cada reserva' },
                        { icon: '🚀', title: 'Tecnología lista', desc: 'Plataforma completa de reservas con panel de control' },
                    ].map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * i }}
                            className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
                        >
                            <div className="text-3xl mb-3">{benefit.icon}</div>
                            <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                            <p className="text-sm text-gray-600">{benefit.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Formulario */}
            <section className="pb-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-lg border p-8"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-center">Solicita tu registro</h2>

                        {submitResult && (
                            <div className={`mb-6 p-4 rounded-lg ${submitResult.success
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                <p className="font-medium">{submitResult.success ? '✅' : '❌'} {submitResult.message}</p>
                            </div>
                        )}

                        {!submitResult?.success && (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Datos de la empresa */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                        Datos de la empresa
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Nombre de la empresa *</label>
                                            <input
                                                type="text"
                                                name="company_name"
                                                required
                                                value={formData.company_name}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="Ej: Viajes Fantásticos"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Razón social</label>
                                            <input
                                                type="text"
                                                name="legal_name"
                                                value={formData.legal_name}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="Ej: Viajes Fantásticos S.A. de C.V."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">RFC</label>
                                            <input
                                                type="text"
                                                name="tax_id"
                                                value={formData.tax_id}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="Ej: VFA200101XX0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Datos de contacto */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                        Datos de contacto
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Nombre de contacto *</label>
                                            <input
                                                type="text"
                                                name="contact_name"
                                                required
                                                value={formData.contact_name}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="Nombre completo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email *</label>
                                            <input
                                                type="email"
                                                name="contact_email"
                                                required
                                                value={formData.contact_email}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="email@miagencia.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Teléfono *</label>
                                            <input
                                                type="tel"
                                                name="contact_phone"
                                                required
                                                value={formData.contact_phone}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="+52 55 1234 5678"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Sitio web</label>
                                            <input
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="https://miagencia.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Ubicación */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                        Ubicación
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Ciudad</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="Ciudad"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Estado</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="Estado"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">País</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Detalles adicionales */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                        Sobre tu negocio
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Cuéntanos sobre tu agencia</label>
                                            <textarea
                                                name="description"
                                                rows={3}
                                                value={formData.description}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                                placeholder="¿Qué tipo de viajes manejas? ¿Cuántos años tienes en el mercado?"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Reservas mensuales estimadas</label>
                                            <select
                                                name="expected_monthly_bookings"
                                                value={formData.expected_monthly_bookings}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            >
                                                <option value="">Selecciona un rango</option>
                                                <option value="1-10">1 a 10 reservas</option>
                                                <option value="11-50">11 a 50 reservas</option>
                                                <option value="51-100">51 a 100 reservas</option>
                                                <option value="100+">Más de 100 reservas</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-[var(--brand-primary,#0066FF)] hover:bg-[var(--brand-primary-hover,#0052CC)] text-white font-semibold rounded-full transition-colors disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Enviando...
                                        </span>
                                    ) : (
                                        'Enviar solicitud'
                                    )}
                                </button>

                                <p className="text-xs text-center text-gray-500 mt-3">
                                    Al enviar, aceptas nuestros{' '}
                                    <Link href="/terminos" className="text-blue-600 hover:underline">Términos y Condiciones</Link>{' '}
                                    y <Link href="/privacidad" className="text-blue-600 hover:underline">Política de Privacidad</Link>.
                                </p>
                            </form>
                        )}

                        {submitResult?.success && (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">🎉</div>
                                <h3 className="text-xl font-semibold mb-2">¡Solicitud recibida!</h3>
                                <p className="text-gray-600 mb-6">
                                    Revisaremos tu solicitud y te contactaremos en las próximas 24-48 horas.
                                </p>
                                <Link
                                    href="/"
                                    className="inline-block px-6 py-2 bg-[var(--brand-primary,#0066FF)] text-white rounded-full hover:opacity-90 transition-opacity"
                                >
                                    Volver al inicio
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
