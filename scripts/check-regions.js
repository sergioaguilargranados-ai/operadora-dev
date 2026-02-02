// Script para verificar valores de destination_region
require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL)

async function checkRegions() {
    try {
        const result = await sql`
            SELECT DISTINCT destination_region, COUNT(*) as count
            FROM megatravel_packages 
            WHERE destination_region IS NOT NULL
            GROUP BY destination_region
            ORDER BY destination_region
        `

        console.log('Regiones en la base de datos:')
        console.log(JSON.stringify(result, null, 2))
    } catch (error) {
        console.error('Error:', error)
    }
}

checkRegions()
