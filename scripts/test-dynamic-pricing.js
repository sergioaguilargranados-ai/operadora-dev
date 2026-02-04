// test-dynamic-pricing.js - Probar extracción de precios dinámicos
import { MegaTravelScrapingService } from '../src/services/MegaTravelScrapingService.ts';

async function testDynamicPricing() {
    console.log('🧪 PROBANDO EXTRACCIÓN DE PRECIOS DINÁMICOS\n');
    console.log('='.repeat(70));

    // Tours de prueba (de la lista sin precio)
    const testTours = [
        {
            code: 'MT-12118',
            name: 'Quinceañeras a Europa II',
            url: 'https://www.megatravel.com.mx/viaje/quinceaneras-a-europa-ii-12118.html'
        },
        {
            code: 'MT-12518',
            name: 'Descubre Europa con Mamá',
            url: 'https://www.megatravel.com.mx/viaje/descubre-europa-con-mama-12518.html'
        },
        {
            code: 'MT-12534',
            name: 'Mega Marruecos',
            url: 'https://www.megatravel.com.mx/viaje/mega-marruecos-12534.html'
        }
    ];

    for (const tour of testTours) {
        console.log(`\n📍 Probando: ${tour.code} - ${tour.name}`);
        console.log(`   URL: ${tour.url}`);
        console.log('-'.repeat(70));

        try {
            // Scraping completo (incluye precios dinámicos)
            const result = await MegaTravelScrapingService.scrapeTourComplete(tour.url, 0);

            console.log(`\n✅ Resultado:`);
            console.log(`   Precio: ${result.pricing.price_usd ? `$${result.pricing.price_usd} USD` : 'NO ENCONTRADO'}`);
            console.log(`   Impuestos: ${result.pricing.taxes_usd ? `$${result.pricing.taxes_usd} USD` : 'NO ENCONTRADO'}`);
            console.log(`   Includes: ${result.includes.length} items`);
            console.log(`   Not Includes: ${result.not_includes.length} items`);

        } catch (error) {
            console.error(`\n❌ Error:`, error.message);
        }

        console.log('='.repeat(70));
    }

    console.log('\n✅ PRUEBA COMPLETADA');
}

testDynamicPricing();
