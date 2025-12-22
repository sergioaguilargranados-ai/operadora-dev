import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/audit-logs
 * Obtener logs de auditoría
 *
 * Query params:
 * - tenantId?: number
 * - userId?: number
 * - action?: string
 * - resourceType?: string
 * - startDate?: string
 * - endDate?: string
 * - limit?: number
 * - offset?: number
 *
 * Response:
 * {
 *   success: true
 *   data: AuditLog[]
 *   total: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const tenantId = searchParams.get('tenantId')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resourceType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir query dinámicamente
    let queryText = `
      SELECT
        al.id,
        al.user_id,
        al.tenant_id,
        al.action,
        al.resource_type,
        al.resource_id,
        al.ip_address,
        al.user_agent,
        al.details,
        al.created_at,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `

    const queryParams: any[] = []
    let paramCount = 0

    if (tenantId) {
      paramCount++
      queryText += ` AND al.tenant_id = $${paramCount}`
      queryParams.push(parseInt(tenantId))
    }

    if (userId) {
      paramCount++
      queryText += ` AND al.user_id = $${paramCount}`
      queryParams.push(parseInt(userId))
    }

    if (action) {
      paramCount++
      queryText += ` AND al.action = $${paramCount}`
      queryParams.push(action)
    }

    if (resourceType) {
      paramCount++
      queryText += ` AND al.resource_type = $${paramCount}`
      queryParams.push(resourceType)
    }

    if (startDate) {
      paramCount++
      queryText += ` AND al.created_at >= $${paramCount}`
      queryParams.push(startDate)
    }

    if (endDate) {
      paramCount++
      queryText += ` AND al.created_at <= $${paramCount}`
      queryParams.push(endDate)
    }

    // Query para contar total
    const countQueryText = queryText.replace(
      /SELECT .* FROM/,
      'SELECT COUNT(*) FROM'
    )
    const countResult = await query(countQueryText, queryParams)
    const total = parseInt(countResult.rows?.[0]?.count || '0')

    // Query principal con paginación
    queryText += ` ORDER BY al.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    queryParams.push(limit, offset)

    const result = await query(queryText, queryParams)

    return NextResponse.json({
      success: true,
      data: result.rows || [],
      total,
      limit,
      offset
    })

  } catch (error: any) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener logs de auditoría',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/audit-logs
 * Crear log de auditoría manual
 *
 * Body:
 * {
 *   userId?: number
 *   tenantId: number
 *   action: string
 *   resourceType: string
 *   resourceId: string
 *   details?: object
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, tenantId, action, resourceType, resourceId, details } = body

    if (!tenantId || !action || !resourceType || !resourceId) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    // Obtener IP y user agent
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() :
               request.headers.get('x-real-ip') || 'unknown'

    const userAgent = request.headers.get('user-agent') || 'unknown'

    await query(
      `INSERT INTO audit_logs (
        user_id,
        tenant_id,
        action,
        resource_type,
        resource_id,
        ip_address,
        user_agent,
        details,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        userId || null,
        tenantId,
        action,
        resourceType,
        resourceId,
        ip,
        userAgent,
        details ? JSON.stringify(details) : null
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Log de auditoría creado'
    })

  } catch (error: any) {
    console.error('Error creating audit log:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear log de auditoría',
        details: error.message
      },
      { status: 500 }
    )
  }
}
