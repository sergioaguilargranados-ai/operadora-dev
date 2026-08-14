require('dotenv').config({path: '.env.local'});
const db = require('./src/lib/db');
db.query('SELECT * FROM messages ORDER BY id DESC LIMIT 1').then(res => console.log(res.rows)).catch(console.error).finally(()=>process.exit(0));
