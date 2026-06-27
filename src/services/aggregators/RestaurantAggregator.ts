import { IProveedorRestaurante, ParametrosBusquedaRestaurante, RespuestaBusqueda } from '@/types/providers';
import { RestauranteUnificado } from '@/types/unified-travel';
import { OpenTableAdapter } from '../providers/opentable/OpenTableAdapter';
import { query } from '@/lib/db';

export class RestaurantAggregator {
  private proveedores: IProveedorRestaurante[] = [];

  constructor() {
    // Inicializar y registrar los proveedores disponibles
    this.proveedores.push(new OpenTableAdapter());
    // Aquí agregaríamos GooglePlacesAdapter en el futuro
  }

  async buscarRestaurantes(params: ParametrosBusquedaRestaurante): Promise<RespuestaBusqueda<RestauranteUnificado>> {
    const inicio = Date.now();

    try {
      // 1. Validar qué proveedores están activos (simulado para este ejemplo)
      const proveedoresActivos = this.proveedores;

      if (proveedoresActivos.length === 0) {
         return {
           exito: false,
           resultados: [],
           proveedorInfo: 'agregador',
           errores: ['No hay proveedores de restaurantes activos.'],
           tiempoRespuestaMs: Date.now() - inicio
         };
      }

      // 2. Lanzar peticiones en paralelo a todos los proveedores activos
      const promesas = proveedoresActivos.map(proveedor => proveedor.buscarRestaurantes(params));
      const respuestas = await Promise.allSettled(promesas);

      let todosLosRestaurantes: RestauranteUnificado[] = [];
      const errores: string[] = [];
      const proveedoresExitosos: string[] = [];
      const metricasPromesas: Promise<any>[] = [];

      // 3. Recolectar resultados y loguear metricas exactas en ms (convertibles a segundos)
      respuestas.forEach((resultado, index) => {
        const nombreProveedor = proveedoresActivos[index].nombreProveedor;
        const tiempoRespuestaMs = resultado.status === 'fulfilled' && resultado.value.tiempoRespuestaMs 
            ? resultado.value.tiempoRespuestaMs 
            : (Date.now() - inicio);

        if (resultado.status === 'fulfilled' && resultado.value.exito) {
          const cantidadLeidos = resultado.value.resultados.length;
          todosLosRestaurantes = todosLosRestaurantes.concat(resultado.value.resultados);
          proveedoresExitosos.push(nombreProveedor);
          if (resultado.value.errores) errores.push(...resultado.value.errores);

          // Log metrics en BD (ms exactos)
          metricasPromesas.push(query(`
            INSERT INTO provider_metrics (provider_name, service_type, response_time_ms, results_count, success)
            VALUES ($1, $2, $3, $4, true)
          `, [
            nombreProveedor,
            'restaurantes',
            tiempoRespuestaMs,
            cantidadLeidos
          ]).catch(e => console.error('[Metrics] Error:', e)));

        } else {
          const msg = resultado.status === 'rejected' ? String(resultado.reason) : (resultado.value.errores?.join(', ') || 'Error desconocido');
          errores.push(`[${nombreProveedor}] ${msg}`);
          
          metricasPromesas.push(query(`
            INSERT INTO provider_metrics (provider_name, service_type, response_time_ms, results_count, success, error_message)
            VALUES ($1, $2, $3, $4, false, $5)
          `, [
            nombreProveedor,
            'restaurantes',
            tiempoRespuestaMs,
            0,
            msg.substring(0, 500)
          ]).catch(e => console.error('[Metrics] Error:', e)));
        }
      });

      // Esperar a que se inserten las métricas antes de retornar
      await Promise.allSettled(metricasPromesas);

      // 4. Ordenar resultados por rating y desduplicar (simulado por ID)
      const unicos = Array.from(new Map(todosLosRestaurantes.map(item => [item.referenciaProveedor, item])).values());
      unicos.sort((a, b) => b.rating - a.rating);

      return {
        exito: unicos.length > 0 || errores.length === 0,
        resultados: unicos,
        proveedorInfo: proveedoresExitosos.join(', '),
        errores: errores.length > 0 ? errores : undefined,
        tiempoRespuestaMs: Date.now() - inicio
      };

    } catch (error: any) {
      console.error('[RestaurantAggregator] Error inesperado:', error);
      return {
        exito: false,
        resultados: [],
        proveedorInfo: 'agregador',
        errores: [error.message || 'Error general en el agregador'],
        tiempoRespuestaMs: Date.now() - inicio
      };
    }
  }
}
