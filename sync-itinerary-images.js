require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';

async function syncItineraries() {
  // Get all destination content to use as a dictionary
  const destRes = await pool.query("SELECT city, foods, places, souvenirs FROM destination_content");
  const destMap = {};
  for (const row of destRes.rows) {
    destMap[row.city.toLowerCase()] = {
      foods: row.foods || [],
      places: row.places || [],
      souvenirs: row.souvenirs || []
    };
  }

  // Get all itineraries
  const itRes = await pool.query("SELECT id, days FROM itineraries");
  
  for (const it of itRes.rows) {
    if (!it.days || !Array.isArray(it.days)) continue;
    
    let updated = false;
    const newDays = it.days.map(day => {
      if (!day.title) return day;
      
      // Parse cities from title, e.g. "BARCELONA - NIZA"
      // We check all cities to find matching content
      const citiesInTitle = day.title.toLowerCase().split(/[-,\s]+/).filter(c => c.length > 2);
      
      const updateItems = (items, type) => {
        if (!items) return items;
        return items.map(item => {
          if (item.img === FALLBACK_IMAGE) {
            // Find this item in any of the destination contents
            for (const city of citiesInTitle) {
              if (destMap[city] && destMap[city][type]) {
                const found = destMap[city][type].find(x => x.name.toLowerCase() === item.name.toLowerCase());
                if (found && found.img !== FALLBACK_IMAGE) {
                  updated = true;
                  return { ...item, img: found.img };
                }
              }
            }
          }
          return item;
        });
      };
      
      const newFoods = updateItems(day.foods, 'foods');
      const newPlaces = updateItems(day.places, 'places');
      const newSouvenirs = updateItems(day.souvenirs, 'souvenirs');
      
      return { ...day, foods: newFoods, places: newPlaces, souvenirs: newSouvenirs };
    });
    
    if (updated) {
      console.log(`Updating itinerary ID ${it.id}...`);
      await pool.query("UPDATE itineraries SET days = $1 WHERE id = $2", [JSON.stringify(newDays), it.id]);
    }
  }
  
  console.log("Done syncing itineraries!");
  pool.end();
}

syncItineraries();
