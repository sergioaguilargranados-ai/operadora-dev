import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
// import { sendEmail } from '@/lib/emailHelper' // Asumiendo que existe un helper de correos

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { user_id, tenant_id, action } = body // action: 'approve' | 'reject'

        if (!user_id || !tenant_id || !action) {
            return NextResponse.json({ success: false, error: 'Faltan parámetros' }, { status: 400 })
        }

        if (action === 'approve') {
            // 1. Activar el tenant
            await query('UPDATE tenants SET is_active = true, updated_at = NOW() WHERE id = $1', [tenant_id])
            
            // 2. Cambiar el rol del usuario a AGENCY_ADMIN
            await query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2', ['AGENCY_ADMIN', user_id])

            // 3. (Opcional) Enviar correo electrónico
            // await sendEmail(userEmail, '¡Tu agencia ha sido aprobada!', 'Ya puedes acceder al portal...')

            return NextResponse.json({ success: true, message: 'Agencia aprobada exitosamente' })
        } else if (action === 'reject') {
            // Rechazar: Eliminar tenant y usuario o marcarlos como rechazados
            // Para simplicidad, los borraremos o cambiaremos rol a REJECTED
            await query('UPDATE users SET role = $1, is_active = false WHERE id = $2', ['REJECTED_AGENCY', user_id])
            
            return NextResponse.json({ success: true, message: 'Solicitud rechazada' })
        }

        return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 })

    } catch (error: any) {
        console.error('Error procesando solicitud:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
