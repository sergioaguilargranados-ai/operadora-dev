"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// Colores para gráficas
const COLORS = {
  primary: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#dc2626'
}

interface ReceivablesChartProps {
  data: {
    total_cuentas: number
    pendientes: number
    pagadas: number
    vencidas: number
  }
}

export function ReceivablesChart({ data }: ReceivablesChartProps) {
  const chartData = [
    { name: 'Pendientes', value: data.pendientes, color: COLORS.warning },
    { name: 'Pagadas', value: data.pagadas, color: COLORS.success },
    { name: 'Vencidas', value: data.vencidas, color: COLORS.danger }
  ]

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface PayablesChartProps {
  data: {
    total_cuentas: number
    pendientes: number
    pagadas: number
    vencidas: number
  }
}

export function PayablesChart({ data }: PayablesChartProps) {
  const chartData = [
    { name: 'Pendientes', value: data.pendientes, color: COLORS.warning },
    { name: 'Pagadas', value: data.pagadas, color: COLORS.success },
    { name: 'Vencidas', value: data.vencidas, color: COLORS.danger }
  ]

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface CommissionsChartProps {
  data: {
    total_comisiones: number
    pendientes: number
    pagadas: number
    monto_pendiente: number
    monto_pagado: number
  }
}

export function CommissionsChart({ data }: CommissionsChartProps) {
  const chartData = [
    {
      name: 'Pendientes',
      cantidad: data.pendientes,
      monto: data.monto_pendiente
    },
    {
      name: 'Pagadas',
      cantidad: data.pagadas,
      monto: data.monto_pagado
    }
  ]

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke={COLORS.primary} />
        <YAxis yAxisId="right" orientation="right" stroke={COLORS.green} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="cantidad" fill={COLORS.primary} name="Cantidad" />
        <Bar yAxisId="right" dataKey="monto" fill={COLORS.green} name="Monto (MXN)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface MonthlyRevenueChartProps {
  data: Array<{
    month: string
    revenue: number
    expenses: number
  }>
}

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke={COLORS.success}
          name="Ingresos"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke={COLORS.danger}
          name="Egresos"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface BookingsByTypeChartProps {
  data: Array<{
    type: string
    count: number
    revenue: number
  }>
}

export function BookingsByTypeChart({ data }: BookingsByTypeChartProps) {
  const chartData = data.map(item => ({
    ...item,
    name: item.type === 'flight' ? 'Vuelos' :
          item.type === 'hotel' ? 'Hoteles' : 'Paquetes'
  }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="count" fill={COLORS.primary} name="Cantidad" />
        <Bar yAxisId="right" dataKey="revenue" fill={COLORS.green} name="Ingresos" />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface CashFlowChartProps {
  data: Array<{
    date: string
    incoming: number
    outgoing: number
    balance: number
  }>
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Legend />
        <Line
          type="monotone"
          dataKey="incoming"
          stroke={COLORS.success}
          name="Entradas"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="outgoing"
          stroke={COLORS.danger}
          name="Salidas"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke={COLORS.primary}
          name="Balance"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
