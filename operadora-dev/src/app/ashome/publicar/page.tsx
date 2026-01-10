"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Home, Upload, MapPin, DollarSign, Users, BedDouble,
  Bath, Wifi, Car, UtensilsCrossed, Waves, Camera,
  CheckCircle, ArrowLeft, Plus, X, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/Logo"
import { useToast } from "@/hooks/use-toast"

const propertyTypes = [
  { value: "casa", label: "Casa completa", icon: "🏠" },
  { value: "departamento", label: "Departamento", icon: "🏢" },
  { value: "villa", label: "Villa de lujo", icon: "🏰" },
  { value: "cabana", label: "Cabaña", icon: "🏕️" },
  { value: "habitacion", label: "Habitación privada", icon: "🛏️" },
]

const amenitiesList = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "parking", label: "Estacionamiento", icon: Car },
  { id: "kitchen", label: "Cocina equipada", icon: UtensilsCrossed },
  { id: "pool", label: "Alberca", icon: Waves },
  { id: "ac", label: "Aire acondicionado", icon: "❄️" },
  { id: "tv", label: "Smart TV", icon: "📺" },
  { id: "washer", label: "Lavadora", icon: "🧺" },
  { id: "pets", label: "Mascotas permitidas", icon: "🐕" },
  { id: "gym", label: "Gimnasio", icon: "💪" },
  { id: "bbq", label: "Área de BBQ", icon: "🍖" },
  { id: "jacuzzi", label: "Jacuzzi", icon: "🛁" },
  { id: "beach", label: "Acceso a playa", icon: "🏖️" },
]

export default function PublicarPropiedadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    // Paso 1: Tipo y ubicación
    propertyType: "",
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "México",
    zipCode: "",

    // Paso 2: Detalles
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,

    // Paso 3: Amenidades
    amenities: [] as string[],

    // Paso 4: Precios
    pricePerNight: "",
    cleaningFee: "",
    weeklyDiscount: "",
    monthlyDiscount: "",

    // Paso 5: Fotos
    photos: [] as string[],

    // Paso 6: Contacto
    hostName: "",
    hostEmail: "",
    hostPhone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ashome/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitted(true)
        toast({
          title: "Propiedad enviada",
          description: "Tu propiedad será revisada y publicada pronto"
        })
      } else {
        throw new Error('Error al enviar')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la propiedad. Intenta de nuevo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 6) setStep(step + 1)
    else handleSubmit()
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
          <h1 className="text-2xl font-bold mb-4">¡Propiedad Enviada!</h1>
          <p className="text-gray-600 mb-6">
            Tu propiedad ha sido enviada para revisión. Te notificaremos cuando esté publicada.
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/ashome/publicar')} variant="outline" className="w-full">
              Publicar otra propiedad
            </Button>
            <Button onClick={() => router.push('/')} className="w-full bg-blue-600 hover:bg-blue-700">
              Volver al inicio
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Logo />
          </div>
          <div className="text-sm text-gray-500">
            Paso {step} de 6
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-gray-100 h-2">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${(step / 6) * 100}%` }}
        />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Paso 1: Tipo y ubicación */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-bold mb-2">¿Qué tipo de propiedad quieres publicar?</h1>
            <p className="text-gray-600 mb-6">Selecciona el tipo que mejor describe tu espacio</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData(prev => ({ ...prev, propertyType: type.value }))}
                  className={`p-4 border rounded-xl text-left transition-all ${
                    formData.propertyType === type.value
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título de la propiedad *</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ej: Casa con vista al mar en Cancún"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe tu espacio, qué lo hace especial..."
                  className="w-full p-3 border rounded-lg min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ciudad *</label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ej: Cancún"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estado *</label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Ej: Quintana Roo"
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dirección completa *</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle, número, colonia"
                  className="h-12"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Paso 2: Detalles */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-bold mb-2">Detalles de tu espacio</h1>
            <p className="text-gray-600 mb-6">¿Cuántos huéspedes puede recibir?</p>

            <div className="space-y-6">
              {[
                { name: "guests", label: "Huéspedes máximos", icon: Users, value: formData.guests },
                { name: "bedrooms", label: "Recámaras", icon: BedDouble, value: formData.bedrooms },
                { name: "beds", label: "Camas", icon: BedDouble, value: formData.beds },
                { name: "bathrooms", label: "Baños", icon: Bath, value: formData.bathrooms },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-4 border rounded-xl">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-6 h-6 text-gray-500" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        [item.name]: Math.max(1, (prev[item.name as keyof typeof prev] as number) - 1)
                      }))}
                      className="w-10 h-10 border rounded-full flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.value}</span>
                    <button
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        [item.name]: (prev[item.name as keyof typeof prev] as number) + 1
                      }))}
                      className="w-10 h-10 border rounded-full flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Paso 3: Amenidades */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-bold mb-2">¿Qué amenidades ofreces?</h1>
            <p className="text-gray-600 mb-6">Selecciona todo lo que aplique</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`p-4 border rounded-xl text-left transition-all flex items-center gap-3 ${
                    formData.amenities.includes(amenity.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {typeof amenity.icon === 'string' ? (
                    <span className="text-xl">{amenity.icon}</span>
                  ) : (
                    <amenity.icon className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">{amenity.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Paso 4: Precios */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-bold mb-2">Establece tu precio</h1>
            <p className="text-gray-600 mb-6">Puedes cambiar estos valores cuando quieras</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Precio por noche (MXN) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleChange}
                    placeholder="1500"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tarifa de limpieza (MXN)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    name="cleaningFee"
                    value={formData.cleaningFee}
                    onChange={handleChange}
                    placeholder="500"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Descuento semanal (%)</label>
                  <Input
                    type="number"
                    name="weeklyDiscount"
                    value={formData.weeklyDiscount}
                    onChange={handleChange}
                    placeholder="10"
                    className="h-12"
                    max="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descuento mensual (%)</label>
                  <Input
                    type="number"
                    name="monthlyDiscount"
                    value={formData.monthlyDiscount}
                    onChange={handleChange}
                    placeholder="20"
                    className="h-12"
                    max="50"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Comisión de AS Home</p>
                  <p>Cobramos una comisión del 3% sobre cada reserva confirmada.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Paso 5: Fotos */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-bold mb-2">Agrega fotos de tu espacio</h1>
            <p className="text-gray-600 mb-6">Las fotos de buena calidad atraen más huéspedes</p>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium mb-2">Arrastra tus fotos aquí</p>
              <p className="text-sm text-gray-500 mb-4">o haz clic para seleccionar</p>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Subir fotos
              </Button>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>• Mínimo 5 fotos recomendadas</p>
              <p>• Formato JPG o PNG</p>
              <p>• Tamaño máximo 10MB por foto</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg mt-4 flex gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Por ahora, puedes enviar tus fotos por correo a <strong>ashome@asoperadora.com</strong> después de completar el registro.
              </p>
            </div>
          </motion.div>
        )}

        {/* Paso 6: Contacto */}
        {step === 6 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-bold mb-2">Tus datos de contacto</h1>
            <p className="text-gray-600 mb-6">Para comunicarnos contigo sobre tu propiedad</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre completo *</label>
                <Input
                  name="hostName"
                  value={formData.hostName}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Correo electrónico *</label>
                <Input
                  type="email"
                  name="hostEmail"
                  value={formData.hostEmail}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Teléfono *</label>
                <Input
                  type="tel"
                  name="hostPhone"
                  value={formData.hostPhone}
                  onChange={handleChange}
                  placeholder="10 dígitos"
                  className="h-12"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Resumen de tu propiedad</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Tipo:</strong> {propertyTypes.find(t => t.value === formData.propertyType)?.label || '-'}</p>
                  <p><strong>Ubicación:</strong> {formData.city}, {formData.state}</p>
                  <p><strong>Capacidad:</strong> {formData.guests} huéspedes, {formData.bedrooms} recámaras</p>
                  <p><strong>Precio:</strong> ${formData.pricePerNight || '0'} MXN/noche</p>
                  <p><strong>Amenidades:</strong> {formData.amenities.length} seleccionadas</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Botones de navegación */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep} className="flex-1 h-12">
              Anterior
            </Button>
          )}
          <Button
            onClick={nextStep}
            disabled={loading}
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Enviando...' : step === 6 ? 'Publicar propiedad' : 'Siguiente'}
          </Button>
        </div>
      </main>
    </div>
  )
}
