/**
 * API: CRM Automation Rules
 * GET  — Listar reglas + log de ejecución
 * POST — Crear/editar regla
 * PUT  — Toggle activar/desactivar
 * DELETE — Eliminar regla
 * v2.315
 */

import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'

export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const view = sp.get('view') || 'rules' // 'rules' | 'log'

        if (view === 'log') {
            const { logs, total } = await crmService.getAutomationLog({
                rule_id: sp.get('rule_id') ? parseInt(sp.get('rule_id')!) : undefined,
                contact_id: sp.get('contact_id') ? parseInt(sp.get('contact_id')!) : undefined,
                limit: sp.get('limit') ? parseInt(sp.get('limit')!) : 50,
            })
            return NextResponse.json({ success: true, data: logs, meta: { total } })
        }

        const rules = await crmService.listAutomationRules(
            sp.get('tenant_id') ? parseInt(sp.get('tenant_id')!) : undefined
        )

        return NextResponse.json({ success: true, data: rules })
    } catch (error) {
        console.error('Error listing automation:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        if (!body.name || !body.trigger_event || !body.action_type || !body.action_config) {
            return NextResponse.json(
                { success: false, error: 'name, trigger_event, action_type y action_config son requeridos' },
                { status: 400 }
            )
        }

        const rule = await crmService.upsertAutomationRule(body)

        return NextResponse.json({
            success: true,
            data: rule,
            message: body.id ? 'Regla actualizada' : 'Regla creada'
        }, { status: body.id ? 200 : 201 })
    } catch (error) {
        console.error('Error creating automation rule:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()

        if (!body.rule_id || body.is_active === undefined) {
            return NextResponse.json(
                { success: false, error: 'rule_id y is_active son requeridos' },
                { status: 400 }
            )
        }

        await crmService.toggleAutomationRule(body.rule_id, body.is_active)

        return NextResponse.json({
            success: true,
            message: body.is_active ? 'Regla activada' : 'Regla desactivada'
        })
    } catch (error) {
        console.error('Error toggling automation rule:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const ruleId = sp.get('rule_id')

        if (!ruleId) {
            return NextResponse.json(
                { success: false, error: 'rule_id es requerido' },
                { status: 400 }
            )
        }

        await crmService.deleteAutomationRule(parseInt(ruleId))

        return NextResponse.json({
            success: true,
            message: 'Regla eliminada'
        })
    } catch (error) {
        console.error('Error deleting automation rule:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
