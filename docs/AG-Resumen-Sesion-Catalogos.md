# Resumen de Sesión: Módulo de Catálogos (Usuarios, Agencia, Agentes, Clientes)
**Fecha:** 28 Junio 2026

## Objetivos Cumplidos
1. **Maestro de Usuarios (Admin)**
   - Ajuste de filtros en `/dashboard/admin/users` para incluir "Clientes B2C".
   - Integración centralizada de la gestión de roles.

2. **Configuración de Agencia (Settings)**
   - Implementación de pestaña "Expediente Documental Legal".
   - Integración simulada de Vercel Blob para subir Acta Constitutiva, CSF, INE y Comprobante de Domicilio. Guardado de metadata en la tabla `entity_documents`.

3. **Catálogo de Agentes (RRHH)**
   - Creación del nuevo módulo `/dashboard/hr/agents`.
   - Consulta y edición de agentes en la tabla `hr_employees`.
   - Soporte para comisiones, licencias de agente y expediente (INE, Contrato, Domicilio) vía Vercel Blob.

4. **Mejoras al Perfil del Cliente (CRM)**
   - Se modificó la tabla `crm_contacts` para incluir el campo `address` (domicilio).
   - Inserción de UI para visualización y edición del domicilio.
   - Creación de panel de Mensajería directa a la App Móvil usando la API `/api/crm/contacts/message`, registrando la notificación en `notifications_sent`.
   - Panel de expediente documental integrado para clientes (INE/Pasaporte).

## Siguientes Pasos (App Móvil & Producción)
- Los datos y flujos implementados ahora sirven de base para que la App Móvil consuma información (perfiles de cliente, notificaciones directas).
- En Vercel Blob en producción, reemplazar los "mockUrls" por el cliente real `@vercel/blob/client`.
