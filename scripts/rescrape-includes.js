// rescrape-includes.js - Re-scrapear solo includes de tours ya procesados
import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const ADMIN_SECRET = 'admin-scraping-secret-2026';
const BATCH_SIZE = 20; // Más rápido porque solo scrapeamos includes

async function rescrapIncludes() {
    console.log('🔄 RE-SCRAPING DE INCLUDES\n');
    console.log('='.repeat(70));
    console.log(`Inicio: ${new Date().toLocaleString('es-MX')}`);
    console.log(`API: ${API_URL}`);
    console.log(`Batch size: ${BATCH_SIZE} tours`);
    console.log('='.repeat(70));

    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalErrors = 0;
    let offset = 0;

    // Procesar en batches hasta que no haya más tours
    while (true) {
        const batchNumber = Math.floor(offset / BATCH_SIZE) + 1;

        console.log(`\n📦 BATCH ${batchNumber} (Offset ${offset})`);
        console.log('-'.repeat(70));

        try {
            const response = await fetch(`${API_URL}/api/admin/scrape-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ADMIN_SECRET}`
                },
                body: JSON.stringify({
                    limit: BATCH_SIZE,
                    offset: offset
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                if (data.processed === 0) {
                    console.log('✅ No hay más tours para procesar');
                    break;
                }

                const batchSuccess = data.results.filter(r => r.status === 'success').length;
                const batchErrors = data.results.filter(r => r.status === 'error').length;

                totalProcessed += data.processed;
                totalSuccess += batchSuccess;
                totalErrors += batchErrors;

                console.log(`✅ Batch completado: ${batchSuccess} exitosos, ${batchErrors} errores`);

                // Mostrar resultados con includes
                data.results.forEach((r, idx) => {
                    if (r.status === 'success') {
                        console.log(`   ${idx + 1}. ✓ ${r.mt_code}: ${r.includes} includes`);
                    } else {
                        console.log(`   ${idx + 1}. ✗ ${r.mt_code}: Error`);
                    }
                });

                console.log(`\n📊 Total: ${totalProcessed} procesados, ${totalSuccess} exitosos, ${totalErrors} errores`);

            } else {
                console.error(`❌ Error en batch: ${data.error}`);
                totalErrors += BATCH_SIZE;
            }

        } catch (error) {
            console.error(`❌ Error en batch ${batchNumber}:`, error.message);
            totalErrors += BATCH_SIZE;
        }

        offset += BATCH_SIZE;

        // Pausa entre batches
        console.log(`⏸️  Esperando 2 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Resumen final
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(70));
    console.log(`Total procesados: ${totalProcessed}`);
    console.log(`✅ Exitosos: ${totalSuccess} (${((totalSuccess / totalProcessed) * 100).toFixed(1)}%)`);
    console.log(`❌ Errores: ${totalErrors} (${((totalErrors / totalProcessed) * 100).toFixed(1)}%)`);
    console.log(`\nFin: ${new Date().toLocaleString('es-MX')}`);
    console.log('='.repeat(70));
    console.log('\n✅ RE-SCRAPING DE INCLUDES COMPLETADO');
}

// Ejecutar
rescrapIncludes().catch(console.error);
