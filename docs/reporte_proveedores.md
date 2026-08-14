# Reporte de Proveedores e Integraciones
**Proyecto:** asoperadora (operadora-dev)
**Fecha:** Julio 2026

A continuación se detalla la lista de proveedores de servicios y APIs integradas en el proyecto, las claves actuales que tenemos almacenadas (entorno de desarrollo/producción) y un análisis de los costos y umbrales para pasar al siguiente nivel de facturación.

---

## 💳 1. Pasarelas de Pago
Actualmente las pasarelas cobran por transacción (comisión), no tienen costo fijo mensual.

| Proveedor | Clave (Key/Token) | Costo Mensual | Umbral / Siguiente Nivel |
| --- | --- | --- | --- |
| **PayPal** | `AQS-fcLz878wro1Ag_Pkmn... (Client ID)`<br>`EHc3auG0ZMQR9SkzzY38z... (Secret)` | $0 | Se cobra una comisión por transacción (aprox. 3.49% + $4 MXN). No hay límite de volumen. |
| **MercadoPago** | `TEST-efb0ab47-ec62-4cc0... (Public)`<br>`TEST-5362855352753774... (Access)` | $0 | Comisión por transacción (aprox. 3.49% + $4 MXN). |
| **Stripe** | `pk_test_51SmfrGJ4lb8a... (Public)`<br>`sk_test_51SmfrGJ4lb8a... (Secret)` | $0 | Comisión estándar (aprox. 3.6% + $3 MXN). |

---

## 🗄️ 2. Infraestructura y Base de Datos

| Proveedor | Clave (Key/Token) | Costo Mensual | Umbral / Siguiente Nivel |
| --- | --- | --- | --- |
| **Vercel** (Hosting) | *Conexión directa vía GitHub* | $0 (Hobby) | **Límite actual:** 100GB ancho de banda/mes. **Siguiente nivel:** Plan Pro ($20 USD/mes por usuario) si se rebasa el ancho de banda o se requiere uso intensivo de Serverless Functions. |
| **Neon PostgreSQL** | `postgresql://neondb_owner:npg_rsdKEkaw1ZS2@...` | $0 (Free Tier) | **Límite actual:** 500 MB de almacenamiento de datos. **Siguiente nivel:** Plan Launch ($19 USD/mes) que ofrece 10 GB de almacenamiento y 300 horas de cómputo. |
| **Vercel Blob** (Archivos) | *Sin configurar actualmente* | $0 | **Límite actual:** 250 MB de almacenamiento y 1 millón de descargas. **Siguiente nivel:** El pago está amarrado al Plan Pro de Vercel. |

---

## 🤖 3. Inteligencia Artificial

| Proveedor | Clave (Key/Token) | Costo Mensual | Umbral / Siguiente Nivel |
| --- | --- | --- | --- |
| **OpenAI** (GPT) | `sk-proj--uKxzzJM-pnl1r4p0...` | Pay-as-you-go | **Límite actual:** Pago por uso (aprox. $5 a $15 USD mensuales) según cuántos itinerarios/chats se generen. **Siguiente nivel:** Solo se requiere recargar saldo en la cuenta; no hay plan forzoso. |
| **Google Gemini** | `AQ.Ab8RN6IEXzdFh0BTq...` | $0 (Free Tier) | **Límite actual:** 15 solicitudes (RPM) gratuitas. **Siguiente nivel:** Pay-as-you-go si se requiere mayor velocidad (aprox. $0.35 USD por 1 millón de tokens). |

---

## ✈️ 4. Proveedores Turísticos (APIs B2B)
La mayoría de estos proveedores operan bajo modelo de comisiones o markups, por lo que el uso de la API en sí es gratuito.

| Proveedor | Clave (Key/Token) | Costo Mensual | Umbral / Siguiente Nivel |
| --- | --- | --- | --- |
| **Amadeus** (Vuelos) | `hUJ8cuV0r5GLocmKx0Zy... (Key)`<br>`sINGhQ7meq58... (Secret)` | $0 | **Límite actual:** Sandbox (Pruebas). **Siguiente nivel:** En producción se cobra una tarifa mínima por cada llamada a la API (aprox. €0.002 - €0.02) o se hace mediante un acuerdo comercial. |
| **Duffel** (Vuelos) | `duffel_test_eg-lx40hCb2n...` | $0 | **Modelo:** Gratuito de usar. Duffel cobra un recargo por boleto emitido, sin costo mensual. |
| **Hotelbeds** (Hoteles) | `79ada46676d253694b... (Key)`<br>`thW7YXYGel (Secret)` | $0 | **Modelo:** B2B. La ganancia se obtiene del net rate (markup). Requieren un volumen mínimo de ventas anual para mantener la cuenta activa. |
| **RateHawk** (Hoteles) | *Pendiente por configurar* | $0 | **Modelo:** Similar a Hotelbeds, basado en tarifas netas y markup. |
| **Kiwi.com** (Vuelos) | `57303713ca57f9f2cb962...` | $0 | **Modelo:** Afiliados B2B. Gratuito, la agencia cobra comisión por venta. |

---

## 📧 5. Comunicaciones y Notificaciones

| Proveedor | Clave (Key/Token) | Costo Mensual | Umbral / Siguiente Nivel |
| --- | --- | --- | --- |
| **SendGrid** (Correos) | `SG.6GFaIE3pSPacUN6k...` | $0 (Free Tier) | **Límite actual:** 100 correos al día gratis. **Siguiente nivel:** Plan Essentials (aprox. $19.95 USD/mes) permite hasta 50,000 correos mensuales. |
| **Web Push (VAPID)** | `BJu6O2Kqjv5f_i0deo... (Public)`<br>`KN4f34GhL1uzO... (Private)` | $0 | **Totalmente gratuito** ya que es un estándar soportado por los navegadores (Chrome, Safari, Edge). |

---

## 🗺️ 6. Servicios Adicionales (Clima, Mapas, Fotos, Facturas)

| Proveedor | Clave (Key/Token) | Costo Mensual | Umbral / Siguiente Nivel |
| --- | --- | --- | --- |
| **Google Maps / Places** | `AIzaSyC-eV8KIUZCyX0u...` | $0 | **Límite actual:** $200 USD de crédito gratuito al mes (alcanza para ~28,500 cargas de mapa). **Siguiente nivel:** Pay-as-you-go; cobran ~$7 USD por cada 1,000 consultas adicionales. |
| **Facturama** | `pruebas@facturama.mx`<br>`pruebas2011` | $0 | **Límite actual:** Entorno de pruebas (Sandbox). **Siguiente nivel:** En producción se compran paquetes prepago (ej. 100 folios por ~$250 MXN). |
| **OpenWeatherMap** | `fd90687712bd73a1ac...` | $0 (Free Tier) | **Límite actual:** 1,000 consultas por día gratis. **Siguiente nivel:** Plan "Developer" o "Startup" ($40 USD/mes) si se requiere consultar el clima masivamente. |
| **Unsplash API** | `EXf_O6ipkUGhUix9R1mv...` | $0 (Demo) | **Límite actual:** 50 peticiones por hora. **Siguiente nivel:** Producción (gratis) permite hasta 5,000 por hora una vez que aprueban el uso comercial de la app. |
| **Pexels API** | `vCS3Epu3eZUYZj4tHen...` | $0 | **Límite actual:** 200 peticiones por hora / 20,000 al mes gratis. **Siguiente nivel:** Aumentos se solicitan contactando a Pexels (generalmente sin costo extra). |

---

## 📈 Resumen y Proyección de Costos Fijos

Actualmente la plataforma tiene **$0 USD en costos fijos mensuales** por concepto de suscripciones. Toda la arquitectura está diseñada para aprovechar los *Free Tiers* (Niveles Gratuitos) y esquemas Pay-As-You-Go.

**¿Cuándo empezarás a pagar una mensualidad?**

1. **Base de datos (Neon):** Este será probablemente el primer servicio en requerir pago. Cuando superes los **500MB** de almacenamiento en datos (usuarios, itinerarios, mensajes), se requerirá el plan de **$19 USD/mes**.
2. **Correos (SendGrid):** Cuando la plataforma empiece a enviar más de **100 correos diarios** (confirmaciones de reserva, notificaciones, recuperaciones de contraseña, campañas), requerirá el plan de **$19.95 USD/mes**.
3. **Hosting (Vercel):** Si el tráfico se vuelve elevado (miles de visitantes diarios) o se exceden las 100GB de ancho de banda al mes, se requerirá el plan Pro de **$20 USD/mes**.
4. **Facturama:** A medida que vendas, tendrás que invertir en paquetes de folios fiscales.

**Costo total proyectado al brincar al primer nivel de pago:** Aprox. **$60 USD/mes** + IVA. A partir de ahí, la arquitectura es capaz de soportar a miles de usuarios sin problema.
