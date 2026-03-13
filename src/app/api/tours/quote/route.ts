import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendEmail } from '@/lib/emailHelper'

// Generar folio con formato AS-99999-AAMMDD-99999
async function generateFolio(tourId: string): Promise<string> {
    const tourNum = tourId.replace(/\D/g, '').slice(0, 5).padStart(5, '0')
    const now = new Date()
    const aa = String(now.getFullYear()).slice(-2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const dateStr = `${aa}${mm}${dd}`
    try {
        const seqResult = await query(`SELECT nextval('tour_quote_folio_seq') as seq`)
        const seq = String(seqResult.rows[0].seq).padStart(5, '0')
        return `AS-${tourNum}-${dateStr}-${seq}`
    } catch {
        const fallbackSeq = String(Date.now() % 100000).padStart(5, '0')
        return `AS-${tourNum}-${dateStr}-${fallbackSeq}`
    }
}

// Generar HTML del email con colores y marca AS Operadora
function buildQuoteEmailHtml(p: {
    contactName: string
    tourName: string
    tourCode: string
    folio: string
    tourRegion: string
    tourDuration: string
    departureLine: string
    originLine: string
    personas: number
    basePrice: number
    taxesAmount: number
    supplementAmount: number
    totalPP: number
    totalPrice: number
    trackingUrl: string
}): string {
    const fmt = (n: number) => `$${n.toLocaleString('es-MX')} USD`
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:24px 0;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<!-- Header azul -->
<tr><td style="background:linear-gradient(135deg,#0052cc,#0066FF);padding:28px 32px;">
<table width="100%"><tr>
<td><span style="font-family:Georgia,serif;font-size:30px;font-weight:bold;color:white;">AS</span><span style="color:rgba(255,255,255,0.85);font-size:13px;margin-left:10px;">Operadora de Viajes</span></td>
<td style="text-align:right;color:rgba(255,255,255,0.8);font-size:11px;">Solicitud de Cotizaci\u00f3n</td>
</tr></table>
</td></tr>

<!-- Franja dorada -->
<tr><td style="background:#b8860b;height:3px;"></td></tr>

<!-- Cuerpo -->
<tr><td style="padding:32px;">
<h2 style="color:#1e3a5f;margin:0 0 6px 0;font-size:20px;">\u00a1Hola, ${p.contactName}!</h2>
<p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 24px 0;">
Hemos recibido tu solicitud de cotizaci\u00f3n para <strong>${p.tourName}</strong>.<br>
Nuestro equipo la revisar\u00e1 y te contactar\u00e1 con una propuesta personalizada muy pronto.
</p>

<!-- Card de cotizaci\u00f3n -->
<table width="100%" style="background:#f8fafd;border:1px solid #dce8f8;border-radius:8px;margin:0 0 24px 0;">
<tr><td style="padding:20px;">
<table width="100%">
<tr>
<td colspan="2" style="padding-bottom:14px;border-bottom:1px solid #e0eaf5;">
<div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Tour</div>
<div style="font-size:16px;font-weight:bold;color:#1e3a5f;margin-top:2px;">${p.tourName}</div>
<div style="display:inline-block;margin-top:6px;background:#dbeafe;color:#1e40af;font-family:monospace;font-weight:bold;font-size:12px;padding:2px 10px;border-radius:4px;">${p.tourCode}</div>
</td>
</tr>
<tr><td style="padding:8px 0 0;color:#666;font-size:13px;">\ud83d\udccb Folio:</td><td style="padding:8px 0 0;font-weight:bold;font-size:13px;text-align:right;color:#1e3a5f;">${p.folio}</td></tr>
${p.tourRegion ? `<tr><td style="padding:4px 0;color:#666;font-size:13px;">\ud83d\udccd Regi\u00f3n:</td><td style="padding:4px 0;font-size:13px;text-align:right;">${p.tourRegion}</td></tr>` : ''}
${p.tourDuration ? `<tr><td style="padding:4px 0;color:#666;font-size:13px;">\ud83d\udd50 Duraci\u00f3n:</td><td style="padding:4px 0;font-size:13px;text-align:right;">${p.tourDuration}</td></tr>` : ''}
${p.departureLine ? `<tr><td style="padding:4px 0;color:#666;font-size:13px;">\ud83d\udcc5 Salida:</td><td style="padding:4px 0;font-size:13px;text-align:right;">${p.departureLine}</td></tr>` : ''}
${p.originLine ? `<tr><td style="padding:4px 0;color:#666;font-size:13px;">\ud83d\udeeb Ciudad salida:</td><td style="padding:4px 0;font-size:13px;text-align:right;">${p.originLine}</td></tr>` : ''}
<tr><td style="padding:4px 0;color:#666;font-size:13px;">\ud83d\udc65 Personas:</td><td style="padding:4px 0;font-size:13px;text-align:right;">${p.personas}</td></tr>
<tr><td style="padding:4px 0;color:#666;font-size:13px;">\ud83d\udcb0 Precio base/persona:</td><td style="padding:4px 0;font-size:13px;text-align:right;">${fmt(p.basePrice)}</td></tr>
${p.taxesAmount > 0 ? `<tr><td style="padding:4px 0;color:#666;font-size:13px;">\u2708\ufe0f Impuestos:</td><td style="padding:4px 0;font-size:13px;text-align:right;">${fmt(p.taxesAmount)}</td></tr>` : ''}
${p.supplementAmount > 0 ? `<tr><td style="padding:4px 0;color:#666;font-size:13px;">\u2795 Suplemento:</td><td style="padding:4px 0;font-size:13px;text-align:right;">${fmt(p.supplementAmount)}</td></tr>` : ''}
<tr><td colspan="2" style="padding-top:12px;border-top:1px solid #e0eaf5;">
<table width="100%">
<tr>
<td style="color:#1e3a5f;font-weight:bold;font-size:15px;">Total por persona:</td>
<td style="text-align:right;color:#0066FF;font-weight:bold;font-size:22px;">${fmt(p.totalPP)}</td>
</tr>
<tr>
<td style="color:#555;font-size:12px;padding-top:2px;">Total estimado (${p.personas} persona${p.personas !== 1 ? 's' : ''}):</td>
<td style="text-align:right;color:#555;font-size:13px;font-weight:bold;padding-top:2px;">${fmt(p.totalPrice)}</td>
</tr>
</table>
</td></tr>
</table>
</td></tr>
</table>

<!-- Bot\u00f3n CTA -->
<table width="100%"><tr><td align="center" style="padding:0 0 24px;">
<a href="${p.trackingUrl}" style="display:inline-block;background:#0066FF;color:white;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:bold;font-size:15px;">\ud83d\udccb Ver Estado de mi Cotizaci\u00f3n</a>
</td></tr></table>

<p style="color:#999;font-size:12px;line-height:1.6;margin:0;">
Puedes acceder a tu cotizaci\u00f3n en cualquier momento con el enlace anterior.<br>
Para dudas inmediatas escr\u00edbenos por WhatsApp: <a href="tel:+527208156804" style="color:#0066FF;">+52 720 815 6804</a>
</p>
</td></tr>

<!-- Footer -->
<tr><td style="background:#1e3a5f;padding:20px 32px;">
<table width="100%"><tr>
<td><span style="font-family:Georgia,serif;font-weight:bold;font-size:15px;color:white;">AS</span><span style="color:rgba(255,255,255,0.7);font-size:11px;margin-left:8px;">Operadora de Viajes y Eventos \u00b7 AS Viajando</span></td>
<td style="text-align:right;color:rgba(255,255,255,0.6);font-size:11px;">viajes@asoperadora.com<br>+52 720 815 6804</td>
</tr></table>
</td></tr>
<tr><td style="background:#b8860b;height:2px;"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            tourId,
            tourName,
            tourPrice,
            tourRegion,
            tourDuration,
            tourCities,
            contactName,
            contactEmail,
            contactPhone,
            numPersonas,
            specialRequests,
            notificationMethod,
            departureDate,
            taxes,
            supplement,
            totalPerPerson,
            originCity
        } = body

        // Validaciones
        if (!tourId || !tourName || !contactName || !contactEmail) {
            return NextResponse.json(
                { success: false, error: 'Faltan datos requeridos' },
                { status: 400 }
            )
        }

        // Generar folio
        const folio = await generateFolio(tourId)

        // Calcular precios
        const basePrice = parseFloat(tourPrice) || 0
        const taxesAmount = parseFloat(taxes) || 0
        const supplementAmount = parseFloat(supplement) || 0
        const totalPP = parseFloat(totalPerPerson) || (basePrice + taxesAmount + supplementAmount)
        const personas = parseInt(numPersonas) || 1
        const totalPrice = totalPP * personas

        // Código de viaje en formato AS
        const tourCode = `AS-${tourId.replace(/^(AS-|MT-)/, '')}`

        // Guardar en base de datos
        const result = await query(`
            INSERT INTO tour_quotes (
                folio, tour_id, tour_name, tour_region, tour_duration, tour_cities,
                contact_name, contact_email, contact_phone, num_personas,
                price_per_person, total_price, special_requests, notification_method,
                departure_date, taxes, supplement, origin_city, total_per_person, status, created_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW())
            RETURNING id, folio
        `, [
            folio, tourId, tourName, tourRegion || '', tourDuration || '',
            Array.isArray(tourCities) ? tourCities.join(', ') : tourCities || '',
            contactName, contactEmail, contactPhone || '', personas,
            basePrice, totalPrice, specialRequests || '',
            notificationMethod || 'both', departureDate || null,
            taxesAmount, supplementAmount, originCity || null, totalPP, 'pending'
        ])

        const quoteId = result.rows[0].id
        const quoteFolio = result.rows[0].folio
        const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.as-ope-viajes.company'}/cotizacion/${quoteFolio}`

        // Líneas de detalle para mensajes y email
        const departureLine = departureDate
            ? new Date(departureDate + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
            : ''
        const originLine = originCity || ''
        const taxesLine = taxesAmount > 0 ? `• Impuestos: $${taxesAmount.toLocaleString('es-MX')} USD\n` : ''
        const supplementLine = supplementAmount > 0 ? `• Suplemento: $${supplementAmount.toLocaleString('es-MX')} USD\n` : ''

        // ============================================
        // ENVÍO DE EMAIL (automático con HTML de marca)
        // ============================================
        let emailSent = false
        let emailError: string | null = null
        const shouldSendEmail = !notificationMethod || notificationMethod === 'email' || notificationMethod === 'both'

        if (shouldSendEmail && contactEmail) {
            try {
                const emailHtml = buildQuoteEmailHtml({
                    contactName, tourName, tourCode, folio: quoteFolio,
                    tourRegion: tourRegion || '', tourDuration: tourDuration || '',
                    departureLine, originLine, personas,
                    basePrice, taxesAmount, supplementAmount, totalPP, totalPrice, trackingUrl
                })
                emailSent = await sendEmail({
                    to: contactEmail,
                    subject: `📋 Solicitud recibida — ${tourCode} ${tourName} | AS Operadora`,
                    html: emailHtml,
                    messageType: 'tour_quote'
                })
                console.log(`${emailSent ? '✅' : '❌'} Email cotización a: ${contactEmail}`)
                if (!emailSent) emailError = 'sendEmail returned false — credenciales SMTP o configuración incorrecta'
            } catch (err: any) {
                emailError = err?.message || 'Error desconocido en email'
                console.error('⚠️ Error SMTP:', err?.message, '| code:', err?.code, '| response:', err?.response)
            }
        }

        // ============================================
        // COMMUNICATION CENTER — Thread bidireccional
        // ============================================
        try {
            const threadResult = await query(`
                INSERT INTO communication_threads (
                    thread_type, subject, reference_type, reference_id,
                    status, priority, tenant_id, created_at
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
                RETURNING id
            `, ['inquiry', `Cotización de Tour: ${tourName}`, 'tour_quote', quoteId, 'active', 'normal', 1])

            const threadId = threadResult.rows[0].id

            // Mensaje INBOUND — lo que el cliente "envió" (su solicitud)
            await query(`
                INSERT INTO messages (
                    thread_id, sender_type, sender_name, sender_email,
                    body, message_type, status, tenant_id, created_at, sent_at
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())
            `, [
                threadId, 'customer', contactName, contactEmail,
                `Solicitud de cotización enviada desde el portal.\n\n📋 Detalles:\n• Folio: ${quoteFolio}\n• Código del viaje: ${tourCode}\n• Tour: ${tourName}\n• Región: ${tourRegion || '-'}\n• Duración: ${tourDuration || '-'}\n${departureLine ? `• Fecha de salida: ${departureLine}\n` : ''}${originLine ? `• Ciudad de salida: ${originLine}\n` : ''}• Personas: ${personas}\n• Precio base: $${basePrice.toLocaleString('es-MX')} USD\n${taxesLine}${supplementLine}• Total por persona: $${totalPP.toLocaleString('es-MX')} USD\n• Total estimado: $${totalPrice.toLocaleString('es-MX')} USD${specialRequests ? `\n• Comentarios: ${specialRequests}` : ''}`,
                'text', 'sent', 1
            ])

            // Mensaje OUTBOUND — respuesta automática del sistema
            await query(`
                INSERT INTO messages (
                    thread_id, sender_type, sender_name, sender_email,
                    body, message_type, status, tenant_id, created_at, sent_at
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())
            `, [
                threadId, 'system', 'AS Operadora', 'viajes@asoperadora.com',
                `¡Hola ${contactName}!\n\nHemos recibido tu solicitud de cotización para "${tourName}" (${tourCode}).\n\nFolio: ${quoteFolio}\nURL de seguimiento: ${trackingUrl}\n\n${emailSent ? '✅ Correo de confirmación enviado a: ' + contactEmail : '📱 Se notificará por WhatsApp'}\n\nNuestro equipo te contactará pronto con una propuesta personalizada.\n\n¡Gracias por tu preferencia!`,
                'text', 'sent', 1
            ])

            console.log(`✅ Thread de comunicación creado (ID: ${threadId}) para ${quoteFolio}`)
        } catch (commError) {
            console.error('⚠️ Error en Communication Center:', commError)
        }

        // ============================================
        // CRM - Upsert contacto e interacción
        // ============================================
        try {
            const { CRMService } = await import('@/services/CRMService')
            const crm = new CRMService()

            const contact = await crm.createContact({
                full_name: contactName,
                email: contactEmail,
                phone: contactPhone || '',
                source: 'tour_quote',
                source_detail: `Tour: ${tourName}`,
                contact_type: 'lead',
                pipeline_stage: 'new',
                interested_destination: tourRegion || '',
                num_travelers: personas,
                travel_type: 'tour',
                special_requirements: specialRequests || '',
                tags: ['tour', tourRegion || 'general'].filter(Boolean),
                notes: `Cotización ${quoteFolio} - ${tourName}`
            })

            await crm.createInteraction({
                contact_id: contact.id,
                interaction_type: 'quote_request',
                channel: 'web',
                direction: 'inbound',
                subject: `Cotización: ${tourCode} ${tourName}`,
                body: `Solicitud de cotización. Folio: ${quoteFolio}. ${personas} personas. Total: $${totalPrice.toLocaleString('es-MX')} USD`,
                is_automated: true,
                metadata: { folio: quoteFolio, tourId, tourCode, tourName, numPersonas: personas, totalPrice }
            })

            console.log(`✅ CRM actualizado para ${contactEmail}`)
        } catch (crmError) {
            console.error('⚠️ Error en CRM:', crmError)
        }

        return NextResponse.json({
            success: true,
            message: `¡Cotización ${quoteFolio} creada exitosamente! ${emailSent ? 'Te enviamos un correo de confirmación.' : 'Te contactaremos pronto.'}`,
            data: { id: quoteId, folio: quoteFolio, trackingUrl, totalPrice, totalPerPerson: totalPP, emailSent, emailError }
        }, { status: 201 })

    } catch (error: any) {
        console.error('❌ Error creando cotización:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Error al crear la cotización' },
            { status: 500 }
        )
    }
}
