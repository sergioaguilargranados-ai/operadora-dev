const { query } = require('./src/lib/db.ts')

async function createMissingTables() {
  try {
    console.log('📊 Creando tablas faltantes en producción...\n')
    
    // Tabla promotions
    await query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discount_percentage INTEGER,
        image_url TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        valid_from TIMESTAMP DEFAULT NOW(),
        valid_until TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        badge_text VARCHAR(50),
        link_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Tabla promotions creada')
    
    // Tabla featured_destinations
    await query(`
      CREATE TABLE IF NOT EXISTS featured_destinations (
        id SERIAL PRIMARY KEY,
        destination_name VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        city VARCHAR(100),
        description TEXT,
        image_url TEXT NOT NULL,
        price_from DECIMAL(10, 2),
        currency VARCHAR(3) DEFAULT 'MXN',
        total_hotels INTEGER,
        is_featured BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Tabla featured_destinations creada')
    
    // Tabla featured_packages
    await query(`
      CREATE TABLE IF NOT EXISTS featured_packages (
        id SERIAL PRIMARY KEY,
        package_name VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'MXN',
        nights INTEGER,
        includes TEXT,
        category VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Tabla featured_packages creada')
    
    // Tabla unique_stays
    await query(`
      CREATE TABLE IF NOT EXISTS unique_stays (
        id SERIAL PRIMARY KEY,
        property_name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        price_per_night DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'MXN',
        rating DECIMAL(2, 1),
        total_reviews INTEGER,
        property_type VARCHAR(100),
        is_featured BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Tabla unique_stays creada')
    
    console.log('\n✅ Todas las tablas creadas exitosamente')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createMissingTables()
