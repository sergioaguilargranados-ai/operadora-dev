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

const customFixes = {
  "bocadillo de calamares": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bocata_calamares.jpg/800px-Bocata_calamares.jpg",
  "pan con tomate (pa amb tomàquet)": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pa_amb_tom%C3%A0quet.jpg/800px-Pa_amb_tom%C3%A0quet.jpg",
  "fideuà": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Fideu%C3%A0_-_Gandia_2.jpg/800px-Fideu%C3%A0_-_Gandia_2.jpg"
};

async function run() {
  const itRes = await pool.query("SELECT id, days FROM itineraries WHERE id = 4 OR id = 3");
  for (const it of itRes.rows) {
    if (!it.days) continue;
    let updated = false;
    
    const newDays = [];
    for (const day of it.days) {
      if (day.title && day.title.includes('BARCELONA')) {
        const newDay = { ...day };
        
        // Fix foods
        if (newDay.foods) {
          const newFoods = [];
          for (const f of newDay.foods) {
            let img = customFixes[f.name.toLowerCase()];
            if (!img) img = await searchWikipediaImage(f.name, 'es');
            if (img && img !== f.img) {
              console.log(`Food: ${f.name} -> ${img}`);
              newFoods.push({ ...f, img });
              updated = true;
            } else {
              newFoods.push(f);
            }
          }
          newDay.foods = newFoods;
        }

        // Fix places
        if (newDay.places) {
          const newPlaces = [];
          for (const p of newDay.places) {
            let img = await searchWikipediaImage(p.name, 'es');
            if (img && img !== p.img) {
              console.log(`Place: ${p.name} -> ${img}`);
              newPlaces.push({ ...p, img });
              updated = true;
            } else {
              newPlaces.push(p);
            }
          }
          newDay.places = newPlaces;
        }
        
        newDays.push(newDay);
      } else {
        newDays.push(day);
      }
    }
    
    if (updated) {
      await pool.query("UPDATE itineraries SET days = $1 WHERE id = $2", [JSON.stringify(newDays), it.id]);
      console.log(`Updated itinerary ID ${it.id} with Wiki images for Barcelona!`);
    }
  }
  pool.end();
}

run();
