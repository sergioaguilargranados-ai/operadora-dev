import { NextRequest, NextResponse } from 'next/server'
import { crmCalendarService } from '@/services/CRMCalendarService'

/**
 * GET /api/crm/calendar
 * 
 * Eventos del calendario CRM
 * 
 * Params:
 *   action: 'events' | 'digest' | 'google_link' | 'ical'
 *   date_from, date_to: rango de fechas (para events)
 *   agent_id: filtrar por agente
 *   title, description, start, end: para google_link e ical
 */
export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const action = sp.get('action') || 'events'

        switch (action) {
            case 'events': {
                const dateFrom = sp.get('date_from') || new Date(Date.now() - 7 * 86400000).toISOString()
                const dateTo = sp.get('date_to') || new Date(Date.now() + 30 * 86400000).toISOString()
                const agentId = sp.get('agent_id') ? parseInt(sp.get('agent_id')!) : undefined

                const events = await crmCalendarService.getEvents(dateFrom, dateTo, agentId)
                return NextResponse.json({ success: true, data: events })
            }

            case 'digest': {
                const agentId = sp.get('agent_id') ? parseInt(sp.get('agent_id')!) : undefined
                const digest = await crmCalendarService.getWeeklyDigest(agentId)
                return NextResponse.json({ success: true, data: digest })
            }

            case 'google_link': {
                const title = sp.get('title') || 'Evento CRM'
                const start = sp.get('start') || new Date().toISOString()
                const end = sp.get('end') || new Date(Date.now() + 3600000).toISOString()
                const description = sp.get('description') || ''

                const link = crmCalendarService.generateGoogleCalendarLink({ title, start, end, description })
                return NextResponse.json({ success: true, data: { link } })
            }

            case 'ical': {
                const title = sp.get('title') || 'Evento CRM'
                const start = sp.get('start') || new Date().toISOString()
                const end = sp.get('end') || new Date(Date.now() + 3600000).toISOString()
                const description = sp.get('description') || ''

                const ical = crmCalendarService.generateICalEvent({ title, start, end, description })
                return new NextResponse(ical, {
                    headers: {
                        'Content-Type': 'text/calendar; charset=utf-8',
                        'Content-Disposition': 'attachment; filename="evento-crm.ics"',
                    },
                })
            }

            default:
                return NextResponse.json({ success: false, error: `Acción no válida: ${action}` }, { status: 400 })
        }
    } catch (error) {
        console.error('[CRM Calendar]', error)
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
    }
}
