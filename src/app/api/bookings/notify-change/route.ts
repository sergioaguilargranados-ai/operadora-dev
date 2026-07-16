/**
 * POST /api/bookings/notify-change
 * Notificar al cliente sobre cambios en su itinerario
 * 
 * Este endpoint debe ser llamado manualmente por agentes/admins
 * cuando modifican una reserva
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { sendItineraryChangeEmail } from '@/lib/emailHelper';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            bookingId,
            changeType, // 'flight', 'hotel', 'date', 'other'
            changeDescription,
            oldFlightInfo,
            newFlightInfo,
            oldHotelInfo,
            newHotelInfo,
            oldDate,
            newDate,
            changeReason,
            priceChange,
            priceDifference,
            priceIncrease,
            priceDecrease
        } = body;

        // Validaciones
        if (!bookingId || !changeType || !changeReason) {
            return NextResponse.json({
                success: false,
                error: 'Datos incompletos. Se requiere: bookingId, changeType, changeReason'
            }, { status: 400 });
        }

        // Buscar información de la reserva
        const booking = await queryOne<any>(
            `SELECT 
        b.id,
        b.user_id,
        b.destination as service_name,
        b.travel_date,
        b.passengers,
        b.total_price,
        b.currency,
        b.destination,
        u.name,
        u.email
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
            [bookingId]
        );

        if (!booking) {
            return NextResponse.json({
                success: false,
                error: 'Reserva no encontrada'
            }, { status: 404 });
        }

        // Formatear fecha de viaje
        const travelDate = new Date(booking.travel_date).toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Enviar email de notificación
        try {
            await sendItineraryChangeEmail({
                name: booking.name,
                email: booking.email,
                bookingId: booking.id,
                serviceName: booking.service_name,
                travelDate,
                passengers: booking.passengers,
                changeType,
                changeDescription,
                oldFlightInfo,
                newFlightInfo,
                oldHotelInfo,
                newHotelInfo,
                oldDate,
                newDate,
                changeReason,
                priceChange: priceChange || false,
                totalPrice: booking.total_price,
                priceDifference,
                priceIncrease: priceIncrease || false,
                priceDecrease: priceDecrease || false,
                currency: booking.currency || 'MXN'
            });

            console.log(`✅ Notificación de cambio enviada: ${booking.email} (Reserva #${booking.id})`);

            return NextResponse.json({
                success: true,
                message: 'Notificación enviada exitosamente',
                booking: {
                    id: booking.id,
                    email: booking.email,
                    serviceName: booking.service_name
                }
            });

        } catch (emailError) {
            console.error('❌ Error enviando notificación:', emailError);
            return NextResponse.json({
                success: false,
                error: 'Error al enviar notificación'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Error en notify-change:', error);
        return NextResponse.json({
            success: false,
            error: 'Error al procesar solicitud'
        }, { status: 500 });
    }
}
