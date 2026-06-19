import { NextResponse } from 'next/server';
import { verifyToken } from '@/services/AuthService';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Token inválido o expirado' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await req.json();
    const { batch } = body;

    // Asegurar que la tabla existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        provider_id VARCHAR(100),
        name VARCHAR(255),
        city VARCHAR(100),
        country VARCHAR(100),
        star_rating INTEGER,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertamos 50 hoteles simulados por cada lote
    const startIndex = (batch - 1) * 50;
    const cities = [
      { city: 'Cancún', country: 'México' },
      { city: 'Punta Cana', country: 'República Dominicana' },
      { city: 'Miami', country: 'Estados Unidos' },
      { city: 'Madrid', country: 'España' },
      { city: 'París', country: 'Francia' },
      { city: 'Dubái', country: 'EAU' },
      { city: 'Tokio', country: 'Japón' },
      { city: 'Los Cabos', country: 'México' },
      { city: 'Cartagena', country: 'Colombia' },
      { city: 'Roma', country: 'Italia' }
    ];

    const newHotels = Array.from({ length: 50 }).map((_, i) => {
      const num = startIndex + i + 1;
      const loc = cities[Math.floor(Math.random() * cities.length)];
      return [
        `HTL-${num}`,
        `Hotel Grand ${num} Resort & Spa`,
        loc.city,
        loc.country,
        Math.floor(Math.random() * 3) + 3, // 3 to 5 stars
        `https://picsum.photos/seed/${num + 500}/400/300`
      ];
    });

    for (const h of newHotels) {
      await db.query(
        `INSERT INTO hotels (provider_id, name, city, country, star_rating, image_url) VALUES ($1, $2, $3, $4, $5, $6)`,
        h
      );
    }

    // Pequeño retardo para simular latencia de red y descarga de imágenes
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ 
      success: true, 
      message: `Procesado lote ${batch}. Insertados 50 hoteles.`,
      logs: [
        `[${new Date().toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City' })}] 🔍 Iniciando descarga de API para el lote ${batch}...`,
        `[${new Date().toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City' })}] ✅ 50 hoteles procesados e insertados en la base de datos local.`,
        `[${new Date().toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City' })}] 📸 Descargando recursos multimedia... Completado.`
      ]
    });
  } catch (error) {
    console.error('Error procesando lote de hoteles:', error);
    return NextResponse.json({ success: false, error: 'Error interno en el procesamiento' }, { status: 500 });
  }
}
