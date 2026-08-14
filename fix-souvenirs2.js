require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';
const pexelsKey = process.env.PEXELS_API_KEY;

async function searchPexels(query) {
  if (!pexelsKey) return null;
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: { Authorization: pexelsKey }
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.photos?.length > 0) {
        return data.photos[0].src.large || data.photos[0].src.medium;
      }
    }
  } catch (e) {
    console.error("Pexels error", e.message);
  }
  return null;
}

async function run() {
  const destRes = await pool.query("SELECT id, city, foods, places, souvenirs FROM destination_content");
  
  for (const row of destRes.rows) {
    if (!row.souvenirs || row.souvenirs.length === 0) continue;
    
    // Group images by URL to detect duplicates (hallucinated fallbacks)
    const urlCounts = {};
    for (const item of row.souvenirs) {
      urlCounts[item.img] = (urlCounts[item.img] || 0) + 1;
    }
    
    let updated = false;
    const newSouvenirs = [];
    
    for (const souv of row.souvenirs) {
      const isYellowVan = souv.img === FALLBACK_IMAGE;
      const isDuplicate = urlCounts[souv.img] > 1; // if 2 or more souvenirs share this same image, it's a generic fallback
      
      if (isYellowVan || isDuplicate) {
        console.log(`Fixing generic image for souvenir: ${souv.name} in ${row.city}`);
        
        let newImg = await searchPexels(souv.name + " " + row.city + " souvenir");
        if (!newImg) newImg = await searchPexels(souv.name);
        
        // If STILL nothing, use a generic photo of the city
        if (!newImg) newImg = await searchPexels(row.city + " souvenir market");
        
        if (newImg) {
          newSouvenirs.push({ ...souv, img: newImg });
          updated = true;
          console.log(`   -> Replaced with: ${newImg}`);
        } else {
          newSouvenirs.push(souv);
        }
      } else {
        newSouvenirs.push(souv);
      }
    }
    
    if (updated) {
      await pool.query("UPDATE destination_content SET souvenirs = $1 WHERE id = $2", [JSON.stringify(newSouvenirs), row.id]);
      console.log(`Updated destination_content for ${row.city}`);
    }
  }

  // Now sync itineraries
  const destMap = {};
  const updatedDest = await pool.query("SELECT destination_key, city, souvenirs FROM destination_content");
  for (const row of updatedDest.rows) {
    if (row.destination_key) destMap[row.destination_key] = row;
  }

  const itRes = await pool.query("SELECT id, days FROM itineraries");
  for (const it of itRes.rows) {
    if (!it.days || !Array.isArray(it.days)) continue;
    let updated = false;
    const newDays = it.days.map(day => {
      if (day.destination_content_key && destMap[day.destination_content_key]) {
        const destSouvs = destMap[day.destination_content_key].souvenirs;
        if (destSouvs && day.souvenirs) {
          const newSouvs = day.souvenirs.map(s => {
            const found = destSouvs.find(ds => ds.name === s.name);
            if (found && found.img !== s.img) {
              updated = true;
              return { ...s, img: found.img };
            }
            return s;
          });
          return { ...day, souvenirs: newSouvs };
        }
      }
      return day;
    });
    
    if (updated) {
      await pool.query("UPDATE itineraries SET days = $1 WHERE id = $2", [JSON.stringify(newDays), it.id]);
      console.log(`Updated itinerary ID ${it.id}`);
    }
  }
  
  console.log("Done fixing souvenirs part 2!");
  pool.end();
}

run();
