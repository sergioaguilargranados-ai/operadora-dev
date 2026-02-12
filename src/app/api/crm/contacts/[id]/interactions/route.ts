/**
 * API: CRM Contact Interactions
 * GET  — Listar interacciones de un contacto
 * POST — Registrar nueva interacción
 * v2.314
 */

import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const contactId = parseInt(id)
        const sp = request.nextUrl.searchParams
        const limit = parseInt(sp.get('limit') || '50')
        const offset = parseInt(sp.get('offset') || '0')

        if (isNaN(contactId)) {
            return NextResponse.json(
                { success: false, error: 'ID inválido' },
                { status: 400 }
            )
        }

        const { interactions, total } = await crmService.getInteractions(contactId, limit, offset)

        return NextResponse.json({
            success: true,
            data: interactions,
            meta: { total, limit, offset }
        })
    } catch (error) {
        console.error('Error listing interactions:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const contactId = parseInt(id)

        if (isNaN(contactId)) {
            return NextResponse.json(
                { success: false, error: 'ID inválido' },
                { status: 400 }
            )
        }

        const body = await request.json()

        if (!body.interaction_type) {
            return NextResponse.json(
                { success: false, error: 'interaction_type es requerido' },
                { status: 400 }
            )
        }

        const interaction = await crmService.createInteraction({
            ...body,
            contact_id: contactId,
        })

        return NextResponse.json({
            success: true,
            data: interaction,
            message: 'Interacción registrada'
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating interaction:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
