/**
 * Script de Cifra de Control de Base de Datos
 * 
 * Genera una cifra de control contando:
 * - Total de tablas en el esquema public
 * - Total de campos (columnas) en todas las tablas
 * 
 * Uso:
 *   node scripts/db-control-cifra.js
 * 
 * Salida:
 *   Tablas: XX | Campos: YYY
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function generarCifraControl() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // Contar tablas en esquema public
        const resultTablas = await pool.query(`
      SELECT COUNT(*) as total
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `);

        const totalTablas = parseInt(resultTablas.rows[0].total);

        // Contar campos (columnas) totales
        const resultCampos = await pool.query(`
      SELECT COUNT(*) as total
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `);

        const totalCampos = parseInt(resultCampos.rows[0].total);

        // Generar cifra de control
        const cifra = `Tablas: ${totalTablas} | Campos: ${totalCampos}`;

        console.log('\n✅ Cifra de Control Generada:');
        console.log(`   ${cifra}\n`);

        // Opcional: mostrar detalle de tablas
        const resultDetalle = await pool.query(`
      SELECT 
        t.table_name,
        COUNT(c.column_name) as num_campos
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c 
        ON t.table_name = c.table_name 
        AND t.table_schema = c.table_schema
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      GROUP BY t.table_name
      ORDER BY t.table_name
    `);

        console.log('📊 Detalle por tabla:');
        resultDetalle.rows.forEach(row => {
            console.log(`   ${row.table_name.padEnd(30)} → ${row.num_campos} campos`);
        });
        console.log('');

        return cifra;

    } catch (error) {
        console.error('❌ Error al generar cifra de control:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    generarCifraControl()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { generarCifraControl };
