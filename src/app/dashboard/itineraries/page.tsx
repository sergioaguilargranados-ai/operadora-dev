'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/PageHeader'
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

interface Place { name: string; description: string; image: string }
interface Food { name: string; description: string; image: string }
interface Souvenir { name: string; description: string; image: string }
interface Phrase { es: string; local: string }

interface Day {
  day: number
  date: string
  title: string
  description?: string
  hero_image?: string
  activities: Activity[]
  foods?: Food[]
  places?: Place[]
  souvenirs?: Souvenir[]
  phrases?: Phrase[]
}

interface Itinerary {
  id: number
  title: string
  destination: string
  description: string
  start_date: string
  end_date: string
  tour_id?: string
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
    tour_id: '',
    notes: '',
    recommendations: ''
  })

  const [days, setDays] = useState<Day[]>([
    {
      day: 1,
      date: '',
      title: 'Día 1',
      description: '',
      hero_image: '',
      activities: [{
        time: '09:00',
        title: '',
        description: '',
        location: ''
      }],
      foods: [],
      places: [],
      souvenirs: [],
      phrases: []
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
      const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role || '')
      const url = isAdmin ? '/api/itineraries' : `/api/itineraries?userId=${user?.id}`
      const res = await fetch(url)
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
      description: '',
      hero_image: '',
      activities: [{
        time: '09:00',
        title: '',
        description: '',
        location: ''
      }],
      foods: [],
      places: [],
      souvenirs: [],
      phrases: []
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

  const handleAddListItem = (dayIndex: number, listName: 'foods'|'places'|'souvenirs'|'phrases', emptyItem: any) => {
    const newDays = [...days]
    const list = newDays[dayIndex][listName] || []
    newDays[dayIndex][listName] = [...list, emptyItem] as any
    setDays(newDays)
  }

  const handleRemoveListItem = (dayIndex: number, listName: 'foods'|'places'|'souvenirs'|'phrases', itemIndex: number) => {
    const newDays = [...days]
    const list = newDays[dayIndex][listName] || []
    newDays[dayIndex][listName] = list.filter((_, i) => i !== itemIndex) as any
    setDays(newDays)
  }

  const handleListItemChange = (dayIndex: number, listName: 'foods'|'places'|'souvenirs'|'phrases', itemIndex: number, field: string, value: string) => {
    const newDays = [...days]
    const list = [...(newDays[dayIndex][listName] || [])]
    list[itemIndex] = { ...list[itemIndex] as any, [field]: value }
    newDays[dayIndex][listName] = list as any
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
      tour_id: itinerary.tour_id || '',
      notes: itinerary.notes || '',
      recommendations: itinerary.recommendations || ''
    })
    setDays((itinerary.days || []).map(day => ({
      ...day,
      activities: day.activities || [],
      foods: day.foods || [],
      places: day.places || [],
      souvenirs: day.souvenirs || [],
      phrases: day.phrases || []
    })))
    setActiveTab('form')
  }

  const handleSyncTour = async () => {
    if (!formData.tour_id) {
      alert('Ingresa una Clave de Tour para sincronizar (Ej. MT-1234 o AS-1234)')
      return
    }
    setLoading(true)

    try {
      const res = await fetch(`/api/groups/${formData.tour_id}`)
      const data = await res.json()

      if (!data.success || !data.data) {
        alert('No se encontró el tour en la base de datos local. Verifica la clave e intenta de nuevo.')
        setLoading(false)
        return
      }

      const pkg = data.data

      setFormData(prev => ({
        ...prev,
        title: pkg.name || prev.title,
        destination: pkg.region || prev.destination,
        description: pkg.description || prev.description,
        end_date: (prev.start_date && pkg.days)
          ? new Date(new Date(prev.start_date).getTime() + (pkg.days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : prev.end_date
      }))

      if (pkg.itinerary && pkg.itinerary.length > 0) {
        const baseStartDate = formData.start_date ? new Date(formData.start_date) : new Date()

        const generatedDays = pkg.itinerary.map((dayItem: any, index: number) => {
          const currentDate = new Date(baseStartDate)
          currentDate.setUTCDate(currentDate.getUTCDate() + index)

          return {
            day: dayItem.day || index + 1,
            date: currentDate.toISOString().split('T')[0],
            title: dayItem.title || `Día ${index + 1}`,
            description: dayItem.description || '',
            hero_image: '',
            activities: [{
              time: '09:00',
              title: dayItem.title || 'Actividad programada',
              description: dayItem.description?.substring(0, 100) + '...' || '',
              location: ''
            }],
            foods: [],
            places: [],
            souvenirs: [],
            phrases: []
          }
        })

        setDays(generatedDays)
      } else {
        alert('El tour existe, pero no tiene un itinerario cargado en la base de datos.')
      }

      alert(`Sincronización exitosa desde la Base de Datos. Se cargaron ${pkg.itinerary?.length || 0} días del tour: ${pkg.name}`)
    } catch (error) {
      console.error('Error syncing tour:', error)
      alert('Hubo un error de conexión al intentar sincronizar el tour.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingItinerary(null)
    setFormData({
      title: '',
      destination: '',
      description: '',
      start_date: '',
      end_date: '',
      tour_id: '',
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
      <PageHeader showBackButton={true} backButtonHref="/dashboard" />

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
                  <div className="col-span-2 flex gap-4 items-end bg-blue-50 p-4 rounded-lg mb-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2 text-blue-900">Clave de Tour MegaTravel (Opcional)</label>
                      <Input
                        value={formData.tour_id}
                        onChange={(e) => setFormData({...formData, tour_id: e.target.value})}
                        placeholder="Ej. MT-1234"
                        className="bg-white border-blue-200"
                      />
                    </div>
                    <Button onClick={handleSyncTour} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm whitespace-nowrap" disabled={loading}>
                      {loading ? 'Sincronizando...' : 'Sincronizar Itinerario'}
                    </Button>
                  </div>
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

                        {(day.activities || []).map((activity, actIndex) => (
                          <div key={actIndex} className="bg-white border rounded p-4">
                            <div className="flex justify-between items-start mb-3">
                              <p className="text-xs font-medium text-gray-500">Actividad {actIndex + 1}</p>
                              {(day.activities?.length || 0) > 1 && (
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

                      {/* Nuevas secciones de detalles (Gastronomía, Multimedia, etc) */}
                      <div className="mt-4 border-t pt-4">
                        <label className="block text-xs font-medium mb-1">Imagen Principal del Día (URL)</label>
                        <Input
                          className="h-9 mb-4"
                          value={day.hero_image || ''}
                          onChange={(e) => handleDayChange(dayIndex, 'hero_image', e.target.value)}
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Gastronomía */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium">Gastronomía</p>
                              <Button size="sm" variant="outline" onClick={() => handleAddListItem(dayIndex, 'foods', { name: '', description: '', image: '' })}>
                                <Plus className="w-3 h-3 mr-1" /> Agregar
                              </Button>
                            </div>
                            {(day.foods || []).map((item, idx) => (
                              <div key={idx} className="bg-white border rounded p-3 mb-2 grid grid-cols-2 gap-2">
                                <div className="col-span-2 flex justify-between items-center">
                                  <span className="text-xs font-bold text-gray-500">Platillo {idx + 1}</span>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleRemoveListItem(dayIndex, 'foods', idx)}><X className="w-3 h-3 text-red-500" /></Button>
                                </div>
                                <Input className="h-8 text-xs" placeholder="Nombre" value={item.name} onChange={(e) => handleListItemChange(dayIndex, 'foods', idx, 'name', e.target.value)} />
                                <Input className="h-8 text-xs" placeholder="URL Imagen" value={item.image} onChange={(e) => handleListItemChange(dayIndex, 'foods', idx, 'image', e.target.value)} />
                                <Textarea className="col-span-2 text-xs" rows={2} placeholder="Descripción" value={item.description} onChange={(e) => handleListItemChange(dayIndex, 'foods', idx, 'description', e.target.value)} />
                              </div>
                            ))}
                          </div>

                          {/* Lugares */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium">Lugares</p>
                              <Button size="sm" variant="outline" onClick={() => handleAddListItem(dayIndex, 'places', { name: '', description: '', image: '' })}>
                                <Plus className="w-3 h-3 mr-1" /> Agregar
                              </Button>
                            </div>
                            {(day.places || []).map((item, idx) => (
                              <div key={idx} className="bg-white border rounded p-3 mb-2 grid grid-cols-2 gap-2">
                                <div className="col-span-2 flex justify-between items-center">
                                  <span className="text-xs font-bold text-gray-500">Lugar {idx + 1}</span>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleRemoveListItem(dayIndex, 'places', idx)}><X className="w-3 h-3 text-red-500" /></Button>
                                </div>
                                <Input className="h-8 text-xs" placeholder="Nombre" value={item.name} onChange={(e) => handleListItemChange(dayIndex, 'places', idx, 'name', e.target.value)} />
                                <Input className="h-8 text-xs" placeholder="URL Imagen" value={item.image} onChange={(e) => handleListItemChange(dayIndex, 'places', idx, 'image', e.target.value)} />
                                <Textarea className="col-span-2 text-xs" rows={2} placeholder="Descripción" value={item.description} onChange={(e) => handleListItemChange(dayIndex, 'places', idx, 'description', e.target.value)} />
                              </div>
                            ))}
                          </div>

                          {/* Souvenirs */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium">Souvenirs</p>
                              <Button size="sm" variant="outline" onClick={() => handleAddListItem(dayIndex, 'souvenirs', { name: '', description: '', image: '' })}>
                                <Plus className="w-3 h-3 mr-1" /> Agregar
                              </Button>
                            </div>
                            {(day.souvenirs || []).map((item, idx) => (
                              <div key={idx} className="bg-white border rounded p-3 mb-2 grid grid-cols-2 gap-2">
                                <div className="col-span-2 flex justify-between items-center">
                                  <span className="text-xs font-bold text-gray-500">Souvenir {idx + 1}</span>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleRemoveListItem(dayIndex, 'souvenirs', idx)}><X className="w-3 h-3 text-red-500" /></Button>
                                </div>
                                <Input className="h-8 text-xs" placeholder="Nombre" value={item.name} onChange={(e) => handleListItemChange(dayIndex, 'souvenirs', idx, 'name', e.target.value)} />
                                <Input className="h-8 text-xs" placeholder="URL Imagen" value={item.image} onChange={(e) => handleListItemChange(dayIndex, 'souvenirs', idx, 'image', e.target.value)} />
                                <Textarea className="col-span-2 text-xs" rows={2} placeholder="Descripción" value={item.description} onChange={(e) => handleListItemChange(dayIndex, 'souvenirs', idx, 'description', e.target.value)} />
                              </div>
                            ))}
                          </div>

                          {/* Frases */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium">Frases Locales</p>
                              <Button size="sm" variant="outline" onClick={() => handleAddListItem(dayIndex, 'phrases', { es: '', local: '' })}>
                                <Plus className="w-3 h-3 mr-1" /> Agregar
                              </Button>
                            </div>
                            {(day.phrases || []).map((item, idx) => (
                              <div key={idx} className="bg-white border rounded p-3 mb-2 grid grid-cols-2 gap-2">
                                <div className="col-span-2 flex justify-between items-center">
                                  <span className="text-xs font-bold text-gray-500">Frase {idx + 1}</span>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleRemoveListItem(dayIndex, 'phrases', idx)}><X className="w-3 h-3 text-red-500" /></Button>
                                </div>
                                <Input className="h-8 text-xs" placeholder="Español (Ej: Gracias)" value={item.es} onChange={(e) => handleListItemChange(dayIndex, 'phrases', idx, 'es', e.target.value)} />
                                <Input className="h-8 text-xs" placeholder="Local (Ej: Merci)" value={item.local} onChange={(e) => handleListItemChange(dayIndex, 'phrases', idx, 'local', e.target.value)} />
                              </div>
                            ))}
                          </div>
                        </div>
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
