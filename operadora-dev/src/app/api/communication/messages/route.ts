import { NextRequest, NextResponse } from 'next/server'
import CommunicationService from '@/services/CommunicationService'

/**
 * GET /api/communication/messages?thread_id=123
 * Obtener mensajes de un hilo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const threadId = parseInt(searchParams.get('thread_id') || '0')
    const includeInternal = searchParams.get('include_internal') === 'true'

    if (!threadId) {
      return NextResponse.json(
        { success: false, error: 'thread_id es requerido' },
        { status: 400 }
      )
    }

    const messages = await CommunicationService.getThreadMessages(
      threadId,
      includeInternal
    )

    return NextResponse.json({
      success: true,
      data: messages
    })

  } catch (error: any) {
    console.error('[MESSAGES GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/communication/messages
 * Enviar nuevo mensaje
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      thread_id,
      sender_id,
      sender_type,
      sender_name,
      sender_email,
      subject,
      body: messageBody,
      body_html,
      message_type,
      attachments,
      metadata,
      is_internal,
      requires_response,
      tenant_id = 1
    } = body

    // Validaciones
    if (!thread_id || !messageBody || !sender_type) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Verificar rate limit
    if (sender_id) {
      const allowed = await CommunicationService.checkRateLimit(sender_id, tenant_id)
      if (!allowed) {
        return NextResponse.json(
          { success: false, error: 'Límite de mensajes excedido. Intenta más tarde.' },
          { status: 429 }
        )
      }
    }

    const message = await CommunicationService.sendMessage({
      thread_id,
      sender_id,
      sender_type,
      sender_name,
      sender_email,
      subject,
      body: messageBody,
      body_html,
      message_type,
      attachments,
      metadata,
      is_internal,
      requires_response,
      tenant_id
    })

    return NextResponse.json({
      success: true,
      data: message,
      message: message.requires_moderation
        ? 'Mensaje enviado. Pendiente de moderación.'
        : 'Mensaje enviado correctamente'
    })

  } catch (error: any) {
    console.error('[MESSAGES POST] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/communication/messages
 * Acciones sobre mensajes (moderar, marcar como leído, etc.)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { message_id, action, ...data } = body

    if (!message_id || !action) {
      return NextResponse.json(
        { success: false, error: 'message_id y action son requeridos' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'moderate':
        const { moderator_id, approved, tenant_id } = data
        await CommunicationService.moderateMessage(
          message_id,
          moderator_id,
          approved,
          tenant_id || 1
        )
        break

      case 'mark_read':
        const { user_id, tenant_id: tid, metadata } = data
        await CommunicationService.registerRead(
          message_id,
          user_id,
          tid || 1,
          metadata
        )
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Acción completada correctamente'
    })

  } catch (error: any) {
    console.error('[MESSAGES PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
