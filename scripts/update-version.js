const fs = require('fs');
const path = require('path');

// Obtener versión de los argumentos
const newVersion = process.argv[2];

// Formatear la fecha actual en zona horaria CST (Ciudad de México)
const dateOptions = { timeZone: 'America/Mexico_City', day: '2-digit', month: 'short', year: 'numeric' };
const timeOptions = { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: false };

const now = new Date();
const dateFormatter = new Intl.DateTimeFormat('en-GB', dateOptions);
const timeFormatter = new Intl.DateTimeFormat('en-GB', timeOptions);

// Obtener partes de la fecha
const parts = dateFormatter.formatToParts(now);
const day = parts.find(p => p.type === 'day').value;
const monthStr = parts.find(p => p.type === 'month').value;
const month = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
const year = parts.find(p => p.type === 'year').value;

let timeStr = timeFormatter.format(now);
if (timeStr.startsWith('24:')) {
  timeStr = '00:' + timeStr.substring(3);
}

const timestampStr = `${day} ${month} ${year} ${timeStr} CST`;
console.log(`🕒 Nueva fecha de compilación: ${timestampStr}`);

function walkSync(dir, filelist = []) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const filepath = path.join(dir, file);
      if (fs.statSync(filepath).isDirectory()) {
        filelist = walkSync(filepath, filelist);
      } else {
        if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
          filelist.push(filepath);
        }
      }
    });
  }
  return filelist;
}

const srcDir = path.join(__dirname, '../src');
const allFiles = walkSync(srcDir);

const versionRegexes = [
  // Formato: v2.xxx | 15 Jul 2026 10:42 CST
  /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}\s+CST/g,
  // Formato laxo: v2.xxx | 15 Jul 2026 10:42
  /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}(?!\s+CST)/g,
  // Formato footer comunicacion: v2.343 · 2026-05-07 13:00 CST
  /(v2\.\d{3}[a-z]?)\s*·\s*\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+CST/g
];

let maxFoundVersion = '';

for (const filepath of allFiles) {
  const content = fs.readFileSync(filepath, 'utf8');
  for (const regex of versionRegexes) {
    regex.lastIndex = 0;
    const match = regex.exec(content);
    if (match && match[1]) {
      if (match[1] > maxFoundVersion) maxFoundVersion = match[1];
    }
  }
}

const finalVersion = newVersion || maxFoundVersion || 'v2.000';
console.log(`🏷️  Versión a aplicar a todos los archivos: ${finalVersion}`);

let filesUpdated = 0;

for (const filepath of allFiles) {
  let content = fs.readFileSync(filepath, 'utf8');
  let hasChanges = false;
  
  // Reemplazar formato estandar
  const regex1 = /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}\s+CST/g;
  if (content.match(regex1)) {
    content = content.replace(regex1, `${finalVersion} | ${timestampStr}`);
    hasChanges = true;
  }
  
  // Reemplazar formato sin CST
  const regex2 = /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}(?!\s+CST)/g;
  if (content.match(regex2)) {
    content = content.replace(regex2, `${finalVersion} | ${timestampStr.replace(' CST', '')}`);
    hasChanges = true;
  }

  // Reemplazar formato comunicacion (· YYYY-MM-DD HH:mm CST)
  const regex3 = /(v2\.\d{3}[a-z]?)\s*·\s*\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+CST/g;
  if (content.match(regex3)) {
    const isoDate = `${year}-${String(now.getMonth()+1).padStart(2, '0')}-${day} ${timeStr} CST`;
    content = content.replace(regex3, `${finalVersion} · ${isoDate}`);
    hasChanges = true;
  }

  // Comentarios de Build al inicio de los archivos: // Build: 31 Ene 2026 - v2.254
  const buildCommentRegex = /\/\/ Build:\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}(?:\s+\d{2}:\d{2}(?:\s+CST)?)?\s*-\s*(v2\.\d{3}[a-z]?)/g;
  if (content.match(buildCommentRegex)) {
    content = content.replace(buildCommentRegex, `// Build: ${day} ${month} ${year} - ${finalVersion}`);
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Actualizado: ${filepath.replace(__dirname, '..')}`);
    filesUpdated++;
  }
}

console.log(`\n🎉 ¡Proceso completado! ${filesUpdated} archivos actualizados.`);
