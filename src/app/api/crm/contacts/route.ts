/**
 * API: CRM Contacts
 * GET  — Listar contactos con filtros
 * POST — Crear nuevo contacto
 * v2.314
 */

import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'

export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams

        const { contacts, total } = await crmService.listContacts({
            tenant_id: sp.get('tenant_id') ? parseInt(sp.get('tenant_id')!) : undefined,
            agent_id: sp.get('agent_id') ? parseInt(sp.get('agent_id')!) : undefined,
            pipeline_stage: sp.get('stage') || undefined,
            contact_type: sp.get('type') || undefined,
            source: sp.get('source') || undefined,
            status: sp.get('status') || 'active',
            is_hot_lead: sp.get('hot') === 'true' ? true : undefined,
            search: sp.get('search') || undefined,
            min_score: sp.get('min_score') ? parseInt(sp.get('min_score')!) : undefined,
            sort_by: sp.get('sort_by') || undefined,
            sort_order: sp.get('sort_order') || undefined,
            limit: sp.get('limit') ? parseInt(sp.get('limit')!) : 50,
            offset: sp.get('offset') ? parseInt(sp.get('offset')!) : 0,
        })

        return NextResponse.json({
            success: true,
            data: contacts,
            meta: {
                total,
                limit: sp.get('limit') ? parseInt(sp.get('limit')!) : 50,
                offset: sp.get('offset') ? parseInt(sp.get('offset')!) : 0,
            }
        })
    } catch (error) {
        console.error('Error listing CRM contacts:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const { full_name, email } = body

        if (!full_name) {
            return NextResponse.json(
                { success: false, error: 'full_name es requerido' },
                { status: 400 }
            )
        }

        // Verificar duplicado por email
        if (email) {
            const { contacts } = await crmService.listContacts({
                search: email,
                limit: 1,
                tenant_id: body.tenant_id,
            })
            if (contacts.length > 0 && contacts[0].email === email) {
                return NextResponse.json(
                    { success: false, error: 'Ya existe un contacto con este email', existing_id: contacts[0].id },
                    { status: 409 }
                )
            }
        }

        const contact = await crmService.createContact(body)

        return NextResponse.json({
            success: true,
            data: contact,
            message: 'Contacto creado exitosamente'
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating CRM contact:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
