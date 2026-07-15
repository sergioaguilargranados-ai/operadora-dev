import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { DestinationContentService } from '@/services/DestinationContentService'

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`SELECT id, title FROM itineraries WHERE title ILIKE '%gran tour de europa%'`);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No se encontró el itinerario Gran Tour de Europa.' }, { status: 404 });
    }

    const itinerary = result.rows[0];
    
    // Obtener destinos únicos
    const plan = await DestinationContentService.getEnrichmentPlan(itinerary.id);
    const cities = plan.map((p: any) => p.city).join(', ');

    // Borrar de cache
    for (const dest of plan) {
      const key = DestinationContentService.generateDestinationKey(dest.city, dest.country);
      await DestinationContentService.deleteContent(key);
    }

    // Enriquecer (se ejecuta de forma asíncrona en segundo plano para no dar timeout en la petición)
    DestinationContentService.enrichItineraryDays(itinerary.id).catch(err => {
      console.error("Error en generación asíncrona de itinerario:", err)
    })

    return NextResponse.json({ 
      success: true, 
      message: `Regeneración iniciada en segundo plano. Esto tomará varios minutos. Destinos: ${cities}`
    });

  } catch (error: any) {
    console.error('Error en regenerate-tour:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
