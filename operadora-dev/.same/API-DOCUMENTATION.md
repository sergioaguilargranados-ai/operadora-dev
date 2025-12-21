# 📡 Documentación de APIs

## 🔐 Autenticación

### POST /api/auth/register
Registra un nuevo usuario en la base de datos.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "phone": "+52 55 1234 5678"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+52 55 1234 5678",
    "memberSince": "2024-11-10T12:00:00.000Z",
    "memberPoints": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- 400: Datos faltantes o inválidos
- 400: Email ya registrado
- 500: Error del servidor

---

### POST /api/auth/login
Inicia sesión con email y contraseña.

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+52 55 1234 5678",
    "memberSince": "2024-11-10T12:00:00.000Z",
    "memberPoints": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- 400: Email o contraseña faltantes
- 401: Credenciales incorrectas
- 403: Cuenta desactivada
- 500: Error del servidor

---

## 🏨 Hoteles

### GET /api/hotels
Obtiene la lista de hoteles con filtros opcionales.

**Query Parameters:**
```
?city=Cancún           // Buscar por ciudad
&minPrice=1000         // Precio mínimo por noche
&maxPrice=3000         // Precio máximo por noche
&minRating=4.5         // Calificación mínima
```

**Ejemplo:**
```
GET /api/hotels?city=Cancún&minRating=4.5
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "hotels": [
    {
      "id": 1,
      "name": "Hotel Playa del Carmen",
      "description": "Hotel frente al mar con todas las comodidades",
      "location": "Playa del Carmen, México",
      "city": "Playa del Carmen",
      "country": "México",
      "price_per_night": "2500.00",
      "rating": "4.50",
      "total_reviews": 1234,
      "image_url": "https://...",
      "amenities": {
        "wifi": true,
        "pool": true,
        "restaurant": true,
        "parking": true
      },
      "is_active": true,
      "created_at": "2024-11-10T12:00:00.000Z",
      "updated_at": "2024-11-10T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Errores:**
- 500: Error del servidor

---

## 🔑 Autenticación con JWT

Para endpoints protegidos, incluye el token en el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Estructura de Datos

### User
```typescript
{
  id: number
  name: string
  email: string
  phone?: string
  memberSince: Date
  memberPoints: number
}
```

### Hotel
```typescript
{
  id: number
  name: string
  description: string
  location: string
  city: string
  country: string
  price_per_night: decimal
  rating: decimal
  total_reviews: number
  image_url: string
  amenities: {
    wifi?: boolean
    pool?: boolean
    restaurant?: boolean
    parking?: boolean
    ac?: boolean
  }
  is_active: boolean
  created_at: Date
  updated_at: Date
}
```

---

## 🚀 Próximas APIs a Implementar

- [ ] GET /api/hotels/:id - Detalles de un hotel
- [ ] GET /api/favorites - Obtener favoritos del usuario
- [ ] POST /api/favorites - Agregar a favoritos
- [ ] DELETE /api/favorites/:id - Eliminar de favoritos
- [ ] POST /api/bookings - Crear reserva
- [ ] GET /api/bookings - Obtener reservas del usuario
- [ ] GET /api/bookings/:id - Detalles de una reserva
- [ ] POST /api/reviews - Crear reseña
- [ ] GET /api/offers - Obtener ofertas especiales
- [ ] POST /api/search - Guardar búsqueda

---

## 🧪 Probar las APIs

### Con cURL:

**Registro:**
```bash
curl -X POST https://tudominio.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "phone": "+52 55 1234 5678"
  }'
```

**Login:**
```bash
curl -X POST https://tudominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

**Obtener hoteles:**
```bash
curl https://tudominio.com/api/hotels?city=Cancún
```

### Con Postman:

1. Crea una colección "AS Operadora API"
2. Añade requests para cada endpoint
3. Guarda el token en una variable de entorno
4. Úsalo en los headers de requests protegidos

---

## 📝 Notas

- Todos los passwords se hashean con bcrypt (10 rounds)
- Los tokens JWT expiran en 7 días
- Las búsquedas en ciudad son case-insensitive (ILIKE)
- Los precios están en pesos mexicanos (MXN)
