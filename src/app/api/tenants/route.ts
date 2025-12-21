import { NextRequest, NextResponse } from 'next/server'
import TenantService from '@/services/TenantService'

/**
 * GET /api/tenants
 * Obtener todos los tenants o filtrados
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const domain = searchParams.get('domain')
    const subdomain = searchParams.get('subdomain')
    const action = searchParams.get('action')

    // Obtener tenant por ID
    if (id) {
      const tenant = await TenantService.getTenantById(parseInt(id, 10))

      if (!tenant) {
        return NextResponse.json({
          success: false,
          error: 'Tenant not found'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: tenant
      })
    }

    // Obtener tenant por dominio personalizado
    if (domain) {
      const tenant = await TenantService.getTenantByDomain(domain)

      if (!tenant) {
        return NextResponse.json({
          success: false,
          error: 'Tenant not found'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: tenant
      })
    }

    // Obtener tenant por subdomain
    if (subdomain) {
      const tenant = await TenantService.getTenantBySubdomain(subdomain)

      if (!tenant) {
        return NextResponse.json({
          success: false,
          error: 'Tenant not found'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: tenant
      })
    }

    // Listar todos los tenants (con filtros y paginación)
    const filters = {
      tenant_type: searchParams.get('type') || undefined,
      is_active: searchParams.get('is_active') === 'true' ? true :
                 searchParams.get('is_active') === 'false' ? false : undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10)
    }

    const result = await TenantService.listTenants(filters)

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error in tenants API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * POST /api/tenants
 * Crear nuevo tenant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validaciones
    if (!body.tenant_type || !['corporate', 'agency'].includes(body.tenant_type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid tenant_type. Must be corporate or agency'
      }, { status: 400 })
    }

    if (!body.company_name) {
      return NextResponse.json({
        success: false,
        error: 'company_name is required'
      }, { status: 400 })
    }

    // Crear tenant
    const tenant = await TenantService.createTenant({
      tenant_type: body.tenant_type,
      company_name: body.company_name,
      legal_name: body.legal_name,
      tax_id: body.tax_id,
      email: body.email,
      phone: body.phone,
      subscription_plan: body.subscription_plan || 'basic'
    })

    // Si es agencia y tiene configuración white-label, crearla
    if (body.tenant_type === 'agency' && body.white_label) {
      await TenantService.updateWhiteLabelConfig(tenant.id, body.white_label)
    }

    return NextResponse.json({
      success: true,
      data: tenant,
      message: 'Tenant created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create tenant'
    }, { status: 500 })
  }
}
