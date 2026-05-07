# 🌍 Guía de Validación y Pruebas — Sistema AS Operadora v2.346

**Fecha de Actualización:** 07 de Mayo de 2026  
**Documento:** Manual de Usuario para Validación de Funcionalidades  
**Estado del Sistema:** ✅ Estable (Producción y Desarrollo)

---

## 🏛️ Bienvenida a la Plataforma AS Operadora
Este manual ha sido diseñado para guiarle a través de las funcionalidades clave del sistema, permitiéndole validar que la integración con MegaTravel y las herramientas de venta operan según los más altos estándares de calidad.

> [!NOTE]
> Esta guía utiliza un lenguaje no técnico para facilitar la comprensión de los procesos de automatización y gestión de datos.

---

## 🧭 Módulo 1: Motor de Inteligencia MegaTravel
Este es el "corazón" de la plataforma, encargado de mantener su catálogo de viajes actualizado sin intervención manual.

### 1.1 Sincronización Automática (Fase de Descubrimiento)
El sistema explora las categorías de MegaTravel (Europa, Asia, etc.) para detectar novedades.
*   **Qué probar:** Iniciar el proceso de "Solo Sincronización" desde el panel administrativo de Scraping.
*   **Resultado esperado:** El sistema debe listar tours "Nuevos" y detectar tours "Dados de Baja" si ya no existen en la fuente original.

### 1.2 Enriquecimiento de Datos (Fase de Scraping)
Aquí el sistema entra a cada tour para extraer el "ADN" del viaje.
*   **Qué probar:** Ejecutar el proceso de "Scraping" para un grupo de tours.
*   **Resultado esperado:**
    *   **Precios:** Actualización automática del precio base en USD.
    *   **Itinerario:** Extracción día por día de las actividades.
    *   **Inclusiones:** Detalle completo de qué incluye y qué no incluye el viaje.
    *   **Multimedia:** Carga de fotos, mapas de ruta y videos promocionales.

---

## 🛍️ Módulo 2: Experiencia del Cliente y Búsqueda
Este rubro valida cómo sus clientes interactúan con la información recolectada.

### 2.1 Buscador Inteligente
*   **Qué probar:** Usar la barra de búsqueda en la página principal con un destino (ej: "Estambul") o un código MT.
*   **Resultado esperado:** Resultados inmediatos con tarjetas visualmente atractivas que muestran precio, duración y una breve descripción.

### 2.2 Ficha Detallada del Tour
*   **Qué probar:** Hacer clic en un tour para ver sus detalles completos.
*   **Resultado esperado:** Visualización premium con secciones claras para el itinerario, mapa interactivo y la lista de servicios incluidos/no incluidos.

---

## 💼 Módulo 3: Herramientas de Ventas (Trip Designer)
Este módulo permite a sus agentes de ventas convertir un tour genérico en una propuesta personalizada.

### 3.1 Diseñador de Viajes
*   **Qué probar:** Acceder a un tour y usar la opción para abrir el Diseñador de Viajes.
*   **Resultado esperado:** Posibilidad de ajustar detalles, añadir notas específicas para el cliente y generar un enlace único de propuesta.

### 3.2 Generación de Cotizaciones
*   **Qué probar:** Generar el documento PDF de cotización desde una propuesta.
*   **Resultado esperado:** Un documento profesional que incluya:
    *   Logotipo de AS Operadora (o de su agencia asociada si es Marca Blanca).
    *   Desglose claro de servicios.
    *   Términos y condiciones legales actualizados.

---

## 🔐 Módulo 4: Administración y Seguridad Reforzada
Garantiza que el sistema pueda operar procesos largos sin interrupciones por caducidad de sesión.

### 4.1 Respaldo de Sesión (Hardening)
*   **Qué probar:** Ingresar la `ADMIN_SECRET_KEY` en el nuevo panel de "Respaldo de Sesión" en la página de Scraping y guardarla.
*   **Resultado esperado:** El log debe mostrar `🔒 Sesión reforzada con Admin Secret Key (Hardened)`. Esto permite que el sistema ignore la expiración de la sesión normal y complete la actualización masiva sin detenerse por errores de acceso (HTTP 401).

---

## ✅ Lista de Verificación (Checklist) Final
*Por favor, marque cada punto tras realizar la prueba en el sistema.*

- [ ] **Sincronización:** ¿El sistema detecta correctamente el total de tours (aprox. 325)?
- [ ] **Precios:** ¿Los precios coinciden con los de la página de MegaTravel?
- [ ] **Itinerarios:** ¿Se visualizan los mapas y el detalle día por día?
- [ ] **Diseño:** ¿Se ve correctamente el logo de AS Operadora en el pie de página?
- [ ] **Seguridad:** ¿Aparece el mensaje de "Sesión reforzada" al usar la clave secreta?
- [ ] **Cotizaciones:** ¿El PDF generado tiene un aspecto profesional y limpio?

---

> [!TIP]
> Si detecta alguna anomalía o un tour que no muestra su mapa correctamente, puede forzar la re-sincronización individual de ese código desde el panel administrativo.

**AS Operadora — Tecnología para Viajeros Exigentes**  
*v2.346 | Calidad y Estabilidad Garantizada*
