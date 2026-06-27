import { NextRequest, NextResponse } from 'next/server';

// Simulación de una respuesta de la API v2 de Civitatis para Actividades
const mockActivities = [
  {
    id: "civ-1",
    title: "Visita guiada por el Coliseo, Foro y Palatino",
    destination: "Roma",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
    price: 45,
    currency: "EUR",
    duration: "3h",
    rating: 4.8,
    reviews: 15400,
    description: "Recorre la Roma Antigua descubriendo el Coliseo, el Foro Romano y la colina del Palatino con un guía experto."
  },
  {
    id: "civ-2",
    title: "Paseo en barco por el Sena",
    destination: "París",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
    price: 18,
    currency: "EUR",
    duration: "1h",
    rating: 4.5,
    reviews: 8900,
    description: "Disfruta de las mejores vistas de París con un relajante paseo en barco panorámico por el río Sena."
  },
  {
    id: "civ-3",
    title: "Entrada a la Torre Eiffel hasta la cumbre",
    destination: "París",
    image: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&h=600&fit=crop",
    price: 65,
    currency: "EUR",
    duration: "2h",
    rating: 4.7,
    reviews: 21000,
    description: "Sube a la Torre Eiffel y admira París desde las alturas sin hacer interminables colas de espera."
  },
  {
    id: "civ-4",
    title: "Excursión a Toledo de medio día",
    destination: "Madrid",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
    price: 27,
    currency: "EUR",
    duration: "5h",
    rating: 4.6,
    reviews: 4300,
    description: "Descubre Toledo, la ciudad de las Tres Culturas, en una excursión desde Madrid con transporte incluido."
  },
  {
    id: "civ-5",
    title: "Paseo en Góndola por los canales",
    destination: "Venecia",
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop",
    price: 33,
    currency: "EUR",
    duration: "30m",
    rating: 4.2,
    reviews: 12500,
    description: "Vive la magia de Venecia con un clásico paseo en góndola por sus canales históricos."
  },
  {
    id: "civ-6",
    title: "Tour de Contrastes de Nueva York",
    destination: "Nueva York",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
    price: 55,
    currency: "USD",
    duration: "4.5h",
    rating: 4.9,
    reviews: 32000,
    description: "El tour más famoso de Nueva York. Recorre el Bronx, Queens y Brooklyn descubriendo la diversidad cultural de la ciudad."
  },
  {
    id: "civ-7",
    title: "Visita guiada por el Palacio Real de Madrid",
    destination: "Madrid",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
    price: 39,
    currency: "EUR",
    duration: "1h 30m",
    rating: 4.7,
    reviews: 7600,
    description: "Haciendo esta visita guiada descubriremos los salones, estancias y jardines del palacio más grande de toda Europa Occidental."
  },
  {
    id: "civ-8",
    title: "Tour a Chichén Itzá y Cenote Sagrado",
    destination: "Cancún",
    image: "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&h=600&fit=crop",
    price: 79,
    currency: "USD",
    duration: "12h",
    rating: 4.8,
    reviews: 18000,
    description: "Visita una de las maravillas del mundo moderno y nada en un impresionante cenote subterráneo maya."
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase() || '';

    let filteredActivities = mockActivities;

    if (query) {
      filteredActivities = mockActivities.filter(a => 
        a.destination.toLowerCase().includes(query) || 
        a.title.toLowerCase().includes(query)
      );
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({
      success: true,
      data: filteredActivities,
      meta: {
        total: filteredActivities.length,
        source: 'civitatis_mock_api'
      }
    });

  } catch (error) {
    console.error('Error fetching mock Civitatis activities:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al consultar la API de Civitatis'
    }, { status: 500 });
  }
}
