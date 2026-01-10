# 📦 Preparar Archivos para Subir a cPanel

## ✅ Paso 1: Compilar el Proyecto

```bash
# Asegúrate de estar en la carpeta del proyecto
cd expedia-clone

# Instalar todas las dependencias
bun install

# Compilar para producción
bun run build
```

**Verificar:** Deberías ver "Compiled successfully" ✅

---

## 📋 Paso 2: Crear archivo .env.local

**IMPORTANTE:** Este archivo NO debe subirse a Git, pero SÍ debe subirse a tu servidor.

Crea `.env.local` en la raíz del proyecto con:

```env
DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/TU_BASE_DATOS"
JWT_SECRET="clave_super_secreta_aleatoria_123456789"
NEXT_PUBLIC_API_URL="https://tudominio.com"
NODE_ENV="production"
```

**Reemplaza:**
- `TU_USUARIO` → Usuario de PostgreSQL de cPanel
- `TU_PASSWORD` → Contraseña de PostgreSQL
- `TU_BASE_DATOS` → Nombre de tu base de datos
- `tudominio.com` → Tu dominio real
- `JWT_SECRET` → Una clave aleatoria (genera una en: https://randomkeygen.com/)

---

## 📦 Paso 3: Comprimir Archivos (Opcional, recomendado para FTP)

### Opción A: Comprimir todo el proyecto

```bash
# Desde la carpeta padre de expedia-clone
zip -r expedia-clone.zip expedia-clone/ \
  -x "expedia-clone/.git/*" \
  -x "expedia-clone/.next/cache/*" \
  -x "expedia-clone/.same/*"
```

### Opción B: Comprimir solo lo necesario

```bash
cd expedia-clone

# Crear carpeta temporal
mkdir ../deploy

# Copiar archivos necesarios
cp -r .next ../deploy/
cp -r public ../deploy/
cp -r node_modules ../deploy/
cp package.json ../deploy/
cp next.config.js ../deploy/
cp server.js ../deploy/
cp .env.local ../deploy/

# Comprimir
cd ..
zip -r expedia-deploy.zip deploy/

# Limpiar
rm -rf deploy/
```

---

## 📤 Paso 4: Subir Archivos

### Opción 1: FTP (FileZilla, etc.)

1. **Conecta a tu servidor:**
   - Host: `ftp.tudominio.com`
   - Usuario: Tu usuario de cPanel
   - Contraseña: Tu contraseña de cPanel
   - Puerto: 21

2. **Navega a la carpeta web:**
   - Normalmente: `public_html/` o `www/`

3. **Sube el archivo .zip:**
   - Arrastra `expedia-deploy.zip` a la carpeta

4. **Descomprime en el servidor:**
   - En cPanel → File Manager
   - Encuentra el archivo .zip
   - Click derecho → Extract

### Opción 2: SSH (Más rápido)

```bash
# Conecta por SSH
ssh tu_usuario@tudominio.com

# Navega a la carpeta web
cd public_html

# Descarga desde tu computadora (desde otra terminal)
scp expedia-deploy.zip tu_usuario@tudominio.com:public_html/

# Vuelve al SSH y descomprime
unzip expedia-deploy.zip
mv deploy/* .
rm -rf deploy/
rm expedia-deploy.zip
```

### Opción 3: Git (Recomendado para actualizaciones)

```bash
# En tu computadora, sube a GitHub
git add .
git commit -m "Proyecto listo para producción"
git push origin main

# En el servidor SSH
ssh tu_usuario@tudominio.com
cd public_html
git clone https://github.com/tu-usuario/expedia-clone.git .
bun install
bun run build
```

---

## 📁 Archivos que DEBEN estar en el servidor

```
public_html/
├── .next/                    ✅ IMPORTANTE
│   ├── server/
│   ├── static/
│   └── ...
├── public/                   ✅ IMPORTANTE
│   └── ...
├── node_modules/            ✅ IMPORTANTE
│   └── ...
├── src/                     ✅ IMPORTANTE (si usas imports)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
├── package.json             ✅ IMPORTANTE
├── next.config.js           ✅ IMPORTANTE
├── server.js                ✅ IMPORTANTE
├── .env.local               ✅ MUY IMPORTANTE (con tus datos reales)
├── tsconfig.json            ⚠️ Opcional (para desarrollo)
└── README.md                ⚠️ Opcional
```

---

## 🚫 Archivos que NO debes subir

```
❌ .git/                     (No necesario en producción)
❌ .same/                    (Solo para desarrollo)
❌ .next/cache/              (Se regenera automáticamente)
❌ .env.example              (Solo es un ejemplo)
❌ node_modules/ (si instalas en servidor)
```

---

## ⚙️ Paso 5: Configurar Permisos

Si usas FTP, asegúrate de que estos archivos tengan los permisos correctos:

```
.env.local         → 600 (solo lectura para el propietario)
server.js          → 644
package.json       → 644
.next/             → 755 (carpetas)
public/            → 755 (carpetas)
```

En cPanel File Manager:
- Click derecho en archivo/carpeta
- Change Permissions
- Ajusta según lo indicado arriba

---

## 🔍 Paso 6: Verificar que todo está en su lugar

Por SSH:

```bash
cd public_html

# Verificar archivos principales
ls -la | grep -E '(server.js|package.json|.env.local)'

# Verificar carpetas
ls -d .next public node_modules

# Ver contenido de .env.local (verifica que tenga tus datos)
cat .env.local
```

---

## 📊 Tamaño Aproximado

- `.next/` → ~50-100 MB
- `node_modules/` → ~200-300 MB
- `public/` → ~5-10 MB
- Otros archivos → ~1-2 MB

**Total: ~250-400 MB**

---

## 💡 Consejos

1. **Si node_modules es muy grande:**
   - No lo subas
   - Instálalo directamente en el servidor con `bun install`

2. **Para actualizaciones futuras:**
   - Usa Git (más rápido y seguro)
   - Solo necesitas hacer `git pull` y `bun run build`

3. **Backup:**
   - Guarda una copia del .zip antes de borrar archivos

4. **Testing:**
   - Prueba primero en un subdominio (ej: test.tudominio.com)
   - Cuando funcione, muévelo al dominio principal

---

## ✅ Checklist Final

Antes de continuar con la configuración de Node.js en cPanel:

- [ ] Proyecto compilado exitosamente (`bun run build`)
- [ ] Archivo `.env.local` creado con datos reales
- [ ] Archivos subidos al servidor
- [ ] Archivos descomprimidos en la carpeta correcta
- [ ] Permisos configurados correctamente
- [ ] Base de datos PostgreSQL creada
- [ ] Esquema SQL ejecutado en la base de datos

**¿Todo listo?** → Continúa con la configuración de Node.js en cPanel (ver GUIA-RAPIDA.md)
