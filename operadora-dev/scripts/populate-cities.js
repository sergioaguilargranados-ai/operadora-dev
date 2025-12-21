#!/usr/bin/env node

const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

const cities = [
  // México - Principales
  { name: 'Cancún', code: 'CUN', country: 'México', country_code: 'MEX', lat: 21.1619, lon: -86.8515 },
  { name: 'Ciudad de México', code: 'MEX', country: 'México', country_code: 'MEX', lat: 19.4326, lon: -99.1332 },
  { name: 'Guadalajara', code: 'GDL', country: 'México', country_code: 'MEX', lat: 20.6597, lon: -103.3496 },
  { name: 'Monterrey', code: 'MTY', country: 'México', country_code: 'MEX', lat: 25.6866, lon: -100.3161 },
  { name: 'Los Cabos', code: 'SJD', country: 'México', country_code: 'MEX', lat: 22.8905, lon: -109.9167 },
  { name: 'Puerto Vallarta', code: 'PVR', country: 'México', country_code: 'MEX', lat: 20.6534, lon: -105.2253 },

  // México - Otros
  { name: 'Acapulco', code: 'ACA', country: 'México', country_code: 'MEX', lat: 16.8531, lon: -99.8237 },
  { name: 'Aguascalientes', code: 'AGU', country: 'México', country_code: 'MEX', lat: 21.8853, lon: -102.2916 },
  { name: 'Campeche', code: 'CPE', country: 'México', country_code: 'MEX', lat: 19.8301, lon: -90.5349 },
  { name: 'Chetumal', code: 'CTM', country: 'México', country_code: 'MEX', lat: 18.5001, lon: -88.2962 },
  { name: 'Chihuahua', code: 'CUU', country: 'México', country_code: 'MEX', lat: 28.6353, lon: -106.0889 },
  { name: 'Cozumel', code: 'CZM', country: 'México', country_code: 'MEX', lat: 20.5083, lon: -86.9458 },
  { name: 'Culiacán', code: 'CUL', country: 'México', country_code: 'MEX', lat: 24.8091, lon: -107.3940 },
  { name: 'Hermosillo', code: 'HMO', country: 'México', country_code: 'MEX', lat: 29.0729, lon: -110.9559 },
  { name: 'Huatulco', code: 'HUX', country: 'México', country_code: 'MEX', lat: 15.7753, lon: -96.2628 },
  { name: 'Ixtapa-Zihuatanejo', code: 'ZIH', country: 'México', country_code: 'MEX', lat: 17.6413, lon: -101.5519 },
  { name: 'La Paz', code: 'LAP', country: 'México', country_code: 'MEX', lat: 24.1426, lon: -110.3128 },
  { name: 'León', code: 'BJX', country: 'México', country_code: 'MEX', lat: 21.1236, lon: -101.6860 },
  { name: 'Manzanillo', code: 'ZLO', country: 'México', country_code: 'MEX', lat: 19.0534, lon: -104.3340 },
  { name: 'Mazatlán', code: 'MZT', country: 'México', country_code: 'MEX', lat: 23.2494, lon: -106.4111 },
  { name: 'Mérida', code: 'MID', country: 'México', country_code: 'MEX', lat: 20.9674, lon: -89.5926 },
  { name: 'Oaxaca', code: 'OAX', country: 'México', country_code: 'MEX', lat: 17.0732, lon: -96.7266 },
  { name: 'Playa del Carmen', code: 'PCM', country: 'México', country_code: 'MEX', lat: 20.6296, lon: -87.0739 },
  { name: 'Puebla', code: 'PBC', country: 'México', country_code: 'MEX', lat: 19.0414, lon: -98.2063 },
  { name: 'Querétaro', code: 'QRO', country: 'México', country_code: 'MEX', lat: 20.5888, lon: -100.3899 },
  { name: 'San Luis Potosí', code: 'SLP', country: 'México', country_code: 'MEX', lat: 22.1565, lon: -100.9855 },
  { name: 'Tijuana', code: 'TIJ', country: 'México', country_code: 'MEX', lat: 32.5149, lon: -117.0382 },
  { name: 'Veracruz', code: 'VER', country: 'México', country_code: 'MEX', lat: 19.1738, lon: -96.1342 },

  // Estados Unidos - Principales
  { name: 'New York', code: 'NYC', country: 'United States', country_code: 'USA', lat: 40.7128, lon: -74.0060 },
  { name: 'Los Angeles', code: 'LAX', country: 'United States', country_code: 'USA', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', code: 'CHI', country: 'United States', country_code: 'USA', lat: 41.8781, lon: -87.6298 },
  { name: 'Houston', code: 'HOU', country: 'United States', country_code: 'USA', lat: 29.7604, lon: -95.3698 },
  { name: 'Miami', code: 'MIA', country: 'United States', country_code: 'USA', lat: 25.7617, lon: -80.1918 },
  { name: 'San Francisco', code: 'SFO', country: 'United States', country_code: 'USA', lat: 37.7749, lon: -122.4194 },
  { name: 'Las Vegas', code: 'LAS', country: 'United States', country_code: 'USA', lat: 36.1699, lon: -115.1398 },
  { name: 'Orlando', code: 'ORL', country: 'United States', country_code: 'USA', lat: 28.5383, lon: -81.3792 },

  // Europa - Principales
  { name: 'Paris', code: 'PAR', country: 'France', country_code: 'FRA', lat: 48.8566, lon: 2.3522 },
  { name: 'London', code: 'LON', country: 'United Kingdom', country_code: 'GBR', lat: 51.5074, lon: -0.1278 },
  { name: 'Madrid', code: 'MAD', country: 'Spain', country_code: 'ESP', lat: 40.4168, lon: -3.7038 },
  { name: 'Barcelona', code: 'BCN', country: 'Spain', country_code: 'ESP', lat: 41.3851, lon: 2.1734 },
  { name: 'Rome', code: 'ROM', country: 'Italy', country_code: 'ITA', lat: 41.9028, lon: 12.4964 },
  { name: 'Amsterdam', code: 'AMS', country: 'Netherlands', country_code: 'NLD', lat: 52.3676, lon: 4.9041 },
  { name: 'Berlin', code: 'BER', country: 'Germany', country_code: 'DEU', lat: 52.5200, lon: 13.4050 },
  { name: 'Vienna', code: 'VIE', country: 'Austria', country_code: 'AUT', lat: 48.2082, lon: 16.3738 },

  // América Latina - Principales
  { name: 'Buenos Aires', code: 'BUE', country: 'Argentina', country_code: 'ARG', lat: -34.6037, lon: -58.3816 },
  { name: 'São Paulo', code: 'SAO', country: 'Brazil', country_code: 'BRA', lat: -23.5505, lon: -46.6333 },
  { name: 'Rio de Janeiro', code: 'RIO', country: 'Brazil', country_code: 'BRA', lat: -22.9068, lon: -43.1729 },
  { name: 'Lima', code: 'LIM', country: 'Peru', country_code: 'PER', lat: -12.0464, lon: -77.0428 },
  { name: 'Bogotá', code: 'BOG', country: 'Colombia', country_code: 'COL', lat: 4.7110, lon: -74.0721 },
  { name: 'Santiago', code: 'SCL', country: 'Chile', country_code: 'CHL', lat: -33.4489, lon: -70.6693 },

  // Asia - Principales
  { name: 'Tokyo', code: 'TYO', country: 'Japan', country_code: 'JPN', lat: 35.6762, lon: 139.6503 },
  { name: 'Singapore', code: 'SIN', country: 'Singapore', country_code: 'SGP', lat: 1.3521, lon: 103.8198 },
  { name: 'Bangkok', code: 'BKK', country: 'Thailand', country_code: 'THA', lat: 13.7563, lon: 100.5018 },
  { name: 'Dubai', code: 'DXB', country: 'United Arab Emirates', country_code: 'ARE', lat: 25.2048, lon: 55.2708 },
  { name: 'Hong Kong', code: 'HKG', country: 'Hong Kong', country_code: 'HKG', lat: 22.3193, lon: 114.1694 }
]

async function populateCities() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    console.log('🔌 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conectado exitosamente')

    console.log(`📊 Insertando ${cities.length} ciudades...`)

    for (const city of cities) {
      try {
        await client.query(`
          INSERT INTO cities (name, city_code, country, country_code, latitude, longitude)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (normalized_name) DO UPDATE SET
            city_code = EXCLUDED.city_code,
            country = EXCLUDED.country,
            country_code = EXCLUDED.country_code,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            updated_at = CURRENT_TIMESTAMP
        `, [city.name, city.code, city.country, city.country_code, city.lat, city.lon])

        console.log(`  ✓ ${city.name} (${city.code})`)
      } catch (error) {
        console.error(`  ✗ Error insertando ${city.name}:`, error.message)
      }
    }

    // Verificar total insertado
    const result = await client.query('SELECT COUNT(*) FROM cities')
    console.log(`\n✅ Total de ciudades en BD: ${result.rows[0].count}`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Conexión cerrada')
  }
}

populateCities()
