import { config } from 'dotenv';
config({path: '.env.local'});
import { pool } from './src/lib/db';
pool.query('SELECT * FROM messages ORDER BY id DESC LIMIT 5').then(res => {
  console.log(JSON.stringify(res.rows, null, 2));
}).catch(console.error).finally(()=>process.exit(0));
