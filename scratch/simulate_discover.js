const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
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

const content = fs.readFileSync('C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\ad8932a9-f9c9-4240-a53d-15ddd414f4b0\\.system_generated\\steps\\532\\content.md', 'utf8');
const $ = cheerio.load(content);

async function run() {
  try {
    const discoveredTours = new Map();

    // 1. Método clásico: Buscar links a tours individuales en tags <a>
    $('a[href*="/viaje/"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href && href.includes('.html')) {
            const url = href.startsWith('http') ? href : `https://www.megatravel.com.mx${href}`;
            const codeMatch = url.match(/\/viaje\/.*-(\d+)\.html/);
            const mtCodeStr = codeMatch ? codeMatch[1] : null;
            if (mtCodeStr) {
                const nameMatch = url.match(/\/viaje\/(.+)-\d+\.html/);
                const name = nameMatch
                    ? nameMatch[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                    : 'Tour sin nombre';
                discoveredTours.set(mtCodeStr, {
                    mt_code: `MT-${mtCodeStr}`,
                    mt_url: url,
                    name
                });
            }
        }
    });

    // 2. Método moderno: Buscar tours en el payload serializado de Next.js
    const searchStrings = ['\\\"mt\\\":\\\"', '"mt":"'];
    for (const searchStr of searchStrings) {
        let pos = content.indexOf(searchStr);
        while (pos !== -1) {
            const startBrace = content.lastIndexOf('{', pos);
            const endBrace = content.indexOf('}', pos);
            
            if (startBrace !== -1 && endBrace !== -1 && startBrace < endBrace) {
                const rawObj = content.substring(startBrace, endBrace + 1);
                let parsedMt = null;
                let parsedSlug = null;
                let parsedName = null;

                try {
                    const cleanJson = rawObj
                        .replace(/\\"/g, '"')
                        .replace(/\\\//g, '/')
                        .replace(/\\n/g, ' ')
                        .replace(/\\t/g, ' ');
                    
                    const parsed = JSON.parse(cleanJson);
                    if (parsed.mt && parsed.slug) {
                        parsedMt = parsed.mt.toString();
                        parsedSlug = parsed.slug;
                        parsedName = parsed.name ? parsed.name.replace(/\.$/, '') : null;
                    }
                } catch (e) {
                    const mtMatch = rawObj.match(/(?:\\"mt\\":\\"|"mt":")(\d+)/);
                    const slugMatch = rawObj.match(/(?:\\"slug\\":\\"|"slug":")([a-zA-Z0-9-]+)/);
                    const nameMatch = rawObj.match(/(?:\\"name\\":\\"|"name\\":\s*\\"|\\"name\\":\s*\\"|"name":")([^\\"]+)/);
                    if (mtMatch && slugMatch) {
                        parsedMt = mtMatch[1];
                        parsedSlug = slugMatch[1];
                        if (nameMatch) parsedName = nameMatch[1].replace(/\.$/, '');
                    }
                }

                if (parsedMt && parsedSlug) {
                    const url = `https://www.megatravel.com.mx/viaje/${parsedSlug}-${parsedMt}.html`;
                    const name = parsedName || parsedSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    discoveredTours.set(parsedMt, {
                        mt_code: `MT-${parsedMt}`,
                        mt_url: url,
                        name
                    });
                }
            }
            pos = content.indexOf(searchStr, pos + 1);
        }
    }

    console.log(`Discovered ${discoveredTours.size} tours.`);

    // Let's test the database upsert for MT-12019
    const target = '12019';
    if (discoveredTours.has(target)) {
      const tourData = discoveredTours.get(target);
      console.log('Re-syncing MT-12019 details:', tourData);
      
      const mtCode = tourData.mt_code;
      const url = tourData.mt_url;
      const name = tourData.name;
      const category = 'Europa';

      const existing = await pool.query(
          'SELECT id, is_active, sync_status FROM megatravel_packages WHERE mt_code = $1',
          [mtCode]
      );
      
      console.log('Before upsert status:', existing.rows[0]);

      if (existing.rows.length === 0) {
          await pool.query(
              `INSERT INTO megatravel_packages (mt_code, mt_url, name, category, destination_region, is_active, sync_status, created_at, updated_at, last_sync_at)
               VALUES ($1, $2, $3, $4, $5, true, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [mtCode, url, name, category, category]
          );
          console.log('Inserted new tour');
      } else {
          await pool.query(
              `UPDATE megatravel_packages 
               SET mt_url = $1, category = $2, destination_region = $3, is_active = true, 
                   sync_status = 'synced', sync_error = NULL, 
                   updated_at = CURRENT_TIMESTAMP, last_sync_at = CURRENT_TIMESTAMP
               WHERE mt_code = $4`,
              [url, category, category, mtCode]
          );
          console.log('Updated existing tour to active');
      }

      const after = await pool.query(
          'SELECT id, is_active, sync_status, sync_error FROM megatravel_packages WHERE mt_code = $1',
          [mtCode]
      );
      console.log('After upsert status:', after.rows[0]);
    } else {
      console.error('MT-12019 was NOT found in discovered tours map!');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
