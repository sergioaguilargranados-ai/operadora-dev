/**
 * API: CRM Contact Detail
 * GET  — Obtener contacto por ID (vista 360°)
 * PUT  — Actualizar contacto
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

        if (isNaN(contactId)) {
            return NextResponse.json(
                { success: false, error: 'ID inválido' },
                { status: 400 }
            )
        }

        const full = request.nextUrl.searchParams.get('full') === 'true'

        if (full) {
            const data = await crmService.getContact360(contactId)
            if (!data) {
                return NextResponse.json(
                    { success: false, error: 'Contacto no encontrado' },
                    { status: 404 }
                )
            }
            return NextResponse.json({ success: true, data })
        }

        const contact = await crmService.getContactById(contactId)
        if (!contact) {
            return NextResponse.json(
                { success: false, error: 'Contacto no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: contact })
    } catch (error) {
        console.error('Error getting CRM contact:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function PUT(
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
        const updated = await crmService.updateContact(contactId, body)

        if (!updated) {
            return NextResponse.json(
                { success: false, error: 'Contacto no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Contacto actualizado'
        })
    } catch (error) {
        console.error('Error updating CRM contact:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
