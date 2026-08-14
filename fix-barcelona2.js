require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const pexelsKey = process.env.PEXELS_API_KEY;

async function searchPexels(query) {
  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
    headers: { Authorization: pexelsKey }
  });
  const data = await res.json();
  if (data?.photos?.length > 0) {
    return data.photos[0].src.large;
  }
  return null;
}

const fixQueries = {
  "caganer": "souvenir shop barcelona",
  "porrón": "wine pouring glass",
  "espadrilles (alpargatas)": "espadrilles shoes",
  "objetos inspirados en gaudí": "gaudi mosaic barcelona",
  "trencadís": "gaudi mosaic barcelona",
  "alpargatas (espardenyes)": "espadrilles shoes",
  "artículos de gaudí (trencadís)": "gaudi mosaic barcelona"
};

async function run() {
  const fixes = {};
  for (const [key, query] of Object.entries(fixQueries)) {
    fixes[key] = await searchPexels(query);
    console.log(`Found for ${key}: ${fixes[key]}`);
  }

  const itRes = await pool.query("SELECT id, days FROM itineraries");
  for (const it of itRes.rows) {
    if (!it.days || !Array.isArray(it.days)) continue;
    let updated = false;
    const newDays = it.days.map(day => {
      if (day.souvenirs) {
        const newSouvs = day.souvenirs.map(s => {
          const nameLower = s.name.toLowerCase();
          if (fixes[nameLower] && fixes[nameLower] !== s.img) {
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
