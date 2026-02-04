// MegaTravelScrapingService.ts - Servicio de scraping completo de MegaTravel
// Build: 01 Feb 2026 - v2.262 - Scraping completo con Puppeteer + Cheerio
//
// Este servicio extrae TODA la información de MegaTravel usando:
// - Cheerio para datos estáticos (HTML simple)
// - Puppeteer para datos dinámicos (JavaScript rendering)

import puppeteer, { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { pool } from '@/lib/db';

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
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

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
    }> {
        console.log(`🔍 Scraping completo para: ${tourUrl}`);

        try {
            // Abrir navegador con Puppeteer
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

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

            // Extraer cada tipo de dato
            const itinerary = await this.scrapeItinerary($, null, tourUrl); // page ya está cerrado
            const departures = await this.scrapeDepartures($);
            const policies = await this.scrapePolicies($);
            const additionalInfo = await this.scrapeAdditionalInfo($);
            const optionalTours = await this.scrapeOptionalTours($);
            const images = await this.scrapeImages($);
            const tags = await this.scrapeClassifications($);

            // Extraer precios estáticos (fallback si no hay dinámicos)
            const staticPricing = await this.scrapePricing($);

            // Usar precios dinámicos si están disponibles, sino usar estáticos
            const pricing = dynamicPricing.price_usd !== null ? dynamicPricing : staticPricing;

            const { includes, not_includes } = await this.scrapeIncludesNotIncludes($);

            // Extraer código del tour para obtener itinerario completo
            const tourCode = tourUrl.match(/(\d+)\.html$/)?.[1];
            let fullItinerary = itinerary;

            if (tourCode) {
                try {
                    console.log(`📄 Obteniendo itinerario completo desde circuito.php...`);
                    const circuitoItinerary = await this.scrapeItineraryFromCircuito(tourCode);

                    if (circuitoItinerary.length > itinerary.length) {
                        fullItinerary = circuitoItinerary;
                        console.log(`✅ Itinerario completo: ${circuitoItinerary.length} días (desde circuito.php)`);
                    } else {
                        console.log(`ℹ️  Usando itinerario de página principal: ${itinerary.length} días`);
                    }
                } catch (error) {
                    console.log(`⚠️  No se pudo obtener itinerario desde circuito.php, usando página principal`);
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
                // NUEVOS:
                pricing,
                includes,
                not_includes
            };

        } catch (error) {
            console.error(`❌ Error en scraping de ${tourUrl}:`, error);
            throw error;
        }
    }

    /**
     * SCRAPING DE ITINERARIO COMPLETO desde circuito.php
     */
    static async scrapeItineraryFromCircuito(tourCode: string): Promise<ItineraryDay[]> {
        const url = `https://megatravel.com.mx/tools/circuito.php?viaje=${tourCode}`;

        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            await page.waitForSelector('body', { timeout: 10000 });
            const html = await page.content();
            await browser.close();

            const $ = cheerio.load(html);

            // Buscar sección de itinerario
            const itinerarySection = $('h5:contains("Itinerario")').next('.p-3, .border');

            if (!itinerarySection.length) {
                console.log('⚠️  No se encontró sección de itinerario en circuito.php');
                return [];
            }

            const days: ItineraryDay[] = [];
            let dayNumber = 1;

            // Parsear días del itinerario
            // Formato: <p><b>FECHA CIUDAD - PAÍS</b></p><p>Descripción...</p>
            const paragraphs = itinerarySection.find('p');

            for (let i = 0; i < paragraphs.length; i++) {
                const p = $(paragraphs[i]);
                const boldText = p.find('b').text().trim();

                if (boldText && boldText.length > 0) {
                    // Este es un título de día
                    const title = boldText;

                    // Buscar descripción en el siguiente <p>
                    let description = '';
                    if (i + 1 < paragraphs.length) {
                        const nextP = $(paragraphs[i + 1]);
                        // Si el siguiente <p> no tiene <b>, es la descripción
                        if (nextP.find('b').length === 0) {
                            description = nextP.text().trim();
                            i++; // Saltar el siguiente párrafo
                        }
                    }

                    // Extraer ciudad del título
                    const cityMatch = title.match(/([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ\s]+)\s*[-–]\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ\s]+)/);
                    const city = cityMatch ? cityMatch[1].trim() : null;

                    days.push({
                        day_number: dayNumber++,
                        title: title,
                        description: description || '',
                        meals: undefined,
                        hotel: undefined,
                        city: city || undefined,
                        activities: [],
                        highlights: []
                    });
                }
            }

            return days;

        } catch (error) {
            console.error(`❌ Error scraping circuito.php para tour ${tourCode}:`, error);
            return [];
        }
    }

    /**
     * 1. SCRAPING DE ITINERARIO (Puppeteer + Cheerio)
     */
    static async scrapeItinerary(
        $: cheerio.Root,
        page: any,
        tourUrl: string
    ): Promise<ItineraryDay[]> {
        try {
            const days: ItineraryDay[] = [];

            // Estrategia A: Buscar itinerario en el HTML actual
            const itinerarySection = $('#itinerario, .itinerary, .day-by-day, [id*="itinerario"]');

            if (itinerarySection.length > 0) {
                console.log('📝 Itinerario encontrado en HTML estático');

                // Buscar días uno por uno
                $('.day-item, .itinerary-day, [class*="day"]').each((i, elem) => {
                    const $day = $(elem);
                    const text = $day.text();

                    // Extraer número de día (DÍA 01, DÍA 1, Day 1, etc.)
                    const dayMatch = text.match(/D[ÍI]A\s+(\d+)|DAY\s+(\d+)/i);
                    if (!dayMatch) return;

                    const dayNumber = parseInt(dayMatch[1] || dayMatch[2]);

                    // Extraer título (primera línea después del número)
                    const titleMatch = text.match(/D[ÍI]A\s+\d+\s+(.+?)(?:\n|Desayuno|\.)/i);
                    const title = titleMatch ? titleMatch[1].trim() : '';

                    // Extraer descripción (resto del texto)
                    const description = text
                        .replace(/D[ÍI]A\s+\d+.+?\n/, '')
                        .trim();

                    // Extraer comidas (D, A, C)
                    const mealsMatch = text.match(/\(([DAC,\s]+)\)/);
                    const meals = mealsMatch ? mealsMatch[1].replace(/\s/g, '') : undefined;

                    days.push({
                        day_number: dayNumber,
                        title,
                        description,
                        meals
                    });
                });
            }

            // Estrategia B: Si no encuentra días, parsear el texto completo
            if (days.length === 0) {
                console.log('📄 Parseando itinerario desde texto completo');

                const fullText = $('body').text();
                const dayRegex = /DÍA\s+(\d+)\s+([^\n]+)([\s\S]*?)(?=DÍA\s+\d+|$)/gi;
                let match;

                while ((match = dayRegex.exec(fullText)) !== null) {
                    const dayNumber = parseInt(match[1]);
                    const title = match[2].trim();
                    const description = match[3]
                        .split('\n')
                        .filter(line => line.trim().length > 0)
                        .join(' ')
                        .trim()
                        .substring(0, 1000);  // Limitar a 1000 caracteres

                    days.push({
                        day_number: dayNumber,
                        title,
                        description
                    });
                }
            }

            console.log(`📅 Itinerario extraído: ${days.length} días`);
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
     * 6. SCRAPING DE IMÁGENES
     */
    static async scrapeImages($: cheerio.Root): Promise<{
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

            // Buscar todas las imágenes del tour (cdnmega.com/images/viajes)
            const tourImages: string[] = [];

            $('img').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.includes('cdnmega.com/images/viajes')) {
                    // Filtrar logos y otros elementos
                    if (!src.includes('logo') && !src.includes('icon') && !src.includes('brand')) {
                        tourImages.push(src);
                    }
                }
            });

            // Extraer código del tour de la URL de la página
            const pageUrl = $('link[rel="canonical"]').attr('href') || '';
            const tourCodeMatch = pageUrl.match(/(\d+)\.html$/);
            const tourCode = tourCodeMatch ? tourCodeMatch[1] : null;

            // Estrategia mejorada para detectar imagen principal:
            // 1. Buscar imagen que contenga el código del tour en el nombre
            // 2. Si no, buscar la primera imagen con /covers/ que NO sea de otro tour
            let mainImage = null;

            if (tourCode) {
                // Buscar imagen con el código del tour
                mainImage = tourImages.find(img =>
                    img.includes('/covers/') &&
                    (img.includes(tourCode) || img.includes(`-${tourCode}-`))
                );
            }

            // Si no encontramos por código, buscar la primera imagen con /covers/
            // que no tenga otro código de tour en el nombre
            if (!mainImage) {
                mainImage = tourImages.find(img => {
                    if (!img.includes('/covers/')) return false;

                    // Verificar que no sea de otro tour (no tenga otro código de 5 dígitos)
                    const otherTourCode = img.match(/(\d{5})-/);
                    if (otherTourCode && tourCode && otherTourCode[1] !== tourCode) {
                        return false; // Es de otro tour
                    }

                    return true;
                });
            }

            if (mainImage) {
                images.main = mainImage;
            }

            // El resto son galería (excluir la principal)
            images.gallery = tourImages.filter(img => img !== mainImage);

            // Buscar imagen de mapa (si existe)
            const mapImage = tourImages.find(img => img.includes('map') || img.includes('mapa'));
            if (mapImage) {
                images.map = mapImage;
                // Remover del gallery si está ahí
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
     */
    static async scrapeIncludesNotIncludes($: cheerio.Root): Promise<{
        includes: string[];
        not_includes: string[];
    }> {
        try {
            const includes: string[] = [];
            const not_includes: string[] = [];

            // Estrategia 1: Buscar por ID #linkincluye
            const includesSection = $('#linkincluye');
            if (includesSection.length > 0) {
                // Buscar todos los <li> dentro de la sección
                includesSection.find('ul li').each((i, elem) => {
                    const text = $(elem).text().trim();
                    if (text && text.length > 3) {
                        includes.push(text);
                    }
                });
            }

            // Estrategia 2: Si no encontró por ID, buscar por texto "El viaje incluye"
            if (includes.length === 0) {
                const bodyHtml = $('body').html() || '';
                const includesMatch = bodyHtml.match(/El viaje incluye([\s\S]*?)(?=El viaje no incluye|Itinerario|Mapa del tour|$)/i);
                if (includesMatch) {
                    const includesHtml = includesMatch[1];
                    const $includes = cheerio.load(includesHtml);

                    // Extraer items de lista
                    $includes('li, p').each((i, elem) => {
                        const text = $(elem).text().trim();
                        if (text && text.length > 3 && !text.startsWith('El viaje')) {
                            const cleanText = text.replace(/^[-•*]\s*/, '').trim();
                            if (cleanText) {
                                includes.push(cleanText);
                            }
                        }
                    });
                }
            }

            // Buscar "El viaje no incluye" - primero intentar por patrón de texto
            const bodyHtml = $('body').html() || '';
            const notIncludesMatch = bodyHtml.match(/El viaje no incluye([\s\S]*?)(?=Itinerario|Mapa del tour|Tours opcionales|Información adicional|$)/i);
            if (notIncludesMatch) {
                const notIncludesHtml = notIncludesMatch[1];
                const $notIncludes = cheerio.load(notIncludesHtml);

                // Extraer items de lista
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

            console.log(`   ✅ Incluye: ${includes.length} items`);
            console.log(`   ❌ No incluye: ${not_includes.length} items`);

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
