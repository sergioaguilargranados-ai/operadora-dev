import { IProveedorRestaurante, ParametrosBusquedaRestaurante, RespuestaBusqueda } from '@/types/providers';
import { RestauranteUnificado } from '@/types/unified-travel';

export class OpenTableAdapter implements IProveedorRestaurante {
  nombreProveedor = 'opentable';

  async buscarRestaurantes(params: ParametrosBusquedaRestaurante): Promise<RespuestaBusqueda<RestauranteUnificado>> {
    const inicio = Date.now();

    try {
      // Simulación de retraso de red
      await new Promise(resolve => setTimeout(resolve, 800));

      const destinoLower = params.destino.toLowerCase();
      
      // Mock Data (Simulando lo que respondería OpenTable API)
      const mockRestaurantes: RestauranteUnificado[] = [
        {
          id: 'ot-10293',
          proveedor: 'opentable',
          referenciaProveedor: '10293',
          nombre: 'La Bella Italia (Reserva Oficial)',
          imagenes: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&fit=crop'],
          rating: 4.7,
          totalResenas: 342,
          nivelPrecio: 2,
          direccion: 'Av. Reforma 123',
          coordenadas: { lat: 19.4326, lng: -99.1332 },
          abiertoAhora: true,
          cocina: ['Italiana', 'Pizza'],
          etiquetas: ['Romántico', 'Ocasiones especiales'],
          permiteReservaNativa: true
        },
        {
          id: 'ot-99381',
          proveedor: 'opentable',
          referenciaProveedor: '99381',
          nombre: 'Suntory Lomas',
          imagenes: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&fit=crop'],
          rating: 4.9,
          totalResenas: 1250,
          nivelPrecio: 4,
          direccion: 'Lomas de Chapultepec',
          coordenadas: { lat: 19.4226, lng: -99.2032 },
          abiertoAhora: true,
          cocina: ['Japonesa', 'Sushi'],
          etiquetas: ['Negocios', 'Lujo'],
          permiteReservaNativa: true
        }
      ];

      return {
        exito: true,
        resultados: mockRestaurantes,
        proveedorInfo: this.nombreProveedor,
        tiempoRespuestaMs: Date.now() - inicio
      };

    } catch (error: any) {
      return {
        exito: false,
        resultados: [],
        proveedorInfo: this.nombreProveedor,
        errores: [error.message || 'Error en OpenTable API'],
        tiempoRespuestaMs: Date.now() - inicio
      };
    }
  }
}
