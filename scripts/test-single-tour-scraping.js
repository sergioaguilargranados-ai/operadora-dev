// test-single-tour-scraping.js - Probar scraping de un tour específico
import { MegaTravelScrapingService } from '../src/services/MegaTravelScrapingService.ts';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env.local
config({ path: join(__dirname, '..', '.env.local') });

async function testSingleTour() {
    console.log('🧪 PROBANDO SCRAPING DE UN TOUR ESPECÍFICO\n');
    console.log('='.repeat(70));

    const tourUrl = 'https://www.megatravel.com.mx/viaje/mega-marruecos-12534.html';
    console.log(`📍 URL: ${tourUrl}\n`);

    try {
        const result = await MegaTravelScrapingService.scrapeTourComplete(tourUrl, 0);

        console.log('\n' + '='.repeat(70));
        console.log('📊 RESULTADOS COMPLETOS');
        console.log('='.repeat(70));

        console.log(`\n💰 PRECIOS:`);
        console.log(`   Precio: ${result.pricing.price_usd ? `$${result.pricing.price_usd} USD` : 'NO ENCONTRADO'}`);
        console.log(`   Impuestos: ${result.pricing.taxes_usd ? `$${result.pricing.taxes_usd} USD` : 'NO ENCONTRADO'}`);

        console.log(`\n✅ INCLUYE (${result.includes.length} items):`);
        result.includes.slice(0, 5).forEach((item, idx) => {
            console.log(`   ${idx + 1}. ${item.substring(0, 80)}${item.length > 80 ? '...' : ''}`);
        });

        console.log(`\n❌ NO INCLUYE (${result.not_includes.length} items):`);
        if (result.not_includes.length > 0) {
            result.not_includes.slice(0, 5).forEach((item, idx) => {
                console.log(`   ${idx + 1}. ${item.substring(0, 80)}${item.length > 80 ? '...' : ''}`);
            });
        } else {
            console.log(`   (Ninguno encontrado)`);
        }

        console.log(`\n📅 ITINERARIO (${result.itinerary.length} días):`);
        result.itinerary.slice(0, 5).forEach((day) => {
            console.log(`\n   Día ${day.day_number}: ${day.title}`);
            console.log(`      ${day.description.substring(0, 150)}...`);
            if (day.meals) {
                console.log(`      Comidas: ${day.meals}`);
            }
        });

        console.log(`\n📸 IMÁGENES:`);
        console.log(`   Principal: ${result.images.main ? 'SÍ' : 'NO'}`);
        console.log(`   Galería: ${result.images.gallery.length} imágenes`);
        console.log(`   Mapa: ${result.images.map ? 'SÍ' : 'NO'}`);

        console.log(`\n🏷️ TAGS (${result.tags.length}):`);
        console.log(`   ${result.tags.join(', ')}`);

        console.log('\n' + '='.repeat(70));
        console.log('✅ PRUEBA COMPLETADA');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error);
        console.error(error.stack);
    }
}

testSingleTour();
