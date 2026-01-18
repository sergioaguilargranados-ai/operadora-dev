/**
 * Script para poblar la BD con contenido del homepage
 * Las mismas imágenes que se usan como mock en las APIs
 *
 * Ejecutar: cd operadora-dev && node scripts/populate-homepage-content.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function populateContent() {
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando población de contenido del homepage...\n');

    // =========================================
    // 1. HERO PRINCIPAL
    // =========================================
    console.log('📸 Actualizando Hero principal...');

    await client.query(`
      INSERT INTO featured_hero (title, subtitle, description, image_url, is_active)
      VALUES (
        'Descubre tu próximo destino',
        'Ofertas exclusivas en vuelos, hoteles y paquetes',
        'Encuentra los mejores precios en viajes a todo el mundo',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop',
        true
      )
      ON CONFLICT (id) WHERE id = 1 DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        is_active = true,
        updated_at = CURRENT_TIMESTAMP
    `);

    // Si no hay conflicto, actualizar el primero activo
    await client.query(`
      UPDATE featured_hero
      SET image_url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop',
          title = 'Descubre tu próximo destino',
          subtitle = 'Ofertas exclusivas en vuelos, hoteles y paquetes',
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE is_active = true
    `);

    console.log('  ✅ Hero actualizado\n');

    // =========================================
    // 2. DESTINOS DE VUELOS
    // =========================================
    console.log('✈️ Actualizando destinos de vuelos...');

    const flightDestinations = [
      { city: 'Cancún', country: 'México', price: 2500, code: 'CUN', img: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600&h=400&fit=crop' },
      { city: 'Los Cabos', country: 'México', price: 3200, code: 'SJD', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&h=400&fit=crop' },
      { city: 'Puerto Vallarta', country: 'México', price: 2800, code: 'PVR', img: 'https://images.unsplash.com/photo-1554743365-5e9d141571f3?w=600&h=400&fit=crop' },
      { city: 'Guadalajara', country: 'México', price: 1800, code: 'GDL', img: 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=600&h=400&fit=crop' }
    ];

    // Limpiar y reinsertar
    await client.query('DELETE FROM flight_destinations');

    for (let i = 0; i < flightDestinations.length; i++) {
      const d = flightDestinations[i];
      await client.query(`
        INSERT INTO flight_destinations (city, country, price_from, currency, image_url, airport_code, display_order, is_active)
        VALUES ($1, $2, $3, 'MXN', $4, $5, $6, true)
      `, [d.city, d.country, d.price, d.img, d.code, i + 1]);
    }

    console.log(`  ✅ ${flightDestinations.length} destinos de vuelos insertados\n`);

    // =========================================
    // 3. ALOJAMIENTOS FAVORITOS
    // =========================================
    console.log('🏨 Actualizando alojamientos favoritos...');

    const accommodations = [
      { name: 'Casitas Maraika', location: 'Tulum, Quintana Roo', type: 'Boutique Hotel', price: 3500, rating: 4.9, img: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600&h=400&fit=crop', desc: 'Hospedaje único en la selva maya' },
      { name: 'Casa Violeta', location: 'San Miguel de Allende, Gto', type: 'Casa Colonial', price: 2800, rating: 4.8, img: 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&h=400&fit=crop', desc: 'Arquitectura colonial restaurada' },
      { name: 'Cabañas del Bosque', location: 'Valle de Bravo, Edo Mex', type: 'Cabaña', price: 1800, rating: 4.6, img: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&h=400&fit=crop', desc: 'Escapada romántica en el bosque' }
    ];

    await client.query('DELETE FROM accommodation_favorites');

    for (let i = 0; i < accommodations.length; i++) {
      const a = accommodations[i];
      await client.query(`
        INSERT INTO accommodation_favorites (name, title, location, type, price_from, price_per_night, currency, rating, image_url, description, display_order, is_active)
        VALUES ($1, $1, $2, $3, $4, $4, 'MXN', $5, $6, $7, $8, true)
      `, [a.name, a.location, a.type, a.price, a.rating, a.img, a.desc, i + 1]);
    }

    console.log(`  ✅ ${accommodations.length} alojamientos insertados\n`);

    // =========================================
    // 4. OFERTAS DE FIN DE SEMANA
    // =========================================
    console.log('🎉 Actualizando ofertas de fin de semana...');

    const weekendDeals = [
      { name: 'Hotel Fiesta Americana', location: 'Cancún, Quintana Roo', price: 1200, rating: 4.5, discount: 25, label: 'Este fin de semana', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop', desc: 'Resort todo incluido frente al mar' },
      { name: 'Grand Velas Los Cabos', location: 'Los Cabos, BCS', price: 2500, rating: 5.0, discount: 30, label: 'Próximo fin de semana', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop', desc: 'Lujo y confort en la playa' },
      { name: 'Secrets Huatulco', location: 'Huatulco, Oaxaca', price: 1800, rating: 4.7, discount: 20, label: 'Este fin de semana', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', desc: 'Solo adultos, todo incluido' },
      { name: 'Barceló Ixtapa', location: 'Ixtapa, Guerrero', price: 1500, rating: 4.3, discount: 15, label: 'Próximo fin de semana', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop', desc: 'Frente a la playa con albercas' }
    ];

    await client.query('DELETE FROM weekend_deals');

    for (let i = 0; i < weekendDeals.length; i++) {
      const d = weekendDeals[i];
      await client.query(`
        INSERT INTO weekend_deals (name, title, location, price_per_night, currency, rating, discount_percentage, dates_label, image_url, description, display_order, is_active, valid_until)
        VALUES ($1, $1, $2, $3, 'MXN', $4, $5, $6, $7, $8, $9, true, CURRENT_TIMESTAMP + INTERVAL '30 days')
      `, [d.name, d.location, d.price, d.rating, d.discount, d.label, d.img, d.desc, i + 1]);
    }

    console.log(`  ✅ ${weekendDeals.length} ofertas insertadas\n`);

    // =========================================
    // 5. EXPLORA DESTINOS
    // =========================================
    console.log('🌍 Actualizando destinos para explorar...');

    const exploreDestinations = [
      { name: 'Cancún', city: 'Cancún', country: 'México', price: 2500, category: 'playa', hotels: 1234, img: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600&h=400&fit=crop' },
      { name: 'Ciudad de México', city: 'CDMX', country: 'México', price: 1200, category: 'ciudad', hotels: 856, img: 'https://images.unsplash.com/photo-1518659526054-190340b32735?w=600&h=400&fit=crop' },
      { name: 'Tulum', city: 'Tulum', country: 'México', price: 2800, category: 'playa', hotels: 523, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop' },
      { name: 'San Miguel de Allende', city: 'San Miguel de Allende', country: 'México', price: 1800, category: 'ciudad', hotels: 312, img: 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=600&h=400&fit=crop' },
      { name: 'Los Cabos', city: 'Los Cabos', country: 'México', price: 3500, category: 'playa', hotels: 445, img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&h=400&fit=crop' },
      { name: 'Oaxaca', city: 'Oaxaca', country: 'México', price: 1600, category: 'ciudad', hotels: 289, img: 'https://images.unsplash.com/photo-1547995886-6dc09384c6e6?w=600&h=400&fit=crop' }
    ];

    await client.query('DELETE FROM explore_destinations');

    for (let i = 0; i < exploreDestinations.length; i++) {
      const d = exploreDestinations[i];
      await client.query(`
        INSERT INTO explore_destinations (destination, destination_name, city, country, price_from, currency, category, hotels_count, image_url, display_order, is_active)
        VALUES ($1, $1, $2, $3, $4, 'MXN', $5, $6, $7, $8, true)
      `, [d.name, d.city, d.country, d.price, d.category, d.hotels, d.img, i + 1]);
    }

    console.log(`  ✅ ${exploreDestinations.length} destinos insertados\n`);

    // =========================================
    // RESUMEN
    // =========================================
    console.log('═'.repeat(50));
    console.log('✅ CONTENIDO DEL HOMEPAGE ACTUALIZADO');
    console.log('═'.repeat(50));
    console.log(`
📸 Hero: 1 imagen actualizada
✈️ Vuelos: ${flightDestinations.length} destinos
🏨 Alojamientos: ${accommodations.length} favoritos
🎉 Ofertas: ${weekendDeals.length} fin de semana
🌍 Explorar: ${exploreDestinations.length} destinos

Las imágenes ahora coincidirán entre Same Preview y Vercel.
`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

populateContent()
  .then(() => {
    console.log('🎯 Script completado exitosamente');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
  });
