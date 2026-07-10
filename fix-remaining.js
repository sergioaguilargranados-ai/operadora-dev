require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const fixes = {
  "pan con tomate (pa amb tomàquet)": "https://images.unsplash.com/photo-1602493701683-cdb387086ec3?w=800",
  "bocadillo de calamares": "https://images.unsplash.com/photo-1639667911189-700bd2029f5b?w=800",
  "pa amb tomàquet (pan con tomate)": "https://images.unsplash.com/photo-1602493701683-cdb387086ec3?w=800"
};

async function run() {
  const itRes = await pool.query("SELECT id, days FROM itineraries");
  for (const it of itRes.rows) {
    if (!it.days || !Array.isArray(it.days)) continue;
    let updated = false;
    const newDays = it.days.map(day => {
      if (day.foods) {
        const newFoods = day.foods.map(f => {
          const nameLower = f.name.toLowerCase();
          if (fixes[nameLower]) {
            updated = true;
            return { ...f, img: fixes[nameLower] };
          }
          return f;
        });
        return { ...day, foods: newFoods };
      }
      return day;
    });
    
    if (updated) {
      await pool.query("UPDATE itineraries SET days = $1 WHERE id = $2", [JSON.stringify(newDays), it.id]);
      console.log(`Updated itinerary ID ${it.id} specifically for remaining broken!`);
    }
  }
  pool.end();
}

run();
