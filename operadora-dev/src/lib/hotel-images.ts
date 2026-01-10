/**
 * Imágenes de hoteles para usar en resultados de búsqueda
 * Organizadas por tipo de propiedad y destino
 */

// Imágenes genéricas de alta calidad por tipo de propiedad
export const HOTEL_IMAGES = {
  resort: [
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop",
  ],
  hotel: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1455587734955-081b22074882?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=300&fit=crop",
  ],
  boutique: [
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop",
  ],
  villa: [
    "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
  ],
  apartment: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
  ],
  hostel: [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=400&h=300&fit=crop",
  ],
  beach: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=300&fit=crop",
  ],
}

// Imágenes específicas por destino
export const DESTINATION_IMAGES: Record<string, string[]> = {
  cancun: [
    "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=400&h=300&fit=crop",
  ],
  "los cabos": [
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop",
  ],
  "puerto vallarta": [
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
  ],
  tulum: [
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&h=300&fit=crop",
  ],
  "riviera maya": [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=300&fit=crop",
  ],
  "ciudad de mexico": [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop",
  ],
}

/**
 * Obtener imagen de hotel basada en tipo de propiedad y destino
 */
export function getHotelImage(
  propertyType?: string,
  destination?: string,
  index: number = 0
): string {
  // Primero intentar por destino
  if (destination) {
    const destLower = destination.toLowerCase()
    for (const [key, images] of Object.entries(DESTINATION_IMAGES)) {
      if (destLower.includes(key)) {
        return images[index % images.length]
      }
    }
  }

  // Luego por tipo de propiedad
  const type = (propertyType || 'hotel').toLowerCase()
  const typeImages = HOTEL_IMAGES[type as keyof typeof HOTEL_IMAGES] || HOTEL_IMAGES.hotel
  return typeImages[index % typeImages.length]
}

/**
 * Obtener imagen basada en nombre del hotel (para hoteles conocidos)
 */
export function getHotelImageByName(hotelName: string, index: number = 0): string {
  const name = hotelName.toLowerCase()

  // Resorts de playa
  if (name.includes('beach') || name.includes('playa') || name.includes('mar')) {
    return HOTEL_IMAGES.beach[index % HOTEL_IMAGES.beach.length]
  }

  // Resorts all-inclusive
  if (name.includes('resort') || name.includes('palace') || name.includes('all inclusive')) {
    return HOTEL_IMAGES.resort[index % HOTEL_IMAGES.resort.length]
  }

  // Villas
  if (name.includes('villa') || name.includes('casa')) {
    return HOTEL_IMAGES.villa[index % HOTEL_IMAGES.villa.length]
  }

  // Boutique
  if (name.includes('boutique')) {
    return HOTEL_IMAGES.boutique[index % HOTEL_IMAGES.boutique.length]
  }

  // Default hotel
  return HOTEL_IMAGES.hotel[index % HOTEL_IMAGES.hotel.length]
}

export default {
  HOTEL_IMAGES,
  DESTINATION_IMAGES,
  getHotelImage,
  getHotelImageByName,
}
