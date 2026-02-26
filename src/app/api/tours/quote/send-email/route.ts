import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/emailHelper'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { folio, to, customerName, tourName, total, currency, trackingUrl } = body

        if (!folio || !to) {
            return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
        }

        const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:white;">
                <!-- Header azul -->
                <tr>
                    <td style="background:#0066FF;padding:24px 32px;">
                        <table width="100%">
                            <tr>
                                <td>
                                    <span style="font-family:Georgia,serif;font-size:28px;font-weight:bold;color:white;">AS</span>
                                    <span style="color:rgba(255,255,255,0.9);font-size:12px;margin-left:8px;">Operadora de Viajes</span>
                                </td>
                                <td style="text-align:right;color:white;font-size:12px;">
                                    Cotización de Tour
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Contenido -->
                <tr>
                    <td style="padding:32px;">
                        <h2 style="color:#333;margin:0 0 8px 0;font-size:20px;">
                            Hola ${customerName || 'Estimado cliente'},
                        </h2>
                        <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
                            Le compartimos su cotización del tour <strong>${tourName || ''}</strong>.
                            A continuación encontrará los detalles:
                        </p>

                        <!-- Card de la cotización -->
                        <table width="100%" style="background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;margin:0 0 24px 0;">
                            <tr>
                                <td style="padding:20px;">
                                    <table width="100%">
                                        <tr>
                                            <td style="padding:4px 0;color:#888;font-size:12px;">Folio:</td>
                                            <td style="padding:4px 0;font-weight:bold;font-size:14px;text-align:right;">${folio}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:4px 0;color:#888;font-size:12px;">Tour:</td>
                                            <td style="padding:4px 0;font-weight:bold;font-size:14px;text-align:right;">${tourName || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2" style="border-top:1px solid #e0e0e0;padding-top:12px;margin-top:12px;">
                                                <table width="100%">
                                                    <tr>
                                                        <td style="color:#333;font-weight:bold;font-size:16px;">Total:</td>
                                                        <td style="text-align:right;color:#0066FF;font-weight:bold;font-size:22px;">
                                                            $${total ? Number(total).toLocaleString() : '0'} ${currency || 'USD'}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <!-- Botón CTA -->
                        <table width="100%">
                            <tr>
                                <td style="text-align:center;padding:0 0 24px 0;">
                                    <a href="${trackingUrl}" style="display:inline-block;background:#0066FF;color:white;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:bold;font-size:15px;">
                                        📋 Ver Cotización Completa
                                    </a>
                                </td>
                            </tr>
                        </table>

                        <p style="color:#999;font-size:12px;line-height:1.5;margin:0;">
                            Puede acceder a su cotización en cualquier momento usando el enlace anterior.
                            Si tiene alguna pregunta, no dude en contactarnos.
                        </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background:#1e3a5f;padding:20px 32px;color:rgba(255,255,255,0.8);font-size:11px;">
                        <table width="100%">
                            <tr>
                                <td>
                                    <span style="font-family:Georgia,serif;font-weight:bold;font-size:14px;color:white;">AS</span>
                                    <span style="margin-left:6px;">Operadora de Viajes y Eventos</span>
                                </td>
                                <td style="text-align:right;">
                                    viajes@asoperadora.com · +52 720 815 6804
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>`

        const sent = await sendEmail({
            to,
            subject: `📋 Cotización ${folio} — ${tourName || 'Tour'} | AS Operadora`,
            html,
            messageType: 'tour_quote'
        })

        if (sent) {
            return NextResponse.json({ success: true, sentTo: to })
        } else {
            return NextResponse.json({ success: false, error: 'No se pudo enviar el correo' }, { status: 500 })
        }
    } catch (error: any) {
        console.error('Error en send-email:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
