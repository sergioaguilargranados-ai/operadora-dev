require('dotenv').config({path: '.env.local'});
require('ts-node').register({ transpileOnly: true });

const WeatherService = require('./src/services/WeatherService').default;

async function testRoute() {
  const city = "Palacio Real de Madrid";
  const date = "2026-07-04";

  console.log(`Testing route for city=${city}, date=${date}`);

  try {
    let forecast = await WeatherService.getForecast(city, date);
    console.log("First getForecast result:", forecast);

    if (!forecast) {
      console.log("Forecast was null, calling fetchAndSaveForecast...");
      await WeatherService.fetchAndSaveForecast(city);
      
      console.log("fetchAndSaveForecast finished, calling getForecast again...");
      const newForecast = await WeatherService.getForecast(city, date);
      console.log("Second getForecast result:", newForecast);
    }
  } catch (err) {
    console.error("Caught error in route:", err);
  }
  
  process.exit(0);
}

testRoute();
