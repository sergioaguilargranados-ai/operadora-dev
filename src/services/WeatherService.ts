import { query } from '@/lib/db'

export default class WeatherService {
  /**
   * Fetch 5-day forecast from OpenWeatherMap for a given city and save it to DB
   */
  static async fetchAndSaveForecast(city: string) {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY
    if (!apiKey) throw new Error('OPENWEATHERMAP_API_KEY not set')

    try {
      // 1. Get coords
      const geoRes = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`)
      const geoData = await geoRes.json()
      if (!geoData || geoData.length === 0) {
        console.warn(`City not found: ${city}`)
        return false
      }
      
      const { lat, lon } = geoData[0]

      // 2. Get forecast (5 day / 3 hour)
      const forecastRes = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`)
      const forecastData = await forecastRes.json()
      
      if (forecastData.cod !== '200') {
        console.error(`Forecast error for ${city}:`, forecastData.message)
        return false
      }

      // 3. Process into daily chunks (take max/min of the day)
      const daily: Record<string, any> = {}
      for (const item of forecastData.list) {
        const date = item.dt_txt.split(' ')[0] // YYYY-MM-DD
        if (!daily[date]) {
          daily[date] = {
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            temp: item.main.temp,
            description: item.weather[0].description,
            icon: item.weather[0].icon
          }
        } else {
          daily[date].temp_min = Math.min(daily[date].temp_min, item.main.temp_min)
          daily[date].temp_max = Math.max(daily[date].temp_max, item.main.temp_max)
          // Prefer midday description/icon if available, else just keep first
          if (item.dt_txt.includes('12:00:00')) {
            daily[date].description = item.weather[0].description
            daily[date].icon = item.weather[0].icon
            daily[date].temp = item.main.temp
          }
        }
      }

      // 4. Save to DB
      for (const [date, data] of Object.entries(daily)) {
        await query(
          `INSERT INTO weather_forecasts (city, date, temp, temp_min, temp_max, description, icon, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
           ON CONFLICT (city, date) 
           DO UPDATE SET temp = EXCLUDED.temp, temp_min = EXCLUDED.temp_min, temp_max = EXCLUDED.temp_max, 
                         description = EXCLUDED.description, icon = EXCLUDED.icon, last_updated = CURRENT_TIMESTAMP`,
          [city, date, data.temp, data.temp_min, data.temp_max, data.description, data.icon]
        )
      }
      
      return true
    } catch (err) {
      console.error(`Error in WeatherService for ${city}:`, err)
      return false
    }
  }

  /**
   * Get forecast for a city and a specific date from DB
   */
  static async getForecast(city: string, dateStr: string) {
    const normalizedCity = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    
    // First, try exact date match
    let res = await query(
      "SELECT * FROM weather_forecasts WHERE city ILIKE $1 AND date = $2",
      [city, dateStr]
    )
    
    if (res.rows.length === 0 && normalizedCity !== city) {
      res = await query(
        "SELECT * FROM weather_forecasts WHERE city ILIKE $1 AND date = $2",
        [normalizedCity, dateStr]
      )
    }
    
    if (res.rows.length === 0) {
      // Partial match for exact date
      res = await query(
        "SELECT * FROM weather_forecasts WHERE $1 ILIKE '%' || city || '%' AND date = $2 LIMIT 1",
        [normalizedCity, dateStr]
      )
    }

    // If still no results, fallback to the earliest available forecast today or in the future
    if (res.rows.length === 0) {
      res = await query(
        "SELECT * FROM weather_forecasts WHERE $1 ILIKE '%' || city || '%' AND date >= $2 ORDER BY date ASC LIMIT 1",
        [normalizedCity, dateStr]
      )
    }
    
    // If still no results (e.g. date is too far in the future beyond 5 days), just return the most current available forecast
    if (res.rows.length === 0) {
      res = await query(
        "SELECT * FROM weather_forecasts WHERE $1 ILIKE '%' || city || '%' ORDER BY date ASC LIMIT 1",
        [normalizedCity]
      )
    }
    
    // Fallback again without partial match just in case
    if (res.rows.length === 0) {
      res = await query(
        "SELECT * FROM weather_forecasts WHERE city ILIKE $1 ORDER BY date ASC LIMIT 1",
        [normalizedCity]
      )
    }

    return res.rows[0] || null
  }
}
