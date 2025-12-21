import { NextResponse } from 'next/server'
import { CorporateService } from '@/services/CorporateService'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      )
    }

    // Leer contenido del CSV
    const csvContent = await file.text()

    // TODO: Obtener tenantId del usuario autenticado
    const tenantId = 1

    const result = await CorporateService.importEmployeesFromCSV(tenantId, csvContent)

    return NextResponse.json({
      success: result.success,
      errors: result.errors
    })
  } catch (error: any) {
    console.error('Error importing employees:', error)
    return NextResponse.json(
      { error: error.message || 'Error al importar empleados' },
      { status: 500 }
    )
  }
}
