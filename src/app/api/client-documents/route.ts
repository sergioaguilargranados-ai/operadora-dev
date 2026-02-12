/**
 * API: Client Documents
 * Endpoints para gestión de documentos de clientes (agency_clients)
 * v2.316 — 12 Feb 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { ClientDocumentService } from '@/services/ClientDocumentService'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action') || 'list'
        const tenantId = parseInt(searchParams.get('tenant_id') || '1')

        // GET /api/client-documents?action=by_client&agency_client_id=X
        if (action === 'by_client') {
            const clientId = parseInt(searchParams.get('agency_client_id') || '0')
            if (!clientId) return NextResponse.json({ success: false, error: 'agency_client_id requerido' }, { status: 400 })

            const documents = await ClientDocumentService.getDocumentsByClient(clientId, {
                category: searchParams.get('category') || undefined,
                status: searchParams.get('status') || undefined,
                document_type: searchParams.get('document_type') || undefined
            })
            return NextResponse.json({ success: true, data: documents })
        }

        // GET /api/client-documents?action=detail&id=X
        if (action === 'detail') {
            const id = searchParams.get('id')
            if (!id) return NextResponse.json({ success: false, error: 'id requerido' }, { status: 400 })
            const doc = await ClientDocumentService.getDocumentById(id)
            if (!doc) return NextResponse.json({ success: false, error: 'Documento no encontrado' }, { status: 404 })
            return NextResponse.json({ success: true, data: doc })
        }

        // GET /api/client-documents?action=expiring&days=30
        if (action === 'expiring') {
            const days = parseInt(searchParams.get('days') || '30')
            const docs = await ClientDocumentService.getExpiringDocuments(tenantId, days)
            return NextResponse.json({ success: true, data: docs })
        }

        // GET /api/client-documents?action=stats
        if (action === 'stats') {
            const stats = await ClientDocumentService.getDocumentStats(tenantId)
            return NextResponse.json({ success: true, data: stats })
        }

        // GET /api/client-documents?action=checklist&agency_client_id=X
        if (action === 'checklist') {
            const clientId = parseInt(searchParams.get('agency_client_id') || '0')
            if (!clientId) return NextResponse.json({ success: false, error: 'agency_client_id requerido' }, { status: 400 })
            const checklist = await ClientDocumentService.getDocumentChecklist(clientId)
            return NextResponse.json({ success: true, data: checklist })
        }

        // Default: list all by tenant
        const result = await ClientDocumentService.getDocumentsByTenant(tenantId, {
            agency_client_id: searchParams.get('agency_client_id') ? parseInt(searchParams.get('agency_client_id')!) : undefined,
            category: searchParams.get('category') || undefined,
            status: searchParams.get('status') || undefined,
            document_type: searchParams.get('document_type') || undefined,
            search: searchParams.get('search') || undefined,
            limit: parseInt(searchParams.get('limit') || '50'),
            offset: parseInt(searchParams.get('offset') || '0')
        })

        return NextResponse.json({ success: true, data: result.documents, meta: { total: result.total } })

    } catch (error: unknown) {
        console.error('❌ Client Documents GET error:', error)
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action } = body

        // POST /api/client-documents { action: 'create', ...data }
        if (!action || action === 'create') {
            if (!body.agency_client_id || !body.document_type || !body.file_name || !body.url) {
                return NextResponse.json({
                    success: false,
                    error: 'Campos requeridos: agency_client_id, document_type, file_name, url'
                }, { status: 400 })
            }

            const doc = await ClientDocumentService.createDocument({
                tenant_id: body.tenant_id || 1,
                agency_client_id: body.agency_client_id,
                crm_contact_id: body.crm_contact_id,
                user_id: body.user_id,
                document_type: body.document_type,
                file_name: body.file_name,
                file_size: body.file_size || 0,
                file_type: body.file_type || 'application/octet-stream',
                url: body.url,
                document_number: body.document_number,
                issuing_country: body.issuing_country,
                issuing_authority: body.issuing_authority,
                expiry_date: body.expiry_date,
                category: body.category,
                description: body.description,
                metadata: body.metadata
            })

            return NextResponse.json({ success: true, data: doc }, { status: 201 })
        }

        // POST /api/client-documents { action: 'verify', id, approved, reason }
        if (action === 'verify') {
            const { id, approved, reason, user_id } = body
            if (!id) return NextResponse.json({ success: false, error: 'id requerido' }, { status: 400 })

            const doc = await ClientDocumentService.verifyDocument(id, user_id || 1, approved, reason)
            if (!doc) return NextResponse.json({ success: false, error: 'Documento no encontrado' }, { status: 404 })
            return NextResponse.json({ success: true, data: doc })
        }

        // POST /api/client-documents { action: 'delete', id }
        if (action === 'delete') {
            const { id } = body
            if (!id) return NextResponse.json({ success: false, error: 'id requerido' }, { status: 400 })

            const deleted = await ClientDocumentService.deleteDocument(id)
            return NextResponse.json({ success: true, deleted })
        }

        return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 })

    } catch (error: unknown) {
        console.error('❌ Client Documents POST error:', error)
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
    }
}
