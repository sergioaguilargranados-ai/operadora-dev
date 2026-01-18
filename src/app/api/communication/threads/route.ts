import { NextRequest, NextResponse } from 'next/server'
import CommunicationService from '@/services/CommunicationService'

/**
 * GET /api/communication/threads
 * Obtener hilos de conversación del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // TODO: Obtener de sesión/auth
    const userId = parseInt(searchParams.get('userId') || '1')
    const userType = searchParams.get('userType') || 'client' // 'client' | 'agent'
    const tenantId = parseInt(searchParams.get('tenantId') || '1')

    const status = searchParams.get('status') || undefined
    const isArchived = searchParams.get('is_archived') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let threads

    if (userType === 'agent') {
      threads = await CommunicationService.getAgentThreads(userId, tenantId, {
        status,
        limit
      })
    } else {
      threads = await CommunicationService.getClientThreads(userId, tenantId, {
        status,
        is_archived: isArchived,
        limit,
        offset
      })
    }

    return NextResponse.json({
      success: true,
      data: threads,
      total: threads.length
    })

  } catch (error: any) {
    console.error('[THREADS GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/communication/threads
 * Crear nuevo hilo de conversación
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      client_id,
      subject,
      thread_type,
      reference_type,
      reference_id,
      assigned_agent_id,
      priority,
      tags,
      tenant_id = 1
    } = body

    // Validaciones
    if (!client_id || !subject) {
      return NextResponse.json(
        { success: false, error: 'client_id y subject son requeridos' },
        { status: 400 }
      )
    }

    const thread = await CommunicationService.createThread({
      client_id,
      subject,
      thread_type,
      reference_type,
      reference_id,
      assigned_agent_id,
      priority,
      tags,
      tenant_id
    })

    return NextResponse.json({
      success: true,
      data: thread
    })

  } catch (error: any) {
    console.error('[THREADS POST] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/communication/threads
 * Actualizar hilo (estado, asignación, etc.)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const { thread_id, action, value } = body

    if (!thread_id || !action) {
      return NextResponse.json(
        { success: false, error: 'thread_id y action son requeridos' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'update_status':
        await CommunicationService.updateThreadStatus(thread_id, value)
        break

      case 'assign_agent':
        await CommunicationService.assignAgent(thread_id, value)
        break

      case 'mark_read':
        const { user_id, user_type } = value
        await CommunicationService.markThreadAsRead(thread_id, user_id, user_type)
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Hilo actualizado correctamente'
    })

  } catch (error: any) {
    console.error('[THREADS PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
