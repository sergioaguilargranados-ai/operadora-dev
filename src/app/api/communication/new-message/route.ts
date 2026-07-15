import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import CommunicationService from '@/services/CommunicationService'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { email, subject, message, isAlert, name } = body

    if (!email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'El correo, el asunto y el mensaje son requeridos' },
        { status: 400 }
      )
    }

    // 1. Buscar si el usuario ya existe por email
    let client_id = null
    const userResult = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email.trim()])
    
    if (userResult.rows.length > 0) {
      client_id = userResult.rows[0].id
    } else {
      // 2. Si no existe, creamos un usuario "fantasma/invitado" temporal
      // Generamos un hash de contraseña aleatorio ya que no iniciará sesión de momento
      const randomPass = Math.random().toString(36).substring(2, 15)
      
      const newUserResult = await query(
        `INSERT INTO users (
          name, email, password_hash, role, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, 'client', true, NOW(), NOW())
        RETURNING id`,
        [name || email.split('@')[0], email.trim(), randomPass]
      )
      
      client_id = newUserResult.rows[0].id
    }

    // 3. Crear el hilo (Thread)
    const thread = await CommunicationService.createThread({
      client_id,
      subject,
      thread_type: 'general',
      assigned_agent_id: auth.user.id,
      priority: isAlert ? 'urgent' : 'normal',
      tenant_id: 1 // Por defecto, como lo manejan los otros servicios
    })

    // 4. Enviar el primer mensaje en el hilo
    const sentMessage = await CommunicationService.sendMessage({
      thread_id: thread.id,
      sender_id: auth.user.id,
      sender_type: 'agent',
      sender_name: auth.user.name,
      body: message
    })

    return NextResponse.json({
      success: true,
      data: {
        thread_id: thread.id,
        message: sentMessage
      }
    })

  } catch (error: any) {
    console.error('[NEW MESSAGE POST] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
