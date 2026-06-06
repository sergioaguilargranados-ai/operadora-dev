// Build: 03 Jun 2026 - 16:30 CST - v2.342

import { Duffel } from '@duffel/api';
import { IProveedorVuelo, ParametrosBusquedaVuelo, RespuestaBusqueda } from '@/types/providers';
import { VueloUnificado, ItinerarioVuelo, SegmentoVuelo } from '@/types/unified-travel';

export class DuffelAdapter implements IProveedorVuelo {
  nombreProveedor = 'duffel';
  private client: Duffel;

  constructor() {
    // Es importante usar una variable de entorno. En desarrollo podemos fallback a una de prueba.
    const token = process.env.DUFFEL_ACCESS_TOKEN || '';
    this.client = new Duffel({
      token: token,
    });
  }

  async buscarVuelos(params: ParametrosBusquedaVuelo): Promise<RespuestaBusqueda<VueloUnificado>> {
    const inicio = Date.now();
    try {
      // 1. Mapear parámetros internos al formato de Duffel
      // Duffel espera un array de 'slices' (ej. ida, vuelta) y pasajeros
      const slices = [
        {
          origin: params.origenIata,
          destination: params.destinoIata,
          departure_date: params.fechaSalida,
        }
      ];

      if (params.fechaRegreso) {
        slices.push({
          origin: params.destinoIata,
          destination: params.origenIata,
          departure_date: params.fechaRegreso,
        });
      }

      const passengers = [];
      for (let i = 0; i < params.pasajeros.adultos; i++) passengers.push({ type: 'adult' });
      for (let i = 0; i < params.pasajeros.ninos; i++) passengers.push({ type: 'child' });
      for (let i = 0; i < params.pasajeros.bebes; i++) passengers.push({ type: 'infant_without_seat' });

      // 2. Hacer petición a Duffel API
      const response = await this.client.offerRequests.create({
        slices,
        passengers,
        cabin_class: params.clase || 'economy',
        return_offers: true, // Que de una vez nos regrese las ofertas
      });

      // 3. Mapear respuestas de Duffel al formato unificado de AS Operadora
      const vuelosUnificados: VueloUnificado[] = response.data.offers.map(offer => {
        return {
          id: offer.id,
          proveedor: this.nombreProveedor,
          referenciaProveedor: offer.id,
          precioTotal: parseFloat(offer.total_amount),
          moneda: offer.total_currency,
          itinerarios: offer.slices.map(slice => {
            const segmentos: SegmentoVuelo[] = slice.segments.map(segment => ({
              origen: { iataCode: segment.origin.iata_code },
              destino: { iataCode: segment.destination.iata_code },
              fechaSalida: segment.departing_at,
              fechaLlegada: segment.arriving_at,
              aerolinea: { 
                iataCode: segment.operating_carrier.iata_code,
                nombre: segment.operating_carrier.name
              },
              numeroVuelo: segment.operating_carrier_flight_number,
              duracionMinutos: this.parseDuration(segment.duration),
              claseCabina: segment.passengers[0]?.cabin_class as any || 'economy',
            }));

            return {
              duracionMinutos: this.parseDuration(slice.duration),
              segmentos
            };
          }),
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
      console.error('[DuffelAdapter] Error al buscar vuelos:', error);
      return {
        exito: false,
        resultados: [],
        proveedorInfo: this.nombreProveedor,
        errores: [error.message || 'Error desconocido al contactar Duffel'],
        tiempoRespuestaMs: Date.now() - inicio
      };
    }
  }

  /**
   * Helper para convertir strings de duración "PT2H30M" a minutos
   */
  private parseDuration(isoDuration: string | null): number {
    if (!isoDuration) return 0;
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    return hours * 60 + minutes;
  }
}
