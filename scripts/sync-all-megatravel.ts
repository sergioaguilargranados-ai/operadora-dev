// sync-all-megatravel.ts - Script para sincronizar TODOS los tours de MegaTravel
// Ejecutar: tsx scripts/sync-all-megatravel.ts

import { config } from 'dotenv';
import * as path from 'path';
import { Pool } from 'pg';

// Cargar variables de entorno desde .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

import { MegaTravelScrapingService } from '../src/services/MegaTravelScrapingService';

// Crear pool con SSL forzado para Neon
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Forzar SSL para Neon
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

const MARGIN_PERCENT = 15; // Margen de ganancia por defecto

interface TourBasic {
    mt_code: string;
    mt_url: string;
    name: string;
    category: string;
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function syncAllMegaTravelTours() {
    console.log('🚀 INICIANDO SINCRONIZACIÓN COMPLETA DE MEGATRAVEL\n');
    console.log('═══════════════════════════════════════════════════\n');

    const startTime = Date.now();
    let totalDiscovered = 0;
    let totalSynced = 0;
    let totalFailed = 0;

    try {
        // FASE 1: Descubrir todos los tours
        console.log('📋 FASE 1: Descubriendo todos los tours...\n');
        const allTours = await MegaTravelScrapingService.discoverAllTours();

        totalDiscovered = allTours.length;

        if (totalDiscovered === 0) {
            console.log('❌ No se encontraron tours. Abortando.\n');
            return;
        }

        console.log(`✅ ${totalDiscovered} tours descubiertos\n`);
        console.log('═══════════════════════════════════════════════════\n');

        // FASE 2: Sincronizar cada tour individualmente
        console.log('📦 FASE 2: Sincronizando tours individuales...\n');

        for (let i = 0; i < allTours.length; i++) {
            const tour = allTours[i];
            const progress = `[${i + 1}/${totalDiscovered}]`;

            try {
                console.log(`\n${progress} 📦 ${tour.name} (${tour.mt_code})`);
                console.log(`   🔗 ${tour.mt_url}`);

                // 1. Insertar datos básicos en la BD
                const packageId = await upsertBasicTourData(tour);
                console.log(`   ✅ Datos básicos guardados (ID: ${packageId})`);

                // 2. Hacer scraping completo
                console.log(`   🔍 Scraping completo...`);
                const scrapedData = await MegaTravelScrapingService.scrapeTourComplete(
                    tour.mt_url,
                    packageId
                );

                // 3. Guardar datos scrapeados
                await MegaTravelScrapingService.saveScrapedData(packageId, scrapedData, pool);

                console.log(`   ✅ ${tour.mt_code} sincronizado completo`);
                console.log(`      - Itinerario: ${scrapedData.itinerary.length} días`);
                console.log(`      - Fechas: ${scrapedData.departures.length} salidas`);
                console.log(`      - Tours opcionales: ${scrapedData.optionalTours.length}`);

                totalSynced++;

                // Esperar 2 segundos entre tours (rate limiting amigable)
                if (i < allTours.length - 1) {
                    console.log(`   ⏳ Esperando 2 segundos...`);
                    await sleep(2000);
                }

            } catch (error) {
                totalFailed++;
                console.error(`   ❌ Error en ${tour.mt_code}:`, error);
                console.log(`   ⏭️  Continuando con siguiente tour...\n`);

                // Esperar un poco más si hubo error
                await sleep(3000);
            }
        }

        // RESUMEN FINAL
        const duration = Math.round((Date.now() - startTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;

        console.log('\n═══════════════════════════════════════════════════');
        console.log('📊 RESUMEN DE SINCRONIZACIÓN');
        console.log('═══════════════════════════════════════════════════\n');
        console.log(`✅ Tours descubiertos: ${totalDiscovered}`);
        console.log(`✅ Tours sincronizados: ${totalSynced}`);
        console.log(`❌ Tours fallidos: ${totalFailed}`);
        console.log(`⏱️  Tiempo total: ${minutes}m ${seconds}s`);
        console.log(`📈 Promedio: ${Math.round(duration / totalDiscovered)}s por tour\n`);
        console.log('═══════════════════════════════════════════════════\n');

        if (totalSynced > 0) {
            console.log('🎉 ¡SINCRONIZACIÓN COMPLETADA!\n');
            console.log('🌐 Los datos ya están disponibles en:');
            console.log('   - Base de datos Neon');
            console.log('   - Tu sitio de Vercel\n');
        }

    } catch (error) {
        console.error('\n❌ ERROR FATAL en sincronización:', error);
    } finally {
        await pool.end();
        console.log('✅ Conexión a BD cerrada\n');
    }
}

/**
 * Insertar/actualizar datos básicos del tour en la BD
 */
async function upsertBasicTourData(tour: TourBasic): Promise<number> {
    const slug = tour.name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    const result = await pool.query(`
        INSERT INTO megatravel_packages (
            mt_code, mt_url, slug, name, destination_region,
            category, days, nights, is_active, our_margin_percent,
            last_sync_at, sync_status, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5,
            $6, 1, 0, true, $7,
            CURRENT_TIMESTAMP, 'syncing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        ON CONFLICT (mt_code) DO UPDATE SET
            mt_url = EXCLUDED.mt_url,
            name = EXCLUDED.name,
            destination_region = EXCLUDED.destination_region,
            category = EXCLUDED.category,
            last_sync_at = CURRENT_TIMESTAMP,
            sync_status = 'syncing',
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
    `, [
        tour.mt_code,
        tour.mt_url,
        slug,
        tour.name,
        tour.category,
        tour.category,
        MARGIN_PERCENT
    ]);

    return result.rows[0].id;
}

// Ejecutar script
console.log('╔═══════════════════════════════════════════════════╗');
console.log('║   MEGATRAVEL - SINCRONIZACIÓN COMPLETA          ║');
console.log('║   Versión: v2.262                                ║');
console.log('╚═══════════════════════════════════════════════════╝\n');

syncAllMegaTravelTours()
    .then(() => {
        console.log('👋 Script finalizado\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
