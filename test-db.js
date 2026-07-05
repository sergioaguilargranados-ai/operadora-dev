require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT days FROM itineraries WHERE title ILIKE '%Europa%' LIMIT 1").then(res => console.log(JSON.stringify(res.rows[0].days[0]))).catch(console.error).finally(() => pool.end());
