// monitor-and-rescrape.js - Monitorear scraping y lanzar re-scraping automáticamente
import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const API_URL = process.env.API_URL || 'http://localhost:3000';
const CHECK_INTERVAL = 60000; // Verificar cada 60 segundos
const TOTAL_TOURS = 325;

async function checkScrapingProgress() {
    try {
        // Verificar cuántos tours tienen datos actualizados
        const response = await fetch(`${API_URL}/api/debug/db-info`);
        const data = await response.json();

        if (data.success && data.megatravel) {
            return {
                total: data.megatravel.total || 0,
                withPrice: data.megatravel.with_price || 0,
                withIncludes: data.megatravel.with_includes || 0
            };
        }
        return null;
    } catch (error) {
        console.error('Error verificando progreso:', error.message);
        return null;
    }
}

async function monitorAndRescrape() {
    console.log('🔍 MONITOR DE SCRAPING AUTOMÁTICO\n');
    console.log('='.repeat(70));
    console.log(`Inicio: ${new Date().toLocaleString('es-MX')}`);
    console.log(`Verificando cada: ${CHECK_INTERVAL / 1000} segundos`);
    console.log(`Total tours esperados: ${TOTAL_TOURS}`);
    console.log('='.repeat(70));
    console.log('\n⏳ Esperando a que termine el scraping inicial...\n');

    let lastProgress = 0;
    let checksWithoutProgress = 0;
    const MAX_CHECKS_WITHOUT_PROGRESS = 5; // Si no hay progreso en 5 checks, asumir que terminó

    while (true) {
        const stats = await checkScrapingProgress();

        if (stats) {
            const currentProgress = stats.withPrice;
            const progressPercent = Math.round((currentProgress / TOTAL_TOURS) * 100);

            console.log(`📊 [${new Date().toLocaleTimeString('es-MX')}] Progreso: ${currentProgress}/${TOTAL_TOURS} tours (${progressPercent}%)`);
            console.log(`   ├─ Con precio: ${stats.withPrice}`);
            console.log(`   └─ Con includes: ${stats.withIncludes}`);

            // Verificar si hay progreso
            if (currentProgress > lastProgress) {
                lastProgress = currentProgress;
                checksWithoutProgress = 0;
            } else {
                checksWithoutProgress++;
            }

            // Si llegamos a 325 tours o no hay progreso en varios checks
            if (currentProgress >= TOTAL_TOURS || checksWithoutProgress >= MAX_CHECKS_WITHOUT_PROGRESS) {
                console.log('\n' + '='.repeat(70));
                console.log('✅ SCRAPING INICIAL COMPLETADO');
                console.log('='.repeat(70));
                console.log(`Tours procesados: ${currentProgress}/${TOTAL_TOURS}`);
                console.log(`Con precio: ${stats.withPrice}`);
                console.log(`Con includes: ${stats.withIncludes}`);
                console.log(`\nFin: ${new Date().toLocaleString('es-MX')}`);
                console.log('='.repeat(70));

                // Esperar 10 segundos antes de lanzar re-scraping
                console.log('\n⏸️  Esperando 10 segundos antes de iniciar re-scraping...\n');
                await new Promise(resolve => setTimeout(resolve, 10000));

                // Lanzar re-scraping automáticamente
                console.log('🚀 INICIANDO RE-SCRAPING DE INCLUDES AUTOMÁTICAMENTE\n');
                console.log('='.repeat(70));

                try {
                    // Ejecutar el script de re-scraping
                    const { stdout, stderr } = await execAsync('node scripts/rescrape-includes.js', {
                        cwd: process.cwd(),
                        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
                    });

                    console.log(stdout);
                    if (stderr) console.error(stderr);

                    console.log('\n' + '='.repeat(70));
                    console.log('✅ RE-SCRAPING COMPLETADO EXITOSAMENTE');
                    console.log('='.repeat(70));

                    // Verificar estadísticas finales
                    const finalStats = await checkScrapingProgress();
                    if (finalStats) {
                        console.log('\n📊 ESTADÍSTICAS FINALES:');
                        console.log(`   Total tours: ${finalStats.total}`);
                        console.log(`   Con precio: ${finalStats.withPrice}`);
                        console.log(`   Con includes: ${finalStats.withIncludes}`);
                        console.log(`   Cobertura includes: ${Math.round((finalStats.withIncludes / finalStats.total) * 100)}%`);
                    }

                } catch (error) {
                    console.error('\n❌ Error ejecutando re-scraping:', error.message);
                    console.log('\n💡 Puedes ejecutar manualmente: node scripts/rescrape-includes.js');
                }

                break;
            }
        }

        // Esperar antes del próximo check
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }

    console.log('\n✅ PROCESO COMPLETO FINALIZADO');
}

// Ejecutar
monitorAndRescrape().catch(console.error);
