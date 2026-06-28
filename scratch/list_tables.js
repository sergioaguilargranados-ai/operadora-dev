const {Pool}=require('pg');
require('dotenv').config({path:'.env.local'});
const p = new Pool({connectionString:process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}});
p.query("SELECT tablename FROM pg_tables WHERE schemaname='public'").then(res => {
    console.log(res.rows.map(r=>r.tablename).join(', '));
    p.end();
});
