"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Logo } from "@/components/Logo"
import {
  ArrowLeft, Plane, Calendar, Users, MapPin, SlidersHorizontal,
  Clock, DollarSign, Filter, ArrowRight, Briefcase, ChevronDown, Plus, X,
  Coffee, Wifi, Star, Shield, Luggage, CircleDot, Search
} from "lucide-react"

export default function VuelosDestinoPage() {
  const router = useRouter()
  const params = useParams()
  // Decodificar URL encoding (ej: CANC%C3%BAN → CANCÚN)
  const destino = decodeURIComponent((params.destino as string) || "CUN").toUpperCase()

  const [tipoViaje, setTipoViaje] = useState<'ida-vuelta' | 'sencillo' | 'multidestino'>('ida-vuelta')
  const [mostrarFiltros, setMostrarFiltros] = useState(true)
  const [ordenarPor, setOrdenarPor] = useState('precio')

  // Datos del formulario de búsqueda
  const [formData, setFormData] = useState({
    origen: "MEX",
    destino: destino,
    fechaSalida: "",
    fechaRegreso: "",
    pasajeros: 1,
    clase: "economy"
  })

  // Filtros
  const [precioMax, setPrecioMax] = useState([50000])
  const [escalas, setEscalas] = useState<string[]>([])
  const [aerolineas, setAerolineas] = useState<string[]>([])
  const [horasSalida, setHorasSalida] = useState<string[]>([])
  const [horasLlegada, setHorasLlegada] = useState<string[]>([])
  const [duracionMax, setDuracionMax] = useState([24])
  const [tipoTarifa, setTipoTarifa] = useState<string[]>([])
  const [equipaje, setEquipaje] = useState<string[]>([])
  const [clasesCabina, setClasesCabina] = useState<string[]>([])

  // Multidestino
  const [destinos, setDestinos] = useState([
    { origen: "MEX", destino: destino, fecha: "" },
    { origen: destino, destino: "MEX", fecha: "" }
  ])

  const agregarDestino = () => {
    setDestinos([...destinos, { origen: "", destino: "", fecha: "" }])
  }

  const eliminarDestino = (index: number) => {
    if (destinos.length > 2) {
      setDestinos(destinos.filter((_, i) => i !== index))
    }
  }

  // Contador de filtros activos
  const contarFiltrosActivos = () => {
    let count = 0
    if (precioMax[0] < 50000) count++
    if (escalas.length > 0) count++
    if (aerolineas.length > 0) count++
    if (horasSalida.length > 0) count++
    if (horasLlegada.length > 0) count++
    if (duracionMax[0] < 24) count++
    if (tipoTarifa.length > 0) count++
    if (equipaje.length > 0) count++
    if (clasesCabina.length > 0) count++
    return count
  }

  // Más vuelos de ejemplo con datos realistas
  const todosVuelos = [
    {
      id: 1,
      aerolinea: "Aeroméxico",
      logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=50&fit=crop",
      codigoVuelo: "AM 601",
      origen: "MEX",
      destino: destino,
      salida: "06:00",
      llegada: "08:35",
      duracion: "2h 35m",
      escalas: 0,
      precio: 5200,
      precioIda: 2600,
      clase: "Economy",
      equipaje: "1 maleta incluida",
      cambios: "Cambios permitidos",
      amenidades: ["Comida", "Wifi", "Entretenimiento"],
      tarifa: "Standard"
    },
    {
      id: 2,
      aerolinea: "Volaris",
      logo: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=100&h=50&fit=crop",
      codigoVuelo: "Y4 421",
      origen: "MEX",
      destino: destino,
      salida: "08:30",
      llegada: "11:20",
      duracion: "2h 50m",
      escalas: 0,
      precio: 3800,
      precioIda: 1900,
      clase: "Economy",
      equipaje: "Solo equipaje de mano",
      cambios: "No reembolsable",
      amenidades: ["Wifi"],
      tarifa: "Basic"
    },
    {
      id: 3,
      aerolinea: "VivaAerobus",
      logo: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=50&fit=crop",
      codigoVuelo: "VB 1501",
      origen: "MEX",
      destino: destino,
      salida: "11:45",
      llegada: "14:25",
      duracion: "2h 40m",
      escalas: 0,
      precio: 2900,
      precioIda: 1450,
      clase: "Economy",
      equipaje: "Solo equipaje de mano",
      cambios: "No reembolsable",
      amenidades: [],
      tarifa: "Light"
    },
    {
      id: 4,
      aerolinea: "Aeroméxico",
      logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=50&fit=crop",
      codigoVuelo: "AM 603",
      origen: "MEX",
      destino: destino,
      salida: "14:15",
      llegada: "16:55",
      duracion: "2h 40m",
      escalas: 0,
      precio: 4800,
      precioIda: 2400,
      clase: "Economy Plus",
      equipaje: "2 maletas incluidas",
      cambios: "Cambios gratis",
      amenidades: ["Comida", "Wifi", "Asiento extra", "Embarque prioritario"],
      tarifa: "Premium"
    },
    {
      id: 5,
      aerolinea: "Volaris",
      logo: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=100&h=50&fit=crop",
      codigoVuelo: "Y4 423",
      origen: "MEX",
      destino: destino,
      salida: "17:30",
      llegada: "20:15",
      duracion: "2h 45m",
      escalas: 0,
      precio: 4200,
      precioIda: 2100,
      clase: "Economy",
      equipaje: "1 maleta incluida",
      cambios: "Cambios con cargo",
      amenidades: ["Wifi", "Snack"],
      tarifa: "Standard"
    },
    {
      id: 6,
      aerolinea: "Aeroméxico",
      logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=50&fit=crop",
      codigoVuelo: "AM 605",
      origen: "MEX",
      destino: destino,
      salida: "19:00",
      llegada: "21:40",
      duracion: "2h 40m",
      escalas: 0,
      precio: 5500,
      precioIda: 2750,
      clase: "Economy",
      equipaje: "1 maleta incluida",
      cambios: "Cambios permitidos",
      amenidades: ["Comida", "Wifi", "Entretenimiento"],
      tarifa: "Standard"
    },
    {
      id: 7,
      aerolinea: "VivaAerobus",
      logo: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=50&fit=crop",
      codigoVuelo: "VB 1503",
      origen: "MEX",
      destino: destino,
      salida: "07:20",
      llegada: "10:05",
      duracion: "2h 45m",
      escalas: 0,
      precio: 3100,
      precioIda: 1550,
      clase: "Economy",
      equipaje: "Solo equipaje de mano",
      cambios: "No reembolsable",
      amenidades: [],
      tarifa: "Light"
    },
    {
      id: 8,
      aerolinea: "Volaris",
      logo: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=100&h=50&fit=crop",
      codigoVuelo: "Y4 427",
      origen: "MEX",
      destino: destino,
      salida: "20:45",
      llegada: "23:25",
      duracion: "2h 40m",
      escalas: 0,
      precio: 3500,
      precioIda: 1750,
      clase: "Economy",
      equipaje: "Solo equipaje de mano",
      cambios: "No reembolsable",
      amenidades: ["Wifi"],
      tarifa: "Basic"
    }
  ]

  // Función para verificar si un vuelo cumple con filtros de horario
  const cumpleHorario = (hora: string, filtros: string[]) => {
    if (filtros.length === 0) return true

    const horaNum = parseInt(hora.split(':')[0])

    for (const filtro of filtros) {
      if (filtro === 'madrugada' && horaNum >= 0 && horaNum < 6) return true
      if (filtro === 'mañana' && horaNum >= 6 && horaNum < 12) return true
      if (filtro === 'tarde' && horaNum >= 12 && horaNum < 18) return true
      if (filtro === 'noche' && horaNum >= 18 && horaNum < 24) return true
    }

    return false
  }

  const vuelosFiltrados = todosVuelos
    .filter(v => v.precio <= precioMax[0])
    .filter(v => {
      if (escalas.length === 0) return true
      if (escalas.includes('Directo')) return v.escalas === 0
      if (escalas.includes('1 escala')) return v.escalas === 1
      if (escalas.includes('2+ escalas')) return v.escalas >= 2
      return true
    })
    .filter(v => aerolineas.length === 0 || aerolineas.includes(v.aerolinea))
    .filter(v => tipoTarifa.length === 0 || tipoTarifa.includes(v.tarifa))
    .filter(v => clasesCabina.length === 0 || clasesCabina.includes(v.clase))
    .filter(v => {
      if (equipaje.length === 0) return true
      if (equipaje.includes('maleta') && v.equipaje.includes('maleta')) return true
      if (equipaje.includes('mano') && v.equipaje.includes('mano')) return true
      return false
    })
    .filter(v => cumpleHorario(v.salida, horasSalida))
    .filter(v => cumpleHorario(v.llegada, horasLlegada))
    .sort((a, b) => {
      if (ordenarPor === 'precio') return a.precio - b.precio
      if (ordenarPor === 'duracion') {
        const durA = parseInt(a.duracion)
        const durB = parseInt(b.duracion)
        return durA - durB
      }
      if (ordenarPor === 'salida') return a.salida.localeCompare(b.salida)
      if (ordenarPor === 'llegada') return a.llegada.localeCompare(b.llegada)
      return 0
    })

  const toggleCheckbox = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const limpiarTodosFiltros = () => {
    setPrecioMax([50000])
    setEscalas([])
    setAerolineas([])
    setHorasSalida([])
    setHorasLlegada([])
    setDuracionMax([24])
    setTipoTarifa([])
    setEquipaje([])
    setClasesCabina([])
  }

  const precioMasBarato = vuelosFiltrados.length > 0
    ? Math.min(...vuelosFiltrados.map(v => tipoViaje === 'sencillo' ? v.precioIda : v.precio))
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
        <div className="container mx-auto px-4 py-3">
          <Link href="/">
            <Logo className="py-2" />
          </Link>
        </div>
      </header>

      {/* Buscador Superior - Estilo Expedia */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Vuelos {tipoViaje === 'ida-vuelta' ? 'ida y vuelta' : tipoViaje === 'sencillo' ? 'sencillo' : 'multidestino'}</h1>
              <p className="text-sm text-muted-foreground">
                {tipoViaje === 'multidestino' ? 'Múltiples destinos' : `${formData.origen} → ${formData.destino}`}
              </p>
            </div>
          </div>

          {/* Tipo de Viaje - Estilo Expedia */}
          <Tabs value={tipoViaje} onValueChange={(v: any) => setTipoViaje(v)} className="mb-4">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="ida-vuelta" className="data-[state=active]:bg-white">
                Ida y vuelta
              </TabsTrigger>
              <TabsTrigger value="sencillo" className="data-[state=active]:bg-white">
                Sencillo
              </TabsTrigger>
              <TabsTrigger value="multidestino" className="data-[state=active]:bg-white">
                Multidestino
              </TabsTrigger>
            </TabsList>

            {/* Formularios según tipo de viaje */}
            <TabsContent value="ida-vuelta" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg border">
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Saliendo de</Label>
                <Input
                  value={formData.origen}
                  onChange={(e) => setFormData({...formData, origen: e.target.value})}
                  className="font-semibold"
                  placeholder="MEX"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Destino</Label>
                <Input
                  value={formData.destino}
                  onChange={(e) => setFormData({...formData, destino: e.target.value})}
                  className="font-semibold"
                  placeholder="CUN"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Salida</Label>
                <Input
                  type="date"
                  className="font-semibold"
                  value={formData.fechaSalida}
                  onChange={(e) => setFormData({...formData, fechaSalida: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Regreso</Label>
                <Input
                  type="date"
                  className="font-semibold"
                  value={formData.fechaRegreso}
                  onChange={(e) => setFormData({...formData, fechaRegreso: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Pasajeros</Label>
                <Select
                  value={formData.pasajeros.toString()}
                  onValueChange={(v) => setFormData({...formData, pasajeros: parseInt(v)})}
                >
                  <SelectTrigger className="font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 adulto</SelectItem>
                    <SelectItem value="2">2 adultos</SelectItem>
                    <SelectItem value="3">3 adultos</SelectItem>
                    <SelectItem value="4">4 adultos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sencillo" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg border">
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Saliendo de</Label>
                <Input
                  value={formData.origen}
                  onChange={(e) => setFormData({...formData, origen: e.target.value})}
                  className="font-semibold"
                  placeholder="MEX"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Destino</Label>
                <Input
                  value={formData.destino}
                  onChange={(e) => setFormData({...formData, destino: e.target.value})}
                  className="font-semibold"
                  placeholder="CUN"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Salida</Label>
                <Input
                  type="date"
                  className="font-semibold"
                  value={formData.fechaSalida}
                  onChange={(e) => setFormData({...formData, fechaSalida: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1">Pasajeros</Label>
                <Select
                  value={formData.pasajeros.toString()}
                  onValueChange={(v) => setFormData({...formData, pasajeros: parseInt(v)})}
                >
                  <SelectTrigger className="font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 adulto</SelectItem>
                    <SelectItem value="2">2 adultos</SelectItem>
                    <SelectItem value="3">3 adultos</SelectItem>
                    <SelectItem value="4">4 adultos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="multidestino" className="mt-0">
            <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
              {destinos.map((destino, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-white rounded border items-end">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">
                      <CircleDot className="w-3 h-3 inline mr-1" />
                      Saliendo de
                    </Label>
                    <Input
                      value={destino.origen}
                      onChange={(e) => {
                        const newDestinos = [...destinos]
                        newDestinos[index].origen = e.target.value
                        setDestinos(newDestinos)
                      }}
                      placeholder="Origen"
                      className="font-semibold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Hacia</Label>
                    <Input
                      value={destino.destino}
                      onChange={(e) => {
                        const newDestinos = [...destinos]
                        newDestinos[index].destino = e.target.value
                        setDestinos(newDestinos)
                      }}
                      placeholder="Destino"
                      className="font-semibold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Fecha</Label>
                    <Input
                      type="date"
                      value={destino.fecha}
                      onChange={(e) => {
                        const newDestinos = [...destinos]
                        newDestinos[index].fecha = e.target.value
                        setDestinos(newDestinos)
                      }}
                      className="font-semibold"
                    />
                  </div>
                  <div>
                    {index > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarDestino(index)}
                        className="w-full"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={agregarDestino}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar otro vuelo
              </Button>
            </div>
          </TabsContent>
          </Tabs>

          <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto">
            <Search className="w-4 h-4 mr-2" />
            Buscar vuelos
          </Button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-6">
        {/* Barra superior con contador y ordenamiento */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <div>
            <h2 className="text-lg font-bold">
              {vuelosFiltrados.length} de {todosVuelos.length} vuelos
            </h2>
            {vuelosFiltrados.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Desde <span className="font-bold text-blue-600">${precioMasBarato.toLocaleString()} MXN</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              {mostrarFiltros ? 'Ocultar' : 'Mostrar'} filtros
              {contarFiltrosActivos() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {contarFiltrosActivos()}
                </span>
              )}
            </Button>
            <Select value={ordenarPor} onValueChange={setOrdenarPor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="precio">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Precio más bajo
                </SelectItem>
                <SelectItem value="duracion">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Menor duración
                </SelectItem>
                <SelectItem value="salida">
                  <Plane className="w-4 h-4 inline mr-2" />
                  Hora de salida
                </SelectItem>
                <SelectItem value="llegada">Hora de llegada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Filtros - Estilo Expedia */}
          {mostrarFiltros && (
            <div className="lg:col-span-1">
              <Card className="p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filtros
                    {contarFiltrosActivos() > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        ({contarFiltrosActivos()})
                      </span>
                    )}
                  </h3>
                  {contarFiltrosActivos() > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={limpiarTodosFiltros}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>

                {/* Precio */}
                <div className="mb-6 pb-6 border-b">
                  <Label className="text-sm font-semibold mb-3 block">Precio por persona</Label>
                  <Slider
                    value={precioMax}
                    onValueChange={setPrecioMax}
                    max={50000}
                    min={1000}
                    step={500}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">$1,000</span>
                    <span className="font-bold text-blue-600">${precioMax[0].toLocaleString()}</span>
                  </div>
                </div>

                {/* Escalas */}
                <div className="mb-6 pb-6 border-b">
                  <Label className="text-sm font-semibold mb-3 block">Número de escalas</Label>
                  <div className="space-y-3">
                    {['Directo', '1 escala', '2+ escalas'].map((escala) => (
                      <div key={escala} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={escala}
                            checked={escalas.includes(escala)}
                            onCheckedChange={() => toggleCheckbox(escala, setEscalas)}
                          />
                          <label htmlFor={escala} className="text-sm cursor-pointer">
                            {escala}
                          </label>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {todosVuelos.filter(v => {
                            if (escala === 'Directo') return v.escalas === 0
                            if (escala === '1 escala') return v.escalas === 1
                            return v.escalas >= 2
                          }).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aerolíneas */}
                <div className="mb-6 pb-6 border-b">
                  <Label className="text-sm font-semibold mb-3 block">Aerolíneas</Label>
                  <div className="space-y-3">
                    {['Aeroméxico', 'Volaris', 'VivaAerobus'].map((aerolinea) => {
                      const count = todosVuelos.filter(v => v.aerolinea === aerolinea).length
                      return (
                        <div key={aerolinea} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={aerolinea}
                              checked={aerolineas.includes(aerolinea)}
                              onCheckedChange={() => toggleCheckbox(aerolinea, setAerolineas)}
                            />
                            <label htmlFor={aerolinea} className="text-sm cursor-pointer">
                              {aerolinea}
                            </label>
                          </div>
                          <span className="text-xs text-muted-foreground">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Clase de Cabina */}
                <div className="mb-6 pb-6 border-b">
                  <Label className="text-sm font-semibold mb-3 block">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Clase de cabina
                  </Label>
                  <div className="space-y-3">
                    {[
                      { value: 'Economy', label: 'Económica' },
                      { value: 'Economy Plus', label: 'Económica Plus' },
                      { value: 'Business', label: 'Ejecutiva' },
                      { value: 'First Class', label: 'Primera Clase' }
                    ].map((clase) => (
                      <div key={clase.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`clase-${clase.value}`}
                          checked={clasesCabina.includes(clase.value)}
                          onCheckedChange={() => toggleCheckbox(clase.value, setClasesCabina)}
                        />
                        <label htmlFor={`clase-${clase.value}`} className="text-sm cursor-pointer">
                          {clase.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tipo de Tarifa */}
                <div className="mb-6 pb-6 border-b">
                  <Label className="text-sm font-semibold mb-3 block">Tipo de tarifa</Label>
                  <div className="space-y-3">
                    {['Light', 'Basic', 'Standard', 'Premium'].map((tarifa) => (
                      <div key={tarifa} className="flex items-center gap-2">
                        <Checkbox
                          id={`tarifa-${tarifa}`}
                          checked={tipoTarifa.includes(tarifa)}
                          onCheckedChange={() => toggleCheckbox(tarifa, setTipoTarifa)}
                        />
                        <label htmlFor={`tarifa-${tarifa}`} className="text-sm cursor-pointer">
                          {tarifa}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipaje */}
                <div className="mb-6 pb-6 border-b">
                  <Label className="text-sm font-semibold mb-3 block">
                    <Luggage className="w-4 h-4 inline mr-1" />
                    Equipaje
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="equipaje-maleta"
                        checked={equipaje.includes('maleta')}
                        onCheckedChange={() => toggleCheckbox('maleta', setEquipaje)}
                      />
                      <label htmlFor="equipaje-maleta" className="text-sm cursor-pointer">
                        Maleta documentada incluida
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="equipaje-mano"
                        checked={equipaje.includes('mano')}
                        onCheckedChange={() => toggleCheckbox('mano', setEquipaje)}
                      />
                      <label htmlFor="equipaje-mano" className="text-sm cursor-pointer">
                        Solo equipaje de mano
                      </label>
                    </div>
                  </div>
                </div>

                {/* Horarios de Salida */}
                <div className="mb-6 pb-6 border-b">
                  <Label className="text-sm font-semibold mb-3 block">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Hora de salida
                  </Label>
                  <div className="space-y-3">
                    {[
                      { label: 'Madrugada', value: 'madrugada', time: '00:00 - 06:00', emoji: '🌙' },
                      { label: 'Mañana', value: 'mañana', time: '06:00 - 12:00', emoji: '🌅' },
                      { label: 'Tarde', value: 'tarde', time: '12:00 - 18:00', emoji: '☀️' },
                      { label: 'Noche', value: 'noche', time: '18:00 - 00:00', emoji: '🌃' }
                    ].map((horario) => (
                      <div key={horario.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`salida-${horario.value}`}
                          checked={horasSalida.includes(horario.value)}
                          onCheckedChange={() => toggleCheckbox(horario.value, setHorasSalida)}
                        />
                        <label htmlFor={`salida-${horario.value}`} className="text-sm cursor-pointer flex items-center gap-1">
                          <span>{horario.emoji}</span>
                          <span>{horario.label}</span>
                          <span className="text-xs text-muted-foreground">({horario.time})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Horarios de Llegada */}
                <div className="mb-6 pb-6 border-b">
                  <Label className="text-sm font-semibold mb-3 block">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Hora de llegada
                  </Label>
                  <div className="space-y-3">
                    {[
                      { label: 'Madrugada', value: 'madrugada', time: '00:00 - 06:00', emoji: '🌙' },
                      { label: 'Mañana', value: 'mañana', time: '06:00 - 12:00', emoji: '🌅' },
                      { label: 'Tarde', value: 'tarde', time: '12:00 - 18:00', emoji: '☀️' },
                      { label: 'Noche', value: 'noche', time: '18:00 - 00:00', emoji: '🌃' }
                    ].map((horario) => (
                      <div key={horario.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`llegada-${horario.value}`}
                          checked={horasLlegada.includes(horario.value)}
                          onCheckedChange={() => toggleCheckbox(horario.value, setHorasLlegada)}
                        />
                        <label htmlFor={`llegada-${horario.value}`} className="text-sm cursor-pointer flex items-center gap-1">
                          <span>{horario.emoji}</span>
                          <span>{horario.label}</span>
                          <span className="text-xs text-muted-foreground">({horario.time})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duración del Vuelo */}
                <div className="mb-6">
                  <Label className="text-sm font-semibold mb-3 block">Duración máxima</Label>
                  <Slider
                    value={duracionMax}
                    onValueChange={setDuracionMax}
                    max={24}
                    min={1}
                    step={1}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">1 hora</span>
                    <span className="font-bold">{duracionMax[0]} horas</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Resultados de Vuelos - Estilo Expedia */}
          <div className={mostrarFiltros ? "lg:col-span-3" : "lg:col-span-4"}>
            {vuelosFiltrados.length === 0 ? (
              <Card className="p-12 text-center">
                <Plane className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No se encontraron vuelos</h3>
                <p className="text-muted-foreground mb-4">
                  Intenta ajustar los filtros para ver más resultados
                </p>
                <Button
                  variant="outline"
                  onClick={limpiarTodosFiltros}
                >
                  Limpiar filtros
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {vuelosFiltrados.map((vuelo) => (
                  <Card key={vuelo.id} className="hover:shadow-xl transition-all duration-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-6">
                        {/* Aerolínea */}
                        <div className="flex items-center gap-3 w-36">
                          <img src={vuelo.logo} alt={vuelo.aerolinea} className="w-12 h-12 rounded object-cover" />
                          <div>
                            <p className="font-semibold text-sm">{vuelo.aerolinea}</p>
                            <p className="text-xs text-muted-foreground">{vuelo.codigoVuelo}</p>
                          </div>
                        </div>

                        {/* Horarios y Ruta */}
                        <div className="flex-1 flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{vuelo.salida}</p>
                            <p className="text-sm text-muted-foreground font-medium">{vuelo.origen}</p>
                          </div>

                          <div className="flex-1 flex flex-col items-center px-4">
                            <p className="text-xs text-muted-foreground mb-1">{vuelo.duracion}</p>
                            <div className="w-full relative">
                              <div className="h-0.5 bg-gray-300"></div>
                              <Plane className="w-5 h-5 text-blue-600 absolute -top-2 left-1/2 -translate-x-1/2 rotate-90" />
                            </div>
                            <p className="text-xs font-medium mt-1 text-green-600">
                              {vuelo.escalas === 0 ? '✓ Directo' : `${vuelo.escalas} escala${vuelo.escalas > 1 ? 's' : ''}`}
                            </p>
                          </div>

                          <div className="text-center">
                            <p className="text-2xl font-bold">{vuelo.llegada}</p>
                            <p className="text-sm text-muted-foreground font-medium">{vuelo.destino}</p>
                          </div>
                        </div>

                        {/* Precio y CTA */}
                        <div className="text-right w-48">
                          <div className="mb-3">
                            <p className="text-3xl font-bold text-blue-600">
                              ${(tipoViaje === 'sencillo' ? vuelo.precioIda : vuelo.precio).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">MXN {tipoViaje === 'sencillo' ? 'sencillo' : 'ida y vuelta'}</p>
                          </div>
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              localStorage.setItem('reserva_temp', JSON.stringify({
                                servicio: {
                                  ...vuelo,
                                  precio: tipoViaje === 'sencillo' ? vuelo.precioIda : vuelo.precio
                                },
                                pasajeros: formData.pasajeros,
                                tipo: 'vuelo',
                                tipoViaje: tipoViaje
                              }))
                              router.push('/confirmar-reserva?tipo=vuelo')
                            }}
                          >
                            Seleccionar
                          </Button>
                        </div>
                      </div>

                      {/* Detalles adicionales */}
                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Luggage className="w-3 h-3" />
                            {vuelo.equipaje}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {vuelo.cambios}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                            {vuelo.tarifa}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {vuelo.amenidades.map((amenidad, i) => (
                            <span key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                              {amenidad === 'Wifi' && <Wifi className="w-3 h-3" />}
                              {amenidad === 'Comida' && <Coffee className="w-3 h-3" />}
                              {amenidad === 'Entretenimiento' && <Star className="w-3 h-3" />}
                              {amenidad}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
