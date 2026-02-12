# 🧪 Script de Pruebas CRM - AS Operadora

**Fecha:** 12 de Febrero de 2026  
**Versión:** v2.315  
**Alcance:** Testing completo de las 17 páginas del CRM  
**Prerrequisitos:** Aplicación corriendo con `npm run dev`, base de datos accesible  
**URL Base:** `http://localhost:3000`

---

## 📋 INSTRUCCIONES GENERALES

Para cada prueba:
1. Navegar a la URL indicada
2. Verificar que la página carga sin errores (ver consola del navegador F12)
3. Validar los elementos visuales descritos
4. Ejecutar las acciones indicadas
5. Registrar el resultado: ✅ PASS / ❌ FAIL / ⚠️ Parcial + comentarios

---

## 🔗 RESUMEN DE RUTAS A PROBAR

| # | Ruta | Sprint | Módulo |
|:--|:-----|:-------|:-------|
| 1 | `/dashboard/crm` | 1 | Dashboard principal |
| 2 | `/dashboard/crm/contacts/[id]` | 2 | Vista 360° |
| 3 | `/dashboard/crm/pipeline` | 2 | Pipeline visual |
| 4 | `/dashboard/crm/tasks` | 3 | Gestión de tareas |
| 5 | `/dashboard/crm/notifications` | 3 | Notificaciones inteligentes |
| 6 | `/dashboard/crm/automation` | 3 | Automatizaciones |
| 7 | `/dashboard/crm/analytics` | 4 | Analytics y funnel |
| 8 | `/dashboard/crm/import` | 5 | Importar CSV |
| 9 | `/dashboard/crm/executive` | 6 | Dashboard ejecutivo |
| 10 | `/dashboard/crm/campaigns` | 7 | Campañas email |
| 11 | `/dashboard/crm/calendar` | 8 | Calendario CRM |
| 12 | `/dashboard/crm/predictive` | 8 | Scoring predictivo |
| 13 | `/dashboard/crm/whatsapp` | 9 | WhatsApp CRM |
| 14 | `/dashboard/crm/workflows` | 9 | Workflows |
| 15 | `/dashboard/crm/campaign-metrics` | 10 | Métricas campañas |

---

## 1️⃣ DASHBOARD PRINCIPAL — `/dashboard/crm`

**Objetivo:** Verificar que el dashboard principal carga correctamente con KPIs, lista de contactos y acciones rápidas.

### Prueba 1.1: Carga inicial
- [ ] La página carga sin errores en consola
- [ ] Se muestran KPIs en tarjetas superiores (Contactos, Activos, Hot Leads, Score Promedio)
- [ ] Los KPIs muestran valores numéricos (pueden ser 0 si no hay datos)

### Prueba 1.2: Lista de contactos
- [ ] Se muestra tabla/grilla de contactos
- [ ] Cada contacto muestra: nombre, email, teléfono, etapa del pipeline, score
- [ ] Si no hay contactos, se muestra estado vacío con mensaje informativo

### Prueba 1.3: Barra de búsqueda
- [ ] Existe un campo de búsqueda funcional
- [ ] Escribir un nombre/email filtra los resultados en tiempo real
- [ ] Limpiar búsqueda restaura la lista completa

### Prueba 1.4: Botón "Nuevo Contacto"
- [ ] Existe botón de agregar nuevo contacto ("+")
- [ ] Al hacer click se abre un modal/formulario
- [ ] El formulario incluye campos: nombre completo, email, teléfono, fuente
- [ ] El formulario se puede cerrar sin guardar

### Prueba 1.5: Acciones rápidas
- [ ] Existen botones de acciones rápidas en el panel lateral/inferior
- [ ] Verificar que existen TODOS estos botones:
  - [ ] 📧 Campañas Email → navega a `/dashboard/crm/campaigns`
  - [ ] 📄 Reporte PDF → navega a `/dashboard/crm/reports` o genera PDF
  - [ ] 📅 Calendario → navega a `/dashboard/crm/calendar`
  - [ ] ⚡ Scoring Predictivo → navega a `/dashboard/crm/predictive`
  - [ ] 💬 WhatsApp CRM → navega a `/dashboard/crm/whatsapp`
  - [ ] 📋 Workflows → navega a `/dashboard/crm/workflows`
  - [ ] 📊 Métricas Campañas → navega a `/dashboard/crm/campaign-metrics`

### Prueba 1.6: Navegación
- [ ] Hacer click en un contacto navega a la vista 360° (`/dashboard/crm/contacts/[id]`)
- [ ] Las tarjetas de KPI son visualmente claras y diferenciables

---

## 2️⃣ VISTA 360° DEL CONTACTO — `/dashboard/crm/contacts/[id]`

**Objetivo:** Verificar la vista completa del contacto con todas sus secciones.

> **Nota:** Necesitas un contacto con ID válido. Si la lista del dashboard está vacía, primero crea uno desde el dashboard.

### Prueba 2.1: Carga del perfil
- [ ] La página carga con los datos del contacto
- [ ] Se muestra nombre completo, email, teléfono
- [ ] Se muestra la etapa actual del pipeline con indicador visual (color/badge)
- [ ] Se muestra el score del contacto

### Prueba 2.2: Sección de información
- [ ] Datos del contacto visibles: destino de interés, fecha de viaje, presupuesto, tipo de viaje
- [ ] Agente asignado visible (si aplica)
- [ ] Fuente del lead visible

### Prueba 2.3: Timeline de interacciones
- [ ] Se muestra una lista/timeline de interacciones pasadas
- [ ] Cada interacción muestra: tipo, fecha, resumen
- [ ] Si no hay interacciones, se muestra estado vacío

### Prueba 2.4: Acciones del contacto
- [ ] Botón para agregar interacción/nota
- [ ] Botón para enviar email
- [ ] Botón para cambiar etapa del pipeline
- [ ] Botón para editar datos del contacto

### Prueba 2.5: Sugerencias IA
- [ ] Se muestran sugerencias de acción generadas por IA
- [ ] Las sugerencias son contextuales al estado del contacto

---

## 3️⃣ PIPELINE VISUAL — `/dashboard/crm/pipeline`

**Objetivo:** Verificar el pipeline de ventas estilo Kanban.

### Prueba 3.1: Columnas del pipeline
- [ ] Se muestran columnas para cada etapa del pipeline
- [ ] Las etapas mínimas esperadas: New, Contacted, Qualified, Quoted, Won, Lost
- [ ] Cada columna muestra contador de contactos

### Prueba 3.2: Tarjetas de contacto
- [ ] Los contactos aparecen como tarjetas dentro de las columnas
- [ ] Cada tarjeta muestra: nombre, score, destino de interés
- [ ] Las tarjetas tienen indicadores visuales de prioridad/score

### Prueba 3.3: Drag and drop (si implementado)
- [ ] Se puede arrastrar un contacto de una columna a otra
- [ ] Al soltar se actualiza la etapa del contacto
- [ ] Si no hay drag & drop, verificar que haya botones para mover de etapa

### Prueba 3.4: Filtros
- [ ] Se puede filtrar por agente asignado
- [ ] Se puede filtrar por rango de score

---

## 4️⃣ GESTIÓN DE TAREAS — `/dashboard/crm/tasks`

**Objetivo:** Verificar el sistema de tareas y seguimientos.

### Prueba 4.1: Lista de tareas
- [ ] Se muestra lista de tareas pendientes
- [ ] Cada tarea muestra: título, contacto asociado, fecha límite, prioridad
- [ ] Las tareas vencidas se muestran con indicador de alerta (rojo)

### Prueba 4.2: Crear tarea
- [ ] Existe botón para crear nueva tarea
- [ ] El formulario incluye: título, descripción, contacto, fecha, prioridad
- [ ] La tarea se crea correctamente

### Prueba 4.3: Completar tarea
- [ ] Se puede marcar una tarea como completada
- [ ] La tarea completada se mueve a la sección de completadas o desaparece

### Prueba 4.4: Filtros de tareas
- [ ] Filtrar por: Todas, Pendientes, Vencidas, Completadas
- [ ] Filtrar por prioridad: Alta, Media, Baja

---

## 5️⃣ NOTIFICACIONES — `/dashboard/crm/notifications`

**Objetivo:** Verificar el sistema de notificaciones inteligentes.

### Prueba 5.1: Lista de notificaciones
- [ ] Se muestran notificaciones agrupadas o en lista
- [ ] Cada notificación tiene: tipo, mensaje, timestamp, indicador leída/no leída
- [ ] Las no leídas se distinguen visualmente

### Prueba 5.2: Marcar como leídas
- [ ] Se puede marcar una notificación individual como leída
- [ ] Existe opción de "Marcar todas como leídas"

### Prueba 5.3: Tipos de notificación
- [ ] Se muestran diferentes tipos: tarea vencida, contacto sin seguimiento, score alto, etc.

---

## 6️⃣ AUTOMATIZACIONES — `/dashboard/crm/automation`

**Objetivo:** Verificar el motor de reglas de automatización.

### Prueba 6.1: Lista de reglas
- [ ] Se muestran reglas de automatización existentes
- [ ] Cada regla muestra: nombre, trigger, acción, estado (activa/inactiva)

### Prueba 6.2: Crear regla
- [ ] Existe botón para crear nueva regla
- [ ] Se puede configurar: trigger (evento), condiciones, acción
- [ ] La regla se guarda correctamente

### Prueba 6.3: Toggle de regla
- [ ] Se puede activar/desactivar una regla
- [ ] El estado se refleja visualmente

---

## 7️⃣ ANALYTICS — `/dashboard/crm/analytics`

**Objetivo:** Verificar las visualizaciones de analytics.

### Prueba 7.1: Funnel de ventas
- [ ] Se muestra gráfico de funnel con etapas del pipeline
- [ ] Los porcentajes de conversión son visibles
- [ ] El gráfico es visualmente claro

### Prueba 7.2: Métricas de agentes
- [ ] Se muestran estadísticas por agente
- [ ] Incluye: contactos asignados, tasa de conversión, tiempo de respuesta

### Prueba 7.3: Tendencias
- [ ] Se muestran gráficos de tendencias temporales
- [ ] Filtros por período: semana, mes, trimestre

---

## 8️⃣ IMPORTAR CSV — `/dashboard/crm/import`

**Objetivo:** Verificar la importación de contactos desde CSV.

### Prueba 8.1: Carga de archivo
- [ ] Se puede seleccionar un archivo CSV
- [ ] Se muestra preview de los datos del archivo
- [ ] Se detectan automáticamente las columnas

### Prueba 8.2: Mapeo de campos
- [ ] Se muestra interfaz de mapeo columna CSV → campo CRM
- [ ] Se pueden mapear: nombre, email, teléfono, fuente, destino, etc.
- [ ] El auto-mapeo sugiere campos correctos

### Prueba 8.3: Importación
- [ ] Se puede ejecutar la importación
- [ ] Se muestra progreso/resultado
- [ ] Los contactos importados aparecen en el dashboard

**Archivo CSV de prueba sugerido:**
```csv
Nombre,Email,Telefono,Destino,Presupuesto
Juan Pérez,juan@email.com,+525512345678,Cancún,50000
María López,maria@email.com,+525598765432,CDMX,30000
Carlos García,carlos@test.com,+525511112222,Los Cabos,80000
```

---

## 9️⃣ DASHBOARD EJECUTIVO — `/dashboard/crm/executive`

**Objetivo:** Verificar el dashboard de nivel ejecutivo.

### Prueba 9.1: KPIs ejecutivos
- [ ] Se muestran KPIs de alto nivel: ingresos pipeline, tasa conversión, contactos nuevos
- [ ] Los datos se muestran en formato monetario/porcentual correcto

### Prueba 9.2: Gráficos
- [ ] Se muestran gráficos de tendencias
- [ ] Vista de funnel ejecutivo
- [ ] Comparativa temporal (este mes vs anterior)

---

## 🔟 CAMPAÑAS EMAIL — `/dashboard/crm/campaigns`

**Objetivo:** Verificar la gestión y envío de campañas de email.

### Prueba 10.1: Templates disponibles
- [ ] Se muestran 6 templates de email:
  - [ ] Bienvenida a nuevo lead
  - [ ] Seguimiento de cotización
  - [ ] Oferta especial
  - [ ] Re-engagement
  - [ ] Feedback post-viaje
  - [ ] Tips de viaje (nurturing)
- [ ] Cada template muestra: nombre, categoría, variables requeridas

### Prueba 10.2: Preview de template
- [ ] Se puede previsualizar un template
- [ ] El preview muestra el HTML renderizado con variables de ejemplo

### Prueba 10.3: Selección de contactos
- [ ] Se puede seleccionar contactos para enviar campaña
- [ ] Existe búsqueda/filtro de contactos
- [ ] Se pueden seleccionar múltiples contactos

### Prueba 10.4: Envío (simulado)
- [ ] Se puede iniciar el envío de la campaña
- [ ] Se muestran resultados: enviados exitosamente vs fallos

---

## 1️⃣1️⃣ CALENDARIO CRM — `/dashboard/crm/calendar`

**Objetivo:** Verificar el calendario interactivo del CRM.

### Prueba 11.1: Vista mensual
- [ ] Se muestra un calendario mensual completo
- [ ] Se puede navegar entre meses (anterior/siguiente)
- [ ] El día actual está destacado visualmente

### Prueba 11.2: Eventos en el calendario
- [ ] Los días con eventos muestran indicadores (dots/badges)
- [ ] Al hacer click en un día se muestran los eventos del día
- [ ] Los eventos se diferencian por tipo (tarea, seguimiento, viaje)

### Prueba 11.3: Detalle de evento
- [ ] Al seleccionar un día, se muestra panel lateral/inferior con detalles
- [ ] Cada evento muestra: nombre del contacto, tipo de evento, hora

### Prueba 11.4: Digest semanal
- [ ] Se muestra un resumen semanal con KPIs
- [ ] Incluye: tareas esta semana, seguimientos pendientes, viajes próximos

---

## 1️⃣2️⃣ SCORING PREDICTIVO — `/dashboard/crm/predictive`

**Objetivo:** Verificar el modelo de scoring predictivo.

### Prueba 12.1: Lista de predicciones
- [ ] Se muestra lista de contactos con su scoring predictivo
- [ ] Cada contacto muestra: nombre, probabilidad de conversión (%), nivel de riesgo
- [ ] Los contactos están ordenados por probabilidad (mayor a menor)

### Prueba 12.2: Detalle de predicción
- [ ] Al seleccionar un contacto se muestran:
  - [ ] Probabilidad de conversión
  - [ ] Días estimados para cerrar
  - [ ] Nivel de riesgo (hot/warm/cold)
  - [ ] Señales (positivas y negativas) con peso
  - [ ] Confianza del modelo (%)
  - [ ] Recomendaciones de acción

### Prueba 12.3: KPIs globales
- [ ] Se muestran KPIs del modelo:
  - [ ] Promedio de probabilidad
  - [ ] Total hot leads
  - [ ] Contactos con riesgo alto de perder

### Prueba 12.4: Visualización
- [ ] Barras de progreso para probabilidad de cada contacto
- [ ] Colores por nivel de riesgo (verde=hot, amarillo=warm, rojo=cold)
- [ ] Diseño dark/premium de la página

---

## 1️⃣3️⃣ WHATSAPP CRM — `/dashboard/crm/whatsapp`

**Objetivo:** Verificar el flujo de envío de WhatsApp con plantillas.

### Prueba 13.1: Paso 1 - Selección de template
- [ ] Se muestran 6 plantillas de WhatsApp:
  - [ ] 👋 Bienvenida
  - [ ] 📞 Seguimiento
  - [ ] 📋 Cotización enviada
  - [ ] ⏰ Recordatorio de viaje
  - [ ] ✅ Confirmación de reserva
  - [ ] ⭐ Post-viaje
- [ ] Cada plantilla muestra: nombre, categoría, variables
- [ ] Se puede seleccionar una plantilla

### Prueba 13.2: Paso 2 - Selección de contactos
- [ ] Se muestra lista de contactos con checkbox
- [ ] Existe barra de búsqueda para filtrar contactos
- [ ] Se pueden seleccionar uno o múltiples contactos
- [ ] Se muestra contador de contactos seleccionados

### Prueba 13.3: Paso 3 - Preview del mensaje
- [ ] Se muestra una simulación tipo WhatsApp (burbuja verde)
- [ ] El mensaje muestra las variables sustituidas con datos del contacto
- [ ] Se muestra la hora actual en el preview
- [ ] El diseño simula la interfaz real de WhatsApp (header verde, marcas de lectura)

### Prueba 13.4: Paso 4 - Envío y resultados
- [ ] Se puede ejecutar el envío
- [ ] Se muestran resultados: enviados vs fallidos
- [ ] Si Twilio no está configurado, se muestra error controlado (no crash)

### Prueba 13.5: Navegación entre pasos
- [ ] Se puede avanzar y retroceder entre los 4 pasos
- [ ] No se puede avanzar sin completar el paso actual
- [ ] Se puede reiniciar el flujo

---

## 1️⃣4️⃣ WORKFLOWS — `/dashboard/crm/workflows`

**Objetivo:** Verificar el gestor de workflows de automatización.

### Prueba 14.1: Tab Templates
- [ ] Se muestran 4 workflows predefinidos:
  - [ ] 🆕 Bienvenida a nuevo lead
  - [ ] 📋 Seguimiento de cotización
  - [ ] 🔄 Re-engagement automático
  - [ ] 🔥 Alerta de lead caliente
- [ ] Cada template muestra: nombre, descripción, trigger, número de pasos
- [ ] Existe botón "Instalar" en cada template

### Prueba 14.2: Instalar workflow
- [ ] Al hacer click en "Instalar", se guarda el workflow
- [ ] Se muestra confirmación de instalación
- [ ] El workflow aparece en la tab "Mis Workflows"

### Prueba 14.3: Tab Mis Workflows
- [ ] Se muestra lista de workflows instalados
- [ ] Cada workflow muestra: nombre, estado (activo/inactivo), ejecuciones, última ejecución
- [ ] Existe toggle para activar/desactivar cada workflow

### Prueba 14.4: Detalle de workflow
- [ ] Al seleccionar un workflow se muestra panel de detalle
- [ ] Se muestra el trigger del workflow
- [ ] Se muestran los pasos en orden con flujo visual (líneas de conexión)
- [ ] Cada paso muestra: tipo (ícono), nombre, configuración
- [ ] Los pasos de tipo "condition" muestran la bifurcación

### Prueba 14.5: Toggle activo/inactivo
- [ ] Se puede cambiar estado de un workflow
- [ ] El cambio se refleja visualmente (badge verde/gris)

---

## 1️⃣5️⃣ MÉTRICAS DE CAMPAÑAS — `/dashboard/crm/campaign-metrics`

**Objetivo:** Verificar el dashboard de métricas de campañas de email.

### Prueba 15.1: KPIs principales
- [ ] Se muestran 5 KPIs con colores diferenciados:
  - [ ] 📧 Campañas totales (rosa)
  - [ ] 📤 Emails enviados (azul)
  - [ ] 👁 Open rate promedio (verde)
  - [ ] 🖱 Click rate promedio (morado)
  - [ ] 🏆 Mejor template (ámbar)

### Prueba 15.2: Timeline de actividad
- [ ] Se muestra gráfico de barras de los últimos 30 días
- [ ] Las barras tienen 3 colores: enviados (rosa), abiertos (verde), clicks (morado)
- [ ] Los tooltips muestran datos al pasar el mouse
- [ ] Si no hay datos, se muestra "Sin datos de actividad aún"

### Prueba 15.3: Benchmarks de industria
- [ ] Se muestra panel de comparación con benchmarks:
  - [ ] Open Rate vs 21% (benchmark industria)
  - [ ] Click Rate vs 2.6%
  - [ ] Bounce Rate vs 1.1%
- [ ] Los indicadores verdes/rojos señalan si estamos arriba o abajo del benchmark
- [ ] Las barras de progreso reflejan la posición

### Prueba 15.4: Tabla de campañas
- [ ] Se muestra tabla con columnas: Campaña, Enviados, Open Rate, Click Rate, CTR, Bounce, Fecha
- [ ] Los valores de open rate tienen indicador de color:
  - [ ] ≥21% = verde
  - [ ] 15-20% = amarillo
  - [ ] <15% = rojo
- [ ] Si no hay campañas, se muestra estado vacío con ícono y mensaje

### Prueba 15.5: Botón A/B Testing
- [ ] Existe botón "Crear test A/B →"
- [ ] El botón navega correctamente

---

## 🔌 PRUEBAS DE APIs (Opcional — usando cURL o Postman)

### API de WhatsApp
```bash
# Obtener templates
curl http://localhost:3000/api/crm/whatsapp?action=templates

# Preview de mensaje
curl "http://localhost:3000/api/crm/whatsapp?action=preview&template_id=wa_welcome&nombre=Juan&agente=María"

# Sugerencia por etapa
curl "http://localhost:3000/api/crm/whatsapp?action=suggest&stage=new"
```

**Resultado esperado:** JSON con `{ success: true, data: [...] }`

### API de Workflows
```bash
# Obtener templates
curl http://localhost:3000/api/crm/workflows?action=templates

# Obtener workflows guardados
curl http://localhost:3000/api/crm/workflows?action=saved
```

**Resultado esperado:** JSON con `{ success: true, data: [...] }`

### API de Métricas
```bash
# Resumen de campañas
curl http://localhost:3000/api/crm/metrics?action=summary

# Timeline
curl http://localhost:3000/api/crm/metrics?action=timeline

# Tests A/B
curl http://localhost:3000/api/crm/metrics?action=abtests
```

**Resultado esperado:** JSON con `{ success: true, data: {...} }`

### API de Calendario
```bash
# Eventos del mes
curl "http://localhost:3000/api/crm/calendar?action=events&year=2026&month=2"

# Digest semanal
curl http://localhost:3000/api/crm/calendar?action=digest
```

### API de Predictive
```bash
# Top predicciones
curl http://localhost:3000/api/crm/predictive?action=top

# Predicción individual
curl "http://localhost:3000/api/crm/predictive?action=predict&contact_id=1"
```

---

## 🗄️ PRUEBAS DE BASE DE DATOS

### Verificar tablas CRM existentes
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'crm_%'
ORDER BY table_name;
```

**Tablas esperadas:**
- `crm_contacts`
- `crm_interactions`
- `crm_tasks`
- `crm_score_signals`
- `crm_automation_rules`
- `crm_automation_log`
- `crm_campaign_stats` (Sprint 10)
- `crm_campaign_events` (Sprint 10)
- `crm_ab_tests` (Sprint 10)
- `crm_deep_links` (Sprint 10)

### Verificar migraciones Sprint 10
```sql
-- Verificar tablas de métricas
SELECT COUNT(*) FROM crm_campaign_stats;
SELECT COUNT(*) FROM crm_campaign_events;
SELECT COUNT(*) FROM crm_ab_tests;

-- Verificar deep links predefinidos
SELECT * FROM crm_deep_links;
-- Esperado: 8 registros (Dashboard, ContactDetail, Pipeline, Tasks, Calendar, Predictive, WhatsApp, Notifications)
```

---

## 🎨 PRUEBAS DE UI/UX GENERALES

### Para TODAS las páginas verificar:
- [ ] Diseño responsive (probar en ventana angosta ~375px)
- [ ] No hay texto cortado o desbordado
- [ ] Los botones son clickeables y tienen hover effects
- [ ] Los colores de fondo son gradientes suaves (no planos)
- [ ] Los iconos se renderizan correctamente (Lucide icons)
- [ ] El encoding de caracteres especiales es correcto (tildes, ñ, emojis)
- [ ] La navegación "Volver" funciona correctamente
- [ ] No hay errores en la consola del navegador (F12 > Console)

---

## 📊 TABLA DE RESULTADOS

| # | Módulo | Pruebas | ✅ Pass | ❌ Fail | ⚠️ Parcial | Notas |
|:--|:-------|:--------|:--------|:--------|:-----------|:------|
| 1 | Dashboard CRM | 1.1-1.6 | | | | |
| 2 | Vista 360° | 2.1-2.5 | | | | |
| 3 | Pipeline | 3.1-3.4 | | | | |
| 4 | Tareas | 4.1-4.4 | | | | |
| 5 | Notificaciones | 5.1-5.3 | | | | |
| 6 | Automatizaciones | 6.1-6.3 | | | | |
| 7 | Analytics | 7.1-7.3 | | | | |
| 8 | Import CSV | 8.1-8.3 | | | | |
| 9 | Ejecutivo | 9.1-9.2 | | | | |
| 10 | Campañas Email | 10.1-10.4 | | | | |
| 11 | Calendario | 11.1-11.4 | | | | |
| 12 | Predictive | 12.1-12.4 | | | | |
| 13 | WhatsApp | 13.1-13.5 | | | | |
| 14 | Workflows | 14.1-14.5 | | | | |
| 15 | Métricas Camp. | 15.1-15.5 | | | | |

---

## 💡 NOTAS IMPORTANTES

1. **Base de datos:** Si las tablas del Sprint 10 no existen, ejecutar la migración:
   ```bash
   node scripts/run-migration.js migrations/039_crm_sprint10_campaign_metrics.sql
   ```

2. **Twilio:** Los envíos de WhatsApp y email requieren variables de entorno configuradas:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`
   Si no están configuradas, los envíos fallarán pero la UI no debe crashear.

3. **Datos de prueba:** Para probar con datos, primero:
   - Crear 3-5 contactos desde el Dashboard
   - Asignar diferentes etapas del pipeline
   - Agregar notas/interacciones
   - Luego probar las demás funciones

4. **Migraciones previas:** Si es primera vez, verificar que las migraciones CRM previas estén ejecutadas:
   - `031_crm_sprint3_notifications_automation.sql`
   - `034_crm_core_tables.sql`
   - `039_crm_sprint10_campaign_metrics.sql`

---

*Documento generado el 12 de Febrero de 2026, 00:20 CST*  
*CRM v2.315 — 17 páginas, 28 APIs, 10 servicios backend*
