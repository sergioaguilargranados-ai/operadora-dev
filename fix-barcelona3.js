require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const fixes = {
  "caganer": "https://upload.wikimedia.org/wikipedia/commons/1/11/Caganer_front.png",
  "porrón": "https://upload.wikimedia.org/wikipedia/commons/7/78/Porr%C3%B3nCristal08.jpg",
  "espadrilles (alpargatas)": "https://upload.wikimedia.org/wikipedia/commons/3/31/Espardenyes.jpg",
  "objetos inspirados en gaudí": "https://upload.wikimedia.org/wikipedia/commons/d/da/Reptil_Parc_Guell_Barcelona.jpg",
  "trencadís": "https://upload.wikimedia.org/wikipedia/commons/d/da/Reptil_Parc_Guell_Barcelona.jpg",
  "alpargatas (espardenyes)": "https://upload.wikimedia.org/wikipedia/commons/3/31/Espardenyes.jpg",
  "artículos de gaudí (trencadís)": "https://upload.wikimedia.org/wikipedia/commons/d/da/Reptil_Parc_Guell_Barcelona.jpg"
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
      console.log(`Updated itinerary ID ${it.id} with PERFECT Wikipedia images!`);
    }
  }
  pool.end();
}

run();
