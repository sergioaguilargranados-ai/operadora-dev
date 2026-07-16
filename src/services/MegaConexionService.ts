// MegaConexionService.ts - Servicio para extraer datos de Mega Conexión
// Build: 15 Jul 2026 - v2.424 - Compatibilidad Vercel con puppeteer-core + @sparticuz/chromium
//
// Este servicio complementa MegaTravelScrapingService extrayendo datos que
// están más completos en las URLs de Mega Conexión (vi.php)

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import * as cheerio from 'cheerio';
import { pool } from '@/lib/db';

// Helper para lanzar el browser compatible con Vercel serverless
async function launchBrowser() {
    return puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.executablePath(),
        headless: true,
    });
}

// URLs de Mega Conexión por destino
const MEGA_CONEXION_URLS = {
    ofertas: 'https://www.megatravel.com.mx/tools/ofertas-viaje.php',
    promociones: 'https://www.megatravel.com.mx/tools/vi.php',
    europa: 'https://www.megatravel.com.mx/tools/vi.php?Dest=1',
    medio_oriente: 'https://www.megatravel.com.mx/tools/vi.php?Dest=2',
    canada: 'https://www.megatravel.com.mx/tools/vi.php?Dest=3',
    asia: 'https://www.megatravel.com.mx/tools/vi.php?Dest=4',
    africa: 'https://www.megatravel.com.mx/tools/vi.php?Dest=5',
    pacifico: 'https://www.megatravel.com.mx/tools/vi.php?Dest=6',
    sudamerica: 'https://www.megatravel.com.mx/tools/vi.php?Dest=7',
    estados_unidos: 'https://www.megatravel.com.mx/tools/vi.php?Dest=8',
    centroamerica: 'https://www.megatravel.com.mx/tools/vi.php?Dest=9',
    cuba_caribe: 'https://www.megatravel.com.mx/tools/vi.php?Dest=10',
    nacionales: 'https://www.megatravel.com.mx/tools/vi.php?Dest=11',
    eventos: 'https://www.megatravel.com.mx/tools/vi.php?Dest=12',
    cruceros: 'https://www.megatravel.com.mx/tools/vi.php?Dest=13'
};

interface MegaConexionData {
    mt_code: string;
    itinerary?: Array<{
        day_number: number;
        title: string;
        description: string;
        meals?: string;
    }>;
    cities?: string[];
    countries?: string[];
    price_usd?: number;
    taxes_usd?: number;
    includes?: string[];
    not_includes?: string[];
    detailed_info?: string;
}

export class MegaConexionService {

    /**
     * Extraer datos de un tour específico desde Mega Conexión
     */
    static async scrapeFromMegaConexion(mtCode: string): Promise<MegaConexionData | null> {
        console.log(`🔍 Buscando ${mtCode} en Mega Conexión...`);

        const browser = await launchBrowser();

        try {
            // Buscar en todas las categorías
            for (const [category, url] of Object.entries(MEGA_CONEXION_URLS)) {
                console.log(`  Buscando en ${category}...`);

                const page = await browser.newPage();
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

                // Esperar a que cargue el contenido
                await new Promise(resolve => setTimeout(resolve, 2000));

                const html = await page.content();
                const $ = cheerio.load(html);

                // Buscar el tour por código
                const tourLink = $(`a[href*="${mtCode}"]`).first();

                if (tourLink.length > 0) {
                    console.log(`  ✅ Encontrado en ${category}`);
                    const tourUrl = tourLink.attr('href');

                    if (tourUrl) {
                        // Navegar a la página del tour
                        await page.goto(tourUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        const tourHtml = await page.content();
                        const $tour = cheerio.load(tourHtml);

                        // Extraer datos
                        const data = await this.extractTourData($tour, mtCode);
                        await page.close();
                        await browser.close();

                        return data;
                    }
                }

                await page.close();
            }

            console.log(`  ❌ No encontrado en Mega Conexión`);
            await browser.close();
            return null;

        } catch (error) {
            console.error(`Error scraping from Mega Conexión:`, error);
            await browser.close();
            return null;
        }
    }

    /**
     * Extraer datos del tour desde el HTML de Mega Conexión
     */
    private static async extractTourData($: cheerio.Root, mtCode: string): Promise<MegaConexionData> {
        const data: MegaConexionData = { mt_code: mtCode };

        // 1. EXTRAER ITINERARIO COMPLETO
        data.itinerary = this.extractItinerary($);

        // 2. EXTRAER CIUDADES
        data.cities = this.extractCities($);

        // 3. EXTRAER PAÍSES
        data.countries = this.extractCountries($);

        // 4. EXTRAER PRECIOS
        const pricing = this.extractPricing($);
        data.price_usd = pricing.price_usd ?? undefined;
        data.taxes_usd = pricing.taxes_usd ?? undefined;

        // 5. EXTRAER INCLUYE
        data.includes = this.extractIncludes($);

        // 6. EXTRAER NO INCLUYE
        data.not_includes = this.extractNotIncludes($);

        return data;
    }

    /**
     * Extraer itinerario completo (día por día)
     */
    private static extractItinerary($: cheerio.Root): Array<{
        day_number: number;
        title: string;
        description: string;
        meals?: string;
    }> {
        const itinerary: Array<any> = [];

        // Buscar secciones de itinerario
        // Mega Conexión suele tener el itinerario en divs o párrafos con "DÍA"
        const itinerarySection = $('div:contains("DÍA"), p:contains("DÍA"), td:contains("DÍA")').parent();

        if (itinerarySection.length > 0) {
            const fullText = itinerarySection.text();

            // Limpiar HTML y extraer días
            const cleanText = fullText
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/?(strong|b|p|div)>/gi, '\n')
                .replace(/\s+/g, ' ')
                .trim();

            // Regex mejorado para capturar días
            const dayRegex = /DÍA\s+(\d+)\s+([^\n]+?)(?=DÍA\s+\d+|$)/gi;
            let match;

            while ((match = dayRegex.exec(cleanText)) !== null) {
                const dayNumber = parseInt(match[1]);
                const content = match[2].trim();

                // Separar título y descripción
                const lines = content.split('\n').filter(l => l.trim());
                const title = lines[0] || `Día ${dayNumber}`;
                const description = lines.slice(1).join(' ').trim();

                // Detectar comidas
                const meals = this.detectMeals(content);

                itinerary.push({
                    day_number: dayNumber,
                    title: title.substring(0, 200),
                    description: description.substring(0, 2000),
                    meals: meals || undefined
                });
            }
        }

        // Si no encontró nada, intentar método alternativo
        if (itinerary.length === 0) {
            // Buscar en todo el documento
            const bodyText = $('body').html() || '';
            const cleanBody = bodyText
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/?(strong|b|p|div|span)>/gi, '\n')
                .replace(/&nbsp;/g, ' ')
                .trim();

            const dayRegex = /DÍA\s+(\d+)[:\s]+([^\n]+?)(?=DÍA\s+\d+|$)/gi;
            let match;

            while ((match = dayRegex.exec(cleanBody)) !== null) {
                const dayNumber = parseInt(match[1]);
                const content = match[2].trim();

                itinerary.push({
                    day_number: dayNumber,
                    title: `Día ${dayNumber}`,
                    description: content.substring(0, 2000),
                    meals: this.detectMeals(content)
                });
            }
        }

        console.log(`    📅 Itinerario: ${itinerary.length} días extraídos`);
        return itinerary;
    }

    /**
     * Detectar comidas en el texto del itinerario
     */
    private static detectMeals(text: string): string | null {
        const meals: string[] = [];

        if (/desayuno/i.test(text)) meals.push('Desayuno');
        if (/almuerzo|comida/i.test(text)) meals.push('Almuerzo');
        if (/cena/i.test(text)) meals.push('Cena');

        return meals.length > 0 ? meals.join(', ') : null;
    }

    /**
     * Extraer ciudades del tour
     */
    private static extractCities($: cheerio.Root): string[] {
        const cities: Set<string> = new Set();

        // Buscar en diferentes lugares
        const selectors = [
            'span:contains("Ciudades")',
            'div:contains("Ciudades")',
            'td:contains("Ciudades")',
            'strong:contains("Visitando")',
            'b:contains("Visitando")'
        ];

        for (const selector of selectors) {
            const element = $(selector).first();
            if (element.length > 0) {
                const text = element.parent().text();

                // Extraer ciudades (separadas por comas, guiones, etc.)
                const matches = text.match(/([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/g);

                if (matches) {
                    matches.forEach(city => {
                        const cleaned = city.trim();
                        if (cleaned.length > 2 && cleaned.length < 50) {
                            cities.add(cleaned);
                        }
                    });
                }
            }
        }

        // También buscar en el título del tour
        const title = $('h1, h2, .title').first().text();
        const titleCities = title.match(/([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/g);

        if (titleCities) {
            titleCities.forEach(city => {
                const cleaned = city.trim();
                if (cleaned.length > 2 && cleaned.length < 50) {
                    cities.add(cleaned);
                }
            });
        }

        const result = Array.from(cities);
        console.log(`    🏙️ Ciudades: ${result.length} encontradas`);
        return result;
    }

    /**
     * Extraer países del tour
     */
    private static extractCountries($: cheerio.Root): string[] {
        const countries: Set<string> = new Set();

        // Lista de países comunes en tours
        const commonCountries = [
            'España', 'Francia', 'Italia', 'Alemania', 'Suiza', 'Austria',
            'Turquía', 'Grecia', 'Portugal', 'Holanda', 'Bélgica',
            'Estados Unidos', 'Canadá', 'México',
            'Perú', 'Argentina', 'Chile', 'Brasil', 'Colombia',
            'Japón', 'China', 'Tailandia', 'India', 'Vietnam',
            'Egipto', 'Marruecos', 'Sudáfrica', 'Kenia',
            'Australia', 'Nueva Zelanda'
        ];

        const bodyText = $('body').text();

        commonCountries.forEach(country => {
            if (new RegExp(country, 'i').test(bodyText)) {
                countries.add(country);
            }
        });

        const result = Array.from(countries);
        console.log(`    🌍 Países: ${result.length} encontrados`);
        return result;
    }

    /**
     * Extraer precios
     */
    private static extractPricing($: cheerio.Root): { price_usd: number | null; taxes_usd: number | null } {
        let price_usd: number | null = null;
        let taxes_usd: number | null = null;

        // Buscar precios en diferentes formatos
        const priceSelectors = [
            'span:contains("USD")',
            'div:contains("Precio")',
            'td:contains("$")',
            '.price',
            '.precio'
        ];

        for (const selector of priceSelectors) {
            $(selector).each((i, el) => {
                const text = $(el).text();

                // Buscar formato $X,XXX USD
                const priceMatch = text.match(/\$?\s*([0-9,]+)\s*USD/i);
                if (priceMatch && !price_usd) {
                    price_usd = parseInt(priceMatch[1].replace(/,/g, ''));
                }

                // Buscar impuestos
                if (/impuesto|tax/i.test(text)) {
                    const taxMatch = text.match(/\$?\s*([0-9,]+)/);
                    if (taxMatch && !taxes_usd) {
                        taxes_usd = parseInt(taxMatch[1].replace(/,/g, ''));
                    }
                }
            });
        }

        console.log(`    💰 Precio: ${price_usd ? '$' + price_usd : 'No encontrado'} | Impuestos: ${taxes_usd ? '$' + taxes_usd : 'No encontrado'}`);
        return { price_usd, taxes_usd };
    }

    /**
     * Extraer lo que incluye
     */
    private static extractIncludes($: cheerio.Root): string[] {
        const includes: string[] = [];

        const selectors = [
            'div:contains("Incluye")',
            'div:contains("El viaje incluye")',
            'td:contains("Incluye")',
            'ul:contains("Incluye")'
        ];

        for (const selector of selectors) {
            const section = $(selector).first();
            if (section.length > 0) {
                // Buscar lista
                section.find('li').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text && text.length > 5) {
                        includes.push(text);
                    }
                });

                // Si no hay lista, buscar líneas
                if (includes.length === 0) {
                    const text = section.text();
                    const lines = text.split(/\n|•|-/).filter(l => l.trim().length > 5);
                    includes.push(...lines.map(l => l.trim()));
                }

                if (includes.length > 0) break;
            }
        }

        console.log(`    ✅ Incluye: ${includes.length} items`);
        return includes;
    }

    /**
     * Extraer lo que NO incluye
     */
    private static extractNotIncludes($: cheerio.Root): string[] {
        const notIncludes: string[] = [];

        const selectors = [
            'div:contains("No incluye")',
            'div:contains("No Incluye")',
            'div:contains("NO INCLUYE")',
            'td:contains("No incluye")',
            'ul:contains("No incluye")'
        ];

        for (const selector of selectors) {
            const section = $(selector).first();
            if (section.length > 0) {
                // Buscar lista
                section.find('li').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text && text.length > 5) {
                        notIncludes.push(text);
                    }
                });

                // Si no hay lista, buscar líneas
                if (notIncludes.length === 0) {
                    const text = section.text();
                    const lines = text.split(/\n|•|-/).filter(l => l.trim().length > 5);
                    notIncludes.push(...lines.map(l => l.trim()));
                }

                if (notIncludes.length > 0) break;
            }
        }

        console.log(`    ❌ No Incluye: ${notIncludes.length} items`);
        return notIncludes;
    }

    /**
     * Actualizar tour en base de datos con datos de Mega Conexión
     */
    static async updateTourFromMegaConexion(mtCode: string): Promise<boolean> {
        try {
            console.log(`\n🔄 Actualizando ${mtCode} desde Mega Conexión...`);

            const data = await this.scrapeFromMegaConexion(mtCode);

            if (!data) {
                console.log(`❌ No se pudo obtener datos de Mega Conexión`);
                return false;
            }

            // Obtener ID del paquete
            const pkgResult = await pool.query(
                'SELECT id FROM megatravel_packages WHERE mt_code = $1',
                [mtCode]
            );

            if (pkgResult.rows.length === 0) {
                console.log(`❌ Paquete ${mtCode} no existe en BD`);
                return false;
            }

            const packageId = pkgResult.rows[0].id;

            // Actualizar paquete
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (data.cities && data.cities.length > 0) {
                updates.push(`cities = $${paramIndex++}`);
                values.push(data.cities);
            }

            if (data.countries && data.countries.length > 0) {
                updates.push(`countries = $${paramIndex++}`);
                values.push(data.countries);
            }

            if (data.price_usd) {
                updates.push(`price_usd = $${paramIndex++}`);
                values.push(data.price_usd);
            }

            if (data.taxes_usd) {
                updates.push(`taxes_usd = $${paramIndex++}`);
                values.push(data.taxes_usd);
            }

            if (data.includes && data.includes.length > 0) {
                updates.push(`includes = $${paramIndex++}`);
                values.push(data.includes);
            }

            if (data.not_includes && data.not_includes.length > 0) {
                updates.push(`not_includes = $${paramIndex++}`);
                values.push(data.not_includes);
            }

            if (updates.length > 0) {
                updates.push(`updated_at = CURRENT_TIMESTAMP`);
                values.push(packageId);

                await pool.query(
                    `UPDATE megatravel_packages SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
                    values
                );

                console.log(`✅ Paquete actualizado con ${updates.length} campos`);
            }

            // Actualizar itinerario si existe
            if (data.itinerary && data.itinerary.length > 0) {
                // Eliminar itinerario anterior
                await pool.query(
                    'DELETE FROM megatravel_itinerary WHERE package_id = $1',
                    [packageId]
                );

                // Insertar nuevo itinerario
                for (const day of data.itinerary) {
                    await pool.query(
                        `INSERT INTO megatravel_itinerary 
                         (package_id, day_number, title, description, meals)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [packageId, day.day_number, day.title, day.description, day.meals]
                    );
                }

                console.log(`✅ Itinerario actualizado: ${data.itinerary.length} días`);
            }

            return true;

        } catch (error) {
            console.error(`Error updating from Mega Conexión:`, error);
            return false;
        }
    }

    /**
     * Procesar todos los tours que necesitan actualización
     */
    static async updateAllToursFromMegaConexion(): Promise<void> {
        console.log('\n🚀 Iniciando actualización masiva desde Mega Conexión...\n');

        // Obtener tours que necesitan actualización
        const result = await pool.query(`
            SELECT mt_code 
            FROM megatravel_packages 
            WHERE 
                cities IS NULL OR array_length(cities, 1) = 0
                OR not_includes IS NULL OR array_length(not_includes, 1) = 0
                OR price_usd IS NULL
            ORDER BY mt_code
            LIMIT 50
        `);

        console.log(`📊 Tours a actualizar: ${result.rows.length}\n`);

        let updated = 0;
        let failed = 0;

        for (const row of result.rows) {
            const success = await this.updateTourFromMegaConexion(row.mt_code);

            if (success) {
                updated++;
            } else {
                failed++;
            }

            // Esperar entre requests para no saturar
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log(`\n✅ Actualización completada:`);
        console.log(`   Exitosos: ${updated}`);
        console.log(`   Fallidos: ${failed}`);
    }
}

export default MegaConexionService;
