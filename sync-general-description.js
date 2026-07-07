require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function sync() {
  const destRes = await pool.query("SELECT destination_key, city, country, general_description, travel_tips FROM destination_content");
  const destMap = {};
  for (const row of destRes.rows) {
    if (row.destination_key) {
      destMap[row.destination_key] = row;
    }
  }

  const itRes = await pool.query("SELECT id, days FROM itineraries");
  
  for (const it of itRes.rows) {
    if (!it.days || !Array.isArray(it.days)) continue;
    
    let updated = false;
    const newDays = it.days.map(day => {
      if (day.destination_content_key && destMap[day.destination_content_key]) {
        if (!day.general_description || !day.travel_tips) {
          updated = true;
          return {
            ...day,
            general_description: day.general_description || destMap[day.destination_content_key].general_description,
            travel_tips: day.travel_tips || destMap[day.destination_content_key].travel_tips
          };
        }
      }
      return day;
    });
    
    if (updated) {
      console.log(`Updating itinerary ID ${it.id}...`);
      await pool.query("UPDATE itineraries SET days = $1 WHERE id = $2", [JSON.stringify(newDays), it.id]);
    }
  }
  
  console.log("Done syncing general descriptions!");
  pool.end();
}

sync();
