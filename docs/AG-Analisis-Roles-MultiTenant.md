# 🎯 Análisis Arquitectura Multi-Tenant (Marca Blanca) y Roles
**Fecha:** 28 de Junio de 2026

Partiendo del código y esquema de base de datos actualmente programado en el proyecto, a continuación te explico cómo está estructurado el sistema de Marca Blanca, Agencias y Roles.

## 1. ¿Cómo identificamos Agencia, Agente, Administrativo y Cliente?

El sistema utiliza un esquema "Multi-Tenant" (Multi-inquilino) que separa al personal interno (AS Operadora) del personal externo (Agencias B2B y sus clientes).

*   **Administrativos (Personal Interno AS Operadora):**
    Se identifican en la tabla principal `users`. Tienen la columna `role` con valores como `SUPER_ADMIN`, `ADMIN`, `MANAGER` o `EMPLOYEE`. Ellos tienen acceso global a todo el sistema.
*   **Agencias:**
    Se identifican y registran en la tabla `tenants` (Inquilinos). Cada agencia es un registro aquí, con su propia información fiscal y branding.
*   **Agentes y Clientes (Personal Externo / B2B):**
    Tienen una cuenta en la tabla `users` (para poder iniciar sesión), pero su relación con la agencia se define en la tabla puente **`tenant_users`**.
    En esta tabla `tenant_users` existe una columna `role` específica para la agencia con los siguientes niveles:
    *   `AGENCY_ADMIN`: El administrador o dueño de la agencia (ve toda la información de su agencia).
    *   `AGENT`: Agente de ventas (solo ve sus comisiones y sus clientes).
    *   `CLIENT`: Cliente final (solo ve sus propias reservas).

## 2. ¿Dónde pongo todos los logos y Branding de la Marca Blanca?

El sistema ya está preparado para almacenar toda la identidad visual de cada agencia. Todo se guarda como columnas dentro de la tabla **`tenants`**. 
Actualmente el esquema contempla los siguientes campos de personalización por cada agencia:
*   `logo_url`: Logo principal para la versión Web.
*   `mobile_logo_url`: Logo específico para la App Móvil.
*   `primary_color`, `secondary_color`, `accent_color`: Los colores hexadecimales (ej. `#FF6B00`) para pintar los botones y la interfaz.
*   `slogan`: El eslogan de la agencia.
*   `custom_domain`: El subdominio o dominio propio (ej. `agencia-viajes.app.asoperadora.com`).

Cuando un usuario entra a un dominio específico, el sistema lee la tabla `tenants`, recupera estas URLs de logos y colores, y "disfraza" la plataforma.

## 3. ¿Cómo es el proceso de Agentes que dependen de la agencia?

Un agente se da de alta en el sistema mediante la creación de un registro en `tenant_users`. 
Para que un usuario sea reconocido como agente de una agencia en específico, el sistema hace lo siguiente:
1.  Vincula su `user_id` con el `tenant_id` (la agencia).
2.  Le asigna el rol `'AGENT'` en esa relación.
3.  **Código de Referido:** Al agente se le asigna un código único (`referral_code`) en esa misma tabla, además de su porcentaje de comisión (`agent_commission_split`) y su estatus (`agent_status`).

*Para verlos o administrarlos*, el sistema usa la vista materializada `agent_dashboard_stats` que cruza los datos de la agencia con el agente, mostrándole al `AGENCY_ADMIN` el rendimiento de sus agentes.

## 4. ¿Cómo ligo los clientes a los agentes?

El vínculo principal sucede mediante el **Sistema de Referidos (Referral System)** que ya está programado en la base de datos (Fase 2 de Agencias).

1.  El agente comparte su `referral_code` o un link personalizado con el cliente.
2.  Cuando el cliente entra, se registra un clic en la tabla `referral_clicks`.
3.  Cuando el cliente se registra o hace una compra, se crea un registro en la tabla **`referral_conversions`**.
4.  Esta tabla de conversiones guarda exactamente qué `user_id` (el cliente) pertenece a qué `agent_id` (el agente que le dio el link).
5.  A partir de ahí, las comisiones de ese cliente se calculan automáticamente y se registran en `agency_commissions` vinculadas a ese agente.
