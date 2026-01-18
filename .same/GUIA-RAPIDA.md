# 🚀 Guía Rápida - Despliegue en cPanel

## ✅ CHECKLIST ANTES DE EMPEZAR

- [ ] Tienes acceso a cPanel
- [ ] PostgreSQL está disponible en tu hosting
- [ ] Tienes FTP o SSH configurado
- [ ] Node.js 18+ está instalado en el servidor

---

## 📝 PASOS RÁPIDOS

### 1️⃣ Crear Base de Datos en cPanel (5 min)

```
cPanel → PostgreSQL Databases
→ Create Database: "as_viajes"
→ Create User: "as_admin" + contraseña segura
→ Add User to Database + ALL PRIVILEGES
```

**Anota:** Usuario completo (ej: `cpanel_user_as_admin`), contraseña, y base de datos completa (ej: `cpanel_user_as_viajes`)

---

### 2️⃣ Ejecutar Esquema SQL (2 min)

```
cPanel → phpPgAdmin
→ Selecciona tu base de datos
→ Pestaña "SQL"
→ Copia y pega TODO el contenido de: .same/database-schema.sql
→ Execute
```

---

### 3️⃣ Configurar Variables de Entorno (3 min)

Crea `.env.local` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://cpanel_user_as_admin:TU_PASSWORD@localhost:5432/cpanel_user_as_viajes"
JWT_SECRET="clave_aleatoria_super_segura_123456"
NEXT_PUBLIC_API_URL="https://tudominio.com"
NODE_ENV="production"
```

**Reemplaza:** Usuario, contraseña, base de datos y dominio

---

### 4️⃣ Compilar Proyecto (5 min)

```bash
cd expedia-clone
bun install
bun run build
```

---

### 5️⃣ Subir al Servidor (10 min)

**Por FTP:**
```
Sube estas carpetas/archivos:
✅ .next/
✅ public/
✅ node_modules/ (o instala en servidor)
✅ package.json
✅ next.config.js
✅ server.js
✅ .env.local
```

**Por SSH:**
```bash
ssh user@tudominio.com
cd public_html
# Sube archivos o usa git clone
bun install
bun run build
```

---

### 6️⃣ Configurar Node.js App en cPanel (5 min)

```
cPanel → Setup Node.js App → Create Application
→ Node version: 18+
→ Application mode: Production
→ Application root: public_html (o donde subiste)
→ Application URL: tudominio.com
→ Application startup file: server.js
```

**Variables de entorno:**
```
DATABASE_URL = tu_connection_string
JWT_SECRET = tu_clave_secreta
NEXT_PUBLIC_API_URL = https://tudominio.com
NODE_ENV = production
```

**Restart** la aplicación

---

### 7️⃣ Verificar (2 min)

1. Visita: `https://tudominio.com`
2. Prueba registrarte
3. Inicia sesión
4. Verifica que los datos se guarden en PostgreSQL

---

## 🎉 ¡LISTO!

**Tiempo total: ~30 minutos**

Tu sitio está en producción con:
- ✅ PostgreSQL
- ✅ Autenticación real
- ✅ APIs funcionales

---

## 🆘 Problemas Comunes

**No carga la página:**
- Verifica logs en cPanel → Node.js App → Log
- Reinicia la aplicación

**Error de base de datos:**
- Verifica DATABASE_URL
- Prueba conexión con `psql`

**Error 500:**
- Revisa que `.env.local` esté en el servidor
- Verifica que la compilación fue exitosa

---

## 📚 Más Detalles

Ver: `.same/GUIA-DESPLIEGUE-CPANEL.md` para instrucciones completas paso a paso.
