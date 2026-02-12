/**
 * API: CRM Smart Notifications
 * GET  — Listar notificaciones
 * POST — Acciones (mark_read, mark_all_read, dismiss, generate)
 * v2.315
 */

import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'

export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams

        const { notifications, total, unread } = await crmService.listNotifications({
            user_id: sp.get('user_id') ? parseInt(sp.get('user_id')!) : undefined,
            is_read: sp.get('is_read') === 'true' ? true : sp.get('is_read') === 'false' ? false : undefined,
            priority: sp.get('priority') || undefined,
            notification_type: sp.get('type') || undefined,
            limit: sp.get('limit') ? parseInt(sp.get('limit')!) : 50,
            offset: sp.get('offset') ? parseInt(sp.get('offset')!) : 0,
        })

        return NextResponse.json({
            success: true,
            data: notifications,
            meta: { total, unread }
        })
    } catch (error) {
        console.error('Error listing notifications:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action } = body

        switch (action) {
            case 'mark_read': {
                if (!body.notification_id) {
                    return NextResponse.json({ success: false, error: 'notification_id requerido' }, { status: 400 })
                }
                await crmService.markNotificationRead(body.notification_id)
                return NextResponse.json({ success: true, message: 'Marcada como leída' })
            }

            case 'mark_all_read': {
                const count = await crmService.markAllNotificationsRead(body.user_id)
                return NextResponse.json({ success: true, message: `${count} notificaciones marcadas como leídas` })
            }

            case 'dismiss': {
                if (!body.notification_id) {
                    return NextResponse.json({ success: false, error: 'notification_id requerido' }, { status: 400 })
                }
                await crmService.dismissNotification(body.notification_id)
                return NextResponse.json({ success: true, message: 'Notificación descartada' })
            }

            case 'generate': {
                const count = await crmService.generateAutoNotifications()
                return NextResponse.json({
                    success: true,
                    data: { generated: count },
                    message: `${count} notificaciones generadas`
                })
            }

            default:
                return NextResponse.json(
                    { success: false, error: 'Acción no reconocida. Use: mark_read, mark_all_read, dismiss, generate' },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('Error in notification action:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
