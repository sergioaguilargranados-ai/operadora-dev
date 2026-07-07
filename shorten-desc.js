require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function shortenText(text) {
  if (!text) return text;
  // Split by periods followed by space
  const sentences = text.split(/\.\s+/);
  if (sentences.length <= 2) return text;
  // Keep first two sentences and add a period at the end if needed
  return sentences.slice(0, 2).join('. ') + (sentences[1].endsWith('.') ? '' : '.');
}

async function run() {
  // Update destination_content
  const destRes = await pool.query("SELECT id, general_description FROM destination_content");
  for (const row of destRes.rows) {
    if (row.general_description) {
      const short = shortenText(row.general_description);
      if (short !== row.general_description) {
        await pool.query("UPDATE destination_content SET general_description = $1 WHERE id = $2", [short, row.id]);
      }
    }
  }

  // Update itineraries
  const itRes = await pool.query("SELECT id, days FROM itineraries");
  for (const it of itRes.rows) {
    if (!it.days || !Array.isArray(it.days)) continue;
    let updated = false;
    const newDays = it.days.map(day => {
      if (day.general_description) {
        const short = shortenText(day.general_description);
        if (short !== day.general_description) {
          updated = true;
          return { ...day, general_description: short };
        }
      }
      return day;
    });
    if (updated) {
      await pool.query("UPDATE itineraries SET days = $1 WHERE id = $2", [JSON.stringify(newDays), it.id]);
      console.log(`Updated itinerary ID ${it.id}`);
    }
  }
  
  console.log("Done shortening descriptions!");
  pool.end();
}

run();
