/**
 * Servicio de Facturación CFDI con Facturama
 * Documentación: https://www.facturama.mx/api/
 */

interface ClienteFacturacion {
  rfc: string
  nombre: string
  email: string
  direccion: {
    calle: string
    numero_exterior?: string
    numero_interior?: string
    colonia: string
    municipio: string
    estado: string
    pais: string
    codigo_postal: string
  }
  regimen_fiscal?: string
  uso_cfdi?: string
}

interface ConceptoFactura {
  cantidad: number
  descripcion: string
  unidad: string
  precio_unitario: number
  importe: number
  clave_prod_serv: string
  clave_unidad: string
  impuestos?: {
    traslados?: Array<{
      base: number
      impuesto: string
      tipo_factor: string
      tasa_o_cuota: number
      importe: number
    }>
    retenciones?: Array<{
      base: number
      impuesto: string
      tipo_factor: string
      tasa_o_cuota: number
      importe: number
    }>
  }
}

interface FacturaRequest {
  cliente: ClienteFacturacion
  conceptos: ConceptoFactura[]
  forma_pago?: string
  metodo_pago?: string
  moneda?: string
  tipo_comprobante?: string
  observaciones?: string
}

interface FacturaResponse {
  id: string
  folio_fiscal: string
  serie: string
  folio: string
  fecha: string
  sello_digital_cfdi: string
  sello_digital_sat: string
  cadena_original_sat: string
  numero_certificado_sat: string
  rfc_proveedor_certificacion: string
  estado: string
  total: number
  subtotal: number
  descuento: number
  xml_original: string
  pdf_url: string
  xml_url: string
}

class FacturamaService {
  private apiKey: string
  private apiSecret: string
  private baseUrl: string
  private isSandbox: boolean

  constructor() {
    this.apiKey = process.env.FACTURAMA_API_KEY || ''
    this.apiSecret = process.env.FACTURAMA_API_SECRET || ''
    this.isSandbox = process.env.FACTURAMA_SANDBOX === 'true'
    this.baseUrl = this.isSandbox
      ? 'https://apisandbox.facturama.mx'
      : 'https://api.facturama.mx'
  }

  /**
   * Generar token de autenticación Basic
   */
  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')
    return `Basic ${credentials}`
  }

  /**
   * Crear una factura CFDI 4.0
   */
  async crearFactura(data: FacturaRequest): Promise<FacturaResponse> {
    try {
      // Validar que tengamos credenciales
      if (!this.apiKey || !this.apiSecret) {
        throw new Error('Facturama credentials not configured')
      }

      // Construir payload según Facturama API
      const payload = {
        Receiver: {
          Rfc: data.cliente.rfc,
          Name: data.cliente.nombre,
          CfdiUse: data.cliente.uso_cfdi || 'G03', // Gastos en general
          FiscalRegime: data.cliente.regimen_fiscal || '601', // General de Ley Personas Morales
          TaxZipCode: data.cliente.direccion.codigo_postal,
          Email: data.cliente.email
        },
        CfdiType: data.tipo_comprobante || 'I', // I = Ingreso
        PaymentForm: data.forma_pago || '01', // 01 = Efectivo
        PaymentMethod: data.metodo_pago || 'PUE', // PUE = Pago en una sola exhibición
        Currency: data.moneda || 'MXN',
        Items: data.conceptos.map(concepto => ({
          Quantity: concepto.cantidad,
          Description: concepto.descripcion,
          UnitCode: concepto.clave_unidad,
          ProductCode: concepto.clave_prod_serv,
          Unit: concepto.unidad,
          UnitPrice: concepto.precio_unitario,
          Subtotal: concepto.importe,
          Taxes: concepto.impuestos ? [
            ...(concepto.impuestos.traslados || []).map(t => ({
              Total: t.importe,
              Name: t.impuesto,
              Base: t.base,
              Rate: t.tasa_o_cuota,
              IsRetention: false
            })),
            ...(concepto.impuestos.retenciones || []).map(r => ({
              Total: r.importe,
              Name: r.impuesto,
              Base: r.base,
              Rate: r.tasa_o_cuota,
              IsRetention: true
            }))
          ] : []
        })),
        Observations: data.observaciones || ''
      }

      const response = await fetch(`${this.baseUrl}/api/3/cfdis`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Facturama error: ${JSON.stringify(error)}`)
      }

      const result = await response.json()

      return {
        id: result.Id,
        folio_fiscal: result.Complement?.TaxStamp?.Uuid || '',
        serie: result.Serie || '',
        folio: result.Folio || '',
        fecha: result.Date,
        sello_digital_cfdi: result.Complement?.TaxStamp?.SatSeal || '',
        sello_digital_sat: result.Complement?.TaxStamp?.CfdSeal || '',
        cadena_original_sat: result.Complement?.TaxStamp?.SatCertNumber || '',
        numero_certificado_sat: result.Complement?.TaxStamp?.SatCertNumber || '',
        rfc_proveedor_certificacion: result.Complement?.TaxStamp?.RfcProvCertif || '',
        estado: 'vigente',
        total: result.Total,
        subtotal: result.Subtotal,
        descuento: result.Discount || 0,
        xml_original: result.OriginalString || '',
        pdf_url: `${this.baseUrl}/api/cfdi/pdf/issuedLite/${result.Id}`,
        xml_url: `${this.baseUrl}/api/cfdi/xml/issuedLite/${result.Id}`
      }

    } catch (error) {
      console.error('Error creating factura:', error)
      throw error
    }
  }

  /**
   * Generar factura desde una reserva
   */
  async generarFacturaDesdeReserva(
    bookingId: number,
    clienteData: ClienteFacturacion
  ): Promise<FacturaResponse> {
    const { query, queryOne } = await import('@/lib/db')

    // Obtener datos de la reserva
    const booking = await queryOne(`
      SELECT
        b.*,
        u.name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `, [bookingId])

    if (!booking) {
      throw new Error('Booking not found')
    }

    // Construir conceptos de factura
    const conceptos: ConceptoFactura[] = [
      {
        cantidad: 1,
        descripcion: `Servicio de ${booking.booking_type === 'flight' ? 'Vuelo' : booking.booking_type === 'hotel' ? 'Hospedaje' : 'Paquete Turístico'} - Ref: ${booking.booking_reference}`,
        unidad: 'Servicio',
        precio_unitario: parseFloat(booking.total_amount),
        importe: parseFloat(booking.total_amount),
        clave_prod_serv: '90111501', // Servicios de reservaciones de viajes
        clave_unidad: 'E48', // Unidad de servicio
        impuestos: {
          traslados: [
            {
              base: parseFloat(booking.total_amount),
              impuesto: '002', // IVA
              tipo_factor: 'Tasa',
              tasa_o_cuota: 0.16,
              importe: parseFloat(booking.total_amount) * 0.16
            }
          ]
        }
      }
    ]

    // Crear factura
    return await this.crearFactura({
      cliente: clienteData,
      conceptos,
      forma_pago: '01', // Efectivo (ajustar según método de pago real)
      metodo_pago: 'PUE',
      moneda: booking.currency || 'MXN',
      tipo_comprobante: 'I',
      observaciones: `Factura de reserva ${booking.booking_reference}`
    })
  }

  /**
   * Cancelar una factura
   */
  async cancelarFactura(facturaId: string, motivo: string = '02'): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/3/cfdis/${facturaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Motive: motivo, // 02 = Comprobante emitido con errores con relación
          Substitution: null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Error canceling factura: ${JSON.stringify(error)}`)
      }

      return true

    } catch (error) {
      console.error('Error canceling factura:', error)
      throw error
    }
  }

  /**
   * Descargar PDF de factura
   */
  async descargarPDF(facturaId: string): Promise<Buffer> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cfdi/pdf/issuedLite/${facturaId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      })

      if (!response.ok) {
        throw new Error('Error downloading PDF')
      }

      const buffer = await response.arrayBuffer()
      return Buffer.from(buffer)

    } catch (error) {
      console.error('Error downloading PDF:', error)
      throw error
    }
  }

  /**
   * Descargar XML de factura
   */
  async descargarXML(facturaId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cfdi/xml/issuedLite/${facturaId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      })

      if (!response.ok) {
        throw new Error('Error downloading XML')
      }

      return await response.text()

    } catch (error) {
      console.error('Error downloading XML:', error)
      throw error
    }
  }

  /**
   * Obtener detalle de una factura
   */
  async obtenerFactura(facturaId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/3/cfdis/${facturaId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      })

      if (!response.ok) {
        throw new Error('Error fetching factura')
      }

      return await response.json()

    } catch (error) {
      console.error('Error fetching factura:', error)
      throw error
    }
  }

  /**
   * Listar facturas con filtros
   */
  async listarFacturas(
    fechaInicio?: string,
    fechaFin?: string,
    rfcReceptor?: string
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      if (fechaInicio) params.append('start', fechaInicio)
      if (fechaFin) params.append('end', fechaFin)
      if (rfcReceptor) params.append('rfc', rfcReceptor)

      const response = await fetch(`${this.baseUrl}/api/3/cfdis?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      })

      if (!response.ok) {
        throw new Error('Error listing facturas')
      }

      return await response.json()

    } catch (error) {
      console.error('Error listing facturas:', error)
      throw error
    }
  }
}

export default new FacturamaService()
