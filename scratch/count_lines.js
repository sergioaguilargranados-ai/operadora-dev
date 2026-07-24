const fs = require('fs');
const path = require('path');

function countLines(dir, extensions = ['.ts', '.tsx', '.js', '.jsx', '.css']) {
    let fileCount = 0;
    let lineCount = 0;

    function walk(currentDir) {
        if (currentDir.includes('node_modules') || currentDir.includes('.next') || currentDir.includes('.git') || currentDir.includes('dist') || currentDir.includes('.expo')) {
            return;
        }
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
            const fullPath = path.join(currentDir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                walk(fullPath);
            } else {
                const ext = path.extname(file).toLowerCase();
                if (extensions.includes(ext) && !file.endsWith('.backup') && !file.endsWith('.backup-portal') && !file.endsWith('.d.ts')) {
                    fileCount++;
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const lines = content.split('\n').length;
                    lineCount += lines;
                }
            }
        }
    }

    if (fs.existsSync(dir)) {
        walk(dir);
    }
    return { fileCount, lineCount };
}

console.log("=== ANÁLISIS DE LÍNEAS DE CÓDIGO ===");

// 1. Landing (We can look at specific folders or main files, or we can count src/app general pages)
// Let's run count on specific folders to give a breakdown.
const subDirsApp = fs.readdirSync('src/app').filter(f => fs.statSync(path.join('src/app', f)).isDirectory());

console.log("\n--- Carpetas en src/app ---");
for (const sub of subDirsApp) {
    const stats = countLines(path.join('src/app', sub));
    if (stats.fileCount > 0) {
        console.log(`${sub}: ${stats.fileCount} archivos, ${stats.lineCount} líneas`);
    }
}

console.log("\n--- Resumen por Módulos ---");
// Let's group components and services too
console.log("src/components:", countLines('src/components'));
console.log("src/services:", countLines('src/services'));
console.log("src/contexts:", countLines('src/contexts'));
console.log("src/app (completo):", countLines('src/app'));
console.log("operadora-mobile (completo):", countLines('operadora-mobile'));
