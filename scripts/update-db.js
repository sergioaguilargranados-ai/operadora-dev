const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const res = await pool.query(`
      UPDATE expo_landing_content 
      SET 
        hero_title = 'Viajes y eventos diseñados para inspirar, conectar y crecer.',
        hero_subtitle = 'Soluciones para viajeros, agencias de viajes, agencias de eventos y empresas con atención personalizada y experiencias memorables en cada destino.',
        hero_video_url = '/inicio/WhatsApp_Image_2026-06-12_at_11.15.55_AM.jpeg'
    `);
    console.log('Update result:', res.rowCount);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
