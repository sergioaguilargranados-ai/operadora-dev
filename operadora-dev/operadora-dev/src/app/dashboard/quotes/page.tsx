"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { exportToExcel } from '@/utils/exportHelpers'
import {
  Plus, FileText, Send, Eye, Check, X, Trash2, Edit, ArrowLeft,
  DollarSign, Calendar, User, Mail, Phone, Building, Download, FileSpreadsheet
} from 'lucide-react'

interface Quote {
  id: number
  quote_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  title: string
  destination: string
  travel_start_date: string
  travel_end_date: string
  total: number
  currency: string
  status: string
  created_at: string
  items?: QuoteItem[]
}

interface QuoteItem {
  id?: number
  category: string
  item_name: string
  description: string
  quantity: number
  unit_price: number
  subtotal: number
  notes?: string
}

export default function QuotesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_company: '',
    title: '',
    destination: '',
    trip_type: 'package',
    travel_start_date: '',
    travel_end_date: '',
    valid_until: '',
    notes: '',
    terms_conditions: 'Precios sujetos a disponibilidad. Pago 50% anticipo, 50% 15 días antes del viaje.'
  })

  const [items, setItems] = useState<QuoteItem[]>([
    {
      category: 'flight',
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0
    }
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!user?.role || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
      router.push('/')
      return
    }

    loadQuotes()
  }, [isAuthenticated, user])

  const loadQuotes = async () => {
    try {
      const res = await fetch('/api/quotes')
      const data = await res.json()
      if (data.success) {
        setQuotes(data.data)
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    setItems([...items, {
      category: 'custom',
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0
    }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Calcular subtotal
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].subtotal = newItems[index].quantity * newItems[index].unit_price
    }

    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  }

  const handleSubmit = async () => {
    const total = calculateTotal()

    const payload = {
      ...formData,
      user_id: user?.id,
      created_by: user?.id,
      total,
      items
    }

    try {
      const url = editingQuote ? `/api/quotes` : '/api/quotes'
      const method = editingQuote ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingQuote ? { ...payload, id: editingQuote.id } : payload)
      })

      const data = await res.json()

      if (data.success) {
        alert(editingQuote ? 'Cotización actualizada' : 'Cotización creada')
        loadQuotes()
        resetForm()
        setActiveTab('list')
      }
    } catch (error) {
      console.error('Error saving quote:', error)
      alert('Error al guardar cotización')
    }
  }

  const handleDownloadPDF = async (quoteId: number, quoteNumber: string) => {
    try {
      const res = await fetch(`/api/quotes/${quoteId}/pdf`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Cotizacion_${quoteNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error al descargar PDF')
    }
  }

  const handleSendEmail = async (quoteId: number) => {
    if (!confirm('¿Enviar cotización por email al cliente?')) return

    try {
      const res = await fetch(`/api/quotes/${quoteId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customMessage: '' })
      })

      const data = await res.json()

      if (data.success) {
        alert(`Cotización enviada a ${data.sentTo}`)
        loadQuotes()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error al enviar email')
    }
  }

  const handleExportToExcel = () => {
    if (quotes.length === 0) {
      toast({
        variant: "destructive",
        title: "Sin datos",
        description: "No hay cotizaciones para exportar"
      })
      return
    }

    const data = quotes.map(quote => ({
      'Número': quote.quote_number,
      'Cliente': quote.customer_name,
      'Email': quote.customer_email,
      'Teléfono': quote.customer_phone || '-',
      'Título': quote.title,
      'Destino': quote.destination,
      'Fecha Inicio': quote.travel_start_date || '-',
      'Fecha Fin': quote.travel_end_date || '-',
      'Total': quote.total,
      'Moneda': quote.currency,
      'Estado': quote.status,
      'Creado': new Date(quote.created_at).toLocaleDateString('es-MX')
    }))

    const success = exportToExcel(data, `Cotizaciones_${Date.now()}`, 'Cotizaciones')

    if (success) {
      toast({
        title: "Exportado",
        description: `${quotes.length} cotizaciones exportadas a Excel`
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo exportar"
      })
    }
  }

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote)
    setFormData({
      customer_name: quote.customer_name,
      customer_email: quote.customer_email,
      customer_phone: quote.customer_phone || '',
      customer_company: '',
      title: quote.title,
      destination: quote.destination || '',
      trip_type: 'package',
      travel_start_date: quote.travel_start_date || '',
      travel_end_date: quote.travel_end_date || '',
      valid_until: '',
      notes: '',
      terms_conditions: 'Precios sujetos a disponibilidad.'
    })
    setItems(quote.items || [])
    setActiveTab('form')
  }

  const resetForm = () => {
    setEditingQuote(null)
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_company: '',
      title: '',
      destination: '',
      trip_type: 'package',
      travel_start_date: '',
      travel_end_date: '',
      valid_until: '',
      notes: '',
      terms_conditions: 'Precios sujetos a disponibilidad. Pago 50% anticipo.'
    })
    setItems([{
      category: 'flight',
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0
    }])
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      draft: { label: 'Borrador', color: 'bg-gray-500' },
      sent: { label: 'Enviada', color: 'bg-blue-500' },
      viewed: { label: 'Vista', color: 'bg-purple-500' },
      accepted: { label: 'Aceptada', color: 'bg-green-500' },
      rejected: { label: 'Rechazada', color: 'bg-red-500' },
      expired: { label: 'Expirada', color: 'bg-orange-500' }
    }

    const variant = variants[status] || variants.draft
    return <Badge className={variant.color}>{variant.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando cotizaciones...</p>
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
              <h1 className="text-xl font-bold">Gestión de Cotizaciones</h1>
              <p className="text-sm text-muted-foreground">Sistema de cotizaciones personalizadas</p>
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Cotizaciones ({quotes.length})
            </TabsTrigger>
            <TabsTrigger value="form" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {editingQuote ? 'Editar' : 'Nueva Cotización'}
            </TabsTrigger>
          </TabsList>

          {/* Lista de cotizaciones */}
          <TabsContent value="list">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Todas las Cotizaciones</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleExportToExcel}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Exportar Excel
                  </Button>
                  <Button onClick={() => { resetForm(); setActiveTab('form'); }} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cotización
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-mono font-semibold">{quote.quote_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{quote.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{quote.title}</TableCell>
                      <TableCell>{quote.destination}</TableCell>
                      <TableCell className="font-semibold">
                        ${quote.total.toLocaleString()} {quote.currency}
                      </TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell>
                        {new Date(quote.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(quote)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPDF(quote.id, quote.quote_number)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendEmail(quote.id)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Enviar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {quotes.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-muted-foreground">No hay cotizaciones aún</p>
                  <Button onClick={() => setActiveTab('form')} className="mt-4">
                    Crear primera cotización
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Formulario */}
          <TabsContent value="form">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulario principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Datos del cliente */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Datos del Cliente
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre completo *</label>
                      <Input
                        value={formData.customer_name}
                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                        placeholder="Juan Pérez García"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Empresa</label>
                      <Input
                        value={formData.customer_company}
                        onChange={(e) => setFormData({...formData, customer_company: e.target.value})}
                        placeholder="Empresa SA de CV"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                        placeholder="cliente@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Teléfono</label>
                      <Input
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                        placeholder="+52 55 1234 5678"
                      />
                    </div>
                  </div>
                </Card>

                {/* Detalles del viaje */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Detalles del Viaje
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">Título de la cotización *</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Paquete Cancún Todo Incluido"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Destino</label>
                      <Input
                        value={formData.destination}
                        onChange={(e) => setFormData({...formData, destination: e.target.value})}
                        placeholder="Cancún, Q.Roo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de viaje</label>
                      <select
                        className="w-full h-10 px-3 border rounded-md"
                        value={formData.trip_type}
                        onChange={(e) => setFormData({...formData, trip_type: e.target.value})}
                      >
                        <option value="flight">Solo vuelo</option>
                        <option value="hotel">Solo hotel</option>
                        <option value="package">Paquete completo</option>
                        <option value="custom">Personalizado</option>
                        <option value="mixed">Mixto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Fecha de inicio</label>
                      <Input
                        type="date"
                        value={formData.travel_start_date}
                        onChange={(e) => setFormData({...formData, travel_start_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Fecha de fin</label>
                      <Input
                        type="date"
                        value={formData.travel_end_date}
                        onChange={(e) => setFormData({...formData, travel_end_date: e.target.value})}
                      />
                    </div>
                  </div>
                </Card>

                {/* Items / Rubros */}
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Conceptos / Servicios
                    </h3>
                    <Button onClick={handleAddItem} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-gray-500">Item {index + 1}</span>
                          {items.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Categoría</label>
                            <select
                              className="w-full h-9 px-2 border rounded text-sm"
                              value={item.category}
                              onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                            >
                              <option value="flight">Vuelo</option>
                              <option value="hotel">Hotel</option>
                              <option value="transfer">Traslado</option>
                              <option value="activity">Actividad/Tour</option>
                              <option value="insurance">Seguro</option>
                              <option value="custom">Personalizado</option>
                              <option value="other">Otro</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Nombre del servicio *</label>
                            <Input
                              className="h-9 text-sm"
                              value={item.item_name}
                              onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                              placeholder="Ej: Vuelos redondo MEX-CUN"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium mb-1">Descripción</label>
                            <Input
                              className="h-9 text-sm"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              placeholder="Detalles del servicio..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Cantidad</label>
                            <Input
                              type="number"
                              className="h-9 text-sm"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Precio unitario</label>
                            <Input
                              type="number"
                              className="h-9 text-sm"
                              value={item.unit_price}
                              onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="col-span-2">
                            <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
                              <span className="text-sm font-medium">Subtotal: </span>
                              <span className="text-lg font-bold text-blue-600">
                                ${(item.subtotal || 0).toLocaleString()} MXN
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Botones de acción */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-12"
                    disabled={!formData.customer_name || !formData.customer_email || !formData.title}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    {editingQuote ? 'Actualizar Cotización' : 'Crear Cotización'}
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

              {/* Preview */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-24">
                  <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>

                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Cliente</p>
                      <p className="font-semibold">{formData.customer_name || '-'}</p>
                      <p className="text-xs">{formData.customer_email || '-'}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Viaje</p>
                      <p className="font-semibold">{formData.title || '-'}</p>
                      <p className="text-xs">{formData.destination || '-'}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Items</p>
                      <p className="font-semibold">{items.length} conceptos</p>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">${calculateTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">IVA (0%)</span>
                        <span className="font-semibold">$0</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between items-center">
                        <span className="font-bold">TOTAL</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${calculateTotal().toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">MXN</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
