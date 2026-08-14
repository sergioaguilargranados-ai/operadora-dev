# 📋 Sesión PWA: Reestructuración de Referidos e Invitados Confirmados
**Fecha:** 23 de Julio de 2026 - 12:12 CST  
**Versión de Compilación:** v2.430  
**Autor:** AntiGravity AI Assistant  

En esta sesión se realizaron ajustes clave en el módulo de referidos (AS Rewards) dentro de la PWA móvil para simplificar la navegación y proporcionar un desglose detallado de los invitados y sus propios referidos.

---

## 🛠️ Cambios y Características Desarrolladas

### 1. Eliminación de Ranking AS y Enlace de Dashboard
- **Archivo:** `src/app/mobile/rewards/page.tsx`
- **Cambio:** Se eliminó la sección de "Ranking AS" del dashboard. Se enlazó el botón "Ver todos" del bloque "Invitados confirmados" para que redirija a `/mobile/rewards/invitados`.

### 2. Backend: Sub-Referidos en la Consulta
- **Archivo:** `src/app/api/mobile/referrals/route.ts`
- **Cambio:** Se agregó una subconsulta SQL que calcula dinámicamente y con casting `sub_referrals_count` para saber cuántos invitados a su vez tiene cada uno de los referidos directos del usuario.

### 3. Nueva Pantalla de Detalle de Invitados
- **Archivo:** `src/app/mobile/rewards/invitados/page.tsx`
- **Cambio:** Se creó una vista móvil estilizada y responsiva con buscador e interruptor de estados ("Todos", "Registrados", "Confirmados"). Se sustituyó el ícono de flecha `>` por un contador circular verde en la parte izquierda que indica el valor de `sub_referrals_count`. Se incluyó una tarjeta resumen con el total de invitados confirmados.

### 4. Control de Versiones e Historial
- **Archivos:** `docs/AG-Contexto-Proyecto.md`, `docs/AG-Historico-Cambios.md`
- **Cambio:** Actualización de la versión oficial del proyecto a la `v2.430`.

---

## 💡 Próximas Tareas para el Siguiente Agente
1. **Pruebas en UAT:** Verificar que los usuarios puedan ver la lista de sus invitados y que el contador de sub-referidos refleje correctamente las invitaciones realizadas por su descendencia directa en el árbol de referidos.
2. **Caché en Service Worker:** Validar si se requiere precargar la ruta `/api/mobile/referrals` en el Service Worker para soporte offline en esta nueva pantalla.
