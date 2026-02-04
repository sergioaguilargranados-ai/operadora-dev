// test-cafe-url.js - Probar scraping de URL de cafe.megatravel
import { config } from 'dotenv';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env.local
config({ path: join(__dirname, '..', '.env.local') });

async function testCafeUrl() {
    console.log('🔍 PROBANDO URLs DE CAFE.MEGATRAVEL\n');
    console.log('='.repeat(70));

    // Ejemplo de tour: MT-12117 - Viviendo Europa
    const mtCode = '12117';

    // URL normal (www)
    const normalUrl = `https://www.megatravel.com.mx/viaje/viviendo-europa-${mtCode}.html`;

    // URL de cafe (mega-conexion)
    const cafeUrl = `https://cafe.megatravel.com.mx/mega-conexion/paquete.php?Exp=${mtCode}`;

    console.log(`\n📍 URL Normal: ${normalUrl}`);
    console.log(`📍 URL Cafe: ${cafeUrl}\n`);

    try {
        // Probar URL normal
        console.log('='.repeat(70));
        console.log('🌐 SCRAPING URL NORMAL (www.megatravel.com.mx)');
        console.log('='.repeat(70));

        const normalResponse = await fetch(normalUrl);
        const normalHtml = await normalResponse.text();
        const $normal = cheerio.load(normalHtml);

        // Extraer precio de URL normal
        const normalPriceText = $normal('.precio').first().text().trim();
        console.log(`💰 Precio encontrado: ${normalPriceText || 'NO ENCONTRADO'}`);

        // Extraer includes de URL normal
        const normalIncludes = [];
        $normal('#linkincluye ul li').each((i, elem) => {
            const text = $normal(elem).text().trim();
            if (text) normalIncludes.push(text);
        });
        console.log(`✅ Includes encontrados: ${normalIncludes.length} items`);
        if (normalIncludes.length > 0) {
            console.log(`   Primeros 3: ${normalIncludes.slice(0, 3).join(', ')}`);
        }

        // Probar URL de cafe
        console.log('\n' + '='.repeat(70));
        console.log('🌐 SCRAPING URL CAFE (cafe.megatravel.com.mx)');
        console.log('='.repeat(70));

        const cafeResponse = await fetch(cafeUrl);
        const cafeHtml = await cafeResponse.text();
        const $cafe = cheerio.load(cafeHtml);

        // Extraer precio de URL cafe
        const cafePriceElements = $cafe('td:contains("Precio por persona:")').next();
        const cafePriceText = cafePriceElements.text().trim();
        console.log(`💰 Precio encontrado: ${cafePriceText || 'NO ENCONTRADO'}`);

        // Extraer impuestos de URL cafe
        const cafeTaxElements = $cafe('td:contains("Impuestos:")').next();
        const cafeTaxText = cafeTaxElements.text().trim();
        console.log(`💵 Impuestos encontrados: ${cafeTaxText || 'NO ENCONTRADO'}`);

        // Extraer includes de URL cafe
        const cafeIncludes = [];
        $cafe('h3:contains("El viaje incluye")').next('ul').find('li').each((i, elem) => {
            const text = $cafe(elem).text().trim();
            if (text) cafeIncludes.push(text);
        });
        console.log(`✅ Includes encontrados: ${cafeIncludes.length} items`);
        if (cafeIncludes.length > 0) {
            console.log(`   Primeros 3: ${cafeIncludes.slice(0, 3).join(', ')}`);
        }

        // Extraer not includes de URL cafe
        const cafeNotIncludes = [];
        $cafe('h3:contains("El viaje no incluye")').next('ul').find('li').each((i, elem) => {
            const text = $cafe(elem).text().trim();
            if (text) cafeNotIncludes.push(text);
        });
        console.log(`❌ Not Includes encontrados: ${cafeNotIncludes.length} items`);
        if (cafeNotIncludes.length > 0) {
            console.log(`   Primeros 3: ${cafeNotIncludes.slice(0, 3).join(', ')}`);
        }

        // Comparación
        console.log('\n' + '='.repeat(70));
        console.log('📊 COMPARACIÓN');
        console.log('='.repeat(70));
        console.log(`\nURL Normal (www):`);
        console.log(`  - Precio: ${normalPriceText ? 'SÍ' : 'NO'}`);
        console.log(`  - Includes: ${normalIncludes.length} items`);

        console.log(`\nURL Cafe (mega-conexion):`);
        console.log(`  - Precio: ${cafePriceText ? 'SÍ' : 'NO'}`);
        console.log(`  - Impuestos: ${cafeTaxText ? 'SÍ' : 'NO'}`);
        console.log(`  - Includes: ${cafeIncludes.length} items`);
        console.log(`  - Not Includes: ${cafeNotIncludes.length} items`);

        console.log('\n' + '='.repeat(70));
        console.log('✅ PRUEBA COMPLETADA');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testCafeUrl();
