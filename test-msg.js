const { Pool } = require('pg');
require('dotenv').config({path: '.env.local'});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'messages'")
  .then(res => console.log(res.rows))
  .catch(err => console.log(err.message))
  .finally(() => pool.end());
