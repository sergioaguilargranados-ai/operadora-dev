# 🚀 LEEME PRIMERO - PARA AGENTES DE SAME

**Versión:** v2.130
**Fecha:** 18 Dic 2025
**Sesión pausada para continuidad**

---

## 📚 LEER ESTOS 3 ARCHIVOS (en orden):

### 1. CONTEXTO-NUEVA-SESION.md ⭐⭐⭐
**Archivo:** `.same/CONTEXTO-NUEVA-SESION.md`

**Contiene:**
- ✅ TODO lo que se hizo en la sesión del 18 dic
- 📋 Lista COMPLETA de 29 tareas pendientes
- 🎯 4 opciones de plan sugerido
- 📂 Estructura del proyecto
- 🔧 Comandos útiles
- ✅ Checklist antes/después

**🔥 EL MÁS IMPORTANTE - Leer completo**

---

### 2. SISTEMA-DOCUMENTACION.md ⭐⭐
**Archivo:** `.same/SISTEMA-DOCUMENTACION.md`

**Contiene:**
- ⚠️ Estructura de directorios (TODO en `operadora-dev/`)
- 📏 Reglas de comunicación (CONCISO, no informes largos)
- 🗂️ Qué documentos actualizar siempre
- ⚙️ Config Vercel (Root Directory, npm vs bun)

**🚨 Leer antes de hacer cambios**

---

### 3. CONTEXTO-PROYECTO-MASTER.md ⭐
**Archivo:** `.same/CONTEXTO-PROYECTO-MASTER.md`

**Contiene:**
- 🗃️ Memoria completa del proyecto
- 🔑 Accesos (GitHub, Vercel, Neon DB)
- 💻 Comandos importantes
- 📊 Estado de módulos

**📖 Referencia general**

---

## ⚡ INICIO RÁPIDO (5 MIN)

### 1. Verificar servidor dev:
```bash
cd /home/project/operadora-dev
npm run dev
```

### 2. Verificar datos de prueba:
```bash
node -e "const {Pool}=require('pg');require('dotenv').config({path:'.env.local'});const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});p.query('SELECT COUNT(*) FROM payment_transactions').then(r=>{console.log('Pagos:',r.rows[0].count);return p.query('SELECT COUNT(*) FROM travel_approvals')}).then(r=>{console.log('Aprobaciones:',r.rows[0].count);p.end()})"
```

Debe mostrar:
- Pagos: 10
- Aprobaciones: 8

### 3. Elegir opción del plan:
Ver `CONTEXTO-NUEVA-SESION.md` → sección "PLAN SUGERIDO"

**Opciones:**
- A) Corregir errores API (30-45 min)
- B) Completar UX/botones (20-30 min)
- C) Itinerarios con IA (60-90 min)
- D) Amadeus completo (60-90 min)

---

## 📋 RESUMEN DE LA SESIÓN ANTERIOR

**Completado:**
- ✅ 10 transacciones de pago (datos de prueba)
- ✅ 8 aprobaciones de viaje (datos de prueba)
- ✅ Cambio de contraseña en perfil (funcional)
- ✅ API /api/quotes corregida
- ✅ Documentación completa

**Pendiente:**
- 29 tareas (ver CONTEXTO-NUEVA-SESION.md)
- 6 errores de API (prioridad alta)
- 10 funcionalidades UX
- 5 funcionalidades búsqueda
- 3 notificaciones
- 2 ciudades/Amadeus
- 1 itinerarios IA (complejo)
- 3 Amadeus nuevos

---

## ⚠️ REGLAS IMPORTANTES

1. **TODO el código va en:** `operadora-dev/`
2. **NO tocar:** `backup-inicial-no-usar.sm/`
3. **Comunicación:** CONCISA (ver SISTEMA-DOCUMENTACION.md)
4. **Package manager:** npm (NO bun en producción)
5. **Vercel Root Directory:** `operadora-dev`

---

## ✅ CHECKLIST RÁPIDO

Antes de empezar:
- [ ] Leí CONTEXTO-NUEVA-SESION.md completo
- [ ] Leí SISTEMA-DOCUMENTACION.md (comunicación)
- [ ] Servidor dev corriendo (npm run dev)
- [ ] Datos de prueba verificados
- [ ] Elegí opción del plan sugerido

Al terminar:
- [ ] Actualicé todos.md con changelog
- [ ] Actualicé CONTEXTO-NUEVA-SESION.md con progreso
- [ ] Creé versión con versioning tool
- [ ] Comunicación fue concisa

---

## 🎯 PRÓXIMO PASO

**Leer:** `CONTEXTO-NUEVA-SESION.md` (archivo completo)
**Elegir:** Una opción del plan sugerido
**Empezar:** A trabajar en las tareas

---

**Versión:** v2.130
**Status:** 📋 Listo para continuar
**Progreso:** 96% completo (29 tareas pendientes)

🚀 **¡Todo está preparado para continuar sin perder contexto!**
