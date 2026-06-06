// Build: 03 Jun 2026 - 16:45 CST - v2.342

import { IProveedorHotel, ParametrosBusquedaHotel, RespuestaBusqueda } from '@/types/providers';
import { HotelUnificado, OfertaHotelUnificada } from '@/types/unified-travel';

export class RatehawkAdapter implements IProveedorHotel {
  nombreProveedor = 'ratehawk';
  private apiKey: string;
  private keyId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.RATEHAWK_API_KEY || '';
    this.keyId = process.env.RATEHAWK_KEY_ID || '';
    
    // RateHawk usa B2B endpoints
    this.baseUrl = 'https://api.worldota.net/api/b2b/v3';
  }

  private getHeaders(): HeadersInit {
    // Basic Auth usando Key ID y API Key
    const auth = Buffer.from(`${this.keyId}:${this.apiKey}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async buscarHoteles(params: ParametrosBusquedaHotel): Promise<RespuestaBusqueda<HotelUnificado>> {
    const inicio = Date.now();
    try {
      // 1. Mapear parámetros a formato RateHawk (Search API)
      // Ratehawk espera invitados en formato: [{adults: 2, children: [5, 7]}]
      const guests = params.habitaciones.map(hab => ({
        adults: hab.adultos,
        children: hab.edadesNinos || []
      }));

      const requestBody = {
        checkin: params.fechaEntrada,
        checkout: params.fechaSalida,
        residency: 'mx', // País de residencia para tarifas correctas
        language: 'es',
        guests: guests,
        region_id: parseInt(params.destino) || 0, // RateHawk requiere un ID numérico de región
        // si no es numérico, idealmente se busca por lat/long (radius) o hotel_ids
      };

      // Si el destino no es un número (ID de RateHawk), simulamos un error por ahora
      if (!requestBody.region_id) {
        throw new Error('RateHawk requiere un region_id numérico. Usa el endpoint de autocompletado antes de buscar.');
      }

      // 2. Llamada a la API de RateHawk (Búsqueda de Disponibilidad - Async o Sync)
      // Usaremos la versión Sync para el agregador inicial
      const response = await fetch(`${this.baseUrl}/search/serp/region/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error RateHawk: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // 3. Mapear respuesta a HotelUnificado
      const hotelesUnificados: HotelUnificado[] = [];

      if (data.status === 'ok' && data.data?.hotels) {
        for (const rhHotel of data.data.hotels) {
          
          const ofertas: OfertaHotelUnificada[] = rhHotel.rates.map((rate: any) => ({
            id: rate.book_hash,
            proveedor: this.nombreProveedor,
            habitacion: {
              nombre: rate.room_name,
              capacidadAdultos: 2, 
              capacidadNinos: 0
            },
            precioTotal: parseFloat(rate.payment_options.payment_types[0].amount), 
            moneda: rate.payment_options.payment_types[0].currency_code,
            politicaCancelacion: {
              esReembolsable: rate.cancellation_info?.policies?.length > 0 && !rate.cancellation_info.policies[0].is_non_refundable,
              fechaLimiteGratuita: rate.cancellation_info?.free_cancellation_before,
            },
            incluyeDesayuno: rate.meal === 'breakfast',
            detallesExtra: {
              meal: rate.meal,
              paymentType: rate.payment_options.payment_types[0].type // ej: deposit, now
            }
          }));

          hotelesUnificados.push({
            id: rhHotel.id, // Ratehawk hotel ID (ej: "test_hotel")
            proveedor: this.nombreProveedor,
            referenciaProveedor: rhHotel.id,
            nombre: `Hotel RateHawk ${rhHotel.id}`, // De nuevo, la info real está en Content API
            estrellas: 0, 
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
      console.error('[RatehawkAdapter] Error:', error);
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
