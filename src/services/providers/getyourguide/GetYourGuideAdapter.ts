import { IProveedorActividad, ParametrosBusquedaActividad, RespuestaBusqueda } from '@/types/providers';
import { ActividadUnificada } from '@/types/unified-travel';

export class GetYourGuideAdapter implements IProveedorActividad {
  nombreProveedor = 'getyourguide';

  async buscarActividades(params: ParametrosBusquedaActividad): Promise<RespuestaBusqueda<ActividadUnificada>> {
    const inicio = Date.now();
    const apiKey = process.env.GYG_API_KEY;

    try {
      if (apiKey) {
        // Simulación de llamada a la API real de GetYourGuide
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Aquí iría el fetch real a la API de GetYourGuide:
        // const response = await fetch(`https://api.getyourguide.com/1/tours?query=${params.destino}`, { headers: { 'X-ACCESS-TOKEN': apiKey } });
      } else {
        // Fallback simulación Amadeus / Mock
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      const mockActividades: ActividadUnificada[] = [
        {
          id: 'gyg-991',
          proveedor: 'getyourguide',
          referenciaProveedor: 'gyg-rome-1',
          titulo: 'Tour Evite las Colas: Museos Vaticanos y Capilla Sixtina',
          destino: params.destino,
          imagenPrincipal: 'https://images.unsplash.com/photo-1572953109213-3be62398eb95?w=800&fit=crop',
          galeria: [],
          precioDesde: 55,
          moneda: 'EUR',
          duracion: '3.5h',
          rating: 4.7,
          totalResenas: 15400,
          descripcionCorta: 'Descubre las maravillas del Vaticano con un guía experto y evita las largas filas.',
          categoriasPrecio: [
            { id: 'adult', nombre: 'Adulto', precio: 55 },
            { id: 'child', nombre: 'Niño', precio: 35 }
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
        errores: [error.message || 'Error en GetYourGuide API'],
        tiempoRespuestaMs: Date.now() - inicio
      };
    }
  }
}
