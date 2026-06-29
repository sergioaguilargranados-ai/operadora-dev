const fs = require('fs');
const path = require('path');

const dir = 'c:/operadora-dev/src/app/mobile';

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix multiline ones using regex across multiple lines
      content = content.replace(/e\.currentTarget\.src\s*=\s*['"]\/logo\.png['"]/g, 
                                "e.currentTarget.onerror = null; e.currentTarget.src = '/icons/icon-192x192.png'");
                                
      // Replace any stray double nullifications
      content = content.replace(/e\.currentTarget\.onerror = null; e\.currentTarget\.onerror = null;/g,
                                "e.currentTarget.onerror = null;");
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(dir);
console.log('Fixed onError handlers in mobile directory.');
