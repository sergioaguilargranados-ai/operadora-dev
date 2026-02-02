// test-final-scraping.js - Prueba final con patrones actualizados
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

async function testFinalScraping() {
    console.log('🧪 PRUEBA FINAL DE SCRAPING - PRECIOS E INCLUDES\n');
    console.log('='.repeat(60));

    const testUrl = 'https://www.megatravel.com.mx/viaje/viviendo-europa-12117.html';
    console.log(`\n📍 URL: ${testUrl}\n`);

    try {
        console.log('🌐 Abriendo navegador...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('📄 Cargando página...');
        await page.goto(testUrl, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        await page.waitForSelector('body', { timeout: 30000 });

        const html = await page.content();
        await browser.close();

        const $ = cheerio.load(html);
        const bodyText = $('body').text();
        const bodyHtml = $('body').html() || '';

        console.log('✅ Página cargada\n');
        console.log('='.repeat(60));
        console.log('📊 EXTRAYENDO DATOS CON PATRONES ACTUALIZADOS');
        console.log('='.repeat(60));

        // ===== PRECIOS =====
        console.log(`\n💰 PRECIOS:`);

        let price_usd = null;
        let taxes_usd = null;

        // Estrategia 1: Buscar "Tarifa Base" e "Impuestos"
        const tarifaBaseMatch = bodyHtml.match(/Tarifa\s+Base[\s\S]{0,200}?\$?\s*([0-9,]+)/i);
        if (tarifaBaseMatch) {
            price_usd = parseFloat(tarifaBaseMatch[1].replace(/,/g, ''));
            console.log(`   ✅ Precio (Tarifa Base): $${price_usd} USD`);
        }

        const impuestosMatch = bodyHtml.match(/Impuestos[\s\S]{0,200}?\$?\s*([0-9,]+)/i);
        if (impuestosMatch) {
            taxes_usd = parseFloat(impuestosMatch[1].replace(/,/g, ''));
            console.log(`   ✅ Impuestos: $${taxes_usd} USD`);
        }

        // Estrategia 2: Patrón alternativo
        if (!price_usd) {
            const pricePattern = /Desde\s+([0-9,]+)\s*USD\s*\+\s*([0-9,]+)\s*IMP/i;
            const match = bodyText.match(pricePattern);
            if (match) {
                price_usd = parseFloat(match[1].replace(/,/g, ''));
                taxes_usd = parseFloat(match[2].replace(/,/g, ''));
                console.log(`   ✅ Precio (patrón alternativo): $${price_usd} USD + $${taxes_usd} IMP`);
            }
        }

        if (!price_usd) {
            console.log(`   ❌ No se encontró precio`);
        }

        // Tipo de habitación
        const roomTypePattern = /Por persona en habitación (Doble|Triple|Cuádruple|Sencilla)/i;
        const roomMatch = bodyText.match(roomTypePattern);
        if (roomMatch) {
            console.log(`   ✅ Tipo: Por persona en habitación ${roomMatch[1]}`);
        }

        // ===== INCLUDES =====
        console.log(`\n✅ INCLUYE:`);
        const includes = [];

        // Estrategia 1: Buscar por ID
        const includesSection = $('#linkincluye');
        if (includesSection.length > 0) {
            includesSection.find('ul li').each((i, elem) => {
                const text = $(elem).text().trim();
                if (text) {
                    includes.push(text);
                }
            });
            console.log(`   ✅ Encontrado por ID: ${includes.length} items`);
        }

        // Estrategia 2: Buscar por texto
        if (includes.length === 0) {
            const includesMatch = bodyHtml.match(/El viaje incluye([\s\S]*?)(?=El viaje no incluye|Itinerario|Mapa del tour|$)/i);
            if (includesMatch) {
                const includesHtml = includesMatch[1];
                const $includes = cheerio.load(includesHtml);

                $includes('li, p').each((i, elem) => {
                    const text = $(elem).text().trim();
                    if (text && text.length > 3 && !text.startsWith('El viaje')) {
                        const cleanText = text.replace(/^[-•*]\s*/, '').trim();
                        if (cleanText) {
                            includes.push(cleanText);
                        }
                    }
                });
                console.log(`   ✅ Encontrado por texto: ${includes.length} items`);
            }
        }

        if (includes.length > 0) {
            includes.slice(0, 5).forEach((item, i) => {
                console.log(`   ${i + 1}. ${item.substring(0, 70)}${item.length > 70 ? '...' : ''}`);
            });
            if (includes.length > 5) {
                console.log(`   ... y ${includes.length - 5} más`);
            }
        } else {
            console.log(`   ❌ No se encontró sección "El viaje incluye"`);
        }

        // ===== NOT INCLUDES =====
        console.log(`\n❌ NO INCLUYE:`);
        const not_includes = [];

        const notIncludesMatch = bodyHtml.match(/El viaje no incluye([\s\S]*?)(?=Itinerario|Mapa del tour|Tours opcionales|$)/i);
        if (notIncludesMatch) {
            const notIncludesHtml = notIncludesMatch[1];
            const $notIncludes = cheerio.load(notIncludesHtml);

            $notIncludes('li, p').each((i, elem) => {
                const text = $(elem).text().trim();
                if (text && text.length > 3 && !text.startsWith('El viaje')) {
                    const cleanText = text.replace(/^[-•*]\s*/, '').trim();
                    if (cleanText) {
                        not_includes.push(cleanText);
                    }
                }
            });
        }

        if (not_includes.length > 0) {
            console.log(`   Total: ${not_includes.length} items`);
            not_includes.slice(0, 5).forEach((item, i) => {
                console.log(`   ${i + 1}. ${item.substring(0, 70)}${item.length > 70 ? '...' : ''}`);
            });
            if (not_includes.length > 5) {
                console.log(`   ... y ${not_includes.length - 5} más`);
            }
        } else {
            console.log(`   ❌ No se encontró sección "El viaje no incluye"`);
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log('📊 RESUMEN');
        console.log('='.repeat(60));
        console.log(`Precio: ${price_usd ? '$' + price_usd + ' USD' : 'No encontrado'}`);
        console.log(`Impuestos: ${taxes_usd ? '$' + taxes_usd + ' USD' : 'No encontrado'}`);
        console.log(`Incluye: ${includes.length} items`);
        console.log(`No Incluye: ${not_includes.length} items`);
        console.log(`\n✅ PRUEBA COMPLETADA`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ ERROR:', error);
        process.exit(1);
    }
}

testFinalScraping();
