/**
 * Servicio de Generación de PDFs
 * Vouchers de reserva y reportes financieros
 * Build: 26 Feb 2026 - v2.333 - PDF Premium institucional
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

interface PaymentReceiptData {
  transactionId: string
  bookingReference: string
  customerName: string
  customerEmail: string
  amount: number
  currency: string
  paymentMethod: string
  cardLastFour?: string
  cardBrand?: string
  status: string
  paidAt: string
  serviceName: string
  bookingType?: string
}

interface FinancialReportData {
  reportType: 'receivables' | 'payables' | 'commissions' | 'invoices'
  dateRange: { start: string; end: string }
  data: any[]
  summary: any
}

class PDFService {
  /**
   * Generar documento oficial de reserva — Diseño premium institucional
   */
  generateBookingVoucher(data: BookingVoucherData): jsPDF {
    const doc = new jsPDF()
    const pageW = 210

    // ===== BARRA AZUL DE ACENTO SUPERIOR =====
    doc.setFillColor(0, 102, 255)
    doc.rect(0, 0, pageW, 6, 'F')

    // ===== CABECERA =====
    let y = 16
    // Logo "AS" serif
    doc.setFont('times', 'bold')
    doc.setFontSize(32)
    doc.setTextColor(30, 58, 95)
    doc.text('AS', 20, y + 2)

    // Nombre empresa
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text('OPERADORA DE VIAJES Y EVENTOS', 40, y - 5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(120, 120, 120)
    doc.text('AS Viajando', 40, y + 1)

    // Tipo de documento
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(0, 102, 255)
    doc.text('RESERVA DE VIAJE', pageW - 20, y - 4, { align: 'right' })

    // Badge de referencia
    doc.setFillColor(0, 102, 255)
    doc.roundedRect(pageW - 80, y + 1, 60, 9, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(data.bookingReference || '', pageW - 50, y + 7, { align: 'center' })

    // ===== LÍNEA DORADA SEPARADORA =====
    y = 34
    doc.setDrawColor(184, 134, 11)
    doc.setLineWidth(1.5)
    doc.line(15, y, pageW - 15, y)

    // ===== CONTACTO EMPRESA =====
    y = 40
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text('viajes@asoperadora.com  \u2022  +52 720 815 6804  \u2022  asoperadora.com', pageW / 2, y, { align: 'center' })

    // ===== STATUS Y FECHA =====
    y = 50
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(15, y, pageW - 30, 16, 3, 3, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.roundedRect(15, y, pageW - 30, 16, 3, 3, 'S')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text('Estado:', 22, y + 7)

    const statusText = data.status === 'confirmed' ? 'CONFIRMADA' :
      data.status === 'pending' ? 'PENDIENTE' :
        data.status === 'cancelled' ? 'CANCELADA' : (data.status || '').toUpperCase()
    if (data.status === 'confirmed') doc.setTextColor(34, 197, 94)
    else if (data.status === 'cancelled') doc.setTextColor(239, 68, 68)
    else doc.setTextColor(234, 179, 8)
    doc.text(statusText, 48, y + 7)

    doc.setTextColor(60, 60, 60)
    doc.text('Fecha de Reserva:', 100, y + 7)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date(data.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }), 147, y + 7)

    if (data.confirmedAt) {
      doc.setFont('helvetica', 'bold')
      doc.text('Confirmada:', 22, y + 13)
      doc.setFont('helvetica', 'normal')
      doc.text(new Date(data.confirmedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }), 55, y + 13)
    }

    // ===== INFORMACIÓN DEL CLIENTE =====
    y = 74
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 58, 95)
    doc.text('Datos del Viajero', 15, y)
    y += 4
    doc.setDrawColor(0, 102, 255)
    doc.setLineWidth(0.5)
    doc.line(15, y, 80, y)

    y += 6
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    doc.text(`Nombre: ${data.customerName || '-'}`, 20, y)
    doc.text(`Email: ${data.customerEmail || '-'}`, 20, y + 6)

    // ===== DETALLES DEL SERVICIO =====
    y += 18
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 58, 95)
    doc.text('Detalles del Servicio', 15, y)
    y += 4
    doc.setDrawColor(0, 102, 255)
    doc.line(15, y, 80, y)

    y += 6
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)

    const typeLabel = data.bookingType === 'flight' ? 'Vuelo' :
      data.bookingType === 'hotel' ? 'Hotel' :
        data.bookingType === 'tour' ? 'Tour' : 'Paquete'
    doc.setFont('helvetica', 'bold')
    doc.text('Tipo:', 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(typeLabel, 42, y)
    y += 6

    const details = data.details || {}

    // Tour con datos de cotización
    if (data.bookingType === 'tour' && details.tour_name) {
      doc.setFont('helvetica', 'bold')
      doc.text('Tour:', 20, y)
      doc.setFont('helvetica', 'normal')
      doc.text(details.tour_name || '', 42, y)
      y += 6

      if (details.folio) {
        doc.setFont('helvetica', 'bold')
        doc.text('Cotizaci\u00f3n:', 20, y)
        doc.setFont('helvetica', 'normal')
        doc.text(details.folio, 60, y)
        y += 6
      }
      if (details.departure_date) {
        doc.setFont('helvetica', 'bold')
        doc.text('Fecha de Salida:', 20, y)
        doc.setFont('helvetica', 'normal')
        doc.text(details.departure_date, 60, y)
        y += 6
      }
      if (details.origin_city) {
        doc.setFont('helvetica', 'bold')
        doc.text('Ciudad de Origen:', 20, y)
        doc.setFont('helvetica', 'normal')
        doc.text(details.origin_city, 65, y)
        y += 6
      }
      if (details.num_personas) {
        doc.setFont('helvetica', 'bold')
        doc.text('Pasajeros:', 20, y)
        doc.setFont('helvetica', 'normal')
        doc.text(String(details.num_personas), 55, y)
        y += 6
      }

      // Items incluidos
      if (details.included_items) {
        y += 4
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(30, 58, 95)
        doc.text('Servicios Incluidos', 15, y)
        y += 5
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(80, 80, 80)
        const items = details.included_items.split('\n').filter((i: string) => i.trim())
        items.forEach((item: string) => {
          if (y > 250) { doc.addPage(); y = 20 }
          doc.text(`\u2022 ${item.trim()}`, 22, y)
          y += 5
        })
      }

      if (details.notes) {
        y += 3
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(60, 60, 60)
        doc.text('Notas:', 20, y)
        doc.setFont('helvetica', 'normal')
        const noteLines = doc.splitTextToSize(details.notes, 140)
        doc.text(noteLines, 42, y)
        y += noteLines.length * 4 + 2
      }
    } else if (data.bookingType === 'flight' && details.outbound) {
      doc.setFont('helvetica', 'bold')
      doc.text('Ruta:', 20, y)
      doc.setFont('helvetica', 'normal')
      doc.text(`${details.outbound.origin} \u2192 ${details.outbound.destination}`, 42, y)
      y += 6
      if (details.airline) {
        doc.setFont('helvetica', 'bold')
        doc.text('Aerol\u00ednea:', 20, y)
        doc.setFont('helvetica', 'normal')
        doc.text(details.airline, 50, y)
        y += 6
      }
    } else if (data.bookingType === 'hotel' && details.name) {
      doc.setFont('helvetica', 'bold')
      doc.text('Hotel:', 20, y)
      doc.setFont('helvetica', 'normal')
      doc.text(details.name, 42, y)
      y += 6
      if (details.city) {
        doc.setFont('helvetica', 'bold')
        doc.text('Ciudad:', 20, y)
        doc.setFont('helvetica', 'normal')
        doc.text(details.city, 42, y)
        y += 6
      }
    }

    // ===== TABLA DE PRECIOS (para tours) =====
    if (y > 240) { doc.addPage(); y = 20 }
    y += 6

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 58, 95)
    doc.text('Resumen Financiero', 15, y)
    y += 4
    doc.setDrawColor(0, 102, 255)
    doc.setLineWidth(0.5)
    doc.line(15, y, 80, y)
    y += 4

    if (data.bookingType === 'tour' && details.price_per_person) {
      const rows: string[][] = [
        ['Precio base por persona', `$${Number(details.price_per_person).toLocaleString()} USD`],
        ['Impuestos por persona', `$${Number(details.taxes || 0).toLocaleString()} USD`],
      ]
      if (details.supplement) {
        rows.push(['Suplemento por persona', `$${Number(details.supplement).toLocaleString()} USD`])
      }
      rows.push(['Total por persona', `$${Number(details.total_per_person || 0).toLocaleString()} USD`])
      rows.push(['Pasajeros', String(details.num_personas || 1)])

      autoTable(doc, {
        startY: y,
        head: [['Concepto', 'Monto']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 255], textColor: 255, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        margin: { left: 15, right: 15 },
        columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 50, halign: 'right' as const } }
      })
      y = (doc as any).lastAutoTable.finalY + 4
    }

    // TOTAL
    doc.setFillColor(0, 102, 255)
    doc.roundedRect(15, y, pageW - 30, 14, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 22, y + 9)

    const totalFormatted = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: data.currency || 'MXN'
    }).format(data.totalAmount || 0)
    doc.setFontSize(14)
    doc.text(totalFormatted, pageW - 22, y + 9, { align: 'right' })

    // ===== TÉRMINOS =====
    y += 22
    if (y > 255) { doc.addPage(); y = 20 }
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(120, 120, 120)
    doc.text('T\u00c9RMINOS Y CONDICIONES', 15, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    const terms = [
      '1. Precios sujetos a cambio sin previo aviso hasta la confirmaci\u00f3n del pago.',
      '2. Cancelaciones dentro de las 72 horas previas al viaje pueden generar cargos.',
      '3. Es responsabilidad del viajero contar con documentaci\u00f3n vigente para el viaje.',
      '4. AS Operadora se reserva el derecho de modificar itinerarios por causas de fuerza mayor.'
    ]
    terms.forEach(t => { doc.text(t, 15, y); y += 4 })

    // ===== FOOTER =====
    doc.setFillColor(184, 134, 11)
    doc.rect(0, 278, pageW, 2, 'F')

    doc.setFillColor(30, 58, 95)
    doc.rect(0, 280, pageW, 17, 'F')

    doc.setFont('times', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text('AS', 20, 290)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(200, 200, 220)
    doc.text('Operadora de Viajes y Eventos', 33, 290)

    doc.text(
      `Generado: ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      pageW - 20, 290, { align: 'right' }
    )

    doc.text('viajes@asoperadora.com  \u2022  +52 720 815 6804  \u2022  asoperadora.com', pageW / 2, 294, { align: 'center' })

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

    // Per\u00edodo
    let yPos = 45
    doc.setFontSize(10)
    doc.text(`Per\u00edodo: ${data.dateRange.start} - ${data.dateRange.end}`, 15, yPos)
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
   * Obtener columnas de tabla seg\u00fan tipo
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
        return ['ID', 'Descripci\u00f3n', 'Monto', 'Estado']
    }
  }

  /**
   * Obtener filas de tabla seg\u00fan tipo
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
   * Obtener t\u00edtulo de reporte
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
   * Generar comprobante de pago oficial — Diseño premium institucional
   */
  generatePaymentReceipt(data: PaymentReceiptData): jsPDF {
    const doc = new jsPDF()
    const pageW = 210

    // ===== BARRA AZUL =====
    doc.setFillColor(0, 102, 255)
    doc.rect(0, 0, pageW, 6, 'F')

    // ===== CABECERA =====
    let y = 16
    doc.setFont('times', 'bold')
    doc.setFontSize(32)
    doc.setTextColor(30, 58, 95)
    doc.text('AS', 20, y + 2)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text('OPERADORA DE VIAJES Y EVENTOS', 40, y - 5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(120, 120, 120)
    doc.text('AS Viajando', 40, y + 1)

    // Tipo de documento
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(34, 197, 94) // Verde
    doc.text('COMPROBANTE DE PAGO', pageW - 20, y - 4, { align: 'right' })

    // Badge de transacción
    doc.setFillColor(34, 197, 94)
    doc.roundedRect(pageW - 80, y + 1, 60, 9, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(data.transactionId || '', pageW - 50, y + 7, { align: 'center' })

    // ===== LÍNEA DORADA =====
    y = 34
    doc.setDrawColor(184, 134, 11)
    doc.setLineWidth(1.5)
    doc.line(15, y, pageW - 15, y)

    y = 40
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text('viajes@asoperadora.com  \u2022  +52 720 815 6804  \u2022  asoperadora.com', pageW / 2, y, { align: 'center' })

    // ===== ESTADO DE PAGO =====
    y = 52
    doc.setFillColor(240, 253, 244) // verde claro
    doc.roundedRect(15, y, pageW - 30, 20, 3, 3, 'F')
    doc.setDrawColor(187, 247, 208)
    doc.roundedRect(15, y, pageW - 30, 20, 3, 3, 'S')

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(34, 197, 94)
    doc.text('\u2713 PAGO COMPLETADO', pageW / 2, y + 9, { align: 'center' })

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(`Fecha: ${new Date(data.paidAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageW / 2, y + 16, { align: 'center' })

    // ===== DATOS DEL PAGO =====
    y = 82
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 58, 95)
    doc.text('Datos del Pago', 15, y)
    y += 4
    doc.setDrawColor(0, 102, 255)
    doc.setLineWidth(0.5)
    doc.line(15, y, 80, y)
    y += 8

    doc.setFontSize(9)
    const paymentLabels = [
      ['ID Transacci\u00f3n:', data.transactionId || '-'],
      ['M\u00e9todo de Pago:', this.getPaymentMethodLabel(data.paymentMethod)],
    ]

    if (data.cardLastFour) {
      paymentLabels.push(['Tarjeta:', `${(data.cardBrand || 'Visa').toUpperCase()} **** ${data.cardLastFour}`])
    }

    paymentLabels.push(
      ['Estado:', 'Completado'],
      ['Moneda:', data.currency || 'MXN']
    )

    paymentLabels.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(60, 60, 60)
      doc.text(label, 20, y)
      doc.setFont('helvetica', 'normal')
      doc.text(value, 70, y)
      y += 6
    })

    // ===== DATOS DEL CLIENTE =====
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 58, 95)
    doc.text('Datos del Cliente', 15, y)
    y += 4
    doc.setDrawColor(0, 102, 255)
    doc.line(15, y, 80, y)
    y += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text('Nombre:', 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(data.customerName || '-', 55, y)
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Email:', 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(data.customerEmail || '-', 55, y)

    // ===== DATOS DE LA RESERVA =====
    y += 14
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 58, 95)
    doc.text('Reserva Asociada', 15, y)
    y += 4
    doc.setDrawColor(0, 102, 255)
    doc.line(15, y, 80, y)
    y += 8

    doc.setFontSize(9)
    const bookingLabels = [
      ['Referencia:', data.bookingReference || '-'],
      ['Servicio:', data.serviceName || '-'],
      ['Tipo:', data.bookingType === 'tour' ? 'Tour' : data.bookingType === 'flight' ? 'Vuelo' : data.bookingType === 'hotel' ? 'Hotel' : 'General'],
    ]

    bookingLabels.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(60, 60, 60)
      doc.text(label, 20, y)
      doc.setFont('helvetica', 'normal')
      doc.text(value, 55, y)
      y += 6
    })

    // ===== TOTAL =====
    y += 8
    doc.setFillColor(0, 102, 255)
    doc.roundedRect(15, y, pageW - 30, 16, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('MONTO PAGADO:', 22, y + 10)

    const totalFormatted = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: data.currency || 'MXN'
    }).format(data.amount || 0)
    doc.setFontSize(16)
    doc.text(totalFormatted, pageW - 22, y + 10, { align: 'right' })

    // ===== NOTA LEGAL =====
    y += 26
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text('Este comprobante es un documento informativo que acredita la recepci\u00f3n del pago.', 15, y)
    doc.text('Para efectos fiscales, solicite su factura en el m\u00f3dulo de facturaci\u00f3n de AS Operadora.', 15, y + 4)

    // ===== FOOTER =====
    doc.setFillColor(184, 134, 11)
    doc.rect(0, 278, pageW, 2, 'F')
    doc.setFillColor(30, 58, 95)
    doc.rect(0, 280, pageW, 17, 'F')

    doc.setFont('times', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text('AS', 20, 290)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(200, 200, 220)
    doc.text('Operadora de Viajes y Eventos', 33, 290)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageW - 20, 290, { align: 'right' })
    doc.text('viajes@asoperadora.com  \u2022  +52 720 815 6804  \u2022  asoperadora.com', pageW / 2, 294, { align: 'center' })

    return doc
  }

  /**
   * Helper: obtener etiqueta de método de pago
   */
  private getPaymentMethodLabel(method: string): string {
    const methods: Record<string, string> = {
      stripe: 'Tarjeta (Stripe)',
      paypal: 'PayPal',
      mercadopago: 'Mercado Pago',
      oxxo: 'OXXO',
      spei: 'SPEI',
      transfer: 'Transferencia',
      cash: 'Efectivo'
    }
    return methods[method] || method || 'No especificado'
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
