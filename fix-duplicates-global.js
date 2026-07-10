require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

async function fetchUnsplash(query) {
  if (!unsplashKey) return null;
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${unsplashKey}`);
    if (response.ok) {
      const data = await response.json();
      if (data?.results?.length > 0) {
        return data.results[0].urls.regular;
      }
    }
  } catch(e) {}
  return null;
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
      
      const fixDuplicates = async (items, typeName) => {
        if (!items) return items;
        const fixed = [];
        const seenUrls = new Set();
        
        for (const item of items) {
          if (seenUrls.has(item.img)) {
            console.log(`Duplicate ${typeName} in ${day.title}: ${item.name} (URL: ${item.img})`);
            const newImg = await fetchUnsplash(`${item.name} ${typeName}`);
            if (newImg && newImg !== item.img) {
              fixed.push({ ...item, img: newImg });
              seenUrls.add(newImg);
              updated = true;
              console.log(` -> Replaced with: ${newImg}`);
            } else {
              fixed.push(item);
            }
          } else {
            seenUrls.add(item.img);
            fixed.push(item);
          }
        }
        return fixed;
      };
      
      newDay.foods = await fixDuplicates(day.foods, 'food');
      newDay.places = await fixDuplicates(day.places, 'landmark');
      newDay.souvenirs = await fixDuplicates(day.souvenirs, 'souvenir');
      
      newDays.push(newDay);
    }
    
    if (updated) {
      await pool.query("UPDATE itineraries SET days = $1 WHERE id = $2", [JSON.stringify(newDays), it.id]);
      console.log(`Itinerary ${it.id} completely DUPLICATE-FIXED!`);
    }
  }
  pool.end();
}

run();
