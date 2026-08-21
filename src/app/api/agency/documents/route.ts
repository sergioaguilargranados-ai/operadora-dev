import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/agency/documents
 * Listar documentos legales y de expediente de la agencia
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agencyId = searchParams.get('agencyId') || searchParams.get('tenantId') || searchParams.get('tenant_id') || '1'
    const id = parseInt(agencyId)

    const documents = await db.queryMany<any>(
      `SELECT 
         id, 
         document_name, 
         document_type, 
         document_url, 
         status, 
         created_at, 
         updated_at
       FROM entity_documents
       WHERE entity_type = 'agency' AND entity_id = $1
       ORDER BY created_at DESC`,
      [id]
    )

    return NextResponse.json({
      success: true,
      data: documents
    })
  } catch (error: any) {
    console.error('Error fetching agency documents:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener documentos', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agency/documents
 * Registrar o actualizar documento legal en entity_documents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      agencyId,
      documentName,
      documentType,
      documentUrl,
      status = 'uploaded'
    } = body

    if (!agencyId || !documentType || !documentUrl) {
      return NextResponse.json(
        { success: false, error: 'agencyId, documentType y documentUrl son requeridos' },
        { status: 400 }
      )
    }

    const id = parseInt(agencyId)

    // Verificar si ya existe documento de este tipo para la agencia
    const existing = await db.queryOne<any>(
      `SELECT id FROM entity_documents 
       WHERE entity_type = 'agency' AND entity_id = $1 AND document_type = $2`,
      [id, documentType]
    )

    let doc
    if (existing) {
      doc = await db.queryOne<any>(
        `UPDATE entity_documents
         SET document_url = $1,
             document_name = $2,
             status = $3,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [documentUrl, documentName || documentType, status, existing.id]
      )
    } else {
      doc = await db.queryOne<any>(
        `INSERT INTO entity_documents (
           entity_type, entity_id, document_name, document_type, document_url, status, created_at, updated_at
         ) VALUES ('agency', $1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [id, documentName || documentType, documentType, documentUrl, status]
      )
    }

    return NextResponse.json({
      success: true,
      data: doc,
      message: 'Documento registrado exitosamente'
    })
  } catch (error: any) {
    console.error('Error saving agency document:', error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar documento', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/agency/documents
 * Eliminar documento
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const docId = searchParams.get('id')
    const agencyId = searchParams.get('agencyId') || searchParams.get('tenantId')

    if (!docId || !agencyId) {
      return NextResponse.json(
        { success: false, error: 'id y agencyId requeridos' },
        { status: 400 }
      )
    }

    await db.query(
      `DELETE FROM entity_documents WHERE id = $1 AND entity_type = 'agency' AND entity_id = $2`,
      [parseInt(docId), parseInt(agencyId)]
    )

    return NextResponse.json({
      success: true,
      message: 'Documento eliminado'
    })
  } catch (error: any) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar documento', details: error.message },
      { status: 500 }
    )
  }
}
