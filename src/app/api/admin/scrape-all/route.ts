// src/app/api/admin/scrape-all/route.ts
// API endpoint para ejecutar scraping completo de MegaTravel

import { NextRequest, NextResponse } from 'next/server';
import { MegaTravelScrapingService } from '@/services/MegaTravelScrapingService';
import { pool } from '@/lib/db';

export const maxDuration = 300; // 5 minutos máximo por request
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación (opcional - agregar tu lógica aquí)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Obtener parámetros
        const body = await request.json();
        const { limit = 10, offset = 0 } = body;

        console.log(`🔍 Scraping batch: limit=${limit}, offset=${offset}`);

        // Obtener tours a procesar
        const result = await pool.query(`
            SELECT id, mt_code, title, url
            FROM megatravel_packages
            WHERE url IS NOT NULL
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
                    tour.url,
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
                    includes: scrapedData.includes.length
                });

                console.log(`✅ ${tour.mt_code}: $${scrapedData.pricing.price_usd || 'N/A'}`);

            } catch (error: any) {
                console.error(`❌ Error en ${tour.mt_code}:`, error.message);
                results.push({
                    id: tour.id,
                    mt_code: tour.mt_code,
                    status: 'error',
                    error: error.message
                });
            }

            // Pausa de 1 segundo entre tours
            await new Promise(resolve => setTimeout(resolve, 1000));
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
