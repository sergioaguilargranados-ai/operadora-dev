/**
 * Servicio de Notificaciones
 * Maneja envío de emails con SendGrid y notificaciones en app
 */

interface EmailData {
  to: string
  subject: string
  text?: string
  html?: string
  templateId?: string
  dynamicTemplateData?: any
  fromName?: string  // Nombre de remitente dinámico por tenant
}

interface BookingConfirmationData {
  userName: string
  bookingReference: string
  bookingType: string
  totalAmount: number
  currency: string
  details: any
  tenantId?: number  // Si se pasa, usar branding del tenant
}

/**
 * Branding del tenant para templates de email
 */
export interface TenantBranding {
  companyName: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  supportEmail: string
  supportPhone: string
  footerText: string
}

class NotificationService {
  private apiKey: string
  private fromEmail: string
  private isConfigured: boolean

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || ''
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@asoperadora.com'
    this.isConfigured = !!this.apiKey
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(data: EmailData): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('SendGrid not configured, email not sent')
      return false
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: data.to }],
              ...(data.templateId && data.dynamicTemplateData && {
                dynamic_template_data: data.dynamicTemplateData
              })
            }
          ],
          from: { email: this.fromEmail, name: data.fromName || 'AS Operadora de Viajes' },
          subject: data.subject,
          ...(data.templateId ? {
            template_id: data.templateId
          } : {
            content: [
              {
                type: 'text/plain',
                value: data.text || ''
              },
              ...(data.html ? [{
                type: 'text/html',
                value: data.html
              }] : [])
            ]
          })
        })
      })

      if (!response.ok) {
        throw new Error(`SendGrid error: ${response.statusText}`)
      }

      console.log('Email sent successfully to:', data.to)
      return true

    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  /**
   * Obtener branding del tenant para emails
   */
  async getTenantBranding(tenantId: number): Promise<TenantBranding | null> {
    try {
      const { queryOne } = await import('@/lib/db')
      const tenant = await queryOne<any>(
        `SELECT t.company_name, t.logo_url, t.primary_color, t.secondary_color, t.email, t.phone,
                wlc.support_email, wlc.support_phone, wlc.footer_text
         FROM tenants t
         LEFT JOIN white_label_config wlc ON wlc.tenant_id = t.id
         WHERE t.id = $1`,
        [tenantId]
      )
      if (!tenant) return null

      return {
        companyName: tenant.company_name,
        logoUrl: tenant.logo_url,
        primaryColor: tenant.primary_color || '#0066FF',
        secondaryColor: tenant.secondary_color || '#0052CC',
        supportEmail: tenant.support_email || tenant.email || 'contacto@asoperadora.com',
        supportPhone: tenant.support_phone || tenant.phone || '+52 720 815 6804',
        footerText: tenant.footer_text || `© ${tenant.company_name}. Todos los derechos reservados.`,
      }
    } catch (error) {
      console.error('Error loading tenant branding:', error)
      return null
    }
  }

  /**
   * Wrapper HTML con branding dinámico del tenant
   */
  brandedEmailWrapper(content: string, branding?: TenantBranding | null): string {
    const b = branding || {
      companyName: 'AS Operadora de Viajes y Eventos',
      logoUrl: null,
      primaryColor: '#0066FF',
      secondaryColor: '#0052CC',
      supportEmail: 'contacto@asoperadora.com',
      supportPhone: '+52 720 815 6804',
      footerText: '© AS Operadora de Viajes y Eventos. Todos los derechos reservados.',
    }

    const logoHtml = b.logoUrl
      ? `<img src="${b.logoUrl}" alt="${b.companyName}" style="max-height: 50px; margin-bottom: 15px;" /><br>`
      : ''

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${b.primaryColor} 0%, ${b.secondaryColor} 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .label { color: #6b7280; font-size: 14px; margin-bottom: 5px; }
          .value { color: #111827; font-size: 16px; font-weight: 600; margin-bottom: 15px; }
          .price { font-size: 32px; font-weight: bold; color: ${b.primaryColor}; margin: 20px 0; }
          .button { display: inline-block; background: ${b.primaryColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${logoHtml}
            <h1 style="margin: 0;">${b.companyName}</h1>
          </div>
          <div class="content">
            ${content}
            <div class="footer">
              <p>
                <strong>${b.companyName}</strong><br>
                ${b.footerText}<br>
                <a href="mailto:${b.supportEmail}">${b.supportEmail}</a>
                ${b.supportPhone ? ` | ${b.supportPhone}` : ''}
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Email de confirmación de reserva (con branding dinámico)
   */
  async sendBookingConfirmation(
    email: string,
    data: BookingConfirmationData
  ): Promise<boolean> {
    // Cargar branding si hay tenantId
    let branding: TenantBranding | null = null
    if (data.tenantId) {
      branding = await this.getTenantBranding(data.tenantId)
    }

    const subject = `Confirmación de Reserva - ${data.bookingReference}`

    const contentHtml = `
      <div class="card">
        <h2 style="margin-top: 0;">¡Reserva Confirmada!</h2>
        <p>Hola ${data.userName}, tu reserva ha sido confirmada exitosamente.</p>
      </div>

      <div class="card">
        <div class="label">Referencia de Reserva</div>
        <div class="value">${data.bookingReference}</div>

        <div class="label">Tipo de Servicio</div>
        <div class="value">${data.bookingType === 'flight' ? 'Vuelo' : data.bookingType === 'hotel' ? 'Hotel' : 'Paquete'}</div>

        ${data.details?.outbound ? `
          <div class="label">Ruta</div>
          <div class="value">${data.details.outbound.origin} → ${data.details.outbound.destination}</div>
          <div class="label">Aerolínea</div>
          <div class="value">${data.details.airline || 'N/A'}</div>
        ` : ''}

        ${data.details?.name ? `
          <div class="label">Hotel</div>
          <div class="value">${data.details.name}</div>
          <div class="label">Ubicación</div>
          <div class="value">${data.details.city || 'N/A'}</div>
        ` : ''}

        <div class="price">
          ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: data.currency }).format(data.totalAmount)}
        </div>
      </div>

      <div class="card" style="text-align: center;">
        <p><strong>Importante:</strong> Guarda este correo como comprobante de tu reserva.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/mis-reservas" class="button">
          Ver Mi Reserva
        </a>
      </div>
    `

    const html = this.brandedEmailWrapper(contentHtml, branding)

    return await this.sendEmail({
      to: email,
      subject,
      html,
      fromName: branding?.companyName,
    })
  }

  /**
   * Email de factura generada (con branding dinámico)
   */
  async sendInvoiceEmail(
    email: string,
    invoiceData: {
      folio: string
      total: number
      currency: string
      pdfUrl: string
      xmlUrl: string
      tenantId?: number
    }
  ): Promise<boolean> {
    let branding: TenantBranding | null = null
    if (invoiceData.tenantId) {
      branding = await this.getTenantBranding(invoiceData.tenantId)
    }

    const subject = `Factura CFDI - ${invoiceData.folio}`

    const contentHtml = `
      <div class="card">
        <h2 style="margin-top: 0;">Factura CFDI Generada</h2>
        <p>Tu factura CFDI ha sido generada exitosamente.</p>

        <p><strong>Folio:</strong> ${invoiceData.folio}</p>
        <p><strong>Total:</strong> ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoiceData.currency }).format(invoiceData.total)}</p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${invoiceData.pdfUrl}" class="button">Descargar PDF</a>
          <a href="${invoiceData.xmlUrl}" class="button">Descargar XML</a>
        </div>
      </div>
    `

    const html = this.brandedEmailWrapper(contentHtml, branding)

    return await this.sendEmail({
      to: email,
      subject,
      html,
      fromName: branding?.companyName,
    })
  }

  /**
   * Email de recordatorio de pago (con branding dinámico)
   */
  async sendPaymentReminder(
    email: string,
    accountData: {
      customerName: string
      amount: number
      currency: string
      dueDate: string
      accountId: number
      tenantId?: number
    }
  ): Promise<boolean> {
    let branding: TenantBranding | null = null
    if (accountData.tenantId) {
      branding = await this.getTenantBranding(accountData.tenantId)
    }

    const subject = `Recordatorio de Pago - Vence ${accountData.dueDate}`

    const contentHtml = `
      <div class="card">
        <h2 style="margin-top: 0;">Recordatorio de Pago</h2>
        <p>Hola ${accountData.customerName}, te recordamos que tienes un pago pendiente:</p>

        <div style="font-size: 36px; font-weight: bold; color: #dc2626; margin: 20px 0; text-align: center;">
          ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: accountData.currency }).format(accountData.amount)}
        </div>

        <p><strong>Fecha de vencimiento:</strong> ${accountData.dueDate}</p>
        <p>Por favor realiza tu pago a la brevedad posible para evitar cargos adicionales.</p>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard" class="button">
            Ver Detalles
          </a>
        </div>
      </div>
    `

    const html = this.brandedEmailWrapper(contentHtml, branding)

    return await this.sendEmail({
      to: email,
      subject,
      html,
      fromName: branding?.companyName,
    })
  }

  /**
   * Email de cancelación de reserva (con branding dinámico)
   */
  async sendCancellationEmail(
    email: string,
    bookingReference: string,
    reason: string,
    tenantId?: number
  ): Promise<boolean> {
    let branding: TenantBranding | null = null
    if (tenantId) {
      branding = await this.getTenantBranding(tenantId)
    }

    const subject = `Reserva Cancelada - ${bookingReference}`

    const contentHtml = `
      <div class="card">
        <h2 style="margin-top: 0;">Reserva Cancelada</h2>
        <p>Tu reserva <strong>${bookingReference}</strong> ha sido cancelada.</p>
        <p><strong>Motivo:</strong> ${reason}</p>
        <p>Si esto fue un error, por favor contáctanos lo antes posible.</p>
      </div>
    `

    const html = this.brandedEmailWrapper(contentHtml, branding)

    return await this.sendEmail({
      to: email,
      subject,
      html,
      fromName: branding?.companyName,
    })
  }
}

export default new NotificationService()
