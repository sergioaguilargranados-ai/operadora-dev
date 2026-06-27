import { IProveedorActividad, ParametrosBusquedaActividad, RespuestaBusqueda } from '@/types/providers';
import { ActividadUnificada } from '@/types/unified-travel';

export class ViatorAdapter implements IProveedorActividad {
  nombreProveedor = 'viator';

  async buscarActividades(params: ParametrosBusquedaActividad): Promise<RespuestaBusqueda<ActividadUnificada>> {
    const inicio = Date.now();

    try {
      // Simulación de respuesta de Viator
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const mockActividades: ActividadUnificada[] = [
        {
          id: 'via-8821',
          proveedor: 'viator',
          referenciaProveedor: '1', // Mismo tour que civitatis, diferente proveedor
          titulo: 'Coliseo, Foro Romano y Monte Palatino Tour Oficial',
          destino: 'Roma',
          imagenPrincipal: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&fit=crop',
          galeria: [],
          precioDesde: 42, // Viator es más barato en este mock
          moneda: 'EUR',
          duracion: '3h',
          rating: 4.6,
          totalResenas: 980,
          descripcionCorta: 'Tour completo por la antigua Roma con guía.',
          categoriasPrecio: [
            { id: 'adult', nombre: 'Adulto', precio: 42 },
            { id: 'child', nombre: 'Niño', precio: 28 }
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
        errores: [error.message || 'Error en Viator API'],
        tiempoRespuestaMs: Date.now() - inicio
      };
    }
  }
}
