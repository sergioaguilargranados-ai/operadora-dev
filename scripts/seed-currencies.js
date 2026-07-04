require('dotenv').config({path:'.env.local'});
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const currencies = [
  // NA
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$' },
  { code: 'CAD', name: 'Dólar canadiense', symbol: 'CA$' },
  { code: 'MXN', name: 'Peso mexicano', symbol: '$' },
  // Europe
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Libra esterlina', symbol: '£' },
  { code: 'CHF', name: 'Franco suizo', symbol: 'CHF' },
  { code: 'SEK', name: 'Corona sueca', symbol: 'kr' },
  { code: 'NOK', name: 'Corona noruega', symbol: 'kr' },
  { code: 'DKK', name: 'Corona danesa', symbol: 'kr' },
  { code: 'PLN', name: 'Zloty polaco', symbol: 'zł' },
  { code: 'CZK', name: 'Corona checa', symbol: 'Kč' },
  { code: 'HUF', name: 'Forinto húngaro', symbol: 'Ft' },
  // LATAM
  { code: 'ARS', name: 'Peso argentino', symbol: '$' },
  { code: 'BRL', name: 'Real brasileño', symbol: 'R$' },
  { code: 'CLP', name: 'Peso chileno', symbol: '$' },
  { code: 'COP', name: 'Peso colombiano', symbol: '$' },
  { code: 'PEN', name: 'Sol peruano', symbol: 'S/' },
  { code: 'UYU', name: 'Peso uruguayo', symbol: '$U' },
  { code: 'CRC', name: 'Colón costarricense', symbol: '₡' },
  { code: 'GTQ', name: 'Quetzal guatemalteco', symbol: 'Q' },
  // Global
  { code: 'JPY', name: 'Yen japonés', symbol: '¥' },
  { code: 'AUD', name: 'Dólar australiano', symbol: 'A$' }
];

async function run() {
  try {
    for (const cur of currencies) {
      await pool.query(`
        INSERT INTO currencies (code, name, symbol, decimal_places, is_active)
        VALUES ($1, $2, $3, 2, true)
        ON CONFLICT (code) DO NOTHING
      `, [cur.code, cur.name, cur.symbol]);
    }
    console.log('Currencies seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding currencies:', error);
    process.exit(1);
  }
}
run();
