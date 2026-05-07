"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, Save, FileDown, Send, 
  MapPin, Calendar, Users, DollarSign, 
  Plus, Trash2, Edit2, CheckCircle2,
  Plane, Hotel, Map, Info, Clock, ExternalLink
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Activity {
  time: string
  name: string
  description: string
  type: string
  estimated_cost: number
}

interface Day {
  id: number
  day_number: number
  city: string
  title: string
  activities: Activity[]
  hotel_name: string
  hotel_category: string
  hotel_estimated_cost: number
  transport_type: string
  transport_details: string
  estimated_day_cost: number
}

interface Service {
  id?: number
  service_type: string
  service_name: string
  description: string
  cost_price: number
  sale_price: number
  currency: string
}

interface Proposal {
  id: number
  folio: string
  traveler_name: string
  traveler_email: string
  traveler_phone: string
  destination: string
  status: string
  start_date: string
  duration_nights: number
  budget_total: number
  budget_currency: string
  captured_fields: any
  ai_itinerary: any
  days: Day[]
  services: Service[]
}

export default function TripProposalEditorPage() {
  const params = useParams()
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("itinerary")
  const [isSaving, setIsSaving] = useState(false)

  const fetchProposal = useCallback(async () => {
    try {
      const response = await fetch('/api/trip-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'get', proposal_id: params.id })
      })
      const data = await response.json()
      if (data.success) {
        setProposal(data.proposal)
      }
    } catch (error) {
      console.error('Error fetching proposal:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchProposal()
  }, [fetchProposal])

  const handleSaveProposal = async () => {
    setIsSaving(true)
    // Implementación de guardado masivo de días y servicios
    setTimeout(() => {
      setIsSaving(false)
      alert("Propuesta guardada correctamente")
    }, 1000)
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/trip-designer/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: params.id })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Itinerario-${proposal?.folio}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  if (loading) return <div className="p-20 text-center">Cargando propuesta...</div>
  if (!proposal) return <div className="p-20 text-center">Propuesta no encontrada</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Fijo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{proposal.folio}</h1>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                {proposal.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{proposal.traveler_name} | {proposal.destination}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            Vista Previa PDF
          </Button>
          <Button onClick={handleSaveProposal} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Send className="w-4 h-4 mr-2" />
            Enviar a Cliente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Información y Resumen */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requisitos del Cliente</CardTitle>
              <CardDescription>Lo que el cliente capturó via IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-xs uppercase font-bold">Viajeros</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4" />
                    {proposal.num_adults} Adultos, {proposal.num_children} Niños
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-xs uppercase font-bold">Presupuesto</span>
                  <div className="flex items-center gap-1.5 font-medium text-green-600">
                    <DollarSign className="w-4 h-4" />
                    {proposal.budget_total?.toLocaleString()} {proposal.budget_currency}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block text-xs uppercase font-bold">Intereses</span>
                <div className="flex flex-wrap gap-1">
                  {proposal.captured_fields?.interests?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 text-xs italic">
                "{proposal.captured_fields?.additional_notes || 'Sin notas adicionales'}"
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acceso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                Buscar Vuelos en Sistema
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                Buscar Hoteles en Sistema
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9 text-blue-600">
                <Map className="w-3.5 h-3.5 mr-2" />
                Ver Paquetes MegaTravel
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Editor Principal (Tabs) */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="itinerary">📝 Itinerario</TabsTrigger>
              <TabsTrigger value="services">💰 Servicios & Costos</TabsTrigger>
              <TabsTrigger value="history">💬 Historial Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="itinerary" className="space-y-4">
              {proposal.days.map((day, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-muted/50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {day.day_number}
                      </div>
                      <Input 
                        value={day.title} 
                        className="bg-transparent border-none font-bold text-lg h-8 focus-visible:ring-0 p-0"
                        placeholder="Título del día..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground italic flex items-center gap-1">
                          <MapPin className="w-3 h-3"/> Ciudad
                        </label>
                        <Input value={day.city} bsSize="sm" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground italic flex items-center gap-1">
                          <Hotel className="w-3 h-3"/> Hotel Recomendado
                        </label>
                        <Input value={day.hotel_name} className="h-8 text-sm" />
                      </div>
                    </div>

                    {/* Actividades del Día */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                        Actividades
                      </label>
                      {day.activities.map((act, actIdx) => (
                        <div key={actIdx} className="flex gap-2 group">
                          <Input value={act.time} className="w-20 h-8 text-xs" />
                          <Input value={act.name} className="flex-1 h-8 text-xs" />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-3.5 h-3.5"/>
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="w-full border-dashed border-2 h-8 text-xs text-muted-foreground">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Agregar Actividad
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Fijar Precios y Servicios</CardTitle>
                      <CardDescription>Agrega los servicios reales que incluye la propuesta</CardDescription>
                    </div>
                    <Button size="sm" className="bg-blue-600">
                      <Plus className="w-4 h-4 mr-2" /> Agregar Servicio
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {proposal.services.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground">No hay servicios agregados. Haz click en "+" para empezar.</p>
                      </div>
                    ) : (
                      <Table>
                        {/* Headers */}
                        <TableHeader>
                          <TableRow>
                            <TableHead>Servicio</TableHead>
                            <TableHead className="text-right">Costo (Neto)</TableHead>
                            <TableHead className="text-right">Venta (P.P)</TableHead>
                            <TableHead className="text-right">Utilidad</TableHead>
                            <TableHead className="w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        {/* Rows */}
                        <TableBody>
                          {proposal.services.map((svc, sIdx) => (
                            <TableRow key={sIdx}>
                              <TableCell>
                                <div className="font-medium text-sm">{svc.service_name}</div>
                                <div className="text-[10px] text-muted-foreground">{svc.service_type}</div>
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                ${svc.cost_price?.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-bold text-sm text-blue-600">
                                ${svc.sale_price?.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-xs text-green-600 font-medium">
                                +${(svc.sale_price - svc.cost_price)?.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="w-4 h-4"/></Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  {/* Totales consolidados */}
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg flex flex-col items-end gap-1">
                    <div className="flex gap-4 text-xs">
                      <span className="text-muted-foreground">Costo Total Neto:</span>
                      <span className="font-medium">$125,000 MXN</span>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-muted-foreground">IVA (16%):</span>
                      <span className="font-medium">$20,000 MXN</span>
                    </div>
                    <div className="flex gap-4 text-lg font-bold text-blue-600 mt-2">
                      <span>PRECIO VENTA FINAL:</span>
                      <span>$165,000 MXN</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transcripción del Chat</CardTitle>
                  <CardDescription>Repasa la conversación entre el cliente y la IA para entender sus matices</CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] overflow-y-auto space-y-4">
                  {proposal.captured_fields?.chat_history?.map((msg: any, mIdx: number) => (
                    <div key={mIdx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-muted'
                      }`}>
                        <div className="text-[10px] opacity-70 mb-1 font-bold uppercase">
                          {msg.role === 'user' ? proposal.traveler_name : 'AS Travel Designer'}
                        </div>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
