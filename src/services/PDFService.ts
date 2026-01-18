/**
 * Servicio de Generación de PDFs
 * Vouchers de reserva y reportes financieros
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface BookingVoucherData {
  bookingReference: string
  customerName: string
  customerEmail: string
  bookingType: string
  status: string
  totalAmount: number
  currency: string
  createdAt: string
  confirmedAt?: string
  details: any
}

interface FinancialReportData {
  reportType: 'receivables' | 'payables' | 'commissions' | 'invoices'
  dateRange: { start: string; end: string }
  data: any[]
  summary: any
}

class PDFService {
  /**
   * Generar voucher de reserva
   */
  generateBookingVoucher(data: BookingVoucherData): jsPDF {
    const doc = new jsPDF()

    // Header con logo y título
    doc.setFillColor(37, 99, 235) // Blue-600
    doc.rect(0, 0, 210, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('AS OPERADORA', 105, 15, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Experiencias que inspiran', 105, 25, { align: 'center' })

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('VOUCHER DE RESERVA', 105, 35, { align: 'center' })

    // Reset color
    doc.setTextColor(0, 0, 0)

    // Información de reserva
    let yPos = 55

    // Box con info principal
    doc.setFillColor(249, 250, 251)
    doc.rect(15, yPos, 180, 35, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.rect(15, yPos, 180, 35, 'S')

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Referencia:', 20, yPos + 8)
    doc.setFont('helvetica', 'normal')
    doc.text(data.bookingReference, 60, yPos + 8)

    doc.setFont('helvetica', 'bold')
    doc.text('Estado:', 20, yPos + 16)
    doc.setFont('helvetica', 'normal')
    const statusText = data.status === 'confirmed' ? 'CONFIRMADA' :
                       data.status === 'pending' ? 'PENDIENTE' : 'CANCELADA'
    doc.setTextColor(data.status === 'confirmed' ? 34 : 234,
                     data.status === 'confirmed' ? 197 : 179,
                     data.status === 'confirmed' ? 94 : 8)
    doc.text(statusText, 60, yPos + 16)
    doc.setTextColor(0, 0, 0)

    doc.setFont('helvetica', 'bold')
    doc.text('Fecha de Reserva:', 20, yPos + 24)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date(data.createdAt).toLocaleDateString('es-MX'), 60, yPos + 24)

    // Cliente info
    yPos += 45
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Información del Cliente', 15, yPos)

    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nombre: ${data.customerName}`, 20, yPos)
    doc.text(`Email: ${data.customerEmail}`, 20, yPos + 6)

    // Detalles del servicio
    yPos += 20
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Detalles del Servicio', 15, yPos)

    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    if (data.bookingType === 'flight' && data.details?.outbound) {
      doc.text('Tipo: Vuelo', 20, yPos)
      yPos += 6
      doc.text(`Ruta: ${data.details.outbound.origin} → ${data.details.outbound.destination}`, 20, yPos)
      yPos += 6
      if (data.details.airline) {
        doc.text(`Aerolínea: ${data.details.airline}`, 20, yPos)
        yPos += 6
      }
      if (data.details.outbound.departureTime) {
        doc.text(`Salida: ${data.details.outbound.departureTime}`, 20, yPos)
        yPos += 6
      }
    } else if (data.bookingType === 'hotel' && data.details?.name) {
      doc.text('Tipo: Hotel', 20, yPos)
      yPos += 6
      doc.text(`Hotel: ${data.details.name}`, 20, yPos)
      yPos += 6
      if (data.details.city) {
        doc.text(`Ubicación: ${data.details.city}`, 20, yPos)
        yPos += 6
      }
    } else {
      doc.text(`Tipo: ${data.bookingType}`, 20, yPos)
      yPos += 6
    }

    // Total
    yPos += 10
    doc.setFillColor(37, 99, 235)
    doc.rect(15, yPos, 180, 20, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 20, yPos + 13)

    doc.setFontSize(16)
    const totalText = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: data.currency
    }).format(data.totalAmount)
    doc.text(totalText, 190, yPos + 13, { align: 'right' })

    // Footer
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('AS Operadora de Viajes y Eventos', 105, 280, { align: 'center' })
    doc.text('soporte@asoperadora.com | www.asoperadora.com', 105, 285, { align: 'center' })

    return doc
  }

  /**
   * Generar reporte financiero
   */
  generateFinancialReport(data: FinancialReportData): jsPDF {
    const doc = new jsPDF()

    // Header
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 0, 210, 35, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('REPORTE FINANCIERO', 105, 15, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const reportTitle = this.getReportTitle(data.reportType)
    doc.text(reportTitle, 105, 25, { align: 'center' })

    doc.setTextColor(0, 0, 0)

    // Período
    let yPos = 45
    doc.setFontSize(10)
    doc.text(`Período: ${data.dateRange.start} - ${data.dateRange.end}`, 15, yPos)
    doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 15, yPos + 5)

    // Resumen
    yPos += 15
    if (data.summary) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Resumen', 15, yPos)

      yPos += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      Object.entries(data.summary).forEach(([key, value]) => {
        const label = this.formatLabel(key)
        const formattedValue = typeof value === 'number' && key.includes('monto')
          ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value as number)
          : String(value)

        doc.text(`${label}: ${formattedValue}`, 20, yPos)
        yPos += 5
      })
    }

    // Tabla de datos
    yPos += 10
    this.generateTable(doc, data, yPos)

    // Footer
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(8)
    doc.text('AS Operadora de Viajes y Eventos - Confidencial', 105, 285, { align: 'center' })

    return doc
  }

  /**
   * Generar tabla en PDF
   */
  private generateTable(doc: jsPDF, data: FinancialReportData, startY: number) {
    const columns = this.getTableColumns(data.reportType)
    const rows = this.getTableRows(data.reportType, data.data)

    autoTable(doc, {
      startY,
      head: [columns],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 15, right: 15 }
    })
  }

  /**
   * Obtener columnas de tabla según tipo
   */
  private getTableColumns(reportType: string): string[] {
    switch (reportType) {
      case 'receivables':
        return ['Cliente', 'Monto', 'Vencimiento', 'Estado']
      case 'payables':
        return ['Proveedor', 'Monto', 'Vencimiento', 'Estado']
      case 'commissions':
        return ['Agencia', 'Monto', 'Porcentaje', 'Estado']
      case 'invoices':
        return ['Folio', 'Cliente', 'Total', 'Fecha', 'Estado']
      default:
        return ['ID', 'Descripción', 'Monto', 'Estado']
    }
  }

  /**
   * Obtener filas de tabla según tipo
   */
  private getTableRows(reportType: string, data: any[]): any[][] {
    return data.map(item => {
      switch (reportType) {
        case 'receivables':
          return [
            item.customer_name || 'N/A',
            new Intl.NumberFormat('es-MX', { style: 'currency', currency: item.currency || 'MXN' }).format(item.amount),
            new Date(item.due_date).toLocaleDateString('es-MX'),
            item.status
          ]
        case 'payables':
          return [
            item.provider_name || 'N/A',
            new Intl.NumberFormat('es-MX', { style: 'currency', currency: item.currency || 'MXN' }).format(item.amount),
            new Date(item.due_date).toLocaleDateString('es-MX'),
            item.status
          ]
        case 'commissions':
          return [
            item.agency_name || 'N/A',
            new Intl.NumberFormat('es-MX', { style: 'currency', currency: item.currency || 'MXN' }).format(item.commission_amount),
            `${item.commission_percentage}%`,
            item.status
          ]
        case 'invoices':
          return [
            item.invoice_number,
            item.nombre_receptor,
            new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.total),
            new Date(item.fecha_emision).toLocaleDateString('es-MX'),
            item.status
          ]
        default:
          return [item.id, item.description || 'N/A', item.amount || 0, item.status || 'N/A']
      }
    })
  }

  /**
   * Formatear etiquetas
   */
  private formatLabel(key: string): string {
    const labels: Record<string, string> = {
      total_cuentas: 'Total Cuentas',
      pendientes: 'Pendientes',
      pagadas: 'Pagadas',
      vencidas: 'Vencidas',
      monto_pendiente: 'Monto Pendiente',
      monto_cobrado: 'Monto Cobrado',
      monto_pagado: 'Monto Pagado',
      monto_vencido: 'Monto Vencido',
      total_comisiones: 'Total Comisiones',
      promedio_porcentaje: 'Promedio %'
    }
    return labels[key] || key
  }

  /**
   * Obtener título de reporte
   */
  private getReportTitle(reportType: string): string {
    const titles: Record<string, string> = {
      receivables: 'Cuentas por Cobrar',
      payables: 'Cuentas por Pagar',
      commissions: 'Comisiones',
      invoices: 'Facturas'
    }
    return titles[reportType] || 'Reporte General'
  }

  /**
   * Descargar PDF
   */
  downloadPDF(doc: jsPDF, filename: string) {
    doc.save(filename)
  }

  /**
   * Obtener blob del PDF
   */
  getPDFBlob(doc: jsPDF): Blob {
    return doc.output('blob')
  }
}

export default new PDFService()
