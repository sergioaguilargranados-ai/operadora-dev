import { NextRequest, NextResponse } from 'next/server'
import { crmCampaignMetricsService } from '@/services/CRMCampaignMetricsService'

/**
 * GET /api/crm/metrics/track
 * 
 * Endpoint de tracking invisible:
 *   - Para opens: retorna un pixel 1x1 transparente
 *   - Para clicks: registra el click y redirige al URL original
 * 
 * Params: c=campaign_id, u=contact_id, e=event_type, url=redirect_url
 */

// Pixel 1x1 transparente en GIF
const TRANSPARENT_PIXEL = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
)

export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const campaignId = sp.get('c')
        const contactId = sp.get('u')
        const eventType = sp.get('e') || 'opened'
        const redirectUrl = sp.get('url')

        if (campaignId && contactId) {
            // Registrar evento de forma no bloqueante
            crmCampaignMetricsService.trackEvent({
                campaign_id: campaignId,
                contact_id: parseInt(contactId),
                event_type: eventType as 'opened' | 'clicked',
                metadata: redirectUrl ? { url: redirectUrl } : {},
            }).catch(err => console.error('[Track]', err))
        }

        // Si es un click con URL de redirección
        if (eventType === 'clicked' && redirectUrl) {
            return NextResponse.redirect(decodeURIComponent(redirectUrl))
        }

        // Para opens: retornar pixel transparente
        return new NextResponse(TRANSPARENT_PIXEL, {
            headers: {
                'Content-Type': 'image/gif',
                'Content-Length': String(TRANSPARENT_PIXEL.length),
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })
    } catch (error) {
        console.error('[Track Error]', error)
        return new NextResponse(TRANSPARENT_PIXEL, {
            headers: { 'Content-Type': 'image/gif' },
        })
    }
}
