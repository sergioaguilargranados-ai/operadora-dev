import { NextRequest, NextResponse } from 'next/server'
import { commissionService } from '@/services/CommissionService'

export const runtime = 'nodejs'

/**
 * GET /api/agency/commissions/export?agency_id=X&format=csv
 * Exportar comisiones a CSV para descarga
 * Filtros: status, agent_id, date_from, date_to
 */
export async function GET(request: NextRequest) {
    try {
        const agencyId = request.nextUrl.searchParams.get('agency_id')
        const status = request.nextUrl.searchParams.get('status') || undefined
        const agentId = request.nextUrl.searchParams.get('agent_id') || undefined
        const dateFrom = request.nextUrl.searchParams.get('date_from') || undefined
        const dateTo = request.nextUrl.searchParams.get('date_to') || undefined
        const format = request.nextUrl.searchParams.get('format') || 'csv'

        if (!agencyId) {
            return NextResponse.json({ success: false, error: 'agency_id is required' }, { status: 400 })
        }

        const result = await commissionService.listCommissions({
            agencyId: parseInt(agencyId),
            status,
            agentId: agentId ? parseInt(agentId) : undefined,
            startDate: dateFrom,
            endDate: dateTo,
            limit: 10000 // Sin límite para exports
        })

        if (format === 'csv') {
            // Generar CSV
            const headers = [
                'ID', 'Tipo', 'Agente', 'Destino', 'Referencia',
                'Precio Base', 'Comisión Total', 'Comisión Agente', 'Comisión Agencia',
                'Retención', 'Neto', 'Estado', 'Fecha'
            ]

            const rows = result.commissions.map((c: any) => [
                c.id,
                c.booking_type || '',
                c.agent_name || '',
                c.destination || '',
                c.booking_reference || '',
                c.base_price || 0,
                c.commission_amount || 0,
                c.agent_commission_amount || 0,
                c.agency_commission_amount || 0,
                c.withholding_amount || 0,
                c.net_commission || 0,
                c.status === 'pending' ? 'Pendiente' : c.status === 'available' ? 'Disponible' : c.status === 'paid' ? 'Pagada' : c.status,
                c.created_at ? new Date(c.created_at).toLocaleDateString('es-MX') : ''
            ])

            // BOM para Excel + CSV
            const BOM = '\uFEFF'
            const csvContent = BOM + [
                headers.join(','),
                ...rows.map((row: any[]) =>
                    row.map(cell => {
                        const str = String(cell)
                        // Escapar comillas y wrappear en comillas si tiene comas
                        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                            return `"${str.replace(/"/g, '""')}"`
                        }
                        return str
                    }).join(',')
                )
            ].join('\n')

            const today = new Date().toISOString().split('T')[0]
            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="comisiones_${today}.csv"`,
                    'Cache-Control': 'no-cache'
                }
            })
        }

        // JSON fallback
        return NextResponse.json({
            success: true,
            data: result.commissions
        })
    } catch (error) {
        console.error('Error exporting commissions:', error)
        return NextResponse.json({
            success: false, error: (error as Error).message
        }, { status: 500 })
    }
}
