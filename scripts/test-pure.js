require('dotenv').config({path:'.env.local'});
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const cached = await pool.query("SELECT * FROM destination_content WHERE LOWER(city) = 'niza'");
    console.log("NIZA IN CACHE:", cached.rows.length);
    if (cached.rows.length) {
      console.log("CACHE FOODS:", cached.rows[0].foods.length);
    }
    
    // Simulate what enrichItineraryDays does for Niza:
    const day = { title: "DÍA 15 FLORENCIA – PISA – NIZA", foods: [] };
    const content = cached.rows[0];
    
    const hasValidFoods = day.foods?.length > 0 && day.foods[0]?.name && !['La mejor comida', 'comida 1'].includes(day.foods[0].name);
    
    console.log("Has valid foods:", hasValidFoods);
    console.log("Resulting foods length:", (hasValidFoods ? day.foods : content.foods).length);
    
  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}
run();
