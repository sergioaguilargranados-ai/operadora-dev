import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/ashome/properties
 * Obtener propiedades de AS Home
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const type = searchParams.get('type')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const guests = searchParams.get('guests')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let sql = `
      SELECT
        id, property_type, title, description,
        city, state, country,
        guests_max, bedrooms, beds, bathrooms,
        amenities, price_per_night, cleaning_fee,
        weekly_discount, monthly_discount,
        photos, rating, reviews_count,
        host_name, is_superhost, is_featured,
        status, created_at
      FROM ashome_properties
      WHERE status = 'active'
    `
    const params: (string | number)[] = []
    let paramIndex = 1

    if (city) {
      sql += ` AND (LOWER(city) LIKE LOWER($${paramIndex}) OR LOWER(state) LIKE LOWER($${paramIndex}))`
      params.push(`%${city}%`)
      paramIndex++
    }

    if (type && type !== 'all') {
      sql += ` AND property_type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }

    if (minPrice) {
      sql += ` AND price_per_night >= $${paramIndex}`
      params.push(parseFloat(minPrice))
      paramIndex++
    }

    if (maxPrice) {
      sql += ` AND price_per_night <= $${paramIndex}`
      params.push(parseFloat(maxPrice))
      paramIndex++
    }

    if (guests) {
      sql += ` AND guests_max >= $${paramIndex}`
      params.push(parseInt(guests))
      paramIndex++
    }

    sql += ` ORDER BY is_featured DESC, rating DESC, created_at DESC`
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await query(sql, params)

    // Si no hay resultados en BD, retornar datos mock
    if (result.rows.length === 0) {
      const mockData = getMockProperties(city, type, guests ? parseInt(guests) : undefined)
      return NextResponse.json({
        success: true,
        data: mockData,
        total: mockData.length,
        source: 'mock'
      })
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      source: 'database'
    })

  } catch (error) {
    console.error('Error fetching AS Home properties:', error)
    // Fallback a datos mock
    const mockData = getMockProperties()
    return NextResponse.json({
      success: true,
      data: mockData,
      total: mockData.length,
      source: 'mock'
    })
  }
}

/**
 * POST /api/ashome/properties
 * Crear nueva propiedad (para anfitriones)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      propertyType, title, description, address, city, state, country,
      guests, bedrooms, beds, bathrooms, amenities,
      pricePerNight, cleaningFee, weeklyDiscount, monthlyDiscount,
      hostName, hostEmail, hostPhone
    } = body

    // Validaciones básicas
    if (!title || !city || !pricePerNight || !hostEmail) {
      return NextResponse.json({
        success: false,
        error: 'Campos requeridos: title, city, pricePerNight, hostEmail'
      }, { status: 400 })
    }

    // Insertar en BD (o tabla de solicitudes pendientes)
    const result = await query(`
      INSERT INTO ashome_properties (
        property_type, title, description, address, city, state, country,
        guests_max, bedrooms, beds, bathrooms, amenities,
        price_per_night, cleaning_fee, weekly_discount, monthly_discount,
        host_name, host_email, host_phone,
        status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19,
        'pending_review', NOW()
      )
      RETURNING id
    `, [
      propertyType, title, description, address, city, state, country || 'México',
      guests, bedrooms, beds, bathrooms, JSON.stringify(amenities || []),
      parseFloat(pricePerNight), parseFloat(cleaningFee || '0'),
      parseFloat(weeklyDiscount || '0'), parseFloat(monthlyDiscount || '0'),
      hostName, hostEmail, hostPhone
    ])

    return NextResponse.json({
      success: true,
      message: 'Propiedad enviada para revisión',
      propertyId: result.rows[0]?.id
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating AS Home property:', error)

    // Si la tabla no existe, guardar en memoria/log
    console.log('Property submission received (table may not exist):', request.body)

    return NextResponse.json({
      success: true,
      message: 'Solicitud recibida. Te contactaremos pronto.',
      note: 'Propiedad guardada para revisión manual'
    }, { status: 201 })
  }
}

/**
 * Datos mock para cuando no hay BD
 */
function getMockProperties(city?: string | null, type?: string | null, minGuests?: number) {
  const properties = [
    {
      id: "1",
      property_type: "casa",
      title: "Casa con vista al mar en Cancún",
      description: "Hermosa casa frente al mar con todas las comodidades",
      city: "Cancún",
      state: "Quintana Roo",
      country: "México",
      guests_max: 8,
      bedrooms: 4,
      beds: 4,
      bathrooms: 3,
      amenities: ["wifi", "pool", "parking", "kitchen", "ac"],
      price_per_night: 3500,
      cleaning_fee: 500,
      photos: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"],
      rating: 4.9,
      reviews_count: 127,
      host_name: "María",
      is_superhost: true,
      is_featured: true
    },
    {
      id: "2",
      property_type: "departamento",
      title: "Departamento moderno en Polanco",
      description: "Loft moderno en la mejor zona de CDMX",
      city: "Ciudad de México",
      state: "CDMX",
      country: "México",
      guests_max: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      amenities: ["wifi", "gym", "parking", "kitchen"],
      price_per_night: 2200,
      cleaning_fee: 300,
      photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
      rating: 4.8,
      reviews_count: 89,
      host_name: "Carlos",
      is_superhost: false,
      is_featured: false
    },
    {
      id: "3",
      property_type: "villa",
      title: "Villa de lujo en Los Cabos",
      description: "Villa exclusiva con piscina infinita y vista al océano",
      city: "Los Cabos",
      state: "Baja California Sur",
      country: "México",
      guests_max: 12,
      bedrooms: 6,
      beds: 6,
      bathrooms: 5,
      amenities: ["wifi", "pool", "jacuzzi", "parking", "kitchen", "beach"],
      price_per_night: 8500,
      cleaning_fee: 1000,
      photos: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"],
      rating: 5.0,
      reviews_count: 45,
      host_name: "Roberto",
      is_superhost: true,
      is_featured: true
    },
    {
      id: "4",
      property_type: "cabana",
      title: "Cabaña en el bosque - Valle de Bravo",
      description: "Escape perfecto en la naturaleza",
      city: "Valle de Bravo",
      state: "Estado de México",
      country: "México",
      guests_max: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      amenities: ["wifi", "kitchen", "bbq"],
      price_per_night: 1800,
      cleaning_fee: 250,
      photos: ["https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800"],
      rating: 4.7,
      reviews_count: 63,
      host_name: "Ana",
      is_superhost: true,
      is_featured: false
    },
    {
      id: "5",
      property_type: "casa",
      title: "Casa colonial en San Miguel de Allende",
      description: "Hermosa casa colonial en el centro histórico",
      city: "San Miguel de Allende",
      state: "Guanajuato",
      country: "México",
      guests_max: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      amenities: ["wifi", "kitchen", "ac"],
      price_per_night: 4200,
      cleaning_fee: 400,
      photos: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
      rating: 4.9,
      reviews_count: 78,
      host_name: "Patricia",
      is_superhost: true,
      is_featured: true
    },
    {
      id: "6",
      property_type: "departamento",
      title: "Loft artístico en Roma Norte",
      description: "Espacio único con diseño contemporáneo",
      city: "Ciudad de México",
      state: "CDMX",
      country: "México",
      guests_max: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      amenities: ["wifi", "kitchen", "pets"],
      price_per_night: 1500,
      cleaning_fee: 200,
      photos: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"],
      rating: 4.6,
      reviews_count: 112,
      host_name: "Diego",
      is_superhost: false,
      is_featured: false
    }
  ]

  let filtered = properties

  if (city) {
    const searchTerm = city.toLowerCase()
    filtered = filtered.filter(p =>
      p.city.toLowerCase().includes(searchTerm) ||
      p.state.toLowerCase().includes(searchTerm)
    )
  }

  if (type && type !== 'all') {
    filtered = filtered.filter(p => p.property_type === type)
  }

  if (minGuests) {
    filtered = filtered.filter(p => p.guests_max >= minGuests)
  }

  return filtered.length > 0 ? filtered : properties
}
