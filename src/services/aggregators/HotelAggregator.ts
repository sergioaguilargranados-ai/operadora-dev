// Build: 03 Jun 2026 - 16:45 CST - v2.342

import { HotelbedsAdapter } from '../providers/hotelbeds/HotelbedsAdapter';
import { RatehawkAdapter } from '../providers/ratehawk/RatehawkAdapter';
import { IProveedorHotel, ParametrosBusquedaHotel, RespuestaBusqueda } from '@/types/providers';
import { HotelUnificado } from '@/types/unified-travel';

export class HotelAggregator {
  private proveedores: IProveedorHotel[] = [];

  constructor() {
    this.proveedores.push(new HotelbedsAdapter());
    this.proveedores.push(new RatehawkAdapter());
  }

  async buscarHoteles(params: ParametrosBusquedaHotel): Promise<RespuestaBusqueda<HotelUnificado>> {
    const inicio = Date.now();

    try {
      // 1. Peticiones en paralelo
      const promesas = this.proveedores.map(proveedor => proveedor.buscarHoteles(params));
      const respuestas = await Promise.allSettled(promesas);

      let todosLosHoteles: HotelUnificado[] = [];
      const errores: string[] = [];
      const proveedoresExitosos: string[] = [];

      // 2. Recolectar resultados
      respuestas.forEach((resultado, index) => {
        const nombreProveedor = this.proveedores[index].nombreProveedor;

        if (resultado.status === 'fulfilled' && resultado.value.exito) {
          todosLosHoteles = todosLosHoteles.concat(resultado.value.resultados);
          proveedoresExitosos.push(nombreProveedor);
          if (resultado.value.errores) errores.push(...resultado.value.errores);
        } else {
          const msg = resultado.status === 'rejected' ? resultado.reason : (resultado.value.errores?.join(', ') || 'Error desconocido');
          errores.push(`[${nombreProveedor}] ${msg}`);
        }
      });

      // 3. Deduplicación (Unificar hoteles de distintos proveedores)
      // Mapeo (normalmente se usa un sistema de mapeo de IDs como GIATA, por simplicidad combinamos por nombre o ID estático)
      const hotelesUnificadosMap = new Map<string, HotelUnificado>();

      for (const hotel of todosLosHoteles) {
        // TODO: En producción, usar ID de mapeo real (GIATA) en lugar de hotel.id que es del proveedor
        const deduplicationKey = `MOCK_GIATA_${hotel.nombre}`; 
        
        if (hotelesUnificadosMap.has(deduplicationKey)) {
          // Si ya existe, le agregamos las ofertas de este nuevo proveedor
          const hotelExistente = hotelesUnificadosMap.get(deduplicationKey)!;
          hotelExistente.ofertasDisponibles.push(...hotel.ofertasDisponibles);
          hotelExistente.proveedor = 'agregador'; // Indicamos que viene de múltiples
        } else {
          hotelesUnificadosMap.set(deduplicationKey, hotel);
        }
      }

      let resultadosFinales = Array.from(hotelesUnificadosMap.values());

      // 4. Ordenar cada hotel para mostrar su oferta más barata primero
      for (const hotel of resultadosFinales) {
        hotel.ofertasDisponibles.sort((a, b) => a.precioTotal - b.precioTotal);
      }

      // Ordenar lista de hoteles por precio más bajo
      resultadosFinales.sort((a, b) => {
        const precioA = a.ofertasDisponibles[0]?.precioTotal || 999999;
        const precioB = b.ofertasDisponibles[0]?.precioTotal || 999999;
        return precioA - precioB;
      });

      return {
        exito: resultadosFinales.length > 0 || errores.length === 0,
        resultados: resultadosFinales,
        proveedorInfo: proveedoresExitosos.join(', '),
        errores: errores.length > 0 ? errores : undefined,
        tiempoRespuestaMs: Date.now() - inicio
      };

    } catch (error: any) {
      console.error('[HotelAggregator] Error:', error);
      return {
        exito: false,
        resultados: [],
        proveedorInfo: 'agregador',
        errores: [error.message || 'Error general en agregador de hoteles'],
        tiempoRespuestaMs: Date.now() - inicio
      };
    }
  }
}
