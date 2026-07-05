require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getForecast(city, dateStr) {
  const normalizedCity = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  
  let res = await pool.query(
    "SELECT * FROM weather_forecasts WHERE city ILIKE $1 AND date = $2",
    [city, dateStr]
  )
  
  if (res.rows.length === 0 && normalizedCity !== city) {
    res = await pool.query(
      "SELECT * FROM weather_forecasts WHERE city ILIKE $1 AND date = $2",
      [normalizedCity, dateStr]
    )
  }
  
  if (res.rows.length === 0) {
    res = await pool.query(
      "SELECT * FROM weather_forecasts WHERE $1 ILIKE '%' || city || '%' ORDER BY date ASC LIMIT 1",
      [normalizedCity]
    )
  }
  
  if (res.rows.length === 0) {
    res = await pool.query(
      "SELECT * FROM weather_forecasts WHERE city ILIKE $1 ORDER BY date ASC LIMIT 1",
      [normalizedCity]
    )
  }
  return res.rows[0] || null
}

async function run() {
  const f = await getForecast("Palacio Real de Madrid", "2026-07-29");
  console.log("Forecast:", f);
  pool.end();
}
run();
