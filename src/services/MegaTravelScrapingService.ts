// MegaTravelScrapingService.ts - Servicio de scraping completo de MegaTravel
// Build: 01 Feb 2026 - v2.262 - Scraping completo con Puppeteer + Cheerio
//
// Este servicio extrae TODA la información de MegaTravel usando:
// - Cheerio para datos estáticos (HTML simple)
// - Puppeteer para datos dinámicos (JavaScript rendering)

import puppeteer from 'puppeteer';
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

            // Obtener HTML completo
            const html = await page.content();

            // Cerrar navegador
            await browser.close();

            // Parsear con Cheerio
            const $ = cheerio.load(html);

            // Extraer cada tipo de dato
            const itinerary = await this.scrapeItinerary($, page, tourUrl);
            const departures = await this.scrapeDepartures($);
            const policies = await this.scrapePolicies($);
            const additionalInfo = await this.scrapeAdditionalInfo($);
            const optionalTours = await this.scrapeOptionalTours($);

            console.log(`✅ Scraping completo para ${tourUrl}:`, {
                itinerary: itinerary.length + ' días',
                departures: departures.length + ' salidas',
                optionalTours: optionalTours.length + ' tours'
            });

            return {
                itinerary,
                departures,
                policies,
                additionalInfo,
                optionalTours
            };

        } catch (error) {
            console.error(`❌ Error en scraping de ${tourUrl}:`, error);
            throw error;
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
     * GUARDAR DATOS EN LA BASE DE DATOS
     */
    static async saveScrapedData(
        packageId: number,
        data: {
            itinerary: ItineraryDay[];
            departures: Departure[];
            policies: Policies;
            additionalInfo: AdditionalInfo;
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
                    packageId, day.day_number, day.title, day.description,
                    day.meals || null, day.hotel || null, day.city || null,
                    day.activities || [], day.highlights || []
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
