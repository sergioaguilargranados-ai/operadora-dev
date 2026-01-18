# 🚀 Guía Completa de Despliegue en cPanel

## 📋 Requisitos Previos
- ✅ Hosting con cPanel
- ✅ PostgreSQL disponible
- ✅ Acceso SSH (recomendado) o FTP
- ✅ Node.js instalado en el servidor (versión 18 o superior)

---

## PASO 1: Configurar PostgreSQL en cPanel

### 1.1 Crear Base de Datos PostgreSQL

1. **Entra a tu cPanel**
2. Busca **"PostgreSQL Databases"** o **"Bases de datos PostgreSQL"**
3. Click en **"Create Database"**
   - Nombre: `as_viajes` (o el que prefieras)
   - Click en **"Create Database"**

### 1.2 Crear Usuario PostgreSQL

1. En la misma sección, baja a **"PostgreSQL Users"**
2. Click en **"Add User"**
   - Username: `as_admin` (o el que prefieras)
   - Password: **Genera una contraseña segura** (guárdala)
   - Click en **"Create User"**

### 1.3 Asignar Usuario a Base de Datos

1. En **"Add User To Database"**
   - Selecciona el usuario: `as_admin`
   - Selecciona la base de datos: `as_viajes`
   - Click en **"Add"**
2. En la siguiente pantalla, marca **"ALL PRIVILEGES"**
3. Click en **"Make Changes"**

### 1.4 Obtener Datos de Conexión

**Anota estos datos (los necesitarás):**
```
Host: localhost (o el que te dé cPanel)
Puerto: 5432 (normalmente)
Base de datos: cpanel_usuario_as_viajes
Usuario: cpanel_usuario_as_admin
Contraseña: [la que creaste]
```

**Nota:** cPanel normalmente añade un prefijo con tu usuario a los nombres.

---

## PASO 2: Ejecutar el Esquema de Base de Datos

### Opción A: Desde cPanel (Más fácil)

1. En cPanel, busca **"phpPgAdmin"** o **"PostgreSQL Databases"**
2. Click en el ícono de **"phpPgAdmin"**
3. Selecciona tu base de datos `as_viajes`
4. Click en la pestaña **"SQL"**
5. **Copia TODO el contenido** del archivo `.same/database-schema.sql`
6. Pégalo en el área de texto
7. Click en **"Execute"**

### Opción B: Desde Terminal SSH (Si tienes acceso)

```bash
# Conéctate por SSH a tu servidor
ssh tu_usuario@tu_dominio.com

# Ejecuta el script SQL
psql -U cpanel_usuario_as_admin -d cpanel_usuario_as_viajes -f database-schema.sql
```

**✅ Verificar:** Deberías ver las tablas creadas sin errores.

---

## PASO 3: Preparar el Proyecto para Producción

### 3.1 Crear archivo .env.local

En la raíz del proyecto `expedia-clone/`, crea el archivo `.env.local`:

```bash
# Copia el ejemplo
cp .env.example .env.local
```

### 3.2 Configurar Variables de Entorno

Edita `.env.local` con tus datos reales:

```env
# PostgreSQL Database - REEMPLAZA CON TUS DATOS
DATABASE_URL="postgresql://cpanel_usuario_as_admin:TU_PASSWORD@localhost:5432/cpanel_usuario_as_viajes"

# JWT Secret - GENERA UNO NUEVO ALEATORIO
JWT_SECRET="tu_clave_super_secreta_aleatoria_cambiala_123456789"

# URL de tu sitio web
NEXT_PUBLIC_API_URL="https://tudominio.com"
```

**⚠️ IMPORTANTE:**
- Cambia `cpanel_usuario_` por el prefijo que usa tu cPanel
- Cambia `TU_PASSWORD` por la contraseña que creaste
- Cambia `JWT_SECRET` por una cadena aleatoria (puedes generarla en: https://randomkeygen.com/)
- Cambia `tudominio.com` por tu dominio real

### 3.3 Compilar el Proyecto

```bash
# Asegúrate de estar en la carpeta del proyecto
cd expedia-clone

# Instalar dependencias
bun install

# Compilar para producción
bun run build
```

**✅ Verificar:** Deberías ver "Compiled successfully" sin errores.

---

## PASO 4: Subir Archivos al Servidor

### Opción A: FTP/FileZilla (Más común)

1. **Conecta por FTP a tu servidor**
   - Host: ftp.tudominio.com
   - Usuario: tu_usuario_cpanel
   - Contraseña: tu_password_cpanel

2. **Navega a la carpeta de tu dominio**
   - Normalmente: `public_html/` o `www/`

3. **Sube estos archivos/carpetas:**
   ```
   ✅ .next/                  (carpeta completa)
   ✅ public/                 (carpeta completa)
   ✅ node_modules/           (carpeta completa) *
   ✅ package.json
   ✅ next.config.js
   ✅ .env.local              (IMPORTANTE)
   ```

   **Nota:** Si `node_modules` es muy grande, puedes instalarlo en el servidor (ver Opción B).

### Opción B: SSH + Git (Más rápido)

```bash
# Conéctate por SSH
ssh tu_usuario@tu_dominio.com

# Navega a la carpeta web
cd public_html

# Clona tu proyecto (si está en GitHub)
git clone https://github.com/tu-usuario/tu-repositorio.git .

# O sube el proyecto comprimido y descomprime
unzip expedia-clone.zip

# Instala dependencias
bun install

# Compila para producción
bun run build
```

---

## PASO 5: Configurar Node.js en cPanel

### 5.1 Crear Aplicación Node.js

1. En cPanel, busca **"Setup Node.js App"** o **"Aplicación Node.js"**
2. Click en **"Create Application"**
3. Configura:
   - **Node.js version:** 18.x o superior
   - **Application mode:** Production
   - **Application root:** La carpeta donde subiste el proyecto (ej: `public_html`)
   - **Application URL:** Tu dominio (ej: `tudominio.com`)
   - **Application startup file:** `server.js` (lo crearemos)
   - **Passenger log file:** Déjalo por defecto

### 5.2 Crear server.js

Crea el archivo `server.js` en la raíz de tu proyecto:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
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
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
```

### 5.3 Actualizar package.json

Añade estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "node server.js",
    "lint": "next lint"
  }
}
```

### 5.4 Configurar Variables de Entorno en cPanel

1. En la sección **"Setup Node.js App"**
2. Click en **"Edit"** en tu aplicación
3. Baja a **"Environment variables"**
4. Añade cada variable del archivo `.env.local`:
   ```
   DATABASE_URL = postgresql://...
   JWT_SECRET = tu_clave_secreta
   NEXT_PUBLIC_API_URL = https://tudominio.com
   NODE_ENV = production
   ```

### 5.5 Reiniciar Aplicación

1. En la misma sección, click en **"Restart"**
2. Espera unos segundos

---

## PASO 6: Configurar .htaccess (Si es necesario)

Si tu dominio no apunta directamente a la app Node.js, crea `.htaccess`:

```apache
# .htaccess
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:PORT/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:PORT/$1 [P,L]
```

**Reemplaza `PORT`** con el puerto asignado por cPanel (lo ves en "Setup Node.js App").

---

## PASO 7: Verificar que Todo Funciona

### 7.1 Abrir tu sitio web

Visita: `https://tudominio.com`

**✅ Deberías ver:**
- La página principal cargando correctamente
- Las imágenes mostrándose
- El buscador funcionando

### 7.2 Probar Registro

1. Click en **"Iniciar sesión"**
2. Click en **"Regístrate gratis"**
3. Completa el formulario
4. Click en **"Crear cuenta"**

**✅ Si funciona:** Te redirigirá a la página principal y verás tu nombre en el header.

### 7.3 Probar Login

1. Cierra sesión
2. Inicia sesión con las credenciales que creaste

**✅ Si funciona:** Entrarás a tu cuenta.

### 7.4 Verificar Base de Datos

En phpPgAdmin:
1. Selecciona tu base de datos
2. Click en tabla **"users"**
3. Click en **"Browse"**

**✅ Deberías ver:** Tu usuario registrado.

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot connect to database"

**Solución:**
1. Verifica que `DATABASE_URL` esté correcta en las variables de entorno
2. Verifica que el usuario tenga permisos
3. Prueba la conexión desde SSH:
   ```bash
   psql -U cpanel_usuario_as_admin -d cpanel_usuario_as_viajes
   ```

### Error: "Application failed to start"

**Solución:**
1. Revisa los logs en cPanel → "Setup Node.js App" → Click en "Log"
2. Verifica que `server.js` exista
3. Verifica que `.env.local` tenga todas las variables

### Error 500 en el sitio

**Solución:**
1. Revisa los logs del servidor
2. Verifica que la compilación fue exitosa (`bun run build`)
3. Reinicia la aplicación Node.js

### La página carga pero no se conecta a la BD

**Solución:**
1. Verifica que las API routes estén en: `src/app/api/`
2. Verifica los logs de PostgreSQL
3. Prueba las API directamente:
   ```
   https://tudominio.com/api/hotels
   ```

---

## 📊 MONITOREO

### Ver Logs en Tiempo Real

```bash
# Por SSH
tail -f ~/logs/tudominio.com.log
```

### Verificar Estado de la Aplicación

En cPanel → "Setup Node.js App" → Ver el estado (Running/Stopped)

---

## 🎉 ¡LISTO!

Tu sitio web AS Operadora de Viajes y Eventos está funcionando con:
- ✅ Base de datos PostgreSQL real
- ✅ Sistema de autenticación seguro
- ✅ API endpoints funcionales
- ✅ Hosting en tu servidor cPanel

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs
2. Verifica las variables de entorno
3. Asegúrate de que PostgreSQL está corriendo
4. Contacta a tu proveedor de hosting si el problema persiste

**Archivos importantes creados:**
- `database-schema.sql` - Esquema de la base de datos
- `.env.example` - Ejemplo de variables de entorno
- `src/lib/db.ts` - Conexión a PostgreSQL
- `src/app/api/*` - API endpoints
- `server.js` - Servidor de producción
