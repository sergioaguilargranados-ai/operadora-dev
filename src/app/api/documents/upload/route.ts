import { NextRequest, NextResponse } from 'next/server'
import { DocumentService } from '@/services/DocumentService'
import { query } from '@/lib/db'

/**
 * POST /api/documents/upload
 * Subir documento (pasaporte, visa, ID, etc.)
 *
 * Form Data:
 * - file: File (required)
 * - userId: number (required)
 * - tenantId: number (required)
 * - documentType: 'passport' | 'visa' | 'id' | 'driver_license' | 'other' (required)
 * - bookingId?: number (optional)
 * - description?: string (optional)
 *
 * Response:
 * {
 *   success: true
 *   document: DocumentRecord
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const file = formData.get('file') as File
    const userId = parseInt(formData.get('userId') as string)
    const tenantId = parseInt(formData.get('tenantId') as string)
    const documentType = formData.get('documentType') as string
    const bookingId = formData.get('bookingId') ? parseInt(formData.get('bookingId') as string) : null
    const description = formData.get('description') as string || null

    // Validaciones
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Archivo es requerido' },
        { status: 400 }
      )
    }

    if (!userId || !tenantId || !documentType) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    const validDocTypes = ['passport', 'visa', 'id', 'driver_license', 'other']
    if (!validDocTypes.includes(documentType)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de documento inválido' },
        { status: 400 }
      )
    }

    // Validar archivo
    const validation = DocumentService.validateFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Subir documento
    const document = await DocumentService.uploadDocument(file, {
      userId,
      tenantId,
      documentType: documentType as any,
      metadata: {
        description: description || '',
        originalName: file.name
      }
    })

    // Guardar registro en BD
    await query(
      `INSERT INTO documents (
        id,
        user_id,
        tenant_id,
        booking_id,
        document_type,
        file_name,
        file_size,
        file_type,
        url,
        description,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        document.id,
        userId,
        tenantId,
        bookingId,
        documentType,
        document.fileName,
        document.fileSize,
        document.fileType,
        document.url,
        description
      ]
    )

    console.log(`✅ Document uploaded and saved: ${document.id}`)

    // Generar URL firmada con expiración de 24 horas
    const signedUrl = DocumentService.generateSignedUrl(document.url, 60 * 24)

    return NextResponse.json({
      success: true,
      document: {
        ...document,
        signedUrl
      }
    })

  } catch (error: any) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al subir documento',
        details: error.message
      },
      { status: 500 }
    )
  }
}
