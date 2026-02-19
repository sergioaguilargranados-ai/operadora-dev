// MegaTravelScrapingService.ts - Servicio de scraping completo de MegaTravel
// Build: 19 Feb 2026 - v2.322 - Scraping con puppeteer-core + @sparticuz/chromium para Vercel
//
// Este servicio extrae TODA la información de MegaTravel usando:
// - Cheerio para datos estáticos (HTML simple)
// - Puppeteer para datos dinámicos (JavaScript rendering)
// - @sparticuz/chromium para compatibilidad con Vercel serverless

import puppeteer from 'puppeteer-core';
import type { Page } from 'puppeteer-core';
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

// Tipos para las nuevas estructuras de datos
export interface ItineraryDay {
    day_number: number;
    title: string;
    description: string;
    meals?: string;  // 'D,A,C' o combinaciones
    hotel?: string;
    city?: string;
    activities?: string[];
    highlights?: string[];
}

export interface Departure {
    departure_date: string;  // ISO date
    return_date?: string;
    price_usd?: number;
    price_variation?: number;  // Diferencia vs precio base
    availability: string;  // 'available', 'limited', 'sold_out'
    status: string;  // 'confirmed', 'pending', 'cancelled'
    min_passengers?: number;
    max_passengers?: number;
    current_passengers?: number;
    notes?: string;
}

export interface Policies {
    cancellation_policy?: string;
    change_policy?: string;
    payment_policy?: string;
    terms_conditions?: string;
    document_requirements?: string[];
    visa_requirements?: string[];
    vaccine_requirements?: string[];
    insurance_requirements?: string;
    age_restrictions?: string;
    health_requirements?: string;
}

export interface AdditionalInfo {
    important_notes?: string[];
    recommendations?: string[];
    what_to_bring?: string[];
    climate_info?: string;
    local_currency?: string;
    language?: string;
    timezone?: string;
    voltage?: string;
    emergency_contacts?: Record<string, any>;
}

export interface OptionalTourExtended {
    code?: string;
    name: string;
    description: string;
    price_usd?: number;
    valid_dates?: {
        from: string;
        to: string;
    };
    activities?: string[];
    conditions?: string;
    duration?: string;
    included_services?: string[];
}

export class MegaTravelScrapingService {

    /**
     * DESCUBRIR TODOS LOS TOURS desde las páginas de categorías
     */
    static async discoverAllTours(): Promise<Array<{
        mt_code: string;
        mt_url: string;
        name: string;
        category: string;
        price_usd?: number;
    }>> {
        console.log('🔍 Descubriendo todos los tours de MegaTravel...\n');

        const CATEGORY_URLS = [
            { url: 'https://www.megatravel.com.mx/viajes-europa', category: 'Europa' },
            { url: 'https://www.megatravel.com.mx/viaje-a-turquia', category: 'Turquía' },
            { url: 'https://www.megatravel.com.mx/viajes-asia', category: 'Asia' },
            { url: 'https://www.megatravel.com.mx/viaje-a-japon', category: 'Japón' },
            { url: 'https://www.megatravel.com.mx/viajes-medio-oriente', category: 'Medio Oriente' },
            { url: 'https://www.megatravel.com.mx/viajes-estados-unidos', category: 'Estados Unidos' },
            { url: 'https://www.megatravel.com.mx/viajes-canada', category: 'Canadá' },
            { url: 'https://www.megatravel.com.mx/viajes-sudamerica', category: 'Sudamérica' },
            { url: 'https://www.megatravel.com.mx/cruceros', category: 'Cruceros' },
        ];

        const allTours: Array<{
            mt_code: string;
            mt_url: string;
            name: string;
            category: string;
            price_usd?: number;
        }> = [];

        try {
            const browser = await launchBrowser();

            for (const categoryInfo of CATEGORY_URLS) {
                try {
                    console.log(`📂 Explorando: ${categoryInfo.category}...`);

                    const page = await browser.newPage();
                    await page.setViewport({ width: 1920, height: 1080 });

                    await page.goto(categoryInfo.url, {
                        waitUntil: 'networkidle2',
                        timeout: 60000
                    });

                    await page.waitForSelector('body', { timeout: 10000 });
                    const html = await page.content();
                    const $ = cheerio.load(html);

                    // Buscar links a tours individuales
                    // Patrones: /viaje/nombre-tour-12345.html
                    const tourLinks = new Set<string>();

                    $('a[href*="/viaje/"]').each((i, elem) => {
                        const href = $(elem).attr('href');
                        if (href && href.includes('.html')) {
                            const fullUrl = href.startsWith('http')
                                ? href
                                : `https://www.megatravel.com.mx${href}`;
                            tourLinks.add(fullUrl);
                        }
                    });

                    console.log(`   ✅ Encontrados ${tourLinks.size} tours en ${categoryInfo.category}`);

                    // Extraer información básica de cada tour
                    for (const url of tourLinks) {
                        // Extraer código MT desde la URL
                        // Ejemplo: /viaje/mega-turquia-y-dubai-20043.html → MT-20043
                        const codeMatch = url.match(/\/viaje\/.*-(\d+)\.html/);
                        const mtCode = codeMatch ? `MT-${codeMatch[1]}` : `MT-${Date.now()}`;

                        // Extraer nombre desde URL (temporal, se actualizará con scraping completo)
                        const nameMatch = url.match(/\/viaje\/(.+)-\d+\.html/);
                        const name = nameMatch
                            ? nameMatch[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                            : 'Tour sin nombre';

                        allTours.push({
                            mt_code: mtCode,
                            mt_url: url,
                            name: name,
                            category: categoryInfo.category
                        });
                    }

                    await page.close();

                    // Esperar 1 segundo entre categorías para no sobrecargar
                    await new Promise(resolve => setTimeout(resolve, 1000));

                } catch (error) {
                    console.error(`   ❌ Error en categoría ${categoryInfo.category}:`, error);
                }
            }

            await browser.close();

            // Eliminar duplicados por mt_code
            const uniqueTours = Array.from(
                new Map(allTours.map(t => [t.mt_code, t])).values()
            );

            console.log(`\n✅ TOTAL DESCUBIERTO: ${uniqueTours.length} tours únicos\n`);

            return uniqueTours;

        } catch (error) {
            console.error('❌ Error en descubrimiento de tours:', error);
            return [];
        }
    }

    /**
     * Scraping completo de un tour específico
     */
    static async scrapeTourComplete(tourUrl: string, packageId: number): Promise<{
        itinerary: ItineraryDay[];
        departures: Departure[];
        policies: Policies;
        additionalInfo: AdditionalInfo;
        optionalTours: OptionalTourExtended[];
        images: {
            main: string | null;
            gallery: string[];
            map: string | null;
        };
        tags: string[];
        pricing: {
            price_usd: number | null;
            taxes_usd: number | null;
            currency: string;
            price_per_person_type: string;
            price_variants: Record<string, number>;
        };
        includes: string[];
        not_includes: string[];
        // NUEVOS: datos de ciudades, países y duración
        cities: string[];
        countries: string[];
        main_country: string;
        days: number;
        nights: number;
    }> {
        console.log(`🔍 Scraping completo para: ${tourUrl}`);

        try {
            // Abrir navegador con Puppeteer
            const browser = await launchBrowser();

            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            // Navegar a la página
            await page.goto(tourUrl, {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            // Esperar a que cargue el contenido
            await page.waitForSelector('body', { timeout: 30000 });

            // NUEVO: Esperar a que se cargue la tabla de fechas/precios (si existe)
            // Esta tabla se carga dinámicamente con JavaScript
            console.log('   ⏳ Esperando tabla de fechas/precios...');
            try {
                await page.waitForSelector('.table, table, [class*="fecha"], [class*="salida"]', {
                    timeout: 10000
                });
                // Esperar un poco más para que termine de cargar
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log('   ✅ Tabla de fechas cargada');
            } catch (e) {
                console.log('   ⚠️  No se encontró tabla de fechas (puede ser normal)');
            }

            // NUEVO: Extraer precios dinámicos ANTES de cerrar el navegador
            const dynamicPricing = await this.scrapeDynamicPricing(page);

            // Obtener HTML completo DESPUÉS de que todo se haya cargado
            const html = await page.content();

            // Cerrar navegador
            await browser.close();

            // Parsear con Cheerio
            const $ = cheerio.load(html);

            // Extraer código del tour
            const tourCode = tourUrl.match(/(\d+)\.html$/)?.[1] || null;

            // Extraer cada tipo de dato
            const itinerary = await this.scrapeItinerary($, null, tourUrl); // page ya está cerrado
            const departures = await this.scrapeDepartures($);
            const policies = await this.scrapePolicies($);
            const additionalInfo = await this.scrapeAdditionalInfo($);
            const optionalTours = await this.scrapeOptionalTours($);
            const images = await this.scrapeImages($, tourCode);
            const tags = await this.scrapeClassifications($);

            // NUEVO: Extraer ciudades, países y duración desde la página principal
            const tourMeta = await this.scrapeCitiesAndCountries($);

            // Extraer precios estáticos (fallback si no hay dinámicos)
            const staticPricing = await this.scrapePricing($);

            // Usar precios dinámicos si están disponibles, sino usar estáticos
            const pricing = dynamicPricing.price_usd !== null ? dynamicPricing : staticPricing;

            // Includes/Not-includes desde la página principal
            let { includes, not_includes } = await this.scrapeIncludesNotIncludes($);

            // Obtener datos desde circuito.php (FUENTE PRINCIPAL)
            let fullItinerary = itinerary;

            if (tourCode) {
                try {
                    const circuitoData = await this.scrapeFromCircuito(tourCode);

                    // Usar itinerario de circuito.php si tiene más días
                    if (circuitoData.itinerary.length > itinerary.length) {
                        fullItinerary = circuitoData.itinerary;
                        console.log(`✅ Itinerario completo: ${circuitoData.itinerary.length} días (desde circuito.php)`);
                    } else {
                        console.log(`ℹ️  Usando itinerario de página principal: ${itinerary.length} días`);
                    }

                    // Complementar includes si circuito.php tiene más
                    if (circuitoData.includes.length > includes.length) {
                        includes = circuitoData.includes;
                        console.log(`✅ Includes desde circuito.php: ${includes.length} items`);
                    }

                    // Complementar not_includes si circuito.php tiene datos y la página no
                    if (circuitoData.not_includes.length > not_includes.length) {
                        not_includes = circuitoData.not_includes;
                        console.log(`✅ Not-includes desde circuito.php: ${not_includes.length} items`);
                    }

                } catch (error) {
                    console.log(`⚠️  No se pudo obtener datos desde circuito.php, usando página principal`);
                }
            }

            console.log(`✅ Scraping completo para ${tourUrl}:`, {
                itinerary: fullItinerary.length + ' días',
                departures: departures.length + ' salidas',
                optionalTours: optionalTours.length + ' tours',
                images: `${images.gallery.length} imágenes`,
                tags: tags.join(', '),
                price: pricing.price_usd ? `$${pricing.price_usd} USD` : 'Sin precio',
                includes: includes.length + ' items',
                not_includes: not_includes.length + ' items'
            });

            return {
                itinerary: fullItinerary,
                departures,
                policies,
                additionalInfo,
                optionalTours,
                images,
                tags,
                pricing,
                includes,
                not_includes,
                // NUEVOS: datos de ciudades, países y duración
                cities: tourMeta.cities,
                countries: tourMeta.countries,
                main_country: tourMeta.main_country,
                days: tourMeta.days,
                nights: tourMeta.nights
            };

        } catch (error) {
            console.error(`❌ Error en scraping de ${tourUrl}:`, error);
            throw error;
        }
    }

    /**
     * SCRAPING COMPLETO desde circuito.php — FUENTE PRINCIPAL de datos
     * URL: megatravel.com.mx/tools/circuito.php?domi=&domiviaja=&viaje={code}&txtColor=000000&thBG=666666&thTxColor=FFFFFF&ff=1
     * 
     * circuito.php es una SPA que contiene TODOS los datos del tour:
     * Itinerario, Incluye, No Incluye, Precios, Hoteles, Fechas, Notas, Visas
     * Requiere Puppeteer para renderizar el JavaScript.
     */
    static async scrapeFromCircuito(tourCode: string): Promise<{
        itinerary: ItineraryDay[];
        includes: string[];
        not_includes: string[];
        duration: string | null;
    }> {
        const url = `https://www.megatravel.com.mx/tools/circuito.php?domi=&domiviaja=&viaje=${tourCode}&txtColor=000000&thBG=666666&thTxColor=FFFFFF&ff=1`;

        try {
            console.log(`   📄 Obteniendo datos desde circuito.php (viaje=${tourCode})...`);

            const browser = await launchBrowser();

            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            // Esperar a que cargue el contenido dinámico
            await page.waitForSelector('body', { timeout: 10000 });
            await new Promise(resolve => setTimeout(resolve, 5000));

            const html = await page.content();
            await browser.close();

            const $ = cheerio.load(html);

            // ========== ITINERARIO ==========
            const days: ItineraryDay[] = [];
            let dayNumber = 1;

            // Buscar sección de itinerario por h5
            const itinHeading = $('h5').filter((i, el) => $(el).text().trim() === 'Itinerario');
            // El contenido viene después del h5, dentro del siguiente div hermano
            let itinContainer = itinHeading.next();
            // A veces la estructura es h5 → div.border → p's
            if (!itinContainer.find('p').length) {
                itinContainer = itinHeading.parent().next();
            }

            const paragraphs = itinContainer.find('p');

            if (paragraphs.length > 0) {
                for (let i = 0; i < paragraphs.length; i++) {
                    const p = $(paragraphs[i]);
                    const boldText = p.find('b, strong').text().trim();

                    if (boldText && boldText.length > 0) {
                        // Ignorar títulos que no son días (ej: nombre del barco)
                        if (boldText.startsWith('**') || boldText.length < 5) continue;

                        const title = boldText;

                        // Buscar descripción en siguiente(s) <p> sin bold
                        let description = '';
                        let j = i + 1;
                        while (j < paragraphs.length) {
                            const nextP = $(paragraphs[j]);
                            if (nextP.find('b, strong').length > 0) break;
                            const nextText = nextP.text().trim();
                            if (nextText) {
                                description += (description ? ' ' : '') + nextText;
                            }
                            j++;
                        }
                        i = j - 1; // Saltar los párrafos consumidos

                        // Extraer ciudad del título
                        // Formato 1: "DÍA 01  MÉXICO – CASABLANCA"
                        // Formato 2: "FEBRERO 15  SÃO PAULO (SANTOS) - BRASIL"
                        let city: string | undefined;
                        const dayTitleMatch = title.match(/(?:DÍA\s+\d+|DIA\s+\d+|[A-Z]+\s+\d+)\s+(.+)/i);
                        if (dayTitleMatch) {
                            const cityPart = dayTitleMatch[1].split(/[-–]/)[0].trim();
                            city = cityPart.replace(/\(.+?\)/g, '').trim() || undefined;
                        }

                        days.push({
                            day_number: dayNumber++,
                            title: title.substring(0, 500),
                            description: (description || '').substring(0, 2000),
                            meals: undefined,
                            hotel: undefined,
                            city: city,
                            activities: [],
                            highlights: []
                        });
                    }
                }
            }

            console.log(`   📅 Circuito: ${days.length} días de itinerario`);

            // ========== INCLUDES desde circuito.php ==========
            const includes: string[] = [];
            const includeHeading = $('h5').filter((i, el) => $(el).text().trim() === 'Incluye');
            if (includeHeading.length > 0) {
                includeHeading.nextAll().each((i, sibling) => {
                    const $sib = $(sibling);
                    if ($sib.is('h5')) return false; // Parar en siguiente sección
                    $sib.find('li').each((j, li) => {
                        const text = $(li).text().trim();
                        if (text && text.length > 3) includes.push(text);
                    });
                });
            }
            console.log(`   ✅ Circuito: ${includes.length} includes`);

            // ========== NOT INCLUDES desde circuito.php ==========
            const not_includes: string[] = [];
            const notIncHeading = $('h5').filter((i, el) => $(el).text().trim() === 'No Incluye');
            if (notIncHeading.length > 0) {
                notIncHeading.nextAll().each((i, sibling) => {
                    const $sib = $(sibling);
                    if ($sib.is('h5')) return false;
                    $sib.find('li').each((j, li) => {
                        const text = $(li).text().trim();
                        if (text && text.length > 3) not_includes.push(text);
                    });
                });
            }
            console.log(`   ❌ Circuito: ${not_includes.length} not-includes`);

            // ========== DURACIÓN ==========
            let duration: string | null = null;
            const durationBadge = $('span.badge').first();
            if (durationBadge.length) {
                const durationText = durationBadge.text().trim();
                if (durationText.includes('Días') || durationText.includes('Noches')) {
                    duration = durationText;
                }
            }

            return { itinerary: days, includes, not_includes, duration };

        } catch (error) {
            console.error(`❌ Error scraping circuito.php para tour ${tourCode}:`, error);
            return { itinerary: [], includes: [], not_includes: [], duration: null };
        }
    }

    /**
     * @deprecated Use scrapeFromCircuito instead
     */
    static async scrapeItineraryFromCircuito(tourCode: string): Promise<ItineraryDay[]> {
        const result = await this.scrapeFromCircuito(tourCode);
        return result.itinerary;
    }

    /**
     * 1. SCRAPING DE ITINERARIO (Puppeteer + Cheerio)
     * Mejorado: limpia HTML tags antes de aplicar regex para manejar tours
     * cuyo itinerario tiene <br>, <strong>, <p> etc. mezclados en el texto.
     * Recopila TODOS los sets de días y se queda con el más largo.
     */
    static async scrapeItinerary(
        $: cheerio.Root,
        page: any,
        tourUrl: string
    ): Promise<ItineraryDay[]> {
        try {
            let days: ItineraryDay[] = [];

            // Estrategia A: Buscar elementos de itinerario estructurados
            const itinerarySection = $('#itinerario, .itinerary, .day-by-day, [id*="itinerario"]');

            if (itinerarySection.length > 0) {
                console.log('\ud83d\udcdd Itinerario encontrado en HTML estático');

                $('.day-item, .itinerary-day, [class*="day"]').each((i, elem) => {
                    const $day = $(elem);
                    const text = $day.text();

                    const dayMatch = text.match(/D[\u00cdI]A\s+(\d+)|DAY\s+(\d+)/i);
                    if (!dayMatch) return;

                    const dayNumber = parseInt(dayMatch[1] || dayMatch[2]);
                    const titleMatch = text.match(/D[\u00cdI]A\s+\d+\s+(.+?)(?:\n|Desayuno|\.)/i);
                    const title = titleMatch ? titleMatch[1].trim() : '';
                    const description = text.replace(/D[\u00cdI]A\s+\d+.+?\n/, '').trim();
                    const mealsMatch = text.match(/\(([DAC,\s]+)\)/);
                    const meals = mealsMatch ? mealsMatch[1].replace(/\s/g, '') : undefined;

                    days.push({ day_number: dayNumber, title, description, meals });
                });
            }

            // Estrategia B: Parsear texto completo con limpieza de HTML
            if (days.length === 0) {
                console.log('\ud83d\udcc4 Parseando itinerario desde texto (con limpieza HTML)');

                const bodyHtml = $('body').html() || '';

                // Reemplazar <br>, </p>, </strong>, </div> con saltos de línea
                const cleanedText = bodyHtml
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<\/p>/gi, '\n')
                    .replace(/<\/div>/gi, '\n')
                    .replace(/<\/strong>/gi, ' ')
                    .replace(/<\/b>/gi, ' ')
                    .replace(/<[^>]+>/g, '')
                    .replace(/&nbsp;/gi, ' ')
                    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/\n{3,}/g, '\n\n');

                // Regex mejorado: busca "DÍA 01" o "DIA 01" o "Día 01"
                const dayRegex = /D[\u00cdI\u00ed]A\s+0?(\d+)[:\s]+([^\n]+?(?:\n|$))([\s\S]*?)(?=D[\u00cdI\u00ed]A\s+0?\d+[:\s]|$)/gi;
                let match;

                // Recopilar TODOS los matches (puede haber sets duplicados:
                // resumen corto con 3 días + itinerario completo con 10 días)
                const allMatches: ItineraryDay[] = [];

                while ((match = dayRegex.exec(cleanedText)) !== null) {
                    const dayNumber = parseInt(match[1]);
                    const title = match[2].trim().substring(0, 500);
                    const description = match[3]
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .join(' ')
                        .trim()
                        .substring(0, 2000);

                    allMatches.push({ day_number: dayNumber, title, description });
                }

                // Si hay duplicados (ej: DÍA 1 aparece 2 veces), quedarse con
                // la SEGUNDA ocurrencia de cada día (que es el itinerario completo)
                if (allMatches.length > 0) {
                    // Agrupar por day_number, la ÚLTIMA ocurrencia gana
                    const dayMap = new Map<number, ItineraryDay>();
                    for (const day of allMatches) {
                        dayMap.set(day.day_number, day);
                    }
                    days = Array.from(dayMap.values()).sort((a, b) => a.day_number - b.day_number);
                }
            }

            console.log(`\ud83d\udcc5 Itinerario extraído: ${days.length} días`);
            return days;

        } catch (error) {
            console.error('Error extrayendo itinerario:', error);
            return [];
        }
    }

    /**
     * 2. SCRAPING DE FECHAS DE SALIDA
     */
    static async scrapeDepartures($: cheerio.Root): Promise<Departure[]> {
        try {
            const departures: Departure[] = [];

            // Buscar sección de fechas/tarifas
            const tarifasSection = $('#tarifas, .departures, [id*="salidas"], [class*="fecha"]');

            if (tarifasSection.length === 0) {
                console.log('⚠️ No se encontró sección de fechas de salida');
                // Generar fechas de ejemplo (cada 15 días durante 6 meses)
                return this.generateSampleDepartures();
            }

            // Intentar extraer fechas de una tabla
            tarifasSection.find('tr').each((i, row) => {
                const $row = $(row);
                const cells = $row.find('td');

                if (cells.length >= 2) {
                    const dateText = $(cells[0]).text().trim();
                    const priceText = $(cells[1]).text().trim();

                    // Parsear fecha (varios formatos posibles)
                    const date = this.parseDate(dateText);
                    if (date) {
                        departures.push({
                            departure_date: date,
                            price_usd: this.parsePrice(priceText),
                            availability: 'available',
                            status: 'confirmed'
                        });
                    }
                }
            });

            console.log(`📆 Fechas de salida extraídas: ${departures.length}`);
            return departures.length > 0 ? departures : this.generateSampleDepartures();

        } catch (error) {
            console.error('Error extrayendo fechas:', error);
            return this.generateSampleDepartures();
        }
    }

    /**
     * 3. SCRAPING DE POLÍTICAS
     */
    static async scrapePolicies($: cheerio.Root): Promise<Policies> {
        try {
            const policies: Policies = {};

            // 1. Política de cancelación
            const cancelText = this.findSectionText($, [
                'cancelaci', 'cancellation', 'devoluci'
            ]);
            if (cancelText) policies.cancellation_policy = cancelText;

            // 2. Política de pagos
            const paymentText = this.findSectionText($, [
                'forma de pago', 'payment', 'pago'
            ]);
            if (paymentText) policies.payment_policy = paymentText;

            // 3. Términos y condiciones
            const termsText = this.findSectionText($, [
                'términos', 'condiciones', 'terms', 'conditions'
            ]);
            if (termsText) policies.terms_conditions = termsText;

            // 4. Requisitos de documentos
            policies.document_requirements = this.extractListItems($, [
                'documento', 'pasaporte', 'identification'
            ]);

            // 5. Requisitos de visa
            policies.visa_requirements = this.extractListItems($, [
                'visa', 'visado', 'e-visa'
            ]);

            // 6. Requisitos de vacunas
            policies.vaccine_requirements = this.extractListItems($, [
                'vacuna', 'vaccine', 'inmunizaci'
            ]);

            // 7. Seguro de viaje
            const insuranceText = this.findSectionText($, [
                'seguro', 'insurance'
            ]);
            if (insuranceText) policies.insurance_requirements = insuranceText;

            console.log('📋 Políticas extraídas');
            return policies;

        } catch (error) {
            console.error('Error extrayendo políticas:', error);
            return {};
        }
    }

    /**
     * 4. SCRAPING DE INFORMACIÓN ADICIONAL
     */
    static async scrapeAdditionalInfo($: cheerio.Root): Promise<AdditionalInfo> {
        try {
            const info: AdditionalInfo = {};

            // 1. Notas importantes
            info.important_notes = this.extractListItems($, [
                'nota importante', 'importante', 'important note', 'tener en cuenta'
            ], 'p, li, div');

            // 2. Recomendaciones
            info.recommendations = this.extractListItems($, [
                'recomendaci', 'recommendation', 'consejo'
            ]);

            // 3. Qué llevar
            info.what_to_bring = this.extractListItems($, [
                'qué llevar', 'what to bring', 'necesario', 'equipaje'
            ]);

            // 4. Información de clima
            const climateText = this.findSectionText($, [
                'clima', 'weather', 'temperatura'
            ]);
            if (climateText) info.climate_info = climateText;

            // 5. Moneda local
            const currencyMatch = $('body').text().match(/moneda[:\s]+([A-Z]{3}|[a-záéíóúñ\s]+)/i);
            if (currencyMatch) info.local_currency = currencyMatch[1];

            console.log('ℹ️ Información adicional extraída');
            return info;

        } catch (error) {
            console.error('Error extrayendo información adicional:', error);
            return {};
        }
    }

    /**
     * 5. SCRAPING DE TOURS OPCIONALES
     */
    static async scrapeOptionalTours($: cheerio.Root): Promise<OptionalTourExtended[]> {
        try {
            const tours: OptionalTourExtended[] = [];

            // Buscar sección de tours opcionales
            const toursSection = $('#tours-opcionales, .optional-tours, [id*="opcional"], [class*="opcional"]');

            // Estrategia: Buscar headers H3/H4 seguidos de descripción
            $('h3, h4').each((i, elem) => {
                const $header = $(elem);
                const headerText = $header.text().trim();

                // Filtrar solo headers que parecen tours opcionales
                if (headerText.length < 5 || headerText.length > 200) return;

                // Obtener el código si existe (ej: "PAQUETE 2 - A")
                const codeMatch = headerText.match(/PAQUETE\s+\d+(\s*-\s*[AB])?|[A-Z\s]+\d+/i);
                const code = codeMatch ? codeMatch[0] : undefined;

                // Obtener descripción (siguiente párrafo o div)
                let description = '';
                let $next = $header.next();

                // Buscar hasta 3 elementos siguientes para la descripción
                for (let j = 0; j < 3 && $next.length > 0; j++) {
                    const text = $next.text().trim();
                    if (text.length > 10) {
                        description += text + ' ';
                        break;
                    }
                    $next = $next.next();
                }

                description = description.trim();
                if (description.length > 500) {
                    description = description.substring(0, 500) + '...';
                }

                // Extraer precio si está en el texto
                const priceMatch = (headerText + ' ' + description).match(/\$?\s*(\d+)\s*USD|\$\s*(\d+)/i);
                const price_usd = priceMatch ? parseInt(priceMatch[1] || priceMatch[2]) : undefined;
                // Extraer fechas de aplicación
                const datesMatch = description.match(/(\d+\s+[A-Z]+)\s+AL\s+(\d+\s+[A-Z]+)/i);
                let valid_dates;
                if (datesMatch) {
                    valid_dates = {
                        from: datesMatch[1],
                        to: datesMatch[2]
                    };
                }

                // Extraer condiciones
                const conditionsMatch = description.match(/ESTE PRECIO APLICA PARA[^\.]+/i);
                const conditions = conditionsMatch ? conditionsMatch[0] : undefined;

                if (description.length > 20) {
                    tours.push({
                        code,
                        name: headerText,
                        description,
                        price_usd,
                        valid_dates,
                        conditions
                    });
                }
            });

            console.log(`🎫 Tours opcionales extraídos: ${tours.length}`);
            return tours;

        } catch (error) {
            console.error('Error extrayendo tours opcionales:', error);
            return [];
        }
    }

    /**
     * 5B. EXTRAER CIUDADES, PAÍSES Y DURACIÓN del HTML principal del tour
     * Fuentes:
     * - OG description: "Viaje desde México a Argentina, Brasil. Visitando: Río de Janeiro, Iguazú, Buenos Aires durante 11 días"
     * - Texto "Visitando" en la página
     * - Breadcrumb (viajes Sudamérica, etc.)
     * - Badges de duración (11 Días / 9 Noches)
     */
    static async scrapeCitiesAndCountries($: cheerio.Root): Promise<{
        cities: string[];
        countries: string[];
        main_country: string;
        days: number;
        nights: number;
    }> {
        try {
            let cities: string[] = [];
            let countries: string[] = [];
            let mainCountry = '';
            let days = 0;
            let nights = 0;

            // ========== CIUDADES ==========
            // Estrategia 1: Desde OG description (meta tag)
            // Formato: "Viaje desde México a Argentina, Brasil. Visitando: Río de Janeiro, Iguazú, Buenos Aires durante 11 días"
            const ogDesc = $('meta[property="og:description"]').attr('content') || '';
            const visitandoMatch = ogDesc.match(/Visitando:\s*(.+?)(?:\s+durante|\s*$)/i);
            if (visitandoMatch) {
                cities = visitandoMatch[1].split(',').map(c => c.trim()).filter(c => c.length > 1);
                console.log(`   🏙️  Ciudades desde OG: ${cities.join(', ')}`);
            }

            // Estrategia 2: Texto "Visitando" en el HTML (más visible)
            if (cities.length === 0) {
                const bodyText = $('body').text();
                const visitandoHTML = bodyText.match(/Visitando\s*\n?\s*(.+?)(?:\n|Desde|$)/i);
                if (visitandoHTML) {
                    const rawCities = visitandoHTML[1].trim();
                    cities = rawCities.split(',').map(c => c.trim()).filter(c => c.length > 1 && c.length < 50);
                    console.log(`   🏙️  Ciudades desde HTML: ${cities.join(', ')}`);
                }
            }

            // ========== PAÍSES ==========
            // Estrategia 1: Desde OG description
            // "Viaje desde México a Argentina, Brasil."
            const paisesMatch = ogDesc.match(/Viaje\s+desde\s+M[eé]xico\s+a\s+(.+?)\.\s*Visitando/i);
            if (paisesMatch) {
                countries = paisesMatch[1].split(',').map(c => c.trim()).filter(c => c.length > 1);
                mainCountry = countries[0] || '';
                console.log(`   🌍  Países desde OG: ${countries.join(', ')}`);
            }

            // Estrategia 2: Breadcrumb - "viajes Sudamérica" → categoría general
            if (countries.length === 0) {
                // El título del tour a menudo tiene los países: "Brasil y Argentina"
                const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
                // Formato: "Viaje: Brasil y Argentina MT-52172"
                const titleMatch = ogTitle.match(/Viaje:\s*(.+?)(?:\s+MT-|\s*$)/i);
                if (titleMatch) {
                    const titleCountries = titleMatch[1]
                        .split(/\s+y\s+|\s*,\s*/i)
                        .map(c => c.trim())
                        .filter(c => c.length > 1);
                    if (titleCountries.length > 0) {
                        countries = titleCountries;
                        mainCountry = countries[0] || '';
                        console.log(`   🌍  Países desde título: ${countries.join(', ')}`);
                    }
                }
            }

            // ========== DURACIÓN ==========
            // Buscar badges o texto con "X Días / Y Noches"
            const daysMatch = ogDesc.match(/(\d+)\s*d[ií]as/i);
            if (daysMatch) {
                days = parseInt(daysMatch[1]);
            }

            // Buscar en badges de la página
            $('span.badge, .badge').each((i, elem) => {
                const text = $(elem).text().trim();
                const dMatch = text.match(/(\d+)\s*D[ií]as/i);
                const nMatch = text.match(/(\d+)\s*Noches/i);
                if (dMatch && !days) days = parseInt(dMatch[1]);
                if (nMatch && !nights) nights = parseInt(nMatch[1]);
            });

            // Fallback: buscar en todo el texto
            if (!days || !nights) {
                const bodyText = $('body').text();
                const durMatch = bodyText.match(/(\d+)\s*D[ií]as\s*\/?\s*(\d+)\s*Noches/i);
                if (durMatch) {
                    if (!days) days = parseInt(durMatch[1]);
                    if (!nights) nights = parseInt(durMatch[2]);
                }
            }

            // Si no tenemos noches pero sí días, calcular
            if (days > 0 && nights === 0) {
                nights = days - 1;
            }

            console.log(`   📊 Tour meta: ${cities.length} ciudades, ${countries.length} países, ${days}d/${nights}n`);

            return { cities, countries, main_country: mainCountry, days, nights };

        } catch (error) {
            console.error('Error extrayendo ciudades/países:', error);
            return { cities: [], countries: [], main_country: '', days: 0, nights: 0 };
        }
    }

    /**
     * 6. SCRAPING DE IMÁGENES
     * Mejorado: construye URL del mapa con patrón predecible cdnmega.com
     * FILTRADO: excluye imágenes de portada genérica de categoría (ej: "EUROPA.jpg")
     */
    static async scrapeImages($: cheerio.Root, tourCodeParam?: string | null): Promise<{
        main: string | null;
        gallery: string[];
        map: string | null;
    }> {
        try {
            const images = {
                main: null as string | null,
                gallery: [] as string[],
                map: null as string | null
            };

            // Extraer código del tour de la URL de la página O usar el parámetro
            const pageUrl = $('link[rel="canonical"]').attr('href') || '';
            const tourCodeMatch = pageUrl.match(/(\d+)\.html$/);
            const tourCode = tourCodeParam || (tourCodeMatch ? tourCodeMatch[1] : null);

            // Buscar todas las imágenes del tour (cdnmega.com/images/viajes)
            const tourImages: string[] = [];

            // Lista de palabras clave de portadas de categoría que NO son del tour específico
            const categoryCovers = [
                'europa', 'asia', 'turquia', 'japon', 'corea', 'medio-oriente',
                'dubai', 'egipto', 'sudamerica', 'usa', 'canada', 'cruceros',
                'africa', 'mexico', 'balcanes', 'centroamerica', 'caribe'
            ];

            $('img').each((i, elem) => {
                const src = $(elem).attr('src') || '';
                if (!src.includes('cdnmega.com/images/viajes')) return;
                if (src.includes('logo') || src.includes('icon') || src.includes('brand')) return;

                // FILTRAR portadas genéricas de categoría
                // Ejemplo: "https://cdnmega.com/images/viajes/covers/europa-12345.jpg"
                // La portada de categoría contiene un nombre de región pero NO el código del tour
                const srcLower = src.toLowerCase();
                const isCategoryCover = categoryCovers.some(cat => srcLower.includes(`/covers/${cat}`));

                if (isCategoryCover) {
                    // Solo aceptar si contiene el código del tour
                    if (tourCode && src.includes(tourCode)) {
                        tourImages.push(src);
                    } else {
                        console.log(`   ⚠️  Imagen de categoría excluida: ${src.substring(0, 80)}...`);
                    }
                } else {
                    tourImages.push(src);
                }
            });

            // Detectar imagen principal - SOLO covers que contienen el código del tour
            let mainImage: string | null = null;

            if (tourCode) {
                mainImage = tourImages.find(img =>
                    img.includes('/covers/') &&
                    img.includes(tourCode)
                ) || null;
            }

            // Fallback: primera imagen de covers que no sea de categoría
            if (!mainImage) {
                mainImage = tourImages.find(img => img.includes('/covers/')) || null;
            }

            // Si no encontramos covers, usar la URL predecible de MegaTravel
            if (!mainImage && tourCode) {
                mainImage = `https://cdnmega.com/images/viajes/covers/${tourCode}-cover.jpg`;
            }

            if (mainImage) {
                images.main = mainImage;
            }

            // El resto son galería (excluir la principal y covers)
            images.gallery = tourImages.filter(img => img !== mainImage && !img.includes('/covers/'));

            // ========== MAPA DEL TOUR ==========
            // Estrategia 1: Buscar en imágenes existentes
            let mapImage = tourImages.find(img =>
                img.includes('map') || img.includes('mapa') || img.includes('mapas')
            ) || null;

            // Estrategia 2: Construir URL predecible del mapa si tenemos el código
            if (!mapImage && tourCode) {
                const predictableMapUrl = `https://cdnmega.com/images/viajes/mapas/${tourCode}.jpg`;
                mapImage = predictableMapUrl;
                console.log(`   🗺️  Mapa construido: ${predictableMapUrl}`);
            }

            // Estrategia 3: Buscar en <img> con alt que contenga "mapa" o "recorrido"
            if (!mapImage) {
                $('img').each((i, elem) => {
                    const alt = ($(elem).attr('alt') || '').toLowerCase();
                    const src = $(elem).attr('src') || '';
                    if ((alt.includes('mapa') || alt.includes('recorrido') || alt.includes('ruta')) && src) {
                        mapImage = src;
                    }
                });
            }

            if (mapImage) {
                images.map = mapImage;
                images.gallery = images.gallery.filter(img => img !== mapImage);
            }

            console.log(`📸 Imágenes extraídas: Main: ${images.main ? 'Sí' : 'No'}, Gallery: ${images.gallery.length}, Map: ${images.map ? 'Sí' : 'No'}`);
            return images;

        } catch (error) {
            console.error('Error extrayendo imágenes:', error);
            return {
                main: null,
                gallery: [],
                map: null
            };
        }
    }

    /**
     * 6A. SCRAPING DE PRECIOS DINÁMICOS (desde tabla de fechas)
     * Esta función extrae precios de la tabla de fechas que se carga con JavaScript
     */
    static async scrapeDynamicPricing(page: Page): Promise<{
        price_usd: number | null;
        taxes_usd: number | null;
        currency: string;
        price_per_person_type: string;
        price_variants: Record<string, number>;
    }> {
        try {
            console.log('   💰 Extrayendo precios dinámicos de tabla de fechas...');

            let price_usd: number | null = null;
            let taxes_usd: number | null = null;
            let currency = 'USD';
            let price_per_person_type = 'Por persona en habitación Doble';
            const price_variants: Record<string, number> = {};

            // Buscar en la tabla de fechas
            // Formato esperado: "5,199 USD + 899 IMP" o similar
            const priceData = await page.evaluate(() => {
                // Buscar todas las celdas de tabla que contengan precios
                const cells = Array.from(document.querySelectorAll('td, .price, [class*="precio"], [class*="tarifa"]'));

                for (const cell of cells) {
                    const text = cell.textContent || '';

                    // Patrón 1: "X,XXX USD + XXX IMP"
                    const match1 = text.match(/([0-9,]+)\s*USD\s*\+\s*([0-9,]+)\s*IMP/i);
                    if (match1) {
                        return {
                            price: match1[1].replace(/,/g, ''),
                            taxes: match1[2].replace(/,/g, ''),
                            found: true
                        };
                    }

                    // Patrón 2: "Desde X,XXX USD"
                    const match2 = text.match(/Desde\s+([0-9,]+)\s*USD/i);
                    if (match2) {
                        return {
                            price: match2[1].replace(/,/g, ''),
                            taxes: null,
                            found: true
                        };
                    }
                }

                return { found: false };
            });

            if (priceData.found && priceData.price) {
                price_usd = parseFloat(priceData.price);
                if (priceData.taxes) {
                    taxes_usd = parseFloat(priceData.taxes);
                }
                console.log(`   ✅ Precio dinámico encontrado: $${price_usd} USD${taxes_usd ? ` + $${taxes_usd} IMP` : ''}`);
            } else {
                console.log('   ⚠️  No se encontraron precios en tabla dinámica');
            }

            return {
                price_usd,
                taxes_usd,
                currency,
                price_per_person_type,
                price_variants
            };

        } catch (error) {
            console.error('   ❌ Error extrayendo precios dinámicos:', error);
            return {
                price_usd: null,
                taxes_usd: null,
                currency: 'USD',
                price_per_person_type: 'Por persona en habitación Doble',
                price_variants: {}
            };
        }
    }

    /**
     * SCRAPING DE PRECIOS
     */
    static async scrapePricing($: cheerio.Root): Promise<{
        price_usd: number | null;
        taxes_usd: number | null;
        currency: string;
        price_per_person_type: string;
        price_variants: Record<string, number>;
    }> {
        try {
            let price_usd: number | null = null;
            let taxes_usd: number | null = null;
            let currency = 'USD';
            let price_per_person_type = 'Por persona en habitación Doble';
            const price_variants: Record<string, number> = {};

            // Buscar el precio en el texto
            // Formato: "Desde 1,699 USD + 799 IMP"
            const bodyText = $('body').text();
            const bodyHtml = $('body').html() || '';

            // Estrategia 1: Buscar "Tarifa Base" e "Impuestos" en el HTML
            const tarifaBaseMatch = bodyHtml.match(/Tarifa\s+Base[\s\S]{0,200}?\$?\s*([0-9,]+)/i);
            if (tarifaBaseMatch) {
                price_usd = parseFloat(tarifaBaseMatch[1].replace(/,/g, ''));
                console.log(`   💰 Precio encontrado (Tarifa Base): $${price_usd} USD`);
            }

            const impuestosMatch = bodyHtml.match(/Impuestos[\s\S]{0,200}?\$?\s*([0-9,]+)/i);
            if (impuestosMatch) {
                taxes_usd = parseFloat(impuestosMatch[1].replace(/,/g, ''));
                console.log(`   💰 Impuestos encontrados: $${taxes_usd} USD`);
            }

            // Estrategia 2: Si no encontramos, buscar patrón alternativo

            // Patrón 1: "Desde X,XXX USD + XXX IMP"
            const pricePattern1 = /Desde\s+([\d,]+)\s*USD\s*\+\s*([\d,]+)\s*IMP/i;
            const match1 = bodyText.match(pricePattern1);

            if (match1) {
                price_usd = parseFloat(match1[1].replace(/,/g, ''));
                taxes_usd = parseFloat(match1[2].replace(/,/g, ''));
                console.log(`   💰 Precio encontrado: $${price_usd} USD + $${taxes_usd} IMP`);
            } else {
                // Patrón 3: Solo precio sin impuestos
                const pricePattern2 = /Desde\s+([0-9,]+)\s*USD/i;
                const match2 = bodyText.match(pricePattern2);

                if (match2) {
                    price_usd = parseFloat(match2[1].replace(/,/g, ''));
                    console.log(`   💰 Precio encontrado: $${price_usd} USD (sin impuestos)`);
                }
            }

            // Buscar tipo de habitación
            // Formato: "Por persona en habitación Doble"
            const roomTypePattern = /Por persona en habitación (Doble|Triple|Cuádruple|Sencilla|Interior|Exterior)/i;
            const roomMatch = bodyText.match(roomTypePattern);

            if (roomMatch) {
                price_per_person_type = `Por persona en habitación ${roomMatch[1]}`;
                console.log(`   🛏️  Tipo: ${price_per_person_type}`);
            }

            // Buscar variantes de precio en tablas
            // Buscar texto como "Doble: $1,699" o similar
            const variantPatterns = [
                { type: 'doble', pattern: /Doble[:\s]+([\d,]+)/i },
                { type: 'triple', pattern: /Triple[:\s]+([\d,]+)/i },
                { type: 'cuadruple', pattern: /Cuádruple[:\s]+([\d,]+)/i },
                { type: 'sencilla', pattern: /Sencilla[:\s]+([\d,]+)/i },
                { type: 'interior', pattern: /Interior[:\s]+([\d,]+)/i },
                { type: 'exterior', pattern: /Exterior[:\s]+([\d,]+)/i },
                { type: 'balcon', pattern: /Balcón[:\s]+([\d,]+)/i },
                { type: 'suite', pattern: /Suite[:\s]+([\d,]+)/i }
            ];

            for (const { type, pattern } of variantPatterns) {
                const match = bodyText.match(pattern);
                if (match) {
                    price_variants[type] = parseFloat(match[1].replace(/,/g, ''));
                }
            }

            if (Object.keys(price_variants).length > 0) {
                console.log(`   🏨 Variantes encontradas: ${Object.keys(price_variants).join(', ')}`);
            }

            return {
                price_usd,
                taxes_usd,
                currency,
                price_per_person_type,
                price_variants
            };

        } catch (error) {
            console.error('Error scraping pricing:', error);
            return {
                price_usd: null,
                taxes_usd: null,
                currency: 'USD',
                price_per_person_type: 'Por persona en habitación Doble',
                price_variants: {}
            };
        }
    }

    /**
     * SCRAPING DE INCLUDES/NOT_INCLUDES
     * Mejorado: Busca clases CSS .IncludeDetail/.NotIncludeDetail de MegaTravel,
     * headings h4, y fallback con regex.
     */
    static async scrapeIncludesNotIncludes($: cheerio.Root): Promise<{
        includes: string[];
        not_includes: string[];
    }> {
        try {
            const includes: string[] = [];
            const not_includes: string[] = [];

            // ========== INCLUDES ==========
            // Estrategia 0: Buscar por clase CSS .IncludeDetail (MegaTravel)
            const includeDetailDiv = $('.IncludeDetail');
            if (includeDetailDiv.length > 0) {
                includeDetailDiv.find('li').each((i, elem) => {
                    const text = $(elem).text().trim();
                    if (text && text.length > 3) includes.push(text);
                });
                // Fallback: si no hay <li>, buscar <p>
                if (includes.length === 0) {
                    includeDetailDiv.find('p').each((i, elem) => {
                        const text = $(elem).text().trim();
                        if (text && text.length > 3) includes.push(text);
                    });
                }
            }

            // Estrategia 1: Buscar por ID #linkincluye
            if (includes.length === 0) {
                const includesSection = $('#linkincluye');
                if (includesSection.length > 0) {
                    includesSection.find('ul li').each((i, elem) => {
                        const text = $(elem).text().trim();
                        if (text && text.length > 3) includes.push(text);
                    });
                }
            }

            // Estrategia 2: Buscar heading h4 con texto "El viaje incluye"
            if (includes.length === 0) {
                $('h4, h3, h5').each((i, elem) => {
                    const heading = $(elem).text().trim().toLowerCase();
                    if (heading.includes('viaje incluye') && !heading.includes('no incluye')) {
                        // Buscar en TODOS los hermanos siguientes (no solo el inmediato)
                        $(elem).nextAll().each((j, sibling) => {
                            const $sib = $(sibling);
                            // Si llegamos a otro heading, parar
                            if ($sib.is('h3, h4, h5')) return false;
                            // Buscar <ul> con <li>
                            $sib.find('li').each((k, li) => {
                                const text = $(li).text().trim();
                                if (text && text.length > 3) includes.push(text);
                            });
                            // Si el sibling mismo es un <ul>
                            if ($sib.is('ul')) {
                                $sib.children('li').each((k, li) => {
                                    const text = $(li).text().trim();
                                    if (text && text.length > 3) includes.push(text);
                                });
                            }
                        });
                    }
                });
            }

            // Estrategia 3: Regex en HTML como fallback
            if (includes.length === 0) {
                const bodyHtml = $('body').html() || '';
                const includesMatch = bodyHtml.match(/El viaje incluye([\s\S]*?)(?=El viaje no incluye|Itinerario|Mapa del tour|$)/i);
                if (includesMatch) {
                    const $inc = cheerio.load(includesMatch[1]);
                    $inc('li, p').each((i, elem) => {
                        const text = $inc(elem).text().trim();
                        if (text && text.length > 3 && !text.startsWith('El viaje')) {
                            const cleanText = text.replace(/^[-\u2022*]\s*/, '').trim();
                            if (cleanText) includes.push(cleanText);
                        }
                    });
                }
            }

            // ========== NOT INCLUDES ==========
            // Estrategia 0: Buscar por clase CSS .NotIncludeDetail (MegaTravel)
            const notIncDetailDiv = $('.NotIncludeDetail');
            if (notIncDetailDiv.length > 0) {
                notIncDetailDiv.find('li').each((i, elem) => {
                    const text = $(elem).text().trim();
                    if (text && text.length > 3) not_includes.push(text);
                });
                if (not_includes.length === 0) {
                    notIncDetailDiv.find('p').each((i, elem) => {
                        const text = $(elem).text().trim();
                        if (text && text.length > 3) not_includes.push(text);
                    });
                }
            }

            // Estrategia 1: Buscar heading h4 con "El viaje no incluye"
            if (not_includes.length === 0) {
                $('h4, h3, h5').each((i, elem) => {
                    const heading = $(elem).text().trim().toLowerCase();
                    if (heading.includes('no incluye')) {
                        // Buscar en TODOS los hermanos siguientes
                        $(elem).nextAll().each((j, sibling) => {
                            const $sib = $(sibling);
                            if ($sib.is('h3, h4, h5')) return false;
                            $sib.find('li').each((k, li) => {
                                const text = $(li).text().trim();
                                if (text && text.length > 3) not_includes.push(text);
                            });
                            if ($sib.is('ul')) {
                                $sib.children('li').each((k, li) => {
                                    const text = $(li).text().trim();
                                    if (text && text.length > 3) not_includes.push(text);
                                });
                            }
                        });
                    }
                });
            }

            // Estrategia 2: Regex en HTML como fallback
            if (not_includes.length === 0) {
                const bodyHtml = $('body').html() || '';
                const notIncMatch = bodyHtml.match(/El viaje no incluye([\s\S]*?)(?=Itinerario|Mapa del tour|Tours opcionales|Hoteles|Tarifas|Cargando|$)/i);
                if (notIncMatch) {
                    const $ni = cheerio.load(notIncMatch[1]);
                    $ni('li, p').each((i, elem) => {
                        const text = $ni(elem).text().trim();
                        if (text && text.length > 3 && !text.startsWith('El viaje') && !text.startsWith('Cargando')) {
                            const cleanText = text.replace(/^[-\u2022*]\s*/, '').trim();
                            if (cleanText) not_includes.push(cleanText);
                        }
                    });
                }
            }

            console.log(`   \u2705 Incluye: ${includes.length} items`);
            console.log(`   \u274c No incluye: ${not_includes.length} items`);

            return { includes, not_includes };

        } catch (error) {
            console.error('Error scraping includes/not_includes:', error);
            return { includes: [], not_includes: [] };
        }
    }

    /**
     * 7. SCRAPING DE CLASIFICACIONES/TAGS
     */
    static async scrapeClassifications($: cheerio.Root): Promise<string[]> {
        try {
            const tags: Set<string> = new Set();

            // 1. Extraer de breadcrumbs
            const breadcrumbText = $('.breadcrumb, [class*="breadcrumb"], nav').text().toLowerCase();

            // Mapeo de breadcrumbs a tags
            const tagMappings: Record<string, string[]> = {
                'quinceañeras': ['quinceañeras', 'eventos-especiales', 'grupos'],
                'quince años': ['quinceañeras', 'eventos-especiales', 'grupos'],
                'luna de miel': ['bodas', 'luna-de-miel', 'romantico', 'parejas'],
                'boda': ['bodas', 'luna-de-miel', 'romantico'],
                'semana santa': ['semana-santa', 'ofertas', 'vacaciones'],
                'pascua': ['semana-santa', 'ofertas', 'vacaciones'],
                'oferta': ['ofertas', 'promociones'],
                'descuento': ['ofertas', 'promociones'],
                'promoción': ['ofertas', 'promociones'],
                'preventa': ['ofertas', 'preventa'],
                'crucero': ['cruceros', 'todo-incluido'],
                'cruise': ['cruceros', 'todo-incluido'],
                'graduación': ['graduaciones', 'eventos-especiales', 'grupos'],
                'corporativo': ['corporativo', 'grupos', 'empresas'],
                'grupo': ['grupos', 'viajes-grupales'],
                'fit': ['grupos', 'viajes-grupales'],
                'evento deportivo': ['deportes', 'eventos-especiales'],
                'futbol': ['deportes', 'futbol'],
                'imperdible': ['imperdibles', 'destacados'],
                'destacado': ['imperdibles', 'destacados'],
                'familiar': ['familiar', 'niños', 'familia']
            };

            // Buscar coincidencias en breadcrumbs
            for (const [keyword, relatedTags] of Object.entries(tagMappings)) {
                if (breadcrumbText.includes(keyword)) {
                    relatedTags.forEach(tag => tags.add(tag));
                }
            }

            // 2. Extraer de título y descripción
            const title = $('h1').first().text().toLowerCase();
            const description = $('meta[name="description"]').attr('content')?.toLowerCase() || '';
            const fullText = title + ' ' + description;

            // Buscar en título/descripción también
            for (const [keyword, relatedTags] of Object.entries(tagMappings)) {
                if (fullText.includes(keyword)) {
                    relatedTags.forEach(tag => tags.add(tag));
                }
            }

            // 3. Detectar región/destino como tag
            const regionKeywords = {
                'europa': 'europa',
                'asia': 'asia',
                'medio oriente': 'medio-oriente',
                'sudamerica': 'sudamerica',
                'norteamerica': 'norteamerica',
                'norte américa': 'norteamerica',
                'caribe': 'caribe',
                'africa': 'africa',
                'áfrica': 'africa',
                'oceania': 'oceania',
                'oceanía': 'oceania',
                'mexico': 'mexico',
                'méxico': 'mexico'
            };

            for (const [keyword, tag] of Object.entries(regionKeywords)) {
                if (breadcrumbText.includes(keyword) || fullText.includes(keyword)) {
                    tags.add(tag);
                }
            }

            const tagsArray = Array.from(tags);
            console.log(`🏷️ Tags extraídos: ${tagsArray.join(', ') || 'ninguno'}`);
            return tagsArray;

        } catch (error) {
            console.error('Error extrayendo clasificaciones:', error);
            return [];
        }
    }

    /**
     * HELPER: Truncar string a longitud máxima
     */
    private static truncateString(str: string | null | undefined, maxLength: number = 500): string | null {
        if (!str) return null;
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    }

    /**
     * GUARDAR DATOS EN LA BASE DE DATOS
     */
    static async saveScrapedData(
        packageId: number,
        data: {
            itinerary: ItineraryDay[];
            departures: Departure[];
            policies: Policies;
            additionalInfo: AdditionalInfo;
            images?: {
                main: string | null;
                gallery: string[];
                map: string | null;
            };
            tags?: string[];
            pricing?: {
                price_usd: number | null;
                taxes_usd: number | null;
                currency: string;
                price_per_person_type: string;
                price_variants: Record<string, number>;
            };
            includes?: string[];
            not_includes?: string[];
            // NUEVOS: datos de ciudades, países y duración
            cities?: string[];
            countries?: string[];
            main_country?: string;
            days?: number;
            nights?: number;
        },
        customPool?: any  // Pool personalizado opcional (para scripts)
    ): Promise<void> {
        const dbPool = customPool || pool;  // Usar custom pool si se proporciona
        const client = await dbPool.connect();

        try {
            await client.query('BEGIN');

            // 1. Guardar itinerario
            for (const day of data.itinerary) {
                await client.query(`
                    INSERT INTO megatravel_itinerary (
                        package_id, day_number, title, description, meals, hotel, city, activities, highlights
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (package_id, day_number) DO UPDATE SET
                        title = EXCLUDED.title,
                        description = EXCLUDED.description,
                        meals = EXCLUDED.meals,
                        hotel = EXCLUDED.hotel,
                        city = EXCLUDED.city,
                        activities = EXCLUDED.activities,
                        highlights = EXCLUDED.highlights,
                        updated_at = NOW()
                `, [
                    packageId,
                    day.day_number,
                    this.truncateString(day.title, 500),
                    day.description,  // description es TEXT, no necesita truncate
                    this.truncateString(day.meals, 200),
                    this.truncateString(day.hotel, 500),
                    this.truncateString(day.city, 200),
                    day.activities || [],
                    day.highlights || []
                ]);
            }

            // 2. Guardar fechas de salida
            for (const departure of data.departures) {
                await client.query(`
                    INSERT INTO megatravel_departures (
                        package_id, departure_date, return_date, price_usd, price_variation,
                        availability, status, min_passengers, max_passengers, current_passengers, notes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    ON CONFLICT (package_id, departure_date) DO UPDATE SET
                        price_usd = EXCLUDED.price_usd,
                        availability = EXCLUDED.availability,
                        status = EXCLUDED.status,
                        updated_at = NOW()
                `, [
                    packageId, departure.departure_date, departure.return_date || null,
                    departure.price_usd || null, departure.price_variation || null,
                    departure.availability, departure.status,
                    departure.min_passengers || null, departure.max_passengers || null,
                    departure.current_passengers || null, departure.notes || null
                ]);
            }

            // 3. Guardar políticas
            await client.query(`
                INSERT INTO megatravel_policies (
                    package_id, cancellation_policy, change_policy, payment_policy,
                    terms_conditions, document_requirements, visa_requirements,
                    vaccine_requirements, insurance_requirements, age_restrictions, health_requirements
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (package_id) DO UPDATE SET
                    cancellation_policy = EXCLUDED.cancellation_policy,
                    payment_policy = EXCLUDED.payment_policy,
                    terms_conditions = EXCLUDED.terms_conditions,
                    document_requirements = EXCLUDED.document_requirements,
                    visa_requirements = EXCLUDED.visa_requirements,
                    updated_at = NOW()
            `, [
                packageId,
                data.policies.cancellation_policy || null,
                data.policies.change_policy || null,
                data.policies.payment_policy || null,
                data.policies.terms_conditions || null,
                data.policies.document_requirements || [],
                data.policies.visa_requirements || [],
                data.policies.vaccine_requirements || [],
                data.policies.insurance_requirements || null,
                data.policies.age_restrictions || null,
                data.policies.health_requirements || null
            ]);

            // 4. Guardar información adicional
            await client.query(`
                INSERT INTO megatravel_additional_info (
                    package_id, important_notes, recommendations, what_to_bring,
                    climate_info, local_currency, language, timezone, voltage, emergency_contacts
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (package_id) DO UPDATE SET
                    important_notes = EXCLUDED.important_notes,
                    recommendations = EXCLUDED.recommendations,
                    what_to_bring = EXCLUDED.what_to_bring,
                    climate_info = EXCLUDED.climate_info,
                    updated_at = NOW()
            `, [
                packageId,
                data.additionalInfo.important_notes || [],
                data.additionalInfo.recommendations || [],
                data.additionalInfo.what_to_bring || [],
                data.additionalInfo.climate_info || null,
                data.additionalInfo.local_currency || null,
                data.additionalInfo.language || null,
                data.additionalInfo.timezone || null,
                data.additionalInfo.voltage || null,
                data.additionalInfo.emergency_contacts || null
            ]);

            // 5. Actualizar imágenes y tags en megatravel_packages (si se proporcionaron)
            if (data.images || data.tags) {
                const updateFields: string[] = [];
                const updateValues: any[] = [];
                let paramCounter = 1;

                if (data.images) {
                    if (data.images.main) {
                        updateFields.push(`main_image = $${paramCounter++}`);
                        updateValues.push(data.images.main);
                    }
                    if (data.images.gallery && data.images.gallery.length > 0) {
                        updateFields.push(`gallery_images = $${paramCounter++}`);
                        updateValues.push(data.images.gallery);
                    }
                    if (data.images.map) {
                        updateFields.push(`map_image = $${paramCounter++}`);
                        updateValues.push(data.images.map);
                    }
                }

                if (data.tags && data.tags.length > 0) {
                    updateFields.push(`tags = $${paramCounter++}`);
                    updateValues.push(data.tags);
                }

                if (updateFields.length > 0) {
                    updateFields.push(`updated_at = NOW()`);
                    updateValues.push(packageId);

                    await client.query(`
                        UPDATE megatravel_packages
                        SET ${updateFields.join(', ')}
                        WHERE id = $${paramCounter}
                    `, updateValues);
                }
            }

            // 6. Actualizar precios e includes/not_includes si están disponibles
            if (data.pricing || data.includes || data.not_includes) {
                const priceUpdateFields: string[] = [];
                const priceUpdateValues: any[] = [];
                let priceParamCounter = 1;

                if (data.pricing) {
                    if (data.pricing.price_usd !== null) {
                        priceUpdateFields.push(`price_usd = $${priceParamCounter++}`);
                        priceUpdateValues.push(data.pricing.price_usd);
                    }
                    if (data.pricing.taxes_usd !== null) {
                        priceUpdateFields.push(`taxes_usd = $${priceParamCounter++}`);
                        priceUpdateValues.push(data.pricing.taxes_usd);
                    }
                    if (data.pricing.currency) {
                        priceUpdateFields.push(`currency = $${priceParamCounter++}`);
                        priceUpdateValues.push(data.pricing.currency);
                    }
                    if (data.pricing.price_per_person_type) {
                        priceUpdateFields.push(`price_per_person_type = $${priceParamCounter++}`);
                        priceUpdateValues.push(data.pricing.price_per_person_type);
                    }
                    if (data.pricing.price_variants && Object.keys(data.pricing.price_variants).length > 0) {
                        priceUpdateFields.push(`price_variants = $${priceParamCounter++}`);
                        priceUpdateValues.push(JSON.stringify(data.pricing.price_variants));
                    }
                }

                if (data.includes && data.includes.length > 0) {
                    priceUpdateFields.push(`includes = $${priceParamCounter++}`);
                    priceUpdateValues.push(data.includes);
                }

                if (data.not_includes && data.not_includes.length > 0) {
                    priceUpdateFields.push(`not_includes = $${priceParamCounter++}`);
                    priceUpdateValues.push(data.not_includes);
                }

                if (priceUpdateFields.length > 0) {
                    priceUpdateFields.push(`updated_at = NOW()`);
                    priceUpdateValues.push(packageId);

                    await client.query(`
                        UPDATE megatravel_packages
                        SET ${priceUpdateFields.join(', ')}
                        WHERE id = $${priceParamCounter}
                    `, priceUpdateValues);

                    console.log(`   💾 Precios e includes actualizados`);
                }
            }

            // 7. Actualizar ciudades, países y duración si están disponibles
            const hasCities = data.cities && data.cities.length > 0;
            const hasCountries = data.countries && data.countries.length > 0;
            const hasDays = data.days && data.days > 0;

            if (hasCities || hasCountries || hasDays) {
                const metaUpdateFields: string[] = [];
                const metaUpdateValues: any[] = [];
                let metaParamCounter = 1;

                if (hasCities) {
                    metaUpdateFields.push(`cities = $${metaParamCounter++}`);
                    metaUpdateValues.push(data.cities);
                }
                if (hasCountries) {
                    metaUpdateFields.push(`countries = $${metaParamCounter++}`);
                    metaUpdateValues.push(data.countries);
                }
                if (data.main_country) {
                    metaUpdateFields.push(`main_country = $${metaParamCounter++}`);
                    metaUpdateValues.push(data.main_country);
                }
                if (hasDays) {
                    metaUpdateFields.push(`days = $${metaParamCounter++}`);
                    metaUpdateValues.push(data.days);
                    if (data.nights && data.nights > 0) {
                        metaUpdateFields.push(`nights = $${metaParamCounter++}`);
                        metaUpdateValues.push(data.nights);
                    }
                }

                if (metaUpdateFields.length > 0) {
                    metaUpdateFields.push(`updated_at = NOW()`);
                    metaUpdateValues.push(packageId);

                    await client.query(`
                        UPDATE megatravel_packages
                        SET ${metaUpdateFields.join(', ')}
                        WHERE id = $${metaParamCounter}
                    `, metaUpdateValues);

                    console.log(`   💾 Ciudades/países/duración actualizados: ${data.cities?.join(', ') || 'N/A'}`);
                }
            }

            await client.query('COMMIT');
            console.log(`✅ Datos guardados para package_id ${packageId}`);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error guardando datos scrapeados:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // ========== UTILIDADES ==========

    /**
     * Buscar texto de una sección por palabras clave
     */
    private static findSectionText($: cheerio.Root, keywords: string[]): string | undefined {
        for (const keyword of keywords) {
            const regex = new RegExp(keyword, 'i');
            const $section = $(`h1, h2, h3, h4, h5, strong, b`).filter((i, el) => {
                return regex.test($(el).text());
            });

            if ($section.length > 0) {
                // Obtener el texto siguiente (párrafos o divs)
                let text = '';
                let $next = $section.next();

                for (let i = 0; i < 5 && $next.length > 0; i++) {
                    const nodeText = $next.text().trim();
                    if (nodeText.length > 10) {
                        text += nodeText + '\n';
                    }
                    $next = $next.next();
                }

                if (text.length > 20) return text.trim();
            }
        }
        return undefined;
    }

    /**
     * Extraer lista de items por palabras clave
     */
    private static extractListItems(
        $: cheerio.Root,
        keywords: string[],
        selector: string = 'li, p'
    ): string[] {
        const items: string[] = [];

        for (const keyword of keywords) {
            const regex = new RegExp(keyword, 'i');

            $(selector).each((i, el) => {
                const text = $(el).text().trim();
                if (regex.test(text) && text.length > 10 && text.length < 500) {
                    items.push(text);
                }
            });
        }

        // Eliminar duplicados
        return [...new Set(items)];
    }

    /**
     * Parsear fecha en varios formatos
     */
    private static parseDate(dateText: string): string | null {
        try {
            // Formatos: "13 ABR 2026", "2026-04-13", "13/04/2026"
            const monthMap: Record<string, string> = {
                'ENE': '01', 'FEB': '02', 'MAR': '03', 'ABR': '04',
                'MAY': '05', 'JUN': '06', 'JUL': '07', 'AGO': '08',
                'SEP': '09', 'OCT': '10', 'NOV': '11', 'DIC': '12'
            };

            // Formato "13 ABR 2026"
            const match1 = dateText.match(/(\d+)\s+([A-Z]{3})\s+(\d{4})/i);
            if (match1) {
                const day = match1[1].padStart(2, '0');
                const month = monthMap[match1[2].toUpperCase()];
                const year = match1[3];
                return `${year}-${month}-${day}`;
            }

            // Formato "2026-04-13"
            const match2 = dateText.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (match2) {
                return dateText;
            }

            return null;
        } catch {
            return null;
        }
    }

    /**
     * Parsear precio del texto
     */
    private static parsePrice(priceText: string): number | undefined {
        const match = priceText.match(/\$?\s*(\d+(?:,\d+)?)/);
        if (match) {
            return parseInt(match[1].replace(',', ''));
        }
        return undefined;
    }

    /**
     * Generar fechas de ejemplo (fallback)
     */
    private static generateSampleDepartures(): Departure[] {
        const departures: Departure[] = [];
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() + 1); // Empezar en 1 mes

        // Generar 12 fechas (cada 15 días durante 6 meses)
        for (let i = 0; i < 12; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + (i * 15));

            departures.push({
                departure_date: date.toISOString().split('T')[0],
                availability: 'available',
                status: 'confirmed'
            });
        }

        return departures;
    }
}
