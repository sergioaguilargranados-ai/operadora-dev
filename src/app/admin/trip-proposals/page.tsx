"use client"

import { useState, useEffect } from 'react'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, Filter, Calendar, MapPin, 
  Sparkles, Eye, MessageSquare, MoreVertical 
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Proposal {
  id: number
  folio: string
  traveler_name: string
  destination: string
  status: string
  start_date: string
  duration_nights: number
  budget_total: number
  budget_currency: string
  created_at: string
}

const statusConfig: Record<string, { label: string, color: string }> = {
  'capturing': { label: 'Capturando', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  'captured': { label: 'Listo p/ IA', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  'ai_pending': { label: 'IA Pensando', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  'ai_generated': { label: 'IA Generó', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  'in_review': { label: 'En Revisión', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  'completed': { label: 'Aprobado', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  'sent': { label: 'Enviado', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
}

export default function TripProposalsAdminPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      // Nota: Aquí usaríamos el endpoint que ya definimos en modo 'get_all'
      // Por ahora simularemos datos para ver el diseño
      const mockData: Proposal[] = [
        {
          id: 1,
          folio: 'AS-TRIP-0001',
          traveler_name: 'Sergio Aguilar',
          destination: 'Japón (Tokio, Kyoto)',
          status: 'ai_generated',
          start_date: '2026-10-15',
          duration_nights: 12,
          budget_total: 120000,
          budget_currency: 'MXN',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          folio: 'AS-TRIP-0002',
          traveler_name: 'Juan Pérez',
          destination: 'Europa Clásica',
          status: 'in_review',
          start_date: '2026-06-05',
          duration_nights: 15,
          budget_total: 8500,
          budget_currency: 'USD',
          created_at: new Date().toISOString()
        }
      ]
      setProposals(mockData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Diseñador de Viajes IA</h1>
          <p className="text-muted-foreground">Revisión de itinerarios y propuestas generadas por inteligencia artificial.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Configurar Prompt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="py-4">
            <CardDescription className="text-blue-600">Total Propuestas</CardDescription>
            <CardTitle className="text-2xl">42</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardHeader className="py-4">
            <CardDescription className="text-purple-600">Por Revisar</CardDescription>
            <CardTitle className="text-2xl">12</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-indigo-500/10 border-indigo-500/20">
          <CardHeader className="py-4">
            <CardDescription className="text-indigo-600">IA Generando</CardDescription>
            <CardTitle className="text-2xl">5</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="py-4">
            <CardDescription className="text-green-600">Enviadas hoy</CardDescription>
            <CardTitle className="text-2xl">8</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Solicitudes Recientes</CardTitle>
            <div className="relative w-64 text-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por folio o nombre..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Folio</TableHead>
                <TableHead>Pasajero</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Fechas/Duración</TableHead>
                <TableHead>Presupuesto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : proposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No se encontraron propuestas.
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-mono text-xs">{proposal.folio}</TableCell>
                    <TableCell>
                      <div className="font-medium">{proposal.traveler_name}</div>
                      <div className="text-xs text-muted-foreground">Hace 2 horas</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span className="text-sm">{proposal.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3 h-3" />
                        {proposal.start_date ? format(new Date(proposal.start_date), 'dd MMM yyyy', { locale: es }) : 'Por definir'}
                      </div>
                      <div className="text-xs text-muted-foreground ml-4.5">{proposal.duration_nights} noches</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: proposal.budget_currency }).format(proposal.budget_total)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusConfig[proposal.status]?.color} py-0 h-6`}>
                        {statusConfig[proposal.status]?.label || proposal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8">
                          <Eye className="w-4 h-4 mr-2" />
                          Revisar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
