import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar env variables
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

async function main() {
  // Importar dinámicamente para asegurar que process.env esté poblado primero
  const { pool } = await import('../src/lib/db');
  const { DestinationContentService } = await import('../src/services/DestinationContentService');

  console.log('🌍 Iniciando regeneración de datos ricos para Gran Tour de Europa...');

  // 1. Buscar el itinerario
  const result = await pool.query(`SELECT id, title FROM itineraries WHERE title ILIKE '%gran tour de europa%'`);
  
  if (result.rows.length === 0) {
    console.error('❌ No se encontró el itinerario Gran Tour de Europa.');
    process.exit(1);
  }

  const itinerary = result.rows[0];
  console.log(`✅ Itinerario encontrado: ${itinerary.title} (ID: ${itinerary.id})`);

  // 2. Obtener los destinos únicos del itinerario usando el plan de enriquecimiento
  const plan = await DestinationContentService.getEnrichmentPlan(itinerary.id);
  console.log(`🗺️ Destinos a enriquecer (${plan.length}):`, plan.map((p: any) => p.city).join(', '));

  // 3. Borrar de cache (destination_content) los destinos asociados para forzar la regeneración
  for (const dest of plan) {
    const key = DestinationContentService.generateDestinationKey(dest.city, dest.country);
    await DestinationContentService.deleteContent(key);
    console.log(`🗑️ Cache eliminado para: ${key}`);
  }

  // 4. Enriquecer el itinerario
  console.log('🤖 Generando datos ricos (puede tardar unos minutos)...');
  await DestinationContentService.enrichItineraryDays(itinerary.id);

  console.log('🎉 Regeneración completada con éxito.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error en el script:', err);
  process.exit(1);
});
