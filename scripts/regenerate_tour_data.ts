import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar env variables
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

async function main() {
  // Importar dinámicamente para asegurar que process.env esté poblado primero
  const { pool } = await import('../src/lib/db');
  const { DestinationContentService } = await import('../src/services/DestinationContentService');

  const args = process.argv.slice(2);
  const targetId = args[0];

  let itinerariesToProcess = [];

  if (targetId) {
    console.log(`🌍 Iniciando regeneración de datos ricos para el itinerario ID: ${targetId}...`);
    const result = await pool.query(`SELECT id, title FROM itineraries WHERE id = $1`, [targetId]);
    if (result.rows.length === 0) {
      console.error(`❌ No se encontró el itinerario con ID ${targetId}.`);
      process.exit(1);
    }
    itinerariesToProcess = result.rows;
  } else {
    console.log(`🌍 Iniciando regeneración de datos ricos en lote (últimos 5 modificados)...`);
    // Find the latest 5 itineraries
    const result = await pool.query(`SELECT id, title FROM itineraries ORDER BY updated_at DESC LIMIT 5`);
    itinerariesToProcess = result.rows;
  }

  if (itinerariesToProcess.length === 0) {
    console.log('No hay itinerarios para procesar.');
    process.exit(0);
  }

  for (const itinerary of itinerariesToProcess) {
    console.log(`\n=========================================`);
    console.log(`✅ Procesando Itinerario: ${itinerary.title} (ID: ${itinerary.id})`);

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
  }

  console.log('\n🎉 Regeneración completada con éxito.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error en el script:', err);
  process.exit(1);
});
