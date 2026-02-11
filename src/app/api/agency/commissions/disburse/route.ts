import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * POST /api/agency/commissions/disburse
 * Dispersar comisiones a agentes (marcar como pagadas en batch)
 * Body: {
 *   agency_id: number,
 *   commission_ids?: number[],  // Si no se pasa, paga todas las "available"
 *   payment_method: string,     // 'transfer' | 'cash' | 'check'
 *   payment_reference: string,  // Referencia bancaria
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { agency_id, commission_ids, payment_method, payment_reference, notes } = body

        if (!agency_id) {
            return NextResponse.json({ success: false, error: 'agency_id is required' }, { status: 400 })
        }
        if (!payment_method || !payment_reference) {
            return NextResponse.json({ success: false, error: 'payment_method and payment_reference are required' }, { status: 400 })
        }

        let targetIds: number[] = []

        if (commission_ids && Array.isArray(commission_ids) && commission_ids.length > 0) {
            targetIds = commission_ids
        } else {
            // Pagar todas las comisiones "available" de la agencia
            const available = await query(
                "SELECT id FROM agency_commissions WHERE agency_id = $1 AND status = 'available' AND is_active = true",
                [agency_id]
            )
            targetIds = available.rows.map((r: any) => r.id)
        }

        if (targetIds.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No hay comisiones disponibles para dispersar'
            }, { status: 400 })
        }

        // Crear batch de pago
        const batchRef = `DISP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

        // Actualizar comisiones a "paid"
        const placeholders = targetIds.map((_, i) => `$${i + 4}`).join(',')
        const updateResult = await query(`
      UPDATE agency_commissions 
      SET status = 'paid',
          paid_at = CURRENT_TIMESTAMP,
          payment_batch_id = $1,
          notes = COALESCE(notes || ' ', '') || $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
        AND agency_id = $3
        AND status = 'available'
        AND is_active = true
      RETURNING id, agent_id, commission_amount, agent_commission_amount
    `, [batchRef, `[${payment_method}] ${payment_reference} ${notes || ''}`.trim(), agency_id, ...targetIds])

        const paid = updateResult.rows || []
        const totalPaid = paid.reduce((sum: number, r: any) => sum + parseFloat(r.commission_amount), 0)
        const totalAgentPaid = paid.reduce((sum: number, r: any) => sum + parseFloat(r.agent_commission_amount), 0)

        // Agrupar por agente para notificaciones
        const byAgent: Record<number, { count: number, total: number }> = {}
        paid.forEach((r: any) => {
            if (!byAgent[r.agent_id]) byAgent[r.agent_id] = { count: 0, total: 0 }
            byAgent[r.agent_id].count++
            byAgent[r.agent_id].total += parseFloat(r.agent_commission_amount)
        })

        // Enviar notificaciones por email a cada agente
        const notifications: any[] = []
        for (const [agentId, data] of Object.entries(byAgent)) {
            try {
                const agent = await queryOne(`
          SELECT u.name, u.email 
          FROM tenant_users tu 
          JOIN users u ON tu.user_id = u.id 
          WHERE tu.id = $1
        `, [agentId])

                if (agent?.email) {
                    // Intentar enviar email de notificación
                    try {
                        const { sendEmail } = await import('@/lib/emailHelper')
                        await sendEmail({
                            to: agent.email,
                            subject: `💰 Dispersión de comisiones - ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(data.total)}`,
                            html: `
                <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #0066FF, #4F46E5); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">💰 Dispersión de Comisiones</h1>
                    <p style="color: #E0E7FF; margin: 8px 0 0;">M&M Travel Agency</p>
                  </div>
                  <div style="background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px; color: #374151;">Hola <strong>${agent.name}</strong>,</p>
                    <p style="color: #6B7280;">Te informamos que se ha realizado una dispersión de comisiones a tu cuenta:</p>
                    
                    <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                      <p style="color: #0369A1; font-size: 14px; margin: 0 0 8px;">Monto total dispersado</p>
                      <p style="color: #0C4A6E; font-size: 32px; font-weight: bold; margin: 0;">
                        ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(data.total)}
                      </p>
                      <p style="color: #0369A1; font-size: 13px; margin: 8px 0 0;">${data.count} comisiones incluidas</p>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                      <tr>
                        <td style="padding: 8px 0; color: #6B7280; border-bottom: 1px solid #F3F4F6;">Método de pago</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 500; border-bottom: 1px solid #F3F4F6;">${payment_method === 'transfer' ? 'Transferencia bancaria' : payment_method === 'cash' ? 'Efectivo' : 'Cheque'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6B7280; border-bottom: 1px solid #F3F4F6;">Referencia</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 500; border-bottom: 1px solid #F3F4F6;">${payment_reference}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6B7280;">Lote</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 500; font-family: monospace;">${batchRef}</td>
                      </tr>
                    </table>
                    
                    <p style="color: #6B7280; font-size: 13px; margin-top: 24px;">
                      Puedes revisar el detalle en tu <a href="https://as-ope-viajes.company/dashboard/agent?agent_id=${agentId}" style="color: #0066FF;">Panel de Agente</a>.
                    </p>
                  </div>
                </div>
              `
                        })
                        notifications.push({ agentId, name: agent.name, email: agent.email, status: 'sent' })
                    } catch (emailErr) {
                        notifications.push({ agentId, name: agent.name, email: agent.email, status: 'failed', error: (emailErr as Error).message })
                    }
                }
            } catch (agentErr) {
                console.error(`Error notifying agent ${agentId}:`, agentErr)
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                batch_reference: batchRef,
                commissions_paid: paid.length,
                total_paid: totalPaid,
                total_agent_paid: totalAgentPaid,
                payment_method,
                payment_reference,
                agents_notified: notifications.filter(n => n.status === 'sent').length,
                notifications
            },
            message: `${paid.length} comisiones dispersadas exitosamente (${batchRef})`
        })
    } catch (error) {
        console.error('Error disbursing commissions:', error)
        return NextResponse.json({
            success: false, error: (error as Error).message
        }, { status: 500 })
    }
}
