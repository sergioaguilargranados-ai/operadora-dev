import { IProveedorActividad, ParametrosBusquedaActividad, RespuestaBusqueda } from '@/types/providers';
import { ActividadUnificada } from '@/types/unified-travel';

export class CivitatisAdapter implements IProveedorActividad {
  nombreProveedor = 'civitatis';

  async buscarActividades(params: ParametrosBusquedaActividad): Promise<RespuestaBusqueda<ActividadUnificada>> {
    const inicio = Date.now();

    try {
      // Simulación de respuesta de Civitatis
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const destinoLower = params.destino.toLowerCase();

      const mockActividades: ActividadUnificada[] = [
        {
          id: 'civ-1',
          proveedor: 'civitatis',
          referenciaProveedor: '1',
          titulo: 'Visita guiada por el Coliseo, Foro y Palatino',
          destino: 'Roma',
          imagenPrincipal: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&fit=crop',
          galeria: [
            'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&fit=crop',
            'https://images.unsplash.com/photo-1552432552-06c31149e211?w=800&fit=crop',
            'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800&fit=crop'
          ],
          precioDesde: 45,
          moneda: 'EUR',
          duracion: '3h',
          rating: 4.8,
          totalResenas: 1250,
          descripcionCorta: 'Explora el monumento más emblemático de Roma...',
          incluye: ['Guía oficial', 'Entrada sin colas'],
          noIncluye: ['Comida', 'Transporte al hotel'],
          categoriasPrecio: [
            { id: 'adult', nombre: 'Adulto', precio: 45 },
            { id: 'child', nombre: 'Niño (4-12)', precio: 30 }
          ]
        }
      ];

      return {
        exito: true,
        resultados: mockActividades,
        proveedorInfo: this.nombreProveedor,
        tiempoRespuestaMs: Date.now() - inicio
      };

    } catch (error: any) {
      return {
        exito: false,
        resultados: [],
        proveedorInfo: this.nombreProveedor,
        errores: [error.message || 'Error en Civitatis API'],
        tiempoRespuestaMs: Date.now() - inicio
      };
    }
  }
}
