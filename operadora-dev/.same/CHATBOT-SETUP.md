# 🤖 CHATBOT WEB - GUÍA COMPLETA

**Versión:** v2.124
**Fecha:** 18 Diciembre 2025
**Estado:** ✅ Funcional

---

## 📋 CARACTERÍSTICAS

### ✅ Implementadas

1. **Widget Flotante**
   - Botón en esquina inferior derecha
   - Aparece en todas las páginas automáticamente
   - Animación suave de apertura/cierre
   - Botón minimizar para ocultar temporalmente

2. **Interfaz de Chat**
   - Diseño moderno con animaciones (Framer Motion)
   - Burbujas de mensaje diferenciadas (usuario vs bot)
   - Indicador de escritura (typing...)
   - Timestamps en cada mensaje
   - Scroll automático a últimos mensajes
   - Responsive (funciona en móvil y desktop)

3. **Sistema de Respuestas Inteligentes**
   - Respuestas contextuales basadas en palabras clave
   - Sin necesidad de OpenAI para funcionar
   - Cubre temas principales:
     - ✈️ Búsqueda de vuelos
     - 🏨 Reservas de hoteles
     - 📦 Paquetes vacacionales
     - 💰 Información de precios
     - 📋 Estado de reservas
     - 📄 Documentos necesarios
     - 📞 Contacto y soporte
     - ❌ Cancelaciones y reembolsos

4. **Historial de Conversación**
   - Mantiene últimos 10 mensajes en contexto
   - Se envía con cada request para continuidad

5. **Preparado para IA**
   - Integración con OpenAI GPT-4 lista
   - Solo requiere agregar API key
   - Fallback automático a sistema de reglas

---

## 🚀 USO

### Para Usuarios

**Acceso por Widget:**
1. Ir a cualquier página del sitio
2. Click en botón flotante (esquina inferior derecha)
3. Escribir pregunta
4. Presionar Enter o click en botón enviar

**Acceso por Página Completa:**
1. Ir a `/chatbot`
2. Interfaz de chat de pantalla completa
3. Misma funcionalidad que widget

### Ejemplos de Preguntas

```
✅ "Hola"
✅ "Busco un vuelo a Cancún"
✅ "¿Cuánto cuesta un hotel en CDMX?"
✅ "Quiero ver paquetes todo incluido"
✅ "¿Qué documentos necesito para viajar?"
✅ "¿Cómo cancelo mi reserva?"
✅ "Necesito ayuda con mi pago"
```

---

## 🔧 CONFIGURACIÓN

### Archivos Principales

```
operadora-dev/
├── src/
│   ├── components/
│   │   └── ChatWidget.tsx          # Widget flotante reutilizable
│   ├── app/
│   │   ├── layout.tsx              # Incluye widget globalmente
│   │   ├── chatbot/
│   │   │   └── page.tsx            # Página completa de chat
│   │   └── api/
│   │       └── chatbot/
│   │           └── route.ts        # API de procesamiento
```

### Variables de Entorno

**Opcional - Solo para OpenAI:**

```bash
# .env.local
OPENAI_API_KEY=sk-...
```

**Sin API key:** Usa sistema de respuestas inteligentes basado en reglas.

---

## 🤖 ACTIVAR OPENAI GPT-4

### Paso 1: Obtener API Key

1. Ir a https://platform.openai.com/
2. Crear cuenta / Login
3. Ir a API Keys
4. Crear nueva key
5. Copiar la key (sk-...)

### Paso 2: Configurar

```bash
# En .env.local
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### Paso 3: Reiniciar Servidor

```bash
bun dev
```

**¡Listo!** El chatbot ahora usa GPT-4 para respuestas más naturales y contextuales.

---

## 📊 SISTEMA DE RESPUESTAS

### Modo 1: OpenAI GPT-4 (si API key existe)

**Ventajas:**
- Respuestas más naturales y conversacionales
- Entiende contexto complejo
- Puede manejar cualquier pregunta
- Aprende de la conversación

**Costo:**
- ~$0.03 por cada 1000 tokens (conversación)
- ~$1-2 USD por 1000 conversaciones promedio

### Modo 2: Sistema de Reglas (default, gratis)

**Cómo funciona:**
1. Analiza palabras clave en el mensaje
2. Identifica intención (vuelo, hotel, precio, etc.)
3. Devuelve respuesta predefinida relevante
4. Incluye emojis y formato amigable

**Ventajas:**
- ✅ 100% gratis
- ✅ Respuestas instantáneas
- ✅ Sin dependencias externas
- ✅ Funciona offline

**Limitaciones:**
- ❌ Menos natural que IA
- ❌ No entiende contexto complejo
- ❌ Respuestas más rígidas

---

## 🎨 PERSONALIZACIÓN

### Cambiar Colores del Widget

**Archivo:** `src/components/ChatWidget.tsx`

```tsx
// Línea 99: Botón flotante
className="... bg-gradient-to-r from-blue-600 to-blue-500 ..."

// Línea 127: Header del chat
className="bg-gradient-to-r from-blue-600 to-blue-500 ..."

// Línea 182: Mensaje del bot
className="... bg-blue-600 ..."
```

### Modificar Mensaje de Bienvenida

**Archivo:** `src/components/ChatWidget.tsx`

```tsx
// Línea 20-26
const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    role: 'assistant',
    content: '¡Hola! 👋 Soy tu asistente virtual...', // ← Cambiar aquí
    timestamp: new Date()
  }
])
```

### Agregar Nuevas Respuestas

**Archivo:** `src/app/api/chatbot/route.ts`

```tsx
// Línea 90+: Función generateSmartResponse()

// Ejemplo: Agregar respuesta para "seguro de viaje"
if (lowerMessage.includes('seguro') || lowerMessage.includes('protección')) {
  return '🛡️ Ofrecemos seguros de viaje que cubren:\n• Cancelación\n• Pérdida de equipaje\n• Asistencia médica\n• Retrasos\n\n¿Te gustaría más información?'
}
```

---

## 📈 PRÓXIMAS MEJORAS SUGERIDAS

### Corto Plazo (1-2 semanas)

- [ ] Botones de acción rápida (Buscar vuelo, Ver hoteles, etc.)
- [ ] Formulario inline para búsqueda de vuelos
- [ ] Guardar conversaciones en BD
- [ ] Sistema de calificación (útil/no útil)

### Mediano Plazo (1 mes)

- [ ] Crear reserva directamente desde chat
- [ ] Transferir a agente humano (live chat)
- [ ] Notificaciones push cuando agente responde
- [ ] Análisis de sentimiento

### Largo Plazo (3+ meses)

- [ ] Chatbot de voz (speech-to-text)
- [ ] Integración con WhatsApp
- [ ] Multi-idioma (inglés, francés, etc.)
- [ ] Analytics de conversaciones

---

## 🧪 TESTING

### Probar Widget

1. Ir a cualquier página
2. Verificar que aparece botón flotante
3. Click en botón
4. Verificar que se abre ventana de chat
5. Enviar mensaje "Hola"
6. Verificar respuesta del bot
7. Minimizar ventana
8. Cerrar ventana

### Probar Página Completa

1. Ir a `/chatbot`
2. Verificar interfaz de pantalla completa
3. Enviar varios mensajes
4. Verificar historial
5. Verificar scroll automático

### Probar Respuestas

```bash
# Test con curl
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Busco un vuelo a Cancún",
    "context": "homepage",
    "history": []
  }'
```

---

## 🐛 TROUBLESHOOTING

### El widget no aparece

**Verificar:**
1. `ChatWidget` está importado en `layout.tsx`
2. Servidor de desarrollo está corriendo
3. No hay errores en consola del navegador

### Las respuestas no funcionan

**Verificar:**
1. API route existe: `src/app/api/chatbot/route.ts`
2. Revisar consola del servidor
3. Network tab en DevTools muestra request exitoso

### OpenAI no funciona

**Verificar:**
1. `OPENAI_API_KEY` está en `.env.local`
2. Key es válida y tiene créditos
3. Reiniciar servidor después de agregar key

---

## 📞 SOPORTE

**Dudas sobre el chatbot:**
- Ver código en `src/components/ChatWidget.tsx`
- Ver API en `src/app/api/chatbot/route.ts`
- Revisar este documento

**Contacto:**
- Email: support@asoperadora.com
- GitHub Issues

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Componente ChatWidget creado
- [x] Widget integrado en layout
- [x] Página de chatbot completa
- [x] API de procesamiento
- [x] Sistema de respuestas inteligentes
- [x] Preparado para OpenAI
- [x] Animaciones y UX pulida
- [x] Responsive design
- [x] Documentación completa

---

**Estado Final:** ✅ LISTO PARA PRODUCCIÓN

El chatbot está funcional y listo para usarse. Puedes activar OpenAI agregando la API key cuando lo desees.
