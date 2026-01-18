'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { Users, MapPin, Mail, Send, CheckCircle, Calendar } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Tipos de grupo disponibles
const tiposGrupo = [
  'Viaje corporativo',
  'Viaje escolar',
  'Viaje familiar',
  'Despedida de soltero/a',
  'Aniversario/Celebración',
  'Congreso/Convención',
  'Incentivo empresarial',
  'Grupo religioso',
  'Grupo deportivo',
  'Otro'
]

// Categorías de estrellas
const categoriasEstrellas = [
  '5 estrellas - Lujo',
  '4 estrellas - Superior',
  '3 estrellas - Turista',
  '2-3 estrellas - Económico',
  'Sin preferencia'
]

export default function ViajesGrupalesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const [formData, setFormData] = useState({
    ciudadOrigen: '',
    ciudadDestino: '',
    tipoGrupo: '',
    numPersonas: '',
    numHabitaciones: '',
    categoriaEstrellas: '',
    presupuestoMin: '',
    presupuestoMax: '',
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    comentarios: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validaciones básicas
    if (!formData.ciudadOrigen || !formData.ciudadDestino || !dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos de viaje incluyendo las fechas',
        variant: 'destructive'
      })
      setLoading(false)
      return
    }

    if (!formData.nombre || !formData.correo) {
      toast({
        title: 'Datos de contacto',
        description: 'Por favor ingresa tu nombre y correo electrónico',
        variant: 'destructive'
      })
      setLoading(false)
      return
    }

    try {
      // Enviar a API de cotización de grupos
      const response = await fetch('/api/groups/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: formData.tipoGrupo,
          contactName: `${formData.nombre} ${formData.apellido}`,
          contactEmail: formData.correo,
          contactPhone: formData.telefono,
          origin: formData.ciudadOrigen,
          destination: formData.ciudadDestino,
          departureDate: dateRange?.from?.toISOString().split('T')[0],
          returnDate: dateRange?.to?.toISOString().split('T')[0],
          totalPassengers: parseInt(formData.numPersonas) || 10,
          cabinClass: 'economy',
          specialRequests: formData.comentarios
        })
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
        toast({
          title: data.quoteType === 'manual' ? 'Solicitud recibida' : 'Cotización generada',
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <PageHeader showBackButton={true} backButtonHref="/" />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="p-8 text-center">
            <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
            <h1 className="text-3xl font-bold mb-4">¡Solicitud Enviada!</h1>
            <p className="text-gray-600 mb-6">
              Hemos recibido tu solicitud de cotización para viaje grupal.
              Nuestro equipo te contactará en las próximas 24-48 horas con una propuesta personalizada.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-700">
                <strong>Destino:</strong> {formData.ciudadDestino}<br />
                <strong>Personas:</strong> {formData.numPersonas}<br />
                <strong>Fechas:</strong> {dateRange?.from && format(dateRange.from, 'd MMM yyyy', { locale: es })} al {dateRange?.to && format(dateRange.to, 'd MMM yyyy', { locale: es })}
              </p>
            </div>
            <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Volver al inicio
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <PageHeader showBackButton={true} backButtonHref="/" />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Users className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold mb-2">Viajes Grupales</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            ¿Viajan más de 10 personas? Obtén una cotización personalizada con descuentos especiales para grupos.
          </p>
        </div>

        {/* Beneficios */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">Hasta 30%</div>
            <p className="text-sm text-gray-600">Descuento en grupos</p>
          </Card>
          <Card className="p-4 text-center bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">Asesoría</div>
            <p className="text-sm text-gray-600">Personalizada gratis</p>
          </Card>
          <Card className="p-4 text-center bg-purple-50 border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">Coordinación</div>
            <p className="text-sm text-gray-600">Completa del viaje</p>
          </Card>
        </div>

        {/* Formulario */}
        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Solicitar Cotización
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos del viaje */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ciudad de origen *</label>
                <Input
                  name="ciudadOrigen"
                  value={formData.ciudadOrigen}
                  onChange={handleChange}
                  placeholder="Ej: Ciudad de México"
                  className="h-12"
                  required
                  list="origenes-grupales"
                />
                <datalist id="origenes-grupales">
                  <option value="Ciudad de México, CDMX, México" />
                  <option value="Guadalajara, Jalisco, México" />
                  <option value="Monterrey, Nuevo León, México" />
                  <option value="Tijuana, Baja California, México" />
                  <option value="León, Guanajuato, México" />
                  <option value="Querétaro, Querétaro, México" />
                  <option value="Puebla, Puebla, México" />
                  <option value="Mérida, Yucatán, México" />
                  <option value="San Luis Potosí, SLP, México" />
                  <option value="Aguascalientes, Ags, México" />
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ciudad de destino *</label>
                <Input
                  name="ciudadDestino"
                  value={formData.ciudadDestino}
                  onChange={handleChange}
                  placeholder="Ej: Cancún"
                  className="h-12"
                  required
                  list="destinos-grupales"
                />
                <datalist id="destinos-grupales">
                  {/* México - Playas */}
                  <option value="Cancún, Quintana Roo, México" />
                  <option value="Playa del Carmen, Quintana Roo, México" />
                  <option value="Riviera Maya, Quintana Roo, México" />
                  <option value="Los Cabos, Baja California Sur, México" />
                  <option value="Puerto Vallarta, Jalisco, México" />
                  <option value="Mazatlán, Sinaloa, México" />
                  <option value="Huatulco, Oaxaca, México" />
                  <option value="Acapulco, Guerrero, México" />
                  {/* México - Ciudades */}
                  <option value="Ciudad de México, CDMX, México" />
                  <option value="Guadalajara, Jalisco, México" />
                  <option value="Oaxaca, Oaxaca, México" />
                  <option value="San Miguel de Allende, Guanajuato, México" />
                  <option value="Mérida, Yucatán, México" />
                  {/* USA */}
                  <option value="Orlando, Florida, USA" />
                  <option value="Miami, Florida, USA" />
                  <option value="Las Vegas, Nevada, USA" />
                  <option value="Nueva York, New York, USA" />
                  <option value="Los Angeles, California, USA" />
                  {/* Europa */}
                  <option value="París, Francia" />
                  <option value="Barcelona, España" />
                  <option value="Madrid, España" />
                  <option value="Roma, Italia" />
                  <option value="Londres, Reino Unido" />
                  {/* Caribe */}
                  <option value="Punta Cana, República Dominicana" />
                  <option value="La Habana, Cuba" />
                  <option value="Aruba" />
                </datalist>
              </div>
            </div>

            {/* Selector de fechas con calendario */}
            <div>
              <label className="block text-sm font-medium mb-2">Fechas del viaje *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full h-12 flex items-center justify-start px-4 border border-input rounded-lg bg-white hover:bg-accent/50 transition-colors text-left",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="w-5 h-5 mr-3 text-muted-foreground" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <span>
                          {format(dateRange.from, "d MMM yyyy", { locale: es })} - {format(dateRange.to, "d MMM yyyy", { locale: es })}
                        </span>
                      ) : (
                        <span>{format(dateRange.from, "d MMM yyyy", { locale: es })}</span>
                      )
                    ) : (
                      <span>Selecciona las fechas de salida y regreso</span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={es}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today
                    }}
                  />
                </PopoverContent>
              </Popover>
              {dateRange?.from && dateRange?.to && (
                <p className="text-xs text-muted-foreground mt-1">
                  Duración: {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} noches
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo de grupo *</label>
              <select
                name="tipoGrupo"
                value={formData.tipoGrupo}
                onChange={handleChange}
                className="w-full h-12 px-3 border rounded-lg bg-white"
                required
              >
                <option value="">Selecciona el tipo de grupo</option>
                {tiposGrupo.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Número de personas *</label>
                <Input
                  type="number"
                  name="numPersonas"
                  value={formData.numPersonas}
                  onChange={handleChange}
                  placeholder="Mínimo 10"
                  min="10"
                  className="h-12"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Número de habitaciones</label>
                <Input
                  type="number"
                  name="numHabitaciones"
                  value={formData.numHabitaciones}
                  onChange={handleChange}
                  placeholder="Opcional"
                  min="1"
                  className="h-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoría de hotel preferida</label>
              <select
                name="categoriaEstrellas"
                value={formData.categoriaEstrellas}
                onChange={handleChange}
                className="w-full h-12 px-3 border rounded-lg bg-white"
              >
                <option value="">Selecciona una categoría</option>
                {categoriasEstrellas.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Presupuesto mínimo por noche (MXN)</label>
                <Input
                  type="number"
                  name="presupuestoMin"
                  value={formData.presupuestoMin}
                  onChange={handleChange}
                  placeholder="Ej: 1500"
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Presupuesto máximo por noche (MXN)</label>
                <Input
                  type="number"
                  name="presupuestoMax"
                  value={formData.presupuestoMax}
                  onChange={handleChange}
                  placeholder="Ej: 3500"
                  className="h-12"
                />
              </div>
            </div>

            {/* Separador */}
            <hr className="my-6" />

            {/* Datos de contacto */}
            <h3 className="text-lg font-semibold flex items-center gap-2">
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

            <div className="grid md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium mb-2">Teléfono</label>
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

            <div>
              <label className="block text-sm font-medium mb-2">Comentarios adicionales</label>
              <textarea
                name="comentarios"
                value={formData.comentarios}
                onChange={handleChange}
                placeholder="Cuéntanos más sobre tu viaje..."
                className="w-full p-3 border rounded-lg bg-white min-h-[100px]"
              />
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
    </div>
  )
}
