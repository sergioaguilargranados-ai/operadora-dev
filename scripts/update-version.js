const fs = require('fs');
const path = require('path');

// Obtener versión de los argumentos o usar la actual (buscarla en los archivos)
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
if (newVersion) {
  console.log(`🏷️  Nueva versión especificada: ${newVersion}`);
}

// Archivos a actualizar
const filesToUpdate = [
  {
    path: path.join(__dirname, '../src/components/BrandFooter.tsx'),
    regex: /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}\s+CST/g
  },
  {
    path: path.join(__dirname, '../src/app/admin/megatravel-scraping/page.tsx'),
    regex: /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}\s+CST?/g
  }
];

let filesUpdated = 0;

for (const file of filesToUpdate) {
  if (fs.existsSync(file.path)) {
    let content = fs.readFileSync(file.path, 'utf8');
    let matchFound = false;

    // Buscar la versión actual en el archivo si no se proporcionó una nueva
    let currentVersion = newVersion;
    if (!currentVersion) {
      // Intentar primero con la regex principal
      file.regex.lastIndex = 0;
      let match = file.regex.exec(content);
      if (match && match[1]) {
        currentVersion = match[1];
      } else {
        // Intentar con la regex laxa
        const laxRegex = /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}(?:\s+\|\s+AS Operadora)?/g;
        laxRegex.lastIndex = 0;
        let laxMatch = laxRegex.exec(content);
        if (laxMatch && laxMatch[1]) {
           currentVersion = laxMatch[1];
        } else {
           currentVersion = 'v2.000'; // Fallback
        }
      }
      file.regex.lastIndex = 0;
    }

    const replacement = `${currentVersion} | ${timestampStr}`;
    
    // Solo actualizar si hay un match en la principal
    if (content.match(file.regex)) {
      const newContent = content.replace(file.regex, replacement);
      fs.writeFileSync(file.path, newContent, 'utf8');
      console.log(`✅ Actualizado: ${path.basename(file.path)} -> ${replacement}`);
      filesUpdated++;
    } else {
      // Intentar una versión más laxa para el panel de admin si no coincide el CST
      const laxRegex = /(v2\.\d{3}[a-z]?)\s*\|\s*\d{2}\s+[a-zA-Z]{3}\s+\d{4}\s+\d{2}:\d{2}(?:\s+\|\s+AS Operadora)?/g;
      if (content.match(laxRegex)) {
        const replacementAdmin = `${currentVersion} | ${timestampStr} | AS Operadora`;
        const newContent = content.replace(laxRegex, replacementAdmin);
        fs.writeFileSync(file.path, newContent, 'utf8');
        console.log(`✅ Actualizado (lax): ${path.basename(file.path)} -> ${replacementAdmin}`);
        filesUpdated++;
      } else {
        console.log(`⚠️ No se encontró el patrón en: ${path.basename(file.path)}`);
      }
    }
  } else {
    console.log(`❌ Archivo no encontrado: ${file.path}`);
  }
}

if (filesUpdated > 0) {
  console.log(`\n🎉 ¡Proceso completado! ${filesUpdated} archivos actualizados.`);
} else {
  console.log(`\n⚠️ No se actualizó ningún archivo. Verifica los formatos.`);
}
