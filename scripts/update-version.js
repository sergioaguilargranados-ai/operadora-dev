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
// Capitalizar primera letra del mes para consistencia (May, Jun, etc.)
const month = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
const year = parts.find(p => p.type === 'year').value;

// Obtener hora
let timeStr = timeFormatter.format(now);
// Algunos entornos de node pueden devolver "24:00" en lugar de "00:00"
if (timeStr.startsWith('24:')) {
  timeStr = '00:' + timeStr.substring(3);
}

const timestampStr = `${day} ${month} ${year} ${timeStr} CST`;

console.log(`🕒 Nueva fecha de compilación: ${timestampStr}`);

// Archivos a actualizar
const filesToUpdate = [
  {
    path: path.join(__dirname, '../src/components/BrandFooter.tsx'),
    regex: /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}\s+CST/g
  },
  {
    path: path.join(__dirname, '../src/app/admin/megatravel-scraping/page.tsx'),
    regex: /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}\s+CST?/g
  },
  {
    path: path.join(__dirname, '../src/app/mobile/layout.tsx'),
    regex: /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}\s+CST/g
  },
  {
    path: path.join(__dirname, '../src/app/page.tsx'),
    regex: /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}\s+CST/g
  }
];

// Find the maximum version across all files to ensure they are kept in sync
let maxFoundVersion = '';

for (const file of filesToUpdate) {
  if (fs.existsSync(file.path)) {
    let content = fs.readFileSync(file.path, 'utf8');
    
    // Check main regex
    file.regex.lastIndex = 0;
    let match = file.regex.exec(content);
    if (match && match[1]) {
      if (match[1] > maxFoundVersion) maxFoundVersion = match[1];
    } else {
      // Check lax regex
      const laxRegex = /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}(?:\s+\|\s+AS Operadora)?/g;
      laxRegex.lastIndex = 0;
      let laxMatch = laxRegex.exec(content);
      if (laxMatch && laxMatch[1]) {
         if (laxMatch[1] > maxFoundVersion) maxFoundVersion = laxMatch[1];
      }
    }
  }
}

const finalVersion = newVersion || maxFoundVersion || 'v2.000';

console.log(`🏷️  Versión a aplicar a todos los archivos: ${finalVersion}`);

let filesUpdated = 0;

for (const file of filesToUpdate) {
  if (fs.existsSync(file.path)) {
    let content = fs.readFileSync(file.path, 'utf8');
    
    const replacement = `${finalVersion} | ${timestampStr}`;
    
    // Intentar reemplazar con la regex principal
    file.regex.lastIndex = 0;
    if (content.match(file.regex)) {
      const newContent = content.replace(file.regex, replacement);
      fs.writeFileSync(file.path, newContent, 'utf8');
      console.log(`✅ Actualizado: ${path.basename(file.path)} -> ${replacement}`);
      filesUpdated++;
    } else {
      // Intentar una versión más laxa si no coincide
      const laxRegex = /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}(?:\s+\|\s+AS Operadora(?: viajes y eventos)?)?/g;
      if (content.match(laxRegex)) {
        // Encontrar si tiene AS Operadora y agregarlo
        let matchStr = content.match(laxRegex)[0];
        let replacementAdmin = replacement;
        if (matchStr.includes('AS Operadora viajes y eventos')) {
            replacementAdmin += ' | AS Operadora viajes y eventos';
        } else if (matchStr.includes('AS Operadora')) {
            replacementAdmin += ' | AS Operadora';
        }
        
        const newContent = content.replace(laxRegex, replacementAdmin);
        fs.writeFileSync(file.path, newContent, 'utf8');
        console.log(`✅ Actualizado (formato laxo): ${path.basename(file.path)} -> ${replacementAdmin}`);
        filesUpdated++;
      } else {
        console.log(`❌ No se encontró el patrón de versión en: ${path.basename(file.path)}`);
      }
    }
  } else {
    console.log(`⚠️  Archivo no encontrado: ${file.path}`);
  }
}

console.log(`\n🎉 ¡Proceso completado! ${filesUpdated} archivos actualizados.`);
