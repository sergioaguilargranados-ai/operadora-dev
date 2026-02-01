// MegaTravelSyncService.ts - Servicio de sincronización de paquetes MegaTravel
// Build: 31 Ene 2026 - v2.255 - Modelo completo con todos los campos
// 
// Este servicio extrae datos de MegaTravel y los almacena localmente.
// Se ejecuta a demanda (máximo 1 vez al día) desde el panel admin.

import { pool } from '@/lib/db';

// Tipos para datos de MegaTravel
export interface MegaTravelPackageRaw {
    mt_code: string;
    mt_url: string;
    name: string;
    description?: string;
    destination_region: string;
    cities: string[];
    countries: string[];
    main_country: string;
    days: number;
    nights: number;
    price_usd: number;
    price_mxn?: number;
    taxes_usd: number;
    taxes_mxn?: number;
    currency: string;
    price_per_person_type: string;
    price_variants?: Record<string, number>;
    includes_flight: boolean;
    flight_airline?: string;
    flight_origin: string;
    includes: string[];
    not_includes: string[];

    // Hoteles - versión simple (legacy)
    hotels?: Array<{ city: string; name: string; stars: number }>;

    // Hoteles detallados - versión completa
    detailed_hotels?: Array<{
        city: string;
        hotel_names: string[];  // Múltiples opciones
        category: string;       // Primera, Turista, etc.
        country: string;
        stars?: number;
    }>;

    hotel_category?: string;
    meal_plan?: string;

    itinerary?: Array<{ day: number; title: string; description: string; meals?: string[] }>;
    itinerary_summary?: string;

    // Tours opcionales - versión completa
    optional_tours?: Array<{
        code?: string;          // "PAQUETE 2 - A"
        name: string;
        description: string;
        price_usd?: number;
        valid_dates?: {         // Fechas de aplicación
            from: string;
            to: string;
        };
        activities?: string[];  // Lista de actividades incluidas
        conditions?: string;    // Condiciones especiales
    }>;

    departures?: Array<{ date: string; price_usd: number; status: string }>;

    // Suplementos por fecha
    supplements?: Array<{
        dates: string[];        // ["2026-04-13", "2026-04-29"]
        price_usd: number;      // 199
        description?: string;   // "Temporada alta"
    }>;

    // Requisitos de visa
    visa_requirements?: Array<{
        country: string;              // "Turquía"
        days_before_departure: number; // 20
        processing_time: string;      // "NA" o "5 días"
        cost: string;                 // "Sin costo" o "$150 USD"
        application_url?: string;     // URL para tramitar
        notes?: string;               // Notas adicionales
    }>;

    main_image: string;
    gallery_images?: string[];
    map_image?: string;
    category: string;
    subcategory?: string;
    tags?: string[];
    is_featured: boolean;
    is_offer: boolean;

    // Notas importantes - ahora array de strings
    important_notes?: string[];

    tips_amount?: string;
}

export interface SyncResult {
    success: boolean;
    syncId?: number;
    packagesFound: number;
    packagesSynced: number;
    packagesFailed: number;
    errors: string[];
    duration: number;
}

// URLs conocidas de MegaTravel por región
const MEGATRAVEL_REGIONS = [
    { code: 'europa', url: 'https://www.megatravel.com.mx/viajes-europa', name: 'Europa' },
    { code: 'turquia', url: 'https://www.megatravel.com.mx/viaje-a-turquia', name: 'Turquía' },
    { code: 'asia', url: 'https://www.megatravel.com.mx/viajes-asia', name: 'Asia' },
    { code: 'japon', url: 'https://www.megatravel.com.mx/viaje-a-japon', name: 'Japón' },
    { code: 'medio-oriente', url: 'https://www.megatravel.com.mx/viajes-medio-oriente', name: 'Medio Oriente' },
    { code: 'usa', url: 'https://www.megatravel.com.mx/viajes-estados-unidos', name: 'Estados Unidos' },
    { code: 'canada', url: 'https://www.megatravel.com.mx/viajes-canada', name: 'Canadá' },
    { code: 'sudamerica', url: 'https://www.megatravel.com.mx/viajes-sudamerica', name: 'Sudamérica' },
    { code: 'cruceros', url: 'https://www.megatravel.com.mx/cruceros', name: 'Cruceros' },
];

// Paquetes de ejemplo para inicializar (basados en datos reales de MegaTravel)
// Estos se usarán cuando no se pueda hacer scraping directo
const SAMPLE_PACKAGES: MegaTravelPackageRaw[] = [
    {
        mt_code: 'MT-12117',
        mt_url: 'https://www.megatravel.com.mx/viaje/viviendo-europa-12117.html',
        name: 'Viviendo Europa',
        description: 'Viaje desde México a España, Francia, Suiza, Italia. Visitando: Madrid, Burgos, Burdeos, París, Lucerna, Zúrich, Venecia, Florencia, Roma, Pisa, Riviera Francesa, Barcelona, Zaragoza',
        destination_region: 'Europa',
        cities: ['Madrid', 'Burgos', 'Burdeos', 'París', 'Lucerna', 'Zúrich', 'Venecia', 'Florencia', 'Roma', 'Pisa', 'Riviera Francesa', 'Barcelona', 'Zaragoza'],
        countries: ['España', 'Francia', 'Suiza', 'Italia', 'Mónaco'],
        main_country: 'Europa',
        days: 17,
        nights: 15,
        price_usd: 1699,
        taxes_usd: 799,
        currency: 'USD',
        price_per_person_type: 'Por persona en habitación Doble',
        includes_flight: true,
        flight_origin: 'CDMX',
        includes: [
            'Boleto de avión México – Madrid / Madrid - México volando en clase turista',
            '15 noches de alojamiento en categoría indicada',
            'Régimen alimenticio de acuerdo a itinerario',
            'Visitas según itinerario',
            'Guía profesional de habla hispana',
            'Traslados los indicados',
            'Transporte en autocar turístico',
            'Documentos electrónicos código QR'
        ],
        not_includes: [
            'Alimentos, gastos de índole personal',
            'Ningún servicio no especificado',
            'Todas las excursiones que se mencionan como opcionales',
            'Impuestos aéreos por persona',
            '75 EUR que corresponden a propinas para guías acompañantes, choferes, tasas municipales, se paga en destino'
        ],
        hotel_category: 'Turista',
        meal_plan: 'Desayuno incluido',
        optional_tours: [
            { name: 'Paseo en góndola por los canales de Venecia', description: 'Sumérgete en la vida veneciana navegando por los emblemáticos canales venecianos', price_usd: 45 },
            { name: 'Roma Barroca y Coliseo Romano', description: 'Pedir tu deseo al pie de la fuente de Trevi, apreciar el Pantheon, Plaza Navona y el Coliseo Romano', price_usd: 65 },
            { name: 'Museo del Vaticano y la Capilla Sixtina', description: 'Visita los Museos Vaticanos hasta la Capilla Sixtina y Basílica de San Pedro', price_usd: 75 },
            { name: 'Montmarte, Versalles y Torre Eiffel', description: 'Barrio de Montmartre, Palacio de Versalles y subida a la Torre Eiffel', price_usd: 95 },
            { name: 'Ciudad imperial de Toledo', description: 'Toledo con entrada guiada a la Catedral Primada de España', price_usd: 55 },
            { name: 'Mónaco', description: 'Ópera, Casino de Monte-Carlo y parte del circuito de Fórmula 1', price_usd: 40 }
        ],
        main_image: 'https://images.unsplash.com/photo-1499856871958-5b9337606a3e?w=1200',
        gallery_images: [
            'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800',
            'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
            'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800',
            'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800'
        ],
        category: 'Europa',
        subcategory: 'Tour Completo',
        tags: ['europa', 'paris', 'roma', 'barcelona', 'vuelo incluido'],
        is_featured: true,
        is_offer: false,
        tips_amount: '75 EUR'
    },
    {
        mt_code: 'MT-20043',
        mt_url: 'https://www.megatravel.com.mx/viaje/mega-turquia-y-dubai-20043.html',
        name: 'Mega Turquía y Dubái',
        description: 'Descubre los tesoros de Turquía y el lujo de Dubái en un solo viaje',
        destination_region: 'Medio Oriente',
        cities: ['Estambul', 'Ankara', 'Capadocia', 'Pamukkale', 'Kusadasi', 'Éfeso', 'Dubái'],
        countries: ['Turquía', 'Emiratos Árabes Unidos'],
        main_country: 'Turquía',
        days: 15,
        nights: 13,
        price_usd: 999,
        taxes_usd: 999,
        currency: 'USD',
        price_per_person_type: 'Por persona en habitación Doble',
        price_variants: {
            doble: 699,
            triple: 699,
            sencilla: 999,
            menor: 699,
            infante: 399
        },
        includes_flight: true,
        flight_airline: 'Turkish Airlines',
        flight_origin: 'CDMX',
        includes: [
            'Vuelo redondo México-Estambul-Dubái-México',
            '13 noches de alojamiento',
            'Desayunos diarios',
            'Guía de habla hispana',
            'Traslados y transporte terrestre',
            'Entradas según itinerario'
        ],
        not_includes: [
            'Comidas no especificadas',
            'Propinas sugeridas',
            'Gastos personales',
            'Seguro de viaje (recomendado)'
        ],

        // Hoteles detallados (según imagen 2)
        detailed_hotels: [
            {
                city: 'Estambul',
                hotel_names: ['Grand Harilton', 'Clarion Mahmutbey', 'Nirvanas', 'Grand S', 'Ramada Encore Bayrampega', 'Gonen Hotel'],
                category: 'Primera',
                country: 'Turquía',
                stars: 4
            },
            {
                city: 'Capadocia',
                hotel_names: ['Signature Spa', 'Signature Garden Avanos', 'Altinoz', 'Eminkoçak', 'Alp Otel', 'Crystal Kaymakli', 'Dilek', 'Burcu Kaya'],
                category: 'Primera',
                country: 'Turquía',
                stars: 4
            },
            {
                city: 'Pamukkale',
                hotel_names: ['Ramada By Wyndham Thermal', 'Pam Thermal', 'Colossae', 'Richmond', 'Lycus River', 'Adempira', 'Herakles'],
                category: 'Primera',
                country: 'Turquía',
                stars: 4
            },
            {
                city: 'Kusadasi',
                hotel_names: ['Signature Blue Resort Hotel', 'Tusan Beach', 'Odelia', 'Ramada Suites', 'Ramada Fantasia'],
                category: 'Primera',
                country: 'Turquía',
                stars: 4
            },
            {
                city: 'Izmir',
                hotel_names: ['Ramada Izmir', 'Radisson Aliaga', 'Hilti Efesus Selçuk', 'My Hotel', 'Ramada Kemalpaşa', 'Park Inn Radisson', 'Kaya Prestige', 'Blanca', 'Ramada Çeşme'],
                category: 'Primera',
                country: 'Turquía',
                stars: 4
            }
        ],

        hotel_category: 'Primera clase',
        meal_plan: 'Desayuno incluido',

        // Tours opcionales completos (según imagen 4)
        optional_tours: [
            {
                code: 'PAQUETE 1',
                name: 'Joyas de Constantinopla',
                description: 'Crucero por el Bósforo y bazar egipcio. Safari en 4x4',
                price_usd: 295,
                valid_dates: {
                    from: '2026-04-01',
                    to: '2026-10-31'
                },
                activities: [
                    'Joyas de Constantinopla',
                    'Crucero por el Bósforo y bazar egipcio',
                    'Safari en 4x4'
                ],
                conditions: 'Este precio aplica para salidas con llegada a Turquía del 1 ABR al 31 MAY y del 1 SEP al 31 OCT'
            },
            {
                code: 'PAQUETE 2 - A',
                name: 'Paquete Completo Turquía',
                description: 'Joyas de Constantinopla, Crucero por el Bósforo, Safari en 4x4',
                price_usd: 555,
                valid_dates: {
                    from: '2026-04-01',
                    to: '2026-10-31'
                },
                activities: [
                    'Joyas de Constantinopla',
                    'Crucero por el Bósforo y bazar egipcio',
                    'Safari en 4x4'
                ],
                conditions: 'Este precio aplica para salidas con llegada a Turquía del 1 ABR al 31 MAY y del 1 SEP al 31 OCT'
            },
            {
                code: 'CAPADOCIA EN GLOBO - A',
                name: 'Vuelo en globo Capadocia',
                description: 'Sobrevuela las chimeneas de hadas al amanecer',
                price_usd: 350,
                valid_dates: {
                    from: '2026-04-01',
                    to: '2026-10-31'
                },
                conditions: 'Sujeto a las condiciones climáticas al momento de reservar'
            },
            {
                name: 'Cena crucero por el Bósforo',
                description: 'Cena con show turco navegando el Bósforo',
                price_usd: 65
            },
            {
                name: 'Safari en Dubai',
                description: 'Safari en el desierto con cena beduina',
                price_usd: 80
            }
        ],

        // Suplementos (según imagen 2)
        supplements: [
            {
                dates: ['2026-04-13', '2026-04-29'],
                price_usd: 199,
                description: 'Abril: 13, 29'
            },
            {
                dates: ['2026-08-19', '2026-08-22', '2026-08-26', '2026-08-27', '2026-08-28', '2026-08-29'],
                price_usd: 199,
                description: 'Agosto: 19, 22, 26, 27, 28, 29'
            },
            {
                dates: ['2026-03-11', '2026-03-15'],
                price_usd: 299,
                description: 'Marzo: 11, 15'
            },
            {
                dates: ['2026-05-06', '2026-05-07', '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-21', '2026-05-23'],
                price_usd: 299,
                description: 'Mayo: 6, 7, 14, 15, 16, 21, 23'
            },
            {
                dates: ['2026-09-03', '2026-09-10', '2026-09-12', '2026-09-17'],
                price_usd: 299,
                description: 'Septiembre: 3, 10, 12, 17'
            },
            {
                dates: ['2026-11-05', '2026-11-15', '2026-11-22', '2026-11-25', '2026-11-30'],
                price_usd: 299,
                description: 'Noviembre: 5, 15, 22, 25, 30'
            },
            {
                dates: ['2026-06-01', '2026-06-05', '2026-06-20'],
                price_usd: 399,
                description: 'Junio: 1, 5, 6, 20'
            },
            {
                dates: ['2026-07-16'],
                price_usd: 399,
                description: 'Julio: 16'
            }
        ],

        // Requisitos de visa (según imagen 3)
        visa_requirements: [
            {
                country: 'Turquía',
                days_before_departure: 20,
                processing_time: 'NA',
                cost: 'Sin costo',
                application_url: 'https://www.evisa.gov.tr/es/',
                notes: 'Le informamos que el trámite de visa corresponde ÚNICAMENTE al pasajero, así como el presentarla directamente al arribo al destino. Mega Travel actúa como un mero intermediario eximiéndonos así de cualquier responsabilidad por incidencias en estas materias.'
            }
        ],

        main_image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200',
        gallery_images: [
            'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800',
            'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'
        ],
        map_image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',

        category: 'Medio Oriente',
        subcategory: 'Turquía + Dubai',
        tags: ['turquia', 'dubai', 'capadocia', 'estambul', 'vuelo incluido'],
        is_featured: true,
        is_offer: false,

        // Notas importantes (según imagen 3-4) - ahora como array
        important_notes: [
            'ESTE ITINERARIO PUEDE SUFRIR MODIFICACIONES POR CONDICIONES DE CARRETERAS, CLIMA, OTROS ASPECTOS NO PREVISIBLES O DISPONIBILIDAD AL MOMENTO DE RESERVAR',
            'EL ORDEN DE LOS SERVICIOS PUEDE CAMBIAR',
            'Precios indicados por persona en USD',
            'Los precios cambian constantemente, así que te sugerimos la verificación de estos, y no utilizar este documento como definitivo, en caso de no encontrar la fecha dentro del recuadro consultar el precio del suplemento con su ejecutivo.',
            'Precios vigentes hasta el 30/11/2026'
        ],

        tips_amount: '50 EUR'
    },
    {
        mt_code: 'MT-30208',
        mt_url: 'https://www.megatravel.com.mx/viaje/japon-el-camino-del-samurai-30208.html',
        name: 'Japón: El Camino del Samurái',
        description: 'Recorre la tierra del sol naciente desde Tokyo hasta Kyoto, pasando por lo mejor de Japón',
        destination_region: 'Asia',
        cities: ['Tokyo', 'Hakone', 'Nagoya', 'Kyoto', 'Nara', 'Osaka'],
        countries: ['Japón'],
        main_country: 'Japón',
        days: 12,
        nights: 10,
        price_usd: 1999,
        taxes_usd: 999,
        currency: 'USD',
        price_per_person_type: 'Por persona en habitación Doble',
        includes_flight: true,
        flight_origin: 'CDMX',
        includes: [
            'Vuelo redondo México-Tokyo',
            '10 noches de alojamiento',
            'Desayunos diarios',
            'Traslados en tren bala (Shinkansen)',
            'Guía de habla hispana',
            'Entradas a templos y atracciones'
        ],
        not_includes: [
            'Comidas no especificadas',
            'JR Pass adicional',
            'Gastos personales'
        ],
        hotel_category: 'Primera clase',
        meal_plan: 'Desayuno incluido',
        optional_tours: [
            { name: 'Ceremonia del Té', description: 'Experiencia tradicional japonesa', price_usd: 45 },
            { name: 'Cena de Sumo', description: 'Cena con los famosos luchadores de sumo', price_usd: 120 }
        ],
        main_image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200',
        gallery_images: [
            'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
            'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800'
        ],
        category: 'Asia',
        subcategory: 'Japón',
        tags: ['japon', 'tokyo', 'kyoto', 'samurai', 'cultura', 'vuelo incluido'],
        is_featured: true,
        is_offer: false,
        tips_amount: '40 USD'
    },
    {
        mt_code: 'MT-42472',
        mt_url: 'https://www.megatravel.com.mx/viaje/nueva-york-semana-santa-42472.html',
        name: 'Nueva York Semana Santa',
        description: 'Vive la Gran Manzana en Semana Santa con toda la familia',
        destination_region: 'Norte América',
        cities: ['Nueva York'],
        countries: ['Estados Unidos'],
        main_country: 'Estados Unidos',
        days: 6,
        nights: 5,
        price_usd: 799,
        taxes_usd: 499,
        currency: 'USD',
        price_per_person_type: 'Por persona en habitación Cuádruple',
        price_variants: { cuadruple: 799, triple: 899, doble: 999, sencilla: 1299 },
        includes_flight: true,
        flight_origin: 'CDMX',
        includes: [
            'Vuelo redondo México-Nueva York',
            '5 noches de alojamiento en Manhattan',
            'Traslados aeropuerto-hotel-aeropuerto',
            'City tour panorámico',
            'Crucero a la Estatua de la Libertad'
        ],
        not_includes: [
            'Entradas a atracciones',
            'Comidas',
            'Propinas'
        ],
        hotel_category: 'Turista Superior',
        meal_plan: 'Solo hospedaje',
        optional_tours: [
            { name: 'Top of the Rock', description: 'Mirador del Rockefeller Center', price_usd: 45 },
            { name: 'Broadway Show', description: 'Musical en Broadway', price_usd: 150 }
        ],
        main_image: 'https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?w=1200',
        gallery_images: [
            'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800'
        ],
        category: 'Estados Unidos',
        subcategory: 'Nueva York',
        tags: ['nueva york', 'semana santa', 'familia', 'manhattan'],
        is_featured: false,
        is_offer: true,
        tips_amount: '30 USD'
    },
    {
        mt_code: 'MT-52104',
        mt_url: 'https://www.megatravel.com.mx/viaje/disfruta-una-experiencia-andina-52104.html',
        name: 'Experiencia Andina',
        description: 'Descubre Perú: Lima, Cusco y la maravilla de Machu Picchu',
        destination_region: 'Sudamérica',
        cities: ['Lima', 'Cusco', 'Valle Sagrado', 'Machu Picchu'],
        countries: ['Perú'],
        main_country: 'Perú',
        days: 8,
        nights: 7,
        price_usd: 899,
        taxes_usd: 499,
        currency: 'USD',
        price_per_person_type: 'Por persona en habitación Doble',
        includes_flight: true,
        flight_origin: 'CDMX',
        includes: [
            'Vuelo México-Lima-Cusco-Lima-México',
            '7 noches de alojamiento',
            'Desayunos diarios',
            'Tren a Machu Picchu',
            'Entrada a Machu Picchu',
            'Guía en español',
            'Tour Valle Sagrado'
        ],
        not_includes: [
            'Propinas',
            'Comidas no indicadas',
            'Seguro de altitud'
        ],
        hotel_category: 'Primera clase',
        meal_plan: 'Desayuno incluido',
        optional_tours: [
            { name: 'Rainbow Mountain', description: 'Caminata a la Montaña de 7 Colores', price_usd: 65 },
            { name: 'Cena peruana con show', description: 'Gastronomía y danzas típicas', price_usd: 55 }
        ],
        main_image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1200',
        gallery_images: [
            'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800'
        ],
        category: 'Sudamérica',
        subcategory: 'Perú',
        tags: ['peru', 'machu picchu', 'cusco', 'lima', 'andes'],
        is_featured: false,
        is_offer: false,
        tips_amount: '25 USD'
    },
    {
        mt_code: 'MT-60867',
        mt_url: 'https://www.megatravel.com.mx/viaje/caribe-msc-world-america-60867.html',
        name: 'Caribe MSC World America',
        description: 'Crucero por el Caribe a bordo del nuevo MSC World America',
        destination_region: 'Caribe',
        cities: ['Miami', 'Cozumel', 'Isla de Roatán', 'Costa Maya'],
        countries: ['Estados Unidos', 'México', 'Honduras'],
        main_country: 'Caribe',
        days: 8,
        nights: 7,
        price_usd: 691,
        taxes_usd: 304,
        currency: 'USD',
        price_per_person_type: 'Por persona en habitación Interior',
        price_variants: { interior: 691, exterior: 891, balcon: 1091, suite: 1591 },
        includes_flight: false,
        flight_origin: 'N/A',
        includes: [
            '7 noches de crucero',
            'Todas las comidas a bordo',
            'Entretenimiento y shows',
            'Uso de instalaciones',
            'Tasas portuarias'
        ],
        not_includes: [
            'Vuelo a Miami',
            'Propinas de crucero ($16 USD/día)',
            'Excursiones en tierra',
            'Bebidas alcohólicas'
        ],
        hotel_category: 'Crucero MSC',
        meal_plan: 'Todo incluido (no bebidas)',
        optional_tours: [
            { name: 'Snorkel en Cozumel', description: 'Arrecifes del Caribe Mexicano', price_usd: 75 },
            { name: 'Playas de Roatán', description: 'Día de playa en Honduras', price_usd: 55 }
        ],
        main_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
        gallery_images: [
            'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?w=800'
        ],
        category: 'Cruceros',
        subcategory: 'MSC Cruceros',
        tags: ['crucero', 'caribe', 'msc', 'cozumel', 'miami'],
        is_featured: false,
        is_offer: true,
        tips_amount: '$16 USD/día'
    }
];

export class MegaTravelSyncService {

    /**
     * Verificar si se puede sincronizar (máximo 1 vez al día)
     */
    static async canSync(): Promise<{ canSync: boolean; lastSync: string | null; reason?: string }> {
        try {
            const result = await pool.query(`
                SELECT value FROM app_settings WHERE key = 'MEGATRAVEL_LAST_SYNC'
            `);

            const lastSync = result.rows[0]?.value;

            if (!lastSync) {
                return { canSync: true, lastSync: null };
            }

            const lastSyncDate = new Date(lastSync);
            const now = new Date();
            const hoursSinceLastSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastSync < 24) {
                return {
                    canSync: false,
                    lastSync,
                    reason: `Última sincronización hace ${Math.round(hoursSinceLastSync)} horas. Esperar 24 horas.`
                };
            }

            return { canSync: true, lastSync };
        } catch (error) {
            console.error('Error checking sync status:', error);
            return { canSync: true, lastSync: null };
        }
    }

    /**
     * Iniciar sincronización completa
     */
    static async startFullSync(triggeredBy: string = 'system'): Promise<SyncResult> {
        const startTime = Date.now();
        let syncId: number | undefined;
        const errors: string[] = [];
        let packagesSynced = 0;
        let packagesFailed = 0;

        try {
            // Crear registro de sincronización
            const syncResult = await pool.query(`
                INSERT INTO megatravel_sync_log (sync_type, triggered_by, status)
                VALUES ('full', $1, 'running')
                RETURNING id
            `, [triggeredBy]);
            syncId = syncResult.rows[0].id;

            console.log(`🔄 Iniciando sincronización MegaTravel (ID: ${syncId})`);

            // Por ahora usamos los paquetes de ejemplo
            // En producción aquí iría el scraping real con Puppeteer
            const packages = SAMPLE_PACKAGES;

            // Obtener margen configurado
            const marginResult = await pool.query(`
                SELECT value FROM app_settings WHERE key = 'MEGATRAVEL_MARGIN_PERCENT'
            `);
            const margin = parseFloat(marginResult.rows[0]?.value || '15');

            // Sincronizar cada paquete
            for (const pkg of packages) {
                try {
                    await this.upsertPackage(pkg, margin);
                    packagesSynced++;
                } catch (err) {
                    packagesFailed++;
                    const errorMsg = `Error sincronizando ${pkg.mt_code}: ${err}`;
                    errors.push(errorMsg);
                    console.error(errorMsg);
                }
            }

            // Actualizar registro de sincronización
            const duration = Date.now() - startTime;
            await pool.query(`
                UPDATE megatravel_sync_log 
                SET completed_at = CURRENT_TIMESTAMP,
                    packages_found = $1,
                    packages_synced = $2,
                    packages_failed = $3,
                    status = 'completed',
                    details = $4
                WHERE id = $5
            `, [packages.length, packagesSynced, packagesFailed, JSON.stringify({ errors }), syncId]);

            // Actualizar última sincronización
            await pool.query(`
                UPDATE app_settings SET value = $1 WHERE key = 'MEGATRAVEL_LAST_SYNC'
            `, [new Date().toISOString()]);

            console.log(`✅ Sincronización completada: ${packagesSynced}/${packages.length} paquetes`);

            return {
                success: true,
                syncId,
                packagesFound: packages.length,
                packagesSynced,
                packagesFailed,
                errors,
                duration
            };

        } catch (error) {
            const errorMsg = `Error en sincronización: ${error}`;
            console.error(errorMsg);

            if (syncId) {
                await pool.query(`
                    UPDATE megatravel_sync_log 
                    SET status = 'failed', error_message = $1, completed_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                `, [errorMsg, syncId]);
            }

            return {
                success: false,
                syncId,
                packagesFound: 0,
                packagesSynced,
                packagesFailed,
                errors: [errorMsg],
                duration: Date.now() - startTime
            };
        }
    }

    /**
     * Insertar o actualizar un paquete
     */
    private static async upsertPackage(pkg: MegaTravelPackageRaw, margin: number): Promise<void> {
        const slug = pkg.name.toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        await pool.query(`
            INSERT INTO megatravel_packages (
                mt_code, mt_url, slug, name, description, destination_region,
                cities, countries, main_country, days, nights,
                price_usd, taxes_usd, currency, price_per_person_type, price_variants,
                includes_flight, flight_airline, flight_origin,
                includes, not_includes, hotel_category, meal_plan,
                optional_tours, main_image, gallery_images, map_image,
                category, subcategory, tags, is_featured, is_offer, tips_amount,
                detailed_hotels, supplements, visa_requirements, important_notes,
                our_margin_percent, is_active, last_sync_at, sync_status
            ) VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11,
                $12, $13, $14, $15, $16,
                $17, $18, $19,
                $20, $21, $22, $23,
                $24, $25, $26, $27,
                $28, $29, $30, $31, $32, $33,
                $34, $35, $36, $37,
                $38, true, CURRENT_TIMESTAMP, 'synced'
            )
            ON CONFLICT (mt_code) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                price_usd = EXCLUDED.price_usd,
                taxes_usd = EXCLUDED.taxes_usd,
                price_variants = EXCLUDED.price_variants,
                optional_tours = EXCLUDED.optional_tours,
                detailed_hotels = EXCLUDED.detailed_hotels,
                supplements = EXCLUDED.supplements,
                visa_requirements = EXCLUDED.visa_requirements,
                important_notes = EXCLUDED.important_notes,
                map_image = EXCLUDED.map_image,
                is_featured = EXCLUDED.is_featured,
                is_offer = EXCLUDED.is_offer,
                last_sync_at = CURRENT_TIMESTAMP,
                sync_status = 'synced',
                updated_at = CURRENT_TIMESTAMP
        `, [
            pkg.mt_code, pkg.mt_url, slug, pkg.name, pkg.description || null, pkg.destination_region,
            pkg.cities, pkg.countries, pkg.main_country, pkg.days, pkg.nights,
            pkg.price_usd, pkg.taxes_usd, pkg.currency, pkg.price_per_person_type, JSON.stringify(pkg.price_variants || {}),
            pkg.includes_flight, pkg.flight_airline || null, pkg.flight_origin,
            pkg.includes, pkg.not_includes, pkg.hotel_category || null, pkg.meal_plan || null,
            JSON.stringify(pkg.optional_tours || []), pkg.main_image, pkg.gallery_images || [], pkg.map_image || null,
            pkg.category, pkg.subcategory || null, pkg.tags || [], pkg.is_featured, pkg.is_offer, pkg.tips_amount || null,
            JSON.stringify(pkg.detailed_hotels || []), JSON.stringify(pkg.supplements || []), JSON.stringify(pkg.visa_requirements || []), JSON.stringify(pkg.important_notes || []),
            margin
        ]);
    }

    /**
     * Obtener todos los paquetes con precios calculados
     */
    static async getPackagesWithPrices(filters?: {
        category?: string;
        region?: string;
        minPrice?: number;
        maxPrice?: number;
        featured?: boolean;
        search?: string;
    }): Promise<any[]> {
        let query = `
            SELECT 
                p.*,
                ROUND(p.price_usd * (1 + p.our_margin_percent / 100), 2) as sale_price_usd,
                ROUND(p.price_usd * (1 + p.our_margin_percent / 100) + COALESCE(p.taxes_usd, 0), 2) as total_price_usd,
                ROUND(p.price_usd * (1 + p.our_margin_percent / 100) * 0.10, 2) as savings_usd
            FROM megatravel_packages p
            WHERE p.is_active = true
        `;
        const params: any[] = [];
        let paramCount = 0;

        if (filters?.category) {
            paramCount++;
            query += ` AND p.category = $${paramCount}`;
            params.push(filters.category);
        }

        if (filters?.region) {
            paramCount++;
            query += ` AND p.destination_region = $${paramCount}`;
            params.push(filters.region);
        }

        if (filters?.featured) {
            query += ` AND p.is_featured = true`;
        }

        if (filters?.search) {
            paramCount++;
            query += ` AND (
                p.name ILIKE $${paramCount} 
                OR p.description ILIKE $${paramCount}
                OR p.destination_region ILIKE $${paramCount}
                OR p.main_country ILIKE $${paramCount}
                OR EXISTS (
                    SELECT 1 FROM unnest(p.cities) AS city 
                    WHERE city ILIKE $${paramCount}
                )
                OR EXISTS (
                    SELECT 1 FROM unnest(p.countries) AS country 
                    WHERE country ILIKE $${paramCount}
                )
            )`;
            params.push(`%${filters.search}%`);
        }

        query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;

        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting packages:', error);
            return [];
        }
    }

    /**
     * Obtener un paquete por código
     */
    static async getPackageByCode(mtCode: string): Promise<any | null> {
        try {
            const result = await pool.query(`
                SELECT 
                    p.*,
                    ROUND(p.price_usd * (1 + p.our_margin_percent / 100), 2) as sale_price_usd,
                    ROUND(p.price_usd * (1 + p.our_margin_percent / 100) + COALESCE(p.taxes_usd, 0), 2) as total_price_usd,
                    ROUND(p.price_usd * (1 + p.our_margin_percent / 100) * 0.10, 2) as savings_usd
                FROM megatravel_packages p
                WHERE p.mt_code = $1 AND p.is_active = true
            `, [mtCode]);

            return result.rows[0] || null;
        } catch (error) {
            console.error('Error getting package:', error);
            return null;
        }
    }

    /**
     * Obtener historial de sincronizaciones
     */
    static async getSyncHistory(limit: number = 10): Promise<any[]> {
        try {
            const result = await pool.query(`
                SELECT * FROM megatravel_sync_log 
                ORDER BY started_at DESC 
                LIMIT $1
            `, [limit]);
            return result.rows;
        } catch (error) {
            console.error('Error getting sync history:', error);
            return [];
        }
    }

    /**
     * Obtener estadísticas
     */
    static async getStats(): Promise<any> {
        try {
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total_packages,
                    COUNT(*) FILTER (WHERE is_active = true) as active_packages,
                    COUNT(*) FILTER (WHERE is_featured = true) as featured_packages,
                    COUNT(*) FILTER (WHERE is_offer = true) as offer_packages,
                    COUNT(DISTINCT category) as categories,
                    MIN(price_usd) as min_price,
                    MAX(price_usd) as max_price,
                    AVG(price_usd)::numeric(10,2) as avg_price
                FROM megatravel_packages
            `);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting stats:', error);
            return {};
        }
    }
}

export default MegaTravelSyncService;
