/**
 * API: CRM Task Detail
 * PUT — Actualizar tarea (completar, cambiar estado, etc.)
 * v2.314
 */

import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'
import { query } from '@/lib/db'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const taskId = parseInt(id)

        if (isNaN(taskId)) {
            return NextResponse.json(
                { success: false, error: 'ID inválido' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { action } = body

        if (action === 'complete') {
            const task = await crmService.completeTask(taskId, body.notes, body.outcome)
            if (!task) {
                return NextResponse.json(
                    { success: false, error: 'Tarea no encontrada' },
                    { status: 404 }
                )
            }
            return NextResponse.json({
                success: true,
                data: task,
                message: 'Tarea completada'
            })
        }

        if (action === 'cancel') {
            const result = await query(`
        UPDATE crm_tasks SET status = 'cancelled', updated_at = NOW()
        WHERE id = $1 RETURNING *
      `, [taskId])

            if (!result.rows[0]) {
                return NextResponse.json(
                    { success: false, error: 'Tarea no encontrada' },
                    { status: 404 }
                )
            }
            return NextResponse.json({
                success: true,
                data: result.rows[0],
                message: 'Tarea cancelada'
            })
        }

        // Update general
        const fields: string[] = []
        const values: unknown[] = []
        let paramIdx = 1

        const allowed = ['title', 'description', 'due_date', 'reminder_at', 'priority', 'status', 'assigned_to']
        for (const field of allowed) {
            if (body[field] !== undefined) {
                fields.push(`${field} = $${paramIdx++}`)
                values.push(body[field])
            }
        }

        if (fields.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No hay campos para actualizar' },
                { status: 400 }
            )
        }

        fields.push('updated_at = NOW()')
        values.push(taskId)

        const result = await query(
            `UPDATE crm_tasks SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
            values
        )

        if (!result.rows[0]) {
            return NextResponse.json(
                { success: false, error: 'Tarea no encontrada' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0],
            message: 'Tarea actualizada'
        })
    } catch (error) {
        console.error('Error updating CRM task:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
