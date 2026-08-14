import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs'

function parseUserAgent(uaString: string | null) {
    if (!uaString) return { os: 'Desconocido', browser: 'Desconocido', device: 'Dispositivo Web' }

    let os = 'Desconocido'
    let browser = 'Navegador Web'
    let device = 'Computadora'

    if (uaString.includes('Windows')) os = 'Windows'
    else if (uaString.includes('Mac OS')) os = 'macOS'
    else if (uaString.includes('iPhone')) { os = 'iOS'; device = 'iPhone' }
    else if (uaString.includes('iPad')) { os = 'iPadOS'; device = 'iPad' }
    else if (uaString.includes('Android')) { os = 'Android'; device = 'Móvil Android' }
    else if (uaString.includes('Linux')) os = 'Linux'

    if (uaString.includes('Chrome') && !uaString.includes('Edg')) browser = 'Chrome'
    else if (uaString.includes('Safari') && !uaString.includes('Chrome')) browser = 'Safari'
    else if (uaString.includes('Firefox')) browser = 'Firefox'
    else if (uaString.includes('Edg')) browser = 'Edge'

    return { os, browser, device }
}

function getAuthInfo(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '') || request.cookies.get('as_token')?.value
        if (!token) return { userId: null, token: null }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'as-operadora-secret-2026')
        return { userId: decoded.userId || decoded.id || null, token }
    } catch {
        return { userId: null, token: null }
    }
}

/**
 * GET /api/user/devices
 * Obtiene los dispositivos / sesiones activas reales del usuario autenticado.
 */
export async function GET(request: NextRequest) {
    try {
        const { userId, token: currentToken } = getAuthInfo(request)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        // Consultar sesiones activas de active_sessions usando queryMany (retorna T[])
        let sessions = await queryMany(
            `SELECT id, session_token, ip_address, user_agent, device_fingerprint, last_activity, created_at, is_active 
             FROM active_sessions 
             WHERE user_id = $1 AND is_active = true 
             ORDER BY last_activity DESC`,
            [userId]
        )

        // Si no hay sesiones registradas en active_sessions, simular con la sesión actual
        if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
            const currentUa = request.headers.get('user-agent') || ''
            const parsed = parseUserAgent(currentUa)
            return NextResponse.json({
                success: true,
                data: [
                    {
                        id: 1,
                        platform: `${parsed.os} • ${parsed.browser}`,
                        deviceName: parsed.device,
                        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
                        location: 'Ciudad de México, México',
                        lastActivity: 'Actualmente activo',
                        isCurrent: true,
                        isActive: true
                    }
                ]
            })
        }

        const formattedSessions = sessions.map((s: any) => {
            const parsed = parseUserAgent(s.user_agent)
            const isCurrent = currentToken && s.session_token === currentToken

            return {
                id: s.id,
                platform: `${parsed.os} • ${parsed.browser}`,
                deviceName: parsed.device,
                ipAddress: s.ip_address || 'Red Privada',
                location: 'Ciudad de México, México',
                lastActivity: isCurrent ? 'Actualmente activo' : (s.last_activity ? new Date(s.last_activity).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'Reciente'),
                isCurrent,
                isActive: s.is_active
            }
        })

        return NextResponse.json({
            success: true,
            data: formattedSessions
        })
    } catch (error: any) {
        console.error('Error GET /api/user/devices:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/user/devices
 * Revoca/cierra una sesión remota de un dispositivo específico.
 */
export async function DELETE(request: NextRequest) {
    try {
        const { userId } = getAuthInfo(request)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('id')

        if (!sessionId) {
            return NextResponse.json({ success: false, error: 'ID de sesión requerido' }, { status: 400 })
        }

        // Marcar inactiva en active_sessions
        await queryOne(
            'UPDATE active_sessions SET is_active = false WHERE id = $1 AND user_id = $2',
            [sessionId, userId]
        )

        return NextResponse.json({
            success: true,
            message: 'Sesión terminada exitosamente'
        })
    } catch (error: any) {
        console.error('Error DELETE /api/user/devices:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
