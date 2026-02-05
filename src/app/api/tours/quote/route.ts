import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const WHATSAPP_NUMBER = '+527208156804' // Número oficial AS Operadora

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
            notificationMethod
        } = body

        // Validaciones
        if (!tourId || !tourName || !contactName || !contactEmail) {
            return NextResponse.json(
                { success: false, error: 'Faltan datos requeridos' },
                { status: 400 }
            )
        }

        // Generar folio único
        const folio = `TOUR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

        // Calcular precio total
        const pricePerPerson = parseFloat(tourPrice) || 0
        const totalPrice = pricePerPerson * (parseInt(numPersonas) || 1)

        // Guardar en base de datos
        const insertQuery = `
            INSERT INTO tour_quotes (
                folio,
                tour_id,
                tour_name,
                tour_region,
                tour_duration,
                tour_cities,
                contact_name,
                contact_email,
                contact_phone,
                num_personas,
                price_per_person,
                total_price,
                special_requests,
                notification_method,
                status,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
            RETURNING id, folio
        `

        const result = await query(insertQuery, [
            folio,
            tourId,
            tourName,
            tourRegion || '',
            tourDuration || '',
            Array.isArray(tourCities) ? tourCities.join(', ') : tourCities || '',
            contactName,
            contactEmail,
            contactPhone || '',
            parseInt(numPersonas) || 1,
            pricePerPerson,
            totalPrice,
            specialRequests || '',
            notificationMethod || 'both',
            'pending'
        ])

        const quoteId = result.rows[0].id
        const quoteFolio = result.rows[0].folio

        // ============================================
        // CREAR THREAD DE COMUNICACIÓN
        // ============================================
        try {
            // Crear thread de comunicación para esta cotización
            const threadResult = await query(`
                INSERT INTO communication_threads (
                    thread_type,
                    subject,
                    reference_type,
                    reference_id,
                    status,
                    priority,
                    tenant_id,
                    created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                RETURNING id
            `, [
                'inquiry',
                `Cotización de Tour: ${tourName}`,
                'tour_quote',
                quoteId,
                'active',
                'normal',
                1 // tenant_id
            ])

            const threadId = threadResult.rows[0].id

            // Crear mensaje automático de confirmación
            await query(`
                INSERT INTO messages (
                    thread_id,
                    sender_type,
                    sender_name,
                    sender_email,
                    body,
                    message_type,
                    status,
                    tenant_id,
                    created_at,
                    sent_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            `, [
                threadId,
                'system',
                'AS Operadora',
                'viajes@asoperadora.com',
                `¡Hola ${contactName}!

Hemos recibido tu solicitud de cotización para el tour "${tourName}".

📋 Detalles de tu solicitud:
• Folio: ${quoteFolio}
• Tour: ${tourName}
• Región: ${tourRegion}
• Duración: ${tourDuration}
• Personas: ${numPersonas}
• Precio estimado: $${totalPrice.toLocaleString('es-MX')} USD

Nuestro equipo revisará tu solicitud y te contactaremos pronto con una propuesta personalizada.

Puedes dar seguimiento a tu cotización en: ${process.env.NEXT_PUBLIC_APP_URL || 'https://www.as-ope-viajes.company'}/cotizacion/${quoteFolio}

¡Gracias por tu preferencia!`,
                'text',
                'sent',
                1 // tenant_id
            ])

            console.log(`✅ Thread de comunicación creado (ID: ${threadId}) para cotización ${quoteFolio}`)
        } catch (commError) {
            console.error('⚠️ Error creando thread de comunicación:', commError)
            // No fallar la cotización si falla la comunicación
        }

        // Generar URL de seguimiento
        const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.as-ope-viajes.company'}/cotizacion/${quoteFolio}`

        // Preparar mensajes de notificación
        const whatsappMessage = `
🌍 *Nueva Cotización de Tour*

*Folio:* ${quoteFolio}
*Tour:* ${tourName}
*Región:* ${tourRegion}
*Duración:* ${tourDuration}
*Personas:* ${numPersonas}
*Precio por persona:* $${pricePerPerson.toLocaleString('es-MX')} USD
*Total estimado:* $${totalPrice.toLocaleString('es-MX')} USD

*Cliente:*
${contactName}
${contactEmail}
${contactPhone ? `Tel: ${contactPhone}` : ''}

${specialRequests ? `*Comentarios:* ${specialRequests}` : ''}

*Seguimiento:* ${trackingUrl}

¡Gracias por tu interés! Te contactaremos pronto.
        `.trim()

        const emailSubject = `Cotización de Tour - ${tourName} (${quoteFolio})`
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-label { font-weight: bold; color: #6b7280; }
        .info-value { color: #111827; }
        .price { font-size: 24px; font-weight: bold; color: #2563eb; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Gracias por tu interés!</h1>
            <p>Hemos recibido tu solicitud de cotización</p>
        </div>
        <div class="content">
            <p>Hola <strong>${contactName}</strong>,</p>
            <p>Hemos recibido tu solicitud de cotización para el tour <strong>${tourName}</strong>. Nuestro equipo revisará tu solicitud y te contactaremos pronto con una propuesta personalizada.</p>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #2563eb;">Detalles de tu Cotización</h3>
                <div class="info-row">
                    <span class="info-label">Folio:</span>
                    <span class="info-value">${quoteFolio}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tour:</span>
                    <span class="info-value">${tourName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Región:</span>
                    <span class="info-value">${tourRegion}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Duración:</span>
                    <span class="info-value">${tourDuration}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Personas:</span>
                    <span class="info-value">${numPersonas}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Precio por persona:</span>
                    <span class="info-value price">$${pricePerPerson.toLocaleString('es-MX')} USD</span>
                </div>
                <div class="info-row" style="border-bottom: none;">
                    <span class="info-label">Total estimado:</span>
                    <span class="info-value price">$${totalPrice.toLocaleString('es-MX')} USD</span>
                </div>
            </div>

            ${specialRequests ? `
            <div class="info-box">
                <h4 style="margin-top: 0;">Tus comentarios:</h4>
                <p>${specialRequests}</p>
            </div>
            ` : ''}

            <div style="text-align: center;">
                <a href="${trackingUrl}" class="button">Ver Estado de Cotización</a>
            </div>

            <p><strong>¿Qué sigue?</strong></p>
            <ul>
                <li>Revisaremos tu solicitud en las próximas 24 horas</li>
                <li>Te contactaremos ${notificationMethod === 'whatsapp' ? 'por WhatsApp' : notificationMethod === 'email' ? 'por correo electrónico' : 'por WhatsApp y correo electrónico'}</li>
                <li>Recibirás una cotización personalizada con opciones de pago</li>
            </ul>

            <div class="footer">
                <p><strong>AS Operadora de Viajes y Eventos</strong></p>
                <p>Tel: ${WHATSAPP_NUMBER} | Email: viajes@asoperadora.com</p>
                <p>© 2026 Todos los derechos reservados</p>
            </div>
        </div>
    </div>
</body>
</html>
        `.trim()

        // Enviar notificaciones según preferencia
        // TODO: Implementar envío real de WhatsApp y Email
        // Por ahora solo registramos en consola
        console.log('=== NUEVA COTIZACIÓN DE TOUR ===')
        console.log('Folio:', quoteFolio)
        console.log('Tour:', tourName)
        console.log('Cliente:', contactName, contactEmail)
        console.log('Método de notificación:', notificationMethod)
        console.log('URL de seguimiento:', trackingUrl)

        if (notificationMethod === 'whatsapp' || notificationMethod === 'both') {
            console.log('\n--- WhatsApp Message ---')
            console.log(whatsappMessage)
            // TODO: Integrar con API de WhatsApp Business
        }

        if (notificationMethod === 'email' || notificationMethod === 'both') {
            console.log('\n--- Email ---')
            console.log('To:', contactEmail)
            console.log('Subject:', emailSubject)
            // TODO: Integrar con SendGrid o servicio de email
        }

        return NextResponse.json({
            success: true,
            message: 'Cotización enviada exitosamente. Te contactaremos pronto.',
            data: {
                folio: quoteFolio,
                quoteId,
                trackingUrl,
                notificationMethod
            }
        })

    } catch (error) {
        console.error('Error creating tour quote:', error)
        return NextResponse.json(
            { success: false, error: 'Error al procesar la cotización' },
            { status: 500 }
        )
    }
}
