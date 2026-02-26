import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ folio: string }> }
) {
    try {
        const { folio } = await params

        if (!folio) {
            return NextResponse.json({ success: false, error: 'Folio requerido' }, { status: 400 })
        }

        const result = await query(`SELECT * FROM tour_quotes WHERE folio = $1`, [folio])

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Cotización no encontrada' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: result.rows[0] })

    } catch (error) {
        console.error('Error fetching quote:', error)
        return NextResponse.json({ success: false, error: 'Error al obtener la cotización' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ folio: string }> }
) {
    try {
        const { folio } = await params
        const body = await request.json()
        const {
            status,
            num_personas,
            special_requests,
            contact_phone,
            notes,
            // Campos de precio (staff)
            price_per_person,
            taxes,
            supplement,
            total_per_person,
            total_price,
            // Items incluidos (staff)
            included_items,
            updatedBy
        } = body

        if (!folio) {
            return NextResponse.json({ success: false, error: 'Folio requerido' }, { status: 400 })
        }

        const existing = await query('SELECT * FROM tour_quotes WHERE folio = $1', [folio])
        if (existing.rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Cotización no encontrada' }, { status: 404 })
        }

        const currentQuote = existing.rows[0]

        const updates: string[] = []
        const values: any[] = []
        let paramIndex = 1

        if (status !== undefined) {
            updates.push(`status = $${paramIndex}`)
            values.push(status)
            paramIndex++
        }

        if (num_personas !== undefined) {
            updates.push(`num_personas = $${paramIndex}`)
            values.push(num_personas)
            paramIndex++
        }

        if (special_requests !== undefined) {
            updates.push(`special_requests = $${paramIndex}`)
            values.push(special_requests)
            paramIndex++
        }

        if (contact_phone !== undefined) {
            updates.push(`contact_phone = $${paramIndex}`)
            values.push(contact_phone)
            paramIndex++
        }

        if (notes !== undefined) {
            updates.push(`notes = $${paramIndex}`)
            values.push(notes)
            paramIndex++
        }

        // Campos de precio (staff)
        if (price_per_person !== undefined) {
            updates.push(`price_per_person = $${paramIndex}`)
            values.push(parseFloat(price_per_person) || 0)
            paramIndex++
        }

        if (taxes !== undefined) {
            updates.push(`taxes = $${paramIndex}`)
            values.push(parseFloat(taxes) || 0)
            paramIndex++
        }

        if (supplement !== undefined) {
            updates.push(`supplement = $${paramIndex}`)
            values.push(parseFloat(supplement) || 0)
            paramIndex++
        }

        if (total_per_person !== undefined) {
            updates.push(`total_per_person = $${paramIndex}`)
            values.push(parseFloat(total_per_person) || 0)
            paramIndex++
        }

        if (total_price !== undefined) {
            updates.push(`total_price = $${paramIndex}`)
            values.push(parseFloat(total_price) || 0)
            paramIndex++
        }

        // Items incluidos (guardar en columna, añadir si no existe)
        if (included_items !== undefined) {
            try {
                updates.push(`included_items = $${paramIndex}`)
                values.push(included_items)
                paramIndex++
            } catch {
                // Si la columna no existe, ignorar
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ success: false, error: 'No hay campos para actualizar' }, { status: 400 })
        }

        const updateQuery = `
            UPDATE tour_quotes 
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE folio = $${paramIndex}
            RETURNING *
        `
        values.push(folio)

        const result = await query(updateQuery, values)
        const updatedQuote = result.rows[0]

        console.log(`✅ Cotización ${folio} actualizada por ${updatedBy || 'desconocido'}`)

        // ===== AUTO-CREAR RESERVA CUANDO STATUS → confirmed =====
        let bookingCreated = null
        if (status === 'confirmed' && currentQuote.status !== 'confirmed') {
            try {
                const { insertOne } = await import('@/lib/db')
                const bookingReference = `AS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

                // Construir detalles del servicio con toda la info relevante
                const serviceDetails: any = {
                    source: 'tour_quote',
                    folio: updatedQuote.folio,
                    tour_id: updatedQuote.tour_id,
                    tour_name: updatedQuote.tour_name,
                    departure_date: updatedQuote.departure_date || null,
                    origin_city: updatedQuote.origin_city || null,
                    region: updatedQuote.region || null,
                    num_personas: updatedQuote.num_personas,
                    price_per_person: parseFloat(updatedQuote.price_per_person) || 0,
                    taxes: parseFloat(updatedQuote.taxes) || 0,
                    supplement: parseFloat(updatedQuote.supplement) || 0,
                    total_per_person: parseFloat(updatedQuote.total_per_person) || 0,
                    included_items: updatedQuote.included_items || '',
                    notes: updatedQuote.notes || '',
                    special_requests: updatedQuote.special_requests || ''
                }

                const totalPrice = parseFloat(updatedQuote.total_price) || 0

                const booking = await insertOne('bookings', {
                    user_id: updatedQuote.user_id || 1,
                    tenant_id: 1,
                    booking_type: 'tour',
                    booking_reference: bookingReference,
                    booking_status: 'confirmed',
                    payment_status: 'pending',
                    currency: 'USD',
                    exchange_rate: 1,
                    original_price: totalPrice,
                    subtotal: totalPrice,
                    tax: parseFloat(updatedQuote.taxes) * (updatedQuote.num_personas || 1) || 0,
                    service_fee: 0,
                    total_price: totalPrice,
                    destination: updatedQuote.tour_name || 'Tour',
                    lead_traveler_name: updatedQuote.contact_name || 'Viajero',
                    lead_traveler_email: updatedQuote.contact_email || '',
                    lead_traveler_phone: updatedQuote.contact_phone || '',
                    adults: updatedQuote.num_personas || 1,
                    children: 0,
                    special_requests: JSON.stringify(serviceDetails),
                    created_at: new Date()
                })

                bookingCreated = {
                    id: booking.id,
                    booking_reference: booking.booking_reference
                }

                console.log(`🎉 Reserva creada automáticamente: ${bookingReference} desde cotización ${folio}`)

                // Enviar correo de confirmación
                if (updatedQuote.contact_email) {
                    try {
                        const { sendBookingConfirmationEmail } = await import('@/lib/emailHelper')
                        await sendBookingConfirmationEmail({
                            name: updatedQuote.contact_name,
                            email: updatedQuote.contact_email,
                            bookingId: booking.id,
                            serviceName: updatedQuote.tour_name || 'Tour',
                            bookingDate: new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                            travelDate: updatedQuote.departure_date || '',
                            passengers: updatedQuote.num_personas || 1,
                            destination: updatedQuote.tour_name || 'Tour',
                            totalPrice: totalPrice,
                            currency: 'USD'
                        })
                        console.log(`📧 Email de confirmación de reserva enviado a ${updatedQuote.contact_email}`)
                    } catch (emailErr) {
                        console.error('⚠️ Error enviando email de confirmación:', emailErr)
                    }
                }
            } catch (bookingError: any) {
                console.error('⚠️ Error creando reserva automática:', bookingError)
                // No fallar la actualización de la cotización si la reserva falla
            }
        }

        return NextResponse.json({
            success: true,
            data: updatedQuote,
            bookingCreated,
            message: bookingCreated
                ? `Cotización actualizada y reserva ${bookingCreated.booking_reference} creada`
                : 'Cotización actualizada exitosamente'
        })

    } catch (error: any) {
        console.error('Error updating quote:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Error al actualizar la cotización' },
            { status: 500 }
        )
    }
}
