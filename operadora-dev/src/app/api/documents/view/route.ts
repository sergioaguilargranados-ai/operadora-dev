import { NextRequest, NextResponse } from 'next/server'
import { DocumentService } from '@/services/DocumentService'

/**
 * GET /api/documents/view
 * Ver documento con URL firmada
 *
 * Query params:
 * - sig: string (signed URL signature)
 *
 * Response:
 * - Redirect a URL del documento si válido
 * - Error 403 si inválido o expirado
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const signature = searchParams.get('sig')

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Firma requerida' },
        { status: 400 }
      )
    }

    // Validar URL firmada
    const validation = DocumentService.validateSignedUrl(signature)

    if (!validation.valid) {
      if (validation.expired) {
        return NextResponse.json(
          { success: false, error: 'URL expirada. Solicita un nuevo enlace.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'URL inválida' },
        { status: 403 }
      )
    }

    // Verificar que el documento existe
    const exists = await DocumentService.documentExists(validation.url!)

    if (!exists) {
      return NextResponse.json(
        { success: false, error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Redirect a URL del documento
    return NextResponse.redirect(validation.url!)

  } catch (error: any) {
    console.error('Error viewing document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al acceder al documento',
        details: error.message
      },
      { status: 500 }
    )
  }
}
