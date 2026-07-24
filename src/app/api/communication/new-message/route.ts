import { NextRequest, NextResponse } from 'next/server'
import CommunicationService from '@/services/CommunicationService'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // TODO: Obtener de sesión real
    const currentUserId = 1;
    const currentUserName = 'Usuario';

    const body = await request.json()
    const { email, subject, message, isAlert, name } = body

    if (!email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'El correo, el asunto y el mensaje son requeridos' },
        { status: 400 }
      )
    }

    const isTodos = email.trim().toLowerCase() === 'todos'
    const isPackageKey = !email.includes('@') && !isTodos
    const packageCode = isPackageKey ? email.trim().toUpperCase() : null
    
    // Lista de destinatarios
    let recipients: { id: number, name: string, email: string }[] = []

    if (isTodos) {
      // 1a. Obtener todos los clientes activos
      const usersRes = await query(`SELECT id, name, email FROM users WHERE role ILIKE 'client' AND is_active = true`)
      recipients = usersRes.rows
    } else if (isPackageKey && packageCode) {
      // 1b. Obtener clientes que tengan reservas de este paquete
      // Aseguramos que busque 'AS-XXXX' o 'MT-XXXX' en el destino o en la clave original si la hay
      const usersRes = await query(`
        SELECT DISTINCT u.id, u.name, u.email 
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.booking_status != 'cancelled' 
          AND (
            b.destination ILIKE $1 
            OR b.special_requests ILIKE $1
          )
      `, [`%${packageCode}%`])
      recipients = usersRes.rows
    } else {
      // 1c. Lógica original para un solo correo
      let client_id = null
      let client_name = name
      const userResult = await query('SELECT id, name FROM users WHERE email = $1 LIMIT 1', [email.trim()])
      
      if (userResult.rows.length > 0) {
        client_id = userResult.rows[0].id
        client_name = userResult.rows[0].name || name
      } else {
        const randomPass = Math.random().toString(36).substring(2, 15)
        const newUserResult = await query(
          `INSERT INTO users (
            name, email, password_hash, role, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, 'CLIENT', true, NOW(), NOW())
          RETURNING id`,
          [name || email.split('@')[0], email.trim(), randomPass]
        )
        client_id = newUserResult.rows[0].id
      }
      recipients = [{ id: client_id, name: client_name || email, email: email.trim() }]
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron destinatarios para los criterios ingresados' },
        { status: 404 }
      )
    }

    let lastThreadId = null
    let messagesSent = 0

    // Enviar a todos los destinatarios encontrados
    for (const recipient of recipients) {
      try {
        // 3. Crear el hilo (Thread)
        const thread = await CommunicationService.createThread({
          client_id: recipient.id,
          subject,
          thread_type: 'general',
          assigned_agent_id: currentUserId,
          priority: isAlert ? 'urgent' : 'normal',
          tenant_id: 1 // Por defecto
        })
        
        lastThreadId = thread.id

        // 4. Enviar el primer mensaje en el hilo
        await CommunicationService.sendMessage({
          thread_id: thread.id,
          sender_id: currentUserId,
          sender_type: 'agent',
          sender_name: currentUserName,
          body: message,
          message_type: isAlert ? 'alert' : 'text',
          tenant_id: 1
        })
        
        messagesSent++
      } catch (err) {
        console.error(`[NEW MESSAGE POST] Error enviando a ${recipient.email}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Mensaje enviado a ${messagesSent} destinatario(s)`,
      data: {
        thread_id: lastThreadId,
        count: messagesSent
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
