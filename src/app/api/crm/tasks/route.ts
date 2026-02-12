/**
 * API: CRM Tasks
 * GET  — Listar tareas (del agente logueado o todas)
 * POST — Crear nueva tarea
 * v2.315
 */

import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'

export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        // user_id es opcional — si no se envía, lista TODAS las tareas (para admin)
        const userId = sp.get('user_id') ? parseInt(sp.get('user_id')!) : 0

        const { tasks, total, overdue_count } = await crmService.getAgentTasks(
            userId,
            {
                status: sp.get('status') || undefined,
                priority: sp.get('priority') || undefined,
                contact_id: sp.get('contact_id') ? parseInt(sp.get('contact_id')!) : undefined,
                limit: sp.get('limit') ? parseInt(sp.get('limit')!) : 50,
                offset: sp.get('offset') ? parseInt(sp.get('offset')!) : 0,
            }
        )

        return NextResponse.json({
            success: true,
            data: tasks,
            meta: { total, overdue: overdue_count }
        })
    } catch (error) {
        console.error('Error listing CRM tasks:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const { task_type, title, due_date } = body

        if (!task_type || !title || !due_date) {
            return NextResponse.json(
                { success: false, error: 'task_type, title y due_date son requeridos' },
                { status: 400 }
            )
        }

        // Default assigned_to = 0 (unassigned) if not provided
        if (!body.assigned_to) body.assigned_to = 0

        const task = await crmService.createTask(body)

        return NextResponse.json({
            success: true,
            data: task,
            message: 'Tarea creada exitosamente'
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating CRM task:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
