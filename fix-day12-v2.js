require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getWikiImageByExactTitle(title, lang = 'es') {
  try {
    const imgRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`);
    const imgData = await imgRes.json();
    const pages = imgData?.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pages[pageId]?.original?.source) {
        return pages[pageId].original.source;
      }
    }
  } catch(e) {}
  return null;
}

async function run() {
  const chocolateImg = await getWikiImageByExactTitle('Chocolate suizo');
  const navajaImg = await getWikiImageByExactTitle('Navaja suiza');
  const cencerroImg = await getWikiImageByExactTitle('Cencerro');
  const quesoImg = await getWikiImageByExactTitle('Emmental (queso)');
  const relojImg = "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800"; // Beautiful watch from Unsplash
  
  const fixes = {
    "chocolates suizos": chocolateImg,
    "navaja suiza": navajaImg,
    "reloj suizo": relojImg,
    "cencerro suizo (glocke)": cencerroImg,
    "queso suizo": quesoImg
  };
  
  console.log("Fixes map:", fixes);

  const itRes = await pool.query("SELECT id, days FROM itineraries WHERE id IN (3,4)");
  for (const it of itRes.rows) {
    if (!it.days) continue;
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
