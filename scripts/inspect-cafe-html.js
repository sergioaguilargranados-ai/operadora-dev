// inspect-cafe-html.js - Inspeccionar HTML de cafe.megatravel
import { config } from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env.local
config({ path: join(__dirname, '..', '.env.local') });

async function inspectCafeHtml() {
    console.log('🔍 INSPECCIONANDO HTML DE CAFE.MEGATRAVEL\n');

    const mtCode = '12117';
    const cafeUrl = `https://cafe.megatravel.com.mx/mega-conexion/paquete.php?Exp=${mtCode}`;

    console.log(`📍 URL: ${cafeUrl}\n`);

    try {
        const response = await fetch(cafeUrl);
        const html = await response.text();

        // Guardar HTML completo
        const outputPath = join(__dirname, 'cafe-html-sample.html');
        fs.writeFileSync(outputPath, html, 'utf-8');

        console.log(`✅ HTML guardado en: ${outputPath}`);
        console.log(`📏 Tamaño: ${html.length} caracteres`);

        // Buscar palabras clave
        console.log('\n🔍 Buscando palabras clave:');
        console.log(`  - "Precio": ${html.includes('Precio') ? 'SÍ' : 'NO'}`);
        console.log(`  - "precio": ${html.includes('precio') ? 'SÍ' : 'NO'}`);
        console.log(`  - "Impuestos": ${html.includes('Impuestos') ? 'SÍ' : 'NO'}`);
        console.log(`  - "impuestos": ${html.includes('impuestos') ? 'SÍ' : 'NO'}`);
        console.log(`  - "incluye": ${html.includes('incluye') ? 'SÍ' : 'NO'}`);
        console.log(`  - "El viaje incluye": ${html.includes('El viaje incluye') ? 'SÍ' : 'NO'}`);
        console.log(`  - "USD": ${html.includes('USD') ? 'SÍ' : 'NO'}`);
        console.log(`  - "$": ${html.includes('$') ? 'SÍ' : 'NO'}`);

        // Mostrar primeros 2000 caracteres
        console.log('\n📄 Primeros 2000 caracteres del HTML:');
        console.log('='.repeat(70));
        console.log(html.substring(0, 2000));
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

inspectCafeHtml();
