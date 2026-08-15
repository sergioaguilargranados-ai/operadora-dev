'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import {
  exportExpensesReportToExcel,
  exportExpensesReportToPDF,
  exportDepartmentsReportToExcel,
  exportDepartmentsReportToPDF,
  exportEmployeesReportToExcel,
  exportEmployeesReportToPDF
} from '@/utils/exportHelpers'

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState<'expenses' | 'departments' | 'employees'>('expenses')
  const [expensesData, setExpensesData] = useState<any>(null)
  const [departmentsData, setDepartmentsData] = useState<any>(null)
  const [employeesData, setEmployeesData] = useState<any>(null)
  const { toast } = useToast()

  const fetchExpensesReport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/corporate/reports/expenses?tenantId=1')
      if (!res.ok) throw new Error('Error al cargar reporte')
      const data = await res.json()
      setExpensesData(data.data)
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

  const fetchDepartmentsReport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/corporate/reports/departments?tenantId=1')
      if (!res.ok) throw new Error('Error al cargar reporte')
      const data = await res.json()
      setDepartmentsData(data.data)
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

  const fetchEmployeesReport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/corporate/reports/employees?tenantId=1')
      if (!res.ok) throw new Error('Error al cargar reporte')
      const data = await res.json()
      setEmployeesData(data.data)
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

  useEffect(() => {
    fetchExpensesReport()
    fetchDepartmentsReport()
    fetchEmployeesReport()
  }, [])

  const exportToExcel = () => {
    try {
      let success = false

      if (reportType === 'expenses' && expensesData) {
        success = exportExpensesReportToExcel(expensesData)
      } else if (reportType === 'departments' && departmentsData) {
        success = exportDepartmentsReportToExcel(departmentsData)
      } else if (reportType === 'employees' && employeesData) {
        success = exportEmployeesReportToExcel(employeesData)
      }

      if (success) {
        toast({
          title: 'Exportado',
          description: 'Archivo Excel generado exitosamente'
        })
      } else {
        throw new Error('Error al exportar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar el reporte',
        variant: 'destructive'
      })
    }
  }

  const exportToPDF = () => {
    try {
      let success = false

      if (reportType === 'expenses' && expensesData) {
        success = exportExpensesReportToPDF(expensesData)
      } else if (reportType === 'departments' && departmentsData) {
        success = exportDepartmentsReportToPDF(departmentsData)
      } else if (reportType === 'employees' && employeesData) {
        success = exportEmployeesReportToPDF(employeesData)
      }

      if (success) {
        toast({
          title: 'Exportado',
          description: 'Archivo PDF generado exitosamente'
        })
      } else {
        throw new Error('Error al exportar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar el reporte',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reportes Corporativos</h1>
          <p className="text-gray-600">Análisis detallado de gastos y viajes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            📊 Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            📄 PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="expenses" className="space-y-6" onValueChange={(val) => setReportType(val as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses">Gastos por Período</TabsTrigger>
          <TabsTrigger value="departments">Por Departamento</TabsTrigger>
          <TabsTrigger value="employees">Por Empleado</TabsTrigger>
        </TabsList>

        {/* Expenses Report */}
        <TabsContent value="expenses" className="space-y-6">
          {loading || !expensesData ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reporte...</p>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Reservas</p>
                  <p className="text-3xl font-bold">{expensesData.totals.total_bookings}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Gastos Totales</p>
                  <p className="text-3xl font-bold">
                    ${parseFloat(expensesData.totals.total_expenses || 0).toLocaleString('es-MX')}
                  </p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Promedio por Reserva</p>
                  <p className="text-3xl font-bold">
                    ${parseFloat(expensesData.totals.average_booking || 0).toLocaleString('es-MX')}
                  </p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Crecimiento</p>
                  <p className={`text-3xl font-bold ${expensesData.totals.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {expensesData.totals.growth_rate >= 0 ? '+' : ''}{expensesData.totals.growth_rate}%
                  </p>
                </Card>
              </div>

              {/* By Type */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Gastos por Tipo</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expensesData.byType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${parseFloat(value).toLocaleString('es-MX')}`} />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* By Period */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tendencia Temporal</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={expensesData.byPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${parseFloat(value).toLocaleString('es-MX')}`} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Gastos" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Departments Report */}
        <TabsContent value="departments" className="space-y-6">
          {loading || !departmentsData ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reporte...</p>
            </Card>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Departamentos</p>
                  <p className="text-3xl font-bold">{departmentsData.summary.total_departments}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Reservas</p>
                  <p className="text-3xl font-bold">{departmentsData.summary.total_bookings}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Gastos Totales</p>
                  <p className="text-3xl font-bold">
                    ${parseFloat(departmentsData.summary.total_expenses || 0).toLocaleString('es-MX')}
                  </p>
                </Card>
              </div>

              {/* Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Gastos por Departamento</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentsData.departments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${parseFloat(value).toLocaleString('es-MX')}`} />
                    <Legend />
                    <Bar dataKey="total_expenses" fill="#10b981" name="Gastos Totales" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Department Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departmentsData.departments.slice(0, 4).map((dept: any, idx: number) => (
                  <Card key={idx} className="p-6">
                    <h3 className="font-semibold text-lg mb-3">{dept.department}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reservas:</span>
                        <span className="font-medium">{dept.total_bookings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Viajeros:</span>
                        <span className="font-medium">{dept.total_travelers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">${parseFloat(dept.total_expenses).toLocaleString('es-MX')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Promedio:</span>
                        <span className="font-medium">${parseFloat(dept.average_booking).toLocaleString('es-MX')}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Employees Report */}
        <TabsContent value="employees" className="space-y-6">
          {loading || !employeesData ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reporte...</p>
            </Card>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Empleados</p>
                  <p className="text-3xl font-bold">{employeesData.summary.total_employees}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Viajes</p>
                  <p className="text-3xl font-bold">{employeesData.summary.total_trips}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Promedio/Empleado</p>
                  <p className="text-3xl font-bold">
                    ${parseFloat(employeesData.summary.average_per_employee || 0).toLocaleString('es-MX')}
                  </p>
                </Card>
              </div>

              {/* Top Travelers */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Viajeros</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">#</th>
                        <th className="text-left py-3 px-4">Nombre</th>
                        <th className="text-left py-3 px-4">Departamento</th>
                        <th className="text-right py-3 px-4">Viajes</th>
                        <th className="text-right py-3 px-4">Total Gastado</th>
                        <th className="text-right py-3 px-4">Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeesData.employees.slice(0, 10).map((emp: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{idx + 1}</td>
                          <td className="py-3 px-4 font-medium">{emp.name}</td>
                          <td className="py-3 px-4">{emp.department}</td>
                          <td className="py-3 px-4 text-right">{emp.total_trips}</td>
                          <td className="py-3 px-4 text-right">
                            ${parseFloat(emp.total_spent).toLocaleString('es-MX')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            ${parseFloat(emp.average_trip).toLocaleString('es-MX')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
