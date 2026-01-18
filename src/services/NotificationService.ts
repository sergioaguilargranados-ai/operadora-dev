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
}

interface BookingConfirmationData {
  userName: string
  bookingReference: string
  bookingType: string
  totalAmount: number
  currency: string
  details: any
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
          from: { email: this.fromEmail, name: 'AS Operadora de Viajes' },
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
   * Email de confirmación de reserva
   */
  async sendBookingConfirmation(
    email: string,
    data: BookingConfirmationData
  ): Promise<boolean> {
    const subject = `Confirmación de Reserva - ${data.bookingReference}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .label { color: #6b7280; font-size: 14px; margin-bottom: 5px; }
          .value { color: #111827; font-size: 16px; font-weight: 600; margin-bottom: 15px; }
          .price { font-size: 32px; font-weight: bold; color: #2563eb; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">¡Reserva Confirmada!</h1>
            <p style="margin: 10px 0 0 0;">Gracias por tu confianza</p>
          </div>

          <div class="content">
            <div class="card">
              <h2 style="margin-top: 0;">Hola ${data.userName},</h2>
              <p>Tu reserva ha sido confirmada exitosamente. A continuación encontrarás los detalles:</p>
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

            <div class="footer">
              <p>
                <strong>AS Operadora de Viajes y Eventos</strong><br>
                Experiencias que inspiran<br>
                <a href="mailto:soporte@asoperadora.com">soporte@asoperadora.com</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: email,
      subject,
      html
    })
  }

  /**
   * Email de factura generada
   */
  async sendInvoiceEmail(
    email: string,
    invoiceData: {
      folio: string
      total: number
      currency: string
      pdfUrl: string
      xmlUrl: string
    }
  ): Promise<boolean> {
    const subject = `Factura CFDI - ${invoiceData.folio}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Factura CFDI Generada</h1>
          </div>

          <div class="content">
            <div class="card">
              <h2 style="margin-top: 0;">Factura Lista</h2>
              <p>Tu factura CFDI ha sido generada exitosamente.</p>

              <p><strong>Folio:</strong> ${invoiceData.folio}</p>
              <p><strong>Total:</strong> ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoiceData.currency }).format(invoiceData.total)}</p>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${invoiceData.pdfUrl}" class="button">Descargar PDF</a>
                <a href="${invoiceData.xmlUrl}" class="button">Descargar XML</a>
              </div>
            </div>

            <div class="footer">
              <p>
                <strong>AS Operadora de Viajes y Eventos</strong><br>
                <a href="mailto:soporte@asoperadora.com">soporte@asoperadora.com</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: email,
      subject,
      html
    })
  }

  /**
   * Email de recordatorio de pago
   */
  async sendPaymentReminder(
    email: string,
    accountData: {
      customerName: string
      amount: number
      currency: string
      dueDate: string
      accountId: number
    }
  ): Promise<boolean> {
    const subject = `Recordatorio de Pago - Vence ${accountData.dueDate}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .amount { font-size: 36px; font-weight: bold; color: #dc2626; margin: 20px 0; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Recordatorio de Pago</h1>
          </div>

          <div class="content">
            <div class="card">
              <h2 style="margin-top: 0;">Hola ${accountData.customerName},</h2>
              <p>Te recordamos que tienes un pago pendiente:</p>

              <div class="amount">
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
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: email,
      subject,
      html
    })
  }

  /**
   * Email de cancelación de reserva
   */
  async sendCancellationEmail(
    email: string,
    bookingReference: string,
    reason: string
  ): Promise<boolean> {
    const subject = `Reserva Cancelada - ${bookingReference}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6b7280; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Reserva Cancelada</h1>
          </div>

          <div class="content">
            <div class="card">
              <p>Tu reserva <strong>${bookingReference}</strong> ha sido cancelada.</p>
              <p><strong>Motivo:</strong> ${reason}</p>
              <p>Si esto fue un error, por favor contáctanos lo antes posible.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: email,
      subject,
      html
    })
  }
}

export default new NotificationService()
