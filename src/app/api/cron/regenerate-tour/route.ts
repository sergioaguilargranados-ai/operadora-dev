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

    // Enriquecer (se ejecuta en un proceso de Node.js independiente para garantizar que la respuesta HTTP termine inmediatamente)
    const { spawn } = require('child_process');
    const child = spawn('npx', ['tsx', 'scripts/regenerate_tour_data.ts', itinerary.id.toString()], {
      detached: true,
      stdio: 'ignore',
      cwd: process.cwd()
    });
    child.unref();

    return NextResponse.json({ 
      success: true, 
      message: `Regeneración iniciada en segundo plano. Esto tomará varios minutos. Destinos: ${cities}`
    });

  } catch (error: any) {
    console.error('Error en regenerate-tour:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
