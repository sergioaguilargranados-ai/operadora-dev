# Script PowerShell para crear archivos faltantes
# Ejecutar en PowerShell desde la carpeta expedia-clone

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Creando archivos faltantes..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# 1. Crear carpeta public si no existe
if (-Not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" -Force
    Write-Host "[OK] Carpeta 'public' creada" -ForegroundColor Green
} else {
    Write-Host "[OK] Carpeta 'public' ya existe" -ForegroundColor Yellow
}

# 2. Crear server.js si no existe
if (-Not (Test-Path "server.js")) {
    @"
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Crear app Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parsear la URL
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log('> AS Operadora - Ready on http://' + hostname + ':' + port)
      console.log('> Environment: ' + process.env.NODE_ENV)
    })
})
"@ | Out-File -FilePath "server.js" -Encoding utf8
    Write-Host "[OK] Archivo 'server.js' creado" -ForegroundColor Green
} else {
    Write-Host "[OK] Archivo 'server.js' ya existe" -ForegroundColor Yellow
}

# 3. Crear public/robots.txt si no existe
if (-Not (Test-Path "public/robots.txt")) {
    @"
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Sitemap: https://tudominio.com/sitemap.xml
"@ | Out-File -FilePath "public/robots.txt" -Encoding utf8
    Write-Host "[OK] Archivo 'public/robots.txt' creado" -ForegroundColor Green
} else {
    Write-Host "[OK] Archivo 'public/robots.txt' ya existe" -ForegroundColor Yellow
}

# 4. Crear .env.local si no existe (con plantilla)
if (-Not (Test-Path ".env.local")) {
    @"
DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/TU_BASE_DATOS"
JWT_SECRET="clave_super_secreta_aleatoria_CAMBIAR_EN_PRODUCCION"
NEXT_PUBLIC_API_URL="https://tudominio.com"
NODE_ENV="production"
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "[OK] Archivo '.env.local' creado - RECUERDA EDITARLO CON TUS DATOS REALES" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: Abre .env.local y cambia:" -ForegroundColor Red
    Write-Host "  - TU_USUARIO" -ForegroundColor Red
    Write-Host "  - TU_PASSWORD" -ForegroundColor Red
    Write-Host "  - TU_BASE_DATOS" -ForegroundColor Red
    Write-Host "  - tudominio.com" -ForegroundColor Red
} else {
    Write-Host "[OK] Archivo '.env.local' ya existe" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Proceso completado!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguientes pasos:" -ForegroundColor Yellow
Write-Host "1. Edita .env.local con tus datos reales" -ForegroundColor White
Write-Host "2. Ejecuta: npm run build" -ForegroundColor White
Write-Host "3. Comprime y sube a cPanel" -ForegroundColor White
Write-Host ""
