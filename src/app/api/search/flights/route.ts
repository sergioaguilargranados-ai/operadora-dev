import { NextRequest, NextResponse } from 'next/server';
import { FlightAggregator } from '@/services/aggregators/FlightAggregator';
import { VueloUnificado } from '@/types/unified-travel';
import { db } from '@/lib/db';

// Mapper to adapt Unified Model to the Legacy Frontend format
function mapToFrontendFlight(vuelo: VueloUnificado, adults: number, airlinesMap: Record<string, any>) {
  const ida = vuelo.itinerarios[0];
  const numSegmentos = ida.segmentos.length;
  const primerSegmento = ida.segmentos[0];
  const ultimoSegmento = ida.segmentos[numSegmentos - 1];

  const departureDateObj = new Date(primerSegmento.fechaSalida);
  const arrivalDateObj = new Date(ultimoSegmento.fechaLlegada);

  const stops = numSegmentos - 1;

  // Extraer precio por persona asumiendo partes iguales
  const pricePerPerson = vuelo.precioTotal / (adults || 1);

  const iataCode = primerSegmento.aerolinea.iataCode;
  const catalogAirline = airlinesMap[iataCode];
  const finalLogo = catalogAirline?.logo_url || primerSegmento.aerolinea.logoUrl || `https://pics.avs.io/200/200/${iataCode}.png`;
  const finalName = catalogAirline?.name || primerSegmento.aerolinea.nombre || iataCode;

  return {
    id: vuelo.id,
    airline: finalName,
    logo: finalLogo,
    flightNumber: primerSegmento.numeroVuelo,
    origin: primerSegmento.origen.iataCode,
    destination: ultimoSegmento.destino.iataCode,
    departureDate: departureDateObj.toISOString().split('T')[0],
    departureTime: departureDateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    arrivalTime: arrivalDateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    duration: `${Math.floor(ida.duracionMinutos / 60)}h ${ida.duracionMinutos % 60}m`,
    stops,
    stopsInfo: stops > 0 ? `${stops} escala${stops > 1 ? 's' : ''}` : 'Directo',
    price: vuelo.precioTotal,
    pricePerPerson,
    currency: vuelo.moneda,
    cabinClass: primerSegmento.claseCabina,
    seatsAvailable: 9, // Dummy if not provided
    baggage: {
      carryOn: 'Incluido',
      checked: 'Consulta detalles'
    },
    amenities: ['Comida', 'Entretenimiento'],
    provider: vuelo.proveedor,
    tarifa: 'Standard'
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const origin = searchParams.get('origin') || 'MEX';
    const destination = searchParams.get('destination') || 'CUN';
    const date = searchParams.get('date') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const adults = parseInt(searchParams.get('adults') || '1');
    const returnDate = searchParams.get('returnDate');
    const cabinClass = searchParams.get('cabinClass') || 'economy';

    const cleanOrigin = origin.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const cleanDestination = destination.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').substring(0, 3).toUpperCase();

    // Cargar catálogo de aerolíneas local
    let airlinesMap: Record<string, any> = {};
    try {
      const res = await db.query('SELECT * FROM airlines_catalog');
      res.rows.forEach((r: any) => { airlinesMap[r.iata_code] = r; });
    } catch (e) {
      // Ignore if table doesn't exist yet
    }

    // Invocar al Agregador
    const aggregator = new FlightAggregator();
    
    // Vuelos de Ida
    const outboundResult = await aggregator.buscarVuelos({
      origen: cleanOrigin,
      destino: cleanDestination,
      fechaSalida: date,
      pasajeros: [{ tipo: 'adult', cantidad: adults }],
      claseCabina: cabinClass as any
    });

    const outboundFlights = outboundResult.resultados.map(v => mapToFrontendFlight(v, adults, airlinesMap));

    // Vuelos de Regreso
    let returnFlights: any[] = [];
    if (returnDate) {
      const returnResult = await aggregator.buscarVuelos({
        origen: cleanDestination,
        destino: cleanOrigin,
        fechaSalida: returnDate,
        pasajeros: [{ tipo: 'adult', cantidad: adults }],
        claseCabina: cabinClass as any
      });
      returnFlights = returnResult.resultados.map(v => mapToFrontendFlight(v, adults, airlinesMap));
    }

    // Identificar y guardar aerolíneas nuevas asincrónicamente
    const allFlights = [...outboundResult.resultados, ...(returnDate ? returnFlights : [])];
    const missingAirlines = new Map<string, {name: string, logo: string}>();
    allFlights.forEach((v: any) => {
      const seg = v.itinerarios?.[0]?.segmentos?.[0] || v;
      const iata = seg.aerolinea?.iataCode || seg.airline;
      if (iata && !airlinesMap[iata]) {
        missingAirlines.set(iata, {
          name: seg.aerolinea?.nombre || seg.airline || iata,
          logo: seg.aerolinea?.logoUrl || seg.logo || `https://pics.avs.io/200/200/${iata}.png`
        });
      }
    });

    if (missingAirlines.size > 0) {
      // No bloqueamos la respuesta del API para insertar
      setTimeout(async () => {
        try {
          await db.query(`CREATE TABLE IF NOT EXISTS airlines_catalog (iata_code VARCHAR(10) PRIMARY KEY, name VARCHAR(255), logo_url TEXT, is_custom BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
          for (const [iata, data] of missingAirlines.entries()) {
            await db.query(`INSERT INTO airlines_catalog (iata_code, name, logo_url) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [iata, data.name, data.logo]);
          }
        } catch(e) {}
      }, 0);
    }

    return NextResponse.json({
      success: true,
      data: {
        outbound: outboundFlights,
        return: returnFlights
      },
      searchParams: {
        origin: cleanOrigin,
        destination: cleanDestination,
        date,
        returnDate,
        adults,
        cabinClass
      },
      count: outboundFlights.length,
      provider: outboundResult.proveedorInfo
    });

  } catch (error: any) {
    console.error('Error searching flights via Aggregator:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al buscar vuelos'
    }, { status: 500 });
  }
}
