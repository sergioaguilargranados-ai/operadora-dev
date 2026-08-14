require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';

async function checkUrl(url) {
  if (url === FALLBACK_IMAGE) return 'FALLBACK';
  try {
    const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.status >= 400 && res.status !== 403 && res.status !== 429) { 
      // 403/429 usually means valid but blocked bot
      return `BROKEN (${res.status})`;
    }
    return 'OK';
  } catch (e) {
    return 'ERROR';
  }
}

async function run() {
  const itRes = await pool.query("SELECT id, days FROM itineraries WHERE id IN (3, 4)");
  
  for (const it of itRes.rows) {
    if (!it.days) continue;
    console.log(`\n=== ITINERARY ${it.id} ===`);
    
    for (const day of it.days) {
      if (!day.title) continue;
      
      const checkItems = async (items, type) => {
        if (!items) return;
        for (const item of items) {
          const status = await checkUrl(item.img);
          if (status !== 'OK') {
            console.log(`[${type}] ${day.title} | ${item.name} | Status: ${status} | URL: ${item.img}`);
          }
        }
      };
      
      await checkItems(day.foods, 'Food');
      await checkItems(day.places, 'Place');
      await checkItems(day.souvenirs, 'Souvenir');
    }
  }
  pool.end();
}

run();
