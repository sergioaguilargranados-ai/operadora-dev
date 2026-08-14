const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'app', 'mobile');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Reemplazos de Tailwind y fijos
            content = content.replace(/text-blue-600/g, "text-brand-primary");
            content = content.replace(/bg-blue-600/g, "bg-brand-primary");
            content = content.replace(/border-blue-600/g, "border-brand-primary");
            content = content.replace(/fill-blue-600/g, "fill-brand-primary");
            content = content.replace(/hover:text-blue-700/g, "hover:text-brand-primary-hover");
            content = content.replace(/text-\[\#0066FF\]/g, "text-brand-primary");
            content = content.replace(/bg-\[\#0066FF\]/g, "bg-brand-primary");
            content = content.replace(/border-\[\#0066FF\]/g, "border-brand-primary");
            content = content.replace(/focus:border-\[\#0066FF\]/g, "focus:border-brand-primary");
            
            // Mapas específicos o inline styles
            content = content.replace(/strokeColor:\s*'#0066FF'/g, "strokeColor: primaryColor || '#0066FF'");
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDir(targetDir);
