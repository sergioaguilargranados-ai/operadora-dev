require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const fixes = {
  "caganer": "https://upload.wikimedia.org/wikipedia/commons/9/90/Caganer.jpg",
  "porrón": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Porron_filled_with_red_wine.jpg/800px-Porron_filled_with_red_wine.jpg",
  "espadrilles (alpargatas)": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Espadrilles_1.jpg/800px-Espadrilles_1.jpg",
  "objetos inspirados en gaudí": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Park_G%C3%BCell_-_dragon.jpg/800px-Park_G%C3%BCell_-_dragon.jpg",
  "trencadís": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Park_G%C3%BCell_-_dragon.jpg/800px-Park_G%C3%BCell_-_dragon.jpg",
  "alpargatas (espardenyes)": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Espadrilles_1.jpg/800px-Espadrilles_1.jpg",
  "artículos de gaudí (trencadís)": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Park_G%C3%BCell_-_dragon.jpg/800px-Park_G%C3%BCell_-_dragon.jpg"
};

async function run() {
  const itRes = await pool.query("SELECT id, days FROM itineraries");
  for (const it of itRes.rows) {
    if (!it.days || !Array.isArray(it.days)) continue;
    let updated = false;
    const newDays = it.days.map(day => {
      if (day.souvenirs) {
        const newSouvs = day.souvenirs.map(s => {
          const nameLower = s.name.toLowerCase();
          if (fixes[nameLower]) {
            updated = true;
            return { ...s, img: fixes[nameLower] };
          }
          return s;
        });
        return { ...day, souvenirs: newSouvs };
      }
      return day;
    });
    
    if (updated) {
      await pool.query("UPDATE itineraries SET days = $1 WHERE id = $2", [JSON.stringify(newDays), it.id]);
      console.log(`Updated itinerary ID ${it.id} for Barcelona souvenirs!`);
    }
  }
  pool.end();
}

run();
