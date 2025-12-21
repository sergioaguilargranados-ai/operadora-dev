/**
 * Servicio de Exportación a Excel
 * Reportes financieros y listados
 */

import * as XLSX from 'xlsx'

interface ExportData {
  sheetName: string
  data: any[]
  columns?: { header: string; key: string; width?: number }[]
}

class ExcelService {
  /**
   * Exportar datos a Excel
   */
  exportToExcel(exportData: ExportData | ExportData[], filename: string) {
    const workbook = XLSX.utils.book_new()

    const sheets = Array.isArray(exportData) ? exportData : [exportData]

    sheets.forEach(sheet => {
      const worksheet = this.createWorksheet(sheet)
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName)
    })

    // Descargar archivo
    XLSX.writeFile(workbook, filename)
  }

  /**
   * Crear worksheet
   */
  private createWorksheet(data: ExportData): XLSX.WorkSheet {
    // Si tiene columnas específicas, crear tabla estructurada
    if (data.columns) {
      const headers = data.columns.map(col => col.header)
      const keys = data.columns.map(col => col.key)

      const rows = data.data.map(item =>
        keys.map(key => this.formatCellValue(item[key]))
      )

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])

      // Aplicar anchos de columna
      const colWidths = data.columns.map(col => ({ wch: col.width || 15 }))
      worksheet['!cols'] = colWidths

      return worksheet
    } else {
      // Crear desde objetos directamente
      return XLSX.utils.json_to_sheet(data.data)
    }
  }

  /**
   * Formatear valor de celda
   */
  private formatCellValue(value: any): any {
    if (value === null || value === undefined) {
      return ''
    }

    if (value instanceof Date) {
      return value.toLocaleDateString('es-MX')
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return value
  }

  /**
   * Exportar cuentas por cobrar
   */
  exportReceivables(data: any[]) {
    const exportData: ExportData = {
      sheetName: 'Cuentas por Cobrar',
      data: data.map(item => ({
        id: item.id,
        customer_name: item.customer_name || 'N/A',
        amount: item.amount,
        currency: item.currency,
        balance: item.balance,
        due_date: new Date(item.due_date).toLocaleDateString('es-MX'),
        status: item.status,
        description: item.description || '',
        created_at: new Date(item.created_at).toLocaleDateString('es-MX')
      })),
      columns: [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Cliente', key: 'customer_name', width: 25 },
        { header: 'Monto', key: 'amount', width: 15 },
        { header: 'Moneda', key: 'currency', width: 10 },
        { header: 'Balance', key: 'balance', width: 15 },
        { header: 'Vencimiento', key: 'due_date', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Descripción', key: 'description', width: 30 },
        { header: 'Creado', key: 'created_at', width: 15 }
      ]
    }

    this.exportToExcel(exportData, `cuentas_por_cobrar_${Date.now()}.xlsx`)
  }

  /**
   * Exportar cuentas por pagar
   */
  exportPayables(data: any[]) {
    const exportData: ExportData = {
      sheetName: 'Cuentas por Pagar',
      data: data.map(item => ({
        id: item.id,
        provider_name: item.provider_name || 'N/A',
        amount: item.amount,
        currency: item.currency,
        balance: item.balance,
        due_date: new Date(item.due_date).toLocaleDateString('es-MX'),
        status: item.status,
        invoice_number: item.invoice_number || '',
        created_at: new Date(item.created_at).toLocaleDateString('es-MX')
      })),
      columns: [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Proveedor', key: 'provider_name', width: 25 },
        { header: 'Monto', key: 'amount', width: 15 },
        { header: 'Moneda', key: 'currency', width: 10 },
        { header: 'Balance', key: 'balance', width: 15 },
        { header: 'Vencimiento', key: 'due_date', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'No. Factura', key: 'invoice_number', width: 20 },
        { header: 'Creado', key: 'created_at', width: 15 }
      ]
    }

    this.exportToExcel(exportData, `cuentas_por_pagar_${Date.now()}.xlsx`)
  }

  /**
   * Exportar comisiones
   */
  exportCommissions(data: any[]) {
    const exportData: ExportData = {
      sheetName: 'Comisiones',
      data: data.map(item => ({
        id: item.id,
        agency_name: item.agency_name || 'N/A',
        booking_reference: item.booking_reference || 'N/A',
        base_amount: item.base_amount,
        commission_percentage: item.commission_percentage,
        commission_amount: item.commission_amount,
        currency: item.currency,
        status: item.status,
        calculation_date: new Date(item.calculation_date).toLocaleDateString('es-MX'),
        payment_date: item.payment_date ? new Date(item.payment_date).toLocaleDateString('es-MX') : ''
      })),
      columns: [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Agencia', key: 'agency_name', width: 25 },
        { header: 'Reserva', key: 'booking_reference', width: 20 },
        { header: 'Base', key: 'base_amount', width: 15 },
        { header: 'Porcentaje', key: 'commission_percentage', width: 12 },
        { header: 'Comisión', key: 'commission_amount', width: 15 },
        { header: 'Moneda', key: 'currency', width: 10 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Calculado', key: 'calculation_date', width: 15 },
        { header: 'Pagado', key: 'payment_date', width: 15 }
      ]
    }

    this.exportToExcel(exportData, `comisiones_${Date.now()}.xlsx`)
  }

  /**
   * Exportar facturas
   */
  exportInvoices(data: any[]) {
    const exportData: ExportData = {
      sheetName: 'Facturas',
      data: data.map(item => ({
        id: item.id,
        invoice_number: item.invoice_number,
        folio_fiscal: item.folio_fiscal || '',
        nombre_receptor: item.nombre_receptor,
        rfc_receptor: item.rfc_receptor,
        total: item.total,
        subtotal: item.subtotal,
        impuestos: item.impuestos,
        status: item.status,
        fecha_emision: new Date(item.fecha_emision).toLocaleDateString('es-MX'),
        fecha_cancelacion: item.fecha_cancelacion ? new Date(item.fecha_cancelacion).toLocaleDateString('es-MX') : ''
      })),
      columns: [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Folio', key: 'invoice_number', width: 20 },
        { header: 'UUID', key: 'folio_fiscal', width: 40 },
        { header: 'Cliente', key: 'nombre_receptor', width: 25 },
        { header: 'RFC', key: 'rfc_receptor', width: 15 },
        { header: 'Subtotal', key: 'subtotal', width: 15 },
        { header: 'Impuestos', key: 'impuestos', width: 15 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Emisión', key: 'fecha_emision', width: 15 },
        { header: 'Cancelación', key: 'fecha_cancelacion', width: 15 }
      ]
    }

    this.exportToExcel(exportData, `facturas_${Date.now()}.xlsx`)
  }

  /**
   * Exportar reservas
   */
  exportBookings(data: any[]) {
    const exportData: ExportData = {
      sheetName: 'Reservas',
      data: data.map(item => ({
        id: item.id,
        booking_reference: item.booking_reference,
        booking_type: item.booking_type,
        provider: item.provider,
        status: item.status,
        total_amount: item.total_amount,
        currency: item.currency,
        created_at: new Date(item.created_at).toLocaleDateString('es-MX'),
        confirmed_at: item.confirmed_at ? new Date(item.confirmed_at).toLocaleDateString('es-MX') : ''
      })),
      columns: [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Referencia', key: 'booking_reference', width: 20 },
        { header: 'Tipo', key: 'booking_type', width: 15 },
        { header: 'Proveedor', key: 'provider', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Monto', key: 'total_amount', width: 15 },
        { header: 'Moneda', key: 'currency', width: 10 },
        { header: 'Creado', key: 'created_at', width: 15 },
        { header: 'Confirmado', key: 'confirmed_at', width: 15 }
      ]
    }

    this.exportToExcel(exportData, `reservas_${Date.now()}.xlsx`)
  }

  /**
   * Exportar reporte completo (múltiples hojas)
   */
  exportCompleteReport(data: {
    receivables?: any[]
    payables?: any[]
    commissions?: any[]
    invoices?: any[]
  }) {
    const sheets: ExportData[] = []

    if (data.receivables) {
      sheets.push({
        sheetName: 'Cuentas por Cobrar',
        data: data.receivables,
        columns: [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Cliente', key: 'customer_name', width: 25 },
          { header: 'Monto', key: 'amount', width: 15 },
          { header: 'Estado', key: 'status', width: 15 }
        ]
      })
    }

    if (data.payables) {
      sheets.push({
        sheetName: 'Cuentas por Pagar',
        data: data.payables,
        columns: [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Proveedor', key: 'provider_name', width: 25 },
          { header: 'Monto', key: 'amount', width: 15 },
          { header: 'Estado', key: 'status', width: 15 }
        ]
      })
    }

    if (data.commissions) {
      sheets.push({
        sheetName: 'Comisiones',
        data: data.commissions,
        columns: [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Agencia', key: 'agency_name', width: 25 },
          { header: 'Comisión', key: 'commission_amount', width: 15 },
          { header: 'Estado', key: 'status', width: 15 }
        ]
      })
    }

    if (data.invoices) {
      sheets.push({
        sheetName: 'Facturas',
        data: data.invoices,
        columns: [
          { header: 'Folio', key: 'invoice_number', width: 20 },
          { header: 'Cliente', key: 'nombre_receptor', width: 25 },
          { header: 'Total', key: 'total', width: 15 },
          { header: 'Estado', key: 'status', width: 15 }
        ]
      })
    }

    this.exportToExcel(sheets, `reporte_completo_${Date.now()}.xlsx`)
  }
}

export default new ExcelService()
