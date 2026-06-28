const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
let databaseUrl = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('DATABASE_URL=')) {
      databaseUrl = line.split('DATABASE_URL=')[1].trim().replace(/['"]/g, '');
      break;
    }
  }
}

if (!databaseUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Querying for MT-12019...');
    const res = await pool.query("SELECT * FROM megatravel_packages WHERE mt_code = 'MT-12019' OR mt_url LIKE '%12019%'");
    console.log('Results:', res.rows);

    console.log('\nChecking total packages count:');
    const totalRes = await pool.query("SELECT COUNT(*) FROM megatravel_packages");
    console.log('Total:', totalRes.rows[0]);

    console.log('\nChecking active packages count:');
    const activeRes = await pool.query("SELECT COUNT(*) FROM megatravel_packages WHERE is_active = true");
    console.log('Active:', activeRes.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
