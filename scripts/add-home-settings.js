// Script para agregar configuraciones de home
// Ejecutar con: node scripts/add-home-settings.js

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function addSettings() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔄 Agregando configuraciones...');

        const settings = [
            // Features para ocultar secciones de home
            ['HOME_SEARCH_HOTELS', 'false', 'Muestra buscador de hoteles en home'],
            ['HOME_PACKAGES_CTA', 'false', 'Muestra seccion vuelo+hotel en home'],
            ['HOME_OFFERS_SECTION', 'false', 'Muestra ofertas especiales en home'],
            ['HOME_FLIGHTS_SECTION', 'false', 'Muestra vuelos en home'],
            ['HOME_ACCOMMODATION_SECTION', 'false', 'Muestra hospedajes favoritos en home'],
            ['HOME_WEEKEND_SECTION', 'false', 'Muestra ofertas fin de semana en home'],
            ['HOME_VACATION_PACKAGES', 'false', 'Muestra paquetes vacacionales en home'],
            ['HOME_UNIQUE_STAYS', 'false', 'Muestra hospedajes unicos en home'],
            ['HOME_EXPLORE_WORLD', 'false', 'Muestra explora el mundo en home'],
            // Configuraciones
            ['TOURS_PROMO_VIDEO_URL', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'URL del video promocional de tours'],
            ['WHATSAPP_NUMBER', '+525512345678', 'Numero de WhatsApp para contacto']
        ];

        for (const [key, value, description] of settings) {
            await pool.query(`
                INSERT INTO app_settings (key, value, description)
                VALUES ($1, $2, $3)
                ON CONFLICT (key) DO UPDATE SET value = $2, description = $3
            `, [key, value, description]);
            console.log(`  ✅ ${key} = ${value}`);
        }

        console.log('\n✅ Todas las configuraciones agregadas');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

addSettings();
