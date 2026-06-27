import { NextResponse } from 'next/server'
import { RestaurantAggregator } from '@/services/aggregators/RestaurantAggregator';
import { ParametrosBusquedaRestaurante } from '@/types/providers';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || searchParams.get('city') || 'Ciudad de México';
    const date = searchParams.get('date') || '';
    const diners = parseInt(searchParams.get('diners') || '2');

    const aggregator = new RestaurantAggregator();
    
    const params: ParametrosBusquedaRestaurante = {
        destino: query,
        fecha: date,
        comensales: diners
    };

    try {
        const respuesta = await aggregator.buscarRestaurantes(params);
        
        // El frontend espera el formato antiguo (Google Places), así que mapearemos 
        // RestauranteUnificado al formato antiguo temporalmente para no romper la UI,
        // o mejor aún, adaptamos el frontend para consumir RestauranteUnificado en un refactor futuro.
        // Por ahora, mapeamos RestauranteUnificado -> Restaurant del frontend.
        
        const mappedResults = respuesta.resultados.map(r => ({
            place_id: r.id,
            name: r.nombre,
            photos: r.imagenes.length > 0 ? [{ photo_reference: r.imagenes[0] }] : [],
            rating: r.rating,
            user_ratings_total: r.totalResenas,
            price_level: r.nivelPrecio,
            vicinity: r.direccion,
            geometry: { location: r.coordenadas },
            opening_hours: { open_now: r.abiertoAhora },
            types: r.etiquetas,
            cuisine: r.cocina,
            provider: r.proveedor,
            urlReserva: r.urlReserva,
            permiteReservaNativa: r.permiteReservaNativa
        }));

        return NextResponse.json({
            results: mappedResults,
            status: respuesta.exito ? "OK" : "ERROR",
            source: respuesta.proveedorInfo,
            errores: respuesta.errores,
            tiempoRespuestaMs: respuesta.tiempoRespuestaMs
        });

    } catch (error: any) {
        return NextResponse.json({
            results: [],
            status: "ERROR",
            source: "Aggregator Error",
            errores: [error.message]
        }, { status: 500 });
    }
}
