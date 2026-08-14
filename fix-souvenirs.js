require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function searchWikipediaImage(searchQuery, lang = 'es') {
  try {
    const searchRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=&format=json`);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData?.query?.search?.length > 0) {
        const title = searchData.query.search[0].title;
        const imgRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`);
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const pages = imgData?.query?.pages;
          if (pages) {
            const pageId = Object.keys(pages)[0];
            if (pages[pageId]?.original?.source) {
              return pages[pageId].original.source;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error(`Wikipedia ${lang} error:`, e.message);
  }
  return null;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';

async function run() {
  const destRes = await pool.query("SELECT id, city, souvenirs FROM destination_content");
  
  for (const row of destRes.rows) {
    if (!row.souvenirs || row.souvenirs.length === 0) continue;
    
    let updated = false;
    const newSouvenirs = [];
    
    for (const souv of row.souvenirs) {
      console.log(`Searching wiki for souvenir: ${souv.name}`);
      // 1. Try exact name in Spanish Wikipedia
      let img = await searchWikipediaImage(souv.name, 'es');
      
      // 2. Try exact name in English Wikipedia
      if (!img) {
        img = await searchWikipediaImage(souv.name, 'en');
      }
      
      // 3. Try name + souvenir
      if (!img) {
        img = await searchWikipediaImage(souv.name + " souvenir", 'en');
      }
      
      if (img) {
        if (souv.img !== img) {
          updated = true;
          newSouvenirs.push({ ...souv, img });
          console.log(`✅ Found on Wiki: ${img}`);
        } else {
          newSouvenirs.push(souv);
        }
      } else {
        // Fallback or keep current if it's not the yellow van
        console.log(`❌ Not found on Wiki for ${souv.name}. Keeping current.`);
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
  
  console.log("Done fixing souvenirs!");
  pool.end();
}

run();
