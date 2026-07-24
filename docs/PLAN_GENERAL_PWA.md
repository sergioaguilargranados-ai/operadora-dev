# Plan Maestro: PWA Operadora de Viajes

Este documento es el resultado del análisis profundo del video de flujo UX/UI, los requerimientos del usuario, reglas de negocio y el alcance técnico para la PWA móvil y el panel de administración.

Sirve como **"Biblia" (Single Source of Truth)** para coordinar a los Agentes de IA en el desarrollo y corrección del sistema.

---

## 🎯 Épica 1: Navegación Core y Ruteo (Completado)
*(Nota: El Sprint 1 ya ha sido ejecutado)*
- [x] **Menú Hamburguesa**: Modal lateral funcional en `mobile/page.tsx` con opciones de Perfil, Mis Viajes, AS Rewards y Soporte.
- [x] **Mis Viajes**: Ruta `mobile/itinerario/page.tsx` muestra la lista de viajes próximos y pasados.
- [x] **Botón de Ayuda / Perdido**: Botones "Back" ahora usan `router.back()`.
- [x] **Mapa y Navegación**: El botón "Cómo llegar" en el mapa abre Google Maps Directions usando la latitud/longitud del destino.
- [x] **Notificaciones**: La campana superior en todas las vistas abre `/mobile/notificaciones`.
- [x] **Documentos de Perfil**: Eliminación permanente de documentos, removiendo archivo y nombre de la lista.
- [x] **Wishlist / Guardar**: El botón superior `Bookmark` en los detalles del día guarda el Día completo en la Wishlist.
- [x] **Modales de Detalles**: `FoodDetailModal` y `PlaceDetailModal` implementados para mostrar información rica (recetas, galerías).

---

## 🎯 Épica 2: Sistema de Pagos y Parcialidades
Basado en el video explicativo de pagos.

### Módulo Admin / Vendedores (CRM)
- **Registro de Pagos Manuales**: En el detalle de la reserva (`Tus Reservas` -> `Checkout / Pagos`), los vendedores deben poder registrar pagos manuales de los clientes.
- **Pagos por Parcialidades**: Se debe soportar el registro de múltiples pagos parciales para una misma reserva.
- **Métodos de Pago Manuales**: Agregar botones específicos para "Agregar pago por transferencia" y "Agregar pago en efectivo".
- **Historial**: Todo pago registrado manualmente debe trasladarse al historial de pagos y reflejarse automáticamente en la PWA del cliente.

---

## 🎯 Épica 3: Programa de Lealtad (AS Rewards) y Retos
Basado en las reglas de negocio provistas por el usuario y el diseño de UI (`referidos.jpeg`).

### Reglas de Puntos y Referidos
1. **Referido Simple**: 1 referido registrado = 1,000 puntos.
2. **Referido con Compra**: 1 punto por cada $1 MXN gastado por el referido (Ej. Compra un paquete de $70,000 = el usuario recibe 70,000 puntos).
3. **Equivalencia de Wallet**: 1,000 puntos = $10 MXN para su wallet.
4. **Niveles de Usuario**: 
   - Explorador AS (5 invitados) = Bono $1,000 MXN
   - Embajador AS (10 invitados) = Bono $2,500 MXN
   - Viajero Elite (15 invitados) = 50% descuento
   - Leyenda AS (30 invitados) = Viaje gratuito

### Rewards y Retos (Gamificación)
- Implementar integración o módulo de retos basados en la salud (Pasos caminados, etc.) para otorgar puntos adicionales.
- Interfaz gráfica que muestre el Ranking AS, lista de invitados confirmados y código de invitación.

---

## 🎯 Épica 4: Generación de Datos Ricos (Agente IA)
Dado que los Modales de Detalles ya existen, se requiere poblar la base de datos con contenido rico.

- **Agente Limpiador (Script)**: Se construirá un script para regenerar los datos de las ciudades existentes, forzando al modelo de IA a devolver JSON estructurado con:
  - **Gastronomía**: Ingredientes, preparación, dificultad, tiempo y porciones.
  - **Lugares**: Galería (4 fotos extra), actividades y presupuesto.
- **Caso de Prueba (Tour de Europa)**: Se generará y poblará toda la información utilizando como base estricta el viaje: `https://www.megatravel.com.mx/viaje/gran-tour-de-europa-12019.html`.
- **Información Práctica (Widget Clima)**: Integrar un widget detallado con pronóstico semanal (Máximas, mínimas, humedad, viento y UV) como se muestra en `clima.jpeg`.

---

## 🚦 Metodología de Trabajo Sugerida
1. **Asignación a Agentes Especializados**: Se pueden crear "Sub-agentes" enfocados en (a) Frontend/UI, (b) Backend/Pagos, (c) Lógica de Lealtad y (d) Datos de IA.
2. **Checklists Diarias**: Usar `task.md` para marcar el progreso de cada Épica.
3. **Casos de Uso a Probar**: Realizar una reserva desde cero con el Gran Tour de Europa, aplicar un pago manual parcial desde el admin, visualizarlo en la PWA, y simular la invitación de un referido.
