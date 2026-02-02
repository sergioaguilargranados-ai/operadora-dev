// trigger-scraping.js - Ejecutar scraping completo en batches
// Este script llama al endpoint API en batches de 10 tours

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'your-secret-key-here';
const BATCH_SIZE = 10;
const TOTAL_TOURS = 325;

async function triggerScraping() {
    console.log('🚀 INICIANDO SCRAPING COMPLETO DE MEGATRAVEL\n');
    console.log('='.repeat(70));
    console.log(`API URL: ${API_URL}`);
    console.log(`Batch size: ${BATCH_SIZE} tours`);
    console.log(`Total tours: ${TOTAL_TOURS}`);
    console.log(`Batches estimados: ${Math.ceil(TOTAL_TOURS / BATCH_SIZE)}`);
    console.log('='.repeat(70));

    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalErrors = 0;
    let offset = 0;

    while (offset < TOTAL_TOURS) {
        const batchNumber = Math.floor(offset / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(TOTAL_TOURS / BATCH_SIZE);

        console.log(`\n📦 BATCH ${batchNumber}/${totalBatches} (Tours ${offset + 1}-${Math.min(offset + BATCH_SIZE, TOTAL_TOURS)})`);
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
                const batchSuccess = data.results.filter(r => r.status === 'success').length;
                const batchErrors = data.results.filter(r => r.status === 'error').length;

                totalProcessed += data.processed;
                totalSuccess += batchSuccess;
                totalErrors += batchErrors;

                console.log(`✅ Batch completado: ${batchSuccess} exitosos, ${batchErrors} errores`);

                // Mostrar algunos resultados
                data.results.slice(0, 3).forEach(r => {
                    if (r.status === 'success') {
                        console.log(`   ✓ ${r.mt_code}: $${r.price || 'N/A'} USD, ${r.includes} includes`);
                    } else {
                        console.log(`   ✗ ${r.mt_code}: ${r.error}`);
                    }
                });

                if (data.results.length > 3) {
                    console.log(`   ... y ${data.results.length - 3} más`);
                }

            } else {
                console.error(`❌ Error en batch: ${data.error}`);
                totalErrors += BATCH_SIZE;
            }

        } catch (error) {
            console.error(`❌ Error llamando API:`, error.message);
            totalErrors += BATCH_SIZE;
        }

        offset += BATCH_SIZE;

        // Pausa entre batches
        if (offset < TOTAL_TOURS) {
            console.log(`⏸️  Esperando 5 segundos antes del siguiente batch...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    // Resumen final
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(70));
    console.log(`Total procesados: ${totalProcessed}`);
    console.log(`✅ Exitosos: ${totalSuccess} (${((totalSuccess / totalProcessed) * 100).toFixed(1)}%)`);
    console.log(`❌ Errores: ${totalErrors} (${((totalErrors / totalProcessed) * 100).toFixed(1)}%)`);
    console.log('='.repeat(70));
    console.log('\n✅ SCRAPING COMPLETO FINALIZADO');
}

// Ejecutar
triggerScraping().catch(console.error);
