import { NextRequest, NextResponse } from 'next/server'
import { DocumentService } from '@/services/DocumentService'
import { query } from '@/lib/db'

/**
 * GET /api/documents/[id]
 * Obtener detalles de documento
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await query(
      `SELECT
        d.id,
        d.user_id,
        d.tenant_id,
        d.booking_id,
        d.document_type,
        d.file_name,
        d.file_size,
        d.file_type,
        d.url,
        d.description,
        d.created_at,
        u.name as user_name,
        u.email as user_email
       FROM documents d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [id]
    )

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    const document = result.rows[0]

    // Generar URL firmada con expiración de 1 hora
    const signedUrl = DocumentService.generateSignedUrl(document.url, 60)

    return NextResponse.json({
      success: true,
      document: {
        ...document,
        signedUrl
      }
    })

  } catch (error: any) {
    console.error('Error getting document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener documento',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/documents/[id]
 * Eliminar documento
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener URL del documento
    const result = await query(
      'SELECT url, user_id FROM documents WHERE id = $1',
      [id]
    )

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    const document = result.rows[0]

    // TODO: Validar que el usuario tiene permiso para eliminar

    // Eliminar de Vercel Blob
    const deleted = await DocumentService.deleteDocument(document.url)

    if (!deleted) {
      console.warn(`⚠️ Could not delete blob: ${document.url}`)
    }

    // Eliminar registro de BD
    await query(
      'DELETE FROM documents WHERE id = $1',
      [id]
    )

    console.log(`✅ Document deleted: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    })

  } catch (error: any) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar documento',
        details: error.message
      },
      { status: 500 }
    )
  }
}
