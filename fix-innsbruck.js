require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

async function fetchUnsplash(query) {
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${unsplashKey}`);
    if (response.ok) {
      const data = await response.json();
      if (data?.results?.length > 0) {
        return data.results[0].urls.regular;
      }
    }
  } catch(e) {}
  return null;
}

async function run() {
  const crystalUrl = await fetchUnsplash('crystal jewelry');
  const hatUrl = await fetchUnsplash('fedora hat'); // Alpine hat might be hard to find, fedora is close enough or use the 1521369909029 URL I found
  
  const fixes = {
    "cristales swarovski": crystalUrl || "https://images.unsplash.com/photo-1599818816738-f1c503cf9704?w=800",
    "sombrero tirolés (tirolerhut)": "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800"
  };

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
      console.log(`Updated itinerary ID ${it.id} specifically for Innsbruck souvenirs!`);
    }
  }
  pool.end();
}

run();
