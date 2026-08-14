'use client'

import React, { Suspense, useState } from 'react'
import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'

import {
  Users, FileText, BarChart3, CheckSquare, Settings, CreditCard,
  Plus, Download, Check, X, UploadCloud, Receipt, Building, Building2, Plane, Car, Train, MapPin, Activity, CalendarDays, Wallet, TrendingUp
} from 'lucide-react'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

// Colores para las gráficas
const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']
const CHART_COLORS_GASTOS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b']
const CHART_COLORS_POLITICA = ['#10b981', '#f59e0b', '#ef4444']

function TabResumen() {
  const chartData = [
    { name: 'Vuelos', value: 48 },
    { name: 'Hoteles', value: 28 },
    { name: 'Paquetes', value: 12 },
    { name: 'Autos', value: 7 },
    { name: 'Trenes', value: 3 },
    { name: 'Cruceros', value: 2 },
  ]

  const topDestinations = [
    { name: 'Cancún', value: 48 },
    { name: 'Orlando', value: 36 },
    { name: 'Madrid', value: 28 },
    { name: 'París', value: 25 },
    { name: 'Riviera Maya', value: 18 },
  ]

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">420</div>
            <p className="text-xs text-muted-foreground">+18 este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Activas</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">En curso o próximas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos (Anual)</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,845,900 MXN</div>
            <p className="text-xs text-muted-foreground">$245k este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahorros</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$428,000 MXN</div>
            <p className="text-xs text-muted-foreground">15.1% de ahorro promedio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tipo de reserva</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs">
              {chartData.map((entry, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[idx] }} />
                  {entry.name} ({entry.value}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Destinos */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Destinos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDestinations.map((dest, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>#{i+1} {dest.name}</span>
                    <span className="text-muted-foreground">{dest.value} viajes</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${dest.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              {[
                { icon: Plane, title: 'Vuelo reservado', desc: 'Ana López - CDMX a Madrid', time: 'Hace 2 horas' },
                { icon: Building, title: 'Hotel aprobado', desc: 'Carlos Ruiz - Marriott Cancún', time: 'Hace 5 horas' },
                { icon: CheckSquare, title: 'Política actualizada', desc: 'Límite de vuelo nacional ajustado', time: 'Ayer' },
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-full">
                    <act.icon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium">{act.title}</p>
                    <p className="text-muted-foreground text-xs">{act.desc}</p>
                    <p className="text-xs text-slate-400 mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Viajes Próximos */}
      <Card>
        <CardHeader>
          <CardTitle>Viajes Próximos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Juan Pérez</TableCell>
                <TableCell>Monterrey, MX</TableCell>
                <TableCell>15 Ago - 18 Ago 2026</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmado</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">María Gómez</TableCell>
                <TableCell>Bogotá, CO</TableCell>
                <TableCell>22 Ago - 25 Ago 2026</TableCell>
                <TableCell><Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente Aprob.</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function TabEmpleados() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Directorio de Empleados</h2>
          <p className="text-sm text-muted-foreground">Gestiona los perfiles de viajeros y sus políticas asignadas.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Agregar empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agregar Empleado</DialogTitle>
              <DialogDescription>Añade un empleado manualmente o importa un archivo CSV/XLSX.</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="manual" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="import">Importar CSV/XLSX</TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label>Nombre completo</Label>
                  <Input placeholder="Ej. Ana Martínez" />
                </div>
                <div className="grid gap-2">
                  <Label>Correo electrónico</Label>
                  <Input type="email" placeholder="ana@empresa.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Departamento</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ventas">Ventas</SelectItem>
                        <SelectItem value="ti">Tecnología</SelectItem>
                        <SelectItem value="rh">Recursos Humanos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Rol (Política)</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="director">Director</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem>
                        <SelectItem value="ejecutivo">Ejecutivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-2">Guardar empleado</Button>
              </TabsContent>
              <TabsContent value="import" className="pt-4">
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <UploadCloud className="h-10 w-10 text-slate-400 mb-4" />
                  <p className="font-medium">Arrastra y suelta tu archivo aquí</p>
                  <p className="text-xs text-muted-foreground mt-1">Soporta .csv, .xlsx, .xls</p>
                  <Button variant="outline" className="mt-4">Examinar archivo</Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: '420' },
          { label: 'Activos', value: '396' },
          { label: 'Viajeros frecuentes', value: '128' },
          { label: 'Inactivos', value: '24' },
        ].map((kpi, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
              <span className="text-2xl font-bold mt-1">{kpi.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Rol / Política</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Último Viaje</TableHead>
              <TableHead>Total Viajes</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { id: 'EMP-001', name: 'Ana Martínez', email: 'ana.m@empresa.com', depto: 'Ventas', role: 'Gerente', active: true, last: '12 Jul 2026', total: 14 },
              { id: 'EMP-002', name: 'Carlos Ruiz', email: 'carlos.r@empresa.com', depto: 'Tecnología', role: 'Ejecutivo', active: true, last: '03 Ago 2026', total: 5 },
              { id: 'EMP-003', name: 'Sofía Reyes', email: 'sofia.r@empresa.com', depto: 'Marketing', role: 'Director', active: false, last: '15 Ene 2026', total: 32 },
            ].map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="text-xs text-muted-foreground">{emp.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{emp.name}</div>
                  <div className="text-xs text-muted-foreground">{emp.email}</div>
                </TableCell>
                <TableCell>{emp.depto}</TableCell>
                <TableCell><Badge variant="outline">{emp.role}</Badge></TableCell>
                <TableCell>
                  {emp.active ? (
                    <Badge className="bg-green-100 text-green-800 border-none hover:bg-green-200">Activo</Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-800 border-none hover:bg-slate-200">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">{emp.last}</TableCell>
                <TableCell>{emp.total}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 text-blue-600">Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function TabGastos() {
  const lineData = [
    { date: '1 Ago', amount: 15000 },
    { date: '5 Ago', amount: 45000 },
    { date: '10 Ago', amount: 28000 },
    { date: '15 Ago', amount: 80000 },
    { date: '20 Ago', amount: 35000 },
    { date: '25 Ago', amount: 62000 },
  ]

  const pieGastos = [
    { name: 'Hoteles', value: 54.9 },
    { name: 'Vuelos', value: 30.6 },
    { name: 'Alimentos', value: 6.8 },
    { name: 'Transporte', value: 4.1 },
    { name: 'Otros', value: 3.6 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Reporte de Gastos</h2>
          <p className="text-sm text-muted-foreground">Analiza los gastos corporativos y descárgalos para contabilidad.</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" /> Exportar reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Gasto por viaje (Prom)', value: '$1,248,560 MXN' },
          { label: 'Gasto por día', value: '$41,618 MXN' },
          { label: 'Gasto hoteles', value: '$685,420 MXN' },
          { label: 'Gasto vuelos', value: '$382,210 MXN' },
        ].map((kpi, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
              <span className="text-lg font-bold mt-1">{kpi.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Gasto por día (Agosto)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <RechartsTooltip formatter={(val) => [`$${val} MXN`, 'Gasto']} />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Gasto por categoría</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieGastos} innerRadius={60} outerRadius={80} dataKey="value">
                  {pieGastos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS_GASTOS[index % CHART_COLORS_GASTOS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(val) => [`${val}%`, 'Porcentaje']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 mt-2 text-xs px-4">
              {pieGastos.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CHART_COLORS_GASTOS[idx] }} />
                    <span>{entry.name}</span>
                  </div>
                  <span className="font-medium">{entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { id: 'EXP-1042', date: '01 Ago 2026', emp: 'Ana Martínez', cat: 'Vuelos', prov: 'Aeroméxico', amount: '$4,500.00', status: 'Aprobado' },
              { id: 'EXP-1043', date: '02 Ago 2026', emp: 'Carlos Ruiz', cat: 'Hoteles', prov: 'Marriott', amount: '$12,450.00', status: 'Pendiente' },
              { id: 'EXP-1044', date: '02 Ago 2026', emp: 'Juan Pérez', cat: 'Alimentos', prov: 'Restaurante X', amount: '$850.00', status: 'Rechazado' },
            ].map((exp) => (
              <TableRow key={exp.id}>
                <TableCell className="text-xs">{exp.id}</TableCell>
                <TableCell>{exp.date}</TableCell>
                <TableCell>{exp.emp}</TableCell>
                <TableCell><Badge variant="outline">{exp.cat}</Badge></TableCell>
                <TableCell>{exp.prov}</TableCell>
                <TableCell className="font-medium">{exp.amount}</TableCell>
                <TableCell>
                  {exp.status === 'Aprobado' && <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aprobado</Badge>}
                  {exp.status === 'Pendiente' && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>}
                  {exp.status === 'Rechazado' && <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rechazado</Badge>}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" title="Ver recibo"><Receipt className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function TabMetricas() {
  const complianceData = [
    { name: 'Cumple Política', value: 78 },
    { name: 'Excepción Aprobada', value: 15 },
    { name: 'No Cumple', value: 7 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Vuelos', avg: '$5,842', icon: Plane },
          { title: 'Hoteles', avg: '$1,890', icon: Building },
          { title: 'Autos', avg: '$1,250', icon: Car },
          { title: 'Trenes', avg: '$1,180', icon: Train },
        ].map((metric, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.title} (Avg)</p>
                <p className="text-xl font-bold mt-1">{metric.avg}</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <metric.icon className="h-5 w-5 text-slate-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Emisiones CO2</CardTitle>
              <CardDescription>Huella de carbono del periodo actual</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configuración CO2</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label>Estándar de medición</Label>
                    <Select defaultValue="defra">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="defra">DEFRA 2024</SelectItem>
                        <SelectItem value="ghg">GHG Protocol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex flex-col"><span className="font-medium">Alcance 1 & 2</span><span className="text-xs text-muted-foreground font-normal">Emisiones directas</span></Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex flex-col"><span className="font-medium">Alcance 3</span><span className="text-xs text-muted-foreground font-normal">Cadena de valor (Viajes)</span></Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="grid gap-2">
                    <Label>Frecuencia de reporte</Label>
                    <Select defaultValue="anual">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensual">Mensual</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-slate-800">12.45 <span className="text-xl text-muted-foreground font-normal">toneladas</span></div>
              <p className="text-sm text-green-600 mt-2 font-medium">Costo estimado offset: $312.45 MXN</p>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Vuelos (60%)</span>
                  <span>7.47 t</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-slate-800 h-2 rounded-full" style={{ width: '60%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tren (30%)</span>
                  <span>3.73 t</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-slate-600 h-2 rounded-full" style={{ width: '30%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Autos (10%)</span>
                  <span>1.25 t</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-slate-400 h-2 rounded-full" style={{ width: '10%' }} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumplimiento de Política</CardTitle>
            <CardDescription>78% de adopción este mes</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complianceData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS_POLITICA[index % CHART_COLORS_POLITICA.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-6 pb-6 flex flex-col gap-2">
            {complianceData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CHART_COLORS_POLITICA[idx] }} />
                  {entry.name}
                </div>
                <span className="font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function TabAprobaciones() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Solicitudes', value: '42' },
          { label: 'Pendientes', value: '8', color: 'text-yellow-600' },
          { label: 'Aprobadas', value: '30', color: 'text-green-600' },
          { label: 'Rechazadas', value: '4', color: 'text-red-600' },
        ].map((kpi, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
              <span className={`text-2xl font-bold mt-1 ${kpi.color || ''}`}>{kpi.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="reservaciones" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="reservaciones">Reservaciones (5)</TabsTrigger>
          <TabsTrigger value="propuestas">Propuestas de Viaje (3)</TabsTrigger>
        </TabsList>
        <TabsContent value="reservaciones">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Motivo Excepción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs">REQ-294</TableCell>
                  <TableCell className="font-medium">Juan Pérez</TableCell>
                  <TableCell><Badge variant="outline">Hotel</Badge></TableCell>
                  <TableCell className="text-sm">Marriott Cancún • 3 noches</TableCell>
                  <TableCell>$4,500 MXN</TableCell>
                  <TableCell className="text-sm text-red-600 font-medium">Supera límite por $1,000</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" className="text-green-700 border-green-200 hover:bg-green-50"><Check className="h-4 w-4 mr-1" /> Aprobar</Button>
                    <Button size="sm" variant="outline" className="text-red-700 border-red-200 hover:bg-red-50"><X className="h-4 w-4 mr-1" /> Rechazar</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="propuestas">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No hay propuestas de viaje pendientes de aprobación.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TabPoliticas() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Configuración de Políticas de Viaje</h2>
          <p className="text-sm text-muted-foreground">Establece límites y reglas por categoría para el rol "General".</p>
        </div>
        <Select defaultValue="general">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="director">Director</SelectItem>
            <SelectItem value="gerente">Gerente</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vuelos */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Plane className="h-5 w-5 text-blue-600" />
            <CardTitle>Política de Vuelos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Máximo gasto por tramo (MXN)</Label>
              <Input type="number" defaultValue={15000} />
            </div>
            <div className="grid gap-2">
              <Label>Clase permitida</Label>
              <Select defaultValue="eco">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="eco">Económica</SelectItem>
                  <SelectItem value="premium">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Días anticipación (Min)</Label>
                <Input type="number" defaultValue={3} />
              </div>
              <div className="grid gap-2">
                <Label>Días anticipación (Max)</Label>
                <Input type="number" defaultValue={90} />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="luggage" defaultChecked />
              <Label htmlFor="luggage" className="font-normal">Permitir maleta documentada por defecto</Label>
            </div>
            <Button className="w-full mt-2">Guardar política de vuelos</Button>
          </CardContent>
        </Card>

        {/* Hoteles */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <CardTitle>Política de Hoteles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Máximo gasto por noche (MXN)</Label>
              <Input type="number" defaultValue={3500} />
            </div>
            <div className="grid gap-2">
              <Label>Estrellas máximas</Label>
              <Select defaultValue="4">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Estrellas</SelectItem>
                  <SelectItem value="4">4 Estrellas</SelectItem>
                  <SelectItem value="5">5 Estrellas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tipo de habitación</Label>
              <Select defaultValue="std">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="std">Estándar</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="cancel" defaultChecked />
              <Label htmlFor="cancel" className="font-normal">Exigir políticas de cancelación gratis (24h)</Label>
            </div>
            <Button className="w-full mt-2">Guardar política de hoteles</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TabMetodosPago() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold">Métodos de Pago Corporativos</h2>
        <p className="text-sm text-muted-foreground">Configura las tarjetas centralizadas para cargos automáticos de reservas aprobadas.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="border-2 border-blue-600 bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer">
          <input type="radio" name="paymentType" className="sr-only" defaultChecked />
          <CreditCard className="h-6 w-6 text-blue-600 mb-2" />
          <span className="font-medium text-blue-900">Tarjeta de Crédito</span>
        </label>
        <label className="border-2 border-slate-200 hover:border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors">
          <input type="radio" name="paymentType" className="sr-only" />
          <Wallet className="h-6 w-6 text-slate-500 mb-2" />
          <span className="font-medium text-slate-700">Línea de Crédito (Agencia)</span>
        </label>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Tarjeta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Titular de la tarjeta</Label>
            <Input placeholder="Ej. Empresa SA de CV" />
          </div>
          <div className="grid gap-2">
            <Label>Número de tarjeta</Label>
            <Input placeholder="0000 0000 0000 0000" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select defaultValue="visa">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mc">Mastercard</SelectItem>
                  <SelectItem value="amex">Amex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Expiración</Label>
              <Input placeholder="MM/YY" />
            </div>
            <div className="grid gap-2">
              <Label>CVV</Label>
              <Input placeholder="123" type="password" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Código Postal (Billing)</Label>
            <Input placeholder="12345" />
          </div>
          <div className="border-b border-slate-200 my-4" />
          <div className="flex items-center space-x-2">
            <Checkbox id="fiscal" defaultChecked />
            <Label htmlFor="fiscal" className="font-normal text-sm">Usar misma dirección fiscal de la agencia configurada en el perfil</Label>
          </div>
          <div className="pt-4 flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700">Guardar Método de Pago</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CorporateDashboardContent() {
  const [activeTab, setActiveTab] = useState('resumen')
  const [dbData, setDbData] = useState<any>(null)
  const [dbLoading, setDbLoading] = useState(false)

  React.useEffect(() => {
    async function loadCorporateData() {
      try {
        setDbLoading(true)
        const [statsRes, employeesRes, policiesRes] = await Promise.allSettled([
          fetch('/api/corporate/stats?tenantId=1').then(r => r.json()),
          fetch('/api/corporate/employees?tenantId=1').then(r => r.json()),
          fetch('/api/corporate/policies?tenantId=1').then(r => r.json())
        ])

        const stats = statsRes.status === 'fulfilled' && statsRes.value?.success ? statsRes.value.data : null
        const employees = employeesRes.status === 'fulfilled' && employeesRes.value?.success ? employeesRes.value.data : []
        const policies = policiesRes.status === 'fulfilled' && policiesRes.value?.success ? policiesRes.value.data : []

        setDbData({ stats, employees, policies })
      } catch (err) {
        console.error('Error fetching corporate DB data:', err)
      } finally {
        setDbLoading(false)
      }
    }
    loadCorporateData()
  }, [])

  return (
    <PortalIntranetLayout>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Panel de Empresas</h1>
          <p className="text-slate-500">Administración general de viajes corporativos y gestión empresarial.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full justify-start inline-flex min-w-max">
              <TabsTrigger value="resumen" className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Resumen</TabsTrigger>
              <TabsTrigger value="empleados" className="flex items-center gap-2"><Users className="w-4 h-4" /> Empleados</TabsTrigger>
              <TabsTrigger value="gastos" className="flex items-center gap-2"><FileText className="w-4 h-4" /> Gastos</TabsTrigger>
              <TabsTrigger value="metricas" className="flex items-center gap-2"><Activity className="w-4 h-4" /> Métricas & CO2</TabsTrigger>
              <TabsTrigger value="aprobaciones" className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Aprobaciones</TabsTrigger>
              <TabsTrigger value="politicas" className="flex items-center gap-2"><Settings className="w-4 h-4" /> Políticas</TabsTrigger>
              <TabsTrigger value="pagos" className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Métodos de Pago</TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6">
            <TabsContent value="resumen"><TabResumen /></TabsContent>
            <TabsContent value="empleados"><TabEmpleados /></TabsContent>
            <TabsContent value="gastos"><TabGastos /></TabsContent>
            <TabsContent value="metricas"><TabMetricas /></TabsContent>
            <TabsContent value="aprobaciones"><TabAprobaciones /></TabsContent>
            <TabsContent value="politicas"><TabPoliticas /></TabsContent>
            <TabsContent value="pagos"><TabMetodosPago /></TabsContent>
          </div>
        </Tabs>
      </div>
    </PortalIntranetLayout>
  )
}

export default function CorporateDashboardPage() {
  return (
    <Suspense fallback={<div>Cargando dashboard...</div>}>
      <CorporateDashboardContent />
    </Suspense>
  )
}
