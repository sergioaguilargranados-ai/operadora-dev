import { NextRequest, NextResponse } from 'next/server'
import TenantService from '@/services/TenantService'
interface RouteParams {
  params: Promise<{
    id: string
  }>
}
/**
 * GET /api/tenants/[id]
 * Obtener información del tenant, sus usuarios o estadísticas
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const tenantId = parseInt(id, 10)
    if (isNaN(tenantId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid tenant ID'
      }, { status: 400 })
    }
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')
    // Obtener información del tenant
    if (!action || action === 'info') {
      const tenant = await TenantService.getTenantById(tenantId)
      if (!tenant) {
        return NextResponse.json({
          success: false,
          error: 'Tenant not found'
        }, { status: 404 })
      }
      // Si es agencia, obtener también configuración white-label
      if (tenant.tenant_type === 'agency') {
        const whiteLabelConfig = await TenantService.getWhiteLabelConfig(tenantId)
        return NextResponse.json({
          success: true,
          data: {
            ...tenant,
            white_label: whiteLabelConfig
          }
        })
      }
      return NextResponse.json({
        success: true,
        data: tenant
      })
    }
    // Obtener usuarios del tenant
    if (action === 'users') {
      const role = searchParams.get('role') || undefined
      const users = await TenantService.getTenantUsers(tenantId, role)
      return NextResponse.json({
        success: true,
        data: users,
        total: users.length
      })
    }
    // Obtener estadísticas del tenant
    if (action === 'stats') {
      const stats = await TenantService.getTenantStats(tenantId)
      return NextResponse.json({
        success: true,
        data: stats
      })
    }
    // Acción no válida
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
  } catch (error) {
    console.error('Error in tenant API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
/**
 * PUT /api/tenants/[id]
 * Actualizar tenant
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const tenantId = parseInt(id, 10)
    if (isNaN(tenantId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid tenant ID'
      }, { status: 400 })
    }
    const body = await request.json()
    // Actualizar tenant
    const tenant = await TenantService.updateTenant(tenantId, body)
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found'
      }, { status: 404 })
    }
    // Si hay configuración white-label, actualizarla
    if (body.white_label && tenant.tenant_type === 'agency') {
      await TenantService.updateWhiteLabelConfig(tenantId, body.white_label)
    }
    return NextResponse.json({
      success: true,
      data: tenant,
      message: 'Tenant updated successfully'
    })
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update tenant'
    }, { status: 500 })
  }
}
/**
 * DELETE /api/tenants/[id]
 * Desactivar tenant (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const tenantId = parseInt(id, 10)
    if (isNaN(tenantId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid tenant ID'
      }, { status: 400 })
    }
    const tenant = await TenantService.updateTenant(tenantId, {
      is_active: false
    })
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found'
      }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      message: 'Tenant deactivated successfully'
    })
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to deactivate tenant'
    }, { status: 500 })
  }
}