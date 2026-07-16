// src/app/api/admin/scrape-all/route.ts
// API endpoint para ejecutar scraping completo de MegaTravel por batches
// Build: 15 Jul 2026 - v2.424 - Auth mejorada con cookies + métricas detalladas

import { NextRequest, NextResponse } from 'next/server';
import { MegaTravelScrapingService } from '@/services/MegaTravelScrapingService';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { pool } from '@/lib/db';
import { cookies } from 'next/headers';

export const maxDuration = 300; // 5 minutos máximo por request
export const dynamic = 'force-dynamic';

// Roles permitidos
const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

export async function POST(request: NextRequest) {
    try {
        // ========== AUTENTICACIÓN ==========
        const auth = await verifyAdminAuth(request);
        if (!auth.authorized) {
            return NextResponse.json({
                success: false,
                error: auth.error
            }, { status: auth.status });
        }

        // ========== OBTENER PARÁMETROS ==========
        const body = await request.json();
        const { limit = 10, offset = 0 } = body;

        console.log(`🔍 Scraping batch: limit=${limit}, offset=${offset}`);

        // Obtener tours a procesar
        const result = await pool.query(`
            SELECT id, mt_code, name, mt_url
            FROM megatravel_packages
            WHERE mt_url IS NOT NULL AND is_active = true
            ORDER BY id
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const tours = result.rows;
        console.log(`📊 Procesando ${tours.length} tours...`);

        const results = [];

        for (const tour of tours) {
            try {
                console.log(`🔍 Scraping: ${tour.mt_code}`);

                const scrapedData = await MegaTravelScrapingService.scrapeTourComplete(
                    tour.mt_url,
                    tour.id
                );

                await MegaTravelScrapingService.saveScrapedData(
                    tour.id,
                    scrapedData,
                    pool
                );

                results.push({
                    id: tour.id,
                    mt_code: tour.mt_code,
                    status: 'success',
                    price: scrapedData.pricing.price_usd,
                    itinerary: scrapedData.itinerary.length,
                    includes: scrapedData.includes.length,
                    not_includes: scrapedData.not_includes.length,
                    map: !!scrapedData.images.map,
                });

                console.log(`✅ ${tour.mt_code}: $${scrapedData.pricing.price_usd || 'N/A'}, ${scrapedData.itinerary.length} días`);

            } catch (error: any) {
                const errorMsg = error.message || '';
                console.error(`❌ Error en ${tour.mt_code}:`, errorMsg);

                // Detectar si el tour fue eliminado de MegaTravel (404, timeout de navegación, etc.)
                const isDeprecated = errorMsg.includes('404') ||
                    errorMsg.includes('net::ERR_') ||
                    errorMsg.includes('Navigation timeout') ||
                    errorMsg.includes('Page not found') ||
                    errorMsg.includes('no se encontró');

                if (isDeprecated) {
                    // Marcar como inactivo
                    await pool.query(
                        `UPDATE megatravel_packages SET is_active = false, sync_status = 'deprecated', sync_error = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                        [`Tour no encontrado en MegaTravel: ${errorMsg.substring(0, 200)}`, tour.id]
                    );
                    console.log(`🚫 ${tour.mt_code}: Marcado como INACTIVO (no existe en MegaTravel)`);
                }

                results.push({
                    id: tour.id,
                    mt_code: tour.mt_code,
                    status: isDeprecated ? 'deprecated' : 'error',
                    error: errorMsg.substring(0, 200)
                });
            }

            // Pausa de 2 segundos entre tours
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        return NextResponse.json({
            success: true,
            processed: tours.length,
            results
        });

    } catch (error: any) {
        console.error('❌ Error en scraping:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
