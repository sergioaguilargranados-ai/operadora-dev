// Build: 19 Jun 2026

import { AmadeusAdapter } from '../AmadeusAdapter';
import { IProveedorVuelo, ParametrosBusquedaVuelo, RespuestaBusqueda } from '@/types/providers';
import { VueloUnificado, SegmentoVuelo } from '@/types/unified-travel';

export class AmadeusFlightProvider implements IProveedorVuelo {
  nombreProveedor = 'amadeus';
  private adapter: AmadeusAdapter;

  constructor() {
    const clientId = process.env.AMADEUS_API_KEY || '';
    const clientSecret = process.env.AMADEUS_API_SECRET || '';
    const useSandbox = process.env.AMADEUS_SANDBOX === 'true';
    
    this.adapter = new AmadeusAdapter(clientId, clientSecret, useSandbox);
  }

  async buscarVuelos(params: ParametrosBusquedaVuelo): Promise<RespuestaBusqueda<VueloUnificado>> {
    const inicio = Date.now();
    try {
      if (!process.env.AMADEUS_API_KEY) {
        // MOCK DATA SI NO HAY LLAVE
        return this.getMockData(params, inicio);
      }

      const searchParams: any = {
        originLocationCode: params.origenIata,
        destinationLocationCode: params.destinoIata,
        departureDate: params.fechaSalida,
        adults: params.pasajeros.adultos,
      };

      if (params.fechaRegreso) searchParams.returnDate = params.fechaRegreso;
      if (params.pasajeros.ninos) searchParams.children = params.pasajeros.ninos;
      if (params.pasajeros.bebes) searchParams.infants = params.pasajeros.bebes;
      if (params.clase) {
        const classMap: any = {
          economy: 'ECONOMY',
          premium_economy: 'PREMIUM_ECONOMY',
          business: 'BUSINESS',
          first: 'FIRST'
        };
        searchParams.travelClass = classMap[params.clase] || 'ECONOMY';
      }

      const results = await this.adapter.search(searchParams);

      const vuelosUnificados: VueloUnificado[] = results.map(offer => {
        const outbound = offer.details.outbound;
        const inbound = offer.details.inbound;
        
        const itinerarios = [];
        
        // Ida
        itinerarios.push({
          duracionMinutos: this.parseDuration(outbound.duration),
          segmentos: outbound.segments.map((seg: any) => ({
            origen: { iataCode: seg.departure.airport },
            destino: { iataCode: seg.arrival.airport },
            fechaSalida: seg.departure.time,
            fechaLlegada: seg.arrival.time,
            aerolinea: { iataCode: seg.carrier, nombre: seg.carrier },
            numeroVuelo: seg.flightNumber,
            duracionMinutos: 0, // Approximated or missing from normalized Amadeus
            claseCabina: params.clase || 'economy'
          }))
        });

        // Regreso
        if (inbound) {
          itinerarios.push({
            duracionMinutos: this.parseDuration(inbound.duration),
            segmentos: inbound.segments.map((seg: any) => ({
              origen: { iataCode: seg.departure.airport },
              destino: { iataCode: seg.arrival.airport },
              fechaSalida: seg.departure.time,
              fechaLlegada: seg.arrival.time,
              aerolinea: { iataCode: seg.carrier, nombre: seg.carrier },
              numeroVuelo: seg.flightNumber,
              duracionMinutos: 0,
              claseCabina: params.clase || 'economy'
            }))
          });
        }

        return {
          id: offer.id,
          proveedor: this.nombreProveedor,
          referenciaProveedor: offer.id,
          precioTotal: offer.price,
          moneda: offer.currency,
          itinerarios,
          pasajeros: [
            { tipo: 'adult', cantidad: params.pasajeros.adultos },
            { tipo: 'child', cantidad: params.pasajeros.ninos },
            { tipo: 'infant', cantidad: params.pasajeros.bebes },
          ].filter(p => p.cantidad > 0)
        };
      });

      return {
        exito: true,
        resultados: vuelosUnificados,
        proveedorInfo: this.nombreProveedor,
        tiempoRespuestaMs: Date.now() - inicio
      };

    } catch (error: any) {
      console.error('[AmadeusFlightProvider] Error:', error);
      return {
        exito: false,
        resultados: [],
        proveedorInfo: this.nombreProveedor,
        errores: [error.message || 'Error desconocido en Amadeus'],
        tiempoRespuestaMs: Date.now() - inicio
      };
    }
  }

  private parseDuration(isoDuration: string | null): number {
    if (!isoDuration) return 0;
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    return hours * 60 + minutes;
  }

  private getMockData(params: ParametrosBusquedaVuelo, inicio: number): RespuestaBusqueda<VueloUnificado> {
    return {
      exito: true,
      proveedorInfo: this.nombreProveedor,
      tiempoRespuestaMs: Date.now() - inicio,
      resultados: [
        {
          id: 'mock-amadeus-1',
          proveedor: this.nombreProveedor,
          referenciaProveedor: 'mock-1',
          precioTotal: 6500,
          moneda: 'MXN',
          itinerarios: [{
            duracionMinutos: 150,
            segmentos: [{
              origen: { iataCode: params.origenIata },
              destino: { iataCode: params.destinoIata },
              fechaSalida: params.fechaSalida + 'T09:00:00Z',
              fechaLlegada: params.fechaSalida + 'T11:30:00Z',
              aerolinea: { iataCode: 'AM', nombre: 'Aeroméxico', logoUrl: 'https://pics.avs.io/200/200/AM.png' },
              numeroVuelo: 'AM200',
              duracionMinutos: 150,
              claseCabina: 'economy' as any
            }]
          }],
          pasajeros: [{ tipo: 'adult', cantidad: params.pasajeros.adultos }]
        }
      ]
    };
  }
}
