"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'
import {
  Plus, Calendar, MapPin, Edit, ArrowLeft, Check, X, Trash2,
  Clock, Navigation, FileText, Share2, Download, Copy, Link as LinkIcon
} from 'lucide-react'

interface Activity {
  time: string
  title: string
  description: string
  location: string
}

interface Day {
  day: number
  date: string
  title: string
  activities: Activity[]
}

interface Itinerary {
  id: number
  title: string
  destination: string
  description: string
  start_date: string
  end_date: string
  days: Day[]
  notes: string
  recommendations: string
  status: string
  created_at: string
}

export default function ItinerariesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    description: '',
    start_date: '',
    end_date: '',
    notes: '',
    recommendations: ''
  })

  const [days, setDays] = useState<Day[]>([
    {
      day: 1,
      date: '',
      title: 'Día 1',
      activities: [{
        time: '09:00',
        title: '',
        description: '',
        location: ''
      }]
    }
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!user?.role || !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'].includes(user.role)) {
      router.push('/')
      return
    }

    loadItineraries()
  }, [isAuthenticated, user])

  const loadItineraries = async () => {
    try {
      const res = await fetch(`/api/itineraries?userId=${user?.id}`)
      const data = await res.json()
      if (data.success) {
        setItineraries(data.data)
      }
    } catch (error) {
      console.error('Error loading itineraries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDay = () => {
    const newDay: Day = {
      day: days.length + 1,
      date: '',
      title: `Día ${days.length + 1}`,
      activities: [{
        time: '09:00',
        title: '',
        description: '',
        location: ''
      }]
    }
    setDays([...days, newDay])
  }

  const handleRemoveDay = (dayIndex: number) => {
    if (days.length > 1) {
      setDays(days.filter((_, i) => i !== dayIndex))
    }
  }

  const handleAddActivity = (dayIndex: number) => {
    const newDays = [...days]
    newDays[dayIndex].activities.push({
      time: '12:00',
      title: '',
      description: '',
      location: ''
    })
    setDays(newDays)
  }

  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    const newDays = [...days]
    if (newDays[dayIndex].activities.length > 1) {
      newDays[dayIndex].activities = newDays[dayIndex].activities.filter((_, i) => i !== activityIndex)
      setDays(newDays)
    }
  }

  const handleDayChange = (dayIndex: number, field: string, value: string) => {
    const newDays = [...days]
    newDays[dayIndex] = { ...newDays[dayIndex], [field]: value }
    setDays(newDays)
  }

  const handleActivityChange = (dayIndex: number, activityIndex: number, field: string, value: string) => {
    const newDays = [...days]
    newDays[dayIndex].activities[activityIndex] = {
      ...newDays[dayIndex].activities[activityIndex],
      [field]: value
    }
    setDays(newDays)
  }

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      user_id: user?.id,
      created_by: user?.id,
      days: JSON.stringify(days)
    }

    try {
      const url = editingItinerary ? '/api/itineraries' : '/api/itineraries'
      const method = editingItinerary ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItinerary ? { ...payload, id: editingItinerary.id } : payload)
      })

      const data = await res.json()

      if (data.success) {
        alert(editingItinerary ? 'Itinerario actualizado' : 'Itinerario creado')
        loadItineraries()
        resetForm()
        setActiveTab('list')
      }
    } catch (error) {
      console.error('Error saving itinerary:', error)
      alert('Error al guardar itinerario')
    }
  }

  const handleDownloadPDF = async (itineraryId: number, title: string) => {
    try {
      const res = await fetch(`/api/itineraries/${itineraryId}/pdf`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Itinerario_${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error al descargar PDF')
    }
  }

  const handleShare = async (itineraryId: number) => {
    try {
      const res = await fetch(`/api/itineraries/${itineraryId}/share`, {
        method: 'POST'
      })

      const data = await res.json()

      if (data.success) {
        // Copiar link al portapapeles
        navigator.clipboard.writeText(data.share_url)
        alert(`Link copiado al portapapeles:\n${data.share_url}`)
      }
    } catch (error) {
      console.error('Error sharing itinerary:', error)
      alert('Error al compartir itinerario')
    }
  }

  const handleEdit = (itinerary: Itinerary) => {
    setEditingItinerary(itinerary)
    setFormData({
      title: itinerary.title,
      destination: itinerary.destination,
      description: itinerary.description || '',
      start_date: itinerary.start_date,
      end_date: itinerary.end_date,
      notes: itinerary.notes || '',
      recommendations: itinerary.recommendations || ''
    })
    setDays(itinerary.days || [])
    setActiveTab('form')
  }

  const resetForm = () => {
    setEditingItinerary(null)
    setFormData({
      title: '',
      destination: '',
      description: '',
      start_date: '',
      end_date: '',
      notes: '',
      recommendations: ''
    })
    setDays([{
      day: 1,
      date: '',
      title: 'Día 1',
      activities: [{
        time: '09:00',
        title: '',
        description: '',
        location: ''
      }]
    }])
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      draft: { label: 'Borrador', color: 'bg-gray-500' },
      active: { label: 'Activo', color: 'bg-green-500' },
      completed: { label: 'Completado', color: 'bg-blue-500' },
      cancelled: { label: 'Cancelado', color: 'bg-red-500' }
    }

    const variant = variants[status] || variants.draft
    return <Badge className={variant.color}>{variant.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando itinerarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <div>
              <h1 className="text-xl font-bold">Creador de Itinerarios</h1>
              <p className="text-sm text-muted-foreground">Planea viajes día por día</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Itinerarios ({itineraries.length})
            </TabsTrigger>
            <TabsTrigger value="form" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {editingItinerary ? 'Editar' : 'Nuevo Itinerario'}
            </TabsTrigger>
          </TabsList>

          {/* Lista */}
          <TabsContent value="list">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Todos los Itinerarios</h2>
                <Button onClick={() => { resetForm(); setActiveTab('form'); }} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Itinerario
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead>Días</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itineraries.map((itinerary) => (
                    <TableRow key={itinerary.id}>
                      <TableCell className="font-semibold">{itinerary.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {itinerary.destination}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(itinerary.start_date).toLocaleDateString()} -
                          {new Date(itinerary.end_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{itinerary.days?.length || 0} días</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(itinerary.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(itinerary)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPDF(itinerary.id, itinerary.title)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShare(itinerary.id)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            Compartir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {itineraries.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-muted-foreground">No hay itinerarios aún</p>
                  <Button onClick={() => setActiveTab('form')} className="mt-4">
                    Crear primer itinerario
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Formulario */}
          <TabsContent value="form">
            <div className="space-y-6">
              {/* Info general */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Información General</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Título del viaje *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Viaje a Cancún - 7 días"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Destino *</label>
                    <Input
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      placeholder="Cancún, Quintana Roo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Descripción</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Escapada al Caribe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha inicio *</label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha fin *</label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>
              </Card>

              {/* Días del itinerario */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Itinerario Día por Día</h3>
                  <Button onClick={handleAddDay} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Día
                  </Button>
                </div>

                <div className="space-y-6">
                  {days.map((day, dayIndex) => (
                    <div key={dayIndex} className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-white">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-1">Título del día</label>
                          <Input
                            value={day.title}
                            onChange={(e) => handleDayChange(dayIndex, 'title', e.target.value)}
                            placeholder="Llegada y check-in"
                            className="mb-2"
                          />
                          <label className="block text-xs font-medium mb-1">Fecha</label>
                          <Input
                            type="date"
                            value={day.date}
                            onChange={(e) => handleDayChange(dayIndex, 'date', e.target.value)}
                          />
                        </div>
                        <div className="ml-4">
                          <Badge className="bg-blue-600">Día {day.day}</Badge>
                          {days.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveDay(dayIndex)}
                              className="ml-2"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">Actividades</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddActivity(dayIndex)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Agregar actividad
                          </Button>
                        </div>

                        {day.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="bg-white border rounded p-4">
                            <div className="flex justify-between items-start mb-3">
                              <p className="text-xs font-medium text-gray-500">Actividad {actIndex + 1}</p>
                              {day.activities.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveActivity(dayIndex, actIndex)}
                                >
                                  <X className="w-3 h-3 text-red-500" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium mb-1">Hora</label>
                                <Input
                                  type="time"
                                  className="h-9"
                                  value={activity.time}
                                  onChange={(e) => handleActivityChange(dayIndex, actIndex, 'time', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">Ubicación</label>
                                <Input
                                  className="h-9"
                                  value={activity.location}
                                  onChange={(e) => handleActivityChange(dayIndex, actIndex, 'location', e.target.value)}
                                  placeholder="Aeropuerto, Hotel..."
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-medium mb-1">Título</label>
                                <Input
                                  className="h-9"
                                  value={activity.title}
                                  onChange={(e) => handleActivityChange(dayIndex, actIndex, 'title', e.target.value)}
                                  placeholder="Llegada al hotel"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-medium mb-1">Descripción</label>
                                <Textarea
                                  rows={2}
                                  value={activity.description}
                                  onChange={(e) => handleActivityChange(dayIndex, actIndex, 'description', e.target.value)}
                                  placeholder="Detalles de la actividad..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Notas y recomendaciones */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Notas y Recomendaciones</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Notas del viaje</label>
                    <Textarea
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Llevar protector solar, moneda local..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Recomendaciones</label>
                    <Textarea
                      rows={4}
                      value={formData.recommendations}
                      onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                      placeholder="Restaurantes, lugares para visitar..."
                    />
                  </div>
                </div>
              </Card>

              {/* Botones */}
              <div className="flex gap-4">
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-12"
                  disabled={!formData.title || !formData.destination || !formData.start_date || !formData.end_date}
                >
                  <Check className="w-5 h-5 mr-2" />
                  {editingItinerary ? 'Actualizar Itinerario' : 'Crear Itinerario'}
                </Button>
                <Button
                  onClick={() => { resetForm(); setActiveTab('list'); }}
                  variant="outline"
                  className="h-12"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
