/**
 * API: CRM Pipeline - Move contact to stage
 * POST — Mover contacto a nueva etapa del pipeline
 * v2.314
 */

import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { contact_id, stage, lost_reason, performed_by, performed_by_name } = body

        if (!contact_id || !stage) {
            return NextResponse.json(
                { success: false, error: 'contact_id y stage son requeridos' },
                { status: 400 }
            )
        }

        const updated = await crmService.moveToStage(parseInt(contact_id), stage, {
            lost_reason,
            performed_by: performed_by ? parseInt(performed_by) : undefined,
            performed_by_name,
        })

        if (!updated) {
            return NextResponse.json(
                { success: false, error: 'Contacto no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updated,
            message: `Contacto movido a "${stage}"`
        })
    } catch (error) {
        console.error('Error moving pipeline stage:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
