require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';
const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

async function fetchUnsplash(query) {
  if (!unsplashKey) return FALLBACK_IMAGE;
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${unsplashKey}`);
    if (response.ok) {
      const data = await response.json();
      if (data?.results?.length > 0) {
        return data.results[0].urls.regular;
      }
    }
  } catch(e) {}
  return FALLBACK_IMAGE;
}

async function run() {
  const itRes = await pool.query("SELECT id, days FROM itineraries WHERE id IN (3, 4)");
  
  for (const it of itRes.rows) {
    if (!it.days) continue;
    let updated = false;
    
    const newDays = [];
    for (const day of it.days) {
      if (!day.title) {
        newDays.push(day);
        continue;
      }
      
      const newDay = { ...day };
      
      const fixItems = async (items, typeName) => {
        if (!items) return items;
        const fixed = [];
        for (const item of items) {
          if (!item.img || item.img === FALLBACK_IMAGE || item.img.includes('undefined')) {
            console.log(`Fixing ${typeName} in ${day.title}: ${item.name}`);
            const newImg = await fetchUnsplash(`${item.name} food landmark`);
            if (newImg !== FALLBACK_IMAGE && newImg !== item.img) {
              fixed.push({ ...item, img: newImg });
              updated = true;
              console.log(` -> ${newImg}`);
            } else {
              fixed.push({ ...item, img: FALLBACK_IMAGE });
            }
          } else {
            fixed.push(item);
          }
        }
        return fixed;
      };
      
      newDay.foods = await fixItems(day.foods, 'Food');
      newDay.places = await fixItems(day.places, 'Place');
      newDay.souvenirs = await fixItems(day.souvenirs, 'Souvenir');
      
      newDays.push(newDay);
    }
    
    if (updated) {
      await pool.query("UPDATE itineraries SET days = $1 WHERE id = $2", [JSON.stringify(newDays), it.id]);
      console.log(`Itinerary ${it.id} completely AUTO-FIXED!`);
    }
  }
  pool.end();
}

run();
