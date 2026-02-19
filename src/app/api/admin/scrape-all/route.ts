// src/app/api/admin/scrape-all/route.ts
// API endpoint para ejecutar scraping completo de MegaTravel por batches
// Build: 19 Feb 2026 - v2.320 - Auth mejorada con cookies + métricas detalladas

import { NextRequest, NextResponse } from 'next/server';
import { MegaTravelScrapingService } from '@/services/MegaTravelScrapingService';
import { verifyToken } from '@/services/AuthService';
import { pool } from '@/lib/db';
import { cookies } from 'next/headers';

export const maxDuration = 300; // 5 minutos máximo por request
export const dynamic = 'force-dynamic';

// Roles permitidos
const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

export async function POST(request: NextRequest) {
    try {
        // ========== AUTENTICACIÓN ==========
        // Método 1: Cookie de sesión
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('as_token');

        // Método 2: Authorization header (para cron/API calls)
        const authHeader = request.headers.get('authorization');

        // Método 3: Admin secret key (legacy)
        const adminSecret = process.env.ADMIN_SECRET_KEY;

        let authenticated = false;

        // Intentar con cookie primero
        if (tokenCookie?.value) {
            try {
                const decoded = await verifyToken(tokenCookie.value);
                if (decoded && ALLOWED_ROLES.includes(decoded.role)) {
                    authenticated = true;
                }
            } catch (e) {
                // Cookie inválida, intentar otras formas
            }
        }

        // Intentar con Bearer token
        if (!authenticated && authHeader) {
            const token = authHeader.replace('Bearer ', '');

            // Verificar si es el CRON_SECRET
            if (token === process.env.CRON_SECRET) {
                authenticated = true;
            }
            // Verificar si es ADMIN_SECRET_KEY (legacy)
            else if (adminSecret && token === adminSecret) {
                authenticated = true;
            }
            // Verificar como JWT
            else {
                try {
                    const decoded = await verifyToken(token);
                    if (decoded && ALLOWED_ROLES.includes(decoded.role)) {
                        authenticated = true;
                    }
                } catch (e) {
                    // Token inválido
                }
            }
        }

        if (!authenticated) {
            return NextResponse.json({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        // ========== OBTENER PARÁMETROS ==========
        const body = await request.json();
        const { limit = 10, offset = 0 } = body;

        console.log(`🔍 Scraping batch: limit=${limit}, offset=${offset}`);

        // Obtener tours a procesar
        const result = await pool.query(`
            SELECT id, mt_code, name, mt_url
            FROM megatravel_packages
            WHERE mt_url IS NOT NULL
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
                console.error(`❌ Error en ${tour.mt_code}:`, error.message);
                results.push({
                    id: tour.id,
                    mt_code: tour.mt_code,
                    status: 'error',
                    error: error.message?.substring(0, 200)
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
