import { IProveedorActividad, ParametrosBusquedaActividad, RespuestaBusqueda } from '@/types/providers';
import { ActividadUnificada } from '@/types/unified-travel';

export class BigBusAdapter implements IProveedorActividad {
  nombreProveedor = 'bigbus';

  async buscarActividades(params: ParametrosBusquedaActividad): Promise<RespuestaBusqueda<ActividadUnificada>> {
    const inicio = Date.now();

    try {
      const destinoLower = params.destino.toLowerCase();
      
      // Simulación de BigBus Partners API / Feed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockActividades: ActividadUnificada[] = [
        {
          id: 'bb-1',
          proveedor: 'bigbus',
          referenciaProveedor: 'bb-' + destinoLower,
          titulo: `Big Bus Tours ${params.destino}: Autobús Turístico Hop-On Hop-Off`,
          destino: params.destino,
          imagenPrincipal: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&fit=crop',
          galeria: [],
          precioDesde: 35,
          moneda: 'USD',
          duracion: '1-2 Días',
          rating: 4.5,
          totalResenas: 3420,
          descripcionCorta: 'Descubre los mejores puntos de interés a tu propio ritmo con nuestro autobús turístico de dos pisos.',
          linkAfiliado: `https://www.bigbuspartners.com/affiliate?dest=${encodeURIComponent(params.destino)}`,
          categoriasPrecio: [
            { id: 'adult', nombre: 'Adulto', precio: 35 },
            { id: 'child', nombre: 'Niño', precio: 25 }
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
        errores: [error.message || 'Error en BigBus Adapter'],
        tiempoRespuestaMs: Date.now() - inicio
      };
    }
  }
}
