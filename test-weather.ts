require('dotenv').config({path: '.env.local'});
require('ts-node').register({ transpileOnly: true });

const WeatherService = require('./src/services/WeatherService').default;

async function run() {
  const forecast = await WeatherService.getForecast('Palacio Real de Madrid', '2026-07-05');
  console.log('Result for Palacio Real de Madrid:', forecast);

  const forecast2 = await WeatherService.getForecast('París', '2026-07-05');
  console.log('Result for París:', forecast2);
  
  process.exit(0);
}
run();
