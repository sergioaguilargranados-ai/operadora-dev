import { PACConnector } from './PACConnector'
import { FacturamaPACConnector } from './FacturamaPACConnector'
import { queryOne, query } from '@/lib/db'

export class InvoiceService {
    private static pacConnectors: Record<string, PACConnector> = {
        'facturama': new FacturamaPACConnector()
    }

    /**
     * Obtiene la configuración fiscal y de PAC para una agencia/tenant.
     * Si no existe registro aún, retorna una configuración por defecto (sandbox).
     */
    static async getAgencyConfig(tenantId?: number) {
        if (tenantId) {
            const config = await queryOne(
                'SELECT * FROM agency_billing_config WHERE tenant_id = $1 AND is_active = true LIMIT 1',
                [tenantId]
            )
            if (config) return config
        }

        // Fallback a configuración global / sandbox por defecto
        return {
            tenant_id: tenantId || null,
            rfc: 'AOV123456789',
            razon_social: 'AS OPERADORA DE VIAJES Y EVENTOS S.A. DE C.V.',
            regimen_fiscal: '601',
            codigo_postal: '06600',
            pac_provider: 'facturama',
            pac_api_user: process.env.FACTURAMA_USER || 'ASOperadora',
            pac_api_password: process.env.FACTURAMA_PASSWORD || 'Facturama2026!',
            pac_is_sandbox: process.env.FACTURAMA_SANDBOX !== 'false',
            invoice_serie: 'FAC',
            next_folio: 100,
            iva_rate: 0.1600
        }
    }

    static getConnector(providerName: string = 'facturama'): PACConnector {
        const connector = this.pacConnectors[providerName.toLowerCase()]
        if (!connector) {
            throw new Error(`Proveedor PAC "${providerName}" no soportado. Configurados: ${Object.keys(this.pacConnectors).join(', ')}`)
        }
        return connector
    }

    /**
     * Emite y timbra un CFDI completo a través del PAC activo y guarda el registro en BD.
     */
    static async createInvoice(bookingId: number, fiscalData: {
        rfc: string
        razonSocial: string
        regimenFiscal: string
        codigoPostal: string
        usoCfdi: string
        email: string
    }, tenantId?: number) {
        const config = await this.getAgencyConfig(tenantId)
        const connector = this.getConnector(config.pac_provider)

        // Obtener detalles de la reserva de la BD
        const booking = await queryOne('SELECT * FROM bookings WHERE id = $1', [bookingId])
        if (!booking) {
            throw new Error('Reserva no encontrada')
        }

        const totalAmount = parseFloat(booking.total_price || booking.total_amount || '0')
        const subtotalAmount = Number((totalAmount / 1.16).toFixed(2))
        const taxAmount = Number((totalAmount - subtotalAmount).toFixed(2))

        const invoiceNumber = `${config.invoice_serie || 'FAC'}-${Date.now().toString().slice(-6)}`

        const payload = {
            cfdiType: 'I' as const,
            expeditionPlace: config.codigo_postal,
            paymentForm: '04', // Tarjeta
            paymentMethod: 'PUE',
            currency: booking.currency || 'MXN',
            receiver: {
                rfc: fiscalData.rfc,
                name: fiscalData.razonSocial,
                fiscalRegime: fiscalData.regimenFiscal,
                taxZipCode: fiscalData.codigoPostal,
                cfdiUse: fiscalData.usoCfdi || 'G03',
                email: fiscalData.email
            },
            items: [
                {
                    description: `Servicio de viaje - Reserva #${booking.booking_reference}`,
                    quantity: 1,
                    unitCode: 'E48',
                    unitName: 'Servicio',
                    unitPrice: subtotalAmount,
                    amount: subtotalAmount,
                    satProductCode: '90111501'
                }
            ],
            subtotal: subtotalAmount,
            tax: taxAmount,
            total: totalAmount
        }

        // Timbrar con PAC
        const pacRes = await connector.createCFDI(config, payload)

        // Guardar factura en BD `invoices`
        const newInvoice = await queryOne(
            `INSERT INTO invoices (
                booking_id, tenant_id, invoice_number, folio_fiscal, serie, folio,
                rfc_receptor, nombre_receptor, email_receptor,
                subtotal, impuestos, total, currency, status, fecha_emision,
                uso_cfdi, forma_pago, metodo_pago, facturama_id, pac_provider,
                regimen_fiscal_emisor, regimen_fiscal_receptor, codigo_postal_receptor
            ) VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9,
                $10, $11, $12, $13, $14, NOW(),
                $15, $16, $17, $18, $19,
                $20, $21, $22
            ) RETURNING *`,
            [
                bookingId,
                tenantId || null,
                invoiceNumber,
                pacRes.uuid || null,
                config.invoice_serie || 'FAC',
                invoiceNumber,
                fiscalData.rfc,
                fiscalData.razonSocial,
                fiscalData.email,
                subtotalAmount,
                taxAmount,
                totalAmount,
                booking.currency || 'MXN',
                pacRes.success ? 'issued' : 'draft',
                fiscalData.usoCfdi || 'G03',
                '04',
                'PUE',
                pacRes.facturamaId || null,
                config.pac_provider,
                config.regimen_fiscal,
                fiscalData.regimenFiscal,
                fiscalData.codigoPostal
            ]
        )

        // Guardar concepto en `invoice_items`
        if (newInvoice) {
            await query(
                `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount, tax_amount) 
                 VALUES ($1, $2, 1, $3, $3, $4)`,
                [newInvoice.id, `Servicio de viaje - Reserva #${booking.booking_reference}`, subtotalAmount, taxAmount]
            )
        }

        return {
            invoice: newInvoice,
            pacResponse: pacRes
        }
    }
}
