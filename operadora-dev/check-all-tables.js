const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_rsdKEkaw1ZS2@ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    await client.connect();
    
    // Contar tablas
    const count = await client.query(`
      SELECT COUNT(*) as total 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    
    console.log(`\n📊 Total de tablas: ${count.rows[0].total}\n`);
    
    // Listar TODAS las tablas
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('TODAS LAS TABLAS:\n');
    tables.rows.forEach((row, i) => {
      console.log(`${(i+1).toString().padStart(3)}. ${row.table_name}`);
    });
    
    // Verificar vistas
    const views = await client.query(`
      SELECT COUNT(*) as total 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'VIEW';
    `);
    
    console.log(`\n📊 Vistas: ${views.rows[0].total}\n`);
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTables();
