/**
 * API: CRM Contact Timeline
 * GET — Timeline cronológico unificado de un contacto
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
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')

        if (isNaN(contactId)) {
            return NextResponse.json(
                { success: false, error: 'ID inválido' },
                { status: 400 }
            )
        }

        const timeline = await crmService.getContactTimeline(contactId, limit)

        return NextResponse.json({
            success: true,
            data: timeline
        })
    } catch (error) {
        console.error('Error getting contact timeline:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
