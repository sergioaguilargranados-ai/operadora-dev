import { NextRequest, NextResponse } from 'next/server'
import { query, insertOne } from '@/lib/db'
import { successResponse, errorResponse } from '@/types/api-response'

/**
 * GET /api/bookings
 * Listar reservas del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || '1'
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const view = (searchParams.get('view') || '').toLowerCase()
    const status = searchParams.get('status')

    let sql = `
      SELECT
        id,
        booking_type,
        booking_type as type,
        destination as service_name,
        booking_reference,
        booking_status as status,
        total_price,
        currency,
        payment_status,
        lead_traveler_name,
        lead_traveler_email,
        special_requests,
        created_at,
        COALESCE((
          SELECT SUM(amount) 
          FROM payment_transactions 
          WHERE booking_id = bookings.id AND status = 'completed'
        ), 0) as paid_amount
      FROM bookings
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (userId !== 'all') {
      sql += ` AND user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }

    if (status && status !== 'all') {
      sql += ` AND booking_status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await query(sql, params)
    let bookings = result.rows || []

    if (view === 'compact') {
      bookings = bookings.map((b: any) => ({
        id: b.id,
        type: b.type,
        status: b.status,
        total_price: b.total_price,
        currency: b.currency,
        created_at: b.created_at,
      }))
    }

    return NextResponse.json(
      successResponse(bookings, { total: bookings.length, limit, page: Math.floor(offset / Math.max(limit, 1)) + 1 }),
      { headers: { 'X-API-Version': '1.0' } }
    )

  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      errorResponse('BOOKINGS_FETCH', error.message || 'Failed to fetch bookings'),
      { status: 500, headers: { 'X-API-Version': '1.0' } }
    )
  }
}

/**
 * POST /api/bookings
 * Crear nueva reserva
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      type,
      service_name,
      total_price,
      currency,
      status,
      payment_status,
      details,
      user_id,
      tenant_id
    } = body

    // Generar referencia de reserva
    const bookingReference = `AS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Insertar en base de datos
    const priceValue = total_price || 0
    const booking = await insertOne('bookings', {
      user_id: user_id || 1,
      tenant_id: tenant_id || 1,
      booking_type: type || 'general',
      booking_reference: bookingReference,
      booking_status: status || 'pending',
      payment_status: payment_status || 'pending',
      currency: currency || 'MXN',
      exchange_rate: 1,
      original_price: priceValue,
      subtotal: priceValue,
      tax: 0,
      service_fee: 0,
      total_price: priceValue,
      destination: details?.destination || service_name || 'Servicio',
      lead_traveler_name: details?.contacto?.nombre || 'Viajero',
      lead_traveler_email: details?.contacto?.email || '',
      lead_traveler_phone: details?.contacto?.telefono || '',
      adults: details?.pasajeros || 1,
      children: 0,
      special_requests: JSON.stringify(details || {}),
      created_at: new Date()
    })

    const payload = {
      id: booking.id,
      type: booking.booking_type,
      service_name: booking.destination,
      total_price: parseFloat(booking.total_price) || 0,
      currency: booking.currency,
      status: booking.booking_status,
      payment_status: booking.payment_status,
      booking_reference: booking.booking_reference,
      details: details,
      created_at: booking.created_at
    }

    // Gestionar el Cliente/Usuario (Onboarding)
    const travelerEmail = booking.lead_traveler_email?.toLowerCase().trim();
    if (travelerEmail) {
      try {
        const { queryOne } = await import('@/lib/db');
        const crypto = await import('crypto');

        // 1. Buscar si el usuario ya existe
        let user = await queryOne<any>(
          'SELECT id FROM users WHERE email = $1',
          [travelerEmail]
        );

        let setupUrl = '';

        if (!user) {
          // Crear usuario con password pendiente de setup
          user = await queryOne<any>(
            `INSERT INTO users (name, email, password_hash, role, email_verified, created_at)
             VALUES ($1, $2, 'PENDING_SETUP', 'CLIENT', false, NOW()) RETURNING id`,
            [booking.lead_traveler_name || 'Viajero', travelerEmail]
          );

          // Generar Setup Token (Magic Link)
          const token = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs
          
          await query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at, ip_address, user_agent)
             VALUES ($1, $2, $3, 'system', 'onboarding')`,
            [user.id, token, expiresAt]
          );

          setupUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/setup-password?token=${token}`;
          console.log(`✅ Nuevo usuario creado y Setup Token generado para: ${travelerEmail}`);
        }

        // 2. Enviar correos
        const { sendBookingConfirmationEmail, sendAccountSetupEmail } = await import('@/lib/emailHelper');
        
        if (setupUrl) {
          // Es un usuario nuevo, mandarle el Magic Link de Onboarding
          await sendAccountSetupEmail({
            name: booking.lead_traveler_name || 'Viajero',
            email: travelerEmail,
            setupUrl
          });
          console.log('📧 Correo de Account Setup (Magic Link) enviado.');
        } else {
          // Usuario existente, mandarle la confirmación normal
          await sendBookingConfirmationEmail({
            name: booking.lead_traveler_name || 'Viajero',
            email: travelerEmail,
            bookingId: booking.id,
            serviceName: booking.destination,
            bookingDate: new Date().toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            travelDate: details?.fecha_inicio || details?.checkIn || '',
            passengers: booking.adults || 1,
            destination: booking.destination,
            totalPrice: parseFloat(booking.total_price) || 0,
            currency: booking.currency
          });
          console.log('📧 Correo de confirmación de reserva enviado a:', travelerEmail);
        }

      } catch (userErr) {
        console.error('❌ Error gestionando usuario/correos al crear reserva:', userErr);
      }
    }

    // Calcular comisiones automáticamente si el booking tiene agente/referral
    if (details?.referral_code || details?.agent_id) {
      try {
        const { commissionService } = await import('@/services/CommissionService');
        const { agencyService } = await import('@/services/AgencyService');

        let agentTenantUserId = details.agent_id;

        // Si viene por referral_code, buscar el agente
        if (!agentTenantUserId && details.referral_code) {
          const agent = await agencyService.getAgentByReferralCode(details.referral_code);
          if (agent) {
            agentTenantUserId = agent.id;

            // Registrar conversión de referido
            try {
              const { referralService } = await import('@/services/ReferralService');
              await referralService.trackConversion({
                agentId: agent.id,
                userId: booking.user_id,
                conversionType: 'booking',
                bookingId: booking.id,
                revenueAmount: parseFloat(booking.total_price) || 0,
                currency: booking.currency
              });
              console.log(`🔗 Conversión de referido registrada: agente ${agent.id}, booking ${booking.id}`);
            } catch (refErr) {
              console.error('⚠️ Error registrando conversión de referido:', refErr);
            }
          }
        }

        // Calcular comisión
        if (agentTenantUserId) {
          const commission = await commissionService.calculateCommission(booking.id, agentTenantUserId);
          if (commission) {
            console.log(`💰 Comisión auto-calculada: $${commission.commission_amount} para booking #${booking.id}`);
          }
        }
      } catch (commErr) {
        console.error('⚠️ Error calculando comisión:', commErr);
        // No fallar la reserva si la comisión falla
      }
    }

    // DISPARAR GENERACIÓN DE ITINERARIO (ASÍNCRONO)
    // Para no bloquear la respuesta, importamos y lanzamos la promesa al aire
    import('@/services/CustomItineraryService').then(({ CustomItineraryService }) => {
      CustomItineraryService.generateItineraryForBooking(booking.id).catch(err => {
        console.error(`Error background generando itinerario IA para reserva ${booking.id}:`, err);
      });
    });

    return NextResponse.json(
      successResponse({ booking: payload, id: booking.id }),
      { status: 201, headers: { 'X-API-Version': '1.0' } }
    )

  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      errorResponse('BOOKINGS_CREATE', error.message || 'Error al crear reserva', error?.toString?.()),
      { status: 500, headers: { 'X-API-Version': '1.0' } }
    )
  }
}
