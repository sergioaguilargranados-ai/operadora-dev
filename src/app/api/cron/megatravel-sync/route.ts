/**
 * API ENDPOINT - CRON JOB: Sincronización nocturna de MegaTravel
 * 
 * Ejecuta el scraping completo de todos los tours de MegaTravel
 * para mantener precios, itinerarios, includes/not-includes actualizados.
 * 
 * Configurado en vercel.json para ejecutarse diariamente a las 3:00 AM CST
 * (09:00 UTC) cuando hay menor tráfico.
 * 
 * Seguridad: Requiere CRON_SECRET para evitar ejecuciones no autorizadas
 * 
 * Build: 19 Feb 2026 - v2.320 - Cron MegaTravel nocturno
 */

import { NextRequest, NextResponse } from 'next/server';
import { MegaTravelScrapingService } from '@/services/MegaTravelScrapingService';
import { pool } from '@/lib/db';

export const maxDuration = 300; // 5 minutos max por invocación
export const dynamic = 'force-dynamic';

const BATCH_SIZE = 5; // Tours por batch (conservador para no agotar timeout)
const PAUSE_BETWEEN_TOURS_MS = 2000; // 2 segundos entre tours

export async function GET(request: NextRequest) {
    const startTime = Date.now();

    try {
        // ========== AUTENTICACIÓN ==========
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'change-me-in-production';

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        console.log('🌙 [CRON] Iniciando sincronización nocturna de MegaTravel...');

        // ========== OBTENER TOURS PENDIENTES ==========
        // Buscar tours que no se han actualizado en las últimas 20 horas
        // Esto asegura que se procesan todos diariamente
        const toursResult = await pool.query(`
            SELECT id, mt_code, name, mt_url
            FROM megatravel_packages
            WHERE mt_url IS NOT NULL
            AND (
                updated_at < NOW() - INTERVAL '20 hours'
                OR updated_at IS NULL
            )
            ORDER BY updated_at ASC NULLS FIRST
            LIMIT $1
        `, [BATCH_SIZE]);

        const tours = toursResult.rows;

        if (tours.length === 0) {
            console.log('✅ [CRON] Todos los tours están actualizados');
            return NextResponse.json({
                success: true,
                message: 'Todos los tours están actualizados',
                processed: 0,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`📦 [CRON] Procesando ${tours.length} tours pendientes...`);

        // ========== REGISTRAR INICIO DE SYNC ==========
        const syncLog = await pool.query(`
            INSERT INTO megatravel_sync_log (sync_type, triggered_by, status, details)
            VALUES ('cron', 'cron-nightly', 'running', $1)
            RETURNING id
        `, [JSON.stringify({ batch_size: tours.length })]);
        const syncId = syncLog.rows[0]?.id;

        // ========== PROCESAR CADA TOUR ==========
        const results: Array<{
            mt_code: string;
            status: 'success' | 'error';
            itinerary?: number;
            price?: number | null;
            includes?: number;
            not_includes?: number;
            error?: string;
        }> = [];

        let successCount = 0;
        let errorCount = 0;

        for (const tour of tours) {
            try {
                console.log(`🔍 [CRON] Scraping: ${tour.mt_code} - ${tour.name}`);

                const scrapedData = await MegaTravelScrapingService.scrapeTourComplete(
                    tour.mt_url,
                    tour.id
                );

                await MegaTravelScrapingService.saveScrapedData(
                    tour.id,
                    scrapedData,
                    pool
                );

                successCount++;
                results.push({
                    mt_code: tour.mt_code,
                    status: 'success',
                    itinerary: scrapedData.itinerary.length,
                    price: scrapedData.pricing.price_usd,
                    includes: scrapedData.includes.length,
                    not_includes: scrapedData.not_includes.length
                });

                console.log(`✅ [CRON] ${tour.mt_code}: $${scrapedData.pricing.price_usd || 'N/A'}, ${scrapedData.itinerary.length} días, ${scrapedData.includes.length}/${scrapedData.not_includes.length} inc/no-inc`);

            } catch (error: any) {
                errorCount++;
                const errorMsg = error.message || String(error);
                console.error(`❌ [CRON] Error en ${tour.mt_code}:`, errorMsg);
                results.push({
                    mt_code: tour.mt_code,
                    status: 'error',
                    error: errorMsg.substring(0, 200)
                });
            }

            // Pausa entre tours para no sobrecargar
            if (tours.indexOf(tour) < tours.length - 1) {
                await new Promise(resolve => setTimeout(resolve, PAUSE_BETWEEN_TOURS_MS));
            }
        }

        const duration = Date.now() - startTime;

        // ========== ACTUALIZAR LOG DE SYNC ==========
        if (syncId) {
            await pool.query(`
                UPDATE megatravel_sync_log
                SET completed_at = CURRENT_TIMESTAMP,
                    packages_found = $1,
                    packages_synced = $2,
                    packages_failed = $3,
                    status = 'completed',
                    details = $4
                WHERE id = $5
            `, [tours.length, successCount, errorCount, JSON.stringify({ results }), syncId]);
        }

        // Actualizar timestamp de última sincronización
        await pool.query(`
            INSERT INTO app_settings (key, value)
            VALUES ('MEGATRAVEL_LAST_CRON', $1)
            ON CONFLICT (key) DO UPDATE SET value = $1
        `, [new Date().toISOString()]).catch(() => {
            // Ignorar si la tabla no tiene ON CONFLICT
        });

        const durationSec = (duration / 1000).toFixed(1);
        console.log(`🌙 [CRON] Sincronización completada: ${successCount}/${tours.length} exitosos en ${durationSec}s`);

        // ========== CALCULAR TOURS RESTANTES ==========
        const remainingResult = await pool.query(`
            SELECT COUNT(*) as remaining
            FROM megatravel_packages
            WHERE mt_url IS NOT NULL
            AND (
                updated_at < NOW() - INTERVAL '20 hours'
                OR updated_at IS NULL
            )
        `);
        const remaining = parseInt(remainingResult.rows[0]?.remaining || '0');

        return NextResponse.json({
            success: true,
            message: `Sincronización cron completada`,
            syncId,
            processed: tours.length,
            success_count: successCount,
            error_count: errorCount,
            remaining_tours: remaining,
            duration: `${durationSec}s`,
            results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error('❌ [CRON] Error fatal en sincronización:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
            duration: `${(duration / 1000).toFixed(1)}s`,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// También permitir POST para ejecución manual
export async function POST(request: NextRequest) {
    return GET(request);
}
