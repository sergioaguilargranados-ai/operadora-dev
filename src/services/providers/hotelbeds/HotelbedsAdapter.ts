// Build: 03 Jun 2026 - 16:45 CST - v2.342

import crypto from 'crypto';
import { IProveedorHotel, ParametrosBusquedaHotel, RespuestaBusqueda } from '@/types/providers';
import { HotelUnificado, OfertaHotelUnificada } from '@/types/unified-travel';

export class HotelbedsAdapter implements IProveedorHotel {
  nombreProveedor = 'hotelbeds';
  private apiKey: string;
  private secret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.HOTELBEDS_API_KEY || '';
    this.secret = process.env.HOTELBEDS_SECRET || '';
    // Usar entorno de test por defecto si no se especifica prod
    this.baseUrl = process.env.HOTELBEDS_ENV === 'production' 
      ? 'https://api.hotelbeds.com/hotel-api/1.0'
      : 'https://api.test.hotelbeds.com/hotel-api/1.0';
  }

  /**
   * Genera el X-Signature requerido por Hotelbeds:
   * SHA256(ApiKey + Secret + Timestamp in seconds)
   */
  private generateSignature(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const dataToHash = this.apiKey + this.secret + timestamp;
    return crypto.createHash('sha256').update(dataToHash).digest('hex');
  }

  private getHeaders(): HeadersInit {
    return {
      'Api-key': this.apiKey,
      'X-Signature': this.generateSignature(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async buscarHoteles(params: ParametrosBusquedaHotel): Promise<RespuestaBusqueda<HotelUnificado>> {
    const inicio = Date.now();
    try {
      // 1. Mapear parámetros a formato Hotelbeds (Availability API)
      const occupancies = params.habitaciones.map((hab, index) => ({
        rooms: 1,
        adults: hab.adultos,
        children: hab.edadesNinos?.length || 0,
        paxes: [
          ...Array(hab.adultos).fill({ type: 'AD' }),
          ...(hab.edadesNinos?.map(age => ({ type: 'CH', age })) || [])
        ]
      }));

      const requestBody = {
        stay: {
          checkIn: params.fechaEntrada,
          checkOut: params.fechaSalida
        },
        occupancies,
        destination: {
          code: params.destino // En Hotelbeds, es un destination code de 3 letras (ej. PMI, CAN)
        }
      };

      // 2. Llamada a la API
      const response = await fetch(`${this.baseUrl}/hotels`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error Hotelbeds: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // 3. Mapear respuesta a HotelUnificado
      // Nota: Hotelbeds availability solo devuelve datos de precios/tarifas.
      // El nombre y fotos del hotel normalmente se sacan de la Content API y se cachean.
      // Aquí mapeamos la info básica disponible en la respuesta de availability.
      
      const hotelesUnificados: HotelUnificado[] = [];

      if (data.hotels && data.hotels.hotels) {
        for (const hbHotel of data.hotels.hotels) {
          
          const ofertas: OfertaHotelUnificada[] = hbHotel.rooms.flatMap((room: any) => 
            room.rates.map((rate: any) => ({
              id: rate.rateKey,
              proveedor: this.nombreProveedor,
              habitacion: {
                nombre: room.name,
                capacidadAdultos: 2, // Hotelbeds no siempre retorna esto en availability
                capacidadNinos: 0
              },
              precioTotal: parseFloat(rate.net), // Net price
              moneda: data.hotels.currency || 'USD',
              politicaCancelacion: {
                esReembolsable: rate.cancellationPolicies?.length > 0,
                fechaLimiteGratuita: rate.cancellationPolicies?.[0]?.from,
                penalidad: parseFloat(rate.cancellationPolicies?.[0]?.amount || '0')
              },
              incluyeDesayuno: rate.boardCode !== 'RO', // RO = Room Only
              detallesExtra: {
                boardName: rate.boardName,
                rateClass: rate.rateClass,
                allotment: rate.allotment // habitaciones disponibles a esta tarifa
              }
            }))
          );

          hotelesUnificados.push({
            id: hbHotel.code.toString(),
            proveedor: this.nombreProveedor,
            referenciaProveedor: hbHotel.code.toString(),
            nombre: hbHotel.name || `Hotel ${hbHotel.code}`, // Idealmente se cruza con Cache de Content API
            estrellas: parseInt(hbHotel.categoryCode?.charAt(0) || '0'), // ej: "4EST" -> 4
            descripcion: '', 
            imagenes: [],
            ubicacion: {
              ciudad: params.destino,
              direccion: '',
              pais: ''
            },
            amenidades: [],
            ofertasDisponibles: ofertas
          });
        }
      }

      return {
        exito: true,
        resultados: hotelesUnificados,
        proveedorInfo: this.nombreProveedor,
        tiempoRespuestaMs: Date.now() - inicio
      };

    } catch (error: any) {
      console.error('[HotelbedsAdapter] Error:', error);
      return {
        exito: false,
        resultados: [],
        proveedorInfo: this.nombreProveedor,
        errores: [error.message],
        tiempoRespuestaMs: Date.now() - inicio
      };
    }
  }
}
