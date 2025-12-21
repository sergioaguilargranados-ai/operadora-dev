import { NextRequest, NextResponse } from 'next/server'
import { CorporateService } from '@/services/CorporateService'

/**
 * GET /api/corporate/employees
 * Listar empleados del tenant
 *
 * Query params:
 * - tenantId: ID del tenant (obligatorio)
 * - department?: Filtrar por departamento
 * - role?: Filtrar por rol
 * - isActive?: Filtrar por activos/inactivos
 * - search?: Buscar por nombre o email
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      )
    }

    const filters = {
      department: searchParams.get('department') || undefined,
      role: searchParams.get('role') || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true :
                searchParams.get('isActive') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined
    }

    const employees = await CorporateService.getEmployees(
      parseInt(tenantId),
      filters
    )

    return NextResponse.json({
      success: true,
      data: employees,
      count: employees.length
    })

  } catch (error: any) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener empleados',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/corporate/employees
 * Crear nuevo empleado
 *
 * Body:
 * {
 *   tenantId: number
 *   name: string
 *   email: string
 *   password: string
 *   role: string
 *   department: string
 *   costCenter?: string
 *   managerId?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tenantId,
      name,
      email,
      password,
      role,
      department,
      costCenter,
      managerId
    } = body

    // Validaciones
    if (!tenantId || !name || !email || !password || !role || !department) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos requeridos: tenantId, name, email, password, role, department'
        },
        { status: 400 }
      )
    }

    const employee = await CorporateService.createEmployee(
      parseInt(tenantId),
      {
        name,
        email,
        password,
        role,
        department,
        costCenter,
        managerId: managerId ? parseInt(managerId) : undefined
      }
    )

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Empleado creado exitosamente'
    })

  } catch (error: any) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear empleado',
        details: error.message
      },
      { status: 500 }
    )
  }
}
