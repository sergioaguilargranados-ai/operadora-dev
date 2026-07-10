require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const fixes = {
  "miniaturas del coliseo/vaticano": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
  "productos de cuero italiano": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
  "objetos religiosos": "https://images.unsplash.com/photo-1601142634808-38923eb7c560?w=800",
  "productos gastronómicos": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
  "réplicas de arte romano": "https://upload.wikimedia.org/wikipedia/commons/e/eb/Statue-Augustus.jpg"
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
      console.log(`Updated itinerary ID ${it.id} specifically for Roma souvenirs!`);
    }
  }
  pool.end();
}

run();
