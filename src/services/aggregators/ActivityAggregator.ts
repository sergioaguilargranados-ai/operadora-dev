import { IProveedorActividad, ParametrosBusquedaActividad, RespuestaBusqueda } from '@/types/providers';
import { ActividadUnificada } from '@/types/unified-travel';
import { CivitatisAdapter } from '../providers/civitatis/CivitatisAdapter';
import { ViatorAdapter } from '../providers/viator/ViatorAdapter';
import { query } from '@/lib/db';

export class ActivityAggregator {
  private proveedores: IProveedorActividad[] = [];

  constructor() {
    this.proveedores.push(new CivitatisAdapter());
    this.proveedores.push(new ViatorAdapter());
  }

  async buscarActividades(params: ParametrosBusquedaActividad): Promise<RespuestaBusqueda<ActividadUnificada>> {
    const inicio = Date.now();

    try {
      const proveedoresActivos = this.proveedores;

      if (proveedoresActivos.length === 0) {
         return {
           exito: false,
           resultados: [],
           proveedorInfo: 'agregador',
           errores: ['No hay proveedores de actividades activos.'],
           tiempoRespuestaMs: Date.now() - inicio
         };
      }

      const promesas = proveedoresActivos.map(proveedor => proveedor.buscarActividades(params));
      const respuestas = await Promise.allSettled(promesas);

      let todasLasActividades: ActividadUnificada[] = [];
      const errores: string[] = [];
      const proveedoresExitosos: string[] = [];
      const metricasPromesas: Promise<any>[] = [];

      respuestas.forEach((resultado, index) => {
        const nombreProveedor = proveedoresActivos[index].nombreProveedor;
        const tiempoRespuestaMs = resultado.status === 'fulfilled' && resultado.value.tiempoRespuestaMs 
            ? resultado.value.tiempoRespuestaMs 
            : (Date.now() - inicio);

        if (resultado.status === 'fulfilled' && resultado.value.exito) {
          const cantidadLeidos = resultado.value.resultados.length;
          todasLasActividades = todasLasActividades.concat(resultado.value.resultados);
          proveedoresExitosos.push(nombreProveedor);
          if (resultado.value.errores) errores.push(...resultado.value.errores);

          metricasPromesas.push(query(`
            INSERT INTO provider_metrics (provider_name, service_type, response_time_ms, results_count, success)
            VALUES ($1, $2, $3, $4, true)
          `, [
            nombreProveedor,
            'actividades',
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
            'actividades',
            tiempoRespuestaMs,
            0,
            msg.substring(0, 500)
          ]).catch(e => console.error('[Metrics] Error:', e)));
        }
      });

      await Promise.allSettled(metricasPromesas);

      // 4. Desduplicar (si ambos proveedores devuelven el mismo tour "1" de Roma)
      // Mantener el más barato
      const mapaUnicos = new Map<string, ActividadUnificada>();
      
      for (const act of todasLasActividades) {
        const existe = mapaUnicos.get(act.referenciaProveedor);
        if (!existe || act.precioDesde < existe.precioDesde) {
           mapaUnicos.set(act.referenciaProveedor, act);
        }
      }

      const unicos = Array.from(mapaUnicos.values());
      // Ordenar del más barato al más caro
      unicos.sort((a, b) => a.precioDesde - b.precioDesde);

      return {
        exito: unicos.length > 0 || errores.length === 0,
        resultados: unicos,
        proveedorInfo: proveedoresExitosos.join(', '),
        errores: errores.length > 0 ? errores : undefined,
        tiempoRespuestaMs: Date.now() - inicio
      };

    } catch (error: any) {
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
