// run-complete-scraping.js - Ejecutar scraping completo de MegaTravel
// Este script actualiza TODOS los tours con precios e includes

import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Configurar WebSocket para Neon
neonConfig.webSocketConstructor = ws;

// Crear pool de conexiones
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runCompleteScraping() {
    console.log('🚀 SCRAPING COMPLETO DE MEGATRAVEL\n');
    console.log('='.repeat(70));
    console.log(`Inicio: ${new Date().toLocaleString('es-MX')}`);
    console.log('='.repeat(70));

    try {
        // Importar el servicio de scraping
        const { MegaTravelScrapingService } = await import('../src/services/MegaTravelScrapingService.ts');

        // Obtener todos los tours de la base de datos
        console.log('\n📊 Obteniendo lista de tours...');
        const result = await pool.query(`
            SELECT id, mt_code, title, url
            FROM megatravel_packages
            WHERE url IS NOT NULL
            ORDER BY id
        `);

        const tours = result.rows;
        console.log(`✅ Encontrados ${tours.length} tours para procesar\n`);

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        // Procesar cada tour
        for (let i = 0; i < tours.length; i++) {
            const tour = tours[i];
            const progress = `[${i + 1}/${tours.length}]`;

            console.log(`\n${progress} Procesando: ${tour.mt_code} - ${tour.title}`);
            console.log(`    URL: ${tour.url}`);

            try {
                // Hacer scraping completo
                console.log(`    🔍 Extrayendo datos...`);
                const scrapedData = await MegaTravelScrapingService.scrapeTourComplete(
                    tour.url,
                    tour.id
                );

                // Guardar en la base de datos
                console.log(`    💾 Guardando en base de datos...`);
                await MegaTravelScrapingService.saveScrapedData(
                    tour.id,
                    scrapedData,
                    pool
                );

                // Mostrar resumen
                console.log(`    ✅ COMPLETADO:`);
                console.log(`       Precio: ${scrapedData.pricing.price_usd ? '$' + scrapedData.pricing.price_usd + ' USD' : 'N/A'}`);
                console.log(`       Impuestos: ${scrapedData.pricing.taxes_usd ? '$' + scrapedData.pricing.taxes_usd + ' USD' : 'N/A'}`);
                console.log(`       Incluye: ${scrapedData.includes.length} items`);
                console.log(`       No Incluye: ${scrapedData.not_includes.length} items`);
                console.log(`       Itinerario: ${scrapedData.itinerary.length} días`);
                console.log(`       Salidas: ${scrapedData.departures.length} fechas`);

                successCount++;

                // Pequeña pausa para no sobrecargar el servidor
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                console.error(`    ❌ ERROR: ${error.message}`);
                errorCount++;

                // Continuar con el siguiente tour
                continue;
            }
        }

        // Resumen final
        console.log('\n' + '='.repeat(70));
        console.log('📊 RESUMEN FINAL');
        console.log('='.repeat(70));
        console.log(`Total tours procesados: ${tours.length}`);
        console.log(`✅ Exitosos: ${successCount} (${((successCount / tours.length) * 100).toFixed(1)}%)`);
        console.log(`❌ Errores: ${errorCount} (${((errorCount / tours.length) * 100).toFixed(1)}%)`);
        console.log(`⏭️  Omitidos: ${skippedCount}`);
        console.log(`\nFin: ${new Date().toLocaleString('es-MX')}`);
        console.log('='.repeat(70));

        // Verificar resultados en la base de datos
        console.log('\n📊 Verificando resultados en base de datos...');
        const statsResult = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(price_usd) as con_precio,
                COUNT(*) - COUNT(price_usd) as sin_precio,
                AVG(array_length(includes, 1)) as avg_includes,
                AVG(array_length(not_includes, 1)) as avg_not_includes
            FROM megatravel_packages
        `);

        const stats = statsResult.rows[0];
        console.log(`\n📈 ESTADÍSTICAS:`);
        console.log(`   Total tours: ${stats.total}`);
        console.log(`   Con precio: ${stats.con_precio} (${((stats.con_precio / stats.total) * 100).toFixed(1)}%)`);
        console.log(`   Sin precio: ${stats.sin_precio} (${((stats.sin_precio / stats.total) * 100).toFixed(1)}%)`);
        console.log(`   Promedio includes: ${parseFloat(stats.avg_includes || 0).toFixed(1)} items`);
        console.log(`   Promedio not_includes: ${parseFloat(stats.avg_not_includes || 0).toFixed(1)} items`);

        console.log('\n✅ SCRAPING COMPLETO FINALIZADO');

    } catch (error) {
        console.error('\n❌ ERROR FATAL:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Ejecutar
runCompleteScraping();
