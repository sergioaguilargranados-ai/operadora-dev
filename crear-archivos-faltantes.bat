@echo off
echo ==================================
echo Creando archivos faltantes...
echo ==================================
echo.

REM 1. Crear carpeta public
if not exist "public" (
    mkdir public
    echo [OK] Carpeta 'public' creada
) else (
    echo [OK] Carpeta 'public' ya existe
)

REM 2. Crear server.js
if not exist "server.js" (
    (
    echo const { createServer } = require('http'^)
    echo const { parse } = require('url'^)
    echo const next = require('next'^)
    echo.
    echo const dev = process.env.NODE_ENV !== 'production'
    echo const hostname = 'localhost'
    echo const port = process.env.PORT ^|^| 3000
    echo.
    echo const app = next({ dev, hostname, port }^)
    echo const handle = app.getRequestHandler(^)
    echo.
    echo app.prepare(^).then(^(^) =^> {
    echo   createServer(async (req, res^) =^> {
    echo     try {
    echo       const parsedUrl = parse(req.url, true^)
    echo       await handle(req, res, parsedUrl^)
    echo     } catch (err^) {
    echo       console.error('Error occurred handling', req.url, err^)
    echo       res.statusCode = 500
    echo       res.end('internal server error'^)
    echo     }
    echo   }^)
    echo     .once('error', (err^) =^> {
    echo       console.error(err^)
    echo       process.exit(1^)
    echo     }^)
    echo     .listen(port, (^) =^> {
    echo       console.log('AS Operadora Ready on http://' + hostname + ':' + port^)
    echo     }^)
    echo }^)
    ) > server.js
    echo [OK] Archivo 'server.js' creado
) else (
    echo [OK] Archivo 'server.js' ya existe
)

REM 3. Crear public/robots.txt
if not exist "public\robots.txt" (
    (
    echo # https://www.robotstxt.org/robotstxt.html
    echo User-agent: *
    echo Allow: /
    echo Sitemap: https://tudominio.com/sitemap.xml
    ) > public\robots.txt
    echo [OK] Archivo 'public/robots.txt' creado
) else (
    echo [OK] Archivo 'public/robots.txt' ya existe
)

REM 4. Crear .env.local plantilla
if not exist ".env.local" (
    (
    echo DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/TU_BASE_DATOS"
    echo JWT_SECRET="clave_super_secreta_aleatoria_CAMBIAR"
    echo NEXT_PUBLIC_API_URL="https://tudominio.com"
    echo NODE_ENV="production"
    ) > .env.local
    echo [OK] Archivo '.env.local' creado
    echo.
    echo IMPORTANTE: Abre .env.local y cambia TUS DATOS REALES
) else (
    echo [OK] Archivo '.env.local' ya existe
)

echo.
echo ==================================
echo Proceso completado!
echo ==================================
echo.
echo Siguientes pasos:
echo 1. Edita .env.local con tus datos
echo 2. Ejecuta: npm run build
echo 3. Comprime y sube a cPanel
echo.
pause
