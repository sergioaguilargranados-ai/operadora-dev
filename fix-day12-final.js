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
  const chocolate = await fetchUnsplash('swiss chocolate');
  const cowbell = await fetchUnsplash('cowbell');
  const cheese = await fetchUnsplash('swiss cheese');
  const knife = await fetchUnsplash('swiss army knife');
  
  const fixes = {
    "chocolates suizos": chocolate || "https://images.unsplash.com/photo-1548882583-b9df7413d719?w=800",
    "cencerro suizo (glocke)": cowbell || "https://images.unsplash.com/photo-1528646194783-c0529d84cbfd?w=800",
    "queso suizo": cheese || "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800",
    "navaja suiza": knife
  };
  
  console.log("Applying final fixes:", fixes);

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
      console.log(`Updated itinerary ID ${it.id} for EXACT Day 12 souvenirs!`);
    }
  }
  pool.end();
}

run();
