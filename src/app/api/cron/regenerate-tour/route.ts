import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { DestinationContentService } from '@/services/DestinationContentService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let childArgs = ['tsx', 'scripts/regenerate_tour_data.ts'];
    let message = 'Regeneración iniciada en lote (últimos 5 modificados) en segundo plano.';

    if (id) {
      childArgs.push(id.toString());
      message = `Regeneración iniciada en segundo plano para el itinerario ID ${id}. Esto tomará varios minutos.`;
    }

    // Enriquecer (se ejecuta en un proceso de Node.js independiente para garantizar que la respuesta HTTP termine inmediatamente)
    const { spawn } = require('child_process');
    const child = spawn('npx', childArgs, {
      detached: true,
      stdio: 'ignore',
      cwd: process.cwd()
    });
    child.unref();

    return NextResponse.json({ 
      success: true, 
      message: message
    });

  } catch (error: any) {
    console.error('Error en regenerate-tour:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
