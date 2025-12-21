'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { exportToExcel } from '@/utils/exportHelpers'

interface AuditLog {
  id: number
  user_id: number | null
  user_name: string | null
  user_email: string | null
  action: string
  resource_type: string
  resource_id: string
  ip_address: string
  user_agent: string
  details: any
  created_at: string
}

export default function AuditLogsPage() {
  const { toast } = useToast()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filterAction, setFilterAction] = useState('all')
  const [filterResourceType, setFilterResourceType] = useState('all')
  const [filterSearch, setFilterSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    fetchLogs()
  }, [filterAction, filterResourceType, startDate, endDate, currentPage])

  const fetchLogs = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        tenantId: '1', // TODO: Get from auth context
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString()
      })

      if (filterAction !== 'all') params.append('action', filterAction)
      if (filterResourceType !== 'all') params.append('resourceType', filterResourceType)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const res = await fetch(`/api/audit-logs?${params}`)
      if (!res.ok) throw new Error('Error al cargar logs')

      const data = await res.json()
      setLogs(data.data || [])
      setTotalPages(Math.ceil(data.total / itemsPerPage))

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportToExcel = () => {
    const data = filteredLogs.map(log => ({
      'ID': log.id,
      'Usuario': log.user_name || 'Sistema',
      'Email': log.user_email || '-',
      'Acción': log.action,
      'Tipo': log.resource_type,
      'Recurso ID': log.resource_id,
      'IP': log.ip_address,
      'Fecha': new Date(log.created_at).toLocaleString('es-MX'),
      'Detalles': log.details ? JSON.stringify(log.details) : '-'
    }))

    const success = exportToExcel(data, `AuditLogs_${Date.now()}`, 'Logs')

    if (success) {
      toast({
        title: 'Exportado',
        description: `${filteredLogs.length} logs exportados a Excel`
      })
    } else {
      toast({
        title: 'Error',
        description: 'No se pudo exportar',
        variant: 'destructive'
      })
    }
  }

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      view: 'outline',
      create: 'default',
      update: 'secondary',
      delete: 'destructive',
      download: 'outline',
      share: 'secondary',
      login: 'default',
      logout: 'outline'
    }

    const icons: Record<string, string> = {
      view: '👁️',
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      download: '⬇️',
      share: '🔗',
      login: '🔓',
      logout: '🔒'
    }

    return (
      <Badge variant={variants[action] || 'secondary'}>
        {icons[action]} {action.toUpperCase()}
      </Badge>
    )
  }

  const getResourceBadge = (type: string) => {
    const icons: Record<string, string> = {
      document: '📄',
      payment: '💳',
      booking: '✈️',
      user: '👤',
      tenant: '🏢',
      policy: '📋'
    }

    return (
      <span className="flex items-center gap-1">
        <span>{icons[type] || '📦'}</span>
        <span className="capitalize">{type}</span>
      </span>
    )
  }

  const filteredLogs = logs.filter(log => {
    if (!filterSearch) return true

    const searchLower = filterSearch.toLowerCase()
    return (
      (log.user_name && log.user_name.toLowerCase().includes(searchLower)) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchLower)) ||
      log.resource_id.toLowerCase().includes(searchLower) ||
      log.ip_address.includes(searchLower)
    )
  })

  if (loading && logs.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando logs de auditoría...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Logs de Auditoría</h1>
        <p className="text-gray-600">Registro de acceso a datos sensibles y acciones del sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Eventos</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Accesos Hoy</p>
              <p className="text-2xl font-bold">
                {logs.filter(l => {
                  const logDate = new Date(l.created_at)
                  const today = new Date()
                  return logDate.toDateString() === today.toDateString()
                }).length}
              </p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Usuarios Únicos</p>
              <p className="text-2xl font-bold">
                {new Set(logs.map(l => l.user_id).filter(Boolean)).size}
              </p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Eliminaciones</p>
              <p className="text-2xl font-bold text-red-600">
                {logs.filter(l => l.action === 'delete').length}
              </p>
            </div>
            <div className="text-3xl">🗑️</div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Buscar por usuario, email, IP..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />

          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <SelectValue placeholder="Acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las acciones</SelectItem>
              <SelectItem value="view">Ver</SelectItem>
              <SelectItem value="create">Crear</SelectItem>
              <SelectItem value="update">Actualizar</SelectItem>
              <SelectItem value="delete">Eliminar</SelectItem>
              <SelectItem value="download">Descargar</SelectItem>
              <SelectItem value="share">Compartir</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterResourceType} onValueChange={setFilterResourceType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Recurso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="document">Documento</SelectItem>
              <SelectItem value="payment">Pago</SelectItem>
              <SelectItem value="booking">Reserva</SelectItem>
              <SelectItem value="user">Usuario</SelectItem>
              <SelectItem value="tenant">Tenant</SelectItem>
              <SelectItem value="policy">Política</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Fecha inicio"
          />

          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Fecha fin"
          />
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              setFilterAction('all')
              setFilterResourceType('all')
              setFilterSearch('')
              setStartDate('')
              setEndDate('')
            }}
            variant="outline"
          >
            Limpiar filtros
          </Button>

          <Button onClick={handleExportToExcel} variant="outline">
            📊 Exportar a Excel
          </Button>
        </div>
      </Card>

      {/* Tabla de logs */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Recurso ID</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No se encontraron logs de auditoría
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.user_name || 'Sistema'}</p>
                        <p className="text-xs text-gray-500">{log.user_email || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell>
                      {getResourceBadge(log.resource_type)}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.resource_id.substring(0, 20)}
                        {log.resource_id.length > 20 && '...'}
                      </code>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.ip_address}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <p className="text-gray-600">
                          {new Date(log.created_at).toLocaleDateString('es-MX')}
                        </p>
                        <p className="text-gray-500">
                          {new Date(log.created_at).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.details && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: 'Detalles del log',
                              description: (
                                <pre className="text-xs overflow-auto max-h-60">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              )
                            })
                          }}
                        >
                          Ver
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
