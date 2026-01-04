import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Exportar datos a Excel
 */
export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Reporte') {
  try {
    // Crear workbook
    const wb = XLSX.utils.book_new()

    // Crear worksheet desde datos
    const ws = XLSX.utils.json_to_sheet(data)

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // Generar archivo Excel
    XLSX.writeFile(wb, `${fileName}.xlsx`)

    return true
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return false
  }
}

/**
 * Exportar múltiples hojas a Excel
 */
export function exportMultiSheetExcel(
  sheets: Array<{ name: string; data: any[] }>,
  fileName: string
) {
  try {
    const wb = XLSX.utils.book_new()

    sheets.forEach(sheet => {
      const ws = XLSX.utils.json_to_sheet(sheet.data)
      XLSX.utils.book_append_sheet(wb, ws, sheet.name)
    })

    XLSX.writeFile(wb, `${fileName}.xlsx`)
    return true
  } catch (error) {
    console.error('Error exporting multi-sheet Excel:', error)
    return false
  }
}

/**
 * Exportar tabla a PDF
 */
export function exportTableToPDF(
  title: string,
  headers: string[],
  data: any[][],
  fileName: string
) {
  try {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text(title, 14, 20)

    // Fecha
    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 14, 28)

    // Tabla
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 35,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246], // Blue
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      }
    })

    // Guardar
    doc.save(`${fileName}.pdf`)
    return true
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    return false
  }
}

/**
 * Exportar reporte de gastos a Excel
 */
export function exportExpensesReportToExcel(reportData: any) {
  const sheets = [
    {
      name: 'Resumen',
      data: [
        {
          'Total Reservas': reportData.totals.total_bookings,
          'Total Gastos': `$${parseFloat(reportData.totals.total_expenses || 0).toLocaleString('es-MX')}`,
          'Promedio': `$${parseFloat(reportData.totals.average_booking || 0).toLocaleString('es-MX')}`,
          'Crecimiento': `${reportData.totals.growth_rate}%`
        }
      ]
    },
    {
      name: 'Por Tipo',
      data: reportData.byType.map((item: any) => ({
        'Tipo': item.type,
        'Cantidad': item.count,
        'Total': parseFloat(item.total || 0).toFixed(2),
        'Promedio': parseFloat(item.average || 0).toFixed(2)
      }))
    },
    {
      name: 'Por Período',
      data: reportData.byPeriod.map((item: any) => ({
        'Período': new Date(item.period).toLocaleDateString('es-MX'),
        'Cantidad': item.count,
        'Total': parseFloat(item.total || 0).toFixed(2)
      }))
    }
  ]

  return exportMultiSheetExcel(sheets, `Reporte_Gastos_${Date.now()}`)
}

/**
 * Exportar reporte de departamentos a Excel
 */
export function exportDepartmentsReportToExcel(reportData: any) {
  const mainData = reportData.departments.map((dept: any) => ({
    'Departamento': dept.department,
    'Total Reservas': dept.total_bookings,
    'Total Viajeros': dept.total_travelers,
    'Total Gastos': parseFloat(dept.total_expenses || 0).toFixed(2),
    'Promedio': parseFloat(dept.average_booking || 0).toFixed(2),
    'Máximo': parseFloat(dept.max_booking || 0).toFixed(2),
    'Mínimo': parseFloat(dept.min_booking || 0).toFixed(2)
  }))

  return exportToExcel(mainData, `Reporte_Departamentos_${Date.now()}`, 'Departamentos')
}

/**
 * Exportar reporte de empleados a Excel
 */
export function exportEmployeesReportToExcel(reportData: any) {
  const data = reportData.employees.map((emp: any) => ({
    'Nombre': emp.name,
    'Email': emp.email,
    'Departamento': emp.department,
    'Rol': emp.role,
    'Total Viajes': emp.total_trips,
    'Total Gastado': parseFloat(emp.total_spent || 0).toFixed(2),
    'Promedio por Viaje': parseFloat(emp.average_trip || 0).toFixed(2),
    'Destinos Visitados': emp.destinations_visited
  }))

  return exportToExcel(data, `Reporte_Empleados_${Date.now()}`, 'Empleados')
}

/**
 * Exportar reporte de gastos a PDF
 */
export function exportExpensesReportToPDF(reportData: any) {
  const doc = new jsPDF()

  // Título principal
  doc.setFontSize(20)
  doc.text('Reporte de Gastos', 14, 20)

  doc.setFontSize(10)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 14, 28)

  // Resumen
  doc.setFontSize(14)
  doc.text('Resumen General', 14, 40)

  autoTable(doc, {
    startY: 45,
    head: [['Métrica', 'Valor']],
    body: [
      ['Total Reservas', reportData.totals.total_bookings],
      ['Total Gastos', `$${parseFloat(reportData.totals.total_expenses || 0).toLocaleString('es-MX')}`],
      ['Promedio', `$${parseFloat(reportData.totals.average_booking || 0).toLocaleString('es-MX')}`],
      ['Crecimiento', `${reportData.totals.growth_rate}%`]
    ],
    theme: 'grid'
  })

  // Gastos por tipo
  const finalY1 = (doc as any).lastAutoTable.finalY || 70
  doc.setFontSize(14)
  doc.text('Gastos por Tipo', 14, finalY1 + 10)

  autoTable(doc, {
    startY: finalY1 + 15,
    head: [['Tipo', 'Cantidad', 'Total', 'Promedio']],
    body: reportData.byType.map((item: any) => [
      item.type,
      item.count,
      `$${parseFloat(item.total || 0).toLocaleString('es-MX')}`,
      `$${parseFloat(item.average || 0).toLocaleString('es-MX')}`
    ]),
    theme: 'striped'
  })

  doc.save(`Reporte_Gastos_${Date.now()}.pdf`)
  return true
}

/**
 * Exportar reporte de departamentos a PDF
 */
export function exportDepartmentsReportToPDF(reportData: any) {
  const headers = ['Departamento', 'Reservas', 'Viajeros', 'Total', 'Promedio']
  const data = reportData.departments.map((dept: any) => [
    dept.department,
    dept.total_bookings,
    dept.total_travelers,
    `$${parseFloat(dept.total_expenses || 0).toLocaleString('es-MX')}`,
    `$${parseFloat(dept.average_booking || 0).toLocaleString('es-MX')}`
  ])

  return exportTableToPDF(
    'Reporte por Departamento',
    headers,
    data,
    `Reporte_Departamentos_${Date.now()}`
  )
}

/**
 * Exportar reporte de empleados a PDF
 */
export function exportEmployeesReportToPDF(reportData: any) {
  const headers = ['Nombre', 'Departamento', 'Viajes', 'Total Gastado', 'Promedio']
  const data = reportData.employees.map((emp: any) => [
    emp.name,
    emp.department,
    emp.total_trips,
    `$${parseFloat(emp.total_spent || 0).toLocaleString('es-MX')}`,
    `$${parseFloat(emp.average_trip || 0).toLocaleString('es-MX')}`
  ])

  return exportTableToPDF(
    'Reporte de Empleados',
    headers,
    data,
    `Reporte_Empleados_${Date.now()}`
  )
}
